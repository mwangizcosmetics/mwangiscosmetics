create table if not exists public.payment_callback_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'mpesa_daraja',
  checkout_request_id text,
  merchant_request_id text,
  mpesa_receipt_number text,
  result_code integer,
  result_description text,
  idempotency_key text not null,
  processing_status text not null default 'received'
    check (
      processing_status in (
        'received',
        'duplicate',
        'invalid_payload',
        'rejected',
        'payment_not_found',
        'processed_success',
        'processed_failed'
      )
    ),
  security_valid boolean not null default false,
  suspicious boolean not null default false,
  rejection_reason text,
  payload jsonb not null,
  payment_id uuid references public.payments(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  processed_at timestamptz
);

create unique index if not exists idx_payment_callback_logs_idempotency_key
  on public.payment_callback_logs(idempotency_key);
create index if not exists idx_payment_callback_logs_checkout_request_id
  on public.payment_callback_logs(checkout_request_id);
create index if not exists idx_payment_callback_logs_processing_status
  on public.payment_callback_logs(processing_status);
create index if not exists idx_payment_callback_logs_created_at
  on public.payment_callback_logs(created_at desc);

alter table public.payment_callback_logs enable row level security;

drop policy if exists "payment_callback_logs_admin_read" on public.payment_callback_logs;
create policy "payment_callback_logs_admin_read"
on public.payment_callback_logs
for select
using (public.is_admin());

drop policy if exists "payment_callback_logs_admin_manage" on public.payment_callback_logs;
create policy "payment_callback_logs_admin_manage"
on public.payment_callback_logs
for all
using (public.is_admin())
with check (public.is_admin());

create or replace function public.process_mpesa_callback(
  p_payload jsonb,
  p_security_valid boolean default true,
  p_rejection_reason text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  callback_body jsonb;
  metadata jsonb;
  metadata_item jsonb;
  metadata_name text;
  checkout_id text;
  merchant_id text;
  mpesa_receipt text;
  result_code integer;
  result_desc text;
  idempotency_key text;
  callback_log_id uuid;
  payment_record public.payments%rowtype;
  order_record public.orders%rowtype;
  inventory_commit_row_count integer := 0;
begin
  callback_body := p_payload #> '{Body,stkCallback}';

  if callback_body is null then
    idempotency_key := encode(digest(coalesce(p_payload::text, ''), 'sha256'), 'hex');
    insert into public.payment_callback_logs (
      provider,
      idempotency_key,
      processing_status,
      security_valid,
      suspicious,
      rejection_reason,
      payload,
      processed_at
    )
    values (
      'mpesa_daraja',
      idempotency_key,
      'invalid_payload',
      p_security_valid,
      true,
      coalesce(p_rejection_reason, 'Missing Body.stkCallback payload'),
      coalesce(p_payload, '{}'::jsonb),
      timezone('utc', now())
    )
    on conflict (idempotency_key) do nothing;

    return jsonb_build_object(
      'ok', false,
      'status', 'invalid_payload'
    );
  end if;

  checkout_id := nullif(callback_body->>'CheckoutRequestID', '');
  merchant_id := nullif(callback_body->>'MerchantRequestID', '');
  result_code := nullif(callback_body->>'ResultCode', '')::integer;
  result_desc := nullif(callback_body->>'ResultDesc', '');
  metadata := callback_body->'CallbackMetadata';

  if jsonb_typeof(metadata->'Item') = 'array' then
    for metadata_item in
      select value
      from jsonb_array_elements(metadata->'Item')
    loop
      metadata_name := metadata_item->>'Name';
      if metadata_name = 'MpesaReceiptNumber' then
        mpesa_receipt := nullif(metadata_item->>'Value', '');
      end if;
    end loop;
  end if;

  idempotency_key :=
    coalesce(checkout_id, 'missing-checkout')
    || ':'
    || coalesce(mpesa_receipt, 'no-receipt')
    || ':'
    || coalesce(result_code::text, 'no-code');

  insert into public.payment_callback_logs (
    provider,
    checkout_request_id,
    merchant_request_id,
    mpesa_receipt_number,
    result_code,
    result_description,
    idempotency_key,
    processing_status,
    security_valid,
    suspicious,
    rejection_reason,
    payload
  )
  values (
    'mpesa_daraja',
    checkout_id,
    merchant_id,
    mpesa_receipt,
    result_code,
    result_desc,
    idempotency_key,
    'received',
    p_security_valid,
    not p_security_valid,
    p_rejection_reason,
    coalesce(p_payload, '{}'::jsonb)
  )
  on conflict (idempotency_key) do update
  set processing_status = 'duplicate',
      processed_at = timezone('utc', now()),
      suspicious = public.payment_callback_logs.suspicious or not excluded.security_valid,
      rejection_reason = coalesce(public.payment_callback_logs.rejection_reason, excluded.rejection_reason)
  returning id into callback_log_id;

  if exists (
    select 1
    from public.payment_callback_logs log
    where log.id = callback_log_id
      and log.processing_status = 'duplicate'
  ) then
    return jsonb_build_object(
      'ok', true,
      'status', 'duplicate'
    );
  end if;

  if not p_security_valid then
    update public.payment_callback_logs
    set processing_status = 'rejected',
        processed_at = timezone('utc', now())
    where id = callback_log_id;

    return jsonb_build_object(
      'ok', false,
      'status', 'rejected'
    );
  end if;

  select *
  into payment_record
  from public.payments payment
  where (checkout_id is not null and payment.checkout_request_id = checkout_id)
     or (merchant_id is not null and payment.merchant_request_id = merchant_id)
  order by payment.created_at desc
  limit 1
  for update;

  if payment_record.id is null then
    update public.payment_callback_logs
    set processing_status = 'payment_not_found',
        suspicious = true,
        processed_at = timezone('utc', now())
    where id = callback_log_id;

    return jsonb_build_object(
      'ok', false,
      'status', 'payment_not_found'
    );
  end if;

  select *
  into order_record
  from public.orders order_entry
  where order_entry.id = payment_record.order_id
  limit 1
  for update;

  if result_code = 0 then
    update public.payments
    set status = 'success',
        provider_reference = coalesce(mpesa_receipt, provider_reference),
        raw_response = coalesce(p_payload, '{}'::jsonb),
        error_message = null,
        confirmed_at = coalesce(confirmed_at, timezone('utc', now())),
        updated_at = timezone('utc', now())
    where id = payment_record.id;

    update public.orders
    set payment_status = 'success',
        payment_reference = coalesce(mpesa_receipt, payment_reference),
        status = case
          when status in ('pending_payment', 'failed_payment') then 'paid'::public.order_status
          else status
        end,
        updated_at = timezone('utc', now())
    where id = order_record.id;

    if order_record.inventory_committed_at is null then
      update public.products product
      set stock = greatest(product.stock - order_item.quantity, 0),
          updated_at = timezone('utc', now())
      from public.order_items order_item
      where order_item.order_id = order_record.id
        and order_item.product_id = product.id;

      update public.orders
      set inventory_committed_at = timezone('utc', now()),
          updated_at = timezone('utc', now())
      where id = order_record.id
        and inventory_committed_at is null;

      get diagnostics inventory_commit_row_count = row_count;
    end if;

    update public.payment_callback_logs
    set processing_status = 'processed_success',
        payment_id = payment_record.id,
        order_id = order_record.id,
        processed_at = timezone('utc', now())
    where id = callback_log_id;

    return jsonb_build_object(
      'ok', true,
      'status', 'processed_success',
      'payment_id', payment_record.id,
      'order_id', order_record.id,
      'inventory_committed_now', inventory_commit_row_count > 0
    );
  end if;

  update public.payments
  set status = 'failed',
      raw_response = coalesce(p_payload, '{}'::jsonb),
      error_message = coalesce(result_desc, 'Daraja callback failure'),
      updated_at = timezone('utc', now())
  where id = payment_record.id
    and status <> 'success';

  update public.orders
  set payment_status = case
        when payment_status = 'success' then payment_status
        else 'failed'
      end,
      status = case
        when payment_status = 'success' then status
        when status = 'pending_payment' then 'failed_payment'::public.order_status
        else status
      end,
      updated_at = timezone('utc', now())
  where id = order_record.id;

  update public.payment_callback_logs
  set processing_status = 'processed_failed',
      payment_id = payment_record.id,
      order_id = order_record.id,
      processed_at = timezone('utc', now())
  where id = callback_log_id;

  return jsonb_build_object(
    'ok', true,
    'status', 'processed_failed',
    'payment_id', payment_record.id,
    'order_id', order_record.id
  );
end;
$$;

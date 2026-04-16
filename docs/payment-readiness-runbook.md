# MWANGIZ Payment Readiness Runbook

Use this quick checklist to validate the current flow before full M-Pesa Daraja callback persistence.

## 1) Checkout Creates Pending Payment Order

1. Add a product with stock `>= 2` to cart.
2. Go to `/checkout`.
3. Pick a serviceable county + town.
4. Place order with `M-Pesa`.

Expected:
- New order appears in `/orders` with status `Pending Payment`.
- `paymentStatus` is `pending` (or `success` in mock mode).
- Product stock is **not** reduced yet unless mock payment auto-confirms.

## 2) Admin Confirms Payment and Deducts Inventory

1. Open `/admin/orders`.
2. Find the pending order.
3. Click `Mark as Paid + Deduct Stock`.

Expected:
- Order status becomes `Paid`.
- Payment status becomes `success`.
- Product stock decreases by ordered quantity.
- Storefront product stock badge reflects updated quantity.
- Out-of-stock products disappear from active storefront listings.

## 3) Failed Payment Path

1. Place an order and force payment failure (invalid phone or mocked failure path).

Expected:
- Order status becomes `Failed Payment`.
- Payment status becomes `failed`.
- Inventory remains unchanged.

## 4) Refund Restock Path

1. Create a paid order (inventory already committed).
2. Request refund from customer side (`/orders`).
3. Approve as admin in `/admin/refunds` and set status `refunded`.

Expected:
- Order moves to `Refunded`.
- Payment status becomes `refunded`.
- Ordered quantity is added back to inventory once.

## 5) Delivery Progress Guard

1. Try moving an unpaid order directly to `preparing`/`in_transit`.

Expected:
- Action is blocked with a payment-required message.

## Notes

- `paid` from admin status dropdown now routes through the same payment confirmation flow (inventory-safe).
- Current callback endpoint acknowledges Daraja payloads; final persistence from callback to DB can be wired next.

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database, Json } from "@/lib/supabase/database.types";

type ServiceSupabaseClient = SupabaseClient<Database>;

interface CheckoutCartItemInput {
  productId: string;
  productSlug?: string;
  quantity: number;
  selectedShade?: string;
}

interface ShippingSnapshotInput {
  fullName: string;
  phone: string;
  email?: string;
  countyId: string;
  county: string;
  townCenterId: string;
  townCenter: string;
  streetAddress: string;
  buildingOrHouse?: string;
  landmark?: string;
}

interface CreatePendingOrderInput {
  supabase: ServiceSupabaseClient;
  userId: string;
  paymentMethod: "mpesa" | "card" | "cash";
  items: CheckoutCartItemInput[];
  shippingSnapshot: ShippingSnapshotInput;
  couponCode?: string;
}

type ProductRow = Database["public"]["Tables"]["products"]["Row"];
type CouponRow = Database["public"]["Tables"]["coupons"]["Row"];
type DiscountRuleRow = Database["public"]["Tables"]["discount_rules"]["Row"];
type ServiceTownRow = Database["public"]["Tables"]["service_towns"]["Row"];
type ServiceCountyRow = Database["public"]["Tables"]["service_counties"]["Row"];

interface ProductPriceSnapshot {
  baseUnitPrice: number;
  discountPercent: number;
  discountAmountPerUnit: number;
  finalUnitPrice: number;
}

function buildOrderNumber() {
  const epoch = Date.now().toString().slice(-6);
  const random = Math.floor(100 + Math.random() * 900).toString();
  return `MWZ-${epoch}${random}`;
}

function isUuid(value: string | undefined) {
  if (!value) {
    return false;
  }
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function findAppliedDiscountRule(
  product: ProductRow,
  rules: DiscountRuleRow[],
) {
  const activeRules = rules.filter((rule) => rule.is_active);
  const productRule = activeRules.find(
    (rule) => rule.scope === "product" && rule.product_id === product.id,
  );
  if (productRule) return productRule;

  const categoryRule = activeRules.find(
    (rule) => rule.scope === "category" && rule.category_id === product.category_id,
  );
  if (categoryRule) return categoryRule;

  return activeRules.find((rule) => rule.scope === "global");
}

function computeProductPriceSnapshot(
  product: ProductRow,
  rules: DiscountRuleRow[],
): ProductPriceSnapshot {
  const baseUnitPrice = Math.max(product.price, 0);
  const appliedRule = findAppliedDiscountRule(product, rules);
  if (!appliedRule) {
    return {
      baseUnitPrice,
      discountPercent: 0,
      discountAmountPerUnit: 0,
      finalUnitPrice: baseUnitPrice,
    };
  }

  const discountPercent = Math.max(0, Math.min(appliedRule.percent, 100));
  const discountAmountPerUnit = Math.round((baseUnitPrice * discountPercent) / 100);
  const finalUnitPrice = Math.max(baseUnitPrice - discountAmountPerUnit, 0);

  return {
    baseUnitPrice,
    discountPercent,
    discountAmountPerUnit,
    finalUnitPrice,
  };
}

function validateCoupon(
  coupon: CouponRow | null,
  code: string | undefined,
  subtotalBeforeCoupon: number,
) {
  if (!code) {
    return {
      discountAmount: 0,
      appliedCode: undefined,
    };
  }

  if (!coupon || !coupon.active) {
    return {
      discountAmount: 0,
      appliedCode: undefined,
      message: "Coupon is invalid or inactive.",
    };
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return {
      discountAmount: 0,
      appliedCode: undefined,
      message: "Coupon has expired.",
    };
  }

  if (coupon.min_subtotal && subtotalBeforeCoupon < coupon.min_subtotal) {
    return {
      discountAmount: 0,
      appliedCode: undefined,
      message: `Minimum order is KES ${coupon.min_subtotal}.`,
    };
  }

  const discountAmount =
    coupon.type === "fixed"
      ? Math.min(subtotalBeforeCoupon, Math.round(coupon.value))
      : Math.round((subtotalBeforeCoupon * Number(coupon.value)) / 100);

  return {
    discountAmount,
    appliedCode: coupon.code,
  };
}

export async function createPendingOrderWithPayment(input: CreatePendingOrderInput) {
  if (!input.items.length) {
    return {
      ok: false as const,
      message: "Cart is empty.",
    };
  }

  const normalizedItems = input.items.map((item) => ({
    ...item,
    quantity: Math.max(1, item.quantity),
    productSlug: item.productSlug?.trim().toLowerCase() || undefined,
  }));
  const productIds = [
    ...new Set(
      normalizedItems
        .map((item) => item.productId)
        .filter((productId) => isUuid(productId)),
    ),
  ];
  const productSlugs = [
    ...new Set(
      normalizedItems
        .map((item) => item.productSlug)
        .filter((slug): slug is string => Boolean(slug)),
    ),
  ];

  const [
    productsByIdResult,
    productsBySlugResult,
    discountsResult,
    couponResult,
    townByIdResult,
    countyByIdResult,
  ] = await Promise.all([
    productIds.length
      ? input.supabase
          .from("products")
          .select(
            "id,name,slug,sku,price,compare_at_price,currency,stock,category_id",
          )
          .in("id", productIds)
      : Promise.resolve({ data: [], error: null } as const),
    productSlugs.length
      ? input.supabase
          .from("products")
          .select(
            "id,name,slug,sku,price,compare_at_price,currency,stock,category_id",
          )
          .in("slug", productSlugs)
      : Promise.resolve({ data: [], error: null } as const),
    input.supabase
      .from("discount_rules")
      .select("id,scope,percent,is_active,category_id,product_id,created_at,updated_at")
      .eq("is_active", true),
    input.couponCode
      ? input.supabase
          .from("coupons")
          .select("id,code,type,value,min_subtotal,active,expires_at")
          .ilike("code", input.couponCode.trim())
          .maybeSingle()
      : Promise.resolve({ data: null, error: null } as const),
    isUuid(input.shippingSnapshot.townCenterId)
      ? input.supabase
          .from("service_towns")
          .select(
            "id,county_id,name,is_active,delivery_fee,eta_min_value,eta_max_value,eta_unit",
          )
          .eq("id", input.shippingSnapshot.townCenterId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null } as const),
    isUuid(input.shippingSnapshot.countyId)
      ? input.supabase
          .from("service_counties")
          .select("id,name,is_active")
          .eq("id", input.shippingSnapshot.countyId)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null } as const),
  ]);

  const productsById = (productsByIdResult.data ?? []) as ProductRow[];
  const productsBySlug = (productsBySlugResult.data ?? []) as ProductRow[];
  const products = [...productsById, ...productsBySlug].reduce<ProductRow[]>(
    (acc, row) => {
      if (!acc.some((entry) => entry.id === row.id)) {
        acc.push(row);
      }
      return acc;
    },
    [],
  );
  const discountRules = (discountsResult.data ?? []) as DiscountRuleRow[];
  const coupon = (couponResult.data ?? null) as CouponRow | null;
  let serviceTown = (townByIdResult.data ?? null) as ServiceTownRow | null;
  let serviceCounty = (countyByIdResult.data ?? null) as ServiceCountyRow | null;

  if (!serviceCounty) {
    const { data: countyByName } = await input.supabase
      .from("service_counties")
      .select("id,name,is_active")
      .ilike("name", input.shippingSnapshot.county)
      .maybeSingle();
    serviceCounty = (countyByName ?? null) as ServiceCountyRow | null;
  }

  if (!serviceTown) {
    const townQuery = input.supabase
      .from("service_towns")
      .select("id,county_id,name,is_active,delivery_fee,eta_min_value,eta_max_value,eta_unit")
      .ilike("name", input.shippingSnapshot.townCenter);
    if (serviceCounty?.id) {
      townQuery.eq("county_id", serviceCounty.id);
    }
    const { data: townByName } = await townQuery.maybeSingle();
    serviceTown = (townByName ?? null) as ServiceTownRow | null;
  }

  if (!serviceCounty && serviceTown?.county_id) {
    const { data: countyFromTown } = await input.supabase
      .from("service_counties")
      .select("id,name,is_active")
      .eq("id", serviceTown.county_id)
      .maybeSingle();
    serviceCounty = (countyFromTown ?? null) as ServiceCountyRow | null;
  }

  if (!serviceTown || !serviceCounty || !serviceTown.is_active || !serviceCounty.is_active) {
    return {
      ok: false as const,
      message: "Selected delivery location is not serviceable.",
    };
  }

  const productById = new Map(products.map((product) => [product.id, product]));
  const productBySlug = new Map(products.map((product) => [product.slug.toLowerCase(), product]));

  const matchedLineItems = normalizedItems.map((item) => {
    const product =
      productById.get(item.productId) ??
      (item.productSlug ? productBySlug.get(item.productSlug) : undefined);
    return { item, product };
  });

  if (matchedLineItems.some((line) => !line.product)) {
    return {
      ok: false as const,
      message: "Some products are unavailable.",
    };
  }

  const quantityByProductId = new Map<string, number>();
  for (const line of matchedLineItems) {
    const productId = line.product!.id;
    const current = quantityByProductId.get(productId) ?? 0;
    quantityByProductId.set(productId, current + line.item.quantity);
  }

  const detailedItems = [...quantityByProductId.entries()].map(([productId, quantity]) => {
    const product = productById.get(productId)!;
    if (product.stock < quantity) {
      return {
        product,
        quantity,
        error: `${product.name} only has ${product.stock} in stock.`,
      };
    }
    const pricing = computeProductPriceSnapshot(product, discountRules);
    return { product, quantity, pricing };
  });

  const stockError = detailedItems.find(
    (item): item is { product: ProductRow; quantity: number; error: string } =>
      "error" in item,
  );
  if (stockError) {
    return {
      ok: false as const,
      message: stockError.error,
    };
  }

  const pricedItems = detailedItems as Array<{
    product: ProductRow;
    quantity: number;
    pricing: ProductPriceSnapshot;
  }>;
  const pricingByProductId = new Map(
    pricedItems.map((item) => [item.product.id, item.pricing]),
  );
  const pricedLineItems = matchedLineItems.map((line) => ({
    cartItem: line.item,
    product: line.product!,
    pricing: pricingByProductId.get(line.product!.id)!,
  }));

  const baseSubtotal = pricedLineItems.reduce(
    (sum, item) => sum + item.pricing.baseUnitPrice * item.cartItem.quantity,
    0,
  );
  const productDiscountTotal = pricedLineItems.reduce(
    (sum, item) => sum + item.pricing.discountAmountPerUnit * item.cartItem.quantity,
    0,
  );
  const subtotalAfterProductDiscount = Math.max(baseSubtotal - productDiscountTotal, 0);
  const couponValidation = validateCoupon(coupon, input.couponCode, subtotalAfterProductDiscount);
  if (couponValidation.message) {
    return {
      ok: false as const,
      message: couponValidation.message,
    };
  }

  const shipping = serviceTown.delivery_fee ?? 0;
  const discount = productDiscountTotal + couponValidation.discountAmount;
  const taxableAmount = Math.max(baseSubtotal - discount, 0);
  const tax = Math.round(taxableAmount * 0.08);
  const total = taxableAmount + shipping + tax;

  const shippingSnapshot: Record<string, unknown> = {
    fullName: input.shippingSnapshot.fullName,
    phone: input.shippingSnapshot.phone,
    email: input.shippingSnapshot.email ?? null,
    countyId: serviceCounty.id,
    countyName: serviceCounty.name,
    townCenterId: serviceTown.id,
    townCenterName: serviceTown.name,
    streetAddress: input.shippingSnapshot.streetAddress,
    buildingOrHouse: input.shippingSnapshot.buildingOrHouse ?? null,
    landmark: input.shippingSnapshot.landmark ?? null,
  };

  const etaUnit = serviceTown.eta_unit;
  const etaText =
    serviceTown.eta_min_value && serviceTown.eta_max_value && etaUnit
      ? `${serviceTown.eta_min_value}-${serviceTown.eta_max_value} ${etaUnit}`
      : "Standard delivery";

  const deliverySnapshot: Record<string, unknown> = {
    county: serviceCounty.name,
    townCenter: serviceTown.name,
    deliveryFee: shipping,
    etaMinValue: serviceTown.eta_min_value,
    etaMaxValue: serviceTown.eta_max_value,
    etaUnit: serviceTown.eta_unit,
    etaText,
  };

  const nowIso = new Date().toISOString();
  const orderNumber = buildOrderNumber();

  const { data: order, error: orderError } = await input.supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      user_id: input.userId,
      status: "pending_payment",
      subtotal: baseSubtotal,
      discount,
      shipping,
      tax,
      total,
      currency: "KES",
      shipping_address: shippingSnapshot as Json,
      payment_method: input.paymentMethod,
      payment_status: "pending",
      delivery_snapshot: deliverySnapshot as Json,
      last_payment_attempt_at: nowIso,
      placed_at: nowIso,
    })
    .select(
      "id,order_number,user_id,status,subtotal,discount,shipping,tax,total,currency,placed_at,payment_method,payment_status,shipping_address,delivery_snapshot,retry_count,last_payment_attempt_at",
    )
    .maybeSingle();

  if (orderError || !order) {
    return {
      ok: false as const,
      message: "Failed to create order record.",
    };
  }

  const orderItemsPayload: Database["public"]["Tables"]["order_items"]["Insert"][] =
    pricedLineItems.map((item) => {
      const selectedShade = item.cartItem.selectedShade;
      return {
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.cartItem.quantity,
        unit_price: item.pricing.finalUnitPrice,
        product_snapshot: {
          productId: item.product.id,
          productName: item.product.name,
          productSlug: item.product.slug,
          sku: item.product.sku,
          variant: selectedShade ? { shade: selectedShade } : null,
          unitPrice: item.pricing.baseUnitPrice,
          discountPercent: item.pricing.discountPercent,
          discountAmountPerUnit: item.pricing.discountAmountPerUnit,
          finalUnitPrice: item.pricing.finalUnitPrice,
          currency: item.product.currency,
          compareAtPrice: item.product.compare_at_price,
        } as Json,
      };
    });

  const { error: orderItemsError } = await input.supabase
    .from("order_items")
    .insert(orderItemsPayload);
  if (orderItemsError) {
    await input.supabase.from("orders").delete().eq("id", order.id);
    return {
      ok: false as const,
      message: "Failed to create order items.",
    };
  }

  const { data: payment, error: paymentError } = await input.supabase
    .from("payments")
    .insert({
      order_id: order.id,
      user_id: input.userId,
      method: input.paymentMethod,
      provider:
        input.paymentMethod === "mpesa"
          ? "mpesa_daraja"
          : input.paymentMethod === "card"
            ? "card_placeholder"
            : "cash_manual",
      status: "initiated",
      amount: total,
      currency: "KES",
      phone: input.shippingSnapshot.phone,
      raw_response: {
        source: "checkout",
        couponCode: couponValidation.appliedCode ?? null,
      } as Json,
    })
    .select("id,order_id,user_id,method,provider,status,amount,currency,created_at")
    .maybeSingle();

  if (paymentError || !payment) {
    await input.supabase.from("orders").delete().eq("id", order.id);
    return {
      ok: false as const,
      message: "Failed to create payment record.",
    };
  }

  return {
    ok: true as const,
    order: {
      id: order.id,
      orderNumber: order.order_number,
      userId: order.user_id,
      status: order.status,
      subtotal: order.subtotal,
      discount: order.discount,
      shipping: order.shipping,
      tax: order.tax,
      total: order.total,
      currency: order.currency,
      placedAt: order.placed_at,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      shippingAddress: order.shipping_address,
      deliverySnapshot: order.delivery_snapshot,
      retryCount: order.retry_count ?? 0,
      lastPaymentAttemptAt: order.last_payment_attempt_at,
      couponCode: couponValidation.appliedCode,
    },
    payment: {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      method: payment.method,
      provider: payment.provider,
    },
  };
}

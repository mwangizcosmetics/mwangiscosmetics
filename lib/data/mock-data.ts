import type {
  AdminStat,
  Banner,
  CartItem,
  Category,
  Coupon,
  Order,
  Product,
  Review,
  ServiceCounty,
  ServiceTown,
  Testimonial,
  UserProfile,
  WishlistItem,
} from "@/lib/types/ecommerce";

export const categories: Category[] = [
  {
    id: "cat-skincare",
    name: "Skincare",
    slug: "skincare",
    description: "Barrier-first skincare for calm, radiant skin.",
    image:
      "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=1200&auto=format&fit=crop",
    productCount: 42,
    featured: true,
  },
  {
    id: "cat-makeup",
    name: "Makeup",
    slug: "makeup",
    description: "Long-wear complexion and lip essentials.",
    image:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop",
    productCount: 36,
    featured: true,
  },
  {
    id: "cat-bodycare",
    name: "Body Care",
    slug: "body-care",
    description: "Nourishing body care with silky finishes.",
    image:
      "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1200&auto=format&fit=crop",
    productCount: 18,
  },
  {
    id: "cat-haircare",
    name: "Hair Care",
    slug: "hair-care",
    description: "Strengthening, hydrating care for glossy strands.",
    image:
      "https://images.unsplash.com/photo-1500840216050-6ffa99d75160?q=80&w=1200&auto=format&fit=crop",
    productCount: 21,
  },
  {
    id: "cat-fragrance",
    name: "Fragrance",
    slug: "fragrance",
    description: "Soft floral and warm signature scents.",
    image:
      "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=1200&auto=format&fit=crop",
    productCount: 12,
  },
  {
    id: "cat-tools",
    name: "Beauty Tools",
    slug: "beauty-tools",
    description: "Pro-grade tools for flawless daily routines.",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop",
    productCount: 15,
  },
];

const seedTimestamp = "2026-04-03T08:00:00.000Z";

export const serviceCounties: ServiceCounty[] = [
  {
    id: "county-uasin-gishu",
    name: "Uasin Gishu",
    isActive: true,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "county-nairobi",
    name: "Nairobi",
    isActive: true,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "county-nakuru",
    name: "Nakuru",
    isActive: true,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "county-kisumu",
    name: "Kisumu",
    isActive: true,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "county-kakamega",
    name: "Kakamega",
    isActive: true,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "county-nandi",
    name: "Nandi",
    isActive: true,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
];

export const serviceTowns: ServiceTown[] = [
  {
    id: "town-eldoret",
    countyId: "county-uasin-gishu",
    name: "Eldoret",
    isActive: true,
    etaMinValue: 1,
    etaMaxValue: 2,
    etaUnit: "days",
    deliveryFee: 150,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "town-burnt-forest",
    countyId: "county-uasin-gishu",
    name: "Burnt Forest",
    isActive: true,
    etaMinValue: 2,
    etaMaxValue: 3,
    etaUnit: "days",
    deliveryFee: 250,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "town-nairobi-cbd",
    countyId: "county-nairobi",
    name: "Nairobi CBD",
    isActive: true,
    etaMinValue: 1,
    etaMaxValue: 2,
    etaUnit: "days",
    deliveryFee: 350,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "town-westlands",
    countyId: "county-nairobi",
    name: "Westlands",
    isActive: true,
    etaMinValue: 1,
    etaMaxValue: 2,
    etaUnit: "days",
    deliveryFee: 350,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "town-nakuru-town",
    countyId: "county-nakuru",
    name: "Nakuru Town",
    isActive: true,
    etaMinValue: 2,
    etaMaxValue: 3,
    etaUnit: "days",
    deliveryFee: 300,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "town-kisumu-cbd",
    countyId: "county-kisumu",
    name: "Kisumu CBD",
    isActive: true,
    etaMinValue: 2,
    etaMaxValue: 4,
    etaUnit: "days",
    deliveryFee: 350,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "town-kakamega-town",
    countyId: "county-kakamega",
    name: "Kakamega Town",
    isActive: true,
    etaMinValue: 2,
    etaMaxValue: 3,
    etaUnit: "days",
    deliveryFee: 280,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
  {
    id: "town-kapsabet",
    countyId: "county-nandi",
    name: "Kapsabet",
    isActive: true,
    etaMinValue: 2,
    etaMaxValue: 3,
    etaUnit: "days",
    deliveryFee: 280,
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp,
  },
];

export const products: Product[] = [
  {
    id: "prd-rose-serum",
    slug: "rose-dew-hydra-serum",
    name: "Rose Dew Hydra Serum",
    shortDescription: "Plumping hydration serum with niacinamide and rose water.",
    description:
      "A lightweight daily serum that deeply hydrates, refines texture, and supports a luminous finish without feeling sticky.",
    brand: "MWANGIZ Labs",
    categorySlug: "skincare",
    tags: ["hydrating", "radiance", "niacinamide"],
    images: [
      {
        id: "img-rose-serum-1",
        url: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1200&auto=format&fit=crop",
        alt: "Rose Dew Hydra Serum bottle",
        isPrimary: true,
      },
      {
        id: "img-rose-serum-2",
        url: "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1200&auto=format&fit=crop",
        alt: "Rose Dew Hydra Serum texture",
      },
    ],
    price: 4200,
    compareAtPrice: 5000,
    currency: "KES",
    stock: 32,
    sku: "MWZ-SK-001",
    rating: 4.8,
    ratingCount: 268,
    isNew: true,
    isFeatured: true,
    highlights: [
      "Hydrates for up to 24 hours",
      "Supports skin barrier comfort",
      "Non-comedogenic and fragrance-light",
    ],
    ingredients: ["Niacinamide", "Rose Water", "Hyaluronic Acid", "Panthenol"],
    benefits: ["Hydration", "Radiance", "Texture refinement"],
    howToUse: [
      "Apply 2-3 drops on damp skin.",
      "Follow with moisturizer and SPF in the morning.",
      "Use daily, morning and evening.",
    ],
  },
  {
    id: "prd-velvet-foundation",
    slug: "velvet-skin-foundation-spf30",
    name: "Velvet Skin Foundation SPF 30",
    shortDescription: "Soft-matte, breathable foundation with skincare actives.",
    description:
      "Buildable medium coverage foundation with a skin-like finish and comfortable wear for up to 12 hours.",
    brand: "MWANGIZ Studio",
    categorySlug: "makeup",
    tags: ["complexion", "spf", "soft-matte"],
    images: [
      {
        id: "img-foundation-1",
        url: "https://images.unsplash.com/photo-1599733594230-6b823276abcc?q=80&w=1200&auto=format&fit=crop",
        alt: "Velvet Skin Foundation bottle",
        isPrimary: true,
      },
      {
        id: "img-foundation-2",
        url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop",
        alt: "Velvet Skin Foundation swatches",
      },
    ],
    price: 3600,
    compareAtPrice: 4200,
    currency: "KES",
    stock: 18,
    sku: "MWZ-MU-014",
    rating: 4.7,
    ratingCount: 411,
    isBestSeller: true,
    isFeatured: true,
    highlights: [
      "12-hour breathable wear",
      "SPF 30 broad spectrum support",
      "Buildable medium coverage",
    ],
    ingredients: ["Zinc Oxide", "Squalane", "Vitamin E", "Green Tea Extract"],
    benefits: ["Coverage", "UV support", "Comfortable wear"],
    howToUse: [
      "Prep skin with moisturizer.",
      "Apply with brush or sponge starting at center of face.",
      "Build in thin layers where needed.",
    ],
  },
  {
    id: "prd-lip-oil",
    slug: "silk-petal-lip-oil",
    name: "Silk Petal Lip Oil",
    shortDescription: "Sheer shine lip treatment with peptide infusion.",
    description:
      "Nourishing lip oil that gives a plush glossy look while improving softness over time.",
    brand: "MWANGIZ Studio",
    categorySlug: "makeup",
    tags: ["lips", "gloss", "treatment"],
    images: [
      {
        id: "img-lip-oil-1",
        url: "https://images.unsplash.com/photo-1631214540242-cc2f8d915e70?q=80&w=1200&auto=format&fit=crop",
        alt: "Silk Petal Lip Oil",
        isPrimary: true,
      },
      {
        id: "img-lip-oil-2",
        url: "https://images.unsplash.com/photo-1583241801728-9c63ca7d7f79?q=80&w=1200&auto=format&fit=crop",
        alt: "Silk Petal Lip Oil applicator",
      },
    ],
    price: 1800,
    compareAtPrice: 2200,
    currency: "KES",
    stock: 51,
    sku: "MWZ-MU-021",
    rating: 4.9,
    ratingCount: 625,
    isBestSeller: true,
    isFeatured: true,
    highlights: [
      "Cushiony non-sticky shine",
      "Peptide-powered moisture care",
      "Comfortable daily wear",
    ],
    ingredients: ["Peptides", "Jojoba Oil", "Apricot Kernel Oil", "Vitamin E"],
    benefits: ["Nourishment", "Shine", "Lip barrier support"],
    howToUse: [
      "Swipe directly onto bare lips.",
      "Layer over lipstick for extra gloss.",
      "Reapply as needed throughout the day.",
    ],
  },
  {
    id: "prd-cleanse-balm",
    slug: "camellia-melt-cleansing-balm",
    name: "Camellia Melt Cleansing Balm",
    shortDescription: "Rich cleansing balm that melts makeup and SPF.",
    description:
      "Transforming balm-to-oil cleanser that dissolves long-wear makeup and daily buildup while keeping skin soft.",
    brand: "MWANGIZ Labs",
    categorySlug: "skincare",
    tags: ["cleanser", "double-cleanse", "gentle"],
    images: [
      {
        id: "img-balm-1",
        url: "https://images.unsplash.com/photo-1629198728970-24446b4d1f99?q=80&w=1200&auto=format&fit=crop",
        alt: "Camellia Melt Cleansing Balm jar",
        isPrimary: true,
      },
      {
        id: "img-balm-2",
        url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop",
        alt: "Cleansing balm texture",
      },
    ],
    price: 2900,
    currency: "KES",
    stock: 24,
    sku: "MWZ-SK-010",
    rating: 4.6,
    ratingCount: 193,
    isNew: true,
    highlights: [
      "Melts waterproof makeup",
      "Rinses clean without residue",
      "Suitable for sensitive skin",
    ],
    ingredients: ["Camellia Seed Oil", "Sunflower Oil", "Vitamin C Ester"],
    benefits: ["Deep cleanse", "Comfort", "Softness"],
    howToUse: [
      "Massage a small amount onto dry skin.",
      "Emulsify with warm water.",
      "Rinse and follow with water-based cleanser.",
    ],
  },
  {
    id: "prd-body-cream",
    slug: "cashmere-veil-body-cream",
    name: "Cashmere Veil Body Cream",
    shortDescription: "Fast-absorbing body cream for satin-soft skin.",
    description:
      "Nutrient-rich body cream that locks in moisture and leaves a subtle, refined scent.",
    brand: "MWANGIZ Body",
    categorySlug: "body-care",
    tags: ["body", "moisture", "softness"],
    images: [
      {
        id: "img-body-1",
        url: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=1200&auto=format&fit=crop",
        alt: "Cashmere Veil Body Cream",
        isPrimary: true,
      },
      {
        id: "img-body-2",
        url: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=1200&auto=format&fit=crop",
        alt: "Body cream texture",
      },
    ],
    price: 2400,
    compareAtPrice: 3000,
    currency: "KES",
    stock: 43,
    sku: "MWZ-BC-002",
    rating: 4.5,
    ratingCount: 164,
    isFeatured: true,
    highlights: [
      "Long-lasting body moisture",
      "Silky finish without stickiness",
      "Clean floral musk scent",
    ],
    ingredients: ["Shea Butter", "Ceramides", "Squalane", "Aloe Vera"],
    benefits: ["Moisture lock", "Soft texture", "Barrier support"],
    howToUse: [
      "Apply generously after showering.",
      "Massage into dry areas such as elbows and knees.",
      "Use morning and evening for best results.",
    ],
  },
  {
    id: "prd-hair-mask",
    slug: "midnight-repair-hair-mask",
    name: "Midnight Repair Hair Mask",
    shortDescription: "Intensive treatment mask for dry and damaged hair.",
    description:
      "A weekly treatment that restores softness, manages frizz, and improves shine.",
    brand: "MWANGIZ Hair",
    categorySlug: "hair-care",
    tags: ["repair", "hydration", "shine"],
    images: [
      {
        id: "img-hair-mask-1",
        url: "https://images.unsplash.com/photo-1617897903246-719242758050?q=80&w=1200&auto=format&fit=crop",
        alt: "Midnight Repair Hair Mask",
        isPrimary: true,
      },
      {
        id: "img-hair-mask-2",
        url: "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?q=80&w=1200&auto=format&fit=crop",
        alt: "Hair mask jar and comb",
      },
    ],
    price: 3200,
    currency: "KES",
    stock: 29,
    sku: "MWZ-HC-007",
    rating: 4.7,
    ratingCount: 207,
    isBestSeller: true,
    highlights: [
      "Repairs visible dryness",
      "Improves manageability",
      "Smooth finish with shine",
    ],
    ingredients: ["Argan Oil", "Keratin", "Coconut Milk", "Biotin"],
    benefits: ["Repair", "Softness", "Shine"],
    howToUse: [
      "Apply to clean damp hair.",
      "Leave for 5-10 minutes.",
      "Rinse thoroughly and style as usual.",
    ],
  },
  {
    id: "prd-perfume",
    slug: "sunlit-garden-eau-de-parfum",
    name: "Sunlit Garden Eau De Parfum",
    shortDescription: "A floral amber fragrance with soft citrus opening.",
    description:
      "An elegant signature fragrance featuring pear blossom, jasmine petals, and warm amber woods.",
    brand: "MWANGIZ Fragrance",
    categorySlug: "fragrance",
    tags: ["fragrance", "floral", "signature"],
    images: [
      {
        id: "img-perfume-1",
        url: "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop",
        alt: "Sunlit Garden perfume bottle",
        isPrimary: true,
      },
      {
        id: "img-perfume-2",
        url: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop",
        alt: "Sunlit Garden fragrance setup",
      },
    ],
    price: 6800,
    compareAtPrice: 7600,
    currency: "KES",
    stock: 14,
    sku: "MWZ-FR-001",
    rating: 4.8,
    ratingCount: 152,
    isFeatured: true,
    highlights: [
      "Long-lasting refined scent",
      "Floral amber profile",
      "Elegant everyday and occasion wear",
    ],
    ingredients: ["Pear Blossom", "Jasmine", "Vanilla", "Amber Woods"],
    benefits: ["Signature scent", "Longevity", "Layer-friendly"],
    howToUse: [
      "Spray on pulse points from 10-15 cm away.",
      "Layer with body cream for longer wear.",
      "Avoid rubbing fragrance into skin.",
    ],
  },
  {
    id: "prd-brush-set",
    slug: "precision-flawless-brush-set",
    name: "Precision Flawless Brush Set",
    shortDescription: "8-piece premium makeup brush kit for full-face looks.",
    description:
      "Soft synthetic brushes with weighted handles for effortless blending and precise application.",
    brand: "MWANGIZ Studio",
    categorySlug: "beauty-tools",
    tags: ["brushes", "tools", "pro-kit"],
    images: [
      {
        id: "img-brush-set-1",
        url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?q=80&w=1200&auto=format&fit=crop",
        alt: "Precision Flawless Brush Set",
        isPrimary: true,
      },
      {
        id: "img-brush-set-2",
        url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?q=80&w=1200&auto=format&fit=crop",
        alt: "Brush set closeup",
      },
    ],
    price: 5400,
    currency: "KES",
    stock: 20,
    sku: "MWZ-BT-004",
    rating: 4.6,
    ratingCount: 133,
    isNew: true,
    highlights: [
      "8-piece essential brush selection",
      "Ultra-soft cruelty-free bristles",
      "Travel-ready storage pouch included",
    ],
    ingredients: ["Synthetic Fibers", "Aluminum Ferrules", "Matte Resin Handles"],
    benefits: ["Blend quality", "Precision", "Durability"],
    howToUse: [
      "Use dense brushes for base products.",
      "Use tapered brushes for eyes and detail.",
      "Clean weekly with mild brush cleanser.",
    ],
  },
];

export const reviews: Review[] = [
  {
    id: "rev-001",
    productId: "prd-rose-serum",
    userName: "Wanjiru N.",
    rating: 5,
    title: "My skin looks brighter in one week",
    comment:
      "The texture is so light and it layers perfectly under sunscreen. My skin feels hydrated all day.",
    createdAt: "2026-03-21T08:10:00.000Z",
    verifiedPurchase: true,
  },
  {
    id: "rev-002",
    productId: "prd-velvet-foundation",
    userName: "Muthoni K.",
    rating: 5,
    title: "Exactly the finish I wanted",
    comment:
      "Soft-matte but not dry. Stayed smooth through a full day at work and still looked fresh by evening.",
    createdAt: "2026-03-24T13:33:00.000Z",
    verifiedPurchase: true,
  },
  {
    id: "rev-003",
    productId: "prd-lip-oil",
    userName: "Achieng O.",
    rating: 4,
    title: "So glossy and comfy",
    comment:
      "Love the shine and the applicator. It keeps my lips soft and never feels sticky.",
    createdAt: "2026-03-28T17:45:00.000Z",
    verifiedPurchase: true,
  },
  {
    id: "rev-004",
    productId: "prd-cleanse-balm",
    userName: "Faith M.",
    rating: 4,
    title: "Melts makeup quickly",
    comment:
      "Removes sunscreen and makeup without rubbing too much. Skin feels clean and calm.",
    createdAt: "2026-03-16T10:20:00.000Z",
    verifiedPurchase: false,
  },
];

export const homepageBanners: Banner[] = [
  {
    id: "bnr-01",
    title: "Luxury Beauty, Thoughtfully Curated",
    subtitle: "Enjoy free Nairobi delivery above KES 7,500",
    ctaLabel: "Shop New Arrivals",
    href: "/shop?tag=new",
    badge: "Spring Edit",
    imageUrl:
      "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1800&auto=format&fit=crop",
    active: true,
  },
  {
    id: "bnr-02",
    title: "Skin Essentials Bundle",
    subtitle: "Save 15% on your evening ritual set",
    ctaLabel: "Explore Bundles",
    href: "/shop?tag=bundle",
    badge: "Limited Offer",
    imageUrl:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?q=80&w=1800&auto=format&fit=crop",
    active: true,
  },
];

export const coupons: Coupon[] = [
  {
    id: "cpn-01",
    code: "GLOW10",
    description: "10% off orders above KES 5,000",
    type: "percentage",
    value: 10,
    minSubtotal: 5000,
    active: true,
    expiresAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "cpn-02",
    code: "FIRST1200",
    description: "KES 1,200 off first purchase",
    type: "fixed",
    value: 1200,
    active: true,
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "tst-1",
    customerName: "Ruth W.",
    text: "Every order feels premium from packaging to product quality.",
    rating: 5,
    skinType: "Combination",
  },
  {
    id: "tst-2",
    customerName: "Sharon A.",
    text: "The product recommendations were spot on for my dry skin.",
    rating: 5,
    skinType: "Dry",
  },
  {
    id: "tst-3",
    customerName: "Nyambura N.",
    text: "Checkout is fast on mobile and delivery updates are clear.",
    rating: 4,
    skinType: "Sensitive",
  },
];

export const sampleProfile: UserProfile = {
  id: "usr-001",
  fullName: "Jane Mwangi",
  email: "jane.mwangi@example.com",
  phone: "+254712345678",
  loyaltyTier: "Glow",
  defaultAddress: {
    id: "addr-eldoret-home",
    userId: "usr-001",
    label: "Home",
    fullName: "Jane Mwangi",
    phone: "+254712345678",
    countyId: "county-uasin-gishu",
    county: "Uasin Gishu",
    townCenterId: "town-eldoret",
    townCenter: "Eldoret",
    streetAddress: "Uganda Road",
    buildingOrHouse: "Sapphire Court, Apt 3B",
    landmark: "Near Zion Mall",
    isPrimary: true,
    createdAt: "2026-03-10T11:00:00.000Z",
    updatedAt: "2026-03-10T11:00:00.000Z",
  },
  savedAddresses: [
    {
      id: "addr-eldoret-home",
      userId: "usr-001",
      label: "Home",
      fullName: "Jane Mwangi",
      phone: "+254712345678",
      countyId: "county-uasin-gishu",
      county: "Uasin Gishu",
      townCenterId: "town-eldoret",
      townCenter: "Eldoret",
      streetAddress: "Uganda Road",
      buildingOrHouse: "Sapphire Court, Apt 3B",
      landmark: "Near Zion Mall",
      isPrimary: true,
      createdAt: "2026-03-10T11:00:00.000Z",
      updatedAt: "2026-03-10T11:00:00.000Z",
    },
    {
      id: "addr-nairobi-work",
      userId: "usr-001",
      label: "Work",
      fullName: "Jane Mwangi",
      phone: "+254712345678",
      countyId: "county-nairobi",
      county: "Nairobi",
      townCenterId: "town-westlands",
      townCenter: "Westlands",
      streetAddress: "Waiyaki Way",
      buildingOrHouse: "Westgate Towers, 5th Floor",
      landmark: "Opposite Sarit Centre",
      isPrimary: false,
      createdAt: "2026-03-14T09:15:00.000Z",
      updatedAt: "2026-03-14T09:15:00.000Z",
    },
  ],
};

export const sampleOrders: Order[] = [
  {
    id: "ord-001",
    orderNumber: "MWZ-24031",
    userId: "usr-001",
    status: "shipped",
    items: [
      {
        productId: "prd-rose-serum",
        quantity: 1,
        unitPrice: 4200,
        productSnapshot: {
          name: "Rose Dew Hydra Serum",
          image:
            "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=400&auto=format&fit=crop",
        },
      },
      {
        productId: "prd-lip-oil",
        quantity: 1,
        unitPrice: 1800,
        productSnapshot: {
          name: "Silk Petal Lip Oil",
          image:
            "https://images.unsplash.com/photo-1631214540242-cc2f8d915e70?q=80&w=400&auto=format&fit=crop",
        },
      },
    ],
    subtotal: 6000,
    discount: 600,
    shipping: 0,
    tax: 480,
    total: 5880,
    currency: "KES",
    placedAt: "2026-03-31T09:00:00.000Z",
    estimatedDelivery: "2026-04-04T11:00:00.000Z",
    shippingAddress: sampleProfile.savedAddresses[0],
    paymentMethod: "M-Pesa",
  },
  {
    id: "ord-002",
    orderNumber: "MWZ-23876",
    userId: "usr-001",
    status: "delivered",
    items: [
      {
        productId: "prd-velvet-foundation",
        quantity: 1,
        unitPrice: 3600,
        productSnapshot: {
          name: "Velvet Skin Foundation SPF 30",
          image:
            "https://images.unsplash.com/photo-1599733594230-6b823276abcc?q=80&w=400&auto=format&fit=crop",
        },
      },
    ],
    subtotal: 3600,
    discount: 0,
    shipping: 300,
    tax: 288,
    total: 4188,
    currency: "KES",
    placedAt: "2026-03-18T16:30:00.000Z",
    estimatedDelivery: "2026-03-21T15:00:00.000Z",
    shippingAddress: sampleProfile.savedAddresses[0],
    paymentMethod: "Card",
  },
];

export const initialCartItems: CartItem[] = [
  {
    productId: "prd-rose-serum",
    quantity: 1,
  },
  {
    productId: "prd-lip-oil",
    quantity: 2,
  },
];

export const initialWishlistItems: WishlistItem[] = [
  {
    productId: "prd-velvet-foundation",
    createdAt: "2026-03-28T10:05:00.000Z",
  },
  {
    productId: "prd-perfume",
    createdAt: "2026-03-29T11:20:00.000Z",
  },
];

export const adminStats: AdminStat[] = [
  {
    id: "ast-sales",
    title: "Gross Sales",
    value: "KES 1.84M",
    trend: "vs last month",
    change: 12.4,
  },
  {
    id: "ast-orders",
    title: "Orders",
    value: "2,438",
    trend: "vs last month",
    change: 8.2,
  },
  {
    id: "ast-aov",
    title: "Average Order",
    value: "KES 6,210",
    trend: "vs last month",
    change: 3.1,
  },
  {
    id: "ast-conversion",
    title: "Conversion Rate",
    value: "4.9%",
    trend: "vs last month",
    change: 0.7,
  },
];

export const adminTableSamples = {
  products: products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    category: product.categorySlug,
    stock: product.stock,
    price: product.price,
    status: product.stock > 0 ? "Active" : "Out of stock",
  })),
  orders: sampleOrders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    customer: sampleProfile.fullName,
    status: order.status,
    total: order.total,
    placedAt: order.placedAt,
  })),
  customers: [
    {
      id: "cus-001",
      name: "Jane Mwangi",
      email: "jane.mwangi@example.com",
      orders: 12,
      lifetimeSpend: 78400,
      segment: "Returning",
    },
    {
      id: "cus-002",
      name: "Mercy Wangari",
      email: "mercy.wangari@example.com",
      orders: 5,
      lifetimeSpend: 32200,
      segment: "Growth",
    },
  ],
};

export const featuredProducts = products.filter((product) => product.isFeatured);
export const bestSellerProducts = products.filter((product) => product.isBestSeller);
export const newArrivalProducts = products.filter((product) => product.isNew);

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value).trim().toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
}

export function getProductBySlug(slug: string) {
  const normalized = normalizeSlug(slug);
  return products.find((product) => product.slug.toLowerCase() === normalized);
}

export function getCategoryBySlug(slug: string) {
  const normalized = normalizeSlug(slug);
  return categories.find((category) => category.slug.toLowerCase() === normalized);
}

export function getProductsByCategory(slug: string) {
  const normalized = normalizeSlug(slug);
  return products.filter((product) => product.categorySlug.toLowerCase() === normalized);
}

export function searchProducts(query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) => {
    return (
      product.name.toLowerCase().includes(normalizedQuery) ||
      product.shortDescription.toLowerCase().includes(normalizedQuery) ||
      product.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery)) ||
      product.categorySlug.toLowerCase().includes(normalizedQuery)
    );
  });
}

export function getRelatedProducts(productId: string, limit = 4) {
  const selectedProduct = products.find((product) => product.id === productId);
  if (!selectedProduct) {
    return [];
  }

  return products
    .filter(
      (product) =>
        product.id !== productId &&
        (product.categorySlug === selectedProduct.categorySlug ||
          product.tags.some((tag) => selectedProduct.tags.includes(tag))),
    )
    .slice(0, limit);
}

export function getReviewsForProduct(productId: string) {
  return reviews.filter((review) => review.productId === productId);
}

import { HttpTypes } from "@medusajs/types"

// Demo Products - Properly typed to match Medusa StoreProduct structure
export const demoMedusaProducts = [
  {
    id: "prod_1",
    title: "Commercial Elevator System",
    handle: "commercial-elevator-system",
    description: "High-capacity commercial elevator system with advanced safety features",
    thumbnail: "/products/commercial_elevators.webp",
    variants: [
      {
        id: "variant_1",
        title: "Standard",
        prices: [{ amount: 250000, currency_code: "inr" }]
      }
    ],
    images: [{ url: "/products/commercial_elevators.webp" }],
    categories: [{ id: "cat_1", name: "Commercial Elevators" }]
  },
  {
    id: "prod_2",
    title: "Residential Lift",
    handle: "residential-lift",
    description: "Compact and elegant residential lift for modern homes",
    thumbnail: "/products/residential_lifts.webp",
    variants: [
      {
        id: "variant_2",
        title: "Standard",
        prices: [{ amount: 180000, currency_code: "inr" }]
      }
    ],
    images: [{ url: "/products/residential_lifts.webp" }],
    categories: [{ id: "cat_2", name: "Residential Lifts" }]
  },
  {
    id: "prod_3",
    title: "Hospital Lift System",
    handle: "hospital-lift-system",
    description: "Specialized hospital lift with stretcher capacity and smooth operation",
    thumbnail: "/products/hospital_lifts.webp",
    variants: [
      {
        id: "variant_3",
        title: "Standard",
        prices: [{ amount: 320000, currency_code: "inr" }]
      }
    ],
    images: [{ url: "/products/hospital_lifts.webp" }],
    categories: [{ id: "cat_3", name: "Hospital Lifts" }]
  },
  {
    id: "prod_4",
    title: "Hydraulic Lift",
    handle: "hydraulic-lift",
    description: "Reliable hydraulic lift system for low to mid-rise buildings",
    thumbnail: "/products/hydralic_lifts.webp",
    variants: [
      {
        id: "variant_4",
        title: "Standard",
        prices: [{ amount: 200000, currency_code: "inr" }]
      }
    ],
    images: [{ url: "/products/hydralic_lifts.webp" }],
    categories: [{ id: "cat_4", name: "Hydraulic Lifts" }]
  },
  {
    id: "prod_5",
    title: "Home Lift",
    handle: "home-lift",
    description: "Stylish and space-saving home lift for luxury residences",
    thumbnail: "/products/home_lifts.webp",
    variants: [
      {
        id: "variant_5",
        title: "Standard",
        prices: [{ amount: 150000, currency_code: "inr" }]
      }
    ],
    images: [{ url: "/products/home_lifts.webp" }],
    categories: [{ id: "cat_5", name: "Home Lifts" }]
  },
  {
    id: "prod_6",
    title: "Goods Lift",
    handle: "goods-lift",
    description: "Heavy-duty goods lift for industrial and warehouse applications",
    thumbnail: "/products/goods_lifts.webp",
    variants: [
      {
        id: "variant_6",
        title: "Standard",
        prices: [{ amount: 280000, currency_code: "inr" }]
      }
    ],
    images: [{ url: "/products/goods_lifts.webp" }],
    categories: [{ id: "cat_6", name: "Goods Lifts" }]
  }
] as unknown as HttpTypes.StoreProduct[]

// Demo Categories - Properly typed to match Medusa StoreProductCategory structure
export const demoMedusaCategories = [
  {
    id: "cat_1",
    name: "Commercial Elevators",
    handle: "commercial-elevators",
    description: "High-capacity elevators for commercial buildings",
    category_children: [
      {
        id: "cat_1_sub_1",
        name: "Passenger Elevators",
        handle: "passenger-elevators",
        description: "Standard passenger elevators for office buildings",
        parent_category_id: "cat_1",
        metadata: { icon: "👥" },
        category_children: []
      },
      {
        id: "cat_1_sub_2",
        name: "High-Speed Elevators",
        handle: "high-speed-elevators",
        description: "Fast elevators for high-rise buildings",
        parent_category_id: "cat_1",
        metadata: { icon: "⚡" },
        category_children: []
      },
      {
        id: "cat_1_sub_3",
        name: "Service Elevators",
        handle: "service-elevators",
        description: "Heavy-duty service elevators",
        parent_category_id: "cat_1",
        metadata: { icon: "🔧" },
        category_children: []
      },
      {
        id: "cat_1_sub_4",
        name: "Panoramic Elevators",
        handle: "panoramic-elevators",
        description: "Glass elevators with scenic views",
        parent_category_id: "cat_1",
        metadata: { icon: "🌆" },
        category_children: []
      }
    ]
  },
  {
    id: "cat_2",
    name: "Residential Lifts",
    handle: "residential-lifts",
    description: "Elegant lifts for residential buildings",
    category_children: [
      {
        id: "cat_2_sub_1",
        name: "Apartment Lifts",
        handle: "apartment-lifts",
        description: "Compact lifts for apartment buildings",
        parent_category_id: "cat_2",
        metadata: { icon: "🏢" },
        category_children: []
      },
      {
        id: "cat_2_sub_2",
        name: "Villa Lifts",
        handle: "villa-lifts",
        description: "Luxury lifts for villas",
        parent_category_id: "cat_2",
        metadata: { icon: "🏡" },
        category_children: []
      },
      {
        id: "cat_2_sub_3",
        name: "Duplex Lifts",
        handle: "duplex-lifts",
        description: "Space-saving lifts for duplex homes",
        parent_category_id: "cat_2",
        metadata: { icon: "🏠" },
        category_children: []
      },
      {
        id: "cat_2_sub_4",
        name: "Wheelchair Lifts",
        handle: "wheelchair-lifts",
        description: "Accessible lifts for mobility needs",
        parent_category_id: "cat_2",
        metadata: { icon: "♿" },
        category_children: []
      }
    ]
  },
  {
    id: "cat_3",
    name: "Hospital Lifts",
    handle: "hospital-lifts",
    description: "Specialized lifts for healthcare facilities",
    category_children: [
      {
        id: "cat_3_sub_1",
        name: "Stretcher Lifts",
        handle: "stretcher-lifts",
        description: "Large capacity lifts for stretchers",
        parent_category_id: "cat_3",
        metadata: { icon: "🏥" },
        category_children: []
      },
      {
        id: "cat_3_sub_2",
        name: "Bed Lifts",
        handle: "bed-lifts",
        description: "Lifts designed for hospital beds",
        parent_category_id: "cat_3",
        metadata: { icon: "🛏️" },
        category_children: []
      },
      {
        id: "cat_3_sub_3",
        name: "ICU Lifts",
        handle: "icu-lifts",
        description: "Smooth operation lifts for ICU transport",
        parent_category_id: "cat_3",
        metadata: { icon: "🚑" },
        category_children: []
      },
      {
        id: "cat_3_sub_4",
        name: "Medical Equipment Lifts",
        handle: "medical-equipment-lifts",
        description: "Heavy-duty lifts for medical equipment",
        parent_category_id: "cat_3",
        metadata: { icon: "⚕️" },
        category_children: []
      }
    ]
  },
  {
    id: "cat_4",
    name: "Hydraulic Lifts",
    handle: "hydraulic-lifts",
    description: "Reliable hydraulic lift systems",
    category_children: [
      {
        id: "cat_4_sub_1",
        name: "Single Stage Hydraulic",
        handle: "single-stage-hydraulic",
        description: "Basic hydraulic lift systems",
        parent_category_id: "cat_4",
        metadata: { icon: "💧" },
        category_children: []
      },
      {
        id: "cat_4_sub_2",
        name: "Multi-Stage Hydraulic",
        handle: "multi-stage-hydraulic",
        description: "Advanced multi-stage systems",
        parent_category_id: "cat_4",
        metadata: { icon: "🔄" },
        category_children: []
      },
      {
        id: "cat_4_sub_3",
        name: "Telescopic Hydraulic",
        handle: "telescopic-hydraulic",
        description: "Space-efficient telescopic systems",
        parent_category_id: "cat_4",
        metadata: { icon: "📏" },
        category_children: []
      },
      {
        id: "cat_4_sub_4",
        name: "Roped Hydraulic",
        handle: "roped-hydraulic",
        description: "Hybrid roped hydraulic systems",
        parent_category_id: "cat_4",
        metadata: { icon: "🔗" },
        category_children: []
      }
    ]
  },
  {
    id: "cat_5",
    name: "Home Lifts",
    handle: "home-lifts",
    description: "Compact lifts for homes",
    category_children: [
      {
        id: "cat_5_sub_1",
        name: "Compact Home Lifts",
        handle: "compact-home-lifts",
        description: "Ultra-compact lifts for small spaces",
        parent_category_id: "cat_5",
        metadata: { icon: "📦" },
        category_children: []
      },
      {
        id: "cat_5_sub_2",
        name: "Luxury Home Lifts",
        handle: "luxury-home-lifts",
        description: "Premium lifts with custom finishes",
        parent_category_id: "cat_5",
        metadata: { icon: "💎" },
        category_children: []
      },
      {
        id: "cat_5_sub_3",
        name: "Outdoor Home Lifts",
        handle: "outdoor-home-lifts",
        description: "Weather-resistant outdoor lifts",
        parent_category_id: "cat_5",
        metadata: { icon: "🌤️" },
        category_children: []
      },
      {
        id: "cat_5_sub_4",
        name: "Platform Lifts",
        handle: "platform-lifts",
        description: "Open platform lifts for easy access",
        parent_category_id: "cat_5",
        metadata: { icon: "⬆️" },
        category_children: []
      }
    ]
  },
  {
    id: "cat_6",
    name: "Goods Lifts",
    handle: "goods-lifts",
    description: "Heavy-duty lifts for cargo",
    category_children: [
      {
        id: "cat_6_sub_1",
        name: "Warehouse Lifts",
        handle: "warehouse-lifts",
        description: "Industrial lifts for warehouses",
        parent_category_id: "cat_6",
        metadata: { icon: "🏭" },
        category_children: []
      },
      {
        id: "cat_6_sub_2",
        name: "Freight Elevators",
        handle: "freight-elevators",
        description: "Heavy-duty freight elevators",
        parent_category_id: "cat_6",
        metadata: { icon: "📦" },
        category_children: []
      },
      {
        id: "cat_6_sub_3",
        name: "Car Lifts",
        handle: "car-lifts",
        description: "Automotive lifts for parking",
        parent_category_id: "cat_6",
        metadata: { icon: "🚗" },
        category_children: []
      },
      {
        id: "cat_6_sub_4",
        name: "Dumbwaiters",
        handle: "dumbwaiters",
        description: "Small goods lifts for restaurants",
        parent_category_id: "cat_6",
        metadata: { icon: "🍽️" },
        category_children: []
      }
    ]
  }
] as unknown as HttpTypes.StoreProductCategory[]

// Demo Testimonials
export const demoTestimonials = [
  {
    id: "test_1",
    name: "Rajesh Kumar",
    company: "Kumar Constructions",
    role: "Project Manager",
    rating: 5,
    text: "Cedar Elevators provided exceptional service for our commercial project. The installation was smooth and the quality is outstanding.",
    image: "/icons/user.png",
    date: "2024-11-15"
  },
  {
    id: "test_2",
    name: "Priya Sharma",
    company: "Sharma Builders",
    role: "CEO",
    rating: 5,
    text: "We've been using Cedar Elevators for all our residential projects. Their products are reliable and their support team is always responsive.",
    image: "/icons/user.png",
    date: "2024-11-10"
  },
  {
    id: "test_3",
    name: "Amit Patel",
    company: "City Hospital",
    role: "Facility Manager",
    rating: 5,
    text: "The hospital lift system from Cedar is perfect for our needs. Smooth operation and excellent safety features.",
    image: "/icons/user.png",
    date: "2024-11-05"
  },
  {
    id: "test_4",
    name: "Sunita Reddy",
    company: "Reddy Enterprises",
    role: "Director",
    rating: 4,
    text: "Great quality products at competitive prices. The hydraulic lift we purchased has been working flawlessly for over a year.",
    image: "/icons/user.png",
    date: "2024-10-28"
  }
]

// Demo Applications
export const demoApplications = [
  {
    id: "app_1",
    name: "Commercial Buildings",
    description: "High-rise offices, shopping malls, and business centers",
    icon: "🏢",
    image: "/products/commercial_elevators.webp",
    productCount: 15
  },
  {
    id: "app_2",
    name: "Residential Complexes",
    description: "Apartments, condos, and gated communities",
    icon: "🏘️",
    image: "/products/residential_lifts.webp",
    productCount: 12
  },
  {
    id: "app_3",
    name: "Healthcare Facilities",
    description: "Hospitals, clinics, and medical centers",
    icon: "🏥",
    image: "/products/hospital_lifts.webp",
    productCount: 8
  },
  {
    id: "app_4",
    name: "Industrial & Warehouses",
    description: "Factories, warehouses, and logistics centers",
    icon: "🏭",
    image: "/products/goods_lifts.webp",
    productCount: 10
  }
]

// Demo Why Choose Cedar Points
export const demoWhyChooseCedar = [
  {
    id: "why_1",
    title: "Premium Quality",
    description: "ISO certified components with international standards",
    icon: "✓"
  },
  {
    id: "why_2",
    title: "Expert Installation",
    description: "Professional installation team with 15+ years experience",
    icon: "✓"
  },
  {
    id: "why_3",
    title: "24/7 Support",
    description: "Round-the-clock customer support and maintenance",
    icon: "✓"
  },
  {
    id: "why_4",
    title: "Competitive Pricing",
    description: "Best prices in the market with flexible payment options",
    icon: "✓"
  },
  {
    id: "why_5",
    title: "Fast Delivery",
    description: "Quick delivery across India with real-time tracking",
    icon: "✓"
  },
  {
    id: "why_6",
    title: "Warranty & AMC",
    description: "Comprehensive warranty and annual maintenance contracts",
    icon: "✓"
  }
]

// Demo Quick Categories
export const demoQuickCategories = [
  {
    id: "qcat_1",
    name: "Elevator Motors",
    icon: "⚙️",
    count: 45,
    link: "/products?category=motors"
  },
  {
    id: "qcat_2",
    name: "Control Panels",
    icon: "🎛️",
    count: 32,
    link: "/products?category=control-panels"
  },
  {
    id: "qcat_3",
    name: "Door Systems",
    icon: "🚪",
    count: 28,
    link: "/products?category=door-systems"
  },
  {
    id: "qcat_4",
    name: "Safety Components",
    icon: "🛡️",
    count: 56,
    link: "/products?category=safety"
  },
  {
    id: "qcat_5",
    name: "Cabin Accessories",
    icon: "✨",
    count: 38,
    link: "/products?category=accessories"
  },
  {
    id: "qcat_6",
    name: "Ropes & Cables",
    icon: "🔗",
    count: 24,
    link: "/products?category=ropes-cables"
  }
]



// Demo data for homepage sections
// This will be replaced with Medusa data in the future

export const demoProducts = [
  {
    id: "1",
    title: "Commercial Elevators",
    handle: "commercial-elevators",
    thumbnail: "/products/commercial_elevators.webp",
    price: { calculated_amount: 250000 },
    description: "High-performance commercial elevator systems",
    isFavorite: false,
    isNew: true,
    isBestSeller: true,
  },
  {
    id: "2",
    title: "Residential Lifts",
    handle: "residential-lifts",
    thumbnail: "/products/residential_lifts.webp",
    price: { calculated_amount: 180000 },
    description: "Compact and efficient residential lift solutions",
    isFavorite: true,
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "3",
    title: "Home Lifts",
    handle: "home-lifts",
    thumbnail: "/products/home_lifts.webp",
    price: { calculated_amount: 150000 },
    description: "Premium home lift systems for modern living",
    isFavorite: true,
    isNew: false,
    isBestSeller: false,
  },
  {
    id: "4",
    title: "Hospital Lifts",
    handle: "hospital-lifts",
    thumbnail: "/products/hospital_lifts.webp",
    price: { calculated_amount: 300000 },
    description: "Specialized hospital elevator systems",
    isFavorite: false,
    isNew: true,
    isBestSeller: false,
  },
  {
    id: "5",
    title: "Hydraulic Lifts",
    handle: "hydraulic-lifts",
    thumbnail: "/products/hydralic_lifts.webp",
    price: { calculated_amount: 220000 },
    description: "Reliable hydraulic lift solutions",
    isFavorite: false,
    isNew: false,
    isBestSeller: true,
  },
  {
    id: "6",
    title: "Goods Lifts",
    handle: "goods-lifts",
    thumbnail: "/products/goods_lifts.webp",
    price: { calculated_amount: 200000 },
    description: "Heavy-duty goods lift systems",
    isFavorite: false,
    isNew: true,
    isBestSeller: false,
  },
]

export const demoCategories = [
  {
    id: "cat-1",
    name: "Passenger Elevators",
    handle: "passenger-elevators",
    description: "Elevators designed for passenger transport",
    productCount: 45,
  },
  {
    id: "cat-2",
    name: "Freight Elevators",
    handle: "freight-elevators",
    description: "Heavy-duty elevators for cargo",
    productCount: 32,
  },
  {
    id: "cat-3",
    name: "Elevator Components",
    handle: "elevator-components",
    description: "Parts and accessories for elevators",
    productCount: 128,
  },
  {
    id: "cat-4",
    name: "Control Systems",
    handle: "control-systems",
    description: "Advanced elevator control systems",
    productCount: 56,
  },
]

export const demoApplications = [
  {
    id: "app-1",
    name: "Commercial Buildings",
    handle: "commercial-buildings",
    icon: "🏢",
    productCount: 78,
  },
  {
    id: "app-2",
    name: "Residential Complexes",
    handle: "residential-complexes",
    icon: "🏘️",
    productCount: 65,
  },
  {
    id: "app-3",
    name: "Healthcare Facilities",
    handle: "healthcare-facilities",
    icon: "🏥",
    productCount: 42,
  },
  {
    id: "app-4",
    name: "Industrial Sites",
    handle: "industrial-sites",
    icon: "🏭",
    productCount: 38,
  },
]

export const demoRecentlyViewed = demoProducts.slice(0, 4)
export const demoRecommended = demoProducts.slice(2, 6)
export const demoBestSellers = demoProducts.filter(p => p.isBestSeller)
export const demoNewArrivals = demoProducts.filter(p => p.isNew)
export const demoFavorites = demoProducts.filter(p => p.isFavorite)

export const demoBusinessAnalytics = {
  totalOrders: 156,
  pendingQuotes: 12,
  monthlyRevenue: 4250000,
  activeProducts: 89,
}

export const demoVerificationStatus = {
  isVerified: false,
  status: "pending" as "pending" | "verified" | "rejected",
  submittedDate: "2024-11-15",
  documentsRequired: ["GST Certificate", "Business License"],
}

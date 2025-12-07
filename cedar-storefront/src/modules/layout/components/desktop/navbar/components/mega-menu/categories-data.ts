import { 
  Cpu, DoorOpen, ToggleLeft, Shield, Wrench, Tablet, 
  Wifi, Plug, ShieldAlert, Monitor, Battery, Hammer 
} from "lucide-react"

export interface CategoryData {
  id: string
  name: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  bgColor: string
  subcategories: Array<{
    name: string
    image: string
    tag?: string
  }>
}

export const elevatorCategories: CategoryData[] = [
  {
    id: "control-panels",
    name: "Control Panels",
    icon: Cpu,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    subcategories: [
      { name: "Basic Control Panels", image: "/api/placeholder/120/80", tag: "Popular" },
      { name: "Digital Control Systems", image: "/api/placeholder/120/80", tag: "New" },
      { name: "Smart Control Panels", image: "/api/placeholder/120/80", tag: "Hot" },
      { name: "Retrofit Control Kits", image: "/api/placeholder/120/80" },
      { name: "Emergency Control Units", image: "/api/placeholder/120/80" },
      { name: "Fire Service Controls", image: "/api/placeholder/120/80" }
    ]
  },
  {
    id: "door-operators",
    name: "Door Operators",
    icon: DoorOpen,
    color: "text-green-600",
    bgColor: "bg-green-50",
    subcategories: [
      { name: "Automatic Door Operators", image: "/api/placeholder/120/80", tag: "Best Seller" },
      { name: "Manual Door Systems", image: "/api/placeholder/120/80" },
      { name: "Heavy-Duty Operators", image: "/api/placeholder/120/80", tag: "Industrial" },
      { name: "Door Sensors & Safety", image: "/api/placeholder/120/80" },
      { name: "Door Locks & Hardware", image: "/api/placeholder/120/80" },
      { name: "Door Control Panels", image: "/api/placeholder/120/80" }
    ]
  },
  {
    id: "limit-switches",
    name: "Limit Switches",
    icon: ToggleLeft,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    subcategories: [
      { name: "Hoistway Limit Switches", image: "/api/placeholder/120/80" },
      { name: "Door Zone Switches", image: "/api/placeholder/120/80", tag: "Essential" },
      { name: "Position Sensors", image: "/api/placeholder/120/80" },
      { name: "Safety Limit Switches", image: "/api/placeholder/120/80" },
      { name: "Magnetic Switches", image: "/api/placeholder/120/80" },
      { name: "Proximity Sensors", image: "/api/placeholder/120/80" }
    ]
  },
  {
    id: "ard-systems",
    name: "ARD Systems",
    icon: Shield,
    color: "text-red-600",
    bgColor: "bg-red-50",
    subcategories: [
      { name: "Single-Phase ARD", image: "/api/placeholder/120/80" },
      { name: "Three-Phase ARD", image: "/api/placeholder/120/80", tag: "Professional" },
      { name: "ARD Batteries", image: "/api/placeholder/120/80" },
      { name: "Complete ARD Kits", image: "/api/placeholder/120/80", tag: "Bundle" },
      { name: "ARD Testing Equipment", image: "/api/placeholder/120/80" },
      { name: "Emergency Lighting", image: "/api/placeholder/120/80" }
    ]
  },
  {
    id: "guide-shoes",
    name: "Guide Shoes",
    icon: Wrench,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    subcategories: [
      { name: "Car Guide Shoes", image: "/api/placeholder/120/80" },
      { name: "Counterweight Shoes", image: "/api/placeholder/120/80" },
      { name: "Roller Guide Shoes", image: "/api/placeholder/120/80", tag: "Smooth" },
      { name: "Lubrication Systems", image: "/api/placeholder/120/80" },
      { name: "Guide Rails", image: "/api/placeholder/120/80" },
      { name: "Mounting Hardware", image: "/api/placeholder/120/80" }
    ]
  },
  {
    id: "lop-cop-units",
    name: "LOP/COP Units",
    icon: Tablet,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    subcategories: [
      { name: "Landing Operating Panels", image: "/api/placeholder/120/80" },
      { name: "Car Operating Panels", image: "/api/placeholder/120/80", tag: "Premium" },
      { name: "Call Buttons", image: "/api/placeholder/120/80" },
      { name: "Floor Indicators", image: "/api/placeholder/120/80" },
      { name: "Emergency Phones", image: "/api/placeholder/120/80" },
      { name: "Accessibility Features", image: "/api/placeholder/120/80" }
    ]
  },
  {
    id: "sensors-encoders",
    name: "Sensors & Encoders",
    icon: Wifi,
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    subcategories: [
      { name: "Infrared Sensors", image: "/api/placeholder/120/80" },
      { name: "Magnetic Encoders", image: "/api/placeholder/120/80", tag: "Precision" },
      { name: "Proximity Sensors", image: "/api/placeholder/120/80" },
      { name: "Absolute Encoders", image: "/api/placeholder/120/80", tag: "Advanced" },
      { name: "Load Sensors", image: "/api/placeholder/120/80" },
      { name: "Speed Sensors", image: "/api/placeholder/120/80" }
    ]
  },
  {
    id: "wiring-accessories",
    name: "Wiring & Accessories",
    icon: Plug,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    subcategories: [
      { name: "Traveling Cables", image: "/api/placeholder/120/80" },
      { name: "Wire Harnesses", image: "/api/placeholder/120/80" },
      { name: "Cable Ducts", image: "/api/placeholder/120/80" },
      { name: "Connectors & Terminals", image: "/api/placeholder/120/80", tag: "Quality" },
      { name: "Junction Boxes", image: "/api/placeholder/120/80" },
      { name: "Cable Management", image: "/api/placeholder/120/80" }
    ]
  },
  {
    id: "safety-brakes",
    name: "Safety & Brakes",
    icon: ShieldAlert,
    color: "text-red-700",
    bgColor: "bg-red-50",
    subcategories: [
      { name: "Safety Gears", image: "/api/placeholder/120/80", tag: "Critical" },
      { name: "Buffer Systems", image: "/api/placeholder/120/80" },
      { name: "Overspeed Governors", image: "/api/placeholder/120/80" },
      { name: "Brake Systems", image: "/api/placeholder/120/80", tag: "Reliable" },
      { name: "Safety Switches", image: "/api/placeholder/120/80" },
      { name: "Emergency Stops", image: "/api/placeholder/120/80" }
    ]
  },
  {
    id: "display-signage",
    name: "Display & Signage",
    icon: Monitor,
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    subcategories: [
      { name: "Dot-Matrix Displays", image: "/api/placeholder/120/80" },
      { name: "LED Indicators", image: "/api/placeholder/120/80", tag: "Bright" },
      { name: "Direction Arrows", image: "/api/placeholder/120/80" },
      { name: "Floor Displays", image: "/api/placeholder/120/80" },
      { name: "Emergency Signage", image: "/api/placeholder/120/80" },
      { name: "Custom Displays", image: "/api/placeholder/120/80" }
    ]
  },
  {
    id: "power-backup",
    name: "Power & Backup",
    icon: Battery,
    color: "text-green-700",
    bgColor: "bg-green-50",
    subcategories: [
      { name: "Inverters & UPS", image: "/api/placeholder/120/80" },
      { name: "Backup Batteries", image: "/api/placeholder/120/80", tag: "Long Life" },
      { name: "Power Modules", image: "/api/placeholder/120/80" },
      { name: "Transformers", image: "/api/placeholder/120/80" },
      { name: "Power Distribution", image: "/api/placeholder/120/80" },
      { name: "Emergency Power", image: "/api/placeholder/120/80" }
    ]
  },
  {
    id: "tools-installation",
    name: "Tools & Installation",
    icon: Hammer,
    color: "text-gray-700",
    bgColor: "bg-gray-50",
    subcategories: [
      { name: "Mounting Kits", image: "/api/placeholder/120/80" },
      { name: "Installation Tools", image: "/api/placeholder/120/80", tag: "Professional" },
      { name: "Testing Equipment", image: "/api/placeholder/120/80" },
      { name: "Calibration Tools", image: "/api/placeholder/120/80" },
      { name: "Service Manuals", image: "/api/placeholder/120/80" },
      { name: "Safety Equipment", image: "/api/placeholder/120/80" }
    ]
  }
]

export function getProductsForCategory(categoryId: string) {
  const baseProducts = [
    { id: 1, name: "Advanced Control Panel CP-2000", image: "https://picsum.photos/200/200?random=1", price: "₹18,500" },
    { id: 2, name: "Smart Door Operator DO-300", image: "https://picsum.photos/200/200?random=2", price: "₹28,000" },
    { id: 3, name: "Magnetic Limit Switch LS-Pro", image: "https://picsum.photos/200/200?random=3", price: "₹4,500" },
    { id: 4, name: "ARD System 3-Phase Kit", image: "https://picsum.photos/200/200?random=4", price: "₹45,000" },
  ]
  
  return baseProducts.map((product, index) => ({
    ...product,
    id: `${categoryId}-${product.id}`,
    name: `${product.name} - ${categoryId}`,
    image: `https://picsum.photos/200/200?random=${categoryId}-${index}`
  }))
}

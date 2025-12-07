/**
 * Demo Product Detail Page Data
 * Used for development and testing
 */

export const demoPDPData = {
  id: "demo-product-1",
  handle: "premium-elevator-control-panel-cp-2000",
  title: "Premium Elevator Control Panel - Model CP-2000",
  description: "Advanced microprocessor-based elevator control panel designed for smooth and efficient operation. Features include energy-saving mode, emergency backup, and comprehensive safety protocols. Perfect for commercial and residential applications.",
  thumbnail: "/products/commercial_elevators.webp",
  
  images: [
    { url: "/products/commercial_elevators.webp", id: "img1" },
    { url: "/products/residential_lifts.webp", id: "img2" },
    { url: "/products/hospital_lifts.webp", id: "img3" },
    { url: "/products/goods_lifts.webp", id: "img4" },
  ],

  variants: [
    {
      id: "v1",
      title: "Standard",
      calculated_price: {
        calculated_amount: 45000,
        original_amount: 55000,
      },
      inventory_quantity: 10,
    },
  ],

  categories: [
    {
      id: "cat1",
      name: "Control Panels",
      handle: "control-panels",
    },
  ],

  metadata: {
    sku: "CP-2000-PRO",
    brand: "Cedar Elevators",
    rating: {
      average: 4.8,
      count: 127,
    },
    discount: 18,
    inStock: true,

    badges: ["bestseller", "verified", "featured"],

    features: [
      "Microprocessor-based control system",
      "Energy-efficient operation",
      "Emergency backup power support",
      "LCD display with diagnostic information",
      "Overload protection",
      "Fire service operation mode",
      "ISO 9001:2015 certified",
      "2-year comprehensive warranty",
    ],

    specifications: [
      { label: "Voltage", value: "220V AC / 50Hz" },
      { label: "Power Consumption", value: "150W" },
      { label: "Operating Temperature", value: "-10°C to 50°C" },
      { label: "Dimensions", value: "450mm x 350mm x 150mm" },
      { label: "Weight", value: "8.5 kg" },
      { label: "Protection Rating", value: "IP54" },
      { label: "Certification", value: "ISO 9001:2015, CE" },
      { label: "Load Capacity", value: "Up to 1000 kg" },
      { label: "Speed Range", value: "0.5 - 2.5 m/s" },
    ],

    variants: [
      {
        type: "Model",
        options: [
          { id: "v1", name: "Standard", value: "Standard", inStock: true },
          { id: "v2", name: "Pro", value: "Pro", inStock: true },
          { id: "v3", name: "Enterprise", value: "Enterprise", inStock: false },
        ]
      }
    ],

    resources: [
      { name: "Installation Manual", type: "PDF", size: "2.5 MB", url: "#" },
      { name: "Technical Datasheet", type: "PDF", size: "1.2 MB", url: "#" },
      { name: "Wiring Diagram", type: "PDF", size: "800 KB", url: "#" },
      { name: "Maintenance Guide", type: "PDF", size: "1.8 MB", url: "#" },
    ],

    testimonials: [
      {
        id: 1,
        author: "Rajesh Kumar",
        role: "Facility Manager",
        company: "Tech Park Mumbai",
        rating: 5,
        date: "2024-11-15",
        title: "Excellent Control Panel",
        comment: "This control panel has been working flawlessly for the past 6 months. The installation was straightforward and the diagnostic display is very helpful for maintenance. Highly recommended for commercial buildings.",
        verified: true,
        avatar: "RK",
      },
      {
        id: 2,
        author: "Priya Sharma",
        role: "Property Manager",
        company: "Residential Complex",
        rating: 5,
        date: "2024-10-28",
        title: "Great Quality and Reliability",
        comment: "We installed this in our residential complex and it's been excellent. The energy-saving mode has reduced our electricity costs significantly. Customer support from Cedar Elevators is also top-notch.",
        verified: true,
        avatar: "PS",
      },
      {
        id: 3,
        author: "Mohammed Ali",
        role: "Maintenance Engineer",
        company: "Commercial Tower",
        rating: 4,
        date: "2024-10-10",
        title: "Good Product, Minor Issues",
        comment: "Overall a solid control panel. The only issue we faced was during initial setup with the LCD display calibration, but the technical team helped us resolve it quickly. Works great now.",
        verified: true,
        avatar: "MA",
      },
    ],

    faqs: [
      {
        id: 1,
        question: "What is the warranty period?",
        answer: "The CP-2000 comes with a comprehensive 2-year warranty covering all manufacturing defects and component failures. Extended warranty options are available.",
      },
      {
        id: 2,
        question: "Is installation included?",
        answer: "Installation services are available at an additional cost. Our certified technicians can install and configure the control panel according to your specific requirements.",
      },
      {
        id: 3,
        question: "Does it support emergency backup power?",
        answer: "Yes, the CP-2000 has built-in support for emergency backup power systems. It automatically switches to backup power during outages to ensure safe operation.",
      },
      {
        id: 4,
        question: "What certifications does it have?",
        answer: "The control panel is ISO 9001:2015 certified and CE marked, meeting all international safety and quality standards for elevator control systems.",
      },
      {
        id: 5,
        question: "Can it be used for residential elevators?",
        answer: "Absolutely! The CP-2000 is designed for both commercial and residential applications. It's suitable for buildings with 2-20 floors.",
      },
    ],

    reviews: [
      {
        id: 1,
        author: "Rajesh Kumar",
        rating: 5,
        date: "2024-11-15",
        title: "Excellent Control Panel",
        comment: "This control panel has been working flawlessly for the past 6 months. The installation was straightforward and the diagnostic display is very helpful for maintenance. Highly recommended for commercial buildings.",
        verified: true,
      },
      {
        id: 2,
        author: "Priya Sharma",
        rating: 5,
        date: "2024-10-28",
        title: "Great Quality and Reliability",
        comment: "We installed this in our residential complex and it's been excellent. The energy-saving mode has reduced our electricity costs significantly. Customer support from Cedar Elevators is also top-notch.",
        verified: true,
      },
      {
        id: 3,
        author: "Mohammed Ali",
        rating: 4,
        date: "2024-10-10",
        title: "Good Product, Minor Issues",
        comment: "Overall a solid control panel. The only issue we faced was during initial setup with the LCD display calibration, but the technical team helped us resolve it quickly. Works great now.",
        verified: true,
      },
      {
        id: 4,
        author: "Anita Desai",
        rating: 5,
        date: "2024-09-22",
        title: "Perfect for Hospital Use",
        comment: "We use this in our hospital and the fire service operation mode is a critical feature for us. The panel is reliable and the emergency backup support gives us peace of mind.",
        verified: true,
      },
      {
        id: 5,
        author: "Vikram Singh",
        rating: 4,
        date: "2024-09-05",
        title: "Value for Money",
        comment: "Good control panel at a reasonable price. The build quality is solid and it handles our 8-floor building without any issues. Would have given 5 stars if the warranty was 3 years instead of 2.",
        verified: false,
      },
    ],
  },
}

export const demoRelatedProducts = [
  {
    id: "rp1",
    handle: "advanced-control-panel-cp-3000",
    title: "Advanced Control Panel CP-3000",
    thumbnail: "/products/commercial_elevators.webp",
    variants: [
      {
        calculated_price: {
          calculated_amount: 65000,
        },
      },
    ],
    metadata: {
      rating: { average: 4.9 },
    },
  },
  {
    id: "rp2",
    handle: "basic-control-panel-cp-1000",
    title: "Basic Control Panel CP-1000",
    thumbnail: "/products/residential_lifts.webp",
    variants: [
      {
        calculated_price: {
          calculated_amount: 35000,
        },
      },
    ],
    metadata: {
      rating: { average: 4.6 },
    },
  },
  {
    id: "rp3",
    handle: "smart-control-panel-cp-2500",
    title: "Smart Control Panel CP-2500",
    thumbnail: "/products/hospital_lifts.webp",
    variants: [
      {
        calculated_price: {
          calculated_amount: 52000,
        },
      },
    ],
    metadata: {
      rating: { average: 4.7 },
    },
  },
  {
    id: "rp4",
    handle: "industrial-control-panel-cp-4000",
    title: "Industrial Control Panel CP-4000",
    thumbnail: "/products/goods_lifts.webp",
    variants: [
      {
        calculated_price: {
          calculated_amount: 85000,
        },
      },
    ],
    metadata: {
      rating: { average: 4.8 },
    },
  },
]

export const demoBundleProducts = [
  {
    id: "fb1",
    handle: "door-operator-system",
    title: "Door Operator System",
    thumbnail: "/products/goods_lifts.webp",
    variants: [
      {
        calculated_price: {
          calculated_amount: 25000,
        },
      },
    ],
  },
  {
    id: "fb2",
    handle: "emergency-backup-battery",
    title: "Emergency Backup Battery",
    thumbnail: "/products/hydralic_lifts.webp",
    variants: [
      {
        calculated_price: {
          calculated_amount: 15000,
        },
      },
    ],
  },
  {
    id: "fb3",
    handle: "lcd-display-panel",
    title: "LCD Display Panel",
    thumbnail: "/products/hospital_lifts.webp",
    variants: [
      {
        calculated_price: {
          calculated_amount: 8000,
        },
      },
    ],
  },
]

/**
 * Get demo product data
 * Use this for development/testing
 */
export function getDemoPDPData() {
  return {
    product: demoPDPData,
    relatedProducts: demoRelatedProducts,
    bundleProducts: demoBundleProducts,
  }
}

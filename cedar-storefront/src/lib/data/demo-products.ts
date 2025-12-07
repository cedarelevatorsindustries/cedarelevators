import { HttpTypes } from "@medusajs/types"

// Demo products using images from public/products folder
export const demoProducts: Partial<HttpTypes.StoreProduct>[] = [
  {
    id: 'demo-1',
    title: 'Commercial Elevators',
    handle: 'commercial-elevators',
    description: 'High-capacity commercial elevators designed for office buildings, shopping malls, and commercial complexes. Features advanced safety systems and energy-efficient operation.',
    thumbnail: '/products/commercial_elevators.webp',
    status: 'published' as any,
    variants: [
      {
        id: 'variant-1',
        title: 'Standard',
        prices: [
          {
            amount: 4500000,
            currency_code: 'inr',
          } as any
        ],
      } as any
    ],
    metadata: {
      moq: '1 unit',
      verified: true,
    },
  },
  {
    id: 'demo-2',
    title: 'Goods Lifts',
    handle: 'goods-lifts',
    description: 'Heavy-duty goods lifts for industrial and warehouse applications. Designed to transport heavy materials and equipment safely and efficiently.',
    thumbnail: '/products/goods_lifts.webp',
    status: 'published' as any,
    variants: [
      {
        id: 'variant-2',
        title: 'Standard',
        prices: [
          {
            amount: 3200000,
            currency_code: 'inr',
          } as any
        ],
      } as any
    ],
    metadata: {
      moq: '1 unit',
      verified: true,
    },
  },
  {
    id: 'demo-3',
    title: 'Home Lifts',
    handle: 'home-lifts',
    description: 'Compact and elegant home lifts perfect for residential properties. Space-saving design with premium finishes and quiet operation.',
    thumbnail: '/products/home_lifts.webp',
    status: 'published' as any,
    variants: [
      {
        id: 'variant-3',
        title: 'Standard',
        prices: [
          {
            amount: 1800000,
            currency_code: 'inr',
          } as any
        ],
      } as any
    ],
    metadata: {
      moq: '1 unit',
      verified: true,
    },
  },
  {
    id: 'demo-4',
    title: 'Hospital Lifts',
    handle: 'hospital-lifts',
    description: 'Specialized hospital lifts with stretcher capacity and smooth operation. Designed for medical facilities with hygiene and safety as top priorities.',
    thumbnail: '/products/hospital_lifts.webp',
    status: 'published' as any,
    variants: [
      {
        id: 'variant-4',
        title: 'Standard',
        prices: [
          {
            amount: 5200000,
            currency_code: 'inr',
          } as any
        ],
      } as any
    ],
    metadata: {
      moq: '1 unit',
      verified: true,
    },
  },
  {
    id: 'demo-5',
    title: 'Hydraulic Lifts',
    handle: 'hydraulic-lifts',
    description: 'Reliable hydraulic lift systems for low to mid-rise buildings. Energy-efficient with smooth and quiet operation.',
    thumbnail: '/products/hydralic_lifts.webp',
    status: 'published' as any,
    variants: [
      {
        id: 'variant-5',
        title: 'Standard',
        prices: [
          {
            amount: 2800000,
            currency_code: 'inr',
          } as any
        ],
      } as any
    ],
    metadata: {
      moq: '1 unit',
      verified: true,
    },
  },
  {
    id: 'demo-6',
    title: 'Residential Lifts',
    handle: 'residential-lifts',
    description: 'Premium residential lifts for apartments and condominiums. Modern design with advanced safety features and customizable interiors.',
    thumbnail: '/products/residential_lifts.webp',
    status: 'published' as any,
    variants: [
      {
        id: 'variant-6',
        title: 'Standard',
        prices: [
          {
            amount: 3800000,
            currency_code: 'inr',
          } as any
        ],
      } as any
    ],
    metadata: {
      moq: '1 unit',
      verified: true,
    },
  },
]

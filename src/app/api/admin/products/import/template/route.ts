import { NextResponse } from 'next/server'

export async function GET() {
  const headers = [
    'product_title',
    'product_description',
    'short_description',
    'application_slug',
    'category_slug',
    'subcategory_slug',
    'elevator_type_slugs',
    'collection_slugs',
    'variant_title',
    'product_price',
    'product_mrp',
    'variant_sku',
    'variant_stock',
    'option1_name',
    'option1_value',
    'option2_name',
    'option2_value',
    'status'
  ].join(',')

  const sampleData = [
    // Product 1: Simple product
    [
      'Modern Cabin Fan',
      'High-performance cabin fan for modern elevators with silent operation.',
      'Silent cabin fan',
      'commercial-elevators',
      'spare-parts',
      'electrical-parts',
      'passenger-elevator',
      'best-sellers',
      'Standard',
      '2499',
      '3500',
      '', // Auto-generate SKU
      '50',
      '',
      '',
      '',
      '',
      'active'
    ].join(','),

    // Product 2: Product with variants (Row 1)
    [
      'Designer COP Panel',
      'Premium stainless steel car operating panel with tactile buttons.',
      'Premium COP Panel',
      'residential-elevators',
      'accessories',
      'operating-panels',
      'home-elevator|hospital-elevator',
      '',
      'Gold Finish',
      '15000',
      '18000',
      'COP-GLD-001', // Custom SKU
      '10',
      'Material',
      'Gold Steel',
      '',
      '',
      'active'
    ].join(','),

    // Product 2: Product with variants (Row 2) - same product title
    [
      'Designer COP Panel', // Same title = same product
      '', // Can remain empty, inherits from parent
      '', // Can remain empty, inherits from parent
      '', // Can remain empty, inherits from parent
      '', // Can remain empty, inherits from parent
      '', // Can remain empty, inherits from parent
      '', // Can remain empty, inherits from parent
      '',
      'Silver Finish',
      '12000',
      '15000',
      'COP-SLV-002',
      '15',
      'Material',
      'Silver Steel',
      '',
      '',
      'active'
    ].join(','),

    // Product 3: Draft product
    [
      'Maintenance Kit Pro',
      'Complete maintenance kit for monthly service.',
      'Service Kit',
      'industrial-elevators',
      'maintenance',
      'tools',
      'freight-elevator',
      'new-arrivals',
      'Standard Box',
      '5000',
      '6500',
      '',
      '100',
      '',
      '',
      '',
      '',
      'draft'
    ].join(',')
  ].join('\n')

  const csvContent = `${headers}\n${sampleData}`

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="product-import-template.csv"',
    },
  })
}

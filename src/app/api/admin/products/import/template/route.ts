import { NextResponse } from 'next/server'

/**
 * GET /api/admin/products/import/template
 * Downloads CSV template for bulk product import
 */
export async function GET() {
  try {
    // Define CSV headers (comprehensive template)
    const headers = [
      // Product-level fields (REQUIRED)
      'product_title',
      'short_description',
      'brief_description',
      'application_slug',
      'category_slug',
      'subcategory_slug',
      'elevator_types',
      'collections',
      'product_price',
      'product_mrp',
      'track_inventory',
      'product_stock',
      'status',
      
      // Variant-level fields (OPTIONAL)
      'variant_title',
      'variant_option_1_name',
      'variant_option_1_value',
      'variant_option_2_name',
      'variant_option_2_value',
      'variant_price',
      'variant_mrp',
      'variant_stock',
      
      // Metadata (OPTIONAL)
      'attributes'
    ]
    
    // Example rows to guide users
    const examples = [
      // Example 1: Product with 2 variants (Capacity + Voltage)
      [
        'VVVF Elevator Motor',
        'High-efficiency VVVF motor for passenger elevators',
        'Variable Voltage Variable Frequency (VVVF) motor with advanced control system for smooth operation and energy efficiency.',
        'motors',
        'traction-motors',
        'vvvf-motors',
        'passenger,commercial',
        'featured,best-sellers',
        '45000',
        '50000',
        'true',
        '50',
        'active',
        '1000kg / 415V',
        'Capacity',
        '1000kg',
        'Voltage',
        '415V',
        '45000',
        '50000',
        '50',
        '{"controller":"VVVF","speed":"1.5 m/s","efficiency":"95%"}'
      ],
      [
        'VVVF Elevator Motor',
        'High-efficiency VVVF motor for passenger elevators',
        'Variable Voltage Variable Frequency (VVVF) motor with advanced control system for smooth operation and energy efficiency.',
        'motors',
        'traction-motors',
        'vvvf-motors',
        'passenger,commercial',
        'featured,best-sellers',
        '45000',
        '50000',
        'true',
        '50',
        'active',
        '1500kg / 415V',
        'Capacity',
        '1500kg',
        'Voltage',
        '415V',
        '48000',
        '53000',
        '30',
        '{"controller":"VVVF","speed":"1.5 m/s","efficiency":"95%"}'
      ],
      
      // Example 2: Simple product without variants
      [
        'Elevator Door Sensor',
        'Infrared safety sensor for elevator doors',
        'High-precision infrared sensor with 10mm detection range. Ensures passenger safety by preventing door closure when obstruction detected.',
        'safety-devices',
        'sensors',
        'door-sensors',
        'passenger,commercial,residential',
        '',
        '2500',
        '3000',
        'true',
        '200',
        'active',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '{"detection_range":"10mm","response_time":"20ms","voltage":"24V DC"}'
      ],
      
      // Example 3: Product with single option (Capacity only)
      [
        'Elevator Guide Rail',
        'T-type guide rails for smooth elevator travel',
        'High-strength T-type guide rails manufactured from cold-drawn steel. Ensures smooth and stable elevator cabin movement.',
        'mechanical-components',
        'guide-rails',
        't-type-rails',
        'passenger,freight',
        'new-arrivals',
        '8000',
        '9000',
        'true',
        '100',
        'active',
        '5 meters',
        'Length',
        '5m',
        '',
        '',
        '8000',
        '9000',
        '100',
        '{"material":"Cold-drawn steel","weight_per_meter":"24kg"}'
      ],
      [
        'Elevator Guide Rail',
        'T-type guide rails for smooth elevator travel',
        'High-strength T-type guide rails manufactured from cold-drawn steel. Ensures smooth and stable elevator cabin movement.',
        'mechanical-components',
        'guide-rails',
        't-type-rails',
        'passenger,freight',
        'new-arrivals',
        '8000',
        '9000',
        'true',
        '100',
        'active',
        '10 meters',
        'Length',
        '10m',
        '',
        '',
        '15000',
        '17000',
        '50',
        '{"material":"Cold-drawn steel","weight_per_meter":"24kg"}'
      ]
    ]
    
    // Convert to CSV format
    const csvRows = [
      headers.join(','),
      ...examples.map(row => 
        row.map(cell => {
          // Escape cells containing commas, quotes, or newlines
          const cellStr = String(cell)
          if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
            return `"${cellStr.replace(/"/g, '""')}"`
          }
          return cellStr
        }).join(',')
      )
    ]
    
    const csvContent = csvRows.join('\n')
    
    // Return as downloadable file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="product-import-template.csv"',
        'Cache-Control': 'no-cache'
      }
    })
    
  } catch (error) {
    console.error('Error generating CSV template:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSV template' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/admin/products/import/preview
 * Validates CSV (name-based) and returns preview of products to be imported
 */
export async function POST(request: NextRequest) {
  console.log('==========================================')
  console.log('[CSV Preview API] POST request received - SIMPLE TEST')
  console.log('==========================================')

  try {
    // Parse formData
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    console.log('[CSV Preview API] File received:', file.name, file.size, 'bytes')

    // Read file content as text
    const fileContent = await file.text()
    console.log('[CSV Preview API] File content length:', fileContent.length)

    // Return a simple test response
    return NextResponse.json({
      success: true,
      message: 'API is working!',
      fileName: file.name,
      fileSize: file.size,
      contentLength: fileContent.length,
      firstLine: fileContent.split('\n')[0]
    })

  } catch (error) {
    console.error('[CSV Preview API] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

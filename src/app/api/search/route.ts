import { NextRequest, NextResponse } from 'next/server'
import { searchProducts } from '@/lib/actions/products/search'

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const query = searchParams.get('q') || ''
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = parseInt(searchParams.get('offset') || '0')

        const result = await searchProducts(query, limit, offset)

        return NextResponse.json(result)
    } catch (error: any) {
        console.error('[Search API] Error:', error)
        return NextResponse.json(
            { success: false, results: [], total: 0, error: error.message },
            { status: 500 }
        )
    }
}

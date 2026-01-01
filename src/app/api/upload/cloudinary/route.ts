import { NextRequest, NextResponse } from 'next/server'
import { cloudinary } from '@/lib/cloudinary/config'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const folder = formData.get('folder') as string || 'uploads'

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            )
        }

        // Convert File to base64
        const arrayBuffer = await file.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const uploadData = `data:${file.type};base64,${buffer.toString('base64')}`

        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(uploadData, {
            folder,
            resource_type: 'auto',
            transformation: [
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        })

        // Extract public ID from URL
        const urlParts = result.secure_url.split('/')
        const filenamePart = urlParts[urlParts.length - 1]
        const publicId = `${folder}/${filenamePart.split('.')[0]}`

        return NextResponse.json({
            success: true,
            url: result.secure_url,
            publicId
        })
    } catch (error: any) {
        console.error('Cloudinary upload API error:', error)
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}

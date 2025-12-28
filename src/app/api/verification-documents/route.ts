import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { document_type, file_name, file_url, file_size, mime_type } = body

    if (!document_type || !file_name || !file_url) {
      return NextResponse.json(
        { error: 'document_type, file_name, and file_url are required' },
        { status: 400 }
      )
    }

    const supabase = await createClerkSupabaseClient()

    // Insert verification document
    const { data, error } = await supabase
      .from('verification_documents')
      .insert({
        user_id: userId,
        document_type,
        file_name,
        file_url,
        file_size,
        mime_type,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Error uploading document:', error)
      return NextResponse.json(
        { error: 'Failed to upload document' },
        { status: 500 }
      )
    }

    // Update profile verification status to pending
    await supabase
      .from('profiles')
      .update({ verification_status: 'pending' })
      .eq('user_id', userId)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in upload-verification:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClerkSupabaseClient()

    const { data, error } = await supabase
      .from('verification_documents')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error in get verification documents:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

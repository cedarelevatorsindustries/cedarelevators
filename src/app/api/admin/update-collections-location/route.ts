import { NextResponse } from "next/server"
import { createClerkSupabaseClient } from "@/lib/supabase/server"

export async function GET() {
    try {
        const supabase = await createClerkSupabaseClient()
        const slugs = ["new-arrivals", "trending", "top-applications", "best-seller"]

        // Update display_location to ["House"] for these collections
        const { data, error } = await supabase
            .from('collections')
            .update({ display_location: ["House"] })
            .in('slug', slugs)
            .select()

        if (error) throw error

        return NextResponse.json({ success: true, updated: data })
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 })
    }
}

import { NextResponse } from "next/server"
import { getUserType } from "@/lib/auth/server"

export async function GET() {
  try {
    const userType = await getUserType()
    return NextResponse.json({ userType })
  } catch (error) {
    return NextResponse.json({ userType: "guest" })
  }
}

import { NextResponse } from "next/server"
import { getUserType, getBusinessVerificationStatus } from "@/lib/auth/server"

export async function GET() {
  try {
    const userType = await getUserType()
    const verificationStatus = await getBusinessVerificationStatus()
    
    return NextResponse.json({ 
      userType,
      isVerified: verificationStatus.isVerified,
      verificationStatus: verificationStatus.status
    })
  } catch (error) {
    return NextResponse.json({ 
      userType: "guest",
      isVerified: false,
      verificationStatus: null
    })
  }
}


"use client"

import { useEffect, useState } from "react"

interface MobileDetectorProps {
  mobileComponent: () => React.ReactNode
  desktopComponent: () => React.ReactNode
}

export default function MobileDetector({ mobileComponent, desktopComponent }: MobileDetectorProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return null
  }

  return <>{isMobile ? mobileComponent() : desktopComponent()}</>
}


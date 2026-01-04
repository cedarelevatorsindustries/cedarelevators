"use client"

interface ShortDescriptionSectionProps {
  description: string
}

// This component is now integrated into TitleBadgesSection
// Kept for backward compatibility but renders nothing
export default function ShortDescriptionSection({ description }: ShortDescriptionSectionProps) {
  return null
}


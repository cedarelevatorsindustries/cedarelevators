"use client"

import Image from "next/image"

export function TrustBadges() {
  const badges = [
    {
      image: "/images/banners/footer/Industry grade quality.png",
      title: "Industry-Grade Quality",
      alt: "Industry-Grade Quality"
    },
    {
      image: "/images/banners/footer/Bulk order discount.png",
      title: "Bulk Order Discount",
      alt: "Bulk Order Discount"
    },
    {
      image: "/images/banners/footer/AMC friendly spars.png",
      title: "AMC Friendly Spares",
      alt: "AMC Friendly Spares"
    },
    {
      image: "/images/banners/footer/track your order.png",
      title: "Track Your Order",
      alt: "Track Your Order"
    },
    {
      image: "/images/banners/footer/secure payments.png",
      title: "Secure Payment",
      alt: "Secure Payment"
    }
  ]

  return (
    <div className="bg-blue-50 py-8">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="grid grid-cols-5 gap-8 text-center">
          {badges.map((badge, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="relative w-16 h-16 mb-3">
                <Image
                  src={badge.image}
                  alt={badge.alt}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="text-sm font-semibold text-gray-700">
                {badge.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


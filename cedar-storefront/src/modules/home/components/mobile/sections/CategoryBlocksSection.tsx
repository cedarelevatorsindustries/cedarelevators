"use client"

import { ArrowRight } from "lucide-react"
import LocalizedClientLink from "@components/ui/localized-client-link"

// Static category blocks for mobile navigation
const categories = [
  {
    title: "MOTORS",
    href: "/catalog?category=motors",
    backgroundImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyQ1_nuzeQF3DAa6rOJptrBCYiGKNUyU5z83nktfKC8RSReMjqphJKmzIzALb-T7JPZXqK2NS0sKtAaixmU4AqLXkvYmwMkF3GS7X_Mx4zwCXuoBxP9WpRMxHepJEiYl08_HjFvTs_34CncIW4WkKPkElRXWmAmQyeV76qm_XKfBGO0aAcSRprh0TmtvPIhcSraV1nHv66QCn2zoaXcKPGNxa_7uXn1Kk34oxTCU7zCPY4r9L6QwT97yOVV1NoQqqiyzUXWHiUPIs"
  },
  {
    title: "HYDRAULICS",
    href: "/catalog?category=hydraulics",
    backgroundImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyQ1_nuzeQF3DAa6rOJptrBCYiGKNUyU5z83nktfKC8RSReMjqphJKmzIzALb-T7JPZXqK2NS0sKtAaixmU4AqLXkvYmwMkF3GS7X_Mx4zwCXuoBxP9WpRMxHepJEiYl08_HjFvTs_34CncIW4WkKPkElRXWmAmQyeV76qm_XKfBGO0aAcSRprh0TmtvPIhcSraV1nHv66QCn2zoaXcKPGNxa_7uXn1Kk34oxTCU7zCPY4r9L6QwT97yOVV1NoQqqiyzUXWHiUPIs"
  },
  {
    title: "SAFETY DEVICES",
    href: "/catalog?category=safety-devices",
    backgroundImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyQ1_nuzeQF3DAa6rOJptrBCYiGKNUyU5z83nktfKC8RSReMjqphJKmzIzALb-T7JPZXqK2NS0sKtAaixmU4AqLXkvYmwMkF3GS7X_Mx4zwCXuoBxP9WpRMxHepJEiYl08_HjFvTs_34CncIW4WkKPkElRXWmAmQyeV76qm_XKfBGO0aAcSRprh0TmtvPIhcSraV1nHv66QCn2zoaXcKPGNxa_7uXn1Kk34oxTCU7zCPY4r9L6QwT97yOVV1NoQqqiyzUXWHiUPIs"
  },
  {
    title: "CONTROL SYSTEMS",
    href: "/catalog?category=control-systems",
    backgroundImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuDyQ1_nuzeQF3DAa6rOJptrBCYiGKNUyU5z83nktfKC8RSReMjqphJKmzIzALb-T7JPZXqK2NS0sKtAaixmU4AqLXkvYmwMkF3GS7X_Mx4zwCXuoBxP9WpRMxHepJEiYl08_HjFvTs_34CncIW4WkKPkElRXWmAmQyeV76qm_XKfBGO0aAcSRprh0TmtvPIhcSraV1nHv66QCn2zoaXcKPGNxa_7uXn1Kk34oxTCU7zCPY4r9L6QwT97yOVV1NoQqqiyzUXWHiUPIs"
  }
]

export default function CategoryBlocksSection() {
  return (
    <div className="px-4 pt-8 bg-white">
      <div className="grid grid-cols-2 gap-4">
        {categories.map((category, index) => (
          <LocalizedClientLink
            key={index}
            href={category.href}
            className="relative flex h-32 flex-col justify-end overflow-hidden rounded-lg p-3 text-white group"
          >
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.1) 100%), url('${category.backgroundImage}')`
              }}
            />
            <div className="relative z-10">
              <h4 className="font-bold text-sm">{category.title}</h4>
            </div>
            <ArrowRight className="absolute right-3 top-3 z-10 text-white/70 group-hover:text-white transition-colors" size={16} />
          </LocalizedClientLink>
        ))}
      </div>
    </div>
  )
}

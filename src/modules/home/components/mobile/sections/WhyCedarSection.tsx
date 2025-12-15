"use client"

import { Award, Shield, Globe, Headphones } from "lucide-react"

const features = [
  {
    icon: Award,
    title: "20+ Years Experience"
  },
  {
    icon: Shield,
    title: "ISO 9001 Certified"
  },
  {
    icon: Globe,
    title: "Global Shipping"
  },
  {
    icon: Headphones,
    title: "Expert Support"
  }
]

export default function WhyCedarSection() {
  return (
    <div className="px-4 py-8 bg-white">
      <h3 className="text-gray-900 text-lg font-bold leading-tight tracking-[-0.015em] pb-3 text-center">
        WHY CEDAR?
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <div key={index} className="flex flex-col items-center gap-2 rounded-lg bg-gray-50 p-4 text-center border border-gray-200">
            <feature.icon className="text-3xl text-primary" size={32} />
            <p className="text-sm font-medium text-gray-900">
              {feature.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

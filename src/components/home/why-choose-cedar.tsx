import { ShieldCheck, Layers, FileText, Truck } from "lucide-react"

const VALUE_PROPOSITIONS = [
  {
    icon: ShieldCheck,
    title: "Engineering-Grade Quality",
    description: "Verified product specifications and quality-focused component selection.",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100"
  },
  {
    icon: Layers,
    title: "Application-Based Sourcing",
    description: "Components organized around erection, testing and service requirements.",
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-100"
  },
  {
    icon: FileText,
    title: "Quotation Assistance",
    description: "Support for product identification and project-based enquiries.",
    iconColor: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100"
  },
  {
    icon: Truck,
    title: "Nationwide Reach",
    description: "Delivery coordination for customers across India.",
    iconColor: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-100"
  }
]

export function WhyChooseCedar() {
  return (
    <section id="why-choose" className="w-full py-10 sm:py-16 bg-white">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <h2 className="type-section text-zinc-900">
            Why Choose Cedar?
          </h2>
          <p className="type-body-sm text-zinc-600 mt-2">
            Reliable elevator components and sourcing support for your projects.
          </p>
        </div>

        {/* Full-Width 4-Column Grid with Minimal Padding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
          {VALUE_PROPOSITIONS.map((prop, idx) => {
            const Icon = prop.icon
            return (
              <div
                key={idx}
                className="bg-zinc-50/70 rounded-xl border border-zinc-200/80 p-4 sm:p-6 flex flex-col items-start"
              >
                <div className={`p-2.5 sm:p-3 rounded-lg ${prop.bgColor} border ${prop.borderColor} ${prop.iconColor} shadow-2xs mb-3 sm:mb-4`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-zinc-900 tracking-tight">
                  {prop.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 mt-1.5 leading-relaxed">
                  {prop.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default WhyChooseCedar

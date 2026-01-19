import { Metadata } from "next"
import Link from "next/link"
import { ShieldCheck, Globe, Wrench, Truck, Star, Package, Users, Award } from "lucide-react"
import { getWhyChoosePublicDataAction } from "@/lib/actions/why-choose-cms"

export const metadata: Metadata = {
    title: "Why Choose Cedar | Elevator Component Excellence",
    description: "Reliable components for safer elevators, delivered with transparency. Discover why Cedar is the trusted choice for premium elevator components.",
}

// Icon mapping for dynamic rendering
const iconMap: Record<string, any> = {
    ShieldCheck,
    Globe,
    Wrench,
    Truck,
    Star,
    Package,
    Users,
    Award
}

export default async function WhyChoosePage() {
    const { data } = await getWhyChoosePublicDataAction()

    // Fallback data if nothing is configured
    const hero = data?.hero || {
        title: "Why Choose Cedar",
        description: "Reliable components for safer elevators, delivered with transparency."
    }

    const items = data?.items || []
    const stats = data?.stats || []
    const cta = data?.cta || {
        title: "Ready to upgrade your infrastructure?",
        description: "Join hundreds of facility managers and OEMs who trust Cedar for precision-engineered components. Get a custom quote tailored to your project requirements today."
    }

    return (
        <div className="min-h-screen bg-[#f8f7f6]">
            {/* Hero Section */}
            <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden bg-white">
                <div className="max-w-[800px] mx-auto px-8 w-full text-center py-20">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ec9213]/10 border border-[#ec9213]/20">
                            <span className="text-[10px] font-black tracking-widest uppercase text-[#ec9213]">
                                TRUST & RELIABILITY
                            </span>
                        </div>

                        <h1 className="text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight text-[#1b160d]">
                            {hero.title}
                        </h1>

                        <p className="text-lg text-[#5a4a35] leading-relaxed max-w-2xl mx-auto">
                            {hero.description}
                        </p>
                    </div>
                </div>
            </section>

            {/* The Standard of Excellence Section */}
            <section className="py-24 bg-white">
                <div className="max-w-[1280px] mx-auto px-8">
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold tracking-tight mb-4">The Standard of Excellence</h2>
                        <div className="w-16 h-1 bg-[#ec9213]"></div>
                    </div>

                    {items.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">No excellence items configured</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {items.map((item) => {
                                const IconComponent = iconMap[item.icon] || Star

                                return (
                                    <div
                                        key={item.id}
                                        className="group p-10 rounded-xl border border-[#e7ddcf] bg-[#f8f7f6] hover:shadow-xl hover:border-[#ec9213]/30 transition-all"
                                    >
                                        <div className="size-14 rounded-lg bg-white flex items-center justify-center mb-6 shadow-sm text-[#ec9213] group-hover:scale-110 transition-transform">
                                            <IconComponent className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                                        <p className="text-[#5a4a35] leading-relaxed">{item.description}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Stats Section */}
            {stats.length > 0 && (
                <section className="py-24 bg-[#f8f7f6] border-y border-[#e7ddcf]">
                    <div className="max-w-[1280px] mx-auto px-8">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                            {stats.map((stat) => (
                                <div
                                    key={stat.id}
                                    className="flex flex-col items-center md:items-start text-center md:text-left gap-4"
                                >
                                    <div
                                        className="text-7xl font-extrabold font-display"
                                        style={{
                                            WebkitTextStroke: '1px #d1d5db',
                                            color: 'transparent'
                                        }}
                                    >
                                        {stat.number}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xl font-bold">{stat.title}</p>
                                        <p className="text-sm text-[#5a4a35]">{stat.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA Section */}
            <section className="py-32 bg-white overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
                    <h2 className="text-[20vw] font-black leading-none">CEDAR</h2>
                </div>

                <div className="max-w-[800px] mx-auto px-8 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
                        {cta.title}
                    </h2>
                    <p className="text-lg text-[#5a4a35] mb-12 leading-relaxed">
                        {cta.description}
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Link
                            href="/catalog"
                            className="w-full sm:w-auto px-10 py-5 bg-[#ec9213] text-white font-black rounded-lg shadow-xl shadow-[#ec9213]/20 hover:scale-105 active:scale-95 transition-all"
                        >
                            View Products
                        </Link>
                        <Link
                            href="/quotes/new"
                            className="w-full sm:w-auto px-10 py-5 border-2 border-[#2b4c7e] text-[#2b4c7e] font-black rounded-lg hover:bg-[#2b4c7e] hover:text-white transition-all"
                        >
                            Request a Quote
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}

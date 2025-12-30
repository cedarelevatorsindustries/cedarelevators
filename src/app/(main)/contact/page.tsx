import { Metadata } from "next"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { ContactRouting } from "./contact-routing"

export const metadata: Metadata = {
    title: "Contact Us | Cedar Elevators",
    description: "Get in touch with our team via WhatsApp, Email, or Phone.",
}

export default function ContactPage() {
    return (
        <div className="bg-white min-h-screen pb-16">
            {/* Header */}
            <div className="bg-gray-50 border-b border-gray-200 py-12 px-4">
                <div className="container mx-auto max-w-4xl text-center">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-4">
                        Contact Us
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Real humans, engineering expertise. Reach out to us directly.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl mt-12">
                <div className="grid lg:grid-cols-2 gap-12">

                    {/* Left Column: Direct Methods */}
                    <div className="space-y-10">
                        <section>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Primary Contact Methods</h2>
                            <div className="grid gap-4">
                                {/* WhatsApp */}
                                <a
                                    href="https://wa.me/917299012340"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 p-5 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition-colors group"
                                >
                                    <div className="bg-green-500 text-white p-3 rounded-full">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" className="w-6 h-6 fill-current">
                                            <path d="M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-green-700">Chat on WhatsApp</h3>
                                        <p className="text-sm text-gray-600">Fastest response (9 AM - 7 PM)</p>
                                    </div>
                                </a>

                                {/* Email */}
                                <a
                                    href="mailto:contact@cedarelevator.com"
                                    className="flex items-center gap-4 p-5 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                                >
                                    <div className="bg-gray-100 text-gray-600 p-3 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">Email Support</h3>
                                        <p className="text-sm text-gray-600">contact@cedarelevator.com</p>
                                    </div>
                                </a>

                                {/* Phone */}
                                <a
                                    href="tel:+icon-917299012340"
                                    className="flex items-center gap-4 p-5 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                                >
                                    <div className="bg-gray-100 text-gray-600 p-3 rounded-full group-hover:bg-orange-100 group-hover:text-orange-600">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-700">Phone Support</h3>
                                        <p className="text-sm text-gray-600">+91 72990 12340 (Mon-Sat)</p>
                                    </div>
                                </a>
                            </div>
                        </section>

                        {/* Smart Routing */}
                        <section>
                            <ContactRouting />
                        </section>
                    </div>

                    {/* Right Column: Address & Map */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
                        {/* Mock Map */}
                        <div className="h-64 bg-gray-100 w-full flex items-center justify-center relative">
                            <MapPin size={48} className="text-orange-600" />
                            <span className="absolute bottom-4 text-xs text-gray-500 font-semibold uppercase tracking-widest">Chennai HQ Map</span>
                        </div>

                        <div className="p-8 space-y-6">
                            <div>
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                                    <MapPin size={18} className="text-gray-400" />
                                    Visit Us
                                </h3>
                                <p className="text-gray-600 leading-relaxed pl-7">
                                    67/37 North Mada Street, Padi,<br />
                                    Chennai - 600050, Tamil Nadu, India
                                </p>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                                    <Clock size={18} className="text-gray-400" />
                                    Business Hours
                                </h3>
                                <div className="pl-7 space-y-1 text-sm text-gray-600">
                                    <div className="flex justify-between max-w-xs">
                                        <span>Monday - Saturday:</span>
                                        <span className="font-medium text-gray-900">9:30 AM - 7:00 PM</span>
                                    </div>
                                    <div className="flex justify-between max-w-xs text-gray-400">
                                        <span>Sunday:</span>
                                        <span>Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'

interface FAQItem {
  question: string
  answer: string
}

const FAQS: FAQItem[] = [
  {
    question: "What products does Cedar Elevators offer?",
    answer:
      "Cedar Elevators supplies essential elevator components across electrical, mechanical, and safety categories, including door operators, guide shoes, travelling cables, safety gears, limit switches, and inspection equipment."
  },
  {
    question: "Can I enquire about an individual product?",
    answer:
      "Yes. You can submit an enquiry for any individual component directly from its product details page with your specific requirements."
  },
  {
    question: "How can I request a quotation?",
    answer:
      "You can request a quotation by using our Request a Quote form, submitting an enquiry from any product page, or contacting our team directly via WhatsApp or email."
  },
  {
    question: "Do I need an account to submit an enquiry?",
    answer:
      "No account is required. Elevator contractors, technicians, project managers, and building owners can browse the catalogue and submit quotation enquiries without creating an account or logging in."
  },
  {
    question: "Can I enquire about multiple products?",
    answer:
      "Yes. You can compile multiple components into a single enquiry list or submit a complete project requirement schedule through our Request a Quote form."
  },
  {
    question: "Does Cedar provide delivery across India?",
    answer:
      "Yes. We coordinate dispatch and delivery of elevator components to project sites and workshops across India through reliable logistics partners."
  }
]

export function FaqAccordion() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0)

  const handleClick = (index: number) => {
    if (activeIndex === index) {
      setActiveIndex(null)
    } else {
      setActiveIndex(index)
    }
  }

  return (
    <section id="faq" className="w-full py-10 sm:py-16 bg-white">
      <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <h2 className="type-section text-zinc-900">
            Frequently Asked Questions
          </h2>
          <p className="type-body-sm text-zinc-600 mt-2">
            Find answers to common questions about our products and quotation process.
          </p>
        </div>

        {/* Full-Width Accordion List with Minimal Left/Right Padding */}
        <div className="w-full border border-zinc-200/80 rounded-xl p-2 sm:p-3 bg-zinc-50/70 shadow-2xs">
          {FAQS.map((faq, index) => {
            const isOpen = activeIndex === index

            return (
              <motion.div
                key={faq.question}
                className={`overflow-hidden transition-colors ${
                  isOpen ? 'bg-white/80 rounded-lg' : ''
                } ${index !== FAQS.length - 1 ? 'border-b border-zinc-200/80' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => handleClick(index)}
                  className="p-3.5 sm:p-4 px-3 w-full cursor-pointer text-xs sm:text-sm md:text-base items-center transition-all font-semibold text-zinc-900 flex gap-3 text-left hover:text-blue-600 min-h-[48px]"
                  aria-expanded={isOpen}
                >
                  <Plus
                    className={`${
                      isOpen ? 'rotate-45 text-orange-600' : 'rotate-0 text-blue-600'
                    } transition-transform duration-200 ease-in-out w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0`}
                  />
                  <span>{faq.question}</span>
                </button>

                <AnimatePresence mode="sync">
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.28,
                        ease: 'easeInOut',
                      }}
                    >
                      <p className="text-zinc-600 p-3 sm:p-4 pt-0 text-xs sm:text-sm leading-relaxed pl-10 sm:pl-11 pr-4 sm:pr-6">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default FaqAccordion

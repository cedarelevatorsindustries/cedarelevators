"use client"

import Image from "next/image"
import { ChevronUp } from "lucide-react"

export function FooterBottom() {
  return (
    <div className="bg-white border-t border-gray-200 py-4">
      <div className="max-w-[1440px] mx-auto px-6">
        <div className="flex items-center justify-start gap-6">
          {/* Copyright Notice */}
          <div className="text-sm text-gray-700">
            © 2025 Cedar Elevators Industries. All Rights Reserved.
          </div>
          
          {/* Pipeline Symbol */}
          <div className="text-gray-400">|</div>
          
          {/* Payment Methods */}
          <div className="flex items-center gap-3">
            <a href="https://razorpay.com/" target="_blank" rel="noopener noreferrer">
              <img 
                referrerPolicy="origin" 
                src="https://badges.razorpay.com/badge-light.png " 
                style={{ height: '30px', width: '75px' }} 
                alt="Razorpay | Payment Gateway | Neobank"
              />
            </a>
            <Image 
              src="/payment-icons/rupay_icon.png" 
              alt="RuPay" 
              width={35} 
              height={24}
              className="h-12 w-auto"
            />
            <Image 
              src="/payment-icons/upi.svg" 
              alt="UPI" 
              width={35} 
              height={24}
              className="h-6 w-auto"
            />
            <Image 
              src="/payment-icons/google-pay.png" 
              alt="Google Pay" 
              width={35} 
              height={24}
              className="h-12 w-auto"
            />
            <Image 
              src="/payment-icons/visa_icon.png" 
              alt="Visa" 
              width={35} 
              height={24}
              className="h-12 w-auto"
            />
          </div>
          
          {/* Right: Back to Top + Credit - Pushed to far right */}
          <div className="ml-auto flex items-center gap-4">
            {/* Back to Top Button */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
              aria-label="Back to top"
            >
              <ChevronUp size={20} />
            </button>
            
            {/* Credit */}
            <div className="text-sm text-gray-700">
              Crafted by <a href="https://mergex.in" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors">Mergex</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


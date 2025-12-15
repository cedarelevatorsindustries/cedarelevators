"use client"

import { useEffect } from 'react'
import { MessageCircle } from 'lucide-react'

interface TawkChatProps {
  quoteId?: string
  userName?: string
  userEmail?: string
}

export default function TawkChat({ quoteId, userName, userEmail }: TawkChatProps) {
  useEffect(() => {
    // Tawk.to script injection
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://embed.tawk.to/YOUR_PROPERTY_ID/YOUR_WIDGET_ID'
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')
    
    // Add script to document
    document.body.appendChild(script)

    // Configure Tawk.to with user data
    script.onload = () => {
      if (typeof window !== 'undefined' && (window as any).Tawk_API) {
        const Tawk_API = (window as any).Tawk_API

        // Set user attributes
        if (userName || userEmail) {
          Tawk_API.setAttributes({
            name: userName || 'Guest',
            email: userEmail || '',
            quoteId: quoteId || 'N/A'
          }, (error: any) => {
            if (error) {
              console.error('Tawk.to error:', error)
            }
          })
        }

        // Add custom data
        if (quoteId) {
          Tawk_API.addTags([`quote-${quoteId}`], (error: any) => {
            if (error) {
              console.error('Tawk.to tag error:', error)
            }
          })
        }
      }
    }

    // Cleanup
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
      // Hide Tawk widget on unmount
      if (typeof window !== 'undefined' && (window as any).Tawk_API) {
        (window as any).Tawk_API.hideWidget()
      }
    }
  }, [quoteId, userName, userEmail])

  // Manual trigger button (optional)
  const openChat = () => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API) {
      (window as any).Tawk_API.maximize()
    }
  }

  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-green-500 rounded-lg">
          <MessageCircle className="text-white" size={20} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">Need Help with Your Quote?</h3>
          <p className="text-sm text-gray-700 mb-3">
            Chat with our sales team for instant support and negotiation
          </p>
          <button
            onClick={openChat}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Start Chat
          </button>
        </div>
      </div>

      {quoteId && (
        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-gray-600">
            Quote ID: <span className="font-semibold text-gray-900">{quoteId}</span>
          </p>
        </div>
      )}
    </div>
  )
}

// Tawk.to Setup Instructions Component
export function TawkSetupInstructions() {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
      <h4 className="font-bold text-blue-900 mb-2">🔧 Tawk.to Setup Instructions</h4>
      <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
        <li>Sign up at <a href="https://www.tawk.to" target="_blank" rel="noopener noreferrer" className="underline">tawk.to</a></li>
        <li>Create a new property for your website</li>
        <li>Copy your Property ID and Widget ID</li>
        <li>Replace <code className="bg-blue-100 px-1 rounded">YOUR_PROPERTY_ID</code> and <code className="bg-blue-100 px-1 rounded">YOUR_WIDGET_ID</code> in the TawkChat component</li>
        <li>The chat widget will appear on your quote pages</li>
      </ol>
      <div className="mt-3 p-3 bg-white rounded-lg">
        <p className="text-xs font-mono text-gray-700">
          src='https://embed.tawk.to/<span className="text-red-600">YOUR_PROPERTY_ID</span>/<span className="text-red-600">YOUR_WIDGET_ID</span>'
        </p>
      </div>
    </div>
  )
}

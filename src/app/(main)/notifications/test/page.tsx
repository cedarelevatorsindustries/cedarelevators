"use client"

import { useState } from "react"
import { useUser } from "@/lib/auth/client"
import { useRouter } from "next/navigation"

export default function NotificationTestPage() {
  const { user } = useUser()
  const router = useRouter()
  const [title, setTitle] = useState("Test Notification")
  const [message, setMessage] = useState("This is a test notification from Pusher")
  const [type, setType] = useState<"success" | "info" | "warning" | "error">("info")
  const [link, setLink] = useState("")
  const [status, setStatus] = useState("")

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h1>
          <p className="text-gray-600 mb-6">You need to be logged in to test notifications</p>
          <button
            onClick={() => router.push('/sign-in')}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const sendTestNotification = async () => {
    setStatus("Sending...")
    
    try {
      // This would normally be sent from your backend
      // For testing, you can use Pusher Debug Console
      setStatus(`✓ Ready to send! Use Pusher Debug Console:
        
Channel: user-${user.id}
Event: new_notification
Data:
{
  "title": "${title}",
  "message": "${message}",
  "type": "${type}",
  "link": "${link || undefined}"
}`)
    } catch (error) {
      setStatus(`✕ Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Test Notifications</h1>
          <p className="text-gray-600 mb-6">
            Test real-time notifications for user: <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">{user.id}</span>
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Notification title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Notification message"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link (optional)
              </label>
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="/products/123"
              />
            </div>

            <button
              onClick={sendTestNotification}
              className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Generate Test Instructions
            </button>

            {status && (
              <div className={`p-4 rounded-lg ${
                status.startsWith('✓') ? 'bg-green-50 text-green-800' : 
                status.startsWith('✕') ? 'bg-red-50 text-red-800' : 
                'bg-blue-50 text-blue-800'
              }`}>
                <pre className="whitespace-pre-wrap text-sm font-mono">{status}</pre>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold text-gray-900 mb-2">How to test:</h2>
            <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
              <li>Go to <a href="https://dashboard.pusher.com" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">Pusher Dashboard</a></li>
              <li>Select your app and go to "Debug Console"</li>
              <li>Use the channel and event data shown above</li>
              <li>Click "Send event"</li>
              <li>Check the notification bell in the navbar</li>
            </ol>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => router.push('/notifications')}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              View Notifications
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Back to House
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

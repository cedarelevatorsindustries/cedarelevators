"use client"

import Link from "next/link"

export default function OrderHistory() {
  return (
    <section>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Order History</h3>
          <Link href="/orders" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View All →
          </Link>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <p className="font-medium text-gray-900">Order #{1000 + i}</p>
                <p className="text-sm text-gray-600">Placed on Nov {20 + i}, 2024</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₹{(150000 + i * 50000).toLocaleString()}</p>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">Delivered</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

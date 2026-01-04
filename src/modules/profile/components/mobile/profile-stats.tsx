'use client'

interface ProfileStatsProps {
  stats: {
    totalOrders: number
    totalSpent: number
    savedItems: number
  }
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="px-6 pb-6">
      <div className="w-full grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-500 text-sm mb-1">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-gray-500 text-sm mb-1">Total Spend</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
        </div>
      </div>

      <div className="w-full bg-gray-50 rounded-lg p-4 border border-gray-200">
        <p className="text-gray-500 text-sm mb-1">Saved Items</p>
        <p className="text-2xl font-bold text-gray-900">{stats.savedItems}</p>
      </div>
    </div>
  )
}


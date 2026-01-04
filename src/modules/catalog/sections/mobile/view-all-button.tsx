interface ViewAllButtonProps {
  onClick: () => void
  productCount?: number
}

export default function ViewAllButton({ onClick, productCount = 200 }: ViewAllButtonProps) {
  return (
    <div className="px-4 py-6 bg-white">
      <button
        onClick={onClick}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        View All {productCount}+ Products
      </button>
    </div>
  )
}


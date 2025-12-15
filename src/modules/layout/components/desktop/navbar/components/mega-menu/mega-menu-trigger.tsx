"use client"

interface MegaMenuTriggerProps {
  isScrolled: boolean
  onMouseEnter: () => void
}

export function MegaMenuTrigger({ isScrolled, onMouseEnter }: MegaMenuTriggerProps) {
  return (
    <button 
      className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors font-montserrat ${
        isScrolled 
          ? 'text-gray-700 hover:text-blue-700 hover:bg-blue-50' 
          : 'text-white hover:text-blue-300 hover:bg-white/10'
      }`}
      onMouseEnter={onMouseEnter}
    >
      <img 
        src="/icons/categories.png" 
        alt="Categories" 
        width={16} 
        height={16} 
        className={`w-4 h-4 transition-all duration-300 ${
          !isScrolled ? 'brightness-0 invert' : ''
        }`}
      />
      <span className="font-medium">All Categories</span>
    </button>
  )
}

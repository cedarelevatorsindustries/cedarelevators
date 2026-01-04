"use client"

interface Tab {
  id: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onTabChange: (tabId: string) => void
}

export default function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const getTabStyles = (tabId: string, isActive: boolean) => {
    if (!isActive) {
      return "text-gray-600 hover:text-gray-900 bg-white"
    }
    
    if (tabId === "products") {
      return "text-white bg-orange-500"
    }
    if (tabId === "categories") {
      return "text-white bg-blue-500"
    }
    return "text-white bg-blue-500"
  }

  return (
    <div className="sticky top-14 z-30 bg-gray-100 p-1 shadow-sm">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-2.5 text-sm font-medium transition-all rounded-lg ${
              getTabStyles(tab.id, activeTab === tab.id)
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}


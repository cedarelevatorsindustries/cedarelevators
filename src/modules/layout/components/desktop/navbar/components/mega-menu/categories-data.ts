import { 
  Cpu, DoorOpen, ToggleLeft, Shield, Wrench, Tablet, 
  Wifi, Plug, ShieldAlert, Monitor, Battery, Hammer 
} from "lucide-react"

/**
 * Interface for category data structure used in mega menu
 * This file now only contains types and icon mappings
 * All category data is fetched from the database
 */
export interface CategoryData {
  id: string
  name: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  color: string
  bgColor: string
  subcategories: Array<{
    name: string
    image: string
    tag?: string
  }>
}

/**
 * Icon mapping for categories
 * Maps category slugs/names to Lucide icons
 */
export const categoryIconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'control-panels': Cpu,
  'door-operators': DoorOpen,
  'limit-switches': ToggleLeft,
  'ard-systems': Shield,
  'guide-shoes': Wrench,
  'lop-cop-units': Tablet,
  'sensors-encoders': Wifi,
  'wiring-accessories': Plug,
  'safety-brakes': ShieldAlert,
  'display-signage': Monitor,
  'power-backup': Battery,
  'tools-installation': Hammer,
}

/**
 * Color mapping for categories
 * Maps category slugs to Tailwind color classes
 */
export const categoryColorMap: Record<string, { color: string; bgColor: string }> = {
  'control-panels': { color: 'text-blue-600', bgColor: 'bg-blue-50' },
  'door-operators': { color: 'text-green-600', bgColor: 'bg-green-50' },
  'limit-switches': { color: 'text-purple-600', bgColor: 'bg-purple-50' },
  'ard-systems': { color: 'text-red-600', bgColor: 'bg-red-50' },
  'guide-shoes': { color: 'text-orange-600', bgColor: 'bg-orange-50' },
  'lop-cop-units': { color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  'sensors-encoders': { color: 'text-teal-600', bgColor: 'bg-teal-50' },
  'wiring-accessories': { color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  'safety-brakes': { color: 'text-red-700', bgColor: 'bg-red-50' },
  'display-signage': { color: 'text-blue-700', bgColor: 'bg-blue-50' },
  'power-backup': { color: 'text-green-700', bgColor: 'bg-green-50' },
  'tools-installation': { color: 'text-gray-700', bgColor: 'bg-gray-50' },
}

/**
 * Get icon for a category
 * Returns default icon if not found in map
 */
export function getCategoryIcon(categorySlug: string): React.ComponentType<{ size?: number; className?: string }> {
  return categoryIconMap[categorySlug] || Cpu
}

/**
 * Get colors for a category
 * Returns default colors if not found in map
 */
export function getCategoryColors(categorySlug: string): { color: string; bgColor: string } {
  return categoryColorMap[categorySlug] || { color: 'text-gray-600', bgColor: 'bg-gray-50' }
}


import {
  Cpu,
  DoorOpen,
  Zap,
  Shield,
  Cable,
  ToggleLeft,
  Radio,
  Disc,
  Circle,
  Layers,
  Minus,
  Lightbulb,
  Gauge,
  Link2,
  Power,
  Grip,
  Package
} from "lucide-react"
import { LucideIcon } from "lucide-react"

// Map category names/handles to icons
const categoryIconMap: Record<string, LucideIcon> = {
  "control-panels": Cpu,
  "control panels": Cpu,
  "doors": DoorOpen,
  "door": DoorOpen,
  "motors": Zap,
  "motor": Zap,
  "safety-devices": Shield,
  "safety devices": Shield,
  "safety": Shield,
  "cables": Cable,
  "cables-wiring": Cable,
  "cables & wiring": Cable,
  "wiring": Cable,
  "buttons": ToggleLeft,
  "buttons-fixtures": ToggleLeft,
  "buttons & fixtures": ToggleLeft,
  "fixtures": ToggleLeft,
  "sensors": Radio,
  "sensor": Radio,
  "brakes": Disc,
  "brake": Disc,
  "pulleys": Circle,
  "pulleys-sheaves": Circle,
  "pulleys & sheaves": Circle,
  "sheaves": Circle,
  "guides": Layers,
  "guides-rails": Layers,
  "guides & rails": Layers,
  "rails": Layers,
  "buffers": Minus,
  "buffer": Minus,
  "indicators": Lightbulb,
  "indicator": Lightbulb,
  "governors": Gauge,
  "governor": Gauge,
  "ropes": Link2,
  "ropes-chains": Link2,
  "ropes & chains": Link2,
  "chains": Link2,
  "inverters": Power,
  "inverter": Power,
  "handrails": Grip,
  "handrail": Grip,
}

/**
 * Get icon for a category based on its name or handle
 */
export function getCategoryIcon(category: { name?: string; handle?: string }): LucideIcon {
  const searchKey = (category.handle || category.name || "").toLowerCase()
  
  // Try exact match first
  if (categoryIconMap[searchKey]) {
    return categoryIconMap[searchKey]
  }
  
  // Try partial match
  for (const [key, icon] of Object.entries(categoryIconMap)) {
    if (searchKey.includes(key) || key.includes(searchKey)) {
      return icon
    }
  }
  
  // Default icon
  return Package
}


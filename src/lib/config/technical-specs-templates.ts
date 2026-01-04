/**
 * Technical Specifications Templates for Cedar Elevators
 * These define common technical specifications for different product types
 */

export interface TechnicalSpecField {
  key: string
  label: string
  type: 'text' | 'number' | 'select' | 'boolean'
  unit?: string
  options?: string[]
  required?: boolean
  placeholder?: string
}

/**
 * Common voltage options for elevators
 */
export const VOLTAGE_OPTIONS = [
  '220V',
  '380V',
  '415V',
  '440V',
  '480V',
  '230V Single Phase',
  '400V Three Phase',
]

/**
 * Common control system types
 */
export const CONTROL_SYSTEM_OPTIONS = [
  'Microprocessor',
  'PLC',
  'Variable Frequency Drive (VFD)',
  'Manual',
  'Automatic',
]

/**
 * Door types for elevators
 */
export const DOOR_TYPE_OPTIONS = [
  'Automatic',
  'Manual',
  'Semi-Automatic',
  'Center Opening',
  'Side Opening',
  'Telescopic',
]

/**
 * Drive system types
 */
export const DRIVE_SYSTEM_OPTIONS = [
  'Traction (Geared)',
  'Traction (Gearless)',
  'Hydraulic',
  'Machine Room Less (MRL)',
  'Pneumatic',
]

/**
 * Common technical specification fields
 */
export const COMMON_TECH_SPECS: TechnicalSpecField[] = [
  {
    key: 'voltage',
    label: 'Voltage',
    type: 'select',
    options: VOLTAGE_OPTIONS,
    required: false,
  },
  {
    key: 'load_capacity_kg',
    label: 'Load Capacity',
    type: 'number',
    unit: 'kg',
    required: false,
    placeholder: 'e.g., 630, 1000, 1600',
  },
  {
    key: 'speed_ms',
    label: 'Speed',
    type: 'number',
    unit: 'm/s',
    required: false,
    placeholder: 'e.g., 1.0, 1.5, 2.5',
  },
  {
    key: 'floors',
    label: 'Number of Floors',
    type: 'number',
    required: false,
    placeholder: 'e.g., 6, 10, 15',
  },
  {
    key: 'stops',
    label: 'Number of Stops',
    type: 'number',
    required: false,
    placeholder: 'e.g., 6, 10, 15',
  },
  {
    key: 'control_system',
    label: 'Control System',
    type: 'select',
    options: CONTROL_SYSTEM_OPTIONS,
    required: false,
  },
  {
    key: 'door_type',
    label: 'Door Type',
    type: 'select',
    options: DOOR_TYPE_OPTIONS,
    required: false,
  },
  {
    key: 'drive_system',
    label: 'Drive System',
    type: 'select',
    options: DRIVE_SYSTEM_OPTIONS,
    required: false,
  },
  {
    key: 'car_dimensions',
    label: 'Car Dimensions',
    type: 'text',
    unit: 'mm',
    placeholder: 'e.g., 1400 x 1600 x 2300',
    required: false,
  },
  {
    key: 'shaft_dimensions',
    label: 'Shaft Dimensions',
    type: 'text',
    unit: 'mm',
    placeholder: 'e.g., 1600 x 1800',
    required: false,
  },
  {
    key: 'machine_room_required',
    label: 'Machine Room Required',
    type: 'boolean',
    required: false,
  },
]

/**
 * Elevator Type Specific Templates
 */
export const PASSENGER_ELEVATOR_SPECS: TechnicalSpecField[] = [
  ...COMMON_TECH_SPECS,
  {
    key: 'passenger_capacity',
    label: 'Passenger Capacity',
    type: 'number',
    unit: 'persons',
    placeholder: 'e.g., 8, 13, 21',
    required: false,
  },
]

export const FREIGHT_ELEVATOR_SPECS: TechnicalSpecField[] = [
  ...COMMON_TECH_SPECS,
  {
    key: 'platform_size',
    label: 'Platform Size',
    type: 'text',
    unit: 'mm',
    placeholder: 'e.g., 2000 x 2500',
    required: false,
  },
  {
    key: 'max_load',
    label: 'Maximum Load',
    type: 'number',
    unit: 'kg',
    placeholder: 'e.g., 2000, 3000, 5000',
    required: false,
  },
]

export const HOSPITAL_ELEVATOR_SPECS: TechnicalSpecField[] = [
  ...COMMON_TECH_SPECS,
  {
    key: 'stretcher_capacity',
    label: 'Stretcher Capacity',
    type: 'boolean',
    required: false,
  },
  {
    key: 'antibacterial_finish',
    label: 'Antibacterial Finish',
    type: 'boolean',
    required: false,
  },
]

/**
 * Get technical specs template by elevator type
 */
export function getTechSpecsByElevatorType(elevatorTypeSlug: string): TechnicalSpecField[] {
  switch (elevatorTypeSlug) {
    case 'passenger':
      return PASSENGER_ELEVATOR_SPECS
    case 'freight':
      return FREIGHT_ELEVATOR_SPECS
    case 'hospital':
      return HOSPITAL_ELEVATOR_SPECS
    default:
      return COMMON_TECH_SPECS
  }
}

/**
 * Format technical spec value for display
 */
export function formatTechSpecValue(field: TechnicalSpecField, value: any): string {
  if (value === null || value === undefined || value === '') {
    return 'N/A'
  }

  if (field.type === 'boolean') {
    return value ? 'Yes' : 'No'
  }

  if (field.unit) {
    return `${value} ${field.unit}`
  }

  return String(value)
}


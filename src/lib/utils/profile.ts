import { AccountType, ProfileNavigationGroup, PROFILE_SECTIONS } from '@/lib/constants/profile'

export function getInitials(firstName: string, lastName: string): string {
  const first = firstName?.charAt(0)?.toUpperCase() || ''
  const last = lastName?.charAt(0)?.toUpperCase() || ''
  return `${first}${last}` || 'U'
}

export function getProfileNavigation(accountType: AccountType, isVerified: boolean = false): ProfileNavigationGroup[] {
  // INDIVIDUAL USER - Desktop matches mobile + density
  if (accountType === 'individual') {
    return [
      {
        title: 'Profile',
        icon: 'User',
        items: [
          {
            section: PROFILE_SECTIONS.OVERVIEW,
            label: 'Profile Overview',
            icon: 'LayoutDashboard',
          },
          {
            section: PROFILE_SECTIONS.PERSONAL_INFO,
            label: 'Personal Info',
            icon: 'User',
          },
          {
            section: PROFILE_SECTIONS.ADDRESSES,
            label: 'Addresses',
            icon: 'MapPin',
          },
        ],
      },
      {
        title: 'Activity',
        icon: 'Package',
        items: [
          {
            section: PROFILE_SECTIONS.QUOTES,
            label: 'Quotes',
            icon: 'FileText',
          },
        ],
      },
      {
        title: 'Settings',
        icon: 'Settings',
        items: [
          {
            section: PROFILE_SECTIONS.SECURITY,
            label: 'Security',
            icon: 'Shield',
            activeMatch: '/profile/security'
          },
        ],
      },

    ]
  }

  // BUSINESS USER - Desktop matches mobile + density
  if (accountType === 'business') {
    const navigation: ProfileNavigationGroup[] = [
      {
        title: 'Business Profile',
        icon: 'Building2',
        items: [
          {
            section: PROFILE_SECTIONS.OVERVIEW,
            label: 'Business Overview',
            icon: 'LayoutDashboard',
          },
          {
            section: PROFILE_SECTIONS.ADDRESSES,
            label: 'Addresses',
            icon: 'MapPin',
          },
        ],
      },
      {
        title: 'Compliance',
        icon: 'CircleCheck',
        items: [
          {
            section: PROFILE_SECTIONS.APPROVALS,
            label: 'Verification',
            icon: 'CircleCheck',
            badge: 'status',
          },
        ],
      },
      {
        title: 'Settings',
        icon: 'Settings',
        items: [
          {
            section: PROFILE_SECTIONS.SECURITY,
            label: 'Security',
            icon: 'Shield',
          },
        ],
      },
    ]

    // Only show Operations/Orders if business is verified
    if (isVerified) {
      // Find the index to insert Operations before Settings (which is the last item now)
      // Or just push it before Settings if we want specific order. 
      // Current array: [Business Profile, Compliance, Settings]
      // We want: [Business Profile, Compliance, Operations, Settings]

      const settingsIndex = navigation.findIndex(g => g.title === 'Settings')
      if (settingsIndex !== -1) {
        navigation.splice(settingsIndex, 0, {
          title: 'Operations',
          icon: 'Package',
          items: [
            {
              section: PROFILE_SECTIONS.ORDER_HISTORY,
              label: 'Orders',
              icon: 'Package',
            },
          ],
        })
      } else {
        navigation.push({
          title: 'Operations',
          icon: 'Package',
          items: [
            {
              section: PROFILE_SECTIONS.ORDER_HISTORY,
              label: 'Orders',
              icon: 'Package',
            },
          ],
        })
      }
    }

    return navigation
  }

  // GUEST - Should not reach here, but return empty
  return []
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')

  // Format as (XXX) XXX-XXXX for 10-digit numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }

  // Format with country code for 11+ digit numbers
  if (cleaned.length > 10) {
    const countryCode = cleaned.slice(0, cleaned.length - 10)
    const areaCode = cleaned.slice(-10, -7)
    const firstPart = cleaned.slice(-7, -4)
    const lastPart = cleaned.slice(-4)
    return `+${countryCode} (${areaCode}) ${firstPart}-${lastPart}`
  }

  return phone
}

export function getAccountTypeBadge(accountType: AccountType): {
  label: string
  color: string
} {
  switch (accountType) {
    case 'business':
      return { label: 'Business', color: 'blue' }
    case 'individual':
      return { label: 'Individual', color: 'green' }
    default:
      return { label: 'Guest', color: 'gray' }
  }
}

export interface PasswordStrength {
  score: number // 0-4
  strength: 'weak' | 'medium' | 'strong'
  label: 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong'
  color: string
  feedback: string[]
  isValid: boolean
}

export function validatePasswordStrength(password: string): PasswordStrength {
  let score = 0
  const feedback: string[] = []

  // Check length
  if (password.length >= 8) {
    score++
  } else {
    feedback.push('Password should be at least 8 characters long')
  }

  // Check for lowercase letters
  if (/[a-z]/.test(password)) {
    score++
  } else {
    feedback.push('Add lowercase letters')
  }

  // Check for uppercase letters
  if (/[A-Z]/.test(password)) {
    score++
  } else {
    feedback.push('Add uppercase letters')
  }

  // Check for numbers
  if (/\d/.test(password)) {
    score++
  } else {
    feedback.push('Add numbers')
  }

  // Check for special characters
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score++
  } else {
    feedback.push('Add special characters (!@#$%^&*)')
  }

  // Bonus: Check for length > 12
  if (password.length >= 12) {
    score = Math.min(score + 1, 5)
  }

  // Determine label and color based on score
  let label: PasswordStrength['label']
  let strength: PasswordStrength['strength']
  let color: string
  let isValid: boolean

  if (score <= 1) {
    label = 'Weak'
    strength = 'weak'
    color = 'red'
    isValid = false
  } else if (score === 2) {
    label = 'Fair'
    strength = 'weak'
    color = 'orange'
    isValid = false
  } else if (score === 3) {
    label = 'Good'
    strength = 'medium'
    color = 'yellow'
    isValid = true
  } else if (score === 4) {
    label = 'Strong'
    strength = 'strong'
    color = 'green'
    isValid = true
  } else {
    label = 'Very Strong'
    strength = 'strong'
    color = 'emerald'
    isValid = true
  }

  return {
    score: Math.min(score, 4), // Cap at 4 for display purposes
    strength,
    label,
    color,
    feedback: feedback.length > 0 ? feedback : ['Password meets all requirements'],
    isValid,
  }
}


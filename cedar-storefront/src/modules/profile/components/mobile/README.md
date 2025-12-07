# Mobile Profile Components

This directory contains modular components for the mobile profile view. Each component is self-contained and can be easily modified or reused.

## Component Structure

```
mobile/
├── profile-header.tsx       # User avatar, name, email, badges
├── profile-stats.tsx        # Stats cards (orders, spend, saved items)
├── account-section.tsx      # My Account menu items
├── business-section.tsx     # Business profile & verification (business only)
├── order-tools-section.tsx  # Order-related menu items
├── download-section.tsx     # Download center link
├── support-section.tsx      # Support & help menu items
├── policies-section.tsx     # Policy links (warranty, shipping, etc.)
├── logout-button.tsx        # Red logout button
├── menu-item.tsx           # Reusable menu item component
├── menu-section.tsx        # Reusable menu section wrapper
└── index.ts                # Barrel export file
```

## Usage

### Import Individual Components
```tsx
import ProfileHeader from './mobile/profile-header'
import ProfileStats from './mobile/profile-stats'
```

### Import from Barrel
```tsx
import { ProfileHeader, ProfileStats, AccountSection } from './mobile'
```

### Use in Template
```tsx
<ProfileHeader user={user} accountType={accountType} verificationStatus={verificationStatus} />
<ProfileStats stats={stats} />
<AccountSection />
```

## Component Details

### ProfileHeader
Displays user avatar (or initials), name, email, account type badge, and verification status badge.

**Props:**
- `user: UserProfile` - User data
- `accountType: 'individual' | 'business'` - Account type
- `verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'` - Verification status

### ProfileStats
Shows three stat cards: Total Orders, Total Spend, and Saved Items.

**Props:**
- `stats: { totalOrders: number, totalSpent: number, savedItems: number }` - Statistics data

### AccountSection
Menu section with Edit Profile, My Addresses, and Change Password links.

**Props:** None

**Note:** Notifications removed (already in top bar with badge)

### BusinessSection
Menu section with Business Profile and Verification links. Only shown for business accounts.

**Props:**
- `verificationStatus?: 'pending' | 'approved' | 'rejected' | 'incomplete'` - Verification status

### OrderToolsSection
Menu section with order-related links: My Orders, Track Order, Saved Items, Quick Reorder.

**Props:** None

**Note:** Quote-related items removed (use Quote tab in bottom nav)

### DownloadSection
Single menu item linking to Download Center.

**Props:** None

### SupportSection
Menu section with support links: Help & FAQ, Contact Sales, WhatsApp Support.

**Props:** None

**Note:** Request Quote removed (use Quote tab in bottom nav)

### PoliciesSection
Two menu sections: Policies (Warranty, Shipping, Returns) and Legal (Privacy, Terms, Payment).

**Props:** None

### LogoutButton
Red logout button that signs out the user and redirects to home.

**Props:** None

### MenuItem (Utility)
Reusable menu item component with icon, label, link, and optional badge.

**Props:**
- `icon: LucideIcon` - Icon component
- `label: string` - Menu item text
- `href: string` - Link destination
- `bgColor: string` - Background color class
- `iconColor: string` - Icon color class
- `badge?: string | number` - Optional badge text

### MenuSection (Utility)
Reusable wrapper for menu sections with optional title.

**Props:**
- `title?: string` - Section title
- `children: React.ReactNode` - Menu items

## Design System

All components follow the guest profile mobile design:
- Clean white background
- Rounded icon containers with colored backgrounds
- Consistent spacing and typography
- Hover states on menu items
- ChevronRight indicators
- Badge support for notifications/status

## Customization

To modify a section:
1. Locate the component file
2. Edit the menu items, icons, or styling
3. Changes are automatically reflected in the template

To add a new section:
1. Create a new component file in this directory
2. Follow the existing pattern (use MenuItem and MenuSection)
3. Export from index.ts
4. Add to the template in `../templates/profile-mobile-template.tsx`

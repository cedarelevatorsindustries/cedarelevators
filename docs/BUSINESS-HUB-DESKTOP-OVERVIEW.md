# Cedar Elevators - Business Hub (Desktop) Complete Overview

**Last Updated**: December 28, 2025  
**Version**: 1.0  
**Platform**: Desktop Only  
**User Types Covered**: Individual (N/A), Business Unverified, Business Verified

---

## Table of Contents

1. [Business Hub Overview](#business-hub-overview)
2. [Access & Availability](#access--availability)
3. [Layout & Structure](#layout--structure)
4. [Individual Users](#individual-users)
5. [Business Unverified Users](#business-unverified-users)
6. [Business Verified Users](#business-verified-users)
7. [Sections Breakdown](#sections-breakdown)
8. [Components Detail](#components-detail)
9. [Interactive Elements](#interactive-elements)

---

## 1. Business Hub Overview

### 1.1 What is Business Hub?

The **Business Hub** is a dedicated tab on the desktop homepage designed exclusively for business account users. It provides a centralized dashboard for managing quotes, viewing performance metrics, accessing exclusive products, and monitoring business-related activities.

### 1.2 Purpose

- Centralized business operations dashboard
- Quick access to quote management
- Performance monitoring and analytics
- Exclusive business-only features
- Streamlined workflow for B2B operations

### 1.3 Location

**URL**: Homepage (`/`)  
**Access**: Desktop only (not available on mobile)  
**Navigation**: Hero Lite → Business Hub Tab (3rd tab)

```
┌──────────────────────────────────────┐
│  Hero Lite Navigation                │
│  ┌──────┬──────────┬─────────────┐  │
│  │Produc│Categories│Business Hub ←  │
│  └──────┴──────────┴─────────────┘  │
└──────────────────────────────────────┘
```

---

## 2. Access & Availability

### 2.1 User Type Access Matrix

| User Type | Access | What They See |
|-----------|--------|---------------|
| **Guest** | ❌ No Access | Tab not visible |
| **Individual** | ❌ No Access | Tab not visible |
| **Business Unverified** | ✅ Full Access | Complete hub with verification prompts |
| **Business Verified** | ✅ Full Access | Complete hub with enhanced features |

### 2.2 Visibility Logic

```javascript
// Business Hub tab visibility
const showBusinessHub = accountType === 'business'

// Tab appears only for business accounts (verified or unverified)
if (!showBusinessHub) {
  // Tab is not rendered in Hero Lite
  return null
}
```

---

## 3. Layout & Structure

### 3.1 Overall Layout

```
┌─────────────────────────────────────────────────────────┐
│                     Hero Lite Tabs                      │
│          Products | Categories | Business Hub           │
└─────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Business Hub Content (max-width: 1440px, centered)    │
│                                                         │
│  ┌──────────────────────┬──────────────┐              │
│  │ Verification Status  │ Primary      │              │
│  │ Card (2/3 width)     │ Action Bar   │              │
│  │                      │ (1/3 width)  │              │
│  └──────────────────────┴──────────────┘              │
│                                                         │
│  ┌─────────────────────────────────────┐              │
│  │     Smart Alerts (3 cards)          │              │
│  └─────────────────────────────────────┘              │
│                                                         │
│  ┌─────────────────────────────────────┐              │
│  │ Quick Performance Snapshot (5 cards)│              │
│  └─────────────────────────────────────┘              │
│                                                         │
│  ┌─────────────────────────────────────┐              │
│  │   Unified Timeline (Orders/Quotes)  │              │
│  └─────────────────────────────────────┘              │
│                                                         │
│  ┌─────────────────────────────────────┐              │
│  │  Exclusive Verified Catalog         │              │
│  └─────────────────────────────────────┘              │
│                                                         │
│  [Tawk.to Chat Widget - Bottom Right]                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Grid Layout

The Business Hub uses a **responsive grid system**:

```css
Container: max-width: 1440px, mx-auto
Padding: px-6 (24px), py-12 (48px)
Gap between sections: 48px (space-y-12)

Top Row Grid:
- Desktop (lg): grid-cols-3 (2 cols + 1 col)
- Tablet/Mobile: grid-cols-1 (stacked)
```

---

## 4. Individual Users

### 4.1 Business Hub Availability

**Status**: ❌ **NOT AVAILABLE**

Individual users do **not** see the Business Hub tab in the Hero Lite navigation. The tab is completely hidden from the UI.

### 4.2 What Individual Users See Instead

Individual users see only **2 tabs** in Hero Lite:
1. **Products Tab** (Active by default)
2. **Categories Tab**

### 4.3 If Individual Wants Business Features

**Upgrade Path**:
1. Navigate to Profile → Account Settings
2. Contact support to upgrade account type
3. Or create a new business account

---

## 5. Business Unverified Users

### 5.1 Access

✅ **Full Access** to Business Hub tab

### 5.2 Verification Status Card

**Display**: Red gradient background (warning state)

```
┌──────────────────────────────────────────────────────┐
│  [Illustration]  VERIFICATION REQUIRED               │
│   Verification   Complete your verification to       │
│   Required       access exclusive business benefits. │
│   Visual                                             │
│                  Submission Date: Dec 28, 2024       │
│                                                      │
│  [Upload Missing Documents] [View Benefits]         │
└──────────────────────────────────────────────────────┘
```

**Details**:
- **Background**: Red gradient (`bg-gradient-to-r from-red-500 to-red-600`)
- **Height**: 288px (h-72)
- **Illustration**: Left side, full height (288x288px)
- **Content**: Right side, centered vertically
- **Title**: "VERIFICATION REQUIRED"
- **Message**: "Complete your verification to access exclusive business benefits."
- **Info**: Submission date displayed
- **Actions**:
  1. **Upload Missing Documents** (White/20% opacity background)
  2. **View Benefits** (White background)

**State**: Requires action

### 5.3 Primary Action Bar

**Display**: 3 action buttons in vertical stack

```
┌─────────────────────────┐
│ 📄 Start Bulk Quote     │
│    Custom pricing for   │
│    large orders         │
├─────────────────────────�
│ 🛍️ Shop Catalog        │
│    Browse exclusive     │
│    products             │
├─────────────────────────┤
│ 🔄 Quick Reorder        │
│    Reorder past items   │
│    instantly            │
└─────────────────────────┘
```

**Buttons**:
1. **Start Bulk Quote** (Blue)
   - Color: `bg-blue-600 hover:bg-blue-700`
   - Link: `/request-quote/bulk`
   - Icon: FileText
   - **Status**: ⚠️ May be disabled/limited until verified

2. **Shop Catalog** (Emerald Green)
   - Color: `bg-emerald-600 hover:bg-emerald-700`
   - Link: `/catalog`
   - Icon: ShoppingBag
   - **Status**: ✅ Active

3. **Quick Reorder** (Orange)
   - Color: `bg-orange-600 hover:bg-orange-700`
   - Link: `/profile/orders`
   - Icon: RotateCcw
   - **Status**: ✅ Active

**Behavior**: 
- Each button is full height (flex-1)
- Hover effects: shadow-lg, background darkens
- Icon has white/20% background that becomes white/30% on hover

### 5.4 Smart Alerts

**Display**: Shows alerts relevant to unverified status

**Possible Alerts**:
1. **Verification Reminder** (Red)
   - Icon: AlertCircle
   - Message: "Complete verification to unlock full features"
   - Action: "Upload Documents"

2. **Pending Approval** (Orange)
   - Icon: Clock
   - Message: "2 quotes are awaiting approval from CEDAR team."
   - Action: "View Quotes"

3. **Limited Access** (Blue)
   - Icon: Package
   - Message: "Some features are limited until verification"
   - Action: "Learn More"

### 5.5 Quick Performance Snapshot

**Display**: 5 stat cards in a row

**Stats** (Unverified):
1. **Sales This Month**: ₹0 (No orders until verified)
2. **Pending Quotes**: Shows actual count
3. **Approved & Ready**: 0 (Cannot convert until verified)
4. **Total Orders**: 0
5. **Active Inquiries**: Shows actual count

**Limitations**:
- Cannot convert quotes to orders
- Cannot place orders (checkout blocked)
- Quote values may not show pricing

### 5.6 Unified Timeline

**Display**: Combined feed of quotes and orders

**Content**:
- Mostly quote requests and updates
- No orders (since checkout is blocked)
- Status updates on quote reviews
- Admin messages/responses

### 5.7 Exclusive Products

**Display**: Shows exclusive catalog

**Access**: ✅ Can view products  
**Limitation**: ❌ Cannot checkout (add to quote instead)

### 5.8 Tawk.to Chat

**Display**: Bottom right corner

**Purpose**: Get help with verification process
**Pre-filled**: User info, company details

---

## 6. Business Verified Users

### 6.1 Access

✅ **Full Access** to Business Hub with all features unlocked

### 6.2 Verification Status Card

**Display**: Green gradient background (success state)

```
┌──────────────────────────────────────────────────────┐
│  [Illustration]  VERIFIED PARTNER STATUS             │
│   Verified       Your business is verified and       │
│   Badge          approved for exclusive partner     │
│   Visual         benefits.                           │
│                                                      │
│                  Submission Date: Dec 15, 2024       │
│                  Verification ID: #VP-8742           │
│                                                      │
│                              [View Benefits]         │
└──────────────────────────────────────────────────────┘
```

**Details**:
- **Background**: Green gradient (`bg-gradient-to-r from-green-500 to-green-600`)
- **Height**: 288px (h-72)
- **Illustration**: Left side, verified badge visual
- **Title**: "VERIFIED PARTNER STATUS"
- **Message**: "Your business is verified and approved for exclusive partner benefits."
- **Info**: 
  - Submission date
  - Verification ID (e.g., #VP-8742)
- **Action**: **View Benefits** (White background, green text)

**State**: Approved, no action required

### 6.3 Primary Action Bar

**Display**: Same 3 action buttons

**Buttons** (All Active):
1. **Start Bulk Quote** (Blue) - ✅ Fully functional
2. **Shop Catalog** (Green) - ✅ Fully functional
3. **Quick Reorder** (Orange) - ✅ Fully functional

**Enhanced Features**:
- Bulk quotes show pricing immediately
- Can proceed to checkout from catalog
- Reorder creates instant quote or order

### 6.4 Smart Alerts

**Display**: Business-critical alerts

**Possible Alerts**:
1. **Quote Expiring Soon** (Red - Urgent)
   - Icon: Clock
   - Message: "Quote #Q-2345 expires in 2 days. Convert to order now."
   - Action: "Convert Now"

2. **Pending Approval** (Orange - Warning)
   - Icon: AlertCircle
   - Message: "2 quotes are awaiting approval from CEDAR team."
   - Action: "View Quotes"

3. **Low Stock Alert** (Blue - Info)
   - Icon: Package
   - Message: "3 items in your wishlist are running low on stock."
   - Action: "View Items"

**Alert Types**:
- **Urgent**: Red border, red icon, time-sensitive
- **Warning**: Orange border, orange icon, attention needed
- **Info**: Blue border, blue icon, informational

### 6.5 Quick Performance Snapshot

**Display**: 5 clickable stat cards

**Stats** (Verified - Full Data):

```
┌──────────┬──────────┬──────────┬──────────┬──────────┐
│  📈     │   📄     │   ✅     │   📦     │   💬     │
│ Sales   │ Pending  │ Approved │  Total   │  Active  │
│ This    │ Quotes   │ & Ready  │  Orders  │ Inquiries│
│ Month   │          │          │          │          │
│₹1,25,000│    4     │    2     │    12    │    7     │
│ ↑24%    │          │→Convert  │  ↑28%    │  new     │
└──────────┴──────────┴──────────┴──────────┴──────────┘
```

**Card 1: Sales This Month**
- Value: ₹1,25,000
- Trend: ↑24% (green)
- Icon: TrendingUp
- Color: Green
- Link: `/profile/orders?period=month`

**Card 2: Pending Quotes**
- Value: 4
- Icon: FileText
- Color: Orange
- Link: `/profile/quotes?status=pending`

**Card 3: Approved & Ready**
- Value: 2
- Action: "→ Convert to Order"
- Icon: CheckCircle
- Color: Emerald
- Link: `/profile/quotes?status=approved`
- **Feature**: Click to convert quote to order

**Card 4: Total Orders**
- Value: 12
- Trend: ↑28%
- Icon: Package
- Color: Blue
- Link: `/profile/orders`

**Card 5: Active Inquiries**
- Value: 7
- Subtext: "new"
- Icon: MessageSquare
- Color: Purple
- Link: `/profile/quotes?status=negotiation`

**Interactions**:
- Hover: Shadow elevates, border turns blue
- Click: Navigate to filtered view
- Icon scales up slightly on hover

### 6.6 Unified Timeline

**Display**: Rich feed with filters

**Content**:
- Recent orders with status updates
- Quote submissions and responses
- Order deliveries
- Quote approvals/rejections
- Admin messages
- System notifications

**Features**:
- **Filters**:
  - By type: All, Orders, Quotes, Messages
  - By status: All, Pending, Completed, Active
- **Timeline Items**: Show icon, title, message, timestamp
- **Actions**: Click to view details
- **Auto-refresh**: Updates in real-time (Pusher)

**Sample Timeline**:
```
🟢 Order #1234 delivered successfully        - 2 hours ago
📄 Quote #Q-5678 approved by admin           - 5 hours ago
💬 New message on Quote #Q-2345              - 1 day ago
📦 Order #1233 shipped                       - 2 days ago
📝 Quote #Q-5679 submitted for review        - 3 days ago
```

### 6.7 Exclusive Products

**Display**: Product carousel/grid

**Features**:
- Verified-only products
- Bulk pricing displayed
- Special discounts visible
- Direct "Add to Cart" & "Quick Checkout"
- "Request Custom Quote" for high-value items

**Product Cards**:
- Product image
- Title
- Bulk price indicator
- Discount badge
- Stock availability
- Quick actions

### 6.8 Tawk.to Chat

**Display**: Bottom right corner

**Features**:
- Priority support for verified businesses
- Dedicated account manager option
- Pre-filled business details
- Chat history saved

---

## 7. Sections Breakdown

### 7.1 Section 1: Verification Status Card

**Component Location**: `business-hub/components/verification-status-card.tsx`

**Props**: None (fetches from user profile)

**Layout**:
- **Left**: Illustration image (288x288px, object-contain)
- **Right**: Content (flex-1, py-8, pr-8, pl-4)

**Content Elements**:
1. **Title** (text-2xl, font-bold)
2. **Description** (text-base, opacity-90)
3. **Info Row**:
   - Submission date
   - Verification ID (if verified)
4. **Actions** (flex gap-3):
   - Primary button (conditional based on status)
   - Secondary button ("View Benefits")

**States**:
| Status | Background | Title | Actions |
|--------|-----------|-------|---------|
| Verified | Green gradient | "VERIFIED PARTNER STATUS" | View Benefits |
| Pending | Blue gradient | "VERIFICATION PENDING" | View Benefits |
| Rejected/Incomplete | Red gradient | "VERIFICATION REQUIRED" | Upload Documents, View Benefits |

**Responsive**: Fixed height (h-72), flex layout adapts to content

### 7.2 Section 2: Primary Action Bar

**Component**: `business-hub/sections/primary-action-bar.tsx`

**Layout**: Vertical stack, 3 buttons, equal height (flex-1)

**Each Button**:
```tsx
<Link className="color rounded-lg p-5 flex-1">
  <div className="flex items-start gap-3">
    <IconBackground>
      <Icon size={20} />
    </IconBackground>
    <div>
      <Title className="text-base font-bold" />
      <Description className="text-xs opacity-90" />
    </div>
  </div>
</Link>
```

**Button Specs**:
- **Padding**: 20px (p-5)
- **Border Radius**: 8px (rounded-lg)
- **Icon Background**: white/20%, becomes white/30% on hover
- **Text**: White
- **Hover**: shadow-lg, background darkens

### 7.3 Section 3: Smart Alerts

**Component**: `business-hub/sections/smart-alerts.tsx`

**Layout**: `grid grid-cols-1 md:grid-cols-3 gap-4`

**Alert Card Structure**:
```tsx
<div className="bgColor border-2 borderColor rounded-lg p-5">
  <div className="flex items-start gap-3 mb-3">
    <IconBackground>
      <Icon size={20} />
    </IconBackground>
    <div>
      <Title className="font-bold" />
      <Message className="text-sm" />
    </div>
  </div>
  <ActionButton />
</div>
```

**Alert Properties**:
- **Type**: urgent, warning, info
- **Icon**: Clock, AlertCircle, Package
- **Colors**: Red (urgent), Orange (warning), Blue (info)
- **Border**: 2px solid, matches icon color
- **Background**: Light tint of border color

**Conditional Rendering**: Only shows if alerts exist

### 7.4 Section 4: Quick Performance Snapshot

**Component**: `business-hub/sections/quick-performance-snapshot.tsx`

**Layout**: `grid grid-cols-2 md:grid-cols-5 gap-4`

**Stat Card Structure**:
```tsx
<a href={stat.href} className="bg-white border rounded-lg p-6 hover:shadow-md">
  <IconBackground className="w-12 h-12 rounded-lg mb-4">
    <Icon size={24} />
  </IconBackground>
  <div>
    <Label className="text-sm text-gray-600" />
    <Value className="text-2xl font-bold" />
    {trend && <Trend className="text-xs text-green-600" />}
    {action && <Action className="text-xs text-blue-600" />}
  </div>
</a>
```

**Card Features**:
- **Clickable**: Navigate to filtered view
- **Icon**: 48x48px, colored background, scales on hover
- **Value**: Large, bold (text-2xl)
- **Trend**: Small, green (↑24%)
- **Action**: Small, blue, shows on relevant cards

**Hover Effects**:
- Border changes to blue
- Shadow elevates
- Icon scales to 110%

### 7.5 Section 5: Unified Timeline

**Component**: `business-hub/sections/unified-timeline.tsx`

**Features**:
- **Title**: "Smart Quote & Order Timeline (Unified Feed)"
- **Filters**: Type (All, Orders, Quotes), Status
- **Timeline Items**: Icon, title, message, timestamp, action
- **Pagination**: Load more button
- **Real-time Updates**: Pusher integration

**Timeline Item**:
```tsx
<div className="flex items-start gap-4 p-4 hover:bg-gray-50">
  <Icon className="flex-shrink-0" />
  <div className="flex-1">
    <Title />
    <Message />
    <Timestamp />
  </div>
  <ActionButton />
</div>
```

### 7.6 Section 6: Exclusive Products

**Component**: `business-hub/sections/exclusive-products.tsx`

**Layout**: Product carousel or grid

**Features**:
- Verified-only products
- Bulk pricing
- Quick add to cart
- Filter/sort options

**Product Card**: Same as regular product card but with:
- "Exclusive" badge
- Bulk price display
- Enhanced CTA buttons

### 7.7 Section 7: Tawk.to Chat Widget

**Component**: `TawkChat` from quote module

**Props**:
```tsx
<TawkChat 
  userName="Business User"
  userEmail="user@business.com"
/>
```

**Position**: Fixed, bottom-right  
**Z-index**: High (above content)  
**Features**: Live chat, history, notifications

---

## 8. Components Detail

### 8.1 Verification Status Card Component

**File**: `verification-status-card.tsx`

**State Management**:
```typescript
const isVerified: boolean           // Verification status
const status: 'pending' | 'verified' | 'rejected'
const submittedDate: string
const documentsRequired: string[]   // Missing documents
```

**Configuration Function**:
```typescript
const getStatusConfig = () => {
  switch (status) {
    case "verified":
      return { bgColor, title, description, textColor, buttonBg, buttonText }
    case "pending":
      return { ... }
    default: // rejected/incomplete
      return { ... }
  }
}
```

**Rendering Logic**:
```tsx
return (
  <div className={bgColor + " h-72 rounded-xl"}>
    <div className="flex items-center h-full">
      <Illustration width={288} height={288} />
      <Content>
        <Title />
        <Description />
        <InfoRow />
        <Actions />
      </Content>
    </div>
  </div>
)
```

### 8.2 Primary Action Bar Component

**File**: `primary-action-bar.tsx`

**Actions Array**:
```typescript
const actions = [
  {
    icon: FileText,
    title: "Start Bulk Quote",
    description: "Custom pricing for large orders",
    href: "/request-quote/bulk",
    color: "bg-blue-600 hover:bg-blue-700"
  },
  // ... more actions
]
```

**Rendering**:
```tsx
<section className="h-72">
  <div className="flex flex-col gap-4 h-full">
    {actions.map(action => (
      <Link href={action.href} className={`${action.color} flex-1`}>
        <IconAndText />
      </Link>
    ))}
  </div>
</section>
```

### 8.3 Smart Alerts Component

**File**: `smart-alerts.tsx`

**Alert Interface**:
```typescript
interface Alert {
  id: string
  type: "warning" | "info" | "urgent"
  icon: LucideIcon
  title: string
  message: string
  action: { label: string; href: string }
  color: string
  bgColor: string
}
```

**Sample Alerts**:
```typescript
const alerts: Alert[] = [
  {
    id: "1",
    type: "urgent",
    icon: Clock,
    title: "Quote Expiring Soon",
    message: "Quote #Q-2345 expires in 2 days...",
    action: { label: "Convert Now", href: "/profile/quotes/Q-2345" },
    color: "text-red-600",
    bgColor: "bg-red-50"
  },
  // ...
]
```

### 8.4 Quick Performance Snapshot Component

**File**: `quick-performance-snapshot.tsx`

**Stat Interface**:
```typescript
interface Stat {
  label: string
  value: string
  trend?: string        // "↑24%"
  icon: LucideIcon
  color: string         // "text-green-600"
  bgColor: string       // "bg-green-50"
  href: string
  action?: string       // "→ Convert to Order"
  subtext?: string      // "new"
}
```

**Grid Layout**: 5 columns on desktop, 2 on tablet/mobile

---

## 9. Interactive Elements

### 9.1 Clickable Elements

**Verification Status Card**:
- **Upload Documents Button**: Opens verification page
- **View Benefits Button**: Shows benefits modal/page

**Primary Action Bar**:
- **All 3 buttons**: Navigate to respective pages

**Smart Alerts**:
- **Each alert card**: Clickable background
- **Action button**: Primary CTA

**Performance Snapshot**:
- **All 5 stat cards**: Navigate to filtered views
- **Hover**: Visual feedback (shadow, border change)

**Unified Timeline**:
- **Timeline items**: Click to view details
- **Filters**: Dropdown/toggle buttons
- **Load more**: Pagination

**Exclusive Products**:
- **Product cards**: View product details
- **Add to Cart/Quote**: Quick actions

**Tawk.to Chat**:
- **Chat icon**: Open/close chat
- **Minimize/maximize**: Chat window controls

### 9.2 Hover Effects

**All Cards**:
- `hover:shadow-lg` - Elevate shadow
- `hover:border-blue-300` - Border color change
- `transform hover:-translate-y-1` - Slight lift

**Buttons**:
- Background darkens
- Icon backgrounds lighten
- Smooth transitions (300ms)

**Icons**:
- `group-hover:scale-110` - Scale up
- `group-hover:bg-white/30` - Background lightens

### 9.3 Responsive Behavior

**Desktop (> 1024px)**:
- Verification card + Action bar: Side by side (2:1 ratio)
- Alerts: 3 columns
- Performance: 5 columns
- Timeline: Full width with sidebar
- Products: 4 columns

**Tablet (768px - 1024px)**:
- Verification card + Action bar: Stacked
- Alerts: 2 columns
- Performance: 3 columns
- Timeline: Full width
- Products: 3 columns

**Mobile (< 768px)**:
- **Not Rendered**: Business Hub is desktop-only
- Mobile users navigate via bottom nav "Business" tab to profile/quotes

---

## Summary

The Business Hub provides business users with:

✅ **Centralized Dashboard**: All business operations in one place  
✅ **Verification Management**: Clear status and actions  
✅ **Performance Monitoring**: Real-time business metrics  
✅ **Quick Actions**: Streamlined workflow  
✅ **Smart Alerts**: Proactive notifications  
✅ **Unified Timeline**: Combined orders and quotes feed  
✅ **Exclusive Access**: Verified-only products and features  
✅ **Support**: Integrated live chat  

**Key Differences**:
- **Unverified**: Limited to quote requests, cannot checkout, verification prompts
- **Verified**: Full access, order placement, enhanced metrics, priority features

---

**End of Document**

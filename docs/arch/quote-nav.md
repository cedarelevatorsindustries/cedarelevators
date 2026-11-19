# Cedar Elevators - Quote Bottom Navbar (Mobile) Complete Overview

**Last Updated**: December 28, 2025  
**Version**: 1.0  
**Platform**: Mobile Only  
**Position**: 3rd Element in Bottom Navigation (Center)
**User Types Covered**: Guest, Individual, Business Unverified, Business Verified

---

## Table of Contents

1. [Quote Tab Overview](#quote-tab-overview)
2. [Bottom Navigation Context](#bottom-navigation-context)
3. [Guest Users](#guest-users)
4. [Individual Users](#individual-users)
5. [Business Unverified Users](#business-unverified-users)
6. [Business Verified Users](#business-verified-users)
7. [Navigation Behavior](#navigation-behavior)
8. [Visual Design](#visual-design)
9. [Component Details](#component-details)

---

## 1. Quote Tab Overview

### 1.1 What is the Quote Tab?

The **Quote Tab** is the **3rd element** (center position) in the mobile bottom navigation bar. It provides quick access to quote-related features, and its label and destination dynamically change based on the user's account type.

### 1.2 Purpose

- Quick access to quote functionality
- Primary CTA for mobile users
- User-type specific navigation
- Centralized business operations (for business users)

### 1.3 Position

```
┌────────────────────────────────────────────┐
│           Mobile Bottom Navigation         │
├──────┬──────┬──────┬──────┬──────┬────────┤
│  🏠  │  🛍️  │  📄  │  🛒  │  👤  │        │
│ Home │Catalog│Quote │ Cart │Profile│        │
│      │      │  ↑   │      │      │        │
│      │      │  3rd │      │      │        │
└──────┴──────┴──────┴──────┴──────┴────────┘
         Position 1, 2, [3], 4, 5
```

### 1.4 Icon

**Icon Component**: `FileText` from lucide-react  
**Size**: 24px  
**Color**: 
- Active: Orange (`#F97316`)
- Inactive: Gray (`#6B7280`)

---

## 2. Bottom Navigation Context

### 2.1 Full Navigation Structure

The mobile bottom navigation consists of **5 items**:

| Position | Icon | Label | href | Always Visible |
|----------|------|-------|------|----------------|
| 1 | Home | Home | `/` | ✅ Yes |
| 2 | ShoppingBag | Catalog | `/catalog` | ✅ Yes |
| **3** | **FileText** | **[Dynamic]** | **[Dynamic]** | ✅ **Yes** |
| 4 | ShoppingCart | Cart | `/cart` | ✅ Yes |
| 5 | User | My Cedar | `/profile` | ✅ Yes |

### 2.2 Configuration

**File**: `nav-items-config.ts`

```typescript
export const navItems: NavItemConfig[] = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/catalog", icon: ShoppingBag, label: "Catalog" },
  { href: "/request-quote", icon: FileText, label: "Quote" },
  { href: "/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/profile", icon: User, label: "My Cedar" }
]
```

### 2.3 Dynamic Label Logic

The Quote tab's label changes based on user type:

```typescript
export function getQuoteTabLabel(userType: "guest" | "individual" | "business"): string {
  switch (userType) {
    case "guest":
      return "Get Quote"
    case "individual":
      return "My Quotes"
    case "business":
      return "Business"
    default:
      return "Quote"
  }
}
```

**Fetch Logic**:
```typescript
useEffect(() => {
  async function fetchUserType() {
    const response = await fetch('/api/auth/user-type')
    const data = await response.json()
    setQuoteLabel(getQuoteTabLabel(data.userType || 'guest'))
  }
  fetchUserType()
}, [])
```

---

## 3. Guest Users

### 3.1 Quote Tab Configuration

**Label**: "Get Quote"  
**Destination**: `/request-quote`  
**Icon**: FileText (Document icon)

### 3.2 Visual Appearance

**Inactive State**:
```
┌─────────┐
│   📄   │  FileText icon (gray)
│ Get    │  Text (gray, text-xs)
│ Quote  │
└─────────┘
```

**Active State** (when on `/request-quote`):
```
┌─────────┐
│   📄   │  FileText icon (orange)
│ Get    │  Text (orange, text-xs, font-medium)
│ Quote  │
└─────────┘
```

### 3.3 Tap Behavior

**Action**: Navigate to `/request-quote`

**Flow**:
1. User taps "Get Quote"
2. Navigates to quote request page
3. Shows **Guest Quote Form**:
   - Name (required)
   - Email (required)
   - Phone (required)
   - Company (optional)
   - Message/Requirements (required)
   - Attachments (optional, max 3 files)
   - Quote basket items (if any)

### 3.4 Quote Request Page (Guest)

**Form Type**: Basic/Simplified

**Fields**:
- Personal details (name, email, phone)
- Basic requirements text
- File attachments (limited)
- No quote basket integration (standalone inquiry)

**Limitations**:
- ❌ Cannot see prices
- ❌ No quote history
- ❌ No quote basket persistence
- ❌ No quote templates
- ❌ Limited attachment size/count

**After Submission**:
- Confirmation message
- Email sent with quote request details
- Redirected to homepage
- **No tracking** (guest has no profile)

### 3.5 Icon & Label

**Label**: "Get Quote" (2 lines)  
**Font Size**: `text-xs` (12px)  
**Color**: Gray `#6B7280` (inactive), Orange `#F97316` (active)

---

## 4. Individual Users

### 4.1 Quote Tab Configuration

**Label**: "My Quotes"  
**Destination**: `/request-quote`  
**Icon**: FileText (Document icon)

### 4.2 Visual Appearance

**Inactive State**:
```
┌─────────┐
│   📄   │  FileText icon (gray)
│  My    │  Text (gray, text-xs)
│ Quotes │
└─────────┘
```

**Active State**:
```
┌─────────┐
│   📄   │  FileText icon (orange)
│  My    │  Text (orange, text-xs, font-medium)
│ Quotes │
└─────────┘
```

### 4.3 Tap Behavior

**Action**: Navigate to `/request-quote`

**Page Content**: Individual Quote Request Page

**Features**:
- **Quote Form** (Standard level)
- **Quote History** link
- **Saved Draft** (if applicable)

### 4.4 Quote Request Page (Individual)

**Form Type**: Standard (More fields than guest)

**Form Fields**:
- Name (pre-filled from profile)
- Email (pre-filled, read-only)
- Phone (pre-filled, editable)
- Company (optional)
- **Requirements/Message** (required, longer textarea)
- **Product Selection**: Can add from quote basket
- **Attachments**: Up to 5 files, max 10MB each
- **Delivery Timeline**: Expected delivery date
- **Quantity**: Per item quantities

**Quote Basket**:
- ✅ Shows current basket items
- ✅ Can modify quantities
- ✅ Can remove items
- ✅ Persisted to database

**After Submission**:
- Success message
- Navigates to "My Quotes" view
- Can track quote status
- Can view quote history

**Features Available**:
- Submit quote request
- View quote history
- Track quote status
- View admin responses
- **Cannot** see pricing (prices hidden)
- **Cannot** convert to order (no checkout access)

### 4.5 My Quotes View

**Access**: Tap "View My Quotes" link on request page, or Profile → My Quotes

**Content**:
- List of all submitted quotes
- Status badges (Pending, In Review, Revised, Accepted, Rejected)
- Quote details on tap
- Admin messages/responses
- Timeline view

**Quote Card Structure**:
```
┌───────────────────────────────────────┐
│ Quote #Q-1234              [Pending]  │
│ Submitted: Dec 28, 2024               │
│ Items: 3 | Status: Awaiting Review    │
│ ──────────────────────────────────    │
│ [View Details] [Message Admin]        │
└───────────────────────────────────────┘
```

### 4.6 Icon & Label

**Label**: "My Quotes" (2 lines)  
**Font Size**: `text-xs` (12px)  
**Color**: Gray (inactive), Orange (active)

---

## 5. Business Unverified Users

### 5.1 Quote Tab Configuration

**Label**: "Business"  
**Destination**: `/request-quote`  
**Icon**: FileText (Document icon)

### 5.2 Visual Appearance

**Inactive State**:
```
┌─────────┐
│   📄   │  FileText icon (gray)
│Business│  Text (gray, text-xs)
│        │  (Single line, centered)
└─────────┘
```

**Active State**:
```
┌─────────┐
│   📄   │  FileText icon (orange)
│Business│  Text (orange, text-xs, font-medium)
│        │
└─────────┘
```

### 5.3 Tap Behavior

**Action**: Navigate to `/request-quote` or Business Hub mobile view

**Page Content**: Business Quote Request + Verification Prompt

### 5.4 Quote Request Page (Business Unverified)

**Form Type**: Enhanced Business Form

**Form Fields**:
- **Personal Details**: Pre-filled from profile
- **Company Details**: 
  - Company name (required, pre-filled)
  - GST Number (optional)
  - Industry (dropdown)
- **Quote Details**:
  - Requirements (rich text editor)
  - Product selection from basket
  - Bulk quantities supported
  - Delivery timeline
  - Payment terms preference
- **Attachments**: Up to 10 files, 25MB each
- **Quote Template**: Can save as template (for future use)
- **Bulk Upload**: CSV upload for large orders

**Verification Banner** (Top of page):
```
┌───────────────────────────────────────────────┐
│ ⚠️ Complete Verification                      │
│ Unlock full features by completing business   │
│ verification.                                  │
│ [Complete Verification →]                      │
└───────────────────────────────────────────────┘
```

**Limitations**:
- ✅ Can submit enhanced quote requests
- ✅ Can use quote templates
- ✅ Can view quote history
- ❌ **Cannot see pricing** (pricing hidden until verified)
- ❌ **Cannot checkout** (blocked)
- ❌ **Cannot convert quotes to orders**
- ⚠️ Some fields may be limited

**After Submission**:
- Success message
- Quotes list view
- Admin review notification
- Status: "Pending Review"

### 5.5 Business Hub Mobile View (Alternative)

Some implementations may show a mobile-adapted Business Hub:

**Sections** (Stacked):
1. Verification Status Card
2. Quick Actions (3 buttons)
3. Smart Alerts (if any)
4. Recent Quotes List
5. Performance Stats (simplified)

**Access**:
- From Quote tab
- Or from Profile → Business section

### 5.6 Icon & Label

**Label**: "Business" (Single line)  
**Font Size**: `text-xs` (12px)  
**Color**: Gray (inactive), Orange (active)

---

## 6. Business Verified Users

### 6.1 Quote Tab Configuration

**Label**: "Business"  
**Destination**: `/request-quote` (Enhanced) or `/business-hub` (Mobile view)  
**Icon**: FileText (Document icon)

### 6.2 Visual Appearance

**Inactive State**:
```
┌─────────┐
│   📄   │  FileText icon (gray)
│Business│  Text (gray, text-xs)
│        │  (Single line, centered)
└─────────┘
```

**Active State** (with optional badge):
```
┌─────────┐
│   📄🟢 │  FileText icon (orange) + Verified badge
│Business│  Text (orange, text-xs, font-medium)
│        │
└─────────┘
```

### 6.3 Tap Behavior

**Action**: Navigate to Business Hub (Mobile) or Enhanced Quote Page

**Destination Options**:
1. **Business Hub Mobile View**: Comprehensive dashboard
2. **Quick Quote Page**: Streamlined quote creation
3. **Quotes List**: View all quotes with quick actions

### 6.4 Business Hub Mobile View (Verified)

**Landing Page**: Mobile-optimized Business Hub

**Sections** (Stacked, Swipeable):

1. **Status Card** (Top)
   ```
   ┌────────────────────────────────────┐
   │ ✅ Verified Partner Status          │
   │ Access all features                │
   │ [View Benefits]                    │
   └────────────────────────────────────┘
   ```

2. **Quick Actions** (3x Cards)
   ```
   ┌──────────┬──────────┬──────────┐
   │ Start    │  Shop    │  Quick   │
   │ Bulk     │ Catalog  │ Reorder  │
   │ Quote    │          │          │
   └──────────┴──────────┴──────────┘
   ```

3. **Performance Snapshot** (Horizontal Scroll)
   ```
   ← ┌─────┬─────┬─────┬─────┬─────┐ →
     │Sales│Pend │Appro│Total│Activ│
     │This │Quote│ved  │Order│Inqui│
     │Month│  s  │Ready│  s  │ries │
     └─────┴─────┴─────┴─────┴─────┘
   ```

4. **Smart Alerts** (If any)
   - Expiring quotes
   - Pending approvals
   - Low stock

5. **Recent Activity** (Last 10)
   - Orders
   - Quotes
   - Messages
   - Status updates

6. **Quick Quote Form** (Collapsed, expandable)
   - Tap to expand
   - Fill and submit
   - Templates dropdown

7. **Recent Quotes** (Swipeable Cards)
   - Last 5 quotes
   - Quick actions
   - Swipe for more

### 6.5 Enhanced Quote Request Page (Verified)

**Form Type**: Premium Business Form

**Features**:
- **All fields from unverified** +
- **Pricing Preview**: Shows estimated bulk pricing
- **Payment Terms**: Net-30, Net-60 options
- **Priority Processing**: Expedited review
- **Template Library**: Save and reuse quote templates
- **Bulk CSV Upload**: For large orders
- **Auto-negotiation**: AI-suggested pricing
- **Convert to Order**: Direct checkout option (for approved quotes)

**After Submission**:
- Priority review notification
- Faster response time (within 24 hours)
- Can track in real-time
- Can convert approved quotes instantly

### 6.6 Quote Detail View (Verified)

**Enhanced Features**:
- **Pricing Visible**: Admin-set prices shown
- **Convert to Order**: One-tap conversion
- **Negotiation Chat**: Real-time messaging
- **Document Attachments**: Technical specs, CAD files
- **Payment Schedule**: View payment terms
- **Invoice Preview**: See invoice before converting

**Quote Actions**:
```
┌─────────────────────────────────────┐
│ Quote #Q-5678         [Approved ✅] │
│ ───────────────────────────────────  │
│ Items: 5 | Total: ₹1,25,000         │
│ Bulk Discount: 15% applied          │
│ ───────────────────────────────────  │
│ [Convert to Order] [Download PDF]   │
│ [Negotiate] [Message Admin]         │
└─────────────────────────────────────┘
```

### 6.7 Icon & Label

**Label**: "Business" (Single line)  
**Font Size**: `text-xs` (12px)  
**Color**: Gray (inactive), Orange (active)  
**Badge**: Small green dot (verified indicator)

---

## 7. Navigation Behavior

### 7.1 Active State Detection

**Logic**:
```typescript
const isActive = (href: string) => {
  if (href === "/") return pathname === "/"
  return pathname.startsWith(href)
}
```

**Active Routes for Quote Tab**:
- `/request-quote` - Main quote page
- `/request-quote/*` - All quote sub-routes
- `/business-hub` - Business hub (if implemented on mobile)
- `/profile/quotes` - Quotes list (may also activate)

### 7.2 Deep Linking

**Scenarios**:

1. **Guest clicks "Get Quote"**:
   - Direct to `/request-quote`
   - Shows guest form
   - No authentication required

2. **Individual clicks "My Quotes"**:
   - Direct to `/request-quote`
   - If logged in: Shows quote form + history
   - If not logged in: Redirect to login → return to quote page

3. **Business clicks "Business"**:
   - If verified: Business Hub or enhanced quote page
   - If unverified: Quote page with verification banner
   - Authentication required

### 7.3 URL Persistence

**Behavior**:
- URL updates on navigation
- Back button works correctly
- Shareable links
- Deep linking supported

**Examples**:
- Guest: `/request-quote`
- Individual: `/request-quote` or `/profile/quotes`
- Business: `/business-hub` or `/request-quote/business`

### 7.4 Badge Notifications (Future)

**Concept**: Show notification badge for new quote responses

```
┌─────────┐
│  📄(2) │  FileText icon + badge (orange dot with count)
│Business│
└─────────┘
```

**Triggers**:
- New admin message on quote
- Quote status change (e.g., Approved)
- Expiring quote reminder

---

## 8. Visual Design

### 8.1 Bottom Nav Container

**Specs**:
- **Position**: Fixed, bottom of viewport
- **Height**: 64px (h-16)
- **Background**: White (`bg-white`)
- **Border**: Top border, gray-200 (`border-t border-gray-200`)
- **Z-index**: 40 (above content, below modals)
- **Grid**: 5 equal columns (`grid-cols-5`)
- **Display**: Hidden on desktop (`md:hidden`)

**Full Structure**:
```tsx
<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
  <div className="grid grid-cols-5 h-16">
    {/* 5 nav items */}
  </div>
</div>
```

### 8.2 Individual Nav Item (Quote Tab)

**Component Structure**:
```tsx
<Link href="/request-quote">
  <div className="flex flex-col items-center justify-center h-full gap-1">
    <FileText 
      size={24} 
      className={isActive ? "text-orange-500" : "text-gray-500"}
    />
    <span className={cn(
      "text-xs text-center",
      isActive ? "text-orange-500 font-medium" : "text-gray-600"
    )}>
      {quoteLabel}
    </span>
  </div>
</Link>
```

**Sizing**:
- Icon: 24x24px
- Gap between icon and label: 4px (gap-1)
- Label: text-xs (12px), text-center
- Total height: 64px (full nav bar height)

### 8.3 Colors

**Inactive**:
- Icon: `text-gray-500` (#6B7280)
- Label: `text-gray-600` (#4B5563)

**Active**:
- Icon: `text-orange-500` (#F97316)
- Label: `text-orange-500 font-medium` (#F97316, bold)

**Hover** (Touch):
- Slight background tint on tap (optional)
- Ripple effect (material design, optional)

### 8.4 Transitions

**Smooth Transitions**:
```css
transition: color 200ms ease-in-out, transform 150ms ease-in-out
```

**Tap Feedback**:
- `active:scale-95` - Slight scale down on tap
- Quick spring back

### 8.5 Accessibility

**Touch Target**:
- Minimum: 48x48px (exceeds since full height is 64px)
- Each nav item is full height for easy tapping

**Labels**:
- Always visible (not hidden)
- Readable size (12px minimum)
- High contrast

**ARIA**:
```tsx
<Link 
  href="/request-quote" 
  aria-label={`Go to ${quoteLabel}`}
  aria-current={isActive ? "page" : undefined}
>
  {/* Content */}
</Link>
```

---

## 9. Component Details

### 9.1 NavItem Component

**File**: `bottom-nav/components/nav-item.tsx`

**Props**:
```typescript
interface NavItemProps {
  href: string
  icon: React.ComponentType<{ size?: number }>
  label: string
  isActive: boolean
}
```

**Implementation**:
```tsx
export function NavItem({ href, icon: Icon, label, isActive }: NavItemProps) {
  return (
    <Link 
      href={href}
      className="flex flex-col items-center justify-center h-full gap-1 transition-colors"
    >
      <Icon 
        size={24}
        className={cn(
          "transition-colors",
          isActive ? "text-orange-500" : "text-gray-500"
        )}
      />
      <span className={cn(
        "text-xs text-center transition-colors",
        isActive 
          ? "text-orange-500 font-medium" 
          : "text-gray-600"
      )}>
        {label}
      </span>
    </Link>
  )
}
```

### 9.2 MobileBottomNavigation Component

**File**: `bottom-nav/index.tsx`

**State**:
```typescript
const [quoteLabel, setQuoteLabel] = useState("Quote")
```

**Effect** (Fetch user type):
```typescript
useEffect(() => {
  async function fetchUserType() {
    try {
      const response = await fetch('/api/auth/user-type')
      const data = await response.json()
      setQuoteLabel(getQuoteTabLabel(data.userType || 'guest'))
    } catch (error) {
      setQuoteLabel(getQuoteTabLabel('guest'))
    }
  }
  fetchUserType()
}, [])
```

**Render**:
```tsx
<div className="grid grid-cols-5 h-16">
  {navItems.map((item) => (
    <NavItem
      key={item.href}
      href={item.href}
      icon={item.icon}
      label={item.href === "/request-quote" ? quoteLabel : item.label}
      isActive={isActive(item.href)}
    />
  ))}
</div>
```

### 9.3 Label Update Logic

**Function**:
```typescript
export function getQuoteTabLabel(
  userType: "guest" | "individual" | "business"
): string {
  switch (userType) {
    case "guest":
      return "Get Quote"
    case "individual":
      return "My Quotes"
    case "business":
      return "Business"
    default:
      return "Quote"
  }
}
```

**API Endpoint**: `/api/auth/user-type`

**Response**:
```json
{
  "userType": "guest" | "individual" | "business",
  "isVerified": boolean
}
```

### 9.4 Configuration Override

**Props**:
```typescript
interface MobileBottomNavigationProps {
  className?: string
  customConfig?: Partial<NavbarConfig>
}
```

**Usage**:
```tsx
<MobileBottomNavigation 
  customConfig={{
    mobile: {
      showBottomNav: false // Hide on checkout
    }
  }}
/>
```

**Conditional Rendering**:
```typescript
if (!config.mobile.showBottomNav) {
  return null
}
```

**Pages that hide bottom nav**:
- `/checkout` - Full-screen checkout
- `/checkout/success` - Order confirmation
- Modals/overlays (optional)

---

## Summary

The Quote Tab (3rd element) in mobile bottom navigation provides:

✅ **Dynamic Labeling**: Changes based on user type (Get Quote, My Quotes, Business)  
✅ **Contextual Destination**: Navigates to appropriate page per user  
✅ **Always Accessible**: Fixed position, always visible (except on checkout)  
✅ **Clear Visual Feedback**: Active/inactive states with color change  
✅ **User-Specific Features**: Enhanced functionality for business users  

**Key Differences by User Type**:

| User Type | Label | Destination | Features |
|-----------|-------|-------------|----------|
| **Guest** | Get Quote | `/request-quote` | Basic form, no history |
| **Individual** | My Quotes | `/request-quote` | Standard form, quote history, no pricing |
| **Business Unverified** | Business | `/request-quote` | Enhanced form, verification prompt, no checkout |
| **Business Verified** | Business | `/business-hub` or `/request-quote` | Full features, pricing, convert to order |

---

**End of Document**

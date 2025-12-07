# Floating Action Buttons Guide

## Overview
The Cedar Storefront includes a sticky floating action card on the bottom-right corner of the page with WhatsApp contact and "Back to top" functionality.

## Features
- ✅ Sticky positioning (bottom-right corner)
- ✅ WhatsApp button with direct chat link
- ✅ Back to top button (appears after scrolling 300px)
- ✅ Expandable card on hover
- ✅ Smooth animations and transitions
- ✅ Mobile responsive
- ✅ Optional survey button

## Components

### FloatingActionCard (Main Component)
Full-featured expandable card with multiple actions.

**Props:**
- `whatsappNumber` (string, optional) - WhatsApp number with country code (default: "+919876543210")
- `showSurvey` (boolean, optional) - Show/hide survey button (default: false)
- `surveyUrl` (string, optional) - Survey page URL (default: "/survey")

**Features:**
- Expands on hover to show labels
- WhatsApp button (green, always visible)
- Survey button (optional)
- Back to top button (shows after scrolling 300px)
- Pulse indicator when collapsed

### SimpleFloatingActions (Alternative)
Simplified version with just WhatsApp and Back to top buttons.

**Props:**
- `whatsappNumber` (string, optional) - WhatsApp number with country code

**Features:**
- Individual circular buttons
- Tooltip on hover
- No expansion behavior
- Cleaner, minimal design

## Usage

### In Layout (Already Integrated)
```tsx
import { FloatingActionCard } from "@/components/ui/floating-actions"

<FloatingActionCard 
  whatsappNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
  showSurvey={false}
/>
```

### Alternative Simple Version
```tsx
import { SimpleFloatingActions } from "@/components/ui/floating-actions"

<SimpleFloatingActions 
  whatsappNumber="+919876543210"
/>
```

### With Survey Button
```tsx
<FloatingActionCard 
  whatsappNumber="+919876543210"
  showSurvey={true}
  surveyUrl="/customer-feedback"
/>
```

## Configuration

### Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=+919876543210
```

Replace with your actual WhatsApp business number.

### WhatsApp Message Template
Default message: "Hi, I'm interested in your elevator products."

To customize, edit the `openWhatsApp` function in `floating-action-card.tsx`:
```tsx
const message = encodeURIComponent("Your custom message here")
```

### Scroll Threshold
Back to top button appears after scrolling 300px. To change:
```tsx
setShowBackToTop(window.scrollY > 300) // Change 300 to your preferred value
```

## Styling

### Colors
- WhatsApp button: `bg-green-500` (hover: `bg-green-600`)
- Back to top button: `bg-white` with border
- Survey button: `bg-gray-100`
- Card background: `bg-white` with shadow

### Positioning
- Fixed position: `bottom-4 right-4` (16px from edges)
- Z-index: `z-50` (above most content)

### Animations
- Expand/collapse: 300ms ease-in-out
- Hover scale: 110%
- Fade in: 200ms
- Pulse indicator on collapsed state

## Customization

### Change Position
```tsx
// In floating-action-card.tsx
className="fixed right-4 bottom-4" // Change right-4 or bottom-4
```

### Change Colors
```tsx
// WhatsApp button
className="bg-green-500 hover:bg-green-600" // Change to your brand color

// Back to top button
className="bg-white hover:bg-gray-50" // Customize as needed
```

### Add More Actions
Add new buttons inside the card:
```tsx
<div className="flex items-center gap-3 mb-3">
  <button className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full">
    <YourIcon className="w-6 h-6" />
  </button>
  {isExpanded && (
    <div className="flex-1">
      <p className="text-sm font-semibold">Your Action</p>
      <p className="text-xs text-gray-600">Description</p>
    </div>
  )}
</div>
```

## Mobile Behavior
- Buttons are slightly smaller on mobile
- Touch-friendly tap targets (48x48px minimum)
- Tooltips hidden on mobile (hover not available)
- Positioned to avoid bottom navigation

## Accessibility
- Proper ARIA labels on all buttons
- Keyboard accessible
- Focus states included
- Screen reader friendly

## Browser Support
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support

## Performance
- Minimal JavaScript
- CSS transitions (GPU accelerated)
- Scroll listener with passive flag
- No external dependencies

## Troubleshooting

### WhatsApp not opening
- Verify phone number format: `+[country code][number]`
- Remove spaces, dashes, or special characters
- Test the number manually: `https://wa.me/919876543210`

### Back to top not appearing
- Check scroll position threshold (default: 300px)
- Verify page has enough content to scroll
- Check z-index conflicts

### Card not expanding
- Verify hover events are working
- Check for CSS conflicts
- Test on desktop (hover doesn't work on mobile)

## Examples

### E-commerce Store
```tsx
<FloatingActionCard 
  whatsappNumber="+919876543210"
  showSurvey={true}
  surveyUrl="/product-feedback"
/>
```

### Service Website
```tsx
<SimpleFloatingActions 
  whatsappNumber="+919876543210"
/>
```

### B2B Platform
```tsx
<FloatingActionCard 
  whatsappNumber="+919876543210"
  showSurvey={false}
/>
```

## File Structure
```
src/
└── components/
    └── ui/
        └── floating-actions/
            ├── floating-action-card.tsx  # Main component
            └── index.ts                  # Exports
```

## Future Enhancements
- [ ] Add email contact button
- [ ] Add phone call button
- [ ] Add live chat integration
- [ ] Add social media links
- [ ] Add language selector
- [ ] Add theme toggle
- [ ] Add notification badge
- [ ] Add custom icon support

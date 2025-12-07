# Pusher Real-Time Notifications Guide

## Overview
The Cedar Storefront uses Pusher for real-time in-app notifications. Notifications are only visible to logged-in users and appear in:
- Notification bell icon in the navbar (desktop & mobile)
- Notification dropdown/hover card
- Dedicated `/notifications` page

**No toast notifications** - all notifications are silent and only visible in the notification center.

## Features
- ✅ Real-time delivery via Pusher WebSockets
- ✅ Only for authenticated users
- ✅ Unread count badge
- ✅ Mark as read/unread
- ✅ Clear all notifications
- ✅ Connection status indicator
- ✅ Notification types: success, info, warning, error
- ✅ Optional links to related pages
- ✅ Persistent in-memory storage (last 50 notifications)

## Configuration

### Environment Variables
Add to `.env.local`:
```env
NEXT_PUBLIC_PUSHER_KEY=aad9545ead3e5677b29e
NEXT_PUBLIC_PUSHER_CLUSTER=ap2
```

### Pusher Channel Structure
- **Guest users**: No notifications (not subscribed)
- **Logged-in users**: Subscribe to `user-{userId}` channel

## Usage

### In Components
```tsx
import { useNotifications } from '@/lib/hooks'

function MyComponent() {
  const { user } = useUser()
  
  const { 
    notifications, 
    unreadCount, 
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications 
  } = useNotifications({ 
    customerId: user?.id,
    channel: user?.id ? `user-${user.id}` : undefined
  })
  
  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
    </div>
  )
}
```

### Sending Notifications from Backend

#### Event Structure
```json
{
  "id": "unique-id",
  "title": "Order Confirmed",
  "message": "Your order #12345 has been confirmed",
  "type": "success",
  "link": "/orders/12345",
  "created_at": "2024-12-01T10:30:00Z"
}
```

#### Notification Types
- `success` - Green border, success icon
- `info` - Blue border, info icon (default)
- `warning` - Yellow border, warning icon
- `error` - Red border, error icon

#### Example: Node.js Backend
```javascript
const Pusher = require('pusher')

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
})

// Send notification to specific user
async function sendNotification(userId, notification) {
  await pusher.trigger(`user-${userId}`, 'new_notification', {
    id: crypto.randomUUID(),
    title: notification.title,
    message: notification.message,
    type: notification.type || 'info',
    link: notification.link,
    created_at: new Date().toISOString()
  })
}

// Example: Order confirmation
await sendNotification('user_123', {
  title: 'Order Confirmed',
  message: 'Your order #12345 for ₹5,000 has been confirmed',
  type: 'success',
  link: '/orders/12345'
})
```

## Testing

### Using Pusher Debug Console
1. Go to [Pusher Dashboard](https://dashboard.pusher.com)
2. Select your app → "Debug Console"
3. Enter:
   - **Channel**: `user-{userId}` (get userId from test page)
   - **Event**: `new_notification`
   - **Data**:
     ```json
     {
       "title": "Test Notification",
       "message": "This is a test message",
       "type": "success",
       "link": "/dashboard"
     }
     ```
4. Click "Send event"
5. Check the notification bell in navbar

### Using Test Page
1. Sign in to the app
2. Visit `/notifications/test`
3. Fill in notification details
4. Copy the generated Pusher event data
5. Send via Pusher Debug Console

## Pages

### `/notifications`
Full-page notification center showing all notifications with:
- Unread count
- Connection status
- Mark all as read
- Clear all notifications
- Individual notification cards with actions

### `/notifications/test`
Developer test page for generating test notification data

## File Structure
```
src/
├── lib/
│   ├── pusher/
│   │   ├── pusher-client.ts      # Pusher client singleton
│   │   └── index.ts
│   └── hooks/
│       ├── use-notifications.ts   # Main notification hook
│       └── index.ts
├── components/
│   └── ui/
│       └── notifications/
│           ├── notification-bell.tsx  # Standalone bell component
│           └── index.ts
├── modules/
│   └── layout/
│       └── components/
│           ├── desktop/navbar/components/
│           │   └── notification-hover-card.tsx  # Desktop dropdown
│           └── mobile/top-bar/
│               └── components/
│                   └── top-bar-header.tsx       # Mobile bell
└── app/
    └── (main)/
        └── notifications/
            ├── page.tsx           # Main notifications page
            └── test/
                └── page.tsx       # Test page
```

## Best Practices

### Backend Integration
1. **Always include userId** in channel name: `user-{userId}`
2. **Generate unique IDs** for each notification
3. **Include timestamps** in ISO format
4. **Add links** for actionable notifications
5. **Use appropriate types** (success/error/warning/info)

### Frontend Usage
1. **Only subscribe for logged-in users** (already handled)
2. **Don't show toast notifications** (disabled by default)
3. **Keep notifications in memory** (last 50 auto-managed)
4. **Handle connection states** (show offline indicator)

### Security
- Pusher channels are public by default
- For sensitive data, use [private channels](https://pusher.com/docs/channels/using_channels/private-channels/)
- Never expose `PUSHER_SECRET` in frontend code

## Troubleshooting

### Notifications not appearing
1. Check user is logged in
2. Verify Pusher credentials in `.env.local`
3. Check browser console for connection errors
4. Verify channel name matches: `user-{userId}`
5. Check Pusher Debug Console for event delivery

### Connection issues
- Red dot = Disconnected
- Green dot = Connected
- Check network tab for WebSocket connection
- Verify Pusher cluster is correct (ap2 for India/Singapore)

### Badge not updating
- Ensure `useNotifications` hook is called with correct `customerId`
- Check React DevTools for state updates
- Verify event is being received in browser console (Pusher.logToConsole = true)

## Free Tier Limits
- 200,000 messages/day
- 100 concurrent connections
- Unlimited channels
- No credit card required

Upgrade if you exceed limits or need private channels.

## Support
- [Pusher Documentation](https://pusher.com/docs/channels/)
- [Pusher Dashboard](https://dashboard.pusher.com)
- Internal: Check `docs/pusher-notifications-guide.md`

# Cedar Storefront Documentation

Documentation for the Next.js storefront application.

---

## 📚 Documentation

- **[Role Sync Setup](role-sync-setup.md)** - B2B/B2C role synchronization
- **[Medusa Integration](medusa-integration-guide.md)** - Medusa backend integration
- **[Homepage Structure](homepage-structure.md)** - Homepage component structure
- **[Homepage Layout](homepage-layout-guide.md)** - Homepage layout guide

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev
```

Visit: http://localhost:3000

---

## 📁 Project Structure

```
cedar-storefront/
├── src/
│   ├── app/                   # Next.js app directory
│   │   ├── (auth)/           # Auth routes
│   │   ├── (dashboard)/      # Dashboard routes
│   │   └── api/              # API routes
│   ├── components/
│   │   ├── guards/           # Role-based guards
│   │   └── providers/        # Context providers
│   ├── lib/
│   │   ├── auth/             # Auth utilities
│   │   ├── db/               # Database client
│   │   ├── hooks/            # Custom hooks
│   │   └── medusa/           # Medusa SDK
│   ├── modules/              # Feature modules
│   └── middleware.ts         # Route protection
└── docs/                     # This folder
```

---

## 🔑 Key Features

### Role-Based Authentication
- Client-side role detection with `useAccountType()` hook
- Server-side utilities for role checking
- Guard components for conditional rendering
- Middleware for route protection

### Auto-Sync System
- Automatic role synchronization on login
- `RoleSyncProvider` wraps entire app
- Syncs Clerk → Neon DB → Medusa

### Protected Routes
- `/dashboard` - Authenticated users only
- `/quotes` - Business users only
- `/bulk-orders` - Business users only
- `/invoices` - Business users only
- `/team` - Business users only

---

## 🛠️ Environment Variables

Create `.env.local`:

```env
# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Medusa
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_...

# Neon Database
DATABASE_URL=postgresql://...

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=...
```

---

## 📖 Usage Examples

### Client-Side Role Detection

```typescript
import { useAccountType } from "@/lib/hooks/use-account-type"

export default function Dashboard() {
  const { isBusiness, isIndividual, companyName } = useAccountType()
  
  if (isBusiness) {
    return <BusinessDashboard company={companyName} />
  }
  
  return <IndividualDashboard />
}
```

### Guard Components

```tsx
import { BusinessOnly, IndividualOnly } from "@/components/guards"

export default function Page() {
  return (
    <>
      <BusinessOnly>
        <BulkOrderButton />
      </BusinessOnly>
      
      <IndividualOnly>
        <StandardCheckout />
      </IndividualOnly>
    </>
  )
}
```

### Server-Side Auth

```typescript
import { getUserType, getCompanyName } from "@/lib/auth/server"

export default async function Page() {
  const userType = await getUserType()
  const company = await getCompanyName()
  
  return (
    <div>
      <p>User Type: {userType}</p>
      {company && <p>Company: {company}</p>}
    </div>
  )
}
```

---

## 🧪 Testing

```bash
# Run tests
pnpm test

# Run linter
pnpm lint

# Type check
pnpm type-check
```

---

## 📚 Related Documentation

- Root docs: `../../docs/`
- Backend docs: `../../medusa-backend/docs/`
- Main README: `../../README.md`

---

**Version**: 1.0.0  
**Last Updated**: November 30, 2024

# Getting Started

Complete setup guide for the Cedar E-Commerce platform.

---

## Prerequisites

- Node.js 20 or higher
- pnpm package manager
- Neon PostgreSQL database
- Clerk account (for authentication)
- Git

---

## Installation

### 1. Clone and Install Dependencies

```bash
# Install storefront dependencies
cd cedar-storefront
pnpm install

# Install backend dependencies
cd ../medusa-backend
pnpm install
```

### 2. Environment Configuration

#### Storefront (.env.local)

Create `cedar-storefront/.env.local`:

```env
# Next.js
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000

# Medusa
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_key_here

# Neon Database (shared with backend)
DATABASE_URL=postgresql://user:pass@host/database

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Razorpay
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
```

#### Backend (.env)

Create `medusa-backend/.env`:

```env
# Database (same as storefront)
DATABASE_URL=postgresql://user:pass@host/database

# Redis
REDIS_URL=rediss://...

# CORS
STORE_CORS=http://localhost:3000
ADMIN_CORS=http://localhost:9000
AUTH_CORS=http://localhost:3000,http://localhost:9000

# Secrets
JWT_SECRET=supersecret
COOKIE_SECRET=supersecret
```

### 3. Database Setup

Run this SQL in your Neon dashboard:

```sql
CREATE TABLE IF NOT EXISTS customer_meta (
  id SERIAL PRIMARY KEY,
  customer_id VARCHAR(255) NOT NULL,
  clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
  account_type VARCHAR(20) NOT NULL DEFAULT 'individual',
  company_name VARCHAR(255),
  tax_id VARCHAR(100),
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_customer_meta_customer_id ON customer_meta(customer_id);
CREATE INDEX idx_customer_meta_account_type ON customer_meta(account_type);
```

### 4. Build and Start

```bash
# Build Medusa backend
cd medusa-backend
pnpm run build

# Start backend (Terminal 1)
pnpm dev

# Start storefront (Terminal 2)
cd ../cedar-storefront
pnpm dev
```

### 5. Get Medusa Publishable Key

1. Open http://localhost:9000/app
2. Go to Settings → Publishable API Keys
3. Create new key
4. Add to `cedar-storefront/.env.local`

---

## Verification

### Test Storefront
- Open http://localhost:3000
- Sign up as a new user
- Check browser console for "✅ Role synced successfully"

### Test Backend
```bash
curl http://localhost:9000/health
```

### Test Database
```bash
psql $DATABASE_URL -c "SELECT * FROM customer_meta;"
```

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 9000
npx kill-port 9000
```

### Database Connection Error
- Verify `DATABASE_URL` is correct in both `.env` files
- Check Neon dashboard for database status
- Ensure IP is whitelisted in Neon

### Clerk Authentication Issues
- Verify Clerk keys are correct
- Check Clerk dashboard for application status
- Ensure redirect URLs are configured

---

## Next Steps

- Read [Role Sync System](ROLE_SYNC.md) to understand authentication
- Check [API Reference](API_REFERENCE.md) for available endpoints
- Review [Architecture](ARCHITECTURE.md) for system design

---

**Need Help?** Check component-specific docs:
- Storefront: `cedar-storefront/docs/`
- Backend: `medusa-backend/docs/`

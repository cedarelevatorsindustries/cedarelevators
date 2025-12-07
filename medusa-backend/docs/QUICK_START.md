# Quick Start - Role Sync Integration

## 🚀 5-Minute Setup

### 1. Install Dependencies
```bash
cd medusa-backend
pnpm install
```

### 2. Verify .env
Ensure `DATABASE_URL` points to your Neon database (same as storefront):
```env
DATABASE_URL=postgresql://neondb_owner:npg_...@ep-shy-water-a1p9uzby-pooler.ap-southeast-1.aws.neon.tech/medusa%20store?sslmode=require
```

### 3. Build & Start
```bash
pnpm run build
pnpm dev
```

### 4. Test It Works
```bash
# Get customer role
curl http://localhost:9000/store/customers/sync-role/cus_test123
```

## 📋 Common Use Cases

### Check if Customer is Business
```typescript
import { isBusinessCustomer } from "./utils/customer-helpers"

const isBusiness = await isBusinessCustomer(customerId)
if (isBusiness) {
  // Apply business logic
}
```

### Get Customer Account Type
```typescript
import { getCustomerAccountType } from "./utils/customer-helpers"

const accountType = await getCustomerAccountType(customerId)
// Returns: "individual" | "business" | null
```

### Restrict to Verified Business Only
```typescript
import { isBusinessCustomer, isVerifiedCustomer } from "./utils/customer-helpers"

if (!await isBusinessCustomer(customerId)) {
  return res.status(403).json({ message: "Business account required" })
}

if (!await isVerifiedCustomer(customerId)) {
  return res.status(403).json({ message: "Verification required" })
}
```

### Get Company Name
```typescript
import { getCompanyName } from "./utils/customer-helpers"

const company = await getCompanyName(customerId)
// Returns: "Acme Corp" | null
```

## 🔗 API Endpoints

### Store API (Customer-facing)
- `GET /store/customers/sync-role/:customerId` - Get customer role

### Admin API
- `POST /admin/customers/verify` - Verify business customer
- `GET /admin/customers/business?verified=true` - List business customers

## 📚 Full Documentation
See [ROLE_SYNC_SETUP.md](./ROLE_SYNC_SETUP.md) for complete documentation.

## ❓ Troubleshooting

**Customer metadata returns null?**
- Ensure storefront synced the user first
- Check `customer_id` matches between systems

**Database connection error?**
- Verify `DATABASE_URL` in `.env`
- Ensure Neon database is accessible

**Dependencies not installing?**
- Use `pnpm install` (not npm/yarn)
- Try: `rm -rf node_modules && pnpm install`

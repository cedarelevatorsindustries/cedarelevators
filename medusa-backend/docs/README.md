# Medusa Backend - Role Sync Documentation

Complete documentation for the B2B/B2C role synchronization system in Medusa backend.

---

## 📚 Documentation Overview

This folder contains all documentation for the Medusa backend role sync implementation.

### Quick Navigation

**New to this system?** → Start with [QUICK_START.md](QUICK_START.md)

**Need detailed setup?** → Read [ROLE_SYNC_SETUP.md](ROLE_SYNC_SETUP.md)

**Want to understand architecture?** → Check [ARCHITECTURE.md](ARCHITECTURE.md)

**Looking for API reference?** → See [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

## 📖 Documentation Files

### 1. [QUICK_START.md](QUICK_START.md) ⭐ START HERE
**Purpose**: 5-minute quick start guide  
**Best for**: Getting up and running quickly  
**Contains**:
- Quick setup steps
- Common use cases
- Essential API endpoints
- Quick troubleshooting

### 2. [ROLE_SYNC_SETUP.md](ROLE_SYNC_SETUP.md) 📘 COMPLETE GUIDE
**Purpose**: Comprehensive setup and usage guide  
**Best for**: Understanding the full system  
**Contains**:
- Architecture overview
- Detailed setup instructions
- Integration flow
- Usage examples
- Complete troubleshooting

### 3. [ARCHITECTURE.md](ARCHITECTURE.md) 🏗️ TECHNICAL
**Purpose**: System architecture and design  
**Best for**: Understanding how everything works  
**Contains**:
- System architecture diagrams
- Data flow sequences
- Component interactions
- Database schema
- Security model
- Performance considerations

### 4. [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md) 📊 REFERENCE
**Purpose**: Complete implementation reference  
**Best for**: API reference and code examples  
**Contains**:
- What was implemented
- File structure
- API reference
- Usage examples
- Testing guide
- Configuration details

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm installed
- Neon PostgreSQL database
- Medusa backend set up

### Installation

```bash
# Install dependencies
cd medusa-backend
pnpm install

# Build
pnpm run build

# Start dev server
pnpm dev
```

### Configuration

Ensure your `.env` file has:

```env
DATABASE_URL=postgresql://neondb_owner:npg_...
STORE_CORS=http://localhost:3000
```

### Create Database Table

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

---

## 🎯 Common Tasks

### Check if Customer is Business

```typescript
import { isBusinessCustomer } from "./utils/customer-helpers"

const isBusiness = await isBusinessCustomer(customerId)
```

### Get Customer Account Type

```typescript
import { getCustomerAccountType } from "./utils/customer-helpers"

const accountType = await getCustomerAccountType(customerId)
// Returns: "individual" | "business" | null
```

### Restrict Feature to Business Customers

```typescript
import { isBusinessCustomer } from "./utils/customer-helpers"

export const POST = async (req, res) => {
  const customerId = (req as any).auth?.actor_id
  
  if (!await isBusinessCustomer(customerId)) {
    return res.status(403).json({
      message: "Business customers only"
    })
  }
  
  // Process business feature...
}
```

---

## 📊 API Endpoints

### Store API (Customer-facing)

#### GET /store/customers/sync-role/:customerId
Get customer account type and metadata

**Response**:
```json
{
  "success": true,
  "data": {
    "customer_id": "cus_123",
    "account_type": "business",
    "company_name": "Acme Corp",
    "is_verified": true
  }
}
```

### Admin API

#### POST /admin/customers/verify
Verify a business customer

**Body**:
```json
{
  "customerId": "cus_123",
  "isVerified": true
}
```

#### GET /admin/customers/business
List all business customers

**Query Params**:
- `verified` (optional) - Filter by verification status

---

## 🛠️ Helper Functions

All helper functions are available in `src/api/utils/customer-helpers.ts`:

```typescript
// Get full customer metadata
getCustomerMeta(customerId): Promise<CustomerMeta | null>

// Get account type
getCustomerAccountType(customerId): Promise<"individual" | "business" | null>

// Check customer type
isBusinessCustomer(customerId): Promise<boolean>
isIndividualCustomer(customerId): Promise<boolean>

// Check verification status
isVerifiedCustomer(customerId): Promise<boolean>

// Get company information
getCompanyName(customerId): Promise<string | null>
```

---

## 📁 File Structure

```
medusa-backend/
├── src/
│   ├── lib/
│   │   └── db/
│   │       ├── index.ts                    # Neon client
│   │       └── customer-meta.ts            # DB queries
│   ├── api/
│   │   ├── utils/
│   │   │   └── customer-helpers.ts         # Helper functions
│   │   ├── store/
│   │   │   ├── customers/sync-role/        # Get customer role
│   │   │   ├── orders/create-bulk/         # Example: Bulk orders
│   │   │   └── quotes/request/             # Example: Quotes
│   │   └── admin/
│   │       └── customers/
│   │           ├── verify/                 # Verify customer
│   │           └── business/               # List business customers
│   └── types/
│       └── customer-meta.ts                # TypeScript types
├── docs/                                   # This folder
│   ├── README.md                           # This file
│   ├── QUICK_START.md                      # Quick start guide
│   ├── ROLE_SYNC_SETUP.md                  # Complete setup guide
│   ├── ARCHITECTURE.md                     # System architecture
│   └── IMPLEMENTATION_SUMMARY.md           # Implementation reference
├── setup-role-sync.sh                      # Setup script
└── test-integration.sh                     # Test script
```

---

## 🧪 Testing

### Run Integration Tests

```bash
bash test-integration.sh
```

### Test Database Connection

```bash
node -e "const {neon} = require('@neondatabase/serverless'); const sql = neon(process.env.DATABASE_URL); sql\`SELECT NOW()\`.then(console.log)"
```

### Test API Endpoints

```bash
# Get customer role
curl http://localhost:9000/store/customers/sync-role/cus_test123

# List business customers
curl http://localhost:9000/admin/customers/business

# Verify customer
curl -X POST http://localhost:9000/admin/customers/verify \
  -H "Content-Type: application/json" \
  -d '{"customerId":"cus_test123","isVerified":true}'
```

---

## 🐛 Troubleshooting

### Common Issues

#### "DATABASE_URL environment variable is not set"
**Solution**: Add `DATABASE_URL` to `.env` file

#### "relation 'customer_meta' does not exist"
**Solution**: Create the table using SQL above

#### Customer metadata returns null
**Solution**: 
1. Ensure storefront synced the user first
2. Check `customer_id` matches
3. Query: `SELECT * FROM customer_meta;`

#### CORS error
**Solution**: Add storefront URL to `STORE_CORS` in `.env`

---

## 📚 Additional Resources

### Root Documentation
- `../FINAL_SUMMARY.md` - Complete system overview
- `../INTEGRATION_CHECKLIST.md` - Setup checklist
- `../COMMANDS_REFERENCE.md` - Command reference
- `../README_ROLE_SYNC.md` - Main README

### Storefront Documentation
- `../../cedar-storefront/docs/role-sync-setup.md` - Storefront guide

---

## 🎯 What This System Enables

✅ Role-based access control  
✅ Business verification system  
✅ Different pricing logic  
✅ Bulk order functionality  
✅ Quote request system  
✅ Custom email templates  
✅ Analytics segmentation  
✅ Tax ID collection  
✅ Company information storage  

---

## 📞 Need Help?

1. Check the troubleshooting sections in each guide
2. Review the example implementations in `src/api/store/`
3. Verify your environment configuration
4. Test database connection independently

---

## ✅ Documentation Status

| Document | Status | Purpose |
|----------|--------|---------|
| README.md | ✅ Complete | Documentation index |
| QUICK_START.md | ✅ Complete | Quick reference |
| ROLE_SYNC_SETUP.md | ✅ Complete | Complete guide |
| ARCHITECTURE.md | ✅ Complete | System architecture |
| IMPLEMENTATION_SUMMARY.md | ✅ Complete | API reference |

---

**Version**: 1.0.0  
**Last Updated**: November 30, 2024  
**Status**: Complete and Ready for Use

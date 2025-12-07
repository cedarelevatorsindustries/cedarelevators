# API Reference

Complete API documentation for Cedar E-Commerce platform.

---

## Storefront API

Base URL: `http://localhost:3000/api`

### POST /api/sync-role

Syncs user role from Clerk to Neon database (triggered automatically on login).

**Authentication**: Required (Clerk session)

**Process**:
1. Gets user from Clerk
2. Creates/retrieves Medusa customer
3. Writes to `customer_meta` table

**Response**:
```json
{
  "success": true,
  "data": {
    "customer_id": "cus_123",
    "clerk_user_id": "user_abc",
    "account_type": "business",
    "synced_at": "2024-11-30T12:00:00Z"
  }
}
```

**Errors**:
- `401` - Unauthorized (no Clerk session)
- `400` - Invalid account type
- `500` - Server error

---

## Medusa Store API

Base URL: `http://localhost:9000/store`

### GET /store/customers/sync-role/:customerId

Get customer account type and metadata.

**Parameters**:
- `customerId` (path) - Medusa customer ID

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

**Errors**:
- `400` - Missing customerId
- `404` - Customer not found
- `500` - Server error

---

### POST /store/orders/create-bulk

Create bulk order (business customers only).

**Authentication**: Required

**Body**:
```json
{
  "items": [
    {
      "variant_id": "variant_123",
      "quantity": 100
    }
  ]
}
```

**Response**:
```json
{
  "success": true,
  "message": "Bulk order created successfully",
  "data": {
    "order_id": "order_123",
    "items_count": 1
  }
}
```

**Errors**:
- `401` - Unauthorized
- `403` - Not a business customer or not verified
- `500` - Server error

---

### POST /store/quotes/request

Request a quote (business customers only).

**Authentication**: Required

**Body**:
```json
{
  "items": [
    {
      "variant_id": "variant_123",
      "quantity": 500
    }
  ],
  "message": "Need quote for bulk order"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Quote request submitted successfully",
  "data": {
    "quote_id": "quote_123",
    "company_name": "Acme Corp",
    "items_count": 1,
    "status": "pending"
  }
}
```

**Errors**:
- `401` - Unauthorized
- `403` - Not a business customer
- `500` - Server error

---

## Medusa Admin API

Base URL: `http://localhost:9000/admin`

### POST /admin/customers/verify

Verify a business customer (admin only).

**Authentication**: Required (admin)

**Body**:
```json
{
  "customerId": "cus_123",
  "isVerified": true
}
```

**Response**:
```json
{
  "success": true,
  "message": "Customer cus_123 verification status updated to true"
}
```

**Errors**:
- `400` - Missing or invalid parameters
- `500` - Server error

---

### GET /admin/customers/business

List all business customers (admin only).

**Authentication**: Required (admin)

**Query Parameters**:
- `verified` (optional) - Filter by verification status (`true` or `false`)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "customer_id": "cus_123",
      "clerk_user_id": "user_abc",
      "account_type": "business",
      "company_name": "Acme Corp",
      "tax_id": "12-3456789",
      "is_verified": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

**Errors**:
- `500` - Server error

---

## Helper Functions

### Storefront

#### Client-Side

```typescript
import { useAccountType } from "@/lib/hooks/use-account-type"

const { 
  isBusiness,      // boolean
  isIndividual,    // boolean
  isGuest,         // boolean
  companyName      // string | null
} = useAccountType()
```

#### Server-Side

```typescript
import { getUserType, getCompanyName } from "@/lib/auth/server"

const userType = await getUserType()
// Returns: "guest" | "individual" | "business"

const company = await getCompanyName()
// Returns: string | null
```

---

### Backend

```typescript
import { 
  isBusinessCustomer,
  getCustomerAccountType,
  isVerifiedCustomer,
  getCompanyName,
  getCustomerMeta
} from "./utils/customer-helpers"

// Check if business
const isBusiness = await isBusinessCustomer(customerId)
// Returns: boolean

// Get account type
const accountType = await getCustomerAccountType(customerId)
// Returns: "individual" | "business" | null

// Check verification
const isVerified = await isVerifiedCustomer(customerId)
// Returns: boolean

// Get company name
const company = await getCompanyName(customerId)
// Returns: string | null

// Get full metadata
const meta = await getCustomerMeta(customerId)
// Returns: CustomerMeta | null
```

---

## TypeScript Types

### CustomerMeta

```typescript
interface CustomerMeta {
  id: number
  customer_id: string
  clerk_user_id: string
  account_type: "individual" | "business"
  company_name: string | null
  tax_id: string | null
  is_verified: boolean
  created_at: Date
  updated_at: Date
}
```

### AccountType

```typescript
type AccountType = "individual" | "business"
```

### UserType

```typescript
type UserType = "guest" | "individual" | "business"
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production:

- Sync endpoint: 10 requests per minute per user
- Admin endpoints: 100 requests per minute
- Store endpoints: 60 requests per minute per user

---

## Authentication

### Storefront
- Uses Clerk for authentication
- Session-based authentication
- Automatic token refresh

### Medusa Backend
- JWT-based authentication
- Admin authentication for admin endpoints
- Customer authentication for store endpoints

---

## CORS Configuration

### Allowed Origins
- Storefront: `http://localhost:3000`
- Admin: `http://localhost:9000`

### Allowed Methods
- GET, POST, PUT, DELETE, OPTIONS

### Allowed Headers
- Content-Type, Authorization

---

## Webhooks

### Clerk Webhooks (Future)

Can be configured to sync role changes:

```typescript
POST /api/webhooks/clerk
{
  "type": "user.updated",
  "data": {
    "id": "user_abc",
    "unsafe_metadata": {
      "accountType": "business"
    }
  }
}
```

---

## Testing

### cURL Examples

```bash
# Get customer role
curl http://localhost:9000/store/customers/sync-role/cus_123

# List business customers
curl http://localhost:9000/admin/customers/business?verified=true

# Verify customer
curl -X POST http://localhost:9000/admin/customers/verify \
  -H "Content-Type: application/json" \
  -d '{"customerId":"cus_123","isVerified":true}'

# Create bulk order
curl -X POST http://localhost:9000/store/orders/create-bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"items":[{"variant_id":"var_123","quantity":100}]}'
```

### Postman Collection

Import these endpoints into Postman for testing:
- Base URL: `http://localhost:9000`
- Add Authorization header for authenticated requests

---

## Best Practices

1. **Always validate on server-side** - Never trust client-side data
2. **Use proper error handling** - Return meaningful error messages
3. **Log API calls** - Track usage and errors
4. **Implement rate limiting** - Prevent abuse
5. **Use TypeScript** - Ensure type safety
6. **Document changes** - Keep API docs up to date

---

For implementation details:
- Storefront: `cedar-storefront/docs/`
- Backend: `medusa-backend/docs/`
- Role Sync: [ROLE_SYNC.md](ROLE_SYNC.md)

# Quote Management System Implementation

This document describes the complete quote management system implementation following the official Medusa guide.

## Overview

The quote management system allows:
1. Customers to request quotes for cart items
2. Merchants to review, edit, reject, or send quotes back to customers
3. Customers to accept or reject quotes
4. Automatic conversion of accepted quotes to orders

## Architecture

### Quote Module (`src/modules/quote/`)
- **Data Model**: Quote entity with statuses (pending_merchant, pending_customer, accepted, customer_rejected, merchant_rejected)
- **Service**: QuoteModuleService with CRUD operations
- **Links**: Connections to Cart, Customer, Order, and OrderChange modules

### Workflows (`src/workflows/`)
1. **create-request-for-quote**: Creates quote from cart
2. **merchant-reject-quote**: Merchant rejects a quote
3. **merchant-send-quote**: Merchant sends quote to customer
4. **customer-reject-quote**: Customer rejects a quote
5. **customer-accept-quote**: Customer accepts quote (converts to order)

### API Routes

#### Store Routes (`/store/customers/me/quotes`)
- `POST /` - Create quote from cart
- `GET /:id/preview` - Preview quote order
- `POST /:id/accept` - Accept quote
- `POST /:id/reject` - Reject quote

#### Admin Routes (`/admin/quotes`)
- `GET /` - List all quotes
- `GET /:id` - Get quote details
- `POST /:id/reject` - Reject quote
- `POST /:id/send` - Send quote to customer

## Setup Instructions

### 1. Generate Migrations

```bash
cd medusa-backend
npx medusa db:generate quote
```

### 2. Run Migrations

```bash
npx medusa db:migrate
```

### 3. Start Development Server

```bash
npm run dev
```

## Quote Workflow

```
Customer Request → Pending Merchant
                ↓
Merchant Reviews → Can Edit Items/Prices
                ↓
Merchant Sends → Pending Customer
                ↓
Customer Reviews → Accept or Reject
                ↓
If Accepted → Convert to Order
If Rejected → Back to Pending Merchant
```

## Quote Statuses

- **pending_merchant**: Waiting for merchant review
- **pending_customer**: Waiting for customer decision
- **accepted**: Customer accepted, converted to order
- **customer_rejected**: Customer rejected the quote
- **merchant_rejected**: Merchant rejected the quote

## Data Model Links

The Quote module is linked to:
- **Cart**: Source cart for the quote
- **Customer**: Customer who requested the quote
- **Order**: Draft order (later converted to real order)
- **OrderChange**: Tracks edits made to quote items

## API Examples

### Create Quote (Customer)
```bash
POST /store/customers/me/quotes
Authorization: Bearer {customer_token}
Content-Type: application/json

{
  "cart_id": "cart_123"
}
```

### List Quotes (Admin)
```bash
GET /admin/quotes
Authorization: Bearer {admin_token}
```

### Send Quote to Customer (Admin)
```bash
POST /admin/quotes/{quote_id}/send
Authorization: Bearer {admin_token}
```

### Accept Quote (Customer)
```bash
POST /store/customers/me/quotes/{quote_id}/accept
Authorization: Bearer {customer_token}
```

## Next Steps

1. **Admin UI**: Implement Medusa Admin customizations for quote management
2. **Storefront**: Add quote request and management UI in the storefront
3. **Notifications**: Add email notifications for quote status changes
4. **Item Editing**: Implement admin UI for editing quote items (prices/quantities)

## Integration with Existing System

This implementation replaces the placeholder quote system at:
- `src/api/store/quotes/request/route.ts` - Now uses the full workflow

The new system provides:
- ✅ Complete quote lifecycle management
- ✅ Order change tracking for edits
- ✅ Automatic order conversion
- ✅ Proper data model relationships
- ✅ Validation and error handling
- ✅ Admin and customer APIs

## Files Created

### Module
- `src/modules/quote/models/quote.ts`
- `src/modules/quote/service.ts`
- `src/modules/quote/index.ts`

### Links
- `src/links/quote-cart.ts`
- `src/links/quote-customer.ts`
- `src/links/quote-order.ts`
- `src/links/quote-order-change.ts`

### Workflows
- `src/workflows/create-request-for-quote.ts`
- `src/workflows/merchant-reject-quote.ts`
- `src/workflows/merchant-send-quote.ts`
- `src/workflows/customer-reject-quote.ts`
- `src/workflows/customer-accept-quote.ts`

### Workflow Steps
- `src/workflows/steps/create-quotes.ts`
- `src/workflows/steps/update-quotes.ts`
- `src/workflows/steps/validate-quote-not-accepted.ts`
- `src/workflows/steps/validate-quote-can-accept.ts`

### API Routes
- Store: `src/api/store/customers/me/quotes/**`
- Admin: `src/api/admin/quotes/**`

### Configuration
- `src/api/middlewares.ts` - Updated with validation
- `medusa-config.ts` - Added Quote module

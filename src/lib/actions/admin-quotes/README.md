# Admin Quotes Module

This directory contains the modular implementation of admin quote management functionality, refactored from a single 900+ line file into organized, maintainable modules.

## Module Structure

### `quote-audit.ts`
**Purpose**: Audit logging for quote actions
- `logQuoteAction()` - Log all quote-related actions for audit trail

### `quote-queries.ts`
**Purpose**: Read operations and data fetching
- `getAdminQuotes()` - Get all quotes with filtering
- `getAdminQuoteById()` - Get single quote by ID
- `getAdminQuoteStats()` - Get quote statistics
- `getQuoteAuditLog()` - Get audit log for a quote
- `AdminQuoteFilters` - Type definition for filters

### `quote-status.ts`
**Purpose**: Status and priority management
- `updateQuoteStatus()` - Update quote status
- `approveQuote()` - Approve a quote (Manager+)
- `rejectQuote()` - Reject a quote (Manager+)
- `updateQuotePriority()` - Update quote priority

### `quote-pricing.ts`
**Purpose**: Pricing operations
- `updateQuotePricing()` - Update overall quote pricing
- `updateQuoteItemPricing()` - Update individual item pricing

### `quote-conversion.ts`
**Purpose**: Quote to order conversion
- `convertQuoteToOrder()` - Convert approved quote to order (Verified Business only)

### `quote-messages.ts`
**Purpose**: Messaging functionality
- `addAdminQuoteMessage()` - Add admin message to quote

### `quote-management.ts`
**Purpose**: Management operations
- `deleteQuote()` - Delete a quote

### `index.ts`
**Purpose**: Central export point
- Re-exports all functions from the modules above
- Provides a single import point for consumers

## Usage

### Importing Functions

```typescript
// Import from the module directory (recommended)
import { getAdminQuotes, approveQuote } from '@/lib/actions/admin-quotes'

// Or import from specific modules
import { getAdminQuotes } from '@/lib/actions/admin-quotes/quote-queries'
import { approveQuote } from '@/lib/actions/admin-quotes/quote-status'
```

### Backward Compatibility

The original `admin-quotes.ts` file still exists and re-exports all functions, maintaining backward compatibility with existing code.

## Benefits of Modular Structure

1. **Maintainability**: Easier to find and update specific functionality
2. **Readability**: Each module has a clear, focused purpose
3. **Testability**: Modules can be tested independently
4. **Collaboration**: Multiple developers can work on different modules simultaneously
5. **Code Organization**: Related functions are grouped together
6. **Performance**: Better tree-shaking potential for unused functions

## Module Dependencies

```
quote-audit.ts (no dependencies)
    ↓
quote-queries.ts (no dependencies)
quote-status.ts → depends on quote-audit
quote-pricing.ts (no dependencies)
quote-conversion.ts → depends on quote-audit
quote-messages.ts (no dependencies)
quote-management.ts (no dependencies)
    ↓
index.ts → re-exports all modules
```

## Permission Requirements

- **Admin**: All read operations, priority updates, pricing updates
- **Manager+**: Approve, reject, convert quotes
- **All operations**: Require proper authentication via Clerk

## Future Enhancements

Consider adding:
- Unit tests for each module
- Integration tests for quote workflows
- Additional validation helpers
- Notification services for quote updates
- Bulk operations support

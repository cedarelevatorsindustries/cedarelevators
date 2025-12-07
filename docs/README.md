# Cedar E-Commerce - Documentation

Complete documentation for the B2B/B2C hybrid e-commerce platform with role-based authentication.

---

## 📚 Quick Navigation

### Core Documentation
- **[Getting Started](GETTING_STARTED.md)** - Setup and installation guide
- **[Role Sync System](ROLE_SYNC.md)** - B2B/B2C role synchronization
- **[API Reference](API_REFERENCE.md)** - Complete API documentation
- **[Architecture](ARCHITECTURE.md)** - System architecture and design

### Payment Features
- **[Payment Features Overview](PAYMENT_FEATURES.md)** - Complete payment system documentation
- **[Razorpay Implementation](SAVED_PAYMENT_METHODS_RAZORPAY.md)** - Saved payment methods guide
- **[Setup Checklist](RAZORPAY_SETUP_CHECKLIST.md)** - Quick verification checklist
- **[Quick Reference](QUICK_REFERENCE_PAYMENTS.md)** - Code snippets and quick help
- **[Visual Guide](VISUAL_GUIDE_PAYMENTS.md)** - Visual walkthrough and UI flows
- **[Troubleshooting](TROUBLESHOOTING_PAYMENTS.md)** - Common issues and solutions
- **[Stripe Migration](STRIPE_TO_RAZORPAY_MIGRATION.md)** - Migrate from Stripe to Razorpay

---

## 🏗️ Project Structure

```
cedar-ecommerce/
├── cedar-storefront/          # Next.js storefront
│   └── docs/                  # Storefront-specific docs
├── medusa-backend/            # Medusa backend
│   └── docs/                  # Backend-specific docs
└── docs/                      # Root documentation (this folder)
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- pnpm
- Neon PostgreSQL database
- Clerk account

### Installation

```bash
# Install all dependencies
pnpm install

# Start storefront
cd cedar-storefront && pnpm dev

# Start backend (in another terminal)
cd medusa-backend && pnpm dev
```

---

## 📖 Documentation by Component

### Storefront Documentation
Located in `cedar-storefront/docs/`:
- Setup and configuration
- Client-side hooks and components
- Route protection
- UI components

### Backend Documentation
Located in `medusa-backend/docs/`:
- API endpoints
- Database integration
- Helper utilities
- Business logic

### Root Documentation
Located in `docs/` (this folder):
- System overview
- Integration guides
- Architecture
- API reference

---

## 🎯 Key Features

### Role-Based System
- **Individual Customers** (B2C) - Standard e-commerce features
- **Business Customers** (B2B) - Bulk orders, quotes, invoices
- **Admin** - Customer verification and management

### Automatic Synchronization
- User signs up → Role stored in Clerk
- User logs in → Auto-syncs to Neon database
- Both storefront and backend read from shared database

### Protected Features
- Business-only routes and features
- Verification system for sensitive operations
- Role-based pricing and discounts

### Payment Features
- **Razorpay Integration** - UPI, Cards, NetBanking, Wallets
- **Saved Payment Methods** - Securely save and reuse payment methods
- **Multiple Payment Options** - Credit terms, PO upload, bank transfer
- **B2B Payment Terms** - 30-day credit for verified dealers

---

## 🔗 External Resources

- [Medusa Documentation](https://docs.medusajs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Neon Documentation](https://neon.tech/docs)

---

**Version**: 1.0.0  
**Last Updated**: November 30, 2024

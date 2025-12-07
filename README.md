# Cedar E-Commerce Platform

A modern B2B/B2C hybrid e-commerce platform built with Next.js and Medusa, featuring role-based authentication and automatic customer type synchronization.

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start storefront (Terminal 1)
cd cedar-storefront && pnpm dev

# Start backend (Terminal 2)
cd medusa-backend && pnpm dev
```

Visit:
- Storefront: http://localhost:3000
- Backend Admin: http://localhost:9000/app

---

## 📚 Documentation

Complete documentation is available in the [`docs/`](docs/) folder:

- **[Getting Started](docs/GETTING_STARTED.md)** - Setup and installation
- **[Role Sync System](docs/ROLE_SYNC.md)** - B2B/B2C authentication
- **[Payment Features](docs/PAYMENT_FEATURES.md)** - Saved payment methods with Razorpay
- **[API Reference](docs/API_REFERENCE.md)** - Complete API docs
- **[Architecture](docs/ARCHITECTURE.md)** - System design

Component-specific documentation:
- **Storefront**: [`cedar-storefront/docs/`](cedar-storefront/docs/)
- **Backend**: [`medusa-backend/docs/`](medusa-backend/docs/)

---

## 🎯 Features

### Role-Based System
- **Individual Customers (B2C)** - Standard e-commerce features
- **Business Customers (B2B)** - Bulk orders, quotes, invoices, team management
- **Automatic Role Sync** - Seamless synchronization between Clerk, storefront, and backend

### Key Capabilities
✅ Role-based access control  
✅ Business customer verification  
✅ Bulk order processing  
✅ Quote request system  
✅ Custom pricing rules  
✅ Protected routes and features  
✅ Shared database architecture  
✅ **Saved payment methods with Razorpay**  

---

## 🏗️ Tech Stack

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Clerk (Authentication)
- Medusa JS SDK

### Backend
- Medusa 2.x
- TypeScript
- Neon PostgreSQL
- Redis (Upstash)

---

## 📦 Project Structure

```
cedar-ecommerce/
├── cedar-storefront/          # Next.js storefront
│   ├── src/
│   └── docs/                  # Storefront documentation
├── medusa-backend/            # Medusa backend
│   ├── src/
│   └── docs/                  # Backend documentation
├── docs/                      # Root documentation
├── README.md                  # This file
└── LICENSE                    # License file
```

---

## 🔧 Prerequisites

- Node.js 20+
- pnpm
- Neon PostgreSQL database
- Clerk account
- Redis instance (Upstash recommended)

---

## 📖 Quick Links

- [Medusa Documentation](https://docs.medusajs.com)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Neon Documentation](https://neon.tech/docs)

---

## 🤝 Contributing

Contributions are welcome! Please read the documentation before making changes.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support

For issues and questions:
1. Check the [documentation](docs/)
2. Review component-specific docs
3. Check troubleshooting sections

---

**Version**: 1.0.0  
**Last Updated**: November 30, 2024

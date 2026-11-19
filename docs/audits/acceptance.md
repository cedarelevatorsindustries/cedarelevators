# CEDAR ELEVATORS — PHASE 1 ACCEPTANCE CHECKLIST & VERIFICATION PROTOCOL

**Document Version:** 1.0 (Phase 1 Scope Sign-Off & Acceptance Criteria)  
**Date:** November 19, 2026  
**Status:** Approved for Implementation Verification  
**Target Milestone:** Phase 1 Launch: Product Catalogue, Discovery & Quotation Portal  
**Target Audience:** Commercial & Residential Property Owners, Architects, Builders, Facility Managers (Tamil Nadu & South India)

---

## 1. PHASE 1 SCOPE DEFINITION

The Phase 1 release focuses exclusively on **brand credibility, product discovery, technical specification exploration, and lead generation (quotation enquiries)**.

```
┌───────────────────────────────────────────────────┬───────────────────────────────────────────────────┐
│ ✅ IN SCOPE (PHASE 1)                              │ ⏸️ DEFERRED TO PHASE 2 (E-COMMERCE)               │
├───────────────────────────────────────────────────┼───────────────────────────────────────────────────┤
│ • Modern, responsive public storefront            │ • Shopping cart drawer & cart persistence         │
│ • Complete product catalogue (78 elevator items)  │ • Multi-step checkout workflow                    │
│ • Category landing pages (Passenger, Freight,     │ • Online payment gateways (Razorpay, Cashfree)    │
│   Home Elevators)                                 │ • Self-service customer order tracking            │
│ • Technical product detail pages with specs       │ • Customer address book management                │
│ • Guest & B2B quotation enquiry submission flow   │ • Automated warehouse inventory reservations      │
│ • Sticky WhatsApp direct contact integration      │ • Instant credit card / UPI order placement       │
│ • Super Admin authentication & dashboard access   │ • Multi-vendor drop-shipping workflows            │
│ • Admin catalogue and quotation enquiry review    │                                                   │
└───────────────────────────────────────────────────┴───────────────────────────────────────────────────┘
```

---

## 2. FUNCTIONAL ACCEPTANCE CHECKLIST

Every requirement must be validated against the live staging or production deployment prior to commercial launch.

### 2.1 Public Storefront & Branding

- [ ] **ST-01:** Homepage loads under 2.0s on 4G mobile connections with zero layout shifts (LCP < 2.5s).
- [ ] **ST-02:** Hero section prominently features "Explore Catalogue" and "Request a Quote" call-to-action buttons.
- [ ] **ST-03:** Brand logo, tagline ("Elevating Standards"), and company credentials render clearly in desktop and mobile headers.
- [ ] **ST-04:** Header navigation contains: Home, Products / Catalogue, Categories, About Us, Contact, and "Request Quote" button.
- [ ] **ST-05:** **Cart icon / drawer is completely hidden** from public header navigation.
- [ ] **ST-06:** Footer displays valid contact telephone numbers, official email, Tamil Nadu registered office address, and copyright notices.
- [ ] **ST-07:** Sticky WhatsApp button floats at bottom-right of viewport on mobile and desktop, pre-populating a WhatsApp chat with `Hello Cedar Elevators, I would like to enquire about...`.

---

### 2.2 Product Catalogue & Discovery

- [ ] **CAT-01:** `/products` renders all **78 live products** with high-resolution Cloudinary images, model names, and capacities.
- [ ] **CAT-02:** Category filter switches seamlessly between `Passenger Elevators`, `Freight Elevators`, and `Home Elevators`.
- [ ] **CAT-03:** Faceted filtering works accurately for:
  - Capacity (e.g. 4 Passenger, 6 Passenger, 8 Passenger, 13 Passenger, 1000kg, 2000kg).
  - Speed (0.65 m/s, 1.0 m/s, 1.5 m/s).
  - Drive Type (Gearless PMSM, Hydraulic, Geared Traction).
- [ ] **CAT-04:** Product cards display clear **"View Details"** and **"Enquire / Get Quote"** buttons (no "Add to Cart" or "Buy Now" buttons visible).
- [ ] **CAT-05:** Dynamic product detail page (`/products/[handle]`) renders:
  - Technical specification table (Pit depth, overhead height, cabin dimensions, shaft requirements).
  - Multiple image gallery views.
  - Standard safety features (ARD - Automatic Rescue Device, Overload Sensor, Infrared Light Curtain).
  - Direct **"Request Quote for this Model"** CTA which pre-selects the product on the quote form.

---

### 2.3 Quotation & Enquiry Submission Flow (`/quotes/new`)

- [ ] **QT-01:** Quotation request page loads cleanly for both **unauthenticated guest visitors** and logged-in users.
- [ ] **QT-02:** Form captures mandatory client enquiry details:
  - Full Name (Personal or Company Representative)
  - Mobile Number (10 digits with India +91 validation)
  - Email Address
  - Project Location / City (Chennai, Coimbatore, Madurai, etc.)
  - Building Type (Residential, Commercial, Villa, Hospital, Industrial)
  - Number of Floors / Stops (G+1, G+2, G+3, etc.)
  - Intended Elevator Capacity / Passenger Count
  - Additional Notes / Custom Architectural Requirements
- [ ] **QT-03:** Document upload component allows attaching architectural floor plans or shaft drawings (`.pdf`, `.jpg`, `.png` up to 10MB).
- [ ] **QT-04:** Submitting form generates an enterprise-grade reference number (e.g., `CED-QT-GS-260122-000006`).
- [ ] **QT-05:** Quote record, items, and attachment links are immediately persisted into live PostgreSQL database (`public.quotes`, `public.quote_items`).
- [ ] **QT-06:** Confirmation modal presents quote reference number and informs user that a Cedar Elevators technical consultant will respond within 24 business hours.
- [ ] **QT-07:** Confirmation email is automatically dispatched via Resend to the customer's provided email.

---

### 2.4 Administrative Portal (`/admin`)

- [ ] **ADM-01:** `/admin` requires administrative login; unauthenticated requests redirect to `/admin/login`.
- [ ] **ADM-02:** Non-admin customer accounts attempting to access `/admin` or `/api/admin/*` receive `403 Forbidden`.
- [ ] **ADM-03:** Admin Dashboard displays live summary KPI cards:
  - Total Products in Catalogue (78)
  - Pending Quotation Requests
  - Recent Inquiries (Last 7 Days)
- [ ] **ADM-04:** Admin Quotes view (`/admin/quotes`) lists all incoming quote submissions with customer contact details, floor requirements, and attached floor plans.
- [ ] **ADM-05:** Admin can update quote status (`reviewing`, `contacted`, `quoted`, `closed`).
- [ ] **ADM-06:** Admin Product Management (`/admin/products`) allows editing product descriptions, technical specifications, and publishing/unpublishing models.

---

## 3. NON-FUNCTIONAL & TECHNICAL ACCEPTANCE

### 3.1 Security Hardening
- [ ] **SEC-CHK-01:** Direct unauthenticated `GET https://hbkdbrxzqaraarivudej.supabase.co/rest/v1/users` returns HTTP 200 with empty array `[]` or HTTP 401. Customer personal information is completely unexposed.
- [ ] **SEC-CHK-02:** Direct unauthenticated `DELETE /api/admin/products` returns HTTP 401 or 403.
- [ ] **SEC-CHK-03:** Direct unauthenticated `POST /api/upload/cloudinary` returns HTTP 401 Unauthorized.
- [ ] **SEC-CHK-04:** Rate limiting blocks automated spam on quote submission (>5 requests in 10 minutes from same IP).

### 3.2 Performance & SEO
- [ ] **PERF-CHK-01:** Google Lighthouse Performance score &ge; 85 on desktop and &ge; 70 on mobile.
- [ ] **PERF-CHK-02:** Canonical meta tags, OpenGraph tags, and Schema.org Product/Organization structured JSON-LD data are present on all catalogue pages.
- [ ] **PERF-CHK-03:** Next.js production build (`pnpm run build`) compiles with zero errors (Exit code 0).

---

## 4. REGRESSION VERIFICATION MATRIX

| Flow Verified | Test Procedure | Pass / Fail | Verified Date | Tester Sign-Off |
| :--- | :--- | :---: | :---: | :---: |
| **Guest Quote Request** | Submit test quote as anonymous user with valid phone and floor count. | [ ] | | |
| **Catalog Browsing** | Filter 78 products by Home Elevators, 0.65m/s speed. | [ ] | | |
| **Product Detail View** | Open `/products/passenger-elevator-mrl`, check gallery & spec table. | [ ] | | |
| **WhatsApp Link** | Tap WhatsApp button on mobile; verify pre-filled chat opens. | [ ] | | |
| **Admin Login** | Log into `/admin/login` using super admin credentials. | [ ] | | |
| **Quote Status Update**| In admin portal, open test quote and transition to `contacted`. | [ ] | | |
| **RLS Leak Check** | Curl public REST endpoint for `users` and `carts`. | [ ] | | |

---

## 5. SIGN-OFF SHEET

| Stakeholder Role | Name / Title | Signature | Date |
| :--- | :--- | :--- | :--- |
| **Technical Lead** | | | |
| **Security Auditor** | | | |
| **Cedar Elevators Business Owner**| | | |

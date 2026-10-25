# LastCry — India-First End-of-Life Essentials, Ritual Kits & Memorial Storefront

**"Thoughtful essentials. Dignified goodbyes."**

LastCry is a full-stack e-commerce platform designed to help families across India find verified last-rites essentials, contributor-reviewed ritual kits, handcrafted memorial frames, condolence care parcels, and local service referrals in a calm, respectful, and privacy-conscious environment.

---

## 1. Architecture & Tech Stack

- **Framework**: Next.js 15 (App Router, Server & Client Components, TypeScript)
- **Styling & Design System**: Tailwind CSS v4 with a warm ivory (`#FAF8F5`), deep charcoal (`#1C1B19`), soft travertine beige (`#EFEBE2`), muted sage (`#2E473B`), and subtle bronze (`#9A7B4F`) palette.
- **Typography**: `Cormorant Garamond` (Editorial headings), `Plus Jakarta Sans` (Body prose), and `JetBrains Mono` (Tabular INR pricing, SKUs, and PIN codes).
- **Database & Persistence**:
  - **PostgreSQL + Prisma Schema & SQL Migrations**: Located in `prisma/schema.prisma` and `prisma/migrations/0001_initial_schema/migration.sql` covering all 29 core entities (`User`, `Role`, `Address`, `Category`, `Product`, `ProductVariant`, `ProductImage`, `Inventory`, `Supplier`, `SupplierProduct`, `RitualKit`, `RitualKitItem`, `TraditionTag`, `ProductReview`, `Cart`, `CartItem`, `WishlistItem`, `Coupon`, `Order`, `OrderItem`, `Payment`, `Refund`, `Shipment`, `DeliveryZone`, `ServiceProvider`, `ServiceListing`, `ServiceEnquiry`, `ContentArticle`, `SupportTicket`, `ConsentRecord`, `AuditLog`).
  - **Transactional Local Store**: Out of the box (when a live PostgreSQL instance is not connected), LastCry persists all state transactionally in `.data/lastcry-db.json` via `lib/db/store.ts` and can be reset to clean development seed data at any time.

---

## 2. Setup, Commands & Testing

```bash
# Install dependencies
npm install

# Run development server (Port 3000)
npm run dev

# Run ESLint validation
npm run lint

# Run automated unit & integration test suite
npm test

# Run production build
npm run build
```

---

## 3. Environment Variables & External Integrations

Copy `.env.example` to `.env` and configure the following variables as needed:

| Variable | Purpose | Default / Unconfigured Behaviour |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma | Uses transactional `.data/lastcry-db.json` store locally |
| `SESSION_SECRET` | Secret key for signing session tokens & sandbox HMACs | Uses development fallback secret |
| `ADMIN_BOOTSTRAP_TOKEN` | Passphrase required to unlock `/admin` routes | Defaults to `lastcry-sandbox-admin-2026` in local dev |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Live Razorpay India payment credentials | Clearly marked **Sandbox Payment Adapter** (`RAZORPAY_SANDBOX`) |
| `PAYMENT_SANDBOX_MODE` | Explicitly toggles sandbox payment mode (`true`/`false`) | `true` (Never simulates fake live payments) |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Transactional email dispatch credentials | Logs dispatches to server console & audit log |

### Secure Initial Administrator Bootstrap Procedure
1. Set a strong `ADMIN_BOOTSTRAP_TOKEN` and `SESSION_SECRET` in your production environment variables.
2. Navigate to `/admin` and select your role (`ADMIN`, `OPERATIONS_MANAGER`, `CONTENT_REVIEWER`, or `FINANCE_AUDITOR`).
3. Enter the bootstrap token (for local development/demo: `lastcry-sandbox-admin-2026`).
4. Every administrative mutation (price edits, stock adjustments, order transitions, refund approvals, supplier verifications) is recorded in `/admin/audit-logs`.

### Replacing Studio Placeholder Imagery
- All product and kit images in `/public/assets/products/*.svg` are bespoke studio still-life SVG illustrations marked with `isPlaceholder: true` in the database so the project runs with zero broken external URLs.
- To replace placeholders with verified studio photography, upload licensed `.webp`/`.jpg` assets to `/public/assets/products/` and update the image URL and `isPlaceholder: false` flag via `/admin/products`.

---

## 4. Completed Features vs. Sandbox Adapters & Future Phases

### Completed in Phase 1 MVP
- **Public Storefront & Information Architecture**: `/`, `/shop`, `/shop/essentials`, `/shop/ritual-kits`, `/shop/memorials`, `/shop/condolence-gifts`, `/categories/[slug]`, `/product/[slug]`, `/ritual-kits/[slug]`, `/services`, `/services/[slug]`, `/guidance`, `/guidance/[slug]`, `/about`, `/contact`, `/faq`, `/shipping-policy`, `/returns-refunds`, `/privacy-policy`, `/terms`, `/grievance-redressal`, `/cart`, `/checkout`, `/order-confirmation/[orderNumber]`, `/track-order`, `/account`, `/account/orders`, `/account/addresses`, `/wishlist`.
- **Interactive Ritual Kit Builder (`/ritual-kits/[slug]`)**: Displays complete item-by-item core checklists, contributor review credentials, regional scope, optional item toggles, live price/GST recalculation, and PIN-code availability checks.
- **Server-Side Cart, Checkout & HMAC Payment Verification**: Validates prices, GST, coupons (`FREESHIP`, `COMMUNITY10`), and PIN-code restrictions on the server. Prevents payment failures from creating paid orders and releases reserved inventory upon payment failure.
- **Protected Admin Workspace (`/admin` + 14 sub-routes)**: Enforces authentication and role-based access control (`ADMIN`, `OPERATIONS_MANAGER`, `CONTENT_REVIEWER`, `FINANCE_AUDITOR`), blocks publishing unreviewed products, manages orders/refunds/inventory/suppliers/delivery zones, exports CSVs, and resets seed data.

### Sandbox / Unconfigured External Integrations (Explicitly Documented)
- **Payment Gateway**: Configured in **Sandbox Mode** (`RAZORPAY_SANDBOX`) with real server-side HMAC-SHA256 verification and payment failure simulation until live `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` credentials are provided.
- **Local Service Directory (`/services`)**: Uses an explicit **Enquiry & Referral Workflow** (`ENQUIRY_REFERRAL_ONLY`) rather than fake live instant booking.
- **Email / SMS Notifications**: Transactional updates are logged to the application database and server logs until an external SMTP/SMS provider is configured.

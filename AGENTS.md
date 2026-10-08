# Smart Account POS & Enterprise Architecture Guide

Full-stack Point-of-Sale (POS), inventory management, and multi-user RBAC platform built with Next.js App Router, React 19, Tailwind CSS, Redux Toolkit (RTK Query), and a Laravel 13 REST API backend.

---

## 1. High-Contrast Modern Aesthetic & Speed Philosophy

1. **Aesthetic & Visual Contrast Standard**:
   - **No Light-Gray on Light/White**: High contrast dark slate/navy theme (`#0a0f1d`, `#0f172a`, `#1e293b`) with pure white (`#ffffff`) text for headings, numbers, and primary labels.
   - **Functional Color Indicators**:
     - **Receive Cash [F8]**: High-visibility glowing amber frame with pure white text and an instant green **Change Return** calculation (`text-emerald-300 font-extrabold text-xl`).
     - **Barcode Scanner [F2]**: Electric cyan illuminated border (`border-cyan-500`) with keyboard listener auto-adding products on Enter.
     - **Save Order [F10]**: Emerald green primary button (`bg-emerald-600 hover:bg-emerald-500`).
     - **Hold Sale**: Golden amber badge & button (`bg-amber-400 text-slate-950`).
     - **Zero Audio Latency**: Integrated Web Audio API sound synthesizer for instant barcode blips (`1760Hz`) and sale completion chimes.

2. **Cashier Keyboard Shortcuts**:
   - `[F1]`: Focus Customer select
   - `[F2]`: Focus Barcode scanner input
   - `[F3]`: Focus Product select
   - `[F8]`: Focus Cash Received input
   - `[F10]`: Finalize and print sale
   - `Enter` in Barcode box: Immediate add to cart

---

## 2. Multi-User RBAC & Permission Architecture

1. **Designations (Roles)**:
   - `Admin`: Unrestricted root access across all modules.
   - `Branch Manager`: Manages sales, collections, inventory, and views financial reports.
   - `Cashier`: Fast POS selling, barcode scanning, hold list recovery, and due collections.
   - `Accountant`: Manages general accounts, customer dues, and financial ledgers.

2. **Permission Endpoints (`/api/v1/rbac/`)**:
   - `GET /rbac/designations`: List all designations and assigned permissions.
   - `POST /rbac/designations`: Create a new custom designation.
   - `PUT /rbac/designations/{id}/permissions`: Grant or revoke specific permissions for any designation.
   - `GET /rbac/permissions`: All system permissions grouped by module (`Sales`, `Collections`, `Inventory`, `Purchases`, `General Accounts`, `Reports`, `System & Users`).
   - `GET /rbac/users` & `PUT /rbac/users/{id}/designation`: Assign staff to designations.

---

## 3. Directory Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── globals.css              # Dark mode tokens & Tailwind v4
│   │   ├── layout.tsx               # Root layout with ReduxProvider & Toaster
│   │   ├── page.tsx                 # Master POS application shell & router
│   │   └── login/page.tsx           # Authentication screen
│   ├── components/
│   │   ├── pos/
│   │   │   ├── PosTopbar.tsx        # Branch switcher, hold counter, role simulator
│   │   │   ├── PosSidebar.tsx       # Collapsible navigation with permission locks
│   │   │   ├── PosMobileBottomNav.tsx # Responsive bottom navigation for handhelds
│   │   │   ├── sale/
│   │   │   │   ├── PosTerminal.tsx       # Master POS screen orchestrator
│   │   │   │   ├── PosHeaderBanner.tsx   # Title, hold list button, fullscreen toggle
│   │   │   │   ├── PosCustomerRow.tsx    # Customer [F1], area, supplier, date, note
│   │   │   │   ├── PosBarcodeScanner.tsx # Rapid scanner input [F2] with laser glow
│   │   │   │   ├── PosProductRow.tsx     # Product quick add [F3] with stock badge
│   │   │   │   ├── PosCartTable.tsx      # Items table with quantity steppers & profit
│   │   │   │   ├── PosBillingPanel.tsx   # Totals, Receive [F8], Change Return, Save [F10]
│   │   │   │   ├── HoldListModal.tsx     # Queue of held sales with resume/discard
│   │   │   │   └── InvoiceReceiptModal.tsx # Printable 80mm thermal receipt
│   │   │   ├── collection/
│   │   │   │   └── CustomerDueCollection.tsx # Due offset & collection form
│   │   │   ├── history/
│   │   │   │   └── SalesListView.tsx     # Date range filters & sales table
│   │   │   ├── dashboard/
│   │   │   │   └── DashboardView.tsx     # KPI cards, liquid ledger, revenue breakdown
│   │   │   ├── inventory/
│   │   │   │   └── ProductInventoryView.tsx # Stock catalog & barcode directory
│   │   │   ├── customers/
│   │   │   │   └── CustomersView.tsx     # Customer dues & directory
│   │   │   ├── suppliers/
│   │   │   │   └── SuppliersView.tsx     # Supplier directory & credit ledger
│   │   │   ├── purchases/
│   │   │   │   ├── AddPurchaseView.tsx   # Inventory purchase entry
│   │   │   │   ├── PurchaseListView.tsx  # Purchase invoice history & supplier filters
│   │   │   │   ├── PurchaseReturnView.tsx # Return items to supplier
│   │   │   │   └── SupplierPaymentView.tsx # Supplier payment settlement
│   │   │   ├── returns/
│   │   │   │   ├── SalesReturnView.tsx   # Customer return & credit note issue
│   │   │   │   └── SaleExchangeListView.tsx # Return history & exchange records
│   │   │   ├── marketers/
│   │   │   │   └── MarketersView.tsx     # Sales reps, commission slabs & payouts
│   │   │   ├── transfers/
│   │   │   │   └── StockTransferView.tsx # Multi-branch stock transfers
│   │   │   ├── accounts/
│   │   │   │   └── AccountsView.tsx      # Bank and cash accounts balances & transfers
│   │   │   ├── reports/
│   │   │   │   └── ReportsView.tsx       # Financial summaries, sales & stock audit
│   │   │   └── rbac/
│   │   │       └── DesignationManager.tsx # Visual role & permission editor
│   │   └── ui/                      # Reusable atomic design system primitives
│   │       ├── accordion.tsx
│   │       ├── badge.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── typography.tsx
│   ├── lib/
│   │   ├── sound.ts                 # Web Audio API synthesizer (beeps & chimes)
│   │   └── utils.ts                 # cn() class utility
│   ├── providers/
│   │   └── ReduxProvider.tsx        # React 19 lazy store provider
│   └── redux/
│       ├── api/
│       │   ├── baseApi.ts           # Dynamic fetchBaseQuery with JWT Bearer
│       │   ├── authApi.ts           # Login, logout, refresh token queries
│       │   ├── posApi.ts            # Sales, purchases, inventory, dashboard, ERP
│       │   └── rbacApi.ts           # Designations, permissions, users
│       ├── hooks.ts                 # Typed Redux hooks
│       └── store.ts                 # Centralized Redux store
```

---

## 4. Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env.local

# Run Next.js Development Server (Port 3000)
npm run dev

# Production Build
npm run build
npm run start
```

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

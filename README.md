# Smart Account POS frontend

A Next.js / React / RTK Query workspace for checkout, inventory, purchasing, returns, collections, finance and staff permissions. Pair this revision with the POS-Backend modernization branch.

## Local development

Use Node.js 22 or later. Run `npm ci`, copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_API_URL` to the Laravel API including `/api/v1`, then run `npm run dev`. Start the backend separately. Demo shortcuts are off by default; local demonstration accounts exist only if the backend demo seeder was explicitly run.

## Validation

```sh
npm run lint
npx tsc --noEmit
npm run build
npm audit --omit=dev
```

## Production

Run the backend migrations first, configure its `FRONTEND_URL` to this frontend's HTTPS origin, then build with the correct `NEXT_PUBLIC_API_URL`. Public environment variables are embedded at build time. Run `npm run build` and `npm run start`, or use your existing Next.js host. Keep demo mode off. The backend's real user permissions control navigation and are independently enforced by the API.

## Operational behavior

- Checkout drafts and retry identifiers are saved in session storage per staff, branch and checkout type. Drafts survive refresh in the same tab. Sign-out clears them. Drafts are not offline transactions; completed sales require the API.
- F1 selects customers, F2 scans, F3 selects products, F8 receives payment and F10 completes checkout. Quick customer creation is available in checkout.
- Held orders remain on the server during resume and are replaced only after a successful save in their original branch/type.
- Catalog maintenance includes SKU/barcode uniqueness, active status, per-product reorder thresholds and audited stock counts with conflict detection.
- CSV customer imports validate the entire file before saving (CSV only, 2 MB, 1,000 customers). Codes must be unique. Financial opening balances are entered separately.
- Reports and catalog exports download actual CSV data. Formula-like text is escaped for spreadsheet safety. Receipts support 80 mm and A4 browser print layouts. Printer hardware needs a separate store-side check.

See [the upgrade review](docs/POS-UPGRADE.md) for research, coverage and remaining scope.

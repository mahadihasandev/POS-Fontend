# POS research and upgrade review — October 8, 2026

## Research

Reviewed official [Shopify POS features](https://www.shopify.com/pos/features), [Shopify order management](https://help.shopify.com/en/manual/sell-in-person/shopify-pos/order-management), [Square inventory API overview](https://developer.squareup.com/docs/inventory-api/what-it-does), and [Shopify POS administration](https://help.shopify.com/en/manual/sell-in-person/getting-started/shopify-pos-from-admin/overview). Their catalog, barcode checkout, stock-count, returns, staff and reporting patterns informed the scope. This is an implementation prioritization, not a claim of parity with those products.

## Implemented

A navy workspace with teal actions and amber cash entry; responsive navigation; live dashboard, seven-day trend and stock attention; searchable quick-add checkout; customer creation in checkout; exact payment; per-staff/outlet draft recovery; server holds that survive resume failures; safe checkout retries; catalog create/edit/deactivate; per-product low-stock alerts; stock counts with staff/reason audit; wastage and expense screens; original-document returns; real report/catalog CSV exports; validated customer/supplier CSV imports; pagination and error recovery in primary registers; thermal/A4 receipts; real staff permissions.

## Corrected defects

Prevented overselling, duplicate product rows, negative balances, fabricated refunds, repeated advance use, excessive collections, discounts larger than sale totals, free-unit refund inflation and double posting on sale retries. Cash change is excluded from account deposits. Held checkout keeps invoice identity and branch/type. Removed simulated role switching, fake metrics, fabricated import success, unsupported report links and fake SMS success. Added API permissions, safe production owner/store provisioning, token refresh/logout handling, CORS allowlists, request-scoped caches, non-tag cache compatibility and correct compression headers. Repaired the frontend install lockfile and added CI in both repositories.

## Validation and limitations

Local validation: production build, ESLint and TypeScript passed; 40 backend integration/unit tests passed. Browser flows covered checkout/hold/resume, selected outlet, catalog creation, audited stock counts, expenses, report CSV download, draft recovery across navigation/refresh, session renewal, logout and cashier permissions. Desktop 1440px and mobile 390px layouts were visually checked. Runtime npm dependencies and Composer dependencies have no advisories in the checked audits. The full npm development audit still flags five high-severity entries in the ESLint braces dependency chain; the registry currently has no patched braces release. Downgrading Next's ESLint configuration to an incompatible version is not an appropriate fix. Monitor upstream and refresh the tooling lockfile when a compatible patch is released.

This release does not add tax compliance for a jurisdiction, independent outlet stock ledgers, offline payment posting, card-terminal processing, SMS delivery, full bookkeeping or hardware certification. Existing global stock/account semantics remain explicit. Walk-in returns need a customer-account policy. Large-catalog bootstrap loading and production database concurrency need measured checks on the deployment environment. No live store data was used or rewritten by this work.

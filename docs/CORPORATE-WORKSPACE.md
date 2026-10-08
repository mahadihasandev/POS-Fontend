# Corporate workspace refresh

The follow-up to the initial POS upgrade refines the existing app with a navy-and-teal visual system, consistent type weights, surfaces and controls, a split sign-in screen, a clearer dashboard, and a rebuilt staff-management page. Small screens use a compact sign-in header. Desktop navigation remains sticky, with its own scrollable menu.

## Completed workflows

- Module selection is represented by the URL hash: refresh, back/forward and saved page links retain the chosen module. Page changes reset workspace scrolling.
- The search button and Ctrl/Cmd+K open a keyboard-accessible page picker filtered by actual staff permissions.
- Dashboard shortcuts open checkout, inventory and reports only when allowed.
- Staff registration sends the selected `designation_id` in the registration request. It no longer creates an account and assigns a role through separate writes.
- Staff management has loading/error/retry states, searchable users, guarded unsaved permission changes, accessible dialogs, and API validation messages. Users without `users.manage` do not request or see the user-management section.
- Accounts with no module permissions see clear setup guidance; permitted accounts use their first available module as the fallback.
- Logout clears browser session data and starts a fresh document, avoiding requests made with a revoked token while clearing the query cache.

## Companion backend

Deploy the matching backend changes before this frontend. They accept an optional validated `designation_id` during registration, save it atomically with the user, allow an empty permission set, and prevent demoting the final administrator. No new database migrations are required for this follow-up; the initial upgrade migrations still apply.

## Verification

ESLint, TypeScript (production build) and the production build pass. The backend suite passes 44 tests / 235 assertions. Browser checks against the local API cover registration with a role, permission saving/removal, restricted navigation and empty access state, search, refresh/back/forward, desktop sidebar position while scrolling, and mobile layout. Test data is local demonstration data.

The prior upgrade's deployment and integration limits still apply. See POS-UPGRADE.md. This work does not add payment-terminal processing, offline transaction posting, branch-specific stock ledgers, or a production deployment.

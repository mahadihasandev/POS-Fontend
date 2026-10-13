# Employee email verification

In Staff & permissions, Add staff member now collects the required employee email, sends a six-digit code to that mailbox, and then asks for the code before creating the account. The employee gives the code to their administrator. The form supports resend, editing details, validation errors, and a verified status in the staff table.

The API is authoritative: skipping the form or submitting registration without a valid code does not create an employee. Codes expire after ten minutes, permit five wrong attempts and are limited to one send per minute per administrator/email pair. Resending replaces the previous code. The selected role is saved with the verified account.

## Deployment

Deploy with the matching `codex/staff-email-verification` backend. That version adds `/auth/register/request-code`, requires `verification_code` in registration, and includes `email_verified_at` in the staff list. Registration returns the user without employee session tokens. No new migration is needed.

The backend needs a real SMTP or supported mail provider with an authorized sender and a shared persistent cache. The backend README lists the settings. Log mail is only for local development; it does not deliver to an inbox. Existing accounts keep their existing verification status.

## Validation

Backend: 45 tests / 264 assertions passed. Frontend: production build and TypeScript passed; ESLint has no errors (nine pre-existing unused imports in CRM remain). The existing Next middleware deprecation warning also remains. A pre-existing synchronous auth-state effect was changed to a hydration-safe cookie snapshot so the lint check can pass.

The local browser test confirmed that sending a code left no user row, an incorrect code returned validation feedback, and the valid code created the account with its role and a verified timestamp. Email rendering was tested; local mail used the log transport. This does not prove delivery through a production mail provider.

# Security and verification

Everything that proves the application behaves — and refuses to misbehave — lives here.

| Path                   | Purpose                                                                      |
| ---------------------- | ---------------------------------------------------------------------------- |
| `checks.mjs`           | API, authentication and authorization checks against the running stack       |
| `browser/`             | Playwright tests driving Chromium at desktop (1280×800) and mobile (390×844) |
| `playwright.config.js` | Browser test configuration                                                   |
| `verification/`        | Generated results, screenshots and reports                                   |

Both suites run against the real local stack, so start it first (`npm start` from the project root).

```bash
npm run check          # node security/checks.mjs
npm run test:browser   # playwright test --config security/playwright.config.js
```

## What `checks.mjs` covers

It signs real accounts in through the Firebase SDK and drives the actual API and database.

**Security**

- Anonymous requests and forged tokens are rejected on protected endpoints.
- Roles cannot be escalated by a client — a member cannot make themselves an administrator.
- Passwords are never stored in the database.
- Ownership is enforced: members cannot modify or delete another member's cart, listings or orders.
- The server trusts its own prices and stock, not the values a client sends.
- Quantities are validated against the listing's stock and the allowed range.

**Functionality**

Registration, login and logout; image storage; listing creation and detail retrieval; cart
quantities; wishlist duplicates and removal; order creation, status and history; and reviews.

Temporary records created during the run are cleaned up; seeded accounts and manual test data are
kept. Results are written to `verification/local-checks.json`.

## What the browser tests cover

Navigation, registration, publishing a listing, the seller profile, checkout, administrator order
handover and reviews — driven through the real pages at both screen sizes. Every page is also
checked for horizontal overflow, uncaught page errors, and WCAG 2.1 AA violations using axe.
Screenshots land in `verification/`, and the HTML report in `verification/browser-report/`.

## Notes

`verification/REPORT.md` is an earlier assessment of the project, written before the local
development setup existed; it is kept for reference and describes that earlier state.

# CampusBazar verification report

Checked September 5, 2026 using Node v22.23.2 and npm 10.9.8.

**Verdict: partially working; cannot certify the whole project as working.** The production frontend builds and hosted public endpoints respond. A fresh checkout needs missing configuration, and confirmed defects remain.

## Source versions

- Frontend: https://github.com/md-imteaj-rana/CSE-470_Project-CampusBazar — `84bb5c6b5b9215717f2af1ef7ceb5e1293ad40fb`
- Backend: https://github.com/md-imteaj-rana/CSE-470_Project-backend — `26d1c14e9a6ca595c639b9a6e6fec15ff6faf253`
- Cloned into `../frontend` and `../backend`. Source files were not changed.

## Executed checks

| Check | Result |
|---|---|
| npm ci in both repositories | PASS |
| Frontend npm run build | PASS |
| Frontend npm run lint | FAIL: four errors |
| Backend node --check index.js | PASS |
| Backend npm test | FAIL: placeholder script, no tests implemented |
| Local frontend HTTP GET / | 200; only proves Vite serves HTML |
| Firebase SDK initialization without supplied config | Throws auth/invalid-api-key; reproduced with installed SDK in Node, not a browser |
| Local backend GET / | 200, Server is on |
| Local backend GET /listings | 500, MongoDB authentication failed without DB credentials |
| Local backend PATCH /users/profile/test@example.invalid with {} | 404; endpoint absent |
| Local backend GET /debug/routes | 500; app._router is undefined |
| Hosted frontend root | HTTP 200 |
| Hosted backend root | HTTP 200 |
| Hosted backend GET /listings | HTTP 200, JSON array with 8 listings |

Hosted checks were read-only. No real accounts, orders, uploads, or database mutations were attempted. HTTP responses do not establish visual correctness or successful end-to-end flows. The browser tool reported that no browser was available.

## Confirmed problems

1. **Missing local configuration.** `frontend/src/firebase/firebase.config.js:9` requires six VITE variables. Neither repository supplies an environment example or meaningful setup guide. Backend `index.js:19` requires DB_USER and DB_PASS for a hardcoded MongoDB Atlas cluster. Missing credentials are a setup blocker, not proof the hosted database is broken.
2. **Local frontend uses the production backend.** API URLs throughout frontend/src and hooks/UseAxios.jsx point to the Vercel service. Starting a local backend does not redirect requests to it. Introduce a configurable API base URL before doing isolated write tests.
3. **Profile updates cannot persist to MongoDB.** MyProfile.jsx calls PATCH /users/profile/:email, but the backend has no matching route; local request returns 404. The UI catches and logs that error while closing the form.
4. **Passwords are sent to and stored by the application database.** Register.jsx:57 includes `pass` in the payload posted to /users. Backend index.js:71 inserts the request body without removing it; GET /users and GET /users/role/:email return whole documents without authentication. This is established from source, not by retrieving hosted user records. Remove passwords from payloads and database records; Firebase already handles authentication.
5. **API authorization is missing or forgeable.** User role changes/deletions and order administration have no authentication middleware. verifyAdmin trusts a caller-supplied email instead of verifying a Firebase token. Client-side AdminRoutes does not protect the API. Add verified authentication and server-side role/ownership checks before real use. No exploit was attempted against the hosted deployment.
6. **Misleading database startup message.** The connection and ping checks are commented out, yet startup prints that MongoDB connected successfully. The listings request demonstrates that the message does not establish connectivity.
7. **Broken debug endpoint.** /debug/routes reads app._router.stack and returns 500 with the installed Express version.
8. **Lint errors.** Unused role in AuthProvider.jsx:14, unused isAdmin in Navbar.jsx:27, synchronous effect state update in MyCart.jsx:24, and unused user in Register.jsx:10. See lint.log. These are separate from the successful build.

## Setup for a complete local test

1. Use Node 22.23.2 (the version verified here) and run `npm ci` in each repository.
2. Create frontend/.env.local using the variable names in frontend.env.example in this folder, populated with the intended Firebase project's web configuration. Enable the appropriate Firebase sign-in provider and authorize the local domain as needed.
3. Obtain access to an isolated test MongoDB database. The current backend requires DB_USER and DB_PASS for its hardcoded cluster; to use another cluster or localhost, first change it to accept a MONGODB_URI environment variable.
4. Configure all frontend API requests to target the test backend, e.g. http://localhost:3000, before making any account or commerce changes.
5. Start the backend with `npm start` and frontend with `npm run dev`, in their respective folders.
6. Confirm GET /listings succeeds locally; the root response alone is insufficient.
7. Use a disposable test account to verify registration, login/logout, marketplace search/filtering, listing creation/image upload, details, wishlist, cart quantity/removal, checkout, order history/reviews, profile persistence after reload, and administrator access/status changes. Verify ordinary users cannot invoke administrative or other users' operations.

## Remaining limits

No visual browser test or authenticated end-to-end flow was completed. Firebase config, working isolated database access, and a test account are needed. Hosted deployment versions were not established to match the cloned commits. Passing the build and public GET checks is insufficient to approve the whole application.

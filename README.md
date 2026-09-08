# ComunityBazar

A community marketplace with a React/Vite frontend, an Express/MongoDB backend, and a security
and verification suite. Everything runs locally: no cloud account, no Docker, no real credentials.

## Contents

| Folder      | What lives there                                                          |
| ----------- | ------------------------------------------------------------------------- |
| `frontend/` | React application, its Vite build and production build script             |
| `backend/`  | Express API, Firebase emulator configuration, and the local stack scripts |
| `security/` | Security and verification suite: API/auth checks, browser tests, reports  |

## Run locally

Tested on Ubuntu 24.04 with Node.js 22.23.2 and npm 10.9.8.

```bash
npm ci
npm run setup
npm start
```

Open **http://localhost:5173** once the terminal says ComunityBazar is ready. Setup installs the
frontend and backend dependencies and creates local environment files from the examples without
overwriting existing ones. MongoDB is downloaded on first setup, so the first run needs internet
access.

| Local test account | Email                      | Password   |
| ------------------ | -------------------------- | ---------- |
| Student            | student@comunitybazar.test | Campus123! |
| Administrator      | admin@comunitybazar.test   | Campus123! |

These accounts exist only in the local authentication emulator, and sample listings are seeded
automatically. Use test data only.

Press **Ctrl+C** in the start terminal to stop every service and save the authentication data. If
the stack was started in the background, run `npm stop`. Do not run two instances at once.

## Verify

With the app running, in a second terminal:

```bash
npm run check          # API, auth and security checks
npm run test:browser   # Chromium tests at desktop and mobile sizes
```

Both suites live in `security/`; see [security/README.md](security/README.md) for what they cover
and where the results land.

## Local services and data

| Component                         | Address / location                                         |
| --------------------------------- | ---------------------------------------------------------- |
| Frontend                          | http://localhost:5173                                      |
| Express API                       | http://127.0.0.1:3000                                      |
| MongoDB                           | mongodb://127.0.0.1:27017 (database `ComunityBazar-local`) |
| Firebase Auth emulator            | http://127.0.0.1:9099 (internal ports 4400, 4500)          |
| Database, images and auth exports | `.local-data/`                                             |
| Service logs                      | `.local-data/logs/`                                        |

Every service binds to loopback. MongoDB keeps persistent WiredTiger storage in
`.local-data/mongodb` — despite the `mongodb-memory-server` package name, this configuration
writes to disk. Firebase authentication exports on a clean shutdown and imports on the next start,
so forcing termination can lose account changes made since the last export.

## Other commands

```bash
npm run seed                    # re-create the test accounts and sample listings
npm run build --prefix frontend # rebuild the frontend
npm ci --prefix frontend        # reinstall frontend dependencies
npm ci --prefix backend         # reinstall backend dependencies
```

## Configuration

- Frontend API requests go through `frontend/src/config/api.js`, configured by `VITE_API_BASE_URL`.
- `frontend/.env.local` holds a demo Firebase configuration and the emulator URL.
- `backend/.env` points at the local database and enables local image uploads. With
  `VITE_LOCAL_UPLOADS=true` uploaded files stay in `.local-data/uploads`; the production ImgBB path
  needs `VITE_IMGBB_API_KEY`.
- `backend/firebase.json` configures the authentication emulator.

## Known limitations

This configuration is for local evaluation only; do not deploy it or use real credentials with it.
The automated checks cover the API, the Firebase SDK integration and the browser interface at both
screen sizes. They do not cover real Firebase/ImgBB integrations, real payments, or behaviour under
load — checkout records handover details and never processes a payment. The earlier project
assessment, written before the local setup existed, is kept at
[security/verification/REPORT.md](security/verification/REPORT.md); its findings describe that
earlier state.

Dependencies, generated builds, personal environment files, uploaded images and local databases are
intentionally excluded from version control. The lockfiles and `npm run setup` recreate them.

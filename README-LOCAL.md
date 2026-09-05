# Run CampusBazar on this machine

This repository includes `frontend/`, `backend/`, and local development tools. Workspace tooling installs Firebase CLI and a real MongoDB binary; Docker and a cloud account are not required. Use Node.js 22.23.2 or a compatible Node 22 version. The setup was verified on Ubuntu 24.04; the background stop script uses Linux /proc.

## Start

```bash
cd <your-clone-directory>
npm start
```

Open **http://localhost:5173** after the terminal says CampusBazar is ready.

| Local account | Email | Password |
|---|---|---|
| Student | student@campusbazar.test | Campus123! |
| Administrator | admin@campusbazar.test | Campus123! |

These are disposable local test credentials. Sample listings are created automatically. You can also register new accounts using a PNG/JPEG/WebP/GIF profile photo (up to 5 MB). Only use test information because the application has known security defects.

Press **Ctrl+C** in the start terminal to stop all services and save authentication data. If the stack was started in the background, run `npm stop`. Do not run two instances at once.

## Check

In a second terminal, while the app is running:

```bash
cd <your-clone-directory>
npm run check
```

This uses the Firebase SDK and the actual local database/API to test registration/login/logout, image storage, listing creation/details, cart quantities, wishlist duplicates/removal, order creation/status/history, and reviews. Temporary smoke-test records are cleaned up; sample accounts and your manual test data are retained. It also reports the known profile-update and debug-route failures. Results go to `verification/local-checks.json`.

To rebuild the frontend:

```bash
npm run build --prefix frontend
```

To reinstall dependencies if necessary:

```bash
npm ci
npm ci --prefix frontend
npm ci --prefix backend
```

## Local services and data

| Component | Address / location |
|---|---|
| Frontend | http://localhost:5173 |
| Express API | http://127.0.0.1:3000 |
| MongoDB | mongodb://127.0.0.1:27017 |
| Database | CampusBazar-local |
| Firebase Auth emulator | http://127.0.0.1:9099 |
| Emulator internal ports | 4400 and 4500 |
| Database, images and auth exports | .local-data/ |
| Service logs | .local-data/logs/ |

All services bind to loopback. MongoDB uses persistent WiredTiger storage in `.local-data/mongodb`; despite the tool's name `mongodb-memory-server`, this configuration keeps data on disk. Firebase authentication exports on a clean shutdown and imports on the next start. Forced termination or powering off can lose authentication changes since the last export.

## Changes made to support local testing

- All frontend API requests use `src/config/api.js`, configured through `VITE_API_BASE_URL`.
- `frontend/.env.local` contains a demo Firebase configuration and emulator URL. No owner's credentials are needed.
- `backend/.env` points at the local database and enables local image uploads. Database connection and ping now actually run.
- Image uploads use `src/utils/uploadImage.js`. With `VITE_LOCAL_UPLOADS=true`, files stay in `.local-data/uploads`; production ImgBB upload requires `VITE_IMGBB_API_KEY` when local mode is disabled.
- `npm start` starts MongoDB, authentication, backend and frontend; it seeds test accounts and listings.

## Known limitations

This setup makes the project testable locally; it does not fix every existing defect. Profile edits update Firebase but cannot update the MongoDB profile because PATCH /users/profile/:email is absent. GET /debug/routes returns 500. Frontend lint still reports the same four errors. Password storage and missing/forgeable API authorization remain issues; do not deploy this configuration or use real credentials.

The automatic checks cover API and SDK integration, not browser clicks or visual layout. Manually test navigation, registration forms, search/filtering, adding listings, cart/checkout screens, reviews, and administrator pages in your browser. Real Firebase/ImgBB integrations and real payments are not verified by this local setup. The checkout records payment details; it does not process a real payment.

Initial project assessment: `verification/REPORT.md`. That report describes the initial checkout before these local setup changes.

References: [Firebase Authentication emulator](https://firebase.google.com/docs/emulator-suite/connect_auth) and [MongoDB local process configuration](https://github.com/typegoose/mongodb-memory-server).

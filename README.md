# ComunityBazar

A campus marketplace with a React/Vite frontend, Express/MongoDB backend, and tools to run an isolated local development environment.

## Run locally

Tested on Ubuntu 24.04 with Node.js 22.23.2 and npm 10.9.8.

```bash
npm ci
npm run setup
npm start
```

Open http://localhost:5173. Setup installs frontend/backend dependencies and creates local environment files from the examples without overwriting existing files. MongoDB is downloaded on first installation/start, so internet access is needed for initial setup.

| Local test account | Email | Password |
|---|---|---|
| Student | student@comunitybazar.test | Campus123! |
| Administrator | admin@comunitybazar.test | Campus123! |

These accounts exist only in the local authentication emulator. Use test data only.

In a second terminal, run `npm run check` for API/Firebase SDK integration checks. Stop with Ctrl+C; `npm stop` also stops a managed background instance on Linux.

See [local development instructions](README-LOCAL.md) and the [project assessment](verification/REPORT.md). Known profile-update, authorization, password-storage and lint issues remain; this setup is for local evaluation and is not production-ready.

## Contents

- `frontend/`: React application
- `backend/`: Express API
- `scripts/`: local database/auth startup, sample data and integration checks
- `firebase.json`: local authentication emulator configuration

Dependencies, generated builds, personal environment files, uploaded images and local databases are intentionally excluded. The lockfiles and setup command recreate the dependencies.

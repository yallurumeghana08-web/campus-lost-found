# Deploy Campus Lost & Found on Render

## Backend (Web Service)
- Push this folder to a private GitHub repository.
- New > Web Service > connect repository.
- Root Directory: `backend`
- Runtime: Node
- Build Command: `npm install`
- Start Command: `npm start`
- Environment: `JWT_SECRET` = a long randomly generated secret.
- Optional persistent SQLite: attach a Render persistent disk at `/var/data`, then set `DB_PATH=/var/data/database.sqlite`. Persistent disks require a paid instance and are not available on free services. Without one, data can be lost on restarts/deploys. Existing SQLite records are NOT automatically copied to a newly mounted disk.
- Copy the backend URL, e.g. `https://your-backend.onrender.com`.

## Frontend (Static Site)
- New > Static Site > connect same repository.
- Root Directory: `cilent` (this spelling is intentional).
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment: `VITE_API_URL` = backend URL without trailing slash or `/api`.
- Deploy after setting this variable.

## Verify
- Open the backend URL with `/api/items` (public endpoint).
- Open the frontend site, register/login, add an item and refresh.
- For persistent use, verify data remains after a backend restart.

## Notes
- Keep JWT_SECRET private; do not commit actual secrets.
- This package removes Git internals. Review the bundled SQLite database for private information before publishing your repository.
- The frontend contained an invalid stray JSX navbar at the top of App.jsx; it was removed, and the logo path was corrected.

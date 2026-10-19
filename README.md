# ScrollBite

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FKartiksh123%2FScrollBite)

ScrollBite is a food discovery app for short cooking and restaurant videos. Users can like, save, and comment on reels; food partners can create an account and upload videos.

## Live demo

[Open ScrollBite](https://scrollbite-kartiksh123-55ct.onrender.com/)

## Local development

Requirements: Node.js 24, npm, MongoDB, and optional ImageKit credentials for partner uploads.

### Backend

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Fill in `MONGODB_URI` and `JWT_SECRET` in `backend/.env`. ImageKit keys are only needed when uploading new videos. Then start the backend:

```powershell
npm start
```

### Frontend

In another terminal:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. On Android using the same Wi-Fi, start Vite with `npm run dev -- --host 0.0.0.0` and use the computer's LAN address.

### Demo data

The demo seed creates five fictional food partners and 15 reels. The clips and their Pexels source credits are in [`videos/`](videos/README.md). From `backend/`, run:

```powershell
npm run seed:demo
```

All demo partner accounts use the password `ScrollBiteDemo123!`. Sign in with one of these fictional accounts:

- `juniper.table@example.com`
- `kosha.kitchen@example.com`
- `little.olive@example.com`
- `paper.lantern@example.com`
- `sunday.sourdough@example.com`

## Deployment

GitHub stores the source repository. GitHub Pages only serves static files and does not run this app's Express API ([GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages)). The included Render Blueprint deploys the built React frontend and Express API together on one Render web service; MongoDB Atlas hosts the database. This keeps login cookies same-origin and serves the local reel files through the API.

1. Keep this GitHub repository connected to Render for automatic deploys from `main`. `.env` files, dependencies, and the frontend build output are ignored by Git.
2. Create an Atlas database user and database, and add the Render service's outbound IP ranges to the Atlas project's IP access list. Keep the database user limited to the ScrollBite database.
3. Use the **Deploy to Render** button above, connect your Render account to GitHub, and apply the Blueprint from `render.yaml`.
4. Set the Blueprint's `MONGODB_URI`. Render generates `JWT_SECRET`. Demo reels work without ImageKit; add the ImageKit values in the Render service settings if partner uploads should be enabled.
5. After the deploy is healthy, open the [live demo](https://scrollbite-kartiksh123-55ct.onrender.com/). The root route opens the user registration page.
6. To populate the hosted database with the demo partners and reels, set `MONGODB_URI` locally to the Atlas connection string and run `npm run seed:demo` from `backend/`. This inserts the demo records into that database.

A free Render web service may sleep after 15 minutes without traffic and take about a minute to wake on the next request. See [Render's free instance notes](https://render.com/docs/free). For Atlas networking, use [Render's outbound IP ranges](https://render.com/docs/outbound-ip-addresses) in the [Atlas IP access list](https://www.mongodb.com/docs/atlas/security/ip-access-list/).

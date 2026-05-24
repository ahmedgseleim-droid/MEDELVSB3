# SAMBA 2 Tracker — Self-Hosting Guide

This guide walks you through running the SAMBA 2 Tracker on your own computer or free cloud service so your whole team can access it from anywhere.

---

## Requirements

- Node.js 20 or newer (you already have this)
- VS Code (you already have this)
- Git (free — download from https://git-scm.com)
- A free PostgreSQL database (instructions below)

---

## Option A — Run on Your Work Computer (Free, Always-On with Cloudflare Tunnel)

### Step 1 — Get a free PostgreSQL database

Go to https://neon.tech and create a free account.
- Create a new project called "samba2-tracker"
- Copy the connection string — it looks like:
  `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`

### Step 2 — Set up the project

Open VS Code, open a Terminal, and run:

```bash
# Install dependencies
pnpm install

# Create your environment file
cp .env.example .env
```

Open `.env` and fill in your values:
```
DATABASE_URL=postgresql://...  (paste your Neon connection string here)
SESSION_SECRET=any-long-random-text-here
APP_PASSWORD=MEDEL@VSB
PORT=5000
```

### Step 3 — Set up the database

```bash
pnpm --filter @workspace/db run push
```

### Step 4 — Build and run the app

```bash
# Build the frontend
pnpm --filter @workspace/samba2-tracker run build

# Build the API server
pnpm --filter @workspace/api-server run build

# Start the server
node artifacts/api-server/dist/index.mjs
```

The app is now running at http://localhost:5000

### Step 5 — Make it accessible from anywhere (Cloudflare Tunnel — FREE)

1. Download Cloudflare Tunnel (cloudflared) from:
   https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

2. Create a free Cloudflare account at https://cloudflare.com

3. Run this command (one time to get a free URL):
```bash
cloudflared tunnel --url http://localhost:5000
```

4. You will get a free URL like `https://abc-def-ghi.trycloudflare.com`
   Share this URL + password (MEDEL@VSB) with your team.

**Note:** For a permanent URL (same link every time), create a named tunnel in Cloudflare dashboard — still free.

---

## Option B — Deploy to Render.com (Free Cloud — Best Option)

This hosts your app in the cloud 24/7 without needing your computer to be on.

### Step 1 — Create free accounts

- GitHub: https://github.com (free)
- Render: https://render.com (free tier available)

### Step 2 — Upload code to GitHub

In VS Code terminal:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOURUSERNAME/samba2-tracker.git
git push -u origin main
```

### Step 3 — Deploy on Render

1. Go to https://render.com and sign in with GitHub
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Fill in these settings:
   - **Name:** samba2-tracker
   - **Runtime:** Node
   - **Build Command:** `pnpm install && pnpm --filter @workspace/db run push && pnpm --filter @workspace/samba2-tracker run build && pnpm --filter @workspace/api-server run build`
   - **Start Command:** `node artifacts/api-server/dist/index.mjs`
5. Click "New" → "PostgreSQL" on Render to get a free database
6. Add these Environment Variables in Render dashboard:
   - `DATABASE_URL` = (copy from your Render PostgreSQL)
   - `SESSION_SECRET` = any long random string
   - `APP_PASSWORD` = MEDEL@VSB
   - `PORT` = 5000

7. Click "Deploy"

Your app will be live at a URL like: `https://samba2-tracker.onrender.com`

**Free tier note:** The app sleeps after 15 minutes of no activity and takes about 30 seconds to wake up on first visit. This is fine for a team tool.

---

## Sharing with your team

Once deployed, share:
1. The URL (e.g. https://samba2-tracker.onrender.com)
2. The password: MEDEL@VSB

That's it — they open the link in any browser, enter the password, and they're in.

---

## Backing up your data

Use the Export CSV button inside the app regularly to save a copy of all records to your computer.

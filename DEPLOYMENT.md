# FIFA 2026 Stadium App – Render.com Free Tier Deployment Guide

This guide walks you through deploying the FIFA 2026 GenAI Stadium App on Render.com Free Tier. The app is resilient to cold starts and ephemeral storage constraints.

---

## Prerequisites

Before you start, ensure:

- ✅ GitHub account with the monorepo pushed to a public or private repository
- ✅ **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/app/apikeys)
- ✅ **Firebase Service Account JSON** (download from Google Cloud Console)
- ✅ Render account (sign up at [render.com](https://render.com))

---

## Step 1: Prepare Your GitHub Repository

1. Push the entire monorepo to GitHub (if not already done):

   ```bash
   git add .
   git commit -m "chore: prepare for Render deployment"
   git push origin main
   ```

2. Verify the repository structure includes:
   - `render.yaml` (infrastructure config)
   - `package.json` (with workspaces and build/start scripts)
   - `server/` (Express app)
   - `client/` (React Vite app)
   - All tests and configuration files

---

## Step 2: Create a Render Web Service

### Option A: Deploy via render.yaml (Recommended)

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. **Connect GitHub Repository**:
   - Select your repository
   - Choose the branch: `main`
   - Click **"Connect"**
4. **Configure the Service**:
   - **Name**: `fifa-2026-stadium-app` (or your preferred name)
   - **Root Directory**: Leave blank (monorepo root)
   - **Runtime**: Node.js
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free tier
   - **Auto-Deploy**: Enable (check "Deploy on git push to main")

5. **Don't create yet** – continue to Step 3 to add environment variables first.

### Option B: Deploy via GitHub Integration (Alternative)

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"** → **"Connect a GitHub repository"**
3. Select the repo and branch
4. Fill in the same configuration as Option A
5. Continue to Step 3

---

## Step 3: Add Environment Variables

After creating the web service (or before hitting "Create"), add these environment variables in the Render dashboard under **Environment**:

### Required Variables

1. **`NODE_ENV`**
   - Value: `production`
   - Purpose: Enables production hardening (Helmet, CORS, error sanitization)

2. **`PORT`**
   - Value: `8080`
   - Note: Render automatically sets this; you can leave it for clarity

3. **`GEMINI_API_KEY`**
   - Value: _(Paste your Gemini API key from Google AI Studio)_
   - Example: `AIzaSyD...`
   - ⚠️ **Keep this secret!** Enable "Sensitive" option in Render

4. **`GOOGLE_APPLICATION_CREDENTIALS_JSON`**
   - Value: _(Entire Firebase service account JSON as a single-line string)_
   - Step to obtain:
     1. Go to [Google Cloud Console](https://console.cloud.google.com)
     2. Select your Firebase project
     3. Service Accounts → Generate new private key
     4. Download the JSON file
     5. Copy the **entire JSON content** and paste it as a single line in Render
   - ⚠️ **Mark as Sensitive!** (sensitive variables are hidden in logs)
   - Example:
     ```
     {"type":"service_account","project_id":"my-project","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-...@my-project.iam.gserviceaccount.com",...}
     ```

5. **`GOOGLE_CLOUD_PROJECT`** (Optional but recommended)
   - Value: Your Firebase project ID (e.g., `my-stadium-app`)
   - Purpose: Explicit project selection for Firestore
   - ⚠️ **Mark as Sensitive!**

### Optional Variables

- **`REDIS_URL`**: Leave empty (uses in-memory cache fallback; Redis is not needed on free tier)
- **`LOG_LEVEL`**: `info` (or `debug` for verbose logs during troubleshooting)
- **`TELEMETRY_SIM_ENABLED`**: `true` (simulates crowd telemetry for demo purposes)
- **`GEMINI_MODEL`**: `gemini-2.0-flash` (default; change only if needed)

---

## Step 4: Deploy the Service

1. **Review Configuration**:
   - Verify all environment variables are set
   - Confirm build command: `npm run build`
   - Confirm start command: `npm start`
   - Check "Auto-Deploy" is enabled

2. **Click "Create Web Service"** and wait for deployment to start

3. **Monitor Deployment**:
   - Render will show **Build Logs** → **Deploy Logs** → **Runtime Logs**
   - Wait for the message: `"ArenaIQ server listening on port 8080"`
   - Status should change to **"Live"** (green checkmark)

4. **Expected Timeline**:
   - Build: ~2–3 minutes (node_modules install, client build, server build)
   - Deploy: ~1 minute (startup seeding from Firestore)
   - **Total**: ~3–4 minutes for first deployment

---

## Step 5: Access Your Live Service

Once status is **"Live"**, your app is available at:

```
https://{service-name}.onrender.com
```

Example: `https://fifa-2026-stadium-app.onrender.com`

**First Load** (cold start):

- May take 10–30 seconds (Render Free Tier spins up the instance)
- Subsequent loads are fast (warm instance)
- Health check endpoint: `https://{service-name}.onrender.com/health` (returns `{"status":"ok"}`)

---

## Step 6: Verify Deployment

See **VERIFICATION.md** for the complete 6-pillar verification checklist. Quick sanity check:

```bash
# Test the health endpoint
curl https://{service-name}.onrender.com/health
# Expected response: {"status":"ok"}

# Test the app loads
curl https://{service-name}.onrender.com
# Should return the HTML shell for the React app
```

---

## Troubleshooting

### Deploy Failed – Build Error

**Check logs** in Render dashboard:

1. Click the service
2. Go to **Logs** → **Build**
3. Look for errors (missing dependencies, TypeScript errors, etc.)

Common issues:

- **Missing workspace scripts**: Verify `package.json` has `"build"` and `"start"` scripts
- **Vite build error**: Check `client/vite.config.ts` for hardcoded localhost URLs
- **Server TypeScript error**: Ensure `npm run type-check` passes locally before pushing

**Fix & redeploy**:

```bash
git add .
git commit -m "fix: build error"
git push origin main
# Render auto-deploys on push
```

### Deploy Failed – Environment Variable Error

**Error**: `Invalid environment configuration - GEMINI_API_KEY: ...`

**Fix**:

1. Go to Render dashboard → Service → Settings
2. Check **Environment** → Verify all required vars are set
3. Ensure no extra whitespace in values
4. Redeploy: Click **"Manual Deploy"** → **"Deploy latest commit"**

### Server Crashes After Deploy

**Check runtime logs**:

1. Render dashboard → Service → **Logs** → **Runtime**
2. Look for error messages (Firestore connection, secret parsing, etc.)

Common issues:

- **Firestore connection**: Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` is valid
- **Invalid JSON**: Ensure the JSON is a single line (no newlines except `\n` escape sequences)
- **Cold start timeout**: First request may timeout (30s limit); Render retries automatically

### App Loads but Features Don't Work

**Debug**:

1. Open browser DevTools (F12) → **Console** tab
2. Check for errors (API calls failing, missing env vars, etc.)
3. Go to **Network** tab → Filter by `XHR` → Check API responses
4. Verify environment variables in Render dashboard match the live service

**Example**: If assistant doesn't respond:

- Check Gemini API key is valid in Render dashboard
- Verify API request isn't rate-limited (should show 429 error)
- Check Render logs for Gemini API errors

---

## Maintenance

### Update Code & Redeploy

1. Make changes locally and test:

   ```bash
   npm run test:coverage  # Ensure all tests pass
   npm run lint
   npm run type-check
   ```

2. Push to GitHub:

   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin main
   ```

3. Render auto-deploys on push (if auto-deploy is enabled)

4. Monitor deployment in Render dashboard

### Update Secrets (API Keys, Credentials)

1. Rotate in Google Cloud Console or AI Studio
2. Go to Render dashboard → Service → Settings → **Environment**
3. Update the secret value
4. Click **"Manual Deploy"** → **"Deploy latest commit"** (forces restart with new secrets)

### Monitor Costs

- Render Free Tier includes **750 hours/month** (enough for 1 service running 24/7)
- Check **Render Dashboard** → **Billing** for monthly usage
- If you exceed free tier, disable the service or upgrade

### Cold Start Optimization (Optional)

Render Free Tier instances spin down after 15 minutes of inactivity. To keep your service warm, see **COLD_START_MITIGATION.md** for UptimeRobot or GitHub Actions configuration.

---

## Summary

| Step      | Action                    | Time           |
| --------- | ------------------------- | -------------- |
| 1         | Push code to GitHub       | 2 min          |
| 2         | Create Render web service | 3 min          |
| 3         | Add environment variables | 2 min          |
| 4         | Deploy                    | 3–4 min        |
| 5         | Access live URL           | 1 min          |
| 6         | Verify (6 pillars)        | 10–15 min      |
| **Total** |                           | **~25–30 min** |

Once deployed, your FIFA 2026 Stadium App will be live and resilient to Render's free-tier constraints!

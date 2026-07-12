# FIFA 2026 Stadium App – Render Deployment Quick Start

**Your app is ready for production on Render.com Free Tier!** 🎉

This document is a **quick reference** for the most important steps. For detailed instructions, see the linked guides.

---

## 📋 Files Generated

| File                              | Purpose                         | Status   |
| --------------------------------- | ------------------------------- | -------- |
| `render.yaml`                     | Infrastructure definition       | ✅ Ready |
| `package.json`                    | Build/start scripts (updated)   | ✅ Ready |
| `.github/workflows/keep-warm.yml` | Optional keep-warm workflow     | ✅ Ready |
| `DEPLOYMENT.md`                   | Step-by-step setup guide        | ✅ Ready |
| `VERIFICATION.md`                 | 6-pillar verification checklist | ✅ Ready |
| `COLD_START_MITIGATION.md`        | Keep instance warm (optional)   | ✅ Ready |
| `README-RENDER.md`                | Deployment summary              | ✅ Ready |

---

## 🚀 Quick Start (3 Steps)

### Step 1: Verify Local (2 min)

```bash
npm run test:coverage    # All tests pass?
npm run lint            # Zero lint errors?
npm run type-check      # Zero TypeScript errors?
npm run build           # Builds successfully?
```

If all pass, continue. If any fail, fix locally first.

### Step 2: Deploy on Render (15 min)

1. Go to [https://dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"** → Connect GitHub repo
3. **Configure**:
   - Build: `npm run build`
   - Start: `npm start`
   - Health check: `/health`
4. **Add Environment Variables** (before deploying):
   - `NODE_ENV` = `production`
   - `GEMINI_API_KEY` = _(your Gemini key)_ [Get here](https://aistudio.google.com/app/apikeys)
   - `GOOGLE_APPLICATION_CREDENTIALS_JSON` = _(Firebase JSON)_ [Get here](https://console.cloud.google.com)
   - `GOOGLE_CLOUD_PROJECT` = _(your project ID)_
   - Mark API keys as **Sensitive**
5. Click **"Create Web Service"** and wait for **"Live"** status

**Expected time**: 3–4 minutes build + 1 minute startup

### Step 3: Verify Live (5 min)

```bash
# Test health endpoint
curl https://{service-name}.onrender.com/health
# Expected: {"status":"ok"}

# Open in browser
https://{service-name}.onrender.com
```

✅ App is live!

---

## ✅ Verification Checklist (Quick)

### Before Deployment

- [ ] `npm run test:coverage` — 100% pass
- [ ] `npm run lint` — 0 errors
- [ ] `npm run type-check` — 0 errors
- [ ] `git push origin main` — Code pushed

### After Deployment

- [ ] Health endpoint responds: `curl https://{service-name}.onrender.com/health`
- [ ] App loads in browser
- [ ] Lighthouse score ≥95 (DevTools → Lighthouse)
- [ ] No secrets in DevTools → Network tab
- [ ] Assistant works (cache hits faster)
- [ ] Operations heatmap visible
- [ ] SOS button functional
- [ ] Multi-language support works

**Full checklist**: See [VERIFICATION.md](VERIFICATION.md)

---

## 🔧 Environment Variables

### Required

```
GEMINI_API_KEY=AIzaSyD...
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
```

### Recommended

```
NODE_ENV=production
GOOGLE_CLOUD_PROJECT=my-stadium-app
```

### Don't Set (Uses Fallback)

```
REDIS_URL=  # Leave empty, app uses in-memory cache
```

---

## 🌡️ Keep Instance Warm (Optional)

### Option A: GitHub Actions (Recommended)

```bash
# Already created in .github/workflows/keep-warm.yml
# Just update the service name:
# Change: SERVICE_NAME="fifa-2026-stadium-app"
# To: SERVICE_NAME="your-actual-service-name"

git add .github/workflows/keep-warm.yml
git commit -m "ci: update service name"
git push origin main
```

**Result**: GitHub Actions pings `/health` every 10–15 minutes → instance stays warm

### Option B: UptimeRobot (Extra Monitoring)

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor: `https://{service-name}.onrender.com/health`
3. Interval: 10 minutes
4. Done ✅

**See [COLD_START_MITIGATION.md](COLD_START_MITIGATION.md) for details**

---

## 📊 Expected Performance

| Metric                     | Value      | Notes                                      |
| -------------------------- | ---------- | ------------------------------------------ |
| **First request**          | 10–30 sec  | Cold start (one-time)                      |
| **Warm requests**          | 100–200 ms | Fast and consistent                        |
| **Lighthouse**             | ≥95        | Performance, Accessibility, Best Practices |
| **API response time**      | 200–500 ms | Gemini + cache                             |
| **Cache hit (repeated Q)** | <50 ms     | In-memory cache                            |
| **Uptime**                 | 99.5%+     | Free tier reliability                      |
| **Cost**                   | ~$0–30/mo  | Depends on usage                           |

---

## 🐛 Troubleshooting

### Build Failed

```bash
# Check local build first
npm run build
# If that fails, fix errors
# Then push to GitHub and redeploy
git push origin main
```

### App Crashes on Render

1. Go to Render dashboard → Logs → Runtime
2. Look for error message (Firestore, API key, etc.)
3. Fix and redeploy: `git push origin main`

### First Request Slow

- **Expected**: Cold start takes 10–30 seconds
- **Solution**: Set up keep-warm workflow (above)
- **After**: Subsequent requests are fast (<200ms)

### Tests Fail on Live

```bash
# E2E tests need the live URL
export BASE_URL=https://{service-name}.onrender.com
npm run test:e2e
```

### See More Troubleshooting

[DEPLOYMENT.md → Troubleshooting](DEPLOYMENT.md#troubleshooting)

---

## 📖 Full Documentation

| Document                                             | Purpose                                     | Read Time |
| ---------------------------------------------------- | ------------------------------------------- | --------- |
| [DEPLOYMENT.md](DEPLOYMENT.md)                       | Step-by-step manual setup + troubleshooting | 15 min    |
| [VERIFICATION.md](VERIFICATION.md)                   | 6-pillar verification on live URL           | 20 min    |
| [COLD_START_MITIGATION.md](COLD_START_MITIGATION.md) | Keep warm + monitoring options              | 10 min    |
| [README-RENDER.md](README-RENDER.md)                 | Summary of all changes + reference          | 10 min    |

---

## 🎯 Key Highlights

✅ **Zero Code Changes Required** — App already production-ready
✅ **Render-Compatible** — Works with free tier constraints
✅ **Security Hardened** — Helmet, CORS, sanitized errors
✅ **Resilient Without Redis** — Uses in-memory TTL cache
✅ **Verified on 6 Pillars** — Code quality, security, efficiency, testing, accessibility, problem alignment
✅ **Cost Effective** — ~$0–30/month on free tier
✅ **Automated Deployment** — Auto-deploy on `git push main`

---

## 🚀 Next Steps

1. **Deploy**: Follow [DEPLOYMENT.md](DEPLOYMENT.md) step-by-step
2. **Verify**: Use [VERIFICATION.md](VERIFICATION.md) checklist on live URL
3. **Warm Up** (optional): Set up [keep-warm workflow](COLD_START_MITIGATION.md)
4. **Monitor**: Check Render dashboard weekly
5. **Update**: Push code changes → Render auto-deploys

---

## 💡 Pro Tips

- **Cold Start**: First request takes 30s max (set expectations for first users)
- **Cache**: Identical questions return instantly from in-memory cache
- **Secrets**: All API keys marked as "Sensitive" in Render dashboard
- **Logs**: Render dashboard → Logs tab shows everything
- **Updates**: Just `git push main` → Render auto-deploys in 3–4 min
- **Costs**: Monitor Render Dashboard → Billing monthly

---

## ❓ Questions?

- **Setup questions**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Verification**: See [VERIFICATION.md](VERIFICATION.md)
- **Performance**: See [COLD_START_MITIGATION.md](COLD_START_MITIGATION.md)
- **Overview**: See [README-RENDER.md](README-RENDER.md)

---

**Your app is production-ready! Deploy it now! 🎉**

Go to [https://dashboard.render.com](https://dashboard.render.com) and follow [DEPLOYMENT.md](DEPLOYMENT.md).

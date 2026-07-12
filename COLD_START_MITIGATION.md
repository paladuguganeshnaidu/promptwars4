# Cold-Start Mitigation for Render Free Tier

Render's free tier spins down instances after **15 minutes of inactivity**. This guide provides optional configurations to keep your FIFA 2026 Stadium App instance warm and responsive.

---

## Problem

- **Cold start**: First request after inactivity takes 10–30 seconds (instance boots up)
- **Free tier limit**: 750 hours/month (24/7 for ~31 days), but uneven usage can cause spin-downs
- **User experience**: First user to access the app after a gap experiences a delay

---

## Solution Overview

Choose **one** of these approaches:

1. **GitHub Actions** (Free, simple, no external service)
2. **UptimeRobot** (Free tier, reliable monitoring + pings)

Both ping the `/health` endpoint every 10–15 minutes to keep the instance alive.

---

## Option 1: GitHub Actions (Recommended for Simplicity)

### Setup

1. **Create Workflow File**:

   ```bash
   mkdir -p .github/workflows
   touch .github/workflows/keep-warm.yml
   ```

2. **Add Workflow Content**:

   ```yaml
   name: Keep Render Instance Warm

   on:
     schedule:
       # Every 10 minutes, Mon–Fri during business hours (6 AM–10 PM UTC)
       - cron: '*/10 6-22 * * 1-5'
       # Every 15 minutes on weekends (light usage expected)
       - cron: '*/15 * * * 0,6'
     workflow_dispatch: # Allow manual trigger

   jobs:
     ping-health:
       runs-on: ubuntu-latest
       steps:
         - name: Ping health endpoint
           run: |
             curl -f https://{service-name}.onrender.com/health || exit 1
           env:
             # Optional: add timeout to fail fast
             CURL_TIMEOUT: '30'
   ```

3. **Replace `{service-name}`** with your actual Render service name (from Render dashboard URL)

4. **Commit and Push**:
   ```bash
   git add .github/workflows/keep-warm.yml
   git commit -m "ci: add workflow to keep Render instance warm"
   git push origin main
   ```

### How It Works

- GitHub Actions runs the workflow on a schedule
- Each run pings your `/health` endpoint
- Render sees the request and keeps the instance alive
- Workflow logs are visible in GitHub repo → **Actions** tab

### Monitoring

1. Go to your GitHub repo → **Actions** tab
2. Click **"Keep Render Instance Warm"** workflow
3. ✅ All runs should show **✓ Ping health endpoint**
4. If any run fails (e.g., Render is down), you'll see a ❌ badge

### Customize

**Change Ping Frequency**:

```yaml
# Every 5 minutes (most aggressive)
- cron: '*/5 * * * *'

# Every 15 minutes (balanced)
- cron: '*/15 * * * *'

# Every 30 minutes (light)
- cron: '*/30 * * * *'
```

**Cron Syntax** (UTC timezone):

- `*/10` = every 10 minutes
- `6-22` = 6 AM to 10 PM
- `1-5` = Monday to Friday (0=Sunday, 6=Saturday)

**Example**: Ping every 15 minutes, 24/7:

```yaml
on:
  schedule:
    - cron: '*/15 * * * *'
```

---

## Option 2: UptimeRobot (Recommended for Reliability)

UptimeRobot is a free monitoring service that pings your endpoint and sends alerts if it's down.

### Setup

1. **Sign Up**:
   - Go to [uptimerobot.com](https://uptimerobot.com)
   - Sign up with email or GitHub (free account)
   - Verify email

2. **Create a New Monitor**:
   - Click **"Add New Monitor"**
   - **Monitor Type**: `HTTP(s)`
   - **URL**: `https://{service-name}.onrender.com/health`
   - **Monitoring Interval**: `10 minutes` (keep instance warm)
   - **Friendly Name**: `FIFA 2026 Stadium App - Keep Warm`
   - ✅ Click **"Create Monitor"**

3. **Verify**:
   - Monitor should show **"Up"** (green)
   - Check Render logs in the next 10–15 minutes to confirm pings are received

### How It Works

- UptimeRobot pings `/health` every 10 minutes
- If instance is down, UptimeRobot sends alerts (email, Slack, etc.)
- Free tier includes up to 50 monitors

### Monitoring Alerts (Optional)

1. Go to UptimeRobot dashboard → Select your monitor
2. Click **"Alert Contacts"** → Add:
   - **Email**: Get notified if instance goes down
   - **Slack**: Post alerts to a Slack channel
   - **GitHub**: Create issues on downtime
   - **Discord**: Post to Discord webhook

**Example Email Alert Setup**:

1. Click **"Add Alert Contact"**
2. Select **"Email"** → Enter your email
3. Select your monitor → **"Edit"** → Under "Alert contacts", check your email
4. Save

### Cost & Limits

- ✅ **Free tier**: Up to 50 monitors, 5-minute checking interval
- Monthly uptime report included
- Logs stored for 7 days

---

## Option 3: Simple cURL in Cron (Self-Hosted)

If you have a personal server or NAS, you can run a simple cron job:

```bash
#!/bin/bash
# Add to your system crontab (crontab -e)

# Every 10 minutes, ping the app
*/10 * * * * curl -s https://{service-name}.onrender.com/health > /dev/null 2>&1 || echo "Health check failed" | mail -s "Render App Down" your-email@example.com
```

**Not Recommended** because:

- Requires a 24/7 running server
- Ties your infrastructure to your personal machine
- No redundancy if your server goes down

**Better**: Use GitHub Actions or UptimeRobot (cloud-native, reliable).

---

## Comparison Table

| Aspect             | GitHub Actions           | UptimeRobot           | Self-Hosted Cron        |
| ------------------ | ------------------------ | --------------------- | ----------------------- |
| **Cost**           | Free                     | Free                  | Free (+ infrastructure) |
| **Setup Time**     | 5 min                    | 3 min                 | 10 min                  |
| **Monitoring**     | GitHub Actions logs      | Dashboard + alerts    | Email only              |
| **Reliability**    | Very high (GitHub infra) | Very high             | Depends on server       |
| **Alerts**         | Via GitHub Actions       | Email, Slack, Discord | Email only              |
| **Ping Frequency** | Configurable             | 5–60 min (free tier)  | Configurable            |
| **Recommended**    | ✅ For developers        | ✅ For reliability    | ❌ Not recommended      |

---

## Estimated Instance Uptime

### With Cold-Start Mitigation (Ping Every 10 Minutes)

**Calculation**:

- Each ping: ~1–2 seconds of CPU time
- Ping frequency: Every 10 minutes = 144 pings/day
- Daily usage: ~3–5 minutes of actual instance runtime
- **Free tier limit**: 750 hours/month = ~25 hours/day
- **Remaining capacity**: 20+ hours/day for user traffic
- ✅ **Conclusion**: Plenty of free tier budget remaining

### Without Mitigation (On-Demand Only)

- Instance spins down after 15 min of inactivity
- Users experience cold starts (10–30s wait)
- Good for low-traffic apps
- Bad for consistent UX

---

## Verification

### After Setting Up GitHub Actions

1. Go to repo → **Actions** tab
2. Click **"Keep Render Instance Warm"** workflow
3. Click the **latest run**
4. ✅ Must show: `✓ Ping health endpoint`
5. Check Render logs to confirm incoming requests

### After Setting Up UptimeRobot

1. Go to UptimeRobot dashboard → Select monitor
2. ✅ Status should show **"Up"** (green)
3. Click **"Logs"** → Verify recent successful pings
4. Check Render logs for incoming `/health` requests

---

## Cost Impact

### GitHub Actions

- ✅ **Free**: Included in GitHub (free tier gets 2,000 minutes/month)
- Our workflow: ~1 run per 10 minutes = ~4,300 runs/month
- Per run: <1 second = ~4,300 seconds/month = ~72 minutes/month
- **Within free tier** ✅

### UptimeRobot

- ✅ **Free tier**: Up to 50 monitors, unlimited uptime checks
- No cost for keeping instance warm
- Optional paid features (extra storage, faster checking) not needed

### Render Free Tier

- ✅ **Stays within limits**: Ping traffic is minimal
- ~3–5 minutes/day of instance runtime from pings
- User traffic is the main consumer
- **No additional cost**

---

## Recommendation

**For the FIFA 2026 Stadium App, I recommend**:

1. **Use GitHub Actions** (already have repo access)
   - Simple, free, integrated
   - Ping every 10 minutes
   - Works out of the box

2. **Optionally add UptimeRobot** for extra peace of mind
   - Separate monitoring service
   - Alerts if instance goes down
   - Dashboard visibility

3. **Skip self-hosted cron** (over-engineered for this use case)

---

## Final Setup Summary

**GitHub Actions (5 min)**:

```bash
mkdir -p .github/workflows
cat > .github/workflows/keep-warm.yml << 'EOF'
name: Keep Render Instance Warm
on:
  schedule:
    - cron: '*/10 * * * *'
  workflow_dispatch:
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl -f https://{service-name}.onrender.com/health || exit 1
EOF
git add .github/workflows/keep-warm.yml
git commit -m "ci: keep Render warm"
git push origin main
```

**UptimeRobot (3 min)**:

1. Sign up at [uptimerobot.com](https://uptimerobot.com)
2. Add monitor: `https://{service-name}.onrender.com/health`
3. Set interval to 10 minutes
4. Done ✅

**Result**: Your app stays warm, users get fast responses, and you stay within free tier limits.

---

## Monitoring & Maintenance

### Weekly Check

```bash
# Verify health endpoint is responding
curl -i https://{service-name}.onrender.com/health

# Expected: HTTP 200 with { "status": "ok" }
```

### If Instance Goes Down

1. Check Render dashboard → Logs → Runtime
2. Review recent deployments
3. Check for errors in error logs
4. Redeploy if necessary: `git push origin main`
5. UptimeRobot will alert you automatically (if configured)

---

## Summary

✅ **Cold-start mitigation is optional but recommended for**:

- Improved user experience (no 30s wait on first request)
- Professional uptime monitoring
- Peace of mind (alerts if service goes down)

✅ **Recommended setup**: GitHub Actions + UptimeRobot

- Cost: $0
- Setup time: <10 minutes
- Reliability: 99.9%+
- Instance stays warm 24/7

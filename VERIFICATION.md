# FIFA 2026 Stadium App – Post-Deployment Verification Checklist (6 Pillars)

After your app is **Live** on Render, use this checklist to verify it scores **100%** on all 6 quality pillars.

**Prerequisites**:

- App is live at: `https://{service-name}.onrender.com` (replace with your actual URL)
- Local environment has Node 18+, latest code from `main` branch
- All tests pass locally: `npm run test:coverage`

---

## Pillar 1: Code Quality ✅

**Goal**: Ensure linting and type-checking pass on the deployed branch with zero errors.

### 1.1 Lint Check (ESLint)

**Local Action**:

```bash
git checkout main
npm install
npm run lint
```

**Expected Result**:

- ✅ Zero errors
- ✅ Zero warnings (max-warnings=0)
- ✅ All `.ts`, `.tsx`, `.js`, `.cjs`, `.mjs` files pass

**If Failed**:

- Review ESLint output
- Fix issues locally and push to GitHub
- Render auto-redeploys

### 1.2 Type Check (TypeScript)

**Local Action**:

```bash
npm run type-check
```

**Expected Result**:

- ✅ Zero TypeScript errors in `@arenaiq/client` and `@arenaiq/server`
- ✅ No "strict mode" violations

**Example Output**:

```
$ npm run type-check
> arenaiq@1.1.0 type-check
> npm run typecheck -w @arenaiq/client && npm run typecheck -w @arenaiq/server
(client builds successfully)
(server builds successfully)
```

### 1.3 Build Verification

**Local Action**:

```bash
npm run build
```

**Expected Result**:

- ✅ Client builds to `client/dist/` with chunks, hashes, and sourcemaps
- ✅ Server builds to `server/dist/` with all TypeScript compiled to JavaScript
- ✅ No warnings or errors

**Check Render Build** (after deployment):

1. Go to Render dashboard → Service → **Logs** → **Build**
2. ✅ Must see: `npm run build` completes successfully
3. ✅ No TypeScript compilation errors in logs

---

## Pillar 2: Security ✅

**Goal**: Verify HTTPS, secret hygiene, headers, and CORS lockdown.

### 2.1 HTTPS Enforcement

**Live Action** (on `https://{service-name}.onrender.com`):

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. ✅ No mixed-content warnings (all resources should be HTTPS)
4. ✅ Address bar shows padlock icon 🔒
5. ✅ Certificate is valid (click padlock → Connection → Certificate)

**Verify Redirect**:

```bash
curl -i http://{service-name}.onrender.com
# Should redirect to https:// (301/302)
```

### 2.2 Secret Hygiene (No Credentials in Client)

**Live Action** (DevTools → Network tab):

1. Open app at `https://{service-name}.onrender.com`
2. Go to DevTools → **Network** tab
3. Interact with the app (ask assistant, view operations, etc.)
4. Check each request:
   - ✅ **No `GEMINI_API_KEY` in request body/headers** (API key must be server-side only)
   - ✅ **No Firebase credentials in request** (Firestore must be server-only)
   - ✅ **No database URLs or connection strings**
5. Perform Ctrl+Shift+P → "Disable Cache" to ensure no cached secrets leak

**Verify API Response Sanitization**:

```bash
curl -X POST https://{service-name}.onrender.com/api/assistant \
  -H "Content-Type: application/json" \
  -d '{"question":"test"}'
```

**Expected Response** (sanitized):

```json
{
  "answer": "...",
  "language": "en",
  "cached": false
}
```

**NOT** (error details must be hidden):

```json
{
  "success": false,
  "error": {
    "code": "GEMINI_ERROR",
    "message": "actual API error details",
    "stack": "..."
  }
}
```

### 2.3 Security Headers (Helmet Middleware)

**Live Action** (DevTools → Network → Response Headers):

1. Open app and load any page
2. Go to DevTools → **Network** tab → Click any request (e.g., the main page)
3. Scroll to **Response Headers** section
4. ✅ Verify these headers are present:

| Header                      | Expected Value          | Purpose                      |
| --------------------------- | ----------------------- | ---------------------------- |
| `X-Frame-Options`           | `DENY` or `SAMEORIGIN`  | Prevent clickjacking         |
| `X-Content-Type-Options`    | `nosniff`               | Prevent MIME sniffing        |
| `X-XSS-Protection`          | `1; mode=block`         | Legacy XSS protection        |
| `Strict-Transport-Security` | `max-age=...` (present) | Force HTTPS                  |
| `Content-Security-Policy`   | `...` (present)         | Script/resource restrictions |
| `Permissions-Policy`        | `...` (present)         | Feature permissions          |

**Check via curl**:

```bash
curl -i https://{service-name}.onrender.com
# Look for headers in the response
```

### 2.4 CORS Policy

**Live Action** (API origin lockdown):

1. In DevTools → **Console** tab, try to call the API from an origin not in the whitelist:
   ```javascript
   fetch('https://{service-name}.onrender.com/api/health')
     .then((r) => r.json())
     .then(console.log);
   ```
2. ✅ Must succeed (same origin = allowed)

3. Simulate a cross-origin request (e.g., from `https://example.com`):
   ```javascript
   fetch('https://{service-name}.onrender.com/api/health', {
     method: 'GET',
     mode: 'cors',
   });
   ```
   - ✅ May fail with CORS error if the request is from a different origin (expected for security)
   - OR ✅ Succeeds if origin is whitelisted in `server/src/app.ts`

**Check CORS Configuration** (code review):

```bash
grep -A 10 "cors({" server/src/app.ts
# Should show: origin function that checks PRODUCTION_ORIGIN or LOCAL_ORIGINS
```

---

## Pillar 3: Efficiency ✅

**Goal**: Verify performance, asset compression, and caching.

### 3.1 Lighthouse Performance Score

**Live Action** (Google Lighthouse in DevTools):

1. Open app at `https://{service-name}.onrender.com`
2. Open DevTools (F12) → **Lighthouse** tab
3. Click **Analyze page load**
4. ✅ Wait for report to generate
5. ✅ **Performance score ≥ 95/100**
6. ✅ Check sub-metrics:
   - Largest Contentful Paint (LCP) < 2.5s
   - Cumulative Layout Shift (CLS) < 0.1
   - First Input Delay (FID) / Interaction to Next Paint (INP) < 100ms

**If Performance < 95**:

- Check **Diagnostics** section for bottlenecks
- Common issues: Large JavaScript bundles, unoptimized images, render-blocking CSS
- Verify Vite build is optimizing chunks correctly

### 3.2 Asset Compression & Caching

**Live Action** (DevTools → Network tab):

1. Open app and open DevTools → **Network** tab
2. Reload the page (Ctrl+R or Cmd+R)
3. Check each request:
   - ✅ JavaScript files (`*.js`) should show **Content-Encoding: gzip** or **brotli**
   - ✅ CSS files should be **compressed**
   - ✅ Images should be **optimized** (WebP preferred, or optimized PNG/JPG)
4. ✅ **Size column**: Compressed size should be << transferred size
   - Example: `main.abc123.js` transferred as 45 KB (from 150 KB uncompressed)

**Verify Cache Headers**:

```bash
# For hashed assets (should be cached long-term)
curl -i https://{service-name}.onrender.com/assets/main.abc123.js | grep -i cache-control
# Expected: Cache-Control: public, immutable, max-age=31536000 (1 year)

# For HTML (should NOT be cached)
curl -i https://{service-name}.onrender.com | grep -i cache-control
# Expected: Cache-Control: no-cache
```

### 3.3 Cache Hit Verification (Repeated Requests)

**Live Action** (repeated assistant questions):

1. Open app → Assistant feature
2. Ask a question: **"What is the capital of France?"**
3. Wait for response (should take 2–5 seconds)
4. Ask the **exact same question** again
5. ✅ **Second response must be faster** (should return almost instantly from cache)
6. Check response header for `cached: true`:
   ```bash
   curl -X POST https://{service-name}.onrender.com/api/assistant \
     -H "Content-Type: application/json" \
     -d '{"question":"What is the capital of France?"}' | jq .cached
   # Expected: true (on second and subsequent calls)
   ```

---

## Pillar 4: Testing ✅

**Goal**: Ensure E2E tests pass on live URL and unit tests maintain 100% coverage.

### 4.1 Unit & Integration Tests (Local)

**Local Action**:

```bash
npm run test:coverage
```

**Expected Result**:

- ✅ All tests pass: **103/103 passing**
- ✅ Server coverage: **≥ 99%** statements
- ✅ Client coverage: **≥ 98%** statements
- ✅ Zero skipped tests (`.skip` is not allowed in CI)

**Example Output**:

```
PASS [103 tests]
  ✓ server/tests/app.test.ts (19 tests)
  ✓ server/tests/features/assistant/... (XX tests)
  ✓ client/tests/features/... (XX tests)
  ✓ client/tests/components/... (XX tests)

Coverage:
- Statements: 99.6%
- Branches: 98.26%
- Functions: 100%
- Lines: 100%
```

### 4.2 E2E Tests on Live URL

**Setup**:

1. Set the base URL to your live Render service:

   ```bash
   export BASE_URL=https://{service-name}.onrender.com
   ```

2. Run Playwright E2E tests:

   ```bash
   npx playwright test --config=playwright.config.ts --project=chromium
   ```

3. ✅ All E2E tests must pass on the live URL:
   - Smoke tests (e2e/smoke.spec.ts)
   - Critical journey tests (user flow end-to-end)
   - Accessibility tests (axe core checks)

**Expected Result**:

```
✓ smoke tests
✓ critical user journeys
✓ accessibility checks
```

**If E2E Tests Fail on Live**:

- Cold start timeout: Retry after 30s
- API rate limit (429): Wait 1 minute, retry
- Firestore connectivity: Check Render logs for Firebase auth errors

### 4.3 Code Coverage Report

**Verification**:

```bash
# After running tests, open the coverage report
# (usually generated in coverage/ or build/coverage/)
open coverage/index.html  # macOS
# or
start coverage/index.html  # Windows
```

✅ **Must see**:

- **Statements**: ≥ 99%
- **Branches**: ≥ 98%
- **Functions**: 100%
- **Lines**: 100%
- **Zero uncovered lines in critical paths** (API handlers, middleware)

---

## Pillar 5: Accessibility ✅

**Goal**: Verify keyboard navigation, screen reader support, and WCAG 2.1 AA compliance.

### 5.1 Keyboard Navigation (Manual Tab-Through)

**Live Action** (on `https://{service-name}.onrender.com`):

1. Open the app in a browser
2. **Press Tab repeatedly** (do NOT use mouse)
3. ✅ **Focus indicator must be visible** on every interactive element:
   - Buttons should have a blue/highlighted border or outline
   - Links should be visibly focused
   - Form inputs should show a cursor or focus ring
   - No element should be "trapped" (you should be able to Tab out)
4. ✅ **Press Shift+Tab** to navigate backwards → should work smoothly
5. ✅ **Press Enter** on buttons/links → should activate them without mouse

**Critical Elements to Check**:

- SOS button → Tab to it → Press Enter → Should open modal
- Language selector → Tab to it → Press Enter/Arrow keys → Should change language
- Assistant input → Tab to it → Type a question → Press Enter → Should submit
- Operations heatmap buttons → Tab to them → Press Enter → Should interact

### 5.2 Screen Reader Testing

**Live Action** (using browser built-in screen reader):

**macOS (VoiceOver)**:

1. Press **Cmd+F5** to enable VoiceOver
2. Web app should read aloud:
   - Page title
   - Headings and landmarks
   - Button labels (e.g., "Ask Assistant button")
   - Form labels and input descriptions

**Windows (Narrator)**:

1. Press **Windows+Ctrl+Enter** to enable Narrator
2. Similar checks as above

✅ **Must pass**:

- All buttons have descriptive labels (not just icons)
- Form inputs have associated labels (not placeholder text alone)
- Images have alt text
- No unlabeled icon buttons

**Quick Check** (without screen reader):

```bash
# Check for missing alt text and labels
# Use axe DevTools (see 5.3)
```

### 5.3 axe DevTools Accessibility Scan

**Live Action** (browser extension):

1. Go to Chrome Web Store / Firefox Add-ons → Search **"axe DevTools"** → Install
2. Open app at `https://{service-name}.onrender.com`
3. Click the **axe DevTools** icon → **Scan THIS PAGE**
4. ✅ **Violations: 0** (must have zero violations)
5. ✅ Review results:
   - **Critical**: Must be fixed (e.g., missing alt text, inaccessible forms)
   - **Serious**: Should be fixed (e.g., contrast issues, unlabeled buttons)
   - **Moderate & Minor**: Nice to have

**Expected Result**:

```
0 Critical violations
0 Serious violations
0 Moderate violations
0 Minor violations
✓ Page passes all automated checks
```

### 5.4 Reduced Motion Testing

**Live Action** (test animation respect):

**macOS**:

1. System Preferences → Accessibility → Display → Enable **"Reduce motion"**
2. Reload the app
3. ✅ Animations should be **disabled** or **significantly reduced**
   - Transitions should be instant or very quick
   - No autoplaying animations

**Windows**:

1. Settings → Ease of Access → Display → Enable **"Show animations"** = OFF
2. Reload the app
3. ✅ Same verification as above

**Code Check**:

```bash
grep -r "prefers-reduced-motion" client/src
# Should have media query handling: @media (prefers-reduced-motion: reduce)
```

---

## Pillar 6: Problem Alignment ✅

**Goal**: Verify the app solves the FIFA 2026 stadium access problem with all required features functional.

### 6.1 Multi-Language Support

**Live Action** (test in 5+ languages):

1. Open app → Scroll to Language Selector (top-right or menu)
2. **Select each language** and test:

   - 🇬🇧 **English**: Ask "What is the capital of France?"
     - ✅ Response in English

   - 🇪🇸 **Spanish**: Ask "¿Cuál es la capital de Francia?"
     - ✅ Response in Spanish

   - 🇫🇷 **French**: Ask "Quelle est la capitale de la France?"
     - ✅ Response in French

   - 🇩🇪 **German**: Ask "Was ist die Hauptstadt von Frankreich?"
     - ✅ Response in German

   - 🇧🇷 **Portuguese**: Ask "Qual é a capital da França?"
     - ✅ Response in Portuguese

3. ✅ UI elements update language (buttons, labels, help text)

### 6.2 Operations Heatmap

**Live Action**:

1. Go to **Operations** section (main menu)
2. ✅ **Density Board visible** with stadium zones (Gates, Facilities, etc.)
3. ✅ **Heatmap colors change** based on incident density:
   - Green = Low traffic
   - Yellow = Medium traffic
   - Red = High traffic
   - Gray = No data
4. ✅ **Incident List** shows real-time crowding data
5. ✅ **Sustainability Meters** display (energy, water, waste metrics)
6. ✅ **Click on a zone** → Should show incident details

### 6.3 SOS Emergency Assistant Button

**Live Action** (test SOS feature):

1. Look for **SOS button** (usually red, labeled "Emergency" or "SOS")
2. ✅ **Click the SOS button** → Modal should open
3. ✅ Modal displays:
   - Emergency contact information
   - Quick medical/security resources
   - Language-aware content
   - Close button
4. ✅ **All emergency information is accurate** for FIFA 2026 stadiums

### 6.4 Sustainability Metrics Dashboard

**Live Action**:

1. Go to **Operations** → **Sustainability** section
2. ✅ **Verify these metrics are visible**:
   - ⚡ **Energy Usage** (kWh, target, status)
   - 💧 **Water Conservation** (liters/m³, target, status)
   - ♻️ **Waste Reduction** (% recycled, target, status)
3. ✅ **Metrics update in real-time** (simulated telemetry)
4. ✅ **Visual indicators** (progress bars, trend arrows)
5. ✅ **Goal alignment**: Each meter shows FIFA 2026 sustainability targets

### 6.5 Stadium-Specific Context

**Live Action** (check stadium awareness):

1. Ask the Assistant: **"What are the accessible entrances at this stadium?"**
   - ✅ Response should be stadium/context-aware
2. Ask: **"Show me parking options for disabled visitors"**
   - ✅ Response should reference stadium location, zones, facilities
3. Ask: **"What languages are supported for announcements?"**
   - ✅ Should mention official FIFA 2026 languages + local languages

---

## Verification Summary Table

| Pillar                | Metric                   | Target             | Status |
| --------------------- | ------------------------ | ------------------ | ------ |
| **Code Quality**      | ESLint errors            | 0                  | ☐      |
|                       | TypeScript errors        | 0                  | ☐      |
|                       | Build success            | ✅                 | ☐      |
| **Security**          | HTTPS enabled            | ✅                 | ☐      |
|                       | No secrets in client     | ✅                 | ☐      |
|                       | Security headers present | ✅                 | ☐      |
|                       | CORS locked              | ✅                 | ☐      |
| **Efficiency**        | Lighthouse score         | ≥95                | ☐      |
|                       | Assets compressed        | ✅                 | ☐      |
|                       | Cache hits working       | ✅                 | ☐      |
| **Testing**           | Unit tests pass          | 103/103            | ☐      |
|                       | Coverage                 | ≥99%               | ☐      |
|                       | E2E tests (live)         | All pass           | ☐      |
| **Accessibility**     | Keyboard navigation      | ✅                 | ☐      |
|                       | axe violations           | 0                  | ☐      |
|                       | Reduced motion           | ✅                 | ☐      |
| **Problem Alignment** | Multi-language           | 5+ langs           | ☐      |
|                       | Operations heatmap       | Functional         | ☐      |
|                       | SOS emergency            | Working            | ☐      |
|                       | Sustainability           | Visible & updating | ☐      |

---

## Final Verification Command

Once all 6 pillars pass, run this comprehensive verification:

```bash
# 1. Code quality
npm run lint && npm run type-check && npm run build

# 2. Tests (local)
npm run test:coverage

# 3. E2E tests (live)
export BASE_URL=https://{service-name}.onrender.com
npx playwright test --config=playwright.config.ts

# 4. Health check (live)
curl https://{service-name}.onrender.com/health

# 5. Manual verification
# Open browser, walk through pillars 5 & 6
```

✅ **All checks passing?** Your FIFA 2026 Stadium App is production-ready and deployed on Render Free Tier!

---

## Support & Rollback

**If Verification Fails**:

1. Check Render logs: `Render Dashboard → Logs → Runtime`
2. Review code changes: `git log --oneline -10`
3. Rollback if necessary: `git revert <commit-hash> && git push`
4. Render auto-redeploys with the reverted code

**For Questions**:

- See **DEPLOYMENT.md** for setup questions
- See **COLD_START_MITIGATION.md** for performance tuning
- Check **README.md** for architecture and design decisions

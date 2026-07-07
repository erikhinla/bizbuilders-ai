# Domain Cutover — bizbuilders.ai → bizbuilders-ai

Move `bizbuilders.ai` from the old `tbtx-web` Next.js project to the new ArVA build on Vercel project **`bizbuilders-ai`**.

## Before you start

1. Deploy production (includes env vars):

```bash
cd "/Users/test/Documents/Documents - E\$ COMPUTAAA/flow-as copy/launch/bizbuilders-ai"
bash scripts/deploy-production.sh
```

2. Confirm the Vercel production URL shows the bold grid homepage and diagnostic works:
   - `/` → "DIGITAL FOG IS WHEN WORK STARTS..."
   - `/diagnostic` → ArVA diagnostic theater
   - `/api/arva/health` → `{ "ok": true, ... }`

## Option A — CLI (fastest)

```bash
bash scripts/cutover-domains.sh
```

This removes `bizbuilders.ai` and `www.bizbuilders.ai` from `tbtx-web` and adds them to `bizbuilders-ai`.

## Option B — Vercel Dashboard (manual)

### Step 1: Remove from old project

1. Open [Vercel Dashboard](https://vercel.com/transformby10x)
2. Project **`tbtx-web`** → **Settings** → **Domains**
3. Remove:
   - `bizbuilders.ai`
   - `www.bizbuilders.ai`
4. Keep `tbtx-web.vercel.app` (default)

### Step 2: Add to new project

1. Project **`bizbuilders-ai`** → **Settings** → **Domains**
2. Add `bizbuilders.ai`
3. Add `www.bizbuilders.ai` (redirect to apex if prompted)
4. Wait for DNS **Valid Configuration** (usually instant if DNS unchanged)

### Step 3: Verify

```bash
curl -sI https://bizbuilders.ai | head -5
curl -s https://bizbuilders.ai/api/arva/health
```

Open in browser:
- https://bizbuilders.ai
- https://bizbuilders.ai/diagnostic

## TBTX and BizBot Marketing domains

`transformby10x.ai` and `bizbotmarketing.ai` currently live on `tbtx-web` with old doctrine pages.

| Domain | Interim target | Notes |
|--------|----------------|-------|
| `bizbuilders.ai` | **bizbuilders-ai** | This ArVA + bold merge build |
| `transformby10x.ai` | **tbtx-bold-ecosystem-build** | Separate TBTX brand folder |
| `bizbotmarketing.ai` | **tbtx-bold-ecosystem-build** | Separate BBM brand folder |

To move TBTX/BBM off `tbtx-web` without showing BBAI content, attach those domains to `tbtx-bold-ecosystem-build` (host-based rewrites already in that repo's `vercel.json`).

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Old "Infrastructure intelligence arm" page | Domain still on `tbtx-web` — repeat removal |
| 404 on `/diagnostic` | Deploy `bizbuilders-ai` project; check `vercel.json` rewrites |
| `/api/arva/health` fails | Set `ARVA_SESSION_SECRET` + ElevenLabs env vars; redeploy |
| SSL pending | Wait 5–15 min; confirm domain on correct project |

## Vercel MCP auth (for agents)

If Grok's Vercel MCP shows "Auth required", authenticate in Cursor/Grok MCP settings, then agents can list deployments and inspect logs directly.

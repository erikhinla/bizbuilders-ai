# BizBuilders AI

BizBuilders AI site with ArVA voice diagnostic bridge, bold Swiss industrial grid homepage, and Vercel serverless session API.

## Assets deployment

Binary media in `assets/` (videos, images, audio) are **not** included in this Git repository because they are too large for text-based pushes.

Deploy assets from your local project folder:

```bash
cd "/path/to/bizbuilders-ai"
vercel --prod
```

Or push from a machine that has the full `assets/` directory committed locally:

```bash
git add assets/
git commit -m "Add media assets"
git push origin bizbuildersai
```

Without assets, pages will load but videos/images will 404 until deployed from local.

## Quick start

See `README_DEPLOY.md` and `RUNTIME_READY.md` for Vercel setup, ArVA env vars, and diagnostic verification.

```bash
bash setup-arva-env.sh
vercel dev
bash scripts/verify-arva-runtime.sh http://localhost:3000
```

## Routes

- `/` — Bold grid homepage
- `/diagnostic` — ArVA Context Architecture diagnostic
- `/campaign` — Press release
- `/bizbot` — BizBot Mktng activation layer
- `/api/arva/session/*` — Session API
- `/api/arva/health` — Runtime health check

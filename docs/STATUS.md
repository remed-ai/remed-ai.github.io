# Status

Updated: 2026-11-04

Live: https://remed-ai.github.io/ · Showcase: https://remed-ai.github.io/?showcase=1 · Staff PIN 2580

## What works (locally verified)
- Full site: 3D hero (CSS fallback), live demo, story, steps, explode/beam/language scroll effects, features, safety/privacy/testing/team/roadmap/QR, 2-minute judge tour.
- Samples: Zentrova (front), Kelvora (back), prescription, lab report, blurry. All work offline.
- Live Gemini provider with Zod validation, model fallback, 10 s rate limit, "Live scan unavailable. Try a sample."
- Showcase mode: 5-tap / `?showcase=1` entry, TRY SCAN, camera, idle reset, staff PIN exit.
- 56 unit tests, 12 Playwright phone tests, 28 guard checks pass.

## Known bugs
- None open. Hindi and Punjabi wording not yet human-reviewed.

## Blockers
- First workflow runs sat in "queued" while GitHub Actions was degraded (githubstatus.com). Waiting on GitHub.
- `VITE_GEMINI_API_KEY` secret: owner adding it; until then live scans show the fallback message.

## Next 3 tasks
1. Confirm deploy + smoke test pass on `main`; rerun deploy after the key secret exists.
2. Run "Gemini live check (manual)" and record the model used here.
3. Human review of Hindi and Punjabi strings.

## Last working commit
Locally verified: see `git log -1` on main after the "docs: point to renamed repo" commit. Deploy not yet confirmed.

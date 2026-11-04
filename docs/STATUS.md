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
- Gemini key is set and reaches the build, but on 2026-11-04 every Flash model returned 503 "high demand" (Google-side, temporary). Live scans show the fallback until Google recovers; rerun "Gemini live check (manual)" to confirm.

## Next 3 tasks
1. Rerun "Gemini live check (manual)" once Google capacity recovers; record the model used here.
2. Optionally set Actions variable `VITE_GEMINI_MODEL` to a less busy model and redeploy.
3. Human review of Hindi and Punjabi strings.

## Last working commit
`9ccd541`: deploy + smoke test passed on main (https://remed-ai.github.io/). Later fallback fixes are pushed; check the latest "Test and deploy" run.

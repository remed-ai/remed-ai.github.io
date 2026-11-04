# Status

Updated: 2026-11-04

## What works (locally verified)
- Full site: 3D hero (CSS fallback), live demo, story, steps, explode/beam/language scroll effects, features, safety/privacy/testing/team/roadmap/QR, 2-minute judge tour.
- Samples: Zentrova (front), Kelvora (back), prescription, lab report, blurry → all offline.
- Live Gemini provider with Zod validation, model fallback, 10 s rate limit, "Live scan unavailable. Try a sample."
- Showcase mode: 5-tap / `?showcase=1` entry, TRY SCAN, camera, idle reset, staff PIN exit.
- 56 unit tests, 12 Playwright phone tests, 26 guard checks pass.

## Known bugs
- None open. Hindi/Punjabi wording not yet human-reviewed.

## Blockers
- Repo is `remed-ai/Remed-ai`, so Pages URL is https://remed-ai.github.io/Remed-ai/ (not the root). Root needs a repo rename to `remed-ai.github.io`; the workflow adapts automatically.
- Pages must be enabled with Source "GitHub Actions" (not verifiable via API from the session).

## Next 3 tasks
1. Confirm the first deploy + smoke test pass on `main`.
2. Run "Gemini live check (manual)" and record the model used.
3. Human review of Hindi and Punjabi strings.

## Last working commit
(pending first push)

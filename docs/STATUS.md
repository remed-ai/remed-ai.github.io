# Status

Updated: 2026-11-04

Live: https://remed-ai.github.io/ · Booth: /demo (PIN 2580) · Judges: /judge

## What works (locally verified)
- Paper-and-ink redesign based on the earlier RemedAI app: Home (quote + scan card + recent), Scan (viewfinder), results with read-aloud bar, History, My Medicines, Settings.
- Hidden /demo booth kiosk (TRY SCAN, idle reset, PIN exit) and /judge 2-minute tour. Samples via /scan?sample=<id>.
- Live Gemini with Zod validation, retries and model fallback.
- 62 unit tests, 16 Playwright phone tests, 28 guard checks pass.

## Known bugs
- None open. Hindi and Punjabi wording not yet human-reviewed.

## Blockers
- Gemini key is set and reaches the build, but on 2026-11-04 every Flash model returned 503 "high demand" (Google-side, temporary). Live scans show the fallback until Google recovers; rerun "Gemini live check (manual)" to confirm.

## Next 3 tasks
1. Rerun "Gemini live check (manual)" once Google capacity recovers; record the model used here.
2. Optionally set Actions variable `VITE_GEMINI_MODEL` to a less busy model and redeploy.
3. Human review of Hindi and Punjabi strings.

## Last working commit
`a6ea3f5`: Simple Mode and Settings About section removed; lint, typecheck, 62 unit tests and 16 phone e2e tests pass locally. Earlier deploy + smoke test passed at `9ccd541`; check the latest "Test and deploy" run.

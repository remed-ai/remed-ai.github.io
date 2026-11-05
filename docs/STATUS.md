# Status

Updated: 2026-11-05

Live: https://remed-ai.github.io/

## What works (locally verified)
- Paper-and-ink redesign based on the earlier RemedAI app: Home (quote + scan card + recent), Scan (viewfinder), results with read-aloud bar, History, My Medicines, Settings.
- Samples via /scan?sample=<id>. Booth mode (/demo) and judge tour (/judge) were removed; those links open Home.
- Live Gemini with Zod validation, retries and model fallback.
- 62 unit tests, 12 Playwright phone tests, 28 guard checks pass.

## Known bugs
- None open. Hindi and Punjabi wording not yet human-reviewed.

## Blockers
- Gemini key is set and reaches the build, but on 2026-11-04 every Flash model returned 503 "high demand" (Google-side, temporary). Live scans show the fallback until Google recovers; rerun "Gemini live check (manual)" to confirm.

## Next 3 tasks
1. Rerun "Gemini live check (manual)" once Google capacity recovers; record the model used here.
2. Optionally set Actions variable `VITE_GEMINI_MODEL` to a less busy model and redeploy.
3. Human review of Hindi and Punjabi strings.

## Last working commit
`2c78206`: Simple Mode, Settings About, booth mode and judge tour removed; lint, typecheck, 62 unit tests and 12 phone e2e tests pass locally. Earlier deploy + smoke test passed at `9ccd541`; check the latest "Test and deploy" run.

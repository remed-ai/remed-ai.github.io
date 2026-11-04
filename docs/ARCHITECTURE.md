# Architecture

Static Vite + React + TypeScript + Tailwind site (paper-and-ink design from the earlier RemedAI app) on GitHub Pages. No backend. Live scans call Google Gemini directly from the browser with a temporary demo key.

```
index.html → src/main.tsx (UiProvider prefs, PWA) → src/App.tsx (lib/router.tsx; 404.html = index.html on Pages)
  ui/AppShell.tsx  sticky header (brand, Simple Mode) + bottom nav (Home, History, My Medicines, Settings)
  /             pages/Home.tsx           time-of-day quote (i18n/quotes.ts), scan card, recently explained
  /scan         pages/ScanPage.tsx       demo/ScanDemo.tsx ScanPanel: privacy note → Camera → reading → ResultView
                                         ?sample=<id> opens a prepared sample result
  /history      pages/HistoryPage.tsx    on-device history (scan/history.ts), /history/:id detail
  /medicines    pages/MedicinesPage.tsx  saved medicines + expiry status (scan/medicines.ts)
  /settings     pages/SettingsPage.tsx   language, Simple Mode, high contrast, voice speed, text size, about
  /demo, /judge hidden staff pages: booth kiosk (showcase/Showcase.tsx) and 2-minute tour
```

## Scan pipeline
```
photo/camera ─ scan/image.ts (downscale ≤1280px JPEG)
            ─ scan/rateLimit.ts (1 live call / 10 s / device, localStorage)
            ─ ScanProvider (scan/provider.ts)
                 ├─ GeminiProvider (scan/gemini.ts + scan/prompt.ts) → JSON → Zod ScanResult
                 └─ samples (scan/samples.ts + scan/sampleArt.ts), offline, always works
            ─ scan/safety.ts gateResult() → stop card or result
            ─ ResultView: printed details (+boxes), lab flags (flagLab vs printed range),
              AI explanations, doctor questions, follow-up (scan/followup.ts), report (scan/reports.ts)
```
Any live failure → `LiveUnavailableError` → "Live scan unavailable. Try a sample."
If the configured model returns 404, `pickVisionModel()` chooses one from the Gemini model list.

## State
- `demo/useScanner.ts` — phase, image, result, corrections, sample interaction history.
- `ui/UiContext.tsx` — persisted prefs: language, Simple Mode, high contrast, voice speed, text scale. `ui/icons.tsx` — line icons.
- `scan/summary.ts` — plain summary built only from printed text. `lib/speech.ts` — read aloud + voice questions.
- `i18n/strings.ts` — UI strings; Hindi/Punjabi need human review.
- `config.ts` — staff PIN, emergency number, cooldown, idle timers, default model.

## Build & deploy
`.github/workflows/deploy.yml`: test job (lint, typecheck, unit, build, Playwright Pixel 7) → deploy job (BASE_PATH from repo name, key from secret, `actions/deploy-pages`) → smoke job (`scripts/smoke.mjs` fetches the live URL and its main script).
`.github/workflows/gemini-check.yml`: manual live Gemini check with a synthetic image (`checks/gemini-live.check.ts`).

## Assets
All art is SVG/CSS: sample items are generated into `public/booth/` by `scripts/make-booth.ts`. Fonts: Fraunces (display), Atkinson Hyperlegible (body), Noto Sans Devanagari/Gurmukhi, self-hosted via @fontsource.

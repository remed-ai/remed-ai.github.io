# Architecture

Static Vite + React + TypeScript site on GitHub Pages. No backend. Live scans call Google Gemini directly from the browser with a temporary demo key.

```
index.html → src/main.tsx (UiProvider, PWA service worker) → src/App.tsx
  ├─ Site (default)
  │   ├─ sections/Hero.tsx        3D strip (lazy three/HeroScene.tsx) or CSS fallback; zoomToDemo()
  │   ├─ #demo  demo/ScanDemo.tsx  samples · camera · upload → demo/ResultView.tsx
  │   ├─ sections/Story.tsx       problem story, Scan/Verify/Understand
  │   ├─ sections/ScrollFx.tsx    GSAP ScrollTrigger: explode layers, scan beam, language morph
  │   ├─ sections/Info.tsx        features, safety, privacy, testing, team, roadmap, QR
  │   └─ sections/JudgeTour.tsx   2-minute guided tour
  └─ showcase/Showcase.tsx (?showcase=1 or 5 taps top-left)  kiosk mode
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
- `ui/UiContext.tsx` — language (en/hi/pa) and large text.
- `i18n/strings.ts` — UI strings; Hindi/Punjabi need human review.
- `config.ts` — staff PIN, emergency number, cooldown, idle timers, default model.

## Build & deploy
`.github/workflows/deploy.yml`: test job (lint, typecheck, unit, build, Playwright Pixel 7) → deploy job (BASE_PATH from repo name, key from secret, `actions/deploy-pages`) → smoke job (`scripts/smoke.mjs` fetches the live URL and its main script).
`.github/workflows/gemini-check.yml`: manual live Gemini check with a synthetic image (`checks/gemini-live.check.ts`).

## Assets
All art is procedural: SVG sample items (generated into `public/booth/` by `scripts/make-booth.ts`), CanvasTexture + Three.js geometry for the hero, CSS for depth effects. Fonts: Anek Latin/Devanagari/Gurmukhi via @fontsource, bundled and self-hosted.

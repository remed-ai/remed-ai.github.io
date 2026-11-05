# Decisions

**Browser-side Gemini key (temporary).** The owner chose a free demo key used directly from the browser, accepting that visitors can read it. No backend. Mitigations: key only in the Actions secret and injected only in the deploy build; 10 s per-device rate limit; downscaled images; key to be deleted after the competition (BOOTH.md). Moving to a backend is Planned (LATER-SETUP.md).

**Base path from repo name.** The repo started as `remed-ai/Remed-ai` and was renamed to `remed-ai.github.io` so the site lives at the root. The deploy workflow still derives `BASE_PATH` from the repo name (`/` for `<owner>.github.io`, `/<repo>/` otherwise), so a future rename cannot break asset paths.

**Provider interface.** `ScanProvider` hides live Gemini vs prepared samples so the sample flow never depends on network, camera or quota.

**Zod-validated JSON.** Model output is untrusted. Anything that fails the schema is a failed live scan, never shown. Malformed location boxes are dropped instead of failing.

**Lab flags computed on device.** The model copies values and printed ranges; `flagLab()` compares them. The model never judges values.

**Safety checks run before the model.** Urgent words and dose questions are handled client-side so they work offline and cannot be talked around.

**Fictional samples drawn as SVG in code.** One source (`src/scan/sampleArt.ts`) feeds the app and the printable files, keeps the repo small, and guarantees no real brands. Source highlight boxes come from the same layout.

**Procedural visuals.** Three.js geometry + CanvasTexture for the hero strip, CSS for depth boxes and effects. 3D is lazy-loaded and skipped for reduced motion, weak devices (`?lite=1` forces it) and missing WebGL.

**Anek fonts.** One family across Latin, Devanagari and Gurmukhi keeps the three languages visually consistent; self-hosted via @fontsource. Indic fonts use the weight axis only to cut size.

**Playwright 1.63.0 pinned.** Matches the browser preinstalled in Claude Code cloud sessions; CI installs the same version.

**TypeScript 6.0.** typescript-eslint does not support TypeScript 7 yet.

**Main-only Git with hooks.** A Claude PreToolUse hook and a Git pre-push hook block branches, worktrees, tags and force pushes, as the owner requested.

**Gemini `x-goog-api-key` header.** Keeps the key out of URLs and request logs.

**Default model `gemini-flash-latest`.** An alias that tracks the current vision-capable Flash model; overridable with the `VITE_GEMINI_MODEL` Actions variable, with automatic fallback via the model list.

**Design taken from the earlier RemedAI app (owner request).** Paper-and-ink palette, turmeric marigold accent, rubber-stamp teal, brick for warnings; Fraunces + Atkinson Hyperlegible; dog-eared cards; highlighter stroke behind the result title; bottom navigation; high contrast. No emojis: line icons only. Samples are not offered on the normal scan screen; they appear only as a fallback when live scanning fails, via `/scan?sample=<id>`, and on the staff pages.

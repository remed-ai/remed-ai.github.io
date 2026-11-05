# Later setup

## Move the Gemini key to a backend
Goal: the key never reaches the browser.
1. Create a small serverless function (for example Cloudflare Workers or Google Cloud Run) with one route `POST /scan` and one `POST /followup`.
2. Store the key as a server secret there. Add per-IP rate limiting and a request size limit (images already arrive downscaled).
3. Move the body of `GeminiClient` (`src/scan/gemini.ts`) to the server unchanged; keep Zod validation on both sides.
4. Add a `BackendProvider` implementing `ScanProvider` (`src/scan/provider.ts`) that calls the function. Select it in `getLiveProvider()` (`src/scanner/useScanner.ts`).
5. Remove `VITE_GEMINI_API_KEY` from the deploy workflow and delete the GitHub secret. Delete the old key in Google AI Studio.
6. Update the privacy text in `src/sections/Info.tsx` and `docs/SAFETY.md`.

## Connect `remedai.in` (after .in KYC completes)
1. Finish the .in registrar KYC.
2. At the registrar's DNS settings add:
   - Apex `remedai.in`: four `A` records → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153 (GitHub Pages; check GitHub's docs for the current list).
   - `www`: `CNAME` → `remed-ai.github.io`.
3. In GitHub: repo Settings → Pages → Custom domain → `remedai.in` → Save. Tick "Enforce HTTPS" once the certificate is issued.
4. With a custom domain the site is served from `/`. Set `BASE_PATH=/` in the deploy workflow (or rename the repo to `remed-ai.github.io`, which does this automatically).
5. Verify the domain under the organisation's Settings → Pages to prevent takeover.
6. Update the smoke test URL if needed (it uses the Pages output URL automatically) and the QR code (it uses the current address automatically).

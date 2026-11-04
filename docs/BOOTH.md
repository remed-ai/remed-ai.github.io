# Booth guide

## 1. Print the sample items
1. Open `<site>/booth/print.html` (also linked in the site footer).
2. Print on A4, scale 100%, colour if possible. Cut along the dashed borders.
3. Glue the two strip sheets (Zentrova front, Kelvora back) onto card so they stay flat. Foil-like glossy paper looks real but glares: matte is easier to scan.
4. Lay out on the table: Zentrova strip, Kelvora strip, synthetic prescription, synthetic lab report. Keep the blurry sample for the in-app card only.
5. Everything is fictional and marked DEMO ONLY. Do not put real medicines or documents on the table.

## 2. Phone setup
1. Charge to 100 % and keep a cable plugged in. Turn on Do Not Disturb.
2. Open https://remed-ai.github.io/demo and tap **Start booth mode**.
3. Tap TRY SCAN once and allow camera access. Leave it; it resets itself after 30 s idle.
4. Screen Wake Lock keeps the screen on where supported. Also set Auto-Lock / Screen timeout to the longest value as a backup.
5. Turn brightness up, auto-rotate off (portrait).
6. Staff exit: hold the bottom-right corner for 5 seconds, enter PIN **2580** (`CONFIG.staffPin` in `src/config.ts`).

### iPhone (Safari)
- Full screen: Share → Add to Home Screen → open Remed-AI from the home screen, then go to `/demo` and tap Start booth mode.
- Lock to the app: Settings → Accessibility → Guided Access → On, set a passcode. Open Remed-AI, triple-click the side button → Start. Triple-click + passcode to end.

### Android (Chrome)
- Full screen: Chrome menu → Add to Home screen / Install app, open it from the home screen.
- Lock to the app: Settings → Security → App pinning (Screen pinning) → On. Open Remed-AI, open Recents, tap the app icon → Pin. Unpin: hold Back + Overview.

## 3. Lighting
- Soft, even light from above or the side. Avoid a spotlight straight above the table (glare on glossy print).
- A plain dark or white table cover helps the camera focus.
- If scans come back "I'm not sure", move the item closer, flatten it, and tilt it slightly away from the light.

## 4. Backup plan
- No Wi-Fi or Gemini down / out of quota: the site shows "Live scan unavailable. Try a sample." Sample buttons always work offline (the site is cached after the first visit).
- Phone fails: open the site on any phone and use the sample cards. The QR code is on the /demo staff page.
- Rate limit: one live scan every 10 seconds per device. Use the sample cards in between.
- Judges in a hurry: open https://remed-ai.github.io/judge → Start the tour.

## 5. The Gemini key (temporary demo key)
The key lives only in the GitHub Actions secret `VITE_GEMINI_API_KEY` and is baked into the deployed site. Visitors can read it; that was a deliberate choice.

### Replace the key (phone browser)
1. Open https://github.com/remed-ai/remed-ai.github.io/settings/secrets/actions (if the page is cramped, use the browser menu → "Desktop site").
2. Tap `VITE_GEMINI_API_KEY` → Update secret → paste the new key → Update secret.
3. Rerun deployment (below).

### Rerun deployment
1. Open https://github.com/remed-ai/remed-ai.github.io/actions/workflows/deploy.yml
2. Tap "Run workflow" → branch `main` → Run workflow. Wait for the green tick (about 5 minutes).
3. Optional: Actions → "Gemini live check (manual)" → Run workflow, to confirm the key works. It reports pass/fail without printing the key.

### Optional: choose the model
Settings → Secrets and variables → Actions → Variables tab → New variable `VITE_GEMINI_MODEL` (for example a current Gemini Flash model), then rerun deployment. If the model is unavailable, the site picks one from the Gemini model list.

### Delete the key after the competition
1. Delete the key in Google AI Studio (aistudio.google.com → API keys → delete). This is what actually stops it working.
2. Delete the GitHub secret: https://github.com/remed-ai/remed-ai.github.io/settings/secrets/actions → `VITE_GEMINI_API_KEY` → Remove.
3. Rerun deployment so the live site no longer contains it. The site keeps working with samples.

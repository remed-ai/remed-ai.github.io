# Operations

## The Gemini key
The key lives only in the GitHub Actions secret `VITE_GEMINI_API_KEY` and is baked into the deployed site. Anyone using the site can read it (see DECISIONS.md); moving it to a backend is in LATER-SETUP.md.

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

### Revoke the key
1. Delete the key in Google AI Studio (aistudio.google.com → API keys → delete). This is what actually stops it working.
2. Delete the GitHub secret: https://github.com/remed-ai/remed-ai.github.io/settings/secrets/actions → `VITE_GEMINI_API_KEY` → Remove.
3. Rerun deployment so the live site no longer contains it. The site keeps working with samples.

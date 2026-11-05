# Roadmap

Status key: **Live** (works on the site with Gemini), **Sample** (prepared/offline or simulated), **Planned** (not built), **Blocked** (waiting on something outside the code).

| Feature | Status | Notes |
|---|---|---|
| Medicine strip front scan | Live | Needs the Gemini key; falls back to samples |
| Back of strip scan | Live | |
| Prescription scan (handwriting) | Live | Medium confidence + pharmacist reminder |
| Lab report scan, flags vs printed range | Live | Flags computed on device from the printed range |
| Photo upload | Live | |
| Camera scan | Live | Falls back to photo capture |
| Tap detail → source highlight | Live | When the model returns locations; always on samples |
| Manual correction | Live | |
| Questions to ask a doctor | Live | |
| Follow-up questions about the scanned item | Live | Samples answer offline from printed text |
| Urgent-help guidance (112) | Live | Configurable in `src/config.ts` |
| Report a wrong result (on device) | Live | No image saved |
| English / Hindi / Punjabi switching | Live | **Hindi and Punjabi text needs human review** |
| Read aloud | Live | Depends on device voices; says when missing |
| Large text | Live | |
| Sample items and results | Sample | Fictional, marked SAMPLE ONLY |
| Blurry "I'm not sure" sample | Sample | |
| Interaction warning | Sample | Only between the two fictional medicines |
| Welcome screen | Live | First visit; reopen from Settings |
| Plain summary of each scan | Live | Built only from printed text |
| Scan history (on device) | Live | Up to 30, clearable |
| My Medicines (saved printed details + expiry status) | Live | On device; no reminders yet |
| High contrast, voice speed, text size | Live | Settings page |
| Voice questions (speech input) | Live | Where the browser supports it |
| Works offline after first visit (PWA) | Live | |
| Root URL https://remed-ai.github.io/ | Live | Repo renamed to `remed-ai.github.io` |
| Backend key storage | Planned | See LATER-SETUP.md |
| Real drug database | Planned | |
| Duplicate ingredient alerts | Planned | |
| Recall alerts | Planned | |
| Same-salt alternatives | Planned | |
| Price comparison | Planned | |
| Family profiles | Planned | |
| Dose reminders | Planned | Based on the user's own prescription only |
| Refill alerts | Planned | |
| Caregiver alerts | Planned | |
| Record vault | Planned | |
| Emergency card | Planned | |
| WhatsApp scanning | Planned | |
| Pharmacist review | Planned | |
| Suspicious packaging warnings | Planned | |
| Clinic dashboard | Planned | |
| `remedai.in` domain | Blocked | Waiting on .in KYC (LATER-SETUP.md) |
| Accuracy measurement on real packaging | Planned | Testing in progress; no numbers published |

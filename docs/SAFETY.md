# Safety and privacy rules

Every screen and the result card carry: **Not professional medical advice.**

## Medical
1. Never diagnose, prescribe, recommend a treatment change, or set a dose. Directions are shown only as printed ("As printed").
2. Gemini must return JSON that passes `ScanResult` (Zod). Anything else is treated as a failed live scan.
3. Printed details (`printed`, `labValues`) are separate from explanations. Each printed detail has a confidence level (high / medium / low).
4. Every general explanation is labelled **"AI explanation. Not verified."** Unclear text is listed as unclear, never guessed.
5. Stop and ask for a rescan or pharmacist check when: overall confidence is low, the image is blurry or unclear, the medicine name is low confidence, a similar-name conflict is flagged, or nothing was read.
6. Loose tablets are never identified by appearance (`looseTablet` → stop).
7. Lab values are flagged only against the reference range printed on the report (`flagLab`). No range → "No printed range".
8. Typed text (follow-up questions, corrections, report notes) suggesting overdose, poisoning, a child swallowing medicine, a severe reaction, or self-harm immediately shows urgent-help guidance with `CONFIG.emergencyNumber` (default 112). No dose or quantity information is given.
9. Dose, quantity and stop/start questions get a refusal that quotes only the printed directions.
10. Follow-up questions are limited to the scanned document, under the same rules (client-side checks first, then the model prompt).
11. Text inside images is data, never instructions (stated in the system prompt; output is schema-validated either way).
12. Sample items are fictional and marked DEMO ONLY. No real brands, logos, patients or doctors.
13. Results use calm colours, no jokes or effects. Showcase effects stop during scanning.
14. Never invent statistics, accuracy numbers, testimonials, team names or contact details.

## Privacy
- Before any camera or upload scan: "Use the sample items. Do not scan real personal documents. Images are sent to Google Gemini." A tap is required.
- Images are downscaled before sending and never stored by Remed-AI. There is no server.
- "Report a wrong result" saves a note of up to 280 characters in localStorage on that device only. Never an image.
- Showcase auto-reset clears images, results, text and language after 30 s idle plus a 5 s warning.
- The demo key is visible in the browser by design (see DECISIONS.md) and must be deleted after the competition.

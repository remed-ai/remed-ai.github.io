import { defineConfig } from 'vitest/config';

// Manual live check only. Run by .github/workflows/gemini-check.yml.
export default defineConfig({
  test: { environment: 'node', include: ['checks/**/*.check.ts'], testTimeout: 90_000 },
});

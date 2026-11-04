// Fails unless the live site loads: HTML 200 with the app shell, and its main script 200.
const url = process.argv[2];
if (!url) throw new Error('usage: node scripts/smoke.mjs <url>');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = '';
for (let i = 1; i <= 20; i++) {
  try {
    const res = await fetch(url, { cache: 'no-store', headers: { 'User-Agent': 'remed-ai-smoke-test' } });
    const html = await res.text();
    const script = html.match(/<script[^>]+type="module"[^>]+src="([^"]+)"/)?.[1];
    if (res.ok && html.includes('<div id="root">') && html.includes('Remed-AI') && script) {
      const js = await fetch(new URL(script, url), { cache: 'no-store' });
      if (js.ok && (await js.text()).length > 1000) {
        console.log(`Smoke test passed: ${url} (attempt ${i})`);
        process.exit(0);
      }
      last = `script ${script} -> ${js.status}`;
    } else last = `html -> ${res.status}`;
  } catch (e) {
    last = String(e);
  }
  console.log(`attempt ${i}: ${last}; retrying`);
  await sleep(15_000);
}
console.error(`Smoke test FAILED for ${url}: ${last}`);
process.exit(1);

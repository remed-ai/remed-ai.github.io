// Generates printable sample items and app icons. Run: node scripts/make-booth.ts
import { writeFileSync, mkdirSync } from 'node:fs';
import { ALL_ART } from '../src/scan/sampleArt.ts';

const out = new URL('../public/booth/', import.meta.url);
mkdirSync(out, { recursive: true });
const files: string[] = [];
for (const a of ALL_ART()) {
  const name = `${a.id}.svg`;
  writeFileSync(new URL(name, out), a.svg);
  files.push(name);
}
const cards = files
  .map((f) => `<figure><img src="${f}" alt="${f}"><figcaption>${f.replace('.svg', '')} · DEMO ONLY · fictional</figcaption></figure>`)
  .join('\n');
writeFileSync(
  new URL('print.html', out),
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Remed-AI booth sample items</title>
<style>
body{font-family:system-ui,sans-serif;margin:16px;color:#111;background:#fff}
h1{font-size:22px;margin:0 0 4px}p{margin:4px 0 12px;max-width:60ch}
figure{margin:0 0 18px;break-inside:avoid;page-break-inside:avoid}img{width:100%;max-width:180mm;border:1px dashed #999}
figcaption{font-size:12px;color:#555}
@media print{.noprint{display:none}figure{margin-bottom:10mm}}
</style></head><body>
<h1>Remed-AI sample items (DEMO ONLY)</h1>
<p class="noprint">Print on A4 at 100% scale. Cut along the dashed lines. Fold strip sheets over card for stiffness. Everything here is fictional: no real medicines, brands, patients or doctors.</p>
${cards}
</body></html>`,
);
console.log('booth files:', files.join(', '));

// App icons (PNG) from public/icon.svg using the preinstalled Playwright Chromium.
if (process.argv.includes('--icons')) {
  const { chromium } = await import('@playwright/test');
  const { readFileSync } = await import('node:fs');
  const svg = readFileSync(new URL('../public/icon.svg', import.meta.url), 'utf8');
  const browser = await chromium.launch();
  for (const [size, name] of [[192, 'icon-192.png'], [512, 'icon-512.png'], [180, 'apple-touch-icon.png']] as const) {
    const page = await browser.newPage({ viewport: { width: size, height: size } });
    await page.setContent(`<style>html,body{margin:0;background:#fff8ef}</style>${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}`);
    await page.screenshot({ path: new URL(`../public/${name}`, import.meta.url).pathname });
    await page.close();
  }
  await browser.close();
  console.log('icons written');
}

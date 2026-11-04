/**
 * Fictional, printable sample items. Everything here is made up and marked DEMO ONLY.
 * No real brands, logos, patients, or doctors. Used in-app and by scripts/make-booth.ts.
 */
export type ArtBox = [number, number, number, number];
export interface Art {
  id: string;
  title: string;
  width: number;
  height: number;
  svg: string;
  boxes: Record<string, ArtBox>;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function canvas(w: number, h: number) {
  const parts: string[] = [];
  const boxes: Record<string, ArtBox> = {};
  const text = (
    x: number, y: number, size: number, s: string,
    o: { id?: string; weight?: number; fill?: string; family?: string; anchor?: 'start' | 'middle' | 'end'; rotate?: number; italic?: boolean; spacing?: number } = {},
  ) => {
    const family = o.family ?? "'Helvetica Neue', Arial, sans-serif";
    const tr = o.rotate ? ` transform="rotate(${o.rotate} ${x} ${y})"` : '';
    parts.push(
      `<text x="${x}" y="${y}" font-size="${size}" font-family="${family}" font-weight="${o.weight ?? 400}" fill="${o.fill ?? '#111'}"` +
        `${o.anchor ? ` text-anchor="${o.anchor}"` : ''}${o.italic ? ' font-style="italic"' : ''}${o.spacing ? ` letter-spacing="${o.spacing}"` : ''}${tr}>${esc(s)}</text>`,
    );
    if (o.id) {
      const wEst = s.length * size * (o.weight && o.weight >= 700 ? 0.62 : 0.54) + (o.spacing ?? 0) * s.length;
      const left = o.anchor === 'middle' ? x - wEst / 2 : o.anchor === 'end' ? x - wEst : x;
      const pad = size * 0.25;
      boxes[o.id] = [
        +((left - pad) / w).toFixed(4), +((y - size * 0.95) / h).toFixed(4),
        +((wEst + pad * 2) / w).toFixed(4), +((size * 1.3) / h).toFixed(4),
      ];
    }
  };
  const raw = (s: string) => parts.push(s);
  const build = (filter = '') =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${filter}${parts.join('')}</svg>`;
  return { text, raw, build, boxes };
}

const demoStamp = (c: ReturnType<typeof canvas>, x: number, y: number, rot = -12) => {
  c.raw(`<g transform="rotate(${rot} ${x} ${y})"><rect x="${x - 150}" y="${y - 34}" width="300" height="56" rx="8" fill="none" stroke="#d6283a" stroke-width="5"/></g>`);
  c.text(x, y + 6, 30, 'DEMO ONLY', { weight: 800, fill: '#d6283a', anchor: 'middle', rotate: rot, spacing: 4 });
};

function blisters(c: ReturnType<typeof canvas>, x0: number, y0: number, cols: number, rows: number, gap: number, r: number) {
  for (let i = 0; i < cols; i++)
    for (let j = 0; j < rows; j++) {
      const cx = x0 + i * gap;
      const cy = y0 + j * gap;
      c.raw(
        `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 0.62}" fill="url(#bub)" stroke="#9aa3a8" stroke-width="2"/>` +
          `<ellipse cx="${cx - r * 0.3}" cy="${cy - r * 0.22}" rx="${r * 0.32}" ry="${r * 0.14}" fill="#fff" opacity=".8"/>`,
      );
    }
}

const foilDefs = `<defs>
<linearGradient id="foil" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6f7"/><stop offset=".45" stop-color="#d9dee1"/><stop offset=".55" stop-color="#eef1f2"/><stop offset="1" stop-color="#c9cfd3"/></linearGradient>
<radialGradient id="bub" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#ffffff"/><stop offset=".7" stop-color="#e3e8ea"/><stop offset="1" stop-color="#b8c0c4"/></radialGradient>
</defs>`;

/** Front of a fictional tablet strip. */
export function zentrovaFront(blur = 0): Art {
  const W = 900, H = 520;
  const c = canvas(W, H);
  c.raw(foilDefs);
  c.raw(`<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="26" fill="url(#foil)" stroke="#a7afb4" stroke-width="3"/>`);
  c.raw(`<rect x="10" y="10" width="${W - 20}" height="70" rx="26" fill="#0f7b6c"/><rect x="10" y="50" width="${W - 20}" height="30" fill="#0f7b6c"/>`);
  c.text(40, 58, 26, 'FICTIONAL SAMPLE · NOT A REAL MEDICINE', { weight: 700, fill: '#fff', spacing: 2 });
  c.text(40, 160, 64, 'ZENTROVA 500', { id: 'name', weight: 800, fill: '#0b3d36' });
  c.text(40, 205, 28, 'Zentrofen Tablets 500 mg', { id: 'ingredient', weight: 600 });
  c.text(40, 245, 24, 'Each tablet contains: Zentrofen 500 mg', { id: 'strength' });
  c.text(40, 300, 22, 'Dosage: As directed by the physician.', { id: 'directions' });
  c.text(40, 345, 21, 'Do not exceed the stated dose.', { id: 'warnings', weight: 700, fill: '#8a1020' });
  c.text(40, 375, 21, 'Keep out of reach of children.', { id: 'warnings2', weight: 700, fill: '#8a1020' });
  c.text(40, 440, 22, 'B.No. DM24117', { id: 'batch' });
  c.text(260, 440, 22, 'EXP 08/2028', { id: 'expiry', weight: 700 });
  c.text(40, 478, 18, 'Mfd. by: Demo Pharma Works (fictional)', { id: 'manufacturer', fill: '#444' });
  blisters(c, 600, 165, 3, 3, 105, 40);
  demoStamp(c, 700, 470, -6);
  const filter = blur ? `<defs><filter id="b"><feGaussianBlur stdDeviation="${blur}"/></filter></defs><g filter="url(#b)">` : '';
  const svg = c.build(filter).replace(/<\/svg>$/, blur ? '</g></svg>' : '</svg>');
  return { id: blur ? 'blurry' : 'zentrova', title: blur ? 'Blurry strip (sample)' : 'Zentrova 500 strip (front)', width: W, height: H, svg, boxes: c.boxes };
}

/** Back (foil side) of a second fictional strip. */
export function kelvoraBack(): Art {
  const W = 900, H = 520;
  const c = canvas(W, H);
  c.raw(foilDefs);
  c.raw(`<rect x="10" y="10" width="${W - 20}" height="${H - 20}" rx="26" fill="url(#foil)" stroke="#a7afb4" stroke-width="3"/>`);
  for (let i = 0; i < 4; i++) c.raw(`<line x1="${10 + (i + 1) * 176}" y1="14" x2="${10 + (i + 1) * 176}" y2="${H - 14}" stroke="#b5bcc0" stroke-dasharray="6 6" stroke-width="2"/>`);
  for (let i = 0; i < 5; i++) c.text(98 + i * 176, 70, 20, 'KELVORA 10', { weight: 700, fill: '#5b2a86', anchor: 'middle' });
  c.text(450, 150, 58, 'KELVORA 10', { id: 'name', weight: 800, fill: '#5b2a86', anchor: 'middle' });
  c.text(450, 195, 26, 'Kelvoxin Tablets 10 mg', { id: 'ingredient', weight: 600, anchor: 'middle' });
  c.text(450, 232, 22, 'Each film-coated tablet contains Kelvoxin 10 mg', { id: 'strength', anchor: 'middle' });
  c.text(450, 280, 22, 'Dosage: As directed by the physician.', { id: 'directions', anchor: 'middle' });
  c.text(450, 316, 20, 'Store below 25°C. Protect from light and moisture.', { id: 'storage', anchor: 'middle', fill: '#333' });
  c.text(450, 356, 20, 'WARNING: To be sold on prescription only.', { id: 'warnings', anchor: 'middle', weight: 700, fill: '#8a1020' });
  c.text(220, 420, 22, 'B.No. KV0932', { id: 'batch', anchor: 'middle' });
  c.text(450, 420, 22, 'MFG 11/2025', { anchor: 'middle' });
  c.text(680, 420, 22, 'EXP 10/2027', { id: 'expiry', anchor: 'middle', weight: 700 });
  c.text(450, 470, 18, 'Mfd. by: Demo Pharma Works (fictional) · NOT A REAL MEDICINE', { id: 'manufacturer', anchor: 'middle', fill: '#444' });
  demoStamp(c, 760, 120, 8);
  return { id: 'kelvora', title: 'Kelvora 10 strip (back)', width: W, height: H, svg: c.build(), boxes: c.boxes };
}

/** Synthetic handwritten-style prescription. */
export function prescription(): Art {
  const W = 760, H = 980;
  const c = canvas(W, H);
  const hand = "'Segoe Print', 'Bradley Hand', 'Comic Sans MS', cursive";
  c.raw(`<rect width="${W}" height="${H}" fill="#fffdf6"/><rect x="0" y="0" width="${W}" height="120" fill="#e9f6f2"/>`);
  c.text(40, 58, 34, 'DEMO CLINIC', { weight: 800, fill: '#0b3d36', spacing: 3 });
  c.text(40, 92, 18, 'Synthetic prescription for the Remed-AI demo · NOT VALID', { fill: '#355' });
  c.text(40, 170, 20, 'Doctor: Demo Doctor (fictional)', { id: 'prescriber', fill: '#333' });
  c.text(40, 205, 20, 'Patient: Demo Patient (fictional)', { id: 'patient', fill: '#333' });
  c.text(520, 170, 20, 'Date: 01/11/2026', { id: 'date', fill: '#333' });
  c.raw(`<line x1="40" y1="230" x2="${W - 40}" y2="230" stroke="#9cc" stroke-width="2"/>`);
  c.text(40, 300, 64, '℞', { fill: '#0b3d36', family: 'serif' });
  c.text(120, 300, 38, 'Tab. Zentrova 500', { id: 'med1', family: hand, rotate: -3, fill: '#1a2a6c' });
  c.text(150, 360, 32, '1 – 0 – 1  after food  × 5 days', { id: 'dir1', family: hand, rotate: -2, fill: '#1a2a6c' });
  c.text(120, 470, 38, 'Tab. Kelvora 10', { id: 'med2', family: hand, rotate: 2, fill: '#1a2a6c' });
  c.text(150, 530, 32, '0 – 0 – 1  at night  × 10 days', { id: 'dir2', family: hand, rotate: 1, fill: '#1a2a6c' });
  c.text(120, 650, 30, 'Review after 1 week', { id: 'note', family: hand, rotate: -1, fill: '#1a2a6c' });
  c.raw(`<path d="M480 780 q30 -40 60 0 t60 0 t40 -10" fill="none" stroke="#1a2a6c" stroke-width="3"/>`);
  c.text(470, 830, 18, 'Signature (fictional)', { fill: '#555' });
  demoStamp(c, 380, 920, -4);
  return { id: 'prescription', title: 'Synthetic prescription', width: W, height: H, svg: c.build(), boxes: c.boxes };
}

export const LAB_ROWS = [
  ['Haemoglobin', '11.2', 'g/dL', '12.0 - 15.5'],
  ['Fasting blood glucose', '98', 'mg/dL', '70 - 100'],
  ['Vitamin D (25-OH)', '18', 'ng/mL', '30 - 100'],
  ['TSH', '2.1', 'µIU/mL', '0.4 - 4.0'],
  ['Total cholesterol', '212', 'mg/dL', '< 200'],
] as const;

/** Synthetic lab report with printed reference ranges. */
export function labReport(): Art {
  const W = 820, H = 900;
  const c = canvas(W, H);
  c.raw(`<rect width="${W}" height="${H}" fill="#fff"/><rect width="${W}" height="110" fill="#eef3fb"/>`);
  c.text(40, 60, 32, 'DEMO DIAGNOSTICS', { weight: 800, fill: '#1d3a6e', spacing: 2 });
  c.text(40, 92, 17, 'Synthetic lab report for the Remed-AI demo · fictional patient', { fill: '#456' });
  c.text(40, 160, 19, 'Patient: Demo Patient (fictional)   Age/Sex: 34 / F', { id: 'patient', fill: '#333' });
  c.text(40, 192, 19, 'Sample collected: 28/10/2026', { id: 'date', fill: '#333' });
  const cols = [40, 360, 480, 600];
  const hy = 250;
  c.raw(`<rect x="30" y="${hy - 30}" width="${W - 60}" height="44" fill="#1d3a6e"/>`);
  ['Test', 'Result', 'Unit', 'Reference range'].forEach((h, i) => c.text(cols[i], hy, 19, h, { weight: 700, fill: '#fff' }));
  const rows = LAB_ROWS;
  rows.forEach((r, k) => {
    const y = hy + 60 + k * 60;
    if (k % 2) c.raw(`<rect x="30" y="${y - 36}" width="${W - 60}" height="56" fill="#f5f7fb"/>`);
    c.text(cols[0], y, 20, r[0], { id: `lab${k}`, weight: 600 });
    c.text(cols[1], y, 20, r[1], { id: `lab${k}v` });
    c.text(cols[2], y, 18, r[2], { fill: '#444' });
    c.text(cols[3], y, 18, r[3], { id: `lab${k}r`, fill: '#444' });
  });
  c.text(40, 680, 16, 'Reference ranges are printed by the lab and may differ between labs.', { fill: '#555' });
  c.text(40, 708, 16, 'Interpret results with your doctor.', { fill: '#555' });
  demoStamp(c, 600, 800, -5);
  return { id: 'lab', title: 'Synthetic lab report', width: W, height: H, svg: c.build(), boxes: c.boxes };
}


export const ALL_ART = (): Art[] => [zentrovaFront(), kelvoraBack(), prescription(), labReport(), zentrovaFront(7)];

export const svgDataUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

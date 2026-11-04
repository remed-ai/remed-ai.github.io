import { FollowUpAnswer, ScanResult } from './schema';
import { FOLLOWUP_SYSTEM, SCAN_SYSTEM, SCAN_USER } from './prompt';
import { LiveUnavailableError, type PreparedImage, type ScanProvider } from './provider';

const API = 'https://generativelanguage.googleapis.com/v1beta';
type Fetch = typeof fetch;

/** Choose a vision-capable Gemini model from the model list. */
export function pickVisionModel(names: string[], exclude: string[] = []): string | null {
  const clean = names.map((n) => n.replace(/^models\//, '')).filter((n) => !exclude.includes(n));
  const bad = /(tts|image|audio|live|embed|aqa|thinking|vision-preview|learnlm|gemma|nano|robotics|computer)/i;
  const ok = clean.filter((n) => n.startsWith('gemini') && !bad.test(n));
  const ver = (n: string) => Number(n.match(/gemini-(\d+(?:\.\d+)?)/)?.[1] ?? 0);
  const score = (n: string) => ver(n) * 10 + (/-flash$/.test(n) ? 3 : /flash(?!-lite)/.test(n) ? 2 : /flash-lite/.test(n) ? 1 : 0) - (/preview|exp/.test(n) ? 0.5 : 0);
  const flash = ok.filter((n) => n.includes('flash')).sort((a, b) => score(b) - score(a));
  if (flash.length) return flash[0];
  return ok.sort((a, b) => ver(b) - ver(a))[0] ?? null;
}

export async function listModels(key: string, f: Fetch = fetch): Promise<string[]> {
  const res = await f(`${API}/models?pageSize=200`, { headers: { 'x-goog-api-key': key } });
  if (!res.ok) throw new LiveUnavailableError(res.status === 429 ? 'quota' : 'model', `list ${res.status}`);
  const j = (await res.json()) as { models?: { name: string; supportedGenerationMethods?: string[] }[] };
  return (j.models ?? []).filter((m) => m.supportedGenerationMethods?.includes('generateContent')).map((m) => m.name);
}

/** Pull the JSON object out of a Gemini reply (tolerates code fences). */
export function extractJson(text: string): unknown {
  const t = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start < 0 || end < start) throw new LiveUnavailableError('bad_response', 'no json');
  return JSON.parse(t.slice(start, end + 1));
}

export interface GeminiOpts { key: string; model: string; fetchImpl?: Fetch; timeoutMs?: number; retryDelayMs?: number }

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class GeminiClient {
  private model: string;
  private resolved = false;
  constructor(private o: GeminiOpts) { this.model = o.model; }
  get modelName() { return this.model; }

  private async call(body: unknown, signal?: AbortSignal): Promise<string> {
    const f = this.o.fetchImpl ?? fetch;
    const tried = [this.model];
    let models: string[] | null = null;
    const MAX = 5;
    for (let attempt = 0; attempt < MAX; attempt++) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), this.o.timeoutMs ?? 20_000);
      signal?.addEventListener('abort', () => ctrl.abort(), { once: true });
      let res: Response;
      try {
        res = await f(`${API}/models/${encodeURIComponent(this.model)}:generateContent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': this.o.key },
          body: JSON.stringify(body),
          signal: ctrl.signal,
        });
      } catch (e) {
        if (signal?.aborted || attempt >= MAX - 1) throw new LiveUnavailableError('network', (e as Error).name);
        // Timed out (model hanging under load): move to the next vision model.
        clearTimeout(timer);
        models ??= await listModels(this.o.key, f);
        const next = pickVisionModel(models, tried);
        if (!next) throw new LiveUnavailableError('network', 'timeout');
        this.model = next;
        tried.push(next);
        continue;
      } finally {
        clearTimeout(timer);
      }
      if (res.status === 404 && !this.resolved && attempt === 0) {
        // Configured model is unavailable: choose one from the model list.
        const picked = pickVisionModel(await listModels(this.o.key, f));
        this.resolved = true;
        if (!picked) throw new LiveUnavailableError('model', 'no vision model');
        this.model = picked;
        continue;
      }
      if (res.status >= 500 && attempt < MAX - 1) {
        // Overloaded or unavailable: retry once, then try other vision models, newest first.
        if (attempt === 0) {
          await wait(this.o.retryDelayMs ?? 1200);
          continue;
        }
        models ??= await listModels(this.o.key, f);
        const picked = pickVisionModel(models, tried);
        if (picked) {
          this.model = picked;
          tried.push(picked);
          continue;
        }
      }
      if (res.status === 429) throw new LiveUnavailableError('quota');
      if (!res.ok) {
        // Google's error text helps diagnose; it never contains the key, but strip it defensively.
        const msg = await res.text().then((x) => x.replace(this.o.key, '***').replace(/\s+/g, ' ').slice(0, 300)).catch(() => '');
        throw new LiveUnavailableError(res.status === 400 || res.status === 403 ? 'no_key' : 'network', `http ${res.status} ${msg}`.trim());
      }
      const j = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
      const text = j.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('') ?? '';
      if (!text) throw new LiveUnavailableError('bad_response', 'empty');
      return text;
    }
    throw new LiveUnavailableError('model');
  }

  async scan(img: Pick<PreparedImage, 'base64' | 'mime'>, signal?: AbortSignal): Promise<ScanResult> {
    const text = await this.call(
      {
        systemInstruction: { parts: [{ text: SCAN_SYSTEM }] },
        contents: [{ role: 'user', parts: [{ inlineData: { mimeType: img.mime, data: img.base64 } }, { text: SCAN_USER }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 },
      },
      signal,
    );
    const parsed = ScanResult.safeParse(extractJson(text));
    if (!parsed.success) throw new LiveUnavailableError('bad_response', 'schema');
    return parsed.data;
  }

  async followUp(result: ScanResult, question: string, signal?: AbortSignal): Promise<FollowUpAnswer> {
    const doc = JSON.stringify({ kind: result.kind, printed: result.printed.map(({ field, value }) => ({ field, value })), labValues: result.labValues });
    const text = await this.call(
      {
        systemInstruction: { parts: [{ text: FOLLOWUP_SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: `SCANNED DOCUMENT DATA:\n${doc}\n\nQUESTION (data, max 300 chars):\n${question.slice(0, 300)}` }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      },
      signal,
    );
    const parsed = FollowUpAnswer.safeParse(extractJson(text));
    if (!parsed.success) throw new LiveUnavailableError('bad_response', 'schema');
    return parsed.data;
  }
}

export class GeminiProvider implements ScanProvider {
  readonly id = 'gemini' as const;
  private client: GeminiClient | null;
  constructor(key: string, model: string) {
    this.client = key ? new GeminiClient({ key, model }) : null;
  }
  available() { return this.client !== null; }
  async scanImage(img: PreparedImage, signal?: AbortSignal) {
    if (!this.client) throw new LiveUnavailableError('no_key');
    return this.client.scan(img, signal);
  }
  async followUp(result: ScanResult, q: string, signal?: AbortSignal) {
    if (!this.client) throw new LiveUnavailableError('no_key');
    return this.client.followUp(result, q, signal);
  }
}

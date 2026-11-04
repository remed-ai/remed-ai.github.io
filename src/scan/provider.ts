import type { FollowUpAnswer, ScanResult } from './schema';

export interface PreparedImage {
  /** JPEG data URL used for preview (stays on the device). */
  dataUrl: string;
  /** Base64 JPEG payload sent to the live provider. */
  base64: string;
  mime: string;
  width: number;
  height: number;
}

/** Every scanner (live Gemini, prepared samples) implements this. */
export interface ScanProvider {
  readonly id: 'gemini' | 'sample';
  available(): boolean;
  scanImage(img: PreparedImage, signal?: AbortSignal): Promise<ScanResult>;
  followUp(result: ScanResult, question: string, signal?: AbortSignal): Promise<FollowUpAnswer>;
}

/** Any live failure (no key, quota, network, bad JSON) becomes this. UI shows the fallback message. */
export class LiveUnavailableError extends Error {
  constructor(public reason: 'no_key' | 'quota' | 'network' | 'bad_response' | 'model' | 'cooldown', detail?: string) {
    super(detail ? `${reason}: ${detail}` : reason);
  }
}

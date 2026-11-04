import { CONFIG } from '../config';
import type { PreparedImage } from './provider';

/** Downscale a photo before it leaves the device. */
export async function prepareImage(src: Blob, maxEdge: number = CONFIG.maxImageEdge): Promise<PreparedImage> {
  let source: CanvasImageSource;
  let w: number;
  let h: number;
  try {
    const bmp = await createImageBitmap(src, { imageOrientation: 'from-image' });
    source = bmp; w = bmp.width; h = bmp.height;
  } catch {
    const url = URL.createObjectURL(src);
    const img = new Image();
    img.src = url;
    await img.decode();
    source = img; w = img.naturalWidth; h = img.naturalHeight;
    URL.revokeObjectURL(url);
  }
  const scale = Math.min(1, maxEdge / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement('canvas');
  canvas.width = cw; canvas.height = ch;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('no canvas');
  ctx.drawImage(source, 0, 0, cw, ch);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
  return { dataUrl, base64: dataUrl.split(',')[1] ?? '', mime: 'image/jpeg', width: cw, height: ch };
}

export function grabVideoFrame(video: HTMLVideoElement): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error('frame'))), 'image/jpeg', 0.9));
}

/** Small preview for on-device history. */
export async function makeThumb(dataUrl: string, maxEdge = 360): Promise<string> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const s = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * s);
  c.height = Math.round(img.naturalHeight * s);
  c.getContext('2d')?.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.7);
}

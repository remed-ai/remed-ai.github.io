import { useEffect, useRef, useState } from 'react';
import { grabVideoFrame } from '../scan/image';
import { useUi } from '../ui/UiContext';

/** Live camera with a photo-capture fallback (iOS without permission, desktop without camera). */
export function Camera({ onCapture, big = false, armed = true }: { onCapture: (b: Blob) => void; big?: boolean; armed?: boolean }) {
  const { t } = useUi();
  const video = useRef<HTMLVideoElement>(null);
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;
    if (!navigator.mediaDevices?.getUserMedia) {
      setLive(false);
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 } }, audio: false })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((tr) => tr.stop());
        stream = s;
        if (video.current) {
          video.current.srcObject = s;
          void video.current.play().catch(() => {});
        }
        setLive(true);
      })
      .catch(() => setLive(false));
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((tr) => tr.stop());
    };
  }, []);

  const shoot = async () => {
    if (video.current && live) onCapture(await grabVideoFrame(video.current));
  };

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] bg-black" data-testid="camera">
      <video ref={video} playsInline muted className={`w-full object-cover ${big ? 'h-[62vh]' : 'aspect-[3/4] max-h-[60vh]'} ${live ? '' : 'hidden'}`} aria-label="Camera preview" />
      {live && <div className="scan-reticle pointer-events-none absolute inset-6" aria-hidden />}
      {live === false && (
        <div className="grid min-h-64 place-items-center p-6 text-center text-white">
          <p className="text-lg">{t('noCamera')}</p>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 p-4">
        {live && armed && (
          <button type="button" onClick={shoot} className="btn-coral min-h-16 min-w-40 text-2xl" data-testid="shutter">
            {t('capture')}
          </button>
        )}
        {(live === false || live === null) && armed && (
          <label className="btn-coral min-h-16 cursor-pointer px-6 text-xl">
            {t('takePhoto')}
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => e.target.files?.[0] && onCapture(e.target.files[0])} />
          </label>
        )}
      </div>
    </div>
  );
}

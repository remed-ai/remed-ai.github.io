import { useEffect, useRef, useState } from 'react';
import { grabVideoFrame } from '../scan/image';
import { useUi } from '../ui/UiContext';
import { IconImage } from '../ui/icons';

/** Viewfinder with marigold corners, shutter and a photo fallback. */
export function Camera({ onCapture, armed = true, big = false }: { onCapture: (b: Blob) => void; armed?: boolean; big?: boolean }) {
  const { t } = useUi();
  const video = useRef<HTMLVideoElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [live, setLive] = useState<boolean | null>(null);
  const [attempt, setAttempt] = useState(0);

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
  }, [attempt]);

  const picker = (
    <input ref={file} type="file" accept="image/*" capture="environment" className="sr-only" data-testid="upload-input"
      onChange={(e) => e.target.files?.[0] && onCapture(e.target.files[0])} />
  );

  if (live === false) {
    return (
      <div className="card p-6 text-center" data-testid="camera">
        <h3 className="text-xl">{t('camErrTitle')}</h3>
        <p className="mt-1 text-ink-soft">{t('camErrBody')}</p>
        <div className="mt-4 grid gap-2">
          <button type="button" className="btn-primary" onClick={() => file.current?.click()} disabled={!armed}>{t('chooseInstead')}</button>
          <button type="button" className="btn-ghost" onClick={() => setAttempt((a) => a + 1)}>{t('tryAgain')}</button>
        </div>
        {picker}
      </div>
    );
  }

  return (
    <div data-testid="camera">
      <div className="viewfinder" style={big ? { maxHeight: '56vh' } : undefined}>
        <video ref={video} playsInline muted className="size-full object-cover" aria-label="Camera preview" />
        <span className="corner corner-tl" aria-hidden /><span className="corner corner-tr" aria-hidden />
        <span className="corner corner-bl" aria-hidden /><span className="corner corner-br" aria-hidden />
      </div>
      <p className="my-3 text-center text-sm text-ink-soft">{t('holdSteady')}</p>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <button type="button" className="btn-ghost justify-self-start whitespace-nowrap px-3 text-sm" onClick={() => file.current?.click()} disabled={!armed} aria-label={t('chooseInstead')}>
          <IconImage size={18} />{t('upload')}
        </button>
        <button type="button" className="shutter" aria-label={t('capture')} data-testid="shutter" disabled={!armed || !live}
          onClick={async () => video.current && onCapture(await grabVideoFrame(video.current))}>
          <span />
        </button>
        <span />
      </div>
      {picker}
    </div>
  );
}

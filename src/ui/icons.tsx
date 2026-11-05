import type { SVGProps } from 'react';

/** Line icons. Stroke follows currentColor. */
type P = SVGProps<SVGSVGElement> & { size?: number };
const S = ({ size = 22, children, ...p }: P) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...p}>{children}</svg>
);
export const IconScan = (p: P) => <S {...p}><path d="M5 9V5h4M19 9V5h-4M5 15v4h4M19 15v4h-4" /><circle cx="12" cy="12" r="3.2" /></S>;
export const IconHome = (p: P) => <S {...p}><path d="M4 11.5 12 4l8 7.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" /></S>;
export const IconHistory = (p: P) => <S {...p}><path d="M12 8v5l3 3M21 12a9 9 0 1 1-9-9" /></S>;
export const IconPill = (p: P) => <S {...p}><rect x="3" y="9" width="18" height="10" rx="5" /><path d="M8 9V7a4 4 0 1 1 8 0v2M12 9v10" /></S>;
export const IconSettings = (p: P) => <S {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 13a7.5 7.5 0 0 0 0-2l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-1.8-1L15 3H9l-.3 2a7.6 7.6 0 0 0-1.8 1l-2.3-.9-2 3.4L4.6 11a7.5 7.5 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9a7.6 7.6 0 0 0 1.8 1L9 21h6l.3-2a7.6 7.6 0 0 0 1.8-1l2.3.9 2-3.4z" strokeWidth={1.3} /></S>;
export const IconBack = (p: P) => <S {...p}><path d="M15 5l-7 7 7 7" /></S>;
export const IconImage = (p: P) => <S {...p}><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></S>;
export const IconMic = (p: P) => <S {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></S>;
export const IconPlay = (p: P) => <S {...p} fill="currentColor" stroke="none"><path d="M7 4l13 8-13 8z" /></S>;
export const IconPause = (p: P) => <S {...p} fill="currentColor" stroke="none"><path d="M6 4h4v16H6zM14 4h4v16h-4z" /></S>;
export const IconRepeat = (p: P) => <S {...p}><path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 3v6h-6M20 12a8 8 0 0 1-14 5.3L4 15M4 21v-6h6" /></S>;
export const IconClock = (p: P) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></S>;
export const IconWarn = (p: P) => <S {...p}><path d="M12 3 2 21h20z" /><path d="M12 10v5M12 18h.01" /></S>;
export const IconFlag = (p: P) => <S {...p}><path d="M5 21V4h11l-1.5 4L16 12H5" /></S>;
export const IconCheck = (p: P) => <S {...p}><path d="m5 12 5 5 9-10" /></S>;
export const IconTrash = (p: P) => <S {...p}><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></S>;
export const IconPhone = (p: P) => <S {...p}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" /></S>;
export const IconGlobe = (p: P) => <S {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></S>;
export const IconShield = (p: P) => <S {...p}><path d="M12 3 5 6v5.5c0 4.3 2.9 8 7 9.5 4.1-1.5 7-5.2 7-9.5V6z" /><path d="m9 12 2.2 2.2L15.5 10" /></S>;
export const IconLock = (p: P) => <S {...p}><rect x="5" y="10.5" width="14" height="10" rx="2" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></S>;
export const IconArrow = (p: P) => <S {...p}><path d="M5 12h14M13 6l6 6-6 6" /></S>;
export const IconPlus = (p: P) => <S {...p}><path d="M12 5v14M5 12h14" /></S>;

export function BrandMark({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden>
      <rect x="4" y="4" width="40" height="40" rx="10" fill="var(--ink)" />
      <path d="M14 18v12M34 18v12" stroke="var(--paper-raised)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="24" r="7" fill="none" stroke="var(--marigold)" strokeWidth="2.4" />
      <circle cx="24" cy="24" r="2.4" fill="var(--marigold)" />
    </svg>
  );
}

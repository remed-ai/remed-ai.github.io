import { ScanPanel } from '../scanner/ScanPanel';
import { useScanner } from '../scanner/useScanner';
import { AppShell } from '../ui/AppShell';
import { useUi } from '../ui/UiContext';

export function ScanPage() {
  const { t } = useUi();
  const scanner = useScanner({ history: true });
  const phase = scanner.state.phase;
  return (
    <AppShell title={phase === 'result' || phase === 'scanning' ? undefined : t('lineUp')} back="/">
      <ScanPanel scanner={scanner} />
    </AppShell>
  );
}

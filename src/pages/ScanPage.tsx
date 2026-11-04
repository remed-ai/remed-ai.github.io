import { ScanPanel } from '../demo/ScanDemo';
import { useScanner } from '../demo/useScanner';
import { Layout } from '../ui/Layout';
import { useUi } from '../ui/UiContext';

export function ScanPage() {
  const { t } = useUi();
  const scanner = useScanner({ history: true });
  return (
    <Layout>
      {scanner.state.phase !== 'result' && (
        <div className="mb-5">
          <h1 className="text-3xl font-extrabold">{t('scanTitle')}</h1>
          <p className="text-muted">{t('scanHint')}</p>
        </div>
      )}
      <ScanPanel scanner={scanner} />
    </Layout>
  );
}

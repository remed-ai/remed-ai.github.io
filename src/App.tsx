import { useEffect } from 'react';
import { navigate, usePath } from './lib/router';
import { Home } from './pages/Home';
import { ScanPage } from './pages/ScanPage';
import { HistoryPage } from './pages/HistoryPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { SettingsPage } from './pages/SettingsPage';
import { DemoPage } from './pages/DemoPage';
import { JudgePage } from './pages/JudgePage';

const TITLES: Record<string, string> = { '/scan': 'Scan', '/history': 'History', '/medicines': 'My Medicines', '/settings': 'Settings', '/demo': 'Booth mode', '/judge': 'Judge tour' };

export default function App() {
  const path = usePath();
  useEffect(() => {
    if (new URLSearchParams(location.search).get('showcase') === '1') navigate('/demo?start=1', true);
    if (path === '/about') navigate('/settings', true);
  }, [path]);
  useEffect(() => {
    const p = TITLES[`/${path.split('/')[1]}`];
    document.title = p ? `${p} · Remed-AI` : 'Remed-AI';
  }, [path]);

  if (path === '/scan') return <ScanPage key={location.search} />;
  if (path === '/history') return <HistoryPage key={path} />;
  if (path.startsWith('/history/')) return <HistoryPage key={path} id={decodeURIComponent(path.slice('/history/'.length))} />;
  if (path === '/medicines') return <MedicinesPage />;
  if (path === '/settings') return <SettingsPage />;
  if (path === '/demo') return <DemoPage />;
  if (path === '/judge') return <JudgePage />;
  return <Home />;
}

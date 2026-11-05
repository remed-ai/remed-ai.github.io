import { useEffect, useState } from 'react';
import { navigate, usePath } from './lib/router';
import { Home } from './pages/Home';
import { ScanPage } from './pages/ScanPage';
import { HistoryPage } from './pages/HistoryPage';
import { MedicinesPage } from './pages/MedicinesPage';
import { SettingsPage } from './pages/SettingsPage';
import { Welcome } from './pages/Welcome';
import { store } from './lib/storage';

const WELCOMED_KEY = 'remed.welcomed';

const TITLES: Record<string, string> = { '/welcome': 'Welcome', '/scan': 'Scan', '/history': 'History', '/medicines': 'My Medicines', '/settings': 'Settings' };

export default function App() {
  const path = usePath();
  const [welcomed, setWelcomed] = useState(() => store.get(WELCOMED_KEY, false));
  useEffect(() => {
    if (path === '/about') navigate('/settings', true);
  }, [path]);
  useEffect(() => {
    const p = TITLES[`/${path.split('/')[1]}`];
    document.title = p ? `${p} · Remed-AI` : 'Remed-AI';
  }, [path]);

  const start = () => {
    store.set(WELCOMED_KEY, true);
    setWelcomed(true);
    if (path !== '/') navigate('/');
    else window.scrollTo(0, 0);
  };
  if (path === '/welcome' || (path === '/' && !welcomed)) return <Welcome onStart={start} />;
  if (path === '/scan') return <ScanPage key={location.search} />;
  if (path === '/history') return <HistoryPage key={path} />;
  if (path.startsWith('/history/')) return <HistoryPage key={path} id={decodeURIComponent(path.slice('/history/'.length))} />;
  if (path === '/medicines') return <MedicinesPage />;
  if (path === '/settings') return <SettingsPage />;
  return <Home />;
}

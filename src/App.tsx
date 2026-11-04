import { useEffect } from 'react';
import { navigate, usePath } from './lib/router';
import { Welcome } from './pages/Welcome';
import { ScanPage } from './pages/ScanPage';
import { HistoryPage } from './pages/HistoryPage';
import { AboutPage } from './pages/AboutPage';
import { DemoPage } from './pages/DemoPage';
import { JudgePage } from './pages/JudgePage';

const TITLES: Record<string, string> = { '/': 'Remed-AI', '/scan': 'Scan · Remed-AI', '/history': 'History · Remed-AI', '/about': 'About · Remed-AI', '/demo': 'Booth mode · Remed-AI', '/judge': 'Judge tour · Remed-AI' };

export default function App() {
  const path = usePath();
  useEffect(() => {
    // Old booth links (?showcase=1) open booth mode.
    if (new URLSearchParams(location.search).get('showcase') === '1') navigate('/demo?start=1', true);
  }, []);
  useEffect(() => {
    document.title = TITLES[`/${path.split('/')[1]}`] ?? 'Remed-AI';
  }, [path]);

  if (path === '/scan') return <ScanPage />;
  if (path === "/history") return <HistoryPage key={path} />;
  if (path.startsWith('/history/')) return <HistoryPage key={path} id={decodeURIComponent(path.slice('/history/'.length))} />;
  if (path === '/about') return <AboutPage />;
  if (path === '/demo') return <DemoPage />;
  if (path === '/judge') return <JudgePage />;
  return <Welcome />;
}

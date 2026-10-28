import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useSocketConnectionState } from '../lib/socket';
import { Header } from './Header';
import { Footer } from './Footer';
import { WarningIcon } from './icons';

export function Layout() {
  const { theme, toggleTheme } = useTheme();
  const [socketDown, setSocketDown] = useState(false);
  useSocketConnectionState((connected) => setSocketDown(!connected));

  return (
    <div className="flex min-h-screen flex-col">
      <Header theme={theme} toggleTheme={toggleTheme} />
      {socketDown ? (
        <div className="flex items-center justify-center gap-2 bg-amber-500/15 px-4 py-2 text-sm text-amber-700 dark:text-amber-400">
          <WarningIcon width={14} height={14} />
          Live connection lost — reconnecting…
        </div>
      ) : null}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

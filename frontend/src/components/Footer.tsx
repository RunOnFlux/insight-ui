import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function Footer() {
  const { data: version } = useQuery({
    queryKey: ['version'],
    queryFn: api.version,
    staleTime: Infinity,
  });

  return (
    <footer className="mt-12 border-t border-slate-200 py-8 dark:border-slate-800">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row dark:text-slate-400">
        <p>
          Flux Explorer · powered by{' '}
          <a href="https://runonflux.com" target="_blank" rel="noreferrer" className="link">
            Flux
          </a>
          {version ? <span className="ml-2 text-xs">API v{version.version}</span> : null}
        </p>
        <nav className="flex flex-wrap items-center gap-4">
          <Link to="/tx/send" className="link">
            Broadcast transaction
          </Link>
          <Link to="/messages/verify" className="link">
            Verify message
          </Link>
          <a href="https://home.runonflux.io" target="_blank" rel="noreferrer" className="link">
            FluxOS
          </a>
        </nav>
      </div>
    </footer>
  );
}

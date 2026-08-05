import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';
import type { Currency } from '../context/CurrencyContext';
import { SearchBar } from './SearchBar';
import { Spinner } from './Feedback';
import {
  CheckIcon,
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  MoonIcon,
  SunIcon,
  WarningIcon,
} from './icons';
import logoUrl from '/fluxsymbol.png';

const NAV_ITEMS = [
  { to: '/blocks', label: 'Blocks' },
  { to: '/fluxnodes', label: 'FluxNodes' },
  { to: '/stats', label: 'Statistics' },
  { to: '/rich-list', label: 'Rich List' },
  { to: '/pools', label: 'Pools' },
] as const;

const MORE_ITEMS = [
  { to: '/charts', label: 'Supply Chart' },
  { to: '/network', label: 'Connections' },
  { to: '/status', label: 'Node Status' },
  { to: '/tx/send', label: 'Broadcast TX' },
  { to: '/messages/verify', label: 'Verify Message' },
] as const;

const CURRENCIES: Currency[] = ['FLUX', 'USD', 'BTC'];

function SyncBadge() {
  const { data: sync } = useQuery({
    queryKey: ['sync'],
    queryFn: api.sync,
    refetchInterval: 30_000,
  });

  if (!sync) return null;
  if (sync.error) {
    return (
      <span className="flex items-center gap-1 text-red-500" title={sync.error}>
        <WarningIcon width={14} height={14} />
        <span className="text-xs font-medium">Error</span>
      </span>
    );
  }
  if (sync.status === 'syncing') {
    return (
      <span
        className="flex items-center gap-1.5 text-amber-500"
        title={`Syncing: ${sync.height} / ${sync.blockChainHeight} blocks`}
      >
        <Spinner />
        <span className="text-xs font-medium">{sync.syncPercentage}%</span>
      </span>
    );
  }
  return (
    <span
      className="flex items-center gap-1 text-emerald-500"
      title={`Synced — height ${sync.height}`}
    >
      <CheckIcon width={14} height={14} />
      <span className="text-xs font-medium tabular-nums">{sync.height.toLocaleString()}</span>
    </span>
  );
}

function useClickOutside(onOutside: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  });
  return ref;
}

function MoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
      >
        More
        <ChevronDownIcon width={14} height={14} />
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-1 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
          {MORE_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CurrencySelect() {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className="flex overflow-hidden rounded-md border border-slate-200 text-xs dark:border-slate-700">
      {CURRENCIES.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => setCurrency(c)}
          className={`cursor-pointer px-2 py-1 font-medium transition-colors ${
            c === currency
              ? 'bg-flux-600 text-white'
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}

export function Header({
  theme,
  toggleTheme,
}: {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2" title="Flux Explorer home">
          <img src={logoUrl} alt="Flux" className="size-7" />
          <span className="hidden text-base font-bold tracking-tight sm:inline">
            Flux <span className="text-flux-500">Explorer</span>
          </span>
        </Link>

        <nav className="hidden items-center lg:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-flux-600 dark:text-flux-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <MoreMenu />
        </nav>

        <div className="min-w-0 flex-1">
          <SearchBar className="mx-auto max-w-xl" />
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <SyncBadge />
          <CurrencySelect />
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="cursor-pointer rounded-md p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        <button
          type="button"
          className="cursor-pointer rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          {mobileOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {mobileOpen ? (
        <nav className="border-t border-slate-200 px-4 py-2 lg:hidden dark:border-slate-800">
          {[...NAV_ITEMS, ...MORE_ITEMS].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium ${
                  isActive
                    ? 'text-flux-600 dark:text-flux-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="flex items-center justify-between px-3 py-3">
            <SyncBadge />
            <CurrencySelect />
          </div>
        </nav>
      ) : null}
    </header>
  );
}

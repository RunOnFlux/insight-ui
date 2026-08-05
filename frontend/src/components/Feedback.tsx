import type { ReactNode } from 'react';
import { WarningIcon } from './icons';

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block size-4 animate-spin rounded-full border-2 border-slate-300 border-t-flux-500 dark:border-slate-700 dark:border-t-flux-400 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function LoadingPanel({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="card flex items-center justify-center gap-3 p-10 text-sm text-slate-500 dark:text-slate-400">
      <Spinner />
      {label}
    </div>
  );
}

export function ErrorPanel({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="card flex items-start gap-3 border-red-200 bg-red-50 p-6 dark:border-red-900/60 dark:bg-red-950/40">
      <WarningIcon className="mt-0.5 shrink-0 text-red-500" width={20} height={20} />
      <div className="min-w-0">
        <p className="font-semibold text-red-700 dark:text-red-300">{title}</p>
        {detail ? (
          <p className="mt-1 text-sm break-all text-red-600/80 dark:text-red-300/70">{detail}</p>
        ) : null}
      </div>
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="p-8 text-center text-sm text-slate-500 dark:text-slate-400">{children}</div>
  );
}

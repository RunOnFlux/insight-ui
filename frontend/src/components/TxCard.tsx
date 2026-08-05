import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { Tx } from '../types/api';
import { useCurrency } from '../context/CurrencyContext';
import { formatDateTime, timeAgo } from '../lib/format';
import { aggregateVin, aggregateVout, fluxNodeFields, isFluxNodeTx } from '../lib/txDisplay';
import type { AggregatedEntry } from '../lib/txDisplay';
import { AddressLink } from './AddressLink';
import { CopyButton } from './CopyButton';
import { ArrowRightIcon, ChevronRightIcon, WarningIcon } from './icons';

const PAGE = 5;

function EntryList({
  entries,
  side,
  currentAddr,
}: {
  entries: AggregatedEntry[];
  side: 'in' | 'out';
  currentAddr?: string;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? entries : entries.slice(0, PAGE);
  const { convert } = useCurrency();

  return (
    <div className="space-y-1.5">
      {visible.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-2 text-sm">
          <span className="min-w-0 truncate">
            {entry.notAddr ? (
              <span className="hash text-slate-500 dark:text-slate-400" title={entry.address}>
                {entry.address}
              </span>
            ) : (
              entry.address.split(', ').map((addr, j) => (
                <span key={addr}>
                  {j > 0 ? ', ' : ''}
                  <AddressLink address={addr} current={currentAddr} />
                </span>
              ))
            )}
            {entry.count > 1 ? (
              <span className="ml-1 text-xs text-slate-400">×{entry.count}</span>
            ) : null}
            {entry.unconfirmedInput ? (
              <span className="ml-1 text-xs text-red-500">(unconfirmed input)</span>
            ) : null}
            {entry.doubleSpentTxID ? (
              <span className="ml-1 inline-flex items-center gap-1 text-xs text-red-500">
                <WarningIcon width={12} height={12} /> double-spend attempt
              </span>
            ) : null}
          </span>
          <span className="flex shrink-0 items-center gap-1.5 font-mono text-[0.8125rem] tabular-nums">
            {convert(entry.value)}
            {side === 'out' ? (
              entry.isSpent && entry.spentTxId ? (
                <Link
                  to={`/tx/${entry.spentTxId}/%3C/${entry.spentIndex ?? 0}`}
                  title="Output spent — view spending transaction"
                  className="rounded bg-red-500/10 px-1 text-xs font-semibold text-red-500"
                >
                  S
                </Link>
              ) : (
                <span
                  title="Output unspent"
                  className="rounded bg-emerald-500/10 px-1 text-xs font-semibold text-emerald-500"
                >
                  U
                </span>
              )
            ) : null}
          </span>
        </div>
      ))}
      {entries.length === 0 ? (
        <p className="text-sm text-slate-400 dark:text-slate-500">
          {side === 'in' ? 'No inputs' : 'No outputs'}
        </p>
      ) : null}
      {entries.length > PAGE ? (
        <button
          type="button"
          className="link cursor-pointer text-xs"
          onClick={() => setShowAll((s) => !s)}
        >
          {showAll ? 'Show less' : `Show all ${entries.length}`}
        </button>
      ) : null}
    </div>
  );
}

function ShieldedSummary({ tx }: { tx: Tx }) {
  const { convert } = useCurrency();
  const spends = tx.spendDescs?.length ?? 0;
  const outputs = tx.outputDescs?.length ?? 0;
  const joinSplits = tx.vjoinsplit ?? [];
  if (spends === 0 && outputs === 0 && joinSplits.length === 0) return null;
  const balance = tx.valueBalance ?? 0;

  return (
    <div className="mt-3 rounded-lg border border-dashed border-violet-300 bg-violet-50/50 p-3 text-sm dark:border-violet-800 dark:bg-violet-950/30">
      {spends > 0 || outputs > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span>{balance < 0 ? `Public input ${convert(-balance)}` : ''}</span>
          <span className="font-medium text-violet-700 dark:text-violet-300">
            Shielded spends ({spends}) → shielded outputs ({outputs})
          </span>
          <span>{balance > 0 ? `Public output ${convert(balance)}` : ''}</span>
        </div>
      ) : null}
      {joinSplits.map((js, i) => (
        <div key={i} className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <span>Public input {convert(js.vpub_old)}</span>
          <span className="font-medium text-violet-700 dark:text-violet-300">JoinSplit [{i}]</span>
          <span>Public output {convert(js.vpub_new)}</span>
        </div>
      ))}
    </div>
  );
}

function FluxNodeTable({ tx }: { tx: Tx }) {
  return (
    <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
      {fluxNodeFields(tx).map((field) => (
        <div key={field.label} className="contents">
          <dt className="font-medium text-slate-500 dark:text-slate-400">{field.label}</dt>
          <dd className="min-w-0">
            {field.kind === 'tx-link' ? (
              <Link to={`/tx/${field.value.split(':')[0]}`} className="hash link">
                {field.value}
              </Link>
            ) : field.kind === 'timestamp' ? (
              formatDateTime(Number(field.value))
            ) : field.kind === 'mono' ? (
              <span className="hash">
                {field.value} <CopyButton value={field.value} />
              </span>
            ) : (
              field.value
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export function TxCard({ tx, currentAddr }: { tx: Tx; currentAddr?: string }) {
  const { convert } = useCurrency();
  const fluxNodeTx = isFluxNodeTx(tx);
  const timestamp = tx.time ?? tx.blocktime;

  return (
    <article className="card p-4">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
        <span className="flex min-w-0 items-center gap-1">
          <Link to={`/tx/${tx.txid}`} className="hash link truncate">
            {tx.txid}
          </Link>
          <CopyButton value={tx.txid} />
        </span>
        {timestamp ? (
          <time
            className="shrink-0 text-xs text-slate-400 dark:text-slate-500"
            title={formatDateTime(timestamp)}
          >
            {timeAgo(timestamp)}
          </time>
        ) : null}
      </header>

      {fluxNodeTx ? (
        <FluxNodeTable tx={tx} />
      ) : (
        <>
          <div className="mt-3 grid gap-4 md:grid-cols-[1fr_auto_1fr]">
            <div className="min-w-0">
              {tx.isCoinBase ? (
                <p className="text-sm text-slate-500 italic dark:text-slate-400">
                  No inputs (newly generated coins)
                </p>
              ) : (
                <EntryList entries={aggregateVin(tx.vin)} side="in" currentAddr={currentAddr} />
              )}
            </div>
            <div className="hidden items-center justify-center text-slate-300 md:flex dark:text-slate-600">
              <ArrowRightIcon width={18} height={18} />
            </div>
            <div className="min-w-0">
              <EntryList entries={aggregateVout(tx.vout)} side="out" currentAddr={currentAddr} />
            </div>
          </div>
          <ShieldedSummary tx={tx} />
        </>
      )}

      <footer className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-xs dark:border-slate-800">
        <span className="text-slate-500 dark:text-slate-400">
          {!fluxNodeTx && !tx.isCoinBase && tx.fees !== undefined && Number.isFinite(tx.fees)
            ? `Fee: ${convert(tx.fees)}`
            : ''}
        </span>
        <span className="flex items-center gap-2">
          {tx.confirmations > 0 ? (
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-600 tabular-nums dark:text-emerald-400">
              {tx.confirmations.toLocaleString()} confirmations
            </span>
          ) : (
            <span className="rounded-full bg-red-500/10 px-2.5 py-1 font-medium text-red-500">
              Unconfirmed
            </span>
          )}
          {!fluxNodeTx ? (
            <span className="rounded-full bg-flux-500/10 px-2.5 py-1 font-semibold text-flux-600 tabular-nums dark:text-flux-300">
              {convert(tx.valueOut)}
            </span>
          ) : null}
          <Link
            to={`/tx/${tx.txid}`}
            className="link flex items-center gap-0.5 font-medium"
            title="Transaction details"
          >
            Details <ChevronRightIcon width={12} height={12} />
          </Link>
        </span>
      </footer>
    </article>
  );
}

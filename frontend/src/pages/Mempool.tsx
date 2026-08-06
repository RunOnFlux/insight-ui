import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSocketRoom } from '../lib/socket';
import { useCurrency } from '../context/CurrencyContext';
import { formatInt, formatNumber } from '../lib/format';
import { usePageTitle } from '../hooks/usePageTitle';
import { Spinner } from '../components/Feedback';
import type { InvTx } from '../types/api';
import { EcosystemPromos } from '../components/EcosystemPromos';

const MAX_ROWS = 200;

interface SeenTx extends InvTx {
  seenAt: number;
}

export function Mempool() {
  usePageTitle('Live transactions');
  const { convert } = useCurrency();
  const [txs, setTxs] = useState<SeenTx[]>([]);
  const [blocks, setBlocks] = useState(0);
  const openedAt = useRef(Date.now());
  const total = useRef({ count: 0, value: 0 });

  useSocketRoom('inv', {
    tx: (tx: InvTx) => {
      setTxs((prev) => {
        if (prev.some((t) => t.txid === tx.txid)) return prev;
        total.current.count += 1;
        total.current.value += tx.valueOut;
        return [{ ...tx, seenAt: Date.now() }, ...prev].slice(0, MAX_ROWS);
      });
    },
    block: () => setBlocks((b) => b + 1),
  });

  const perMinute = useMemo(() => {
    const minutes = (Date.now() - openedAt.current) / 60_000;
    return minutes > 0.2 ? total.current.count / minutes : 0;
  }, [txs.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold">Live transactions</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Transactions relayed to this node since you opened the page, streamed over websockets.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Seen
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">{formatInt(total.current.count)}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Rate
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">
            {formatNumber(perMinute, 1)}
            <span className="text-sm font-normal text-slate-400"> tx/min</span>
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Total value
          </p>
          <p className="mt-1 text-xl font-bold break-words tabular-nums">
            {convert(total.current.value)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            Blocks since open
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums">{formatInt(blocks)}</p>
        </div>
      </div>

      <div className="card divide-y divide-slate-100 dark:divide-slate-800/70">
        {txs.length === 0 ? (
          <p className="flex items-center justify-center gap-3 p-10 text-sm text-slate-500 dark:text-slate-400">
            <Spinner /> Waiting for transactions… (Flux averages one block every 30 seconds)
          </p>
        ) : (
          txs.map((tx) => (
            <div key={tx.txid} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <Link to={`/tx/${tx.txid}`} className="hash link min-w-0 truncate">
                {tx.txid}
              </Link>
              <span className="flex shrink-0 items-center gap-3">
                <span className="rounded-full bg-flux-500/10 px-2.5 py-1 text-xs font-semibold text-flux-600 tabular-nums dark:text-flux-300">
                  {convert(tx.valueOut)}
                </span>
                <time className="w-20 text-right text-xs text-slate-400 tabular-nums">
                  {new Date(tx.seenAt).toLocaleTimeString()}
                </time>
              </span>
            </div>
          ))
        )}
      </div>

      <EcosystemPromos variant="band" />
    </div>
  );
}

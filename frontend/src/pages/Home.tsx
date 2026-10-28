import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useSocketRoom } from '../lib/socket';
import { useCurrency } from '../context/currency';
import type { InvTx } from '../types/api';
import { formatHashrate, formatInt, formatNumber, formatUsd } from '../lib/format';
import { BlocksTable } from './../components/BlocksTable';
import { LoadingPanel } from '../components/Feedback';
import { EcosystemPromos } from '../components/EcosystemPromos';

const LATEST_BLOCKS = 10;
const LATEST_TXS = 10;

function StatCard({
  label,
  value,
  sub,
  to,
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  to?: string;
}) {
  const body = (
    <>
      <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold break-words tabular-nums">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</p> : null}
    </>
  );
  return to ? (
    <Link to={to} className="card block p-4 transition-shadow hover:shadow-md">
      {body}
    </Link>
  ) : (
    <div className="card p-4">{body}</div>
  );
}

export function Home() {
  const queryClient = useQueryClient();
  const { convert } = useCurrency();
  const [liveTxs, setLiveTxs] = useState<InvTx[]>([]);

  const { data: blocksData } = useQuery({
    queryKey: ['latest-blocks'],
    queryFn: () => api.blocks({ limit: LATEST_BLOCKS }),
  });
  const { data: info } = useQuery({ queryKey: ['info'], queryFn: api.info });
  const { data: markets } = useQuery({ queryKey: ['markets-info'], queryFn: api.marketsInfo });
  const { data: mining } = useQuery({ queryKey: ['mining-info'], queryFn: api.miningInfo });

  // The newest block's transactions fill the list until live ones arrive; a new block changes the
  // hash and so refetches.
  const latestBlockHash = blocksData?.blocks[0]?.hash;
  const { data: latestBlockTxs } = useQuery({
    queryKey: ['latest-block-txs', latestBlockHash],
    queryFn: () => api.blockTxs(latestBlockHash as string, 0),
    enabled: latestBlockHash !== undefined,
  });

  // Live transactions first, then the newest block's, each once. A FluxNode transaction in a block
  // has no valueOut; live, it arrives as 0.
  const latestTxs = useMemo(() => {
    const seen = new Set<string>();
    const rows: Pick<InvTx, 'txid' | 'valueOut'>[] = [];
    const blockTxs = (latestBlockTxs?.txs ?? []).map((tx) => ({
      txid: tx.txid,
      valueOut: tx.valueOut ?? 0,
    }));
    for (const tx of [...liveTxs, ...blockTxs]) {
      if (seen.has(tx.txid)) continue;
      seen.add(tx.txid);
      rows.push(tx);
    }
    return rows.slice(0, LATEST_TXS);
  }, [liveTxs, latestBlockTxs]);

  useSocketRoom('inv', {
    tx: (tx: InvTx) => {
      setLiveTxs((prev) => [tx, ...prev.filter((t) => t.txid !== tx.txid)].slice(0, LATEST_TXS));
    },
    block: () => {
      void queryClient.invalidateQueries({ queryKey: ['latest-blocks'] });
      void queryClient.invalidateQueries({ queryKey: ['sync'] });
      void queryClient.invalidateQueries({ queryKey: ['info'] });
      void queryClient.invalidateQueries({ queryKey: ['mining-info'] });
    },
  });

  const delta = markets?.delta_24h;

  return (
    <div className="space-y-6">
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Block height"
          value={info ? formatInt(info.info.blocks) : '—'}
          sub={info ? `${info.info.connections} peer connections` : undefined}
        />
        <StatCard
          label="Flux price"
          value={markets ? formatUsd(markets.price) : '—'}
          sub={
            delta !== undefined ? (
              <span className={delta >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                {delta >= 0 ? '+' : ''}
                {formatNumber(delta, 2)}% (24h)
              </span>
            ) : undefined
          }
        />
        <StatCard
          label="Market cap"
          value={markets ? formatUsd(markets.market_cap_usd) : '—'}
          sub={markets ? `${formatUsd(markets.total_volume_24h)} 24h volume` : undefined}
        />
        <StatCard
          label="Network hashrate"
          value={mining ? formatHashrate(mining.miningInfo.networkhashps) : '—'}
          sub={mining ? `difficulty ${formatNumber(mining.miningInfo.difficulty, 4)}` : undefined}
          to="/stats"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Latest blocks</h2>
            <Link to="/blocks" className="link text-sm font-medium">
              View all →
            </Link>
          </div>
          {blocksData ? (
            <BlocksTable blocks={blocksData.blocks} emptyLabel="Waiting for blocks…" />
          ) : (
            <LoadingPanel label="Loading blocks…" />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Latest transactions</h2>
          <div className="card divide-y divide-slate-100 dark:divide-slate-800/70">
            {latestTxs.length === 0 ? (
              <p className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
                Loading transactions…
              </p>
            ) : (
              latestTxs.map((tx) => (
                <div key={tx.txid} className="flex items-center justify-between gap-3 px-4 py-3">
                  <Link to={`/tx/${tx.txid}`} className="hash link min-w-0 truncate">
                    {tx.txid}
                  </Link>
                  {tx.valueOut === 0 ? (
                    <span
                      className="shrink-0 rounded-full bg-slate-500/10 px-2.5 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400"
                      title="FluxNode start/confirmation transaction — no value transfer"
                    >
                      FluxNode
                    </span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-flux-500/10 px-2.5 py-1 text-xs font-semibold text-flux-600 tabular-nums dark:text-flux-300">
                      {convert(tx.valueOut)}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <EcosystemPromos variant="band" />
    </div>
  );
}

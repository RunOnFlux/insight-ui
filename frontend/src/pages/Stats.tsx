import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';
import { formatHashrate, formatInt, formatNumber, formatUsd } from '../lib/format';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';
import { PoolShareBars } from '../components/PoolShareBars';
import type { ReactNode } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { EcosystemPromos } from '../components/EcosystemPromos';

function Row({ label, children, to }: { label: string; children: ReactNode; to?: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
      <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">
        {to ? (
          <Link to={to} className="link font-medium">
            {label}
          </Link>
        ) : (
          label
        )}
      </dt>
      <dd className="min-w-0 text-right text-sm tabular-nums">{children}</dd>
    </div>
  );
}

export function Stats() {
  usePageTitle('Network statistics');
  const { convert } = useCurrency();
  const total = useQuery({ queryKey: ['stats-total'], queryFn: api.statsTotal });
  const lastHour = useQuery({ queryKey: ['stats-1h'], queryFn: api.statsPoolsLastHour });
  const markets = useQuery({ queryKey: ['markets-info'], queryFn: api.marketsInfo });
  const mining = useQuery({ queryKey: ['mining-info'], queryFn: api.miningInfo });
  const circulating = useQuery({
    queryKey: ['circulating-supply'],
    queryFn: api.statsCirculatingSupply,
  });

  if (total.isPending) return <LoadingPanel label="Loading statistics…" />;
  if (total.error) {
    return <ErrorPanel title="Could not load statistics" detail={String(total.error)} />;
  }
  const stats = total.data;
  const delta = markets.data?.delta_24h;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">
        Network statistics{' '}
        <span className="font-normal text-slate-500 dark:text-slate-400">(last 24 hours)</span>
      </h1>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card px-4 py-2">
          <h2 className="pt-2 text-sm font-semibold">Blocks</h2>
          <dl className="divide-y divide-slate-100 dark:divide-slate-800/70">
            <Row label="Blocks mined">{formatInt(stats.n_blocks_mined)}</Row>
            <Row label="Time between blocks">
              {formatNumber(stats.time_between_blocks / 60, 2)} minutes
            </Row>
            <Row label="Flux mined">{convert(stats.mined_currency_amount / 1e8)}</Row>
            <Row label="Circulating supply" to="/charts">
              {circulating.data
                ? `${formatInt(Number(circulating.data.circulatingSupply))} FLUX`
                : '—'}
            </Row>
          </dl>
        </section>

        <section className="card px-4 py-2">
          <h2 className="pt-2 text-sm font-semibold">Market</h2>
          <dl className="divide-y divide-slate-100 dark:divide-slate-800/70">
            <Row label="Price">
              {markets.data ? (
                <>
                  {formatUsd(markets.data.price)}{' '}
                  {delta !== undefined ? (
                    <span className={delta >= 0 ? 'text-emerald-500' : 'text-red-500'}>
                      ({delta >= 0 ? '+' : ''}
                      {formatNumber(delta, 2)}%)
                    </span>
                  ) : null}
                </>
              ) : (
                '—'
              )}
            </Row>
            <Row label="Price (BTC)">
              {markets.data ? `${markets.data.price_btc.toFixed(10)} BTC` : '—'}
            </Row>
            <Row label="24h volume">
              {markets.data ? formatUsd(markets.data.total_volume_24h) : '—'}
            </Row>
            <Row label="Market cap">
              {markets.data ? formatUsd(markets.data.market_cap_usd) : '—'}
            </Row>
          </dl>
        </section>

        <section className="card px-4 py-2">
          <h2 className="pt-2 text-sm font-semibold">Transactions</h2>
          <dl className="divide-y divide-slate-100 dark:divide-slate-800/70">
            <Row label="Transactions" to="/stats/transactions/60">
              {formatInt(stats.number_of_transactions)}
            </Row>
            <Row label="Total fees" to="/stats/fees/60">
              {convert(stats.transaction_fees / 1e8)}
            </Row>
            <Row label="Output volume" to="/stats/outputs/60">
              {convert(stats.outputs_volume / 1e8)}
            </Row>
          </dl>
        </section>

        <section className="card px-4 py-2">
          <h2 className="pt-2 text-sm font-semibold">Mining</h2>
          <dl className="divide-y divide-slate-100 dark:divide-slate-800/70">
            <Row label="Difficulty" to="/stats/difficulty/60">
              {mining.data ? formatNumber(mining.data.miningInfo.difficulty, 8) : '—'}
            </Row>
            <Row label="Network hashrate" to="/stats/nethash/60">
              {mining.data ? formatHashrate(mining.data.miningInfo.networkhashps) : '—'}
            </Row>
          </dl>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="mb-3 text-sm font-semibold">
            Block share — last hour{' '}
            <span className="font-normal text-slate-400">
              ({formatInt(lastHour.data?.n_blocks_mined ?? 0)} blocks)
            </span>
          </h2>
          <PoolShareBars
            pools={lastHour.data?.blocks_by_pool ?? []}
            totalBlocks={lastHour.data?.n_blocks_mined ?? 0}
          />
        </section>
        <section className="card p-4">
          <h2 className="mb-3 text-sm font-semibold">
            Block share — last 24 hours{' '}
            <span className="font-normal text-slate-400">
              ({formatInt(stats.n_blocks_mined)} blocks)
            </span>
          </h2>
          <PoolShareBars pools={stats.blocks_by_pool ?? []} totalBlocks={stats.n_blocks_mined} />
        </section>
      </div>

      <EcosystemPromos variant="band" />
    </div>
  );
}

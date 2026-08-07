import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { fetchNodeHistory } from '../lib/external';
import { TIER_COLLATERAL } from '../lib/fluxnode';
import { formatInt, formatNumber, formatUsd } from '../lib/format';
import { LineChart } from './LineChart';
import { MultiLineChart } from './MultiLineChart';
import { LoadingPanel } from './Feedback';

/* Palette validated with the dataviz checker for both surfaces:
   light sky-500/violet-500/amber-500, dark sky-600/violet-500/amber-600. */
const TIER_SERIES = [
  {
    key: 'cumulus' as const,
    name: 'CUMULUS',
    strokeClass: 'stroke-sky-500 dark:stroke-sky-600',
    swatchClass: 'bg-sky-500 dark:bg-sky-600',
  },
  {
    key: 'nimbus' as const,
    name: 'NIMBUS',
    strokeClass: 'stroke-violet-500 dark:stroke-violet-500',
    swatchClass: 'bg-violet-500 dark:bg-violet-500',
  },
  {
    key: 'stratus' as const,
    name: 'STRATUS',
    strokeClass: 'stroke-amber-500 dark:stroke-amber-600',
    swatchClass: 'bg-amber-500 dark:bg-amber-600',
  },
];

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-bold break-words tabular-nums">{value}</p>
      {sub ? <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</p> : null}
    </div>
  );
}

export function FluxNodeStats({
  lockedFlux,
  lockedNodes,
  operatorCount,
}: {
  lockedFlux: number;
  lockedNodes: number;
  operatorCount: number;
}) {
  const { data: history, error } = useQuery({
    queryKey: ['node-history-full'],
    queryFn: fetchNodeHistory,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  const { data: markets } = useQuery({ queryKey: ['markets-info'], queryFn: api.marketsInfo });
  const { data: circulating } = useQuery({
    queryKey: ['circulating-supply'],
    queryFn: api.statsCirculatingSupply,
  });

  const supply = circulating ? Number(circulating.circulatingSupply) : undefined;
  const lockedShare = supply !== undefined && supply > 0 ? (lockedFlux / supply) * 100 : undefined;

  const lockedHistory =
    history?.map((p) => ({
      date: p.date,
      value:
        p.cumulus * (TIER_COLLATERAL['CUMULUS'] ?? 0) +
        p.nimbus * (TIER_COLLATERAL['NIMBUS'] ?? 0) +
        p.stratus * (TIER_COLLATERAL['STRATUS'] ?? 0),
    })) ?? [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Locked in nodes"
          value={`${formatInt(lockedFlux)} FLUX`}
          sub={markets ? `≈ ${formatUsd(lockedFlux * markets.price)}` : undefined}
        />
        <StatCard
          label="Of circulating supply"
          value={lockedShare !== undefined ? `${formatNumber(lockedShare, 2)}%` : '—'}
          sub={supply !== undefined ? `${formatInt(supply)} FLUX circulating` : undefined}
        />
        <StatCard
          label="Node operators"
          value={formatInt(operatorCount)}
          sub="unique payment addresses"
        />
        <StatCard
          label="Avg nodes per operator"
          value={operatorCount > 0 ? formatNumber(lockedNodes / operatorCount, 1) : '—'}
        />
      </div>

      {error ? null : !history ? (
        <LoadingPanel label="Loading node history…" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="card p-4">
            <h2 className="mb-3 text-sm font-semibold">
              Nodes by tier{' '}
              <span className="font-normal text-slate-400 dark:text-slate-500">
                (30d · via stats.runonflux.io)
              </span>
            </h2>
            <MultiLineChart
              series={TIER_SERIES.map((tier) => ({
                name: tier.name,
                strokeClass: tier.strokeClass,
                swatchClass: tier.swatchClass,
                data: history.map((p) => ({ date: p.date, value: p[tier.key] })),
              }))}
              formatValue={formatInt}
              height={240}
            />
          </section>
          <section className="card p-4">
            <h2 className="mb-3 text-sm font-semibold">
              Locked collateral{' '}
              <span className="font-normal text-slate-400 dark:text-slate-500">(30d, FLUX)</span>
            </h2>
            <LineChart
              data={lockedHistory}
              formatValue={(v) => `${formatInt(v)} FLUX`}
              height={240}
            />
          </section>
        </div>
      )}
    </div>
  );
}

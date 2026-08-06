import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatFlux, formatHashrate, formatInt, formatNumber } from '../lib/format';
import { fetchNodeHistory, fetchPriceHistory } from '../lib/external';
import { DaysSelector, StatChartCard, STAT_META } from '../components/StatChartCard';
import type { StatType } from '../components/StatChartCard';
import { LineChart } from '../components/LineChart';
import { LoadingPanel } from '../components/Feedback';
import { ChevronRightIcon } from '../components/icons';
import { usePageTitle } from '../hooks/usePageTitle';

function ExternalChart({
  title,
  source,
  queryKey,
  fetcher,
  formatValue,
}: {
  title: string;
  source: string;
  queryKey: (string | number)[];
  fetcher: () => Promise<{ date: string; value: number }[]>;
  formatValue: (v: number) => string;
}) {
  const { data, error, isPending } = useQuery({
    queryKey,
    queryFn: fetcher,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  return (
    <div>
      <p className="mb-2 flex items-baseline gap-2 text-sm font-semibold">
        {title}
        <span className="text-xs font-normal text-slate-400 dark:text-slate-500">{source}</span>
      </p>
      {isPending ? <LoadingPanel label={`Loading ${title.toLowerCase()}…`} /> : null}
      {error ? (
        <div className="card p-6 text-center text-sm text-slate-400 dark:text-slate-500">
          {title} is temporarily unavailable.
        </div>
      ) : null}
      {data ? (
        <div className="card p-4">
          <LineChart data={data} formatValue={formatValue} height={200} />
        </div>
      ) : null}
    </div>
  );
}

const SECONDARY: { type: StatType; route: string; format: (v: number) => string }[] = [
  { type: 'transactions', route: 'transactions', format: formatInt },
  { type: 'difficulty', route: 'difficulty', format: (v) => formatNumber(v, 4) },
  { type: 'network-hash', route: 'nethash', format: formatHashrate },
  { type: 'fees', route: 'fees', format: (v) => formatNumber(v, 8) },
  { type: 'outputs', route: 'outputs', format: (v) => formatFlux(Math.round(v)) },
];

export function Charts() {
  usePageTitle('Charts');
  const [params] = useSearchParams();
  const raw = params.get('days') ?? '60';
  const days: number | 'all' = raw === 'all' ? 'all' : Number(raw) || 60;

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">{STAT_META.supply.title}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {STAT_META.supply.description}
            </p>
          </div>
          <DaysSelector active={days} linkFor={(d) => `/charts?days=${d}`} />
        </header>
        <StatChartCard type="supply" days={days} formatValue={formatInt} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Market &amp; nodes</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <ExternalChart
            title="Flux price (USD)"
            source="via CoinGecko"
            queryKey={['price-history', String(days)]}
            fetcher={() => fetchPriceHistory(days)}
            formatValue={(v) => `$${v.toFixed(4)}`}
          />
          <ExternalChart
            title="FluxNodes online (30d)"
            source="via stats.runonflux.io"
            queryKey={['node-history']}
            fetcher={async () =>
              (await fetchNodeHistory()).map((p) => ({ date: p.date, value: p.total }))
            }
            formatValue={formatInt}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Network charts</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {SECONDARY.map(({ type, route, format }) => (
            <div key={type}>
              <Link
                to={`/stats/${route}/365`}
                className="link mb-2 flex items-center gap-1 text-sm font-semibold"
              >
                {STAT_META[type].title}
                <ChevronRightIcon width={14} height={14} />
              </Link>
              <StatChartCard type={type} days={days} formatValue={format} height={200} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { useParams } from 'react-router-dom';
import { formatFlux, formatHashrate, formatInt, formatNumber } from '../lib/format';
import { DaysSelector, StatChartCard, STAT_META } from '../components/StatChartCard';
import type { StatType } from '../components/StatChartCard';
import { NotFound } from './NotFound';
import { usePageTitle } from '../hooks/usePageTitle';

/** Legacy route aliases → API stat types. */
const TYPE_ALIASES: Record<string, StatType> = {
  transactions: 'transactions',
  outputs: 'outputs',
  fees: 'fees',
  difficulty: 'difficulty',
  nethash: 'network-hash',
  'network-hash': 'network-hash',
  supply: 'supply',
};

const FORMATTERS: Record<StatType, (value: number) => string> = {
  supply: formatInt,
  transactions: formatInt,
  outputs: (v) => formatFlux(Math.round(v)),
  fees: (v) => formatNumber(v, 8),
  difficulty: (v) => formatNumber(v, 4),
  'network-hash': formatHashrate,
};

export function StatChart() {
  const { type = '', days: daysParam = '60' } = useParams();
  const statType = TYPE_ALIASES[type];
  usePageTitle(statType ? STAT_META[statType].title : 'Statistics');
  if (!statType) return <NotFound />;

  const days: number | 'all' = daysParam === 'all' ? 'all' : Number(daysParam) || 60;
  const meta = STAT_META[statType];

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold">{meta.title}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{meta.description}</p>
        </div>
        <DaysSelector active={days} linkFor={(d) => `/stats/${type}/${d}`} />
      </header>
      <StatChartCard type={statType} days={days} formatValue={FORMATTERS[statType]} />
    </div>
  );
}

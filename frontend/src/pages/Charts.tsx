import { useSearchParams } from 'react-router-dom';
import { formatInt } from '../lib/format';
import { DaysSelector, StatChartCard, STAT_META } from '../components/StatChartCard';

export function Charts() {
  const [params] = useSearchParams();
  const raw = params.get('days') ?? '60';
  const days: number | 'all' = raw === 'all' ? 'all' : Number(raw) || 60;

  return (
    <div className="space-y-4">
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
    </div>
  );
}

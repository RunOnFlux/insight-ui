import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { DAY_OPTIONS, STAT_META } from './statMeta';
import type { StatType } from './statMeta';
import { LineChart } from './LineChart';
import { ErrorPanel, LoadingPanel } from './Feedback';

export function DaysSelector({
  active,
  linkFor,
}: {
  active: number | 'all';
  linkFor: (days: number | 'all') => string;
}) {
  return (
    <div className="flex overflow-hidden rounded-lg border border-slate-200 text-xs dark:border-slate-700">
      {DAY_OPTIONS.map((option) => (
        <Link
          key={option.label}
          to={linkFor(option.value)}
          className={`px-3 py-1.5 font-medium transition-colors ${
            String(option.value) === String(active)
              ? 'bg-flux-600 text-white'
              : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
          }`}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

export function StatChartCard({
  type,
  days,
  formatValue,
  height,
}: {
  type: StatType;
  days: number | 'all';
  formatValue: (value: number) => string;
  height?: number;
}) {
  const meta = STAT_META[type];
  const { data, error, isPending } = useQuery({
    queryKey: ['stat-chart', type, String(days)],
    queryFn: () => api.statsByDays(type, days),
    staleTime: 5 * 60 * 1000,
  });

  if (isPending) return <LoadingPanel label={`Loading ${meta.title.toLowerCase()}…`} />;
  if (error) return <ErrorPanel title={`Could not load ${meta.title}`} detail={String(error)} />;

  const points = [...(data ?? [])]
    .reverse()
    .map((day) => ({ date: day.date, value: Number(day[meta.field] ?? 0) }));

  return (
    <div className="card p-4">
      <LineChart data={points} formatValue={formatValue} height={height} />
    </div>
  );
}

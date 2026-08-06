import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { StatDay } from '../types/api';
import { LineChart } from './LineChart';
import { ErrorPanel, LoadingPanel } from './Feedback';

export type StatType =
  'supply' | 'transactions' | 'outputs' | 'fees' | 'difficulty' | 'network-hash';

export const STAT_META: Record<
  StatType,
  { title: string; description: string; field: keyof StatDay }
> = {
  supply: {
    title: 'Circulating supply',
    description: 'The circulating supply of Flux on the network.',
    field: 'sum',
  },
  transactions: {
    title: 'Transactions',
    description: 'The number of daily confirmed Flux transactions.',
    field: 'transaction_count',
  },
  outputs: {
    title: 'Output volume',
    description:
      'The total value of all transaction outputs per day (includes change returned to the sender).',
    field: 'sum',
  },
  fees: {
    title: 'Transaction fees',
    description: 'The daily average of fees paid to miners per transaction.',
    field: 'fee',
  },
  difficulty: {
    title: 'Difficulty',
    description: 'A relative measure of how difficult it is to find a new block.',
    field: 'sum',
  },
  'network-hash': {
    title: 'Network hashrate',
    description: 'The daily average global network hashrate.',
    field: 'sum',
  },
};

export const DAY_OPTIONS: { value: number | 'all'; label: string }[] = [
  { value: 30, label: '30d' },
  { value: 60, label: '60d' },
  { value: 180, label: '180d' },
  { value: 365, label: '1y' },
  { value: 730, label: '2y' },
  { value: 'all', label: 'All' },
];

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

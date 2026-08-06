import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatBytes, formatInt, formatNumber, utcDateString } from '../lib/format';
import type { BlockSummary } from '../types/api';
import { BlocksTable } from '../components/BlocksTable';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import { usePageTitle } from '../hooks/usePageTitle';

function DayStats({ blocks }: { blocks: BlockSummary[] }) {
  const times = blocks.map((b) => b.time);
  const spanSeconds = Math.max(...times) - Math.min(...times);
  const avgInterval = spanSeconds / (blocks.length - 1);
  const avgSize = blocks.reduce((acc, b) => acc + b.size, 0) / blocks.length;
  const totalTxs = blocks.reduce((acc, b) => acc + b.txlength, 0);
  const stats = [
    { label: 'Avg block interval', value: `${formatNumber(avgInterval, 1)} s` },
    { label: 'Avg block size', value: formatBytes(avgSize) },
    { label: 'Transactions', value: formatInt(totalTxs) },
    { label: 'Avg txs / block', value: formatNumber(totalTxs / blocks.length, 1) },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="card p-3">
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
            {stat.label}
          </p>
          <p className="mt-0.5 text-lg font-bold tabular-nums">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

export function Blocks() {
  usePageTitle('Blocks');
  const { blockDate, startTimestamp } = useParams();
  const navigate = useNavigate();

  const { data, error, isPending } = useQuery({
    queryKey: ['blocks', blockDate ?? 'today', startTimestamp ?? ''],
    queryFn: () =>
      api.blocks({
        blockDate,
        startTimestamp: startTimestamp !== undefined ? Number(startTimestamp) : undefined,
      }),
  });

  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">
          Blocks{' '}
          <span className="font-normal text-slate-500 dark:text-slate-400">
            {pagination ? (pagination.isToday ? 'today' : `on ${pagination.current}`) : ''}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          {pagination ? (
            <Link
              to={`/blocks-date/${pagination.prev}`}
              className="card flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeftIcon width={14} height={14} /> {pagination.prev}
            </Link>
          ) : null}
          <input
            type="date"
            value={pagination?.current ?? utcDateString()}
            max={utcDateString()}
            onChange={(e) => {
              if (e.target.value) void navigate(`/blocks-date/${e.target.value}`);
            }}
            className="card px-3 py-2 text-sm"
            aria-label="Pick a date"
          />
          {pagination && !pagination.isToday ? (
            <Link
              to={`/blocks-date/${pagination.next}`}
              className="card flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {pagination.next} <ChevronRightIcon width={14} height={14} />
            </Link>
          ) : null}
        </div>
      </div>

      {isPending ? <LoadingPanel label="Loading blocks…" /> : null}
      {error ? <ErrorPanel title="Could not load blocks" detail={String(error)} /> : null}
      {data && data.blocks.length > 1 ? <DayStats blocks={data.blocks} /> : null}
      {data ? (
        <>
          <BlocksTable blocks={data.blocks} emptyLabel="No blocks on this date." />
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-slate-500 dark:text-slate-400">
              {data.blocks.length} block{data.blocks.length === 1 ? '' : 's'} shown
            </span>
            <span className="flex gap-4">
              {startTimestamp !== undefined && pagination ? (
                <Link to={`/blocks-date/${pagination.current}`} className="link font-medium">
                  Latest blocks from this date
                </Link>
              ) : null}
              {pagination?.more && pagination.moreTs !== undefined ? (
                <Link
                  to={`/blocks-date/${pagination.current}/${pagination.moreTs}`}
                  className="link font-medium"
                >
                  Older blocks from this date →
                </Link>
              ) : null}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}

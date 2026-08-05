import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { utcDateString } from '../lib/format';
import { BlocksTable } from '../components/BlocksTable';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';

export function Blocks() {
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

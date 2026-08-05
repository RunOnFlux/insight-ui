import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatHashrate, formatInt, utcDateString } from '../lib/format';
import { AddressLink } from '../components/AddressLink';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';
import { PoolShareBars } from '../components/PoolShareBars';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';

export function Pools() {
  const { date } = useParams();
  const navigate = useNavigate();

  const { data, error, isPending } = useQuery({
    queryKey: ['pools', date ?? 'today'],
    queryFn: () => api.statsPools(date),
  });
  const { data: nethashDays } = useQuery({
    queryKey: ['stat-chart', 'network-hash', 'all'],
    queryFn: () => api.statsByDays('network-hash', 'all'),
    staleTime: 5 * 60 * 1000,
  });

  if (isPending) return <LoadingPanel label="Loading pools…" />;
  if (error) return <ErrorPanel title="Could not load pools" detail={String(error)} />;
  if (!data) return null;

  const pools = [...(data.blocks_by_pool ?? [])].sort((a, b) => b.blocks_found - a.blocks_found);
  const nethashRaw = nethashDays?.find((day) => day.date === (data.date ?? date))?.sum;
  const nethash = nethashRaw !== undefined ? Number(nethashRaw) : undefined;
  const pagination = data.pagination;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">
          Mining pools{' '}
          <span className="font-normal text-slate-500 dark:text-slate-400">
            {pagination?.isToday ? 'today' : `on ${data.date}`}
          </span>
        </h1>
        <div className="flex items-center gap-2">
          {pagination ? (
            <Link
              to={`/pools/${pagination.prev}`}
              className="card flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeftIcon width={14} height={14} /> {pagination.prev}
            </Link>
          ) : null}
          <input
            type="date"
            value={data.date ?? utcDateString()}
            max={utcDateString()}
            onChange={(e) => {
              if (e.target.value) void navigate(`/pools/${e.target.value}`);
            }}
            className="card px-3 py-2 text-sm"
            aria-label="Pick a date"
          />
          {pagination && !pagination.isToday ? (
            <Link
              to={`/pools/${pagination.next}`}
              className="card flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {pagination.next} <ChevronRightIcon width={14} height={14} />
            </Link>
          ) : null}
        </div>
      </header>

      <section className="card p-4">
        <h2 className="mb-3 text-sm font-semibold">
          Share of {formatInt(data.n_blocks_mined)} blocks found
        </h2>
        <PoolShareBars pools={pools} totalBlocks={data.n_blocks_mined} />
      </section>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[44rem]">
          <thead className="border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="th-cell">Pool</th>
              <th className="th-cell text-right">Blocks found</th>
              <th className="th-cell text-right">% of total</th>
              <th className="th-cell text-right">Effective hashrate</th>
              <th className="th-cell">Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {pools.map((pool) => (
              <tr key={pool.address || pool.poolName}>
                <td className="td-cell">
                  {pool.url ? (
                    <a href={pool.url} target="_blank" rel="noreferrer" className="link">
                      {pool.poolName}
                    </a>
                  ) : (
                    pool.poolName
                  )}
                </td>
                <td className="td-cell text-right tabular-nums">{pool.blocks_found}</td>
                <td className="td-cell text-right tabular-nums">{pool.percent_total}%</td>
                <td className="td-cell text-right tabular-nums">
                  {nethash !== undefined
                    ? formatHashrate((parseFloat(pool.percent_total) / 100) * nethash)
                    : '—'}
                </td>
                <td className="td-cell">
                  {pool.address ? <AddressLink address={pool.address} shorten /> : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

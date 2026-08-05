import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatInt } from '../lib/format';
import { AddressLink } from '../components/AddressLink';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';
import { SearchIcon } from '../components/icons';

const PAGE_SIZE = 50;
const TIERS = ['CUMULUS', 'NIMBUS', 'STRATUS'] as const;

const TIER_STYLES: Record<string, string> = {
  CUMULUS: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  NIMBUS: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  STRATUS: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
};

export function FluxNodes() {
  const [tierFilter, setTierFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data, error, isPending } = useQuery({
    queryKey: ['flux-nodes'],
    queryFn: api.fluxNodes,
    staleTime: 60_000,
  });

  const nodes = useMemo(() => data?.fluxNodes ?? [], [data]);

  const tierCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const node of nodes) counts[node.tier] = (counts[node.tier] ?? 0) + 1;
    return counts;
  }, [nodes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return nodes.filter(
      (node) =>
        (tierFilter === null || node.tier === tierFilter) &&
        (q === '' ||
          node.payment_address.toLowerCase().includes(q) ||
          node.ip.toLowerCase().includes(q) ||
          node.txhash.toLowerCase().includes(q)),
    );
  }, [nodes, tierFilter, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pages - 1);
  const visible = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  if (isPending) return <LoadingPanel label="Loading FluxNodes… (large list, one moment)" />;
  if (error) return <ErrorPanel title="Could not load FluxNodes" detail={String(error)} />;

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold">
          FluxNodes{' '}
          <span className="font-normal text-slate-500 dark:text-slate-400">
            ({formatInt(nodes.length)})
          </span>
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTierFilter(null);
              setPage(0);
            }}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              tierFilter === null
                ? 'bg-flux-600 text-white'
                : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            All {formatInt(nodes.length)}
          </button>
          {TIERS.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => {
                setTierFilter(tier === tierFilter ? null : tier);
                setPage(0);
              }}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                tierFilter === tier
                  ? 'bg-flux-600 text-white'
                  : (TIER_STYLES[tier] ?? 'bg-slate-200 dark:bg-slate-800')
              }`}
            >
              {tier} {formatInt(tierCounts[tier] ?? 0)}
            </button>
          ))}
        </div>
      </header>

      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 focus-within:border-flux-500 dark:border-slate-700 dark:bg-slate-900">
        <SearchIcon className="shrink-0 text-slate-400" width={16} height={16} />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Filter by payment address, IP or collateral tx"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          spellCheck={false}
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[52rem]">
          <thead className="border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="th-cell">Payment address</th>
              <th className="th-cell">Tier</th>
              <th className="th-cell">IP</th>
              <th className="th-cell">Network</th>
              <th className="th-cell text-right">Added</th>
              <th className="th-cell text-right">Last paid</th>
              <th className="th-cell">Collateral</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {visible.map((node) => (
              <tr
                key={`${node.txhash}-${node.outidx}`}
                className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <td className="td-cell">
                  <AddressLink address={node.payment_address} shorten />
                </td>
                <td className="td-cell">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${TIER_STYLES[node.tier] ?? 'bg-slate-200 dark:bg-slate-800'}`}
                  >
                    {node.tier}
                  </span>
                </td>
                <td className="td-cell font-mono text-xs">{node.ip}</td>
                <td className="td-cell text-slate-500 dark:text-slate-400">{node.network}</td>
                <td className="td-cell text-right">
                  <Link to={`/block-index/${node.added_height}`} className="link tabular-nums">
                    {formatInt(node.added_height)}
                  </Link>
                </td>
                <td className="td-cell text-right">
                  <Link to={`/block-index/${node.last_paid_height}`} className="link tabular-nums">
                    {formatInt(node.last_paid_height)}
                  </Link>
                </td>
                <td className="td-cell">
                  <Link to={`/tx/${node.txhash}`} className="hash link">
                    {node.txhash.slice(0, 10)}…
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500 dark:text-slate-400">
          {formatInt(filtered.length)} nodes · page {currentPage + 1} of {formatInt(pages)}
        </span>
        <span className="flex gap-2">
          <button
            type="button"
            disabled={currentPage === 0}
            onClick={() => setPage(currentPage - 1)}
            className="card cursor-pointer px-3 py-1.5 font-medium disabled:cursor-default disabled:opacity-40"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={currentPage >= pages - 1}
            onClick={() => setPage(currentPage + 1)}
            className="card cursor-pointer px-3 py-1.5 font-medium disabled:cursor-default disabled:opacity-40"
          >
            Next
          </button>
        </span>
      </div>
    </div>
  );
}

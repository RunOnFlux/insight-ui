import { Link } from 'react-router-dom';
import type { PoolStat } from '../types/api';
import { formatNumber, shortenHash } from '../lib/format';

/**
 * Sorted horizontal share bars — one row per mining pool / address.
 * Single hue by design: identity is carried by the row label, not color.
 */
export function PoolShareBars({ pools, totalBlocks }: { pools: PoolStat[]; totalBlocks: number }) {
  if (pools.length === 0 || totalBlocks === 0) {
    return (
      <p className="p-6 text-center text-sm text-slate-500 dark:text-slate-400">
        No blocks found in this period.
      </p>
    );
  }

  const sorted = [...pools].sort((a, b) => b.blocks_found - a.blocks_found);
  const maxShare = Math.max(...sorted.map((p) => parseFloat(p.percent_total)));

  return (
    <div className="space-y-2">
      {sorted.map((pool) => {
        const share = parseFloat(pool.percent_total);
        return (
          <div
            key={pool.address || pool.poolName}
            className="grid grid-cols-[10rem_1fr_auto] items-center gap-3 text-sm"
          >
            <span className="truncate">
              {pool.url ? (
                <a href={pool.url} target="_blank" rel="noreferrer" className="link">
                  {pool.poolName}
                </a>
              ) : pool.address ? (
                <Link to={`/address/${pool.address}`} className="link" title={pool.address}>
                  {pool.poolName !== 'Unknown' ? pool.poolName : shortenHash(pool.address, 6)}
                </Link>
              ) : (
                pool.poolName
              )}
            </span>
            <div className="h-4 overflow-hidden rounded-r bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-r bg-flux-500 dark:bg-flux-400"
                style={{ width: `${maxShare > 0 ? (share / maxShare) * 100 : 0}%` }}
                title={`${pool.blocks_found} blocks (${pool.percent_total}%)`}
              />
            </div>
            <span className="w-28 text-right text-xs text-slate-500 tabular-nums dark:text-slate-400">
              {pool.blocks_found} · {formatNumber(share, 2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

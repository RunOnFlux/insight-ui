import { Link } from 'react-router-dom';
import type { BlockSummary } from '../types/api';
import { formatBytes, formatDateTime, timeAgo } from '../lib/format';
import { AddressLink } from './AddressLink';
import { EmptyState } from './Feedback';

function MinedBy({ block }: { block: BlockSummary }) {
  if (block.poolInfo?.poolName) {
    return block.poolInfo.url ? (
      <a href={block.poolInfo.url} target="_blank" rel="noreferrer" className="link">
        {block.poolInfo.poolName}
      </a>
    ) : (
      <span>{block.poolInfo.poolName}</span>
    );
  }
  if (block.minedBy) {
    return <AddressLink address={block.minedBy} shorten />;
  }
  return <span className="text-slate-400">Unknown</span>;
}

export function BlocksTable({
  blocks,
  emptyLabel = 'No blocks found.',
}: {
  blocks: BlockSummary[];
  emptyLabel?: string;
}) {
  if (blocks.length === 0) {
    return (
      <div className="card">
        <EmptyState>{emptyLabel}</EmptyState>
      </div>
    );
  }

  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[36rem]">
        <thead className="border-b border-slate-100 dark:border-slate-800">
          <tr>
            <th className="th-cell">Height</th>
            <th className="th-cell">Age</th>
            <th className="th-cell">Hash</th>
            <th className="th-cell text-right">Txs</th>
            <th className="th-cell">Mined by</th>
            <th className="th-cell text-right">Size</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
          {blocks.map((block) => (
            <tr
              key={block.hash}
              className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
            >
              <td className="td-cell">
                <Link to={`/block/${block.hash}`} className="link font-medium tabular-nums">
                  {block.height.toLocaleString()}
                </Link>
              </td>
              <td className="td-cell text-slate-500 dark:text-slate-400">
                <span title={formatDateTime(block.time)}>{timeAgo(block.time)}</span>
              </td>
              <td className="td-cell">
                <Link to={`/block/${block.hash}`} className="hash link">
                  {block.hash.slice(0, 10)}…{block.hash.slice(-6)}
                </Link>
              </td>
              <td className="td-cell text-right tabular-nums">{block.txlength}</td>
              <td className="td-cell">
                <MinedBy block={block} />
              </td>
              <td className="td-cell text-right text-slate-500 tabular-nums dark:text-slate-400">
                {formatBytes(block.size)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

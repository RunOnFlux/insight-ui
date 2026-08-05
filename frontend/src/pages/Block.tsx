import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';
import { formatBytes, formatDateTime, formatInt, formatNumber } from '../lib/format';
import { AddressLink } from '../components/AddressLink';
import { CopyButton } from '../components/CopyButton';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';
import { TxList } from '../components/TxList';
import { ChevronLeftIcon, ChevronRightIcon } from '../components/icons';
import type { ReactNode } from 'react';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
      <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="min-w-0 text-right text-sm">{children}</dd>
    </div>
  );
}

export function Block() {
  const { blockHash = '' } = useParams();
  const { convert } = useCurrency();

  const {
    data: block,
    error,
    isPending,
  } = useQuery({
    queryKey: ['block', blockHash],
    queryFn: () => api.block(blockHash),
  });

  if (isPending) return <LoadingPanel label="Loading block…" />;
  if (error || !block) {
    return <ErrorPanel title="Block not found" detail={blockHash} />;
  }

  const isPON = block.isPON ?? block.version >= 100;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold">
            Block{' '}
            <span className="text-flux-600 tabular-nums dark:text-flux-400">
              #{formatInt(block.height)}
            </span>
            {!block.isMainChain ? (
              <span className="ml-2 rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-500">
                Orphaned
              </span>
            ) : null}
            <span className="ml-2 rounded-full bg-flux-500/10 px-2.5 py-1 text-xs font-semibold text-flux-600 dark:text-flux-300">
              {block.blockType ?? (isPON ? 'Proof of Node' : 'Proof of Work')}
            </span>
          </h1>
          <p className="hash mt-1 text-slate-500 dark:text-slate-400">
            {block.hash} <CopyButton value={block.hash} />
          </p>
        </div>
        <nav className="flex items-center gap-2">
          {block.previousblockhash ? (
            <Link
              to={`/block/${block.previousblockhash}`}
              className="card flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeftIcon width={14} height={14} /> {formatInt(block.height - 1)}
            </Link>
          ) : null}
          {block.nextblockhash ? (
            <Link
              to={`/block/${block.nextblockhash}`}
              className="card flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              {formatInt(block.height + 1)} <ChevronRightIcon width={14} height={14} />
            </Link>
          ) : null}
        </nav>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <dl className="card divide-y divide-slate-100 px-4 py-2 dark:divide-slate-800/70">
          <Row label="Transactions">{block.tx.length}</Row>
          <Row label="Block reward">{convert(block.reward)}</Row>
          <Row label="Timestamp">{formatDateTime(block.time)}</Row>
          <Row label="Mined by">
            {block.poolInfo?.poolName ? (
              block.poolInfo.url ? (
                <a href={block.poolInfo.url} target="_blank" rel="noreferrer" className="link">
                  {block.poolInfo.poolName}
                </a>
              ) : (
                block.poolInfo.poolName
              )
            ) : block.minedBy ? (
              <AddressLink address={block.minedBy} />
            ) : (
              'Unknown'
            )}
          </Row>
          {block.minedBy && block.poolInfo?.poolName ? (
            <Row label="Miner address">
              <AddressLink address={block.minedBy} />
            </Row>
          ) : null}
          <Row label="Merkle root">
            <span className="hash">
              {block.merkleroot} <CopyButton value={block.merkleroot} />
            </span>
          </Row>
          <Row label="Confirmations">{formatInt(block.confirmations)}</Row>
        </dl>

        <dl className="card divide-y divide-slate-100 px-4 py-2 dark:divide-slate-800/70">
          <Row label="Difficulty">{formatNumber(block.difficulty, 8)}</Row>
          <Row label="Bits">
            <span className="font-mono">{block.bits}</span>
          </Row>
          <Row label="Size">{formatBytes(block.size)}</Row>
          <Row label="Version">{block.version}</Row>
          {!isPON && block.nonce !== undefined ? (
            <Row label="Nonce">
              <span className="hash">
                {String(block.nonce)} <CopyButton value={String(block.nonce)} />
              </span>
            </Row>
          ) : null}
          {!isPON && block.solution ? (
            <Row label="Solution">
              <span className="hash">
                {block.solution.slice(0, 24)}… <CopyButton value={block.solution} />
              </span>
            </Row>
          ) : null}
          {isPON && block.nodesCollateral ? (
            <Row label="Node collateral">
              <Link to={`/tx/${block.nodesCollateral.hash}`} className="hash link">
                {block.nodesCollateral.hash}:{block.nodesCollateral.index}
              </Link>
            </Row>
          ) : null}
          {isPON && block.blockSignature ? (
            <Row label="Block signature">
              <span className="hash">
                {block.blockSignature.slice(0, 24)}… <CopyButton value={block.blockSignature} />
              </span>
            </Row>
          ) : null}
        </dl>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Transactions <span className="text-slate-400">({block.tx.length})</span>
        </h2>
        <TxList source={{ block: block.hash }} />
      </section>
    </div>
  );
}

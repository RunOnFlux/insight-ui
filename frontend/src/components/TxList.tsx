import { useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Tx } from '../types/api';
import { TxCard } from './TxCard';
import { EmptyState, ErrorPanel, LoadingPanel, Spinner } from './Feedback';

interface TxListProps {
  source: { block: string } | { address: string };
  currentAddr?: string;
  /** Live transactions prepended by the caller (e.g. from the address socket). */
  liveTxs?: Tx[];
}

export function TxList({ source, currentAddr, liveTxs = [] }: TxListProps) {
  const key = 'block' in source ? ['block-txs', source.block] : ['address-txs', source.address];

  const { data, error, fetchNextPage, hasNextPage, isFetchingNextPage, isPending } =
    useInfiniteQuery({
      queryKey: key,
      queryFn: ({ pageParam }) =>
        'block' in source
          ? api.blockTxs(source.block, pageParam)
          : api.addressTxs(source.address, pageParam),
      initialPageParam: 0,
      getNextPageParam: (lastPage, pages) =>
        pages.length < lastPage.pagesTotal ? pages.length : undefined,
    });

  if (isPending) return <LoadingPanel label="Loading transactions…" />;
  if (error) return <ErrorPanel title="Could not load transactions" detail={String(error)} />;

  const seen = new Set(liveTxs.map((tx) => tx.txid));
  const txs = data.pages.flatMap((page) => page.txs.filter((tx) => !seen.has(tx.txid)));
  const all = [...liveTxs, ...txs];

  if (all.length === 0) {
    return (
      <div className="card">
        <EmptyState>No transactions found.</EmptyState>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {all.map((tx) => (
        <TxCard key={tx.txid} tx={tx} currentAddr={currentAddr} />
      ))}
      {hasNextPage ? (
        <button
          type="button"
          onClick={() => void fetchNextPage()}
          disabled={isFetchingNextPage}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white py-3 text-sm font-medium text-flux-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-flux-400 dark:hover:bg-slate-800"
        >
          {isFetchingNextPage ? <Spinner /> : null}
          {isFetchingNextPage ? 'Loading…' : 'Load more transactions'}
        </button>
      ) : null}
    </div>
  );
}

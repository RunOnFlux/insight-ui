import { useCallback, useRef, useState } from 'react';
import { api } from '../lib/api';
import type { Tx } from '../types/api';

export const HISTORY_CAP_PAGES = 30; // 10 txs per page → up to 300 transactions

interface HistoryState {
  status: 'idle' | 'loading' | 'done' | 'error';
  /** Newest-first, exactly as the API pages them. */
  txs: Tx[];
  /** True when every transaction of the address was fetched (not capped). */
  complete: boolean;
  loadedPages: number;
}

/**
 * Lazily fetch an address's transaction pages (newest first) up to a cap,
 * for the balance-history chart and CSV export.
 */
export function useAddressTxHistory(addr: string): HistoryState & { start: () => void } {
  const [state, setState] = useState<HistoryState>({
    status: 'idle',
    txs: [],
    complete: false,
    loadedPages: 0,
  });
  const running = useRef(false);

  const start = useCallback(() => {
    if (running.current) return;
    running.current = true;
    setState({ status: 'loading', txs: [], complete: false, loadedPages: 0 });
    void (async () => {
      const all: Tx[] = [];
      try {
        let page = 0;
        let pagesTotal = 1;
        while (page < pagesTotal && page < HISTORY_CAP_PAGES) {
          const res = await api.addressTxs(addr, page);
          pagesTotal = res.pagesTotal;
          all.push(...res.txs);
          page += 1;
          setState({ status: 'loading', txs: [...all], complete: false, loadedPages: page });
        }
        setState({
          status: 'done',
          txs: all,
          complete: pagesTotal <= HISTORY_CAP_PAGES,
          loadedPages: page,
        });
      } catch {
        setState((s) => ({ ...s, status: all.length > 0 ? 'done' : 'error' }));
      } finally {
        running.current = false;
      }
    })();
  }, [addr]);

  return { ...state, start };
}

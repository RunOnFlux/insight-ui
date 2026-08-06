import { useMemo } from 'react';
import dayjs from 'dayjs';
import { addressDelta } from '../lib/txDisplay';
import { formatFluxExact, formatInt } from '../lib/format';
import { buildAddressCsv, CSV_FORMATS } from '../lib/addressCsv';
import type { AddressHistoryRow, CsvFormat } from '../lib/addressCsv';
import { HISTORY_CAP_PAGES, useAddressTxHistory } from '../hooks/useAddressTxHistory';
import { LineChart } from './LineChart';
import { Spinner } from './Feedback';
import type { Tx } from '../types/api';

/** Walk newest→oldest from the known balance to reconstruct exact balances. */
function buildRows(txs: Tx[], addr: string, currentBalance: number): AddressHistoryRow[] {
  const rows: AddressHistoryRow[] = [];
  let balance = currentBalance;
  for (const tx of txs) {
    const delta = addressDelta(tx, addr);
    rows.push({ tx, delta, balanceAfter: balance });
    balance -= delta;
  }
  return rows;
}

function downloadCsv(format: CsvFormat, addr: string, rows: AddressHistoryRow[]): void {
  const { filename, content } = buildAddressCsv(format, addr, rows);
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function AddressHistory({
  addr,
  balance,
  txCount,
}: {
  addr: string;
  balance: number;
  txCount: number;
}) {
  const history = useAddressTxHistory(addr);

  const rows = useMemo(() => buildRows(history.txs, addr, balance), [history.txs, addr, balance]);

  const chartData = useMemo(
    () =>
      [...rows]
        .reverse()
        .filter(({ tx }) => (tx.time ?? tx.blocktime) !== undefined)
        .map(({ tx, balanceAfter }) => ({
          date: dayjs.unix((tx.time ?? tx.blocktime)!).format('YYYY-MM-DD'),
          value: balanceAfter,
        })),
    [rows],
  );

  const capTxs = Math.min(txCount, HISTORY_CAP_PAGES * 10);

  return (
    <section className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          Balance history{' '}
          {history.status === 'done' && !history.complete ? (
            <span className="font-normal text-slate-400 dark:text-slate-500">
              (last {formatInt(history.txs.length)} of {formatInt(txCount)} transactions)
            </span>
          ) : null}
        </h2>
        <div className="flex items-center gap-2">
          {history.status === 'idle' ? (
            <button
              type="button"
              onClick={history.start}
              className="cursor-pointer rounded-lg bg-flux-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-flux-500"
            >
              Load history ({formatInt(capTxs)} txs)
            </button>
          ) : null}
          {history.status === 'loading' ? (
            <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Spinner /> {formatInt(history.txs.length)} transactions loaded…
            </span>
          ) : null}
          {history.status === 'done'
            ? CSV_FORMATS.map(({ format, label }) => (
                <button
                  key={format}
                  type="button"
                  onClick={() => downloadCsv(format, addr, rows)}
                  title={
                    format === 'koinly'
                      ? 'Koinly universal format — import directly at koinly.io'
                      : 'Full transaction export with running balance'
                  }
                  className="cursor-pointer rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-flux-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-flux-400 dark:hover:bg-slate-800"
                >
                  {label}
                </button>
              ))
            : null}
        </div>
      </div>
      {history.status === 'error' ? (
        <p className="mt-3 text-sm text-red-500">Could not load the transaction history.</p>
      ) : null}
      {history.status === 'done' && chartData.length > 1 ? (
        <div className="mt-3">
          <LineChart
            data={chartData}
            formatValue={(v) => formatFluxExact(Math.round(v * 100) / 100)}
            height={240}
          />
        </div>
      ) : null}
      {history.status === 'done' && chartData.length <= 1 ? (
        <p className="mt-3 text-sm text-slate-400 dark:text-slate-500">
          Not enough confirmed transactions to draw a balance history.
        </p>
      ) : null}
    </section>
  );
}

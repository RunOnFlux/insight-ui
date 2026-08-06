import type { Tx } from '../types/api';

export interface AddressHistoryRow {
  tx: Tx;
  /** Net FLUX change for the address (negative = sent; includes the fee). */
  delta: number;
  balanceAfter: number;
}

export type CsvFormat = 'standard' | 'koinly';

export const CSV_FORMATS: { format: CsvFormat; label: string }[] = [
  { format: 'standard', label: 'CSV' },
  { format: 'koinly', label: 'Koinly CSV' },
];

function csvField(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function line(fields: (string | number)[]): string {
  return fields.map(csvField).join(',');
}

/** "YYYY-MM-DD HH:mm UTC" — the date form Koinly documents for custom files. */
function koinlyDate(unixSeconds: number): string {
  return `${new Date(unixSeconds * 1000).toISOString().slice(0, 16).replace('T', ' ')} UTC`;
}

/** True when every parsed input of the tx belongs to the address. */
function paidAllInputs(tx: Tx, addr: string): boolean {
  const real = tx.vin.filter((vin) => vin.coinbase === undefined);
  return real.length > 0 && real.every((vin) => vin.addr === addr);
}

function buildStandard(rows: AddressHistoryRow[]): string {
  const header =
    'txid,timestamp,block_height,confirmations,direction,type,amount_flux,fee_flux,balance_after_flux';
  const lines = rows.map(({ tx, delta, balanceAfter }) => {
    const ts = tx.time ?? tx.blocktime;
    const type = tx.isCoinBase
      ? 'coinbase'
      : tx.version === 5 || tx.version === 6
        ? 'fluxnode'
        : 'transfer';
    return line([
      tx.txid,
      ts !== undefined ? new Date(ts * 1000).toISOString() : '',
      tx.blockheight ?? '',
      tx.confirmations,
      delta >= 0 ? 'in' : 'out',
      type,
      delta.toFixed(8),
      tx.fees !== undefined ? tx.fees.toFixed(8) : '',
      balanceAfter.toFixed(8),
    ]);
  });
  return `${header}\n${lines.join('\n')}\n`;
}

/**
 * Koinly universal custom-file format:
 * https://support.koinly.io — "Create a custom CSV file with your data".
 * One row per transaction that changed the address balance. When the address
 * funded every input, the on-chain fee is split out (Koinly wants Sent Amount
 * excluding fees); otherwise the net delta is reported as sent.
 */
function buildKoinly(addr: string, rows: AddressHistoryRow[]): string {
  const header =
    'Date,Sent Amount,Sent Currency,Received Amount,Received Currency,Fee Amount,Fee Currency,' +
    'Net Worth Amount,Net Worth Currency,Label,Description,TxHash';
  const lines: string[] = [];
  // Koinly convention: oldest transaction first.
  for (const { tx, delta } of [...rows].reverse()) {
    if (delta === 0) continue; // FluxNode confirmations and other no-op txs
    const ts = tx.time ?? tx.blocktime;
    if (ts === undefined) continue;

    let sent = '';
    let sentCurrency = '';
    let received = '';
    let receivedCurrency = '';
    let fee = '';
    let feeCurrency = '';
    let label = '';
    let description = '';

    if (delta > 0) {
      received = delta.toFixed(8);
      receivedCurrency = 'FLUX';
      if (tx.isCoinBase) {
        label = 'mining';
        description = 'Flux block reward';
      }
    } else {
      const gross = -delta;
      if (tx.fees !== undefined && tx.fees > 0 && tx.fees < gross && paidAllInputs(tx, addr)) {
        sent = (gross - tx.fees).toFixed(8);
        fee = tx.fees.toFixed(8);
        feeCurrency = 'FLUX';
      } else {
        sent = gross.toFixed(8);
      }
      sentCurrency = 'FLUX';
    }

    lines.push(
      line([
        koinlyDate(ts),
        sent,
        sentCurrency,
        received,
        receivedCurrency,
        fee,
        feeCurrency,
        '', // Net Worth Amount — left for Koinly to price
        '',
        label,
        description,
        tx.txid,
      ]),
    );
  }
  return `${header}\n${lines.join('\n')}\n`;
}

export function buildAddressCsv(
  format: CsvFormat,
  addr: string,
  rows: AddressHistoryRow[],
): { filename: string; content: string } {
  if (format === 'koinly') {
    return {
      filename: `flux-${addr}-koinly.csv`,
      content: buildKoinly(addr, rows),
    };
  }
  return {
    filename: `flux-${addr}-transactions.csv`,
    content: buildStandard(rows),
  };
}

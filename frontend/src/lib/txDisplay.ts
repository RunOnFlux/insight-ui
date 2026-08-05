import type { Tx, Vin, Vout } from '../types/api';

const COIN = 100_000_000;

export interface AggregatedEntry {
  address: string;
  /** True for unparsed/OP_RETURN pseudo-addresses that must not link anywhere. */
  notAddr: boolean;
  value: number;
  count: number;
  isSpent?: boolean;
  spentTxId?: string | null;
  spentIndex?: number | null;
  unconfirmedInput?: boolean;
  doubleSpentTxID?: string | null;
}

export function isFluxNodeTx(tx: Tx): boolean {
  return tx.version === 5 || tx.version === 6;
}

/** Decode the ASCII payload of an OP_RETURN script (stops at a NUL byte). */
export function decodeOpReturn(asm: string): string | null {
  if (!asm.startsWith('OP_RETURN ')) return null;
  const hex = asm.slice('OP_RETURN '.length).split(' ')[0] ?? '';
  let out = '';
  for (let i = 0; i + 1 < hex.length; i += 2) {
    const byte = parseInt(hex.slice(i, i + 2), 16);
    if (Number.isNaN(byte) || byte === 0) break;
    out += String.fromCharCode(byte);
  }
  return out;
}

/** Group inputs by address, mirroring the legacy aggregation semantics. */
export function aggregateVin(vins: Vin[]): AggregatedEntry[] {
  const byAddress = new Map<string, AggregatedEntry>();
  const result: AggregatedEntry[] = [];
  let unparsed = 0;

  for (const vin of vins) {
    if (vin.coinbase !== undefined) continue;
    if (!vin.addr) {
      unparsed += 1;
      result.push({
        address: `Unparsed address [${unparsed}]`,
        notAddr: true,
        value: vin.value ?? (vin.valueSat ?? 0) / COIN,
        count: 1,
        unconfirmedInput: vin.unconfirmedInput,
        doubleSpentTxID: vin.doubleSpentTxID,
      });
      continue;
    }
    const value = vin.value ?? (vin.valueSat ?? 0) / COIN;
    const existing = byAddress.get(vin.addr);
    if (existing) {
      existing.value += value;
      existing.count += 1;
      existing.unconfirmedInput = existing.unconfirmedInput || vin.unconfirmedInput;
      existing.doubleSpentTxID = existing.doubleSpentTxID ?? vin.doubleSpentTxID;
    } else {
      const entry: AggregatedEntry = {
        address: vin.addr,
        notAddr: false,
        value,
        count: 1,
        unconfirmedInput: vin.unconfirmedInput,
        doubleSpentTxID: vin.doubleSpentTxID,
      };
      byAddress.set(vin.addr, entry);
      result.push(entry);
    }
  }
  return result;
}

/** Group outputs by address, mirroring the legacy aggregation semantics. */
export function aggregateVout(vouts: Vout[]): AggregatedEntry[] {
  const byAddress = new Map<string, AggregatedEntry>();
  const result: AggregatedEntry[] = [];
  let unparsed = 0;

  for (const vout of vouts) {
    const value = parseFloat(vout.value);
    const addresses = vout.scriptPubKey.addresses;
    if (!addresses || addresses.length === 0) {
      const opReturn = decodeOpReturn(vout.scriptPubKey.asm);
      unparsed += 1;
      result.push({
        address:
          opReturn !== null
            ? `OP_RETURN${opReturn ? `: ${opReturn}` : ''}`
            : `Unparsed address [${unparsed}]`,
        notAddr: true,
        value,
        count: 1,
        isSpent: vout.spentTxId !== null,
        spentTxId: vout.spentTxId,
        spentIndex: vout.spentIndex,
      });
      continue;
    }
    const address = addresses.join(', ');
    const existing = addresses.length === 1 ? byAddress.get(address) : undefined;
    if (existing) {
      existing.value = (Math.round(existing.value * COIN) + Math.round(value * COIN)) / COIN;
      existing.count += 1;
      existing.isSpent = vout.spentTxId !== null;
      existing.spentTxId = vout.spentTxId;
      existing.spentIndex = vout.spentIndex;
    } else {
      const entry: AggregatedEntry = {
        address,
        notAddr: false,
        value,
        count: 1,
        isSpent: vout.spentTxId !== null,
        spentTxId: vout.spentTxId,
        spentIndex: vout.spentIndex,
      };
      if (addresses.length === 1) byAddress.set(address, entry);
      result.push(entry);
    }
  }
  return result;
}

export function feeRatePerKb(tx: Tx): number | undefined {
  if (tx.fees === undefined || !tx.size) return undefined;
  return (tx.fees * 1000) / tx.size;
}

export interface FluxNodeField {
  label: string;
  value: string;
  kind?: 'tx-link' | 'timestamp' | 'mono';
}

/** Field table for FluxNode transactions (version 5/6), per legacy display rules. */
export function fluxNodeFields(tx: Tx): FluxNodeField[] {
  const fields: FluxNodeField[] = [];
  const v6 = tx.version === 6;
  const txv = tx.nFluxNodeTxVersion ?? 0;

  if (tx.type) fields.push({ label: 'Type', value: tx.type });
  if (tx.collateralOutputHash) {
    fields.push({
      label: 'Collateral',
      value: `${tx.collateralOutputHash}:${tx.collateralOutputIndex ?? 0}`,
      kind: 'tx-link',
    });
  }
  if (tx.sig) fields.push({ label: 'Signature', value: tx.sig, kind: 'mono' });
  if (tx.sigTime) {
    fields.push({ label: 'Signature time', value: String(tx.sigTime), kind: 'timestamp' });
  }
  const showCollateralPubKey = tx.nType === 2 && (tx.version === 5 || (v6 && (txv & 0x01) !== 0));
  if (showCollateralPubKey && tx.collateralPubKey) {
    fields.push({ label: 'Collateral Public Key', value: tx.collateralPubKey, kind: 'mono' });
  }
  const nodePubKey = tx.fluxnodePubKey ?? tx.zelnodePubKey;
  if (tx.nType === 2 && nodePubKey) {
    fields.push({ label: 'FluxNode Public Key', value: nodePubKey, kind: 'mono' });
  }
  if (v6 && (txv & 0x02) !== 0 && tx.redeemScript) {
    fields.push({ label: 'Redeem Script', value: tx.redeemScript, kind: 'mono' });
  }
  if (tx.nType === 4) {
    if (tx.ip) fields.push({ label: 'FluxNode Network', value: tx.ip });
    if (tx.updateType !== undefined) {
      fields.push({ label: 'Update Type', value: String(tx.updateType) });
    }
    if (tx.benchmarkTier) fields.push({ label: 'Benchmark Tier', value: tx.benchmarkTier });
    if (tx.benchmarkSig) {
      fields.push({ label: 'Benchmark Signature', value: tx.benchmarkSig, kind: 'mono' });
    }
    if (tx.benchmarkSigTime) {
      fields.push({
        label: 'Benchmark Signature Time',
        value: String(tx.benchmarkSigTime),
        kind: 'timestamp',
      });
    }
  }
  if (tx.hasDelegates) {
    fields.push({ label: 'Has Delegates', value: 'Yes' });
    if (tx.delegateData?.delegates) {
      fields.push({ label: 'Delegate Count', value: String(tx.delegateData.delegates.length) });
    }
  }
  return fields;
}

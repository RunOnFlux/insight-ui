import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useCurrency } from '../context/CurrencyContext';
import { formatBytes, formatDateTime, formatFlux, formatInt } from '../lib/format';
import { feeRatePerKb, isFluxNodeTx } from '../lib/txDisplay';
import { CopyButton } from '../components/CopyButton';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';
import { TxCard } from '../components/TxCard';
import { AddressLink } from '../components/AddressLink';
import { EcosystemPromos } from '../components/EcosystemPromos';
import { usePageTitle } from '../hooks/usePageTitle';
import type { ReactNode } from 'react';
import type { Tx } from '../types/api';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
      <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="min-w-0 text-right text-sm">{children}</dd>
    </div>
  );
}

function RawScripts({ tx }: { tx: Tx }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="card p-4">
      <button
        type="button"
        className="link cursor-pointer text-sm font-medium"
        onClick={() => setOpen((o) => !o)}
      >
        {open ? 'Hide' : 'Show'} raw scripts
      </button>
      {open ? (
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <div className="min-w-0 space-y-4">
            <h3 className="text-sm font-semibold">Inputs</h3>
            {tx.vin.map((vin) => (
              <div key={vin.n} className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
                <p className="mb-1 flex items-center justify-between font-medium">
                  <span>#{vin.n}</span>
                  {vin.txid !== undefined && vin.vout !== undefined ? (
                    <Link to={`/tx/${vin.txid}/%3E/${vin.vout}`} className="link">
                      outpoint {vin.txid.slice(0, 12)}…:{vin.vout}
                    </Link>
                  ) : null}
                </p>
                {vin.addr ? <AddressLink address={vin.addr} className="text-xs" /> : null}
                {vin.coinbase !== undefined ? (
                  <p className="hash mt-1">
                    coinbase {vin.coinbase} <CopyButton value={vin.coinbase} />
                  </p>
                ) : null}
                {vin.scriptSig ? <p className="hash mt-1">{vin.scriptSig.asm}</p> : null}
              </div>
            ))}
          </div>
          <div className="min-w-0 space-y-4">
            <h3 className="text-sm font-semibold">Outputs</h3>
            {tx.vout.map((vout) => (
              <div key={vout.n} className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
                <p className="mb-1 flex items-center justify-between gap-2 font-medium">
                  <span>
                    #{vout.n} · {formatFlux(parseFloat(vout.value))} ·{' '}
                    {vout.scriptPubKey.type ?? 'unknown'}
                  </span>
                  {vout.spentTxId ? (
                    <Link to={`/tx/${vout.spentTxId}/%3C/${vout.spentIndex ?? 0}`} className="link">
                      spent
                    </Link>
                  ) : (
                    <span className="text-emerald-500">unspent</span>
                  )}
                </p>
                {vout.scriptPubKey.addresses?.map((addr) => (
                  <AddressLink key={addr} address={addr} className="text-xs" />
                ))}
                <p className="hash mt-1">{vout.scriptPubKey.asm}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function Transaction() {
  const { txId = '' } = useParams();
  usePageTitle(`Tx ${txId.slice(0, 12)}…`);
  const { convert } = useCurrency();

  const {
    data: tx,
    error,
    isPending,
  } = useQuery({
    queryKey: ['tx', txId],
    queryFn: () => api.tx(txId),
  });

  if (isPending) return <LoadingPanel label="Loading transaction…" />;
  if (error || !tx) return <ErrorPanel title="Transaction not found" detail={txId} />;

  const feeRate = feeRatePerKb(tx);
  const fluxNodeTx = isFluxNodeTx(tx);

  return (
    <div className="space-y-6">
      <header className="min-w-0">
        <h1 className="text-xl font-bold">
          Transaction
          {fluxNodeTx ? (
            <span className="ml-2 rounded-full bg-flux-500/10 px-2.5 py-1 text-xs font-semibold text-flux-600 dark:text-flux-300">
              FluxNode {tx.type ?? `v${tx.version}`}
            </span>
          ) : null}
        </h1>
        <p className="hash mt-1 text-slate-500 dark:text-slate-400">
          {tx.txid} <CopyButton value={tx.txid} />
        </p>
      </header>

      <TxCard tx={tx} />

      <div className="grid gap-4 lg:grid-cols-2">
        <dl className="card divide-y divide-slate-100 px-4 py-2 dark:divide-slate-800/70">
          <Row label="Included in block">
            {tx.blockhash ? (
              <Link to={`/block/${tx.blockhash}`} className="hash link">
                {tx.blockheight !== undefined ? `#${formatInt(tx.blockheight)} · ` : ''}
                {tx.blockhash.slice(0, 16)}…
              </Link>
            ) : (
              <span className="font-medium text-red-500">Unconfirmed</span>
            )}
          </Row>
          <Row label="Confirmations">{formatInt(tx.confirmations)}</Row>
          <Row label="Received time">{tx.time ? formatDateTime(tx.time) : 'N/A'}</Row>
          <Row label="Mined time">{tx.blocktime ? formatDateTime(tx.blocktime) : 'N/A'}</Row>
          <Row label="Size">{formatBytes(tx.size)}</Row>
          {!fluxNodeTx && tx.fees !== undefined ? <Row label="Fee">{convert(tx.fees)}</Row> : null}
          {feeRate !== undefined && !fluxNodeTx ? (
            <Row label="Fee rate">{formatFlux(feeRate)} / kB</Row>
          ) : null}
        </dl>

        <dl className="card divide-y divide-slate-100 px-4 py-2 dark:divide-slate-800/70">
          <Row label="Version">{tx.version}</Row>
          <Row label="LockTime">{tx.locktime}</Row>
          {tx.fOverwintered !== undefined ? (
            <Row label="Overwintered">{tx.fOverwintered ? 'Yes' : 'No'}</Row>
          ) : null}
          {tx.nVersionGroupId !== undefined ? (
            <Row label="Version group id">
              <span className="font-mono">
                0x{tx.nVersionGroupId.toString(16).padStart(8, '0')}
              </span>
            </Row>
          ) : null}
          {tx.nExpiryHeight !== undefined ? (
            <Row label="Expiry height">{formatInt(tx.nExpiryHeight)}</Row>
          ) : null}
          {tx.isCoinBase && tx.vin[0]?.coinbase !== undefined ? (
            <Row label="Coinbase script">
              <span className="hash">
                {tx.vin[0].coinbase} <CopyButton value={tx.vin[0].coinbase} />
              </span>
            </Row>
          ) : null}
          {!fluxNodeTx ? <Row label="Total output">{convert(tx.valueOut)}</Row> : null}
        </dl>
      </div>

      {!fluxNodeTx ? <RawScripts tx={tx} /> : null}

      <EcosystemPromos variant="band" />
    </div>
  );
}

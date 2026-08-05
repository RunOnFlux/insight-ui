import { useCallback, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../lib/api';
import { useSocketRoom } from '../lib/socket';
import { useCurrency } from '../context/CurrencyContext';
import { formatInt } from '../lib/format';
import { addressLabel } from '../lib/labels';
import { CopyButton } from '../components/CopyButton';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';
import { TxList } from '../components/TxList';
import type { Tx } from '../types/api';

export function Address() {
  const { addrStr = '' } = useParams();
  const { convert } = useCurrency();
  const queryClient = useQueryClient();
  const [liveTxs, setLiveTxs] = useState<Tx[]>([]);

  const {
    data: address,
    error,
    isPending,
  } = useQuery({
    queryKey: ['address', addrStr],
    queryFn: () => api.address(addrStr),
  });

  const onAddressTx = useCallback(
    (data: { address: string; txid: string }) => {
      if (data.address !== addrStr) return;
      void api.tx(data.txid).then((tx) => {
        setLiveTxs((prev) => (prev.some((t) => t.txid === tx.txid) ? prev : [tx, ...prev]));
        void queryClient.invalidateQueries({ queryKey: ['address', addrStr] });
      });
    },
    [addrStr, queryClient],
  );

  useSocketRoom('bitcoind/addresstxid', { 'bitcoind/addresstxid': onAddressTx }, [addrStr], true);

  if (isPending) return <LoadingPanel label="Loading address…" />;
  if (error || !address) return <ErrorPanel title="Address not found" detail={addrStr} />;

  const label = addressLabel(addrStr);

  return (
    <div className="space-y-6">
      <header className="min-w-0">
        <h1 className="text-xl font-bold">
          Address
          {label ? (
            <span className="ml-2 rounded-full bg-flux-500/10 px-2.5 py-1 text-xs font-semibold text-flux-600 dark:text-flux-300">
              {label}
            </span>
          ) : null}
        </h1>
        <p className="hash mt-1 text-slate-500 dark:text-slate-400">
          {addrStr} <CopyButton value={addrStr} />
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="card p-4">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Balance
            </p>
            <p className="mt-1 truncate text-lg font-bold tabular-nums">
              {convert(address.balance)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Total received
            </p>
            <p className="mt-1 truncate text-lg font-bold tabular-nums">
              {convert(address.totalReceived)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Total sent
            </p>
            <p className="mt-1 truncate text-lg font-bold tabular-nums">
              {convert(address.totalSent)}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
              Transactions
            </p>
            <p className="mt-1 text-lg font-bold tabular-nums">{formatInt(address.txApperances)}</p>
            {address.unconfirmedTxApperances > 0 ? (
              <p className="text-xs text-amber-500">
                +{address.unconfirmedTxApperances} unconfirmed (
                {convert(address.unconfirmedBalance)})
              </p>
            ) : null}
          </div>
        </div>
        <div className="card flex items-center justify-center p-4">
          <QRCodeSVG value={addrStr} size={112} marginSize={1} className="rounded" />
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Transactions</h2>
        <TxList source={{ address: addrStr }} currentAddr={addrStr} liveTxs={liveTxs} />
      </section>
    </div>
  );
}

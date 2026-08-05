import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatFlux, formatInt, formatNumber, formatUsd } from '../lib/format';
import { AddressLink } from '../components/AddressLink';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';

function DistributionTable() {
  const { data: intervals, error } = useQuery({
    queryKey: ['balance-intervals'],
    queryFn: api.statsBalanceIntervals,
    staleTime: 5 * 60 * 1000,
  });
  const { data: richerThan } = useQuery({
    queryKey: ['richer-than'],
    queryFn: api.statsRicherThan,
    staleTime: 5 * 60 * 1000,
  });
  const { data: markets } = useQuery({ queryKey: ['markets-info'], queryFn: api.marketsInfo });

  if (error) return <ErrorPanel title="Could not load distribution" detail={String(error)} />;
  if (!intervals) return <LoadingPanel label="Loading distribution…" />;

  const totalAddresses = intervals.reduce((acc, i) => acc + i.count, 0);
  const totalCoins = intervals.reduce((acc, i) => acc + i.sum, 0);
  const maxCount = Math.max(1, ...intervals.map((i) => i.count));

  return (
    <div className="space-y-4">
      {richerThan && richerThan.length > 0 ? (
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-slate-100 dark:border-slate-800">
              <tr>
                {richerThan.map((entry) => (
                  <th key={entry.amount_usd} className="th-cell text-right">
                    &gt; {formatUsd(entry.amount_usd)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {richerThan.map((entry) => (
                  <td key={entry.amount_usd} className="td-cell text-right tabular-nums">
                    {formatInt(entry.count_addresses)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <p className="px-4 pb-3 text-xs text-slate-400 dark:text-slate-500">
            Number of addresses holding more than each USD amount
          </p>
        </div>
      ) : null}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[42rem]">
          <thead className="border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="th-cell">Balance range</th>
              <th className="th-cell text-right">Addresses</th>
              <th className="th-cell">% of addresses</th>
              <th className="th-cell text-right">Coins</th>
              <th className="th-cell text-right">USD value</th>
              <th className="th-cell text-right">% of coins</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {intervals.map((interval) => {
              const addrPct = totalAddresses > 0 ? (interval.count / totalAddresses) * 100 : 0;
              const coinPct = totalCoins > 0 ? (interval.sum / totalCoins) * 100 : 0;
              return (
                <tr key={`${interval.min}-${interval.max}`}>
                  <td className="td-cell tabular-nums">
                    {formatInt(interval.min)} – {formatInt(interval.max)} FLUX
                  </td>
                  <td className="td-cell text-right tabular-nums">{formatInt(interval.count)}</td>
                  <td className="td-cell w-48">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-full rounded-full bg-flux-500"
                          style={{ width: `${(interval.count / maxCount) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs tabular-nums">{formatNumber(addrPct, 2)}%</span>
                    </div>
                  </td>
                  <td className="td-cell text-right tabular-nums">
                    {formatInt(Math.round(interval.sum))}
                  </td>
                  <td className="td-cell text-right tabular-nums">
                    {markets ? formatUsd(interval.sum * markets.price) : '—'}
                  </td>
                  <td className="td-cell text-right tabular-nums">{formatNumber(coinPct, 2)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function RichList() {
  const { data, error, isPending } = useQuery({
    queryKey: ['rich-list'],
    queryFn: api.statsRichestAddresses,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="mb-3 text-xl font-bold">Flux distribution</h1>
        <DistributionTable />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Richest addresses</h2>
        {isPending ? <LoadingPanel label="Loading rich list…" /> : null}
        {error ? <ErrorPanel title="Could not load rich list" detail={String(error)} /> : null}
        {data ? (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[40rem]">
              <thead className="border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="th-cell text-right">#</th>
                  <th className="th-cell">Address</th>
                  <th className="th-cell text-right">Balance</th>
                  <th className="th-cell text-right">Blocks mined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {data.map((entry, i) => (
                  <tr
                    key={entry.address}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="td-cell text-right text-slate-400 tabular-nums">{i + 1}</td>
                    <td className="td-cell">
                      <AddressLink address={entry.address} />
                    </td>
                    <td className="td-cell text-right font-medium tabular-nums">
                      {formatFlux(entry.balance)}
                    </td>
                    <td className="td-cell text-right text-slate-500 tabular-nums dark:text-slate-400">
                      {formatInt(entry.blocks_mined ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
}

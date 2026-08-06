import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatInt, formatNumber } from '../lib/format';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';
import type { ReactNode } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { EcosystemPromos } from '../components/EcosystemPromos';

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-2">
      <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="min-w-0 text-right text-sm">{children}</dd>
    </div>
  );
}

export function Status() {
  usePageTitle('Node status');
  const sync = useQuery({ queryKey: ['sync'], queryFn: api.sync, refetchInterval: 10_000 });
  const info = useQuery({ queryKey: ['info'], queryFn: api.info });
  const tips = useQuery({ queryKey: ['last-block-hash'], queryFn: api.lastBlockHash });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Node status</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Synchronization</h2>
        {sync.error ? (
          <ErrorPanel title="Could not get sync information" detail={String(sync.error)} />
        ) : sync.data ? (
          <div className="card p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium capitalize">{sync.data.status}</span>
              <span className="tabular-nums">{sync.data.syncPercentage}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-flux-500 transition-all"
                style={{ width: `${Math.min(100, sync.data.syncPercentage)}%` }}
              />
            </div>
            <dl className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/70">
              <Row label="Chain height">{formatInt(sync.data.blockChainHeight)}</Row>
              <Row label="Synced height">{formatInt(sync.data.height)}</Row>
              <Row label="Sync type">{sync.data.type}</Row>
              {sync.data.error ? (
                <Row label="Error">
                  <span className="text-red-500">{sync.data.error}</span>
                </Row>
              ) : null}
            </dl>
          </div>
        ) : (
          <LoadingPanel />
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Chain tips</h2>
          {tips.error ? (
            <ErrorPanel title="Could not load chain tips" detail={String(tips.error)} />
          ) : tips.data ? (
            <dl className="card divide-y divide-slate-100 px-4 py-2 dark:divide-slate-800/70">
              <Row label="Last block hash (daemon)">
                <Link to={`/block/${tips.data.lastblockhash}`} className="hash link">
                  {tips.data.lastblockhash.slice(0, 20)}…
                </Link>
              </Row>
              <Row label="Blockchain tip (bitcore)">
                <Link to={`/block/${tips.data.syncTipHash}`} className="hash link">
                  {tips.data.syncTipHash.slice(0, 20)}…
                </Link>
              </Row>
            </dl>
          ) : (
            <LoadingPanel />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Daemon information</h2>
          {info.error ? (
            <ErrorPanel title="Could not load node info" detail={String(info.error)} />
          ) : info.data ? (
            <dl className="card divide-y divide-slate-100 px-4 py-2 dark:divide-slate-800/70">
              <Row label="Version">{info.data.info.version}</Row>
              <Row label="Protocol version">{info.data.info.protocolversion}</Row>
              <Row label="Blocks">
                <Link to={`/block-index/${info.data.info.blocks}`} className="link tabular-nums">
                  {formatInt(info.data.info.blocks)}
                </Link>
              </Row>
              <Row label="Time offset">{info.data.info.timeoffset}</Row>
              <Row label="Connections">{info.data.info.connections}</Row>
              <Row label="Difficulty">{formatNumber(info.data.info.difficulty, 8)}</Row>
              <Row label="Network">{info.data.info.network}</Row>
              <Row label="Proxy">{info.data.info.proxy || 'none'}</Row>
              <Row label="Relay fee">{info.data.info.relayfee}</Row>
              {info.data.info.errors ? (
                <Row label="Errors">
                  <span className="text-red-500">{info.data.info.errors}</span>
                </Row>
              ) : null}
            </dl>
          ) : (
            <LoadingPanel />
          )}
        </section>
      </div>

      <EcosystemPromos variant="band" />
    </div>
  );
}

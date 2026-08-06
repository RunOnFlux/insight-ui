import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { ErrorPanel, LoadingPanel } from '../components/Feedback';
import type { PeerInfoEntry } from '../types/api';
import { usePageTitle } from '../hooks/usePageTitle';

function uptimeString(uptime: PeerInfoEntry['uptime']): string {
  if (!uptime) return '—';
  const parts: string[] = [];
  if (uptime.Days) parts.push(`${uptime.Days}d`);
  if (uptime.Hours) parts.push(`${uptime.Hours}h`);
  if (uptime.Minutes) parts.push(`${uptime.Minutes}m`);
  parts.push(`${uptime.Seconds ?? 0}s`);
  return parts.join(' ');
}

export function Network() {
  usePageTitle('Connected nodes');
  const { data, error, isPending } = useQuery({
    queryKey: ['peer-info'],
    queryFn: api.peerInfo,
    refetchInterval: 30_000,
  });

  if (isPending) return <LoadingPanel label="Loading connected nodes…" />;
  if (error) return <ErrorPanel title="Could not load peers" detail={String(error)} />;

  const peers = data?.peerInfo ?? [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">
        Connected nodes{' '}
        <span className="font-normal text-slate-500 dark:text-slate-400">({peers.length})</span>
      </h1>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[36rem]">
          <thead className="border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="th-cell">Address</th>
              <th className="th-cell">Protocol</th>
              <th className="th-cell">Version</th>
              <th className="th-cell text-right">Connected for</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
            {peers.map((peer, i) => (
              <tr key={`${peer.address}-${i}`}>
                <td className="td-cell font-mono text-xs">{peer.address}</td>
                <td className="td-cell">{peer.protocol ?? '—'}</td>
                <td className="td-cell">{peer.version ?? '—'}</td>
                <td className="td-cell text-right tabular-nums">{uptimeString(peer.uptime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

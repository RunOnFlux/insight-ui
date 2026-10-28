import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const fluxFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 8,
});

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const intFormatter = new Intl.NumberFormat('en-US');

/**
 * Fewer decimals as magnitude grows, so large amounts stay short and the
 * unit is never pushed out of view. Use formatFluxExact for full precision.
 */
function adaptiveDecimals(value: number): number {
  const abs = Math.abs(value);
  if (abs >= 100_000) return 2;
  if (abs >= 1_000) return 4;
  return 8;
}

export function formatFlux(value: number): string {
  if (!Number.isFinite(value)) return '—';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: adaptiveDecimals(value),
  }).format(value);
  return `${formatted} FLUX`;
}

export function formatFluxExact(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return `${fluxFormatter.format(value)} FLUX`;
}

export function formatUsd(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return usdFormatter.format(value);
}

export function formatBtc(value: number): string {
  if (!Number.isFinite(value)) return '—';
  if (value !== 0 && Math.abs(value) < 1e-6) return `${value.toFixed(10)} BTC`;
  return `${fluxFormatter.format(value)} BTC`;
}

export function formatInt(value: number): string {
  if (!Number.isFinite(value)) return '—';
  return intFormatter.format(value);
}

export function formatNumber(value: number, maxDecimals = 2): string {
  if (!Number.isFinite(value)) return '—';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: maxDecimals }).format(value);
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${intFormatter.format(bytes)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatHashrate(hashPerSec: number): string {
  if (!Number.isFinite(hashPerSec)) return '—';
  const units = ['H/s', 'kH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s'];
  let value = hashPerSec;
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }
  return `${value.toFixed(2)} ${units[unit]}`;
}

export function timeAgo(unixSeconds: number): string {
  return dayjs.unix(unixSeconds).fromNow();
}

export function formatDateTime(unixSeconds: number): string {
  return dayjs.unix(unixSeconds).format('MMM D, YYYY HH:mm:ss');
}

export function utcDateString(date: Date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function shortenHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 3) return hash;
  return `${hash.slice(0, chars)}…${hash.slice(-chars)}`;
}

import type { ChartPoint } from '../components/LineChart';

/**
 * External, CORS-open data sources used only for supplementary charts.
 * Failures here must never break a page — callers render a fallback note.
 */

const COINGECKO_ID = 'zelcash'; // Flux's CoinGecko id

export async function fetchPriceHistory(days: number | 'all'): Promise<ChartPoint[]> {
  const span = days === 'all' ? 'max' : String(days);
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${COINGECKO_ID}/market_chart?vs_currency=usd&days=${span}&interval=daily`,
  );
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const body = (await res.json()) as { prices: [number, number][] };
  const byDay = new Map<string, number>();
  for (const [ms, price] of body.prices) {
    byDay.set(new Date(ms).toISOString().slice(0, 10), price);
  }
  return [...byDay.entries()].map(([date, value]) => ({ date, value }));
}

export interface NodeHistoryPoint {
  date: string;
  total: number;
  cumulus: number;
  nimbus: number;
  stratus: number;
}

export async function fetchNodeHistory(): Promise<NodeHistoryPoint[]> {
  const res = await fetch('https://stats.runonflux.io/fluxhistorystats');
  if (!res.ok) throw new Error(`Flux stats ${res.status}`);
  const body = (await res.json()) as {
    status: string;
    data: Record<string, { cumulus: number; nimbus: number; stratus: number }>;
  };
  if (body.status !== 'success') throw new Error('Flux stats: bad status');
  // Samples arrive every ~15 minutes — keep the last sample of each UTC day.
  const byDay = new Map<string, NodeHistoryPoint>();
  for (const ts of Object.keys(body.data)
    .map(Number)
    .sort((a, b) => a - b)) {
    const entry = body.data[String(ts)];
    if (!entry) continue;
    const date = new Date(ts).toISOString().slice(0, 10);
    byDay.set(date, {
      date,
      cumulus: entry.cumulus,
      nimbus: entry.nimbus,
      stratus: entry.stratus,
      total: entry.cumulus + entry.nimbus + entry.stratus,
    });
  }
  return [...byDay.values()];
}

import type {
  AddressInfo,
  BalanceInterval,
  BlockDetail,
  BlocksResponse,
  CurrencyResponse,
  FluxNode,
  MarketsInfo,
  MiningInfo,
  NodeInfo,
  PeerInfoEntry,
  PeerStatus,
  PoolsByDate,
  RicherThanEntry,
  RichListEntry,
  StatDay,
  Statistics24h,
  SyncInfo,
  Tx,
  TxsResponse,
} from '../types/api';

declare global {
  interface Window {
    apiPrefix?: string;
  }
}

export const apiPrefix: string = window.apiPrefix ?? '/api';

export class ApiError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, body: string, url: string) {
    super(`API ${status} for ${url}`);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${apiPrefix}${path}`;
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new ApiError(res.status, await res.text(), url);
  }
  return (await res.json()) as T;
}

function post<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const api = {
  sync: () => request<SyncInfo>('/sync'),
  version: () => request<{ version: string }>('/version'),
  peer: () => request<PeerStatus>('/peer'),
  currency: () => request<CurrencyResponse>('/currency'),
  marketsInfo: () => request<MarketsInfo>('/markets/info'),

  blocks: (params: { limit?: number; blockDate?: string; startTimestamp?: number }) => {
    const search = new URLSearchParams();
    if (params.limit !== undefined) search.set('limit', String(params.limit));
    if (params.blockDate !== undefined) search.set('blockDate', params.blockDate);
    if (params.startTimestamp !== undefined) {
      search.set('startTimestamp', String(params.startTimestamp));
    }
    const query = search.toString();
    return request<BlocksResponse>(`/blocks${query ? `?${query}` : ''}`);
  },
  block: (hash: string) => request<BlockDetail>(`/block/${hash}`),
  blockIndex: (height: number | string) => request<{ blockHash: string }>(`/block-index/${height}`),

  tx: (txid: string) => request<Tx>(`/tx/${txid}`),
  blockTxs: (blockHash: string, pageNum: number) =>
    request<TxsResponse>(`/txs?block=${blockHash}&pageNum=${pageNum}`),
  addressTxs: (address: string, pageNum: number) =>
    request<TxsResponse>(`/txs?address=${address}&pageNum=${pageNum}`),
  sendRawTx: (rawtx: string) => post<{ txid: string }>('/tx/send', { rawtx }),

  address: (addr: string) => request<AddressInfo>(`/addr/${addr}/?noTxList=1`),

  verifyMessage: (address: string, signature: string, message: string) =>
    post<{ result: boolean }>('/messages/verify', { address, signature, message }),

  info: () => request<{ info: NodeInfo }>('/status?q=getInfo'),
  lastBlockHash: () =>
    request<{ syncTipHash: string; lastblockhash: string }>('/status?q=getLastBlockHash'),
  miningInfo: () => request<{ miningInfo: MiningInfo }>('/status?q=getMiningInfo'),
  peerInfo: () => request<{ peerInfo: PeerInfoEntry[] }>('/status?q=getPeerInfo'),
  fluxNodes: () => request<{ fluxNodes: FluxNode[] }>('/status?q=getFluxNodes'),

  statsTotal: () => request<Statistics24h>('/statistics/total'),
  statsPoolsLastHour: () => request<Statistics24h>('/statistics/pools-last-hour'),
  statsPools: (date?: string) =>
    request<PoolsByDate>(`/statistics/pools${date ? `?date=${date}` : ''}`),
  statsByDays: (
    type: 'supply' | 'transactions' | 'outputs' | 'fees' | 'difficulty' | 'network-hash',
    days: number | 'all',
  ) => request<StatDay[]>(`/statistics/${type}?days=${days}`),
  statsRicherThan: () => request<RicherThanEntry[]>('/statistics/richer-than'),
  statsBalanceIntervals: () => request<BalanceInterval[]>('/statistics/balance-intervals'),
  statsRichestAddresses: () => request<RichListEntry[]>('/statistics/richest-addresses-list'),
  statsCirculatingSupply: () =>
    request<{ circulatingSupply: number | string }>('/statistics/circulating-supply?format=object'),
  statsTotalSupply: () => request<{ supply: number }>('/statistics/total-supply?format=object'),
};

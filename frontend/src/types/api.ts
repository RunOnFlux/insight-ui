export interface SyncInfo {
  status: 'syncing' | 'finished';
  blockChainHeight: number;
  syncPercentage: number;
  height: number;
  error: string | null;
  type: string;
  syncedBlocks?: number;
  skippedBlocks?: number;
}

export interface PeerStatus {
  connected: boolean;
  host: string;
  port: number | null;
}

export interface CurrencyResponse {
  status: number;
  data: { rate: number; short: string };
}

export interface MarketsInfo {
  price: number;
  price_btc: number;
  market_cap_usd: number;
  total_volume_24h: number;
  delta_24h: number;
}

export interface PoolInfo {
  poolName?: string;
  url?: string;
}

export interface BlockSummary {
  height: number;
  size: number;
  hash: string;
  time: number;
  difficulty: number;
  txlength: number;
  poolInfo: PoolInfo;
  isMainChain: boolean;
  minedBy?: string;
}

export interface BlocksPagination {
  next: string;
  prev: string;
  currentTs: number;
  current: string;
  isToday: boolean;
  more: boolean;
  moreTs?: number;
}

export interface BlocksResponse {
  blocks: BlockSummary[];
  length: number;
  pagination: BlocksPagination;
}

export interface BlockDetail {
  hash: string;
  size: number;
  height: number;
  version: number;
  merkleroot: string;
  tx: string[];
  time: number;
  nonce?: string | number;
  solution?: string;
  bits: string;
  difficulty: number;
  chainwork: string;
  confirmations: number;
  previousblockhash?: string;
  nextblockhash?: string;
  reward: number;
  isMainChain: boolean;
  minedBy?: string;
  poolInfo: PoolInfo;
  isPON?: boolean;
  blockType?: string;
  nodesCollateral?: { hash: string; index: number };
  blockSignature?: string;
}

export interface ScriptSig {
  hex: string;
  asm: string;
}

export interface Vin {
  txid?: string;
  vout?: number;
  coinbase?: string;
  sequence: number;
  n: number;
  scriptSig?: ScriptSig;
  addr?: string;
  valueSat?: number;
  value?: number;
  doubleSpentTxID?: string | null;
  unconfirmedInput?: boolean;
}

export interface ScriptPubKey {
  hex: string;
  asm: string;
  addresses?: string[];
  type?: string;
}

export interface Vout {
  value: string;
  n: number;
  scriptPubKey: ScriptPubKey;
  spentTxId: string | null;
  spentIndex: number | null;
  spentHeight: number | null;
}

export interface JoinSplit {
  vpub_old: number;
  vpub_new: number;
}

export interface DelegateData {
  delegates: unknown[];
}

export interface Tx {
  txid: string;
  version: number;
  locktime: number;
  blockhash?: string;
  blockheight?: number;
  confirmations: number;
  size: number;
  time?: number;
  blocktime?: number;
  firstSeenTs?: number;
  vin: Vin[];
  vout: Vout[];
  vjoinsplit: JoinSplit[];
  isCoinBase?: boolean;
  valueOut: number;
  valueIn?: number;
  fees?: number;
  fOverwintered?: boolean;
  nVersionGroupId?: number;
  nExpiryHeight?: number;
  valueBalance?: number;
  spendDescs?: unknown[];
  outputDescs?: unknown[];
  bindingSig?: string;
  // FluxNode transaction fields (version 5 / 6)
  type?: string;
  nType?: number;
  nFluxNodeTxVersion?: number;
  collateralOutputHash?: string;
  collateralOutputIndex?: number;
  sig?: string;
  sigTime?: number;
  collateralPubKey?: string;
  zelnodePubKey?: string;
  fluxnodePubKey?: string;
  redeemScript?: string;
  ip?: string;
  updateType?: string | number;
  benchmarkTier?: string;
  benchmarkSig?: string;
  benchmarkSigTime?: number;
  hasDelegates?: boolean;
  usingDelegates?: boolean;
  delegateData?: DelegateData;
}

export interface TxsResponse {
  pagesTotal: number;
  txs: Tx[];
}

export interface AddressInfo {
  addrStr: string;
  balance: number;
  balanceSat: number;
  totalReceived: number;
  totalReceivedSat: number;
  totalSent: number;
  totalSentSat: number;
  unconfirmedBalance: number;
  unconfirmedBalanceSat: number;
  unconfirmedTxApperances: number;
  txApperances: number;
  transactions?: string[];
}

export interface NodeInfo {
  version: number;
  protocolversion: number;
  walletversion?: number;
  blocks: number;
  timeoffset: number;
  connections: number;
  proxy: string;
  difficulty: number;
  testnet: boolean;
  relayfee: number;
  errors: string;
  network: string;
  reward: number;
}

export interface MiningInfo {
  difficulty: number;
  networkhashps: number;
}

export interface PeerInfoEntry {
  address: string;
  protocol?: number | string;
  version?: string;
  uptime?: { Days?: number; Hours?: number; Minutes?: number; Seconds?: number };
}

export interface FluxNode {
  collateral: string;
  txhash: string;
  outidx: string;
  ip: string;
  network: string;
  added_height: number;
  confirmed_height: number;
  last_confirmed_height: number;
  last_paid_height: number;
  tier: string;
  payment_address: string;
  pubkey: string;
  activesince: string;
  lastpaid: string;
  amount: string;
  rank: number;
}

export interface PoolStat {
  address: string;
  poolName: string;
  url: string;
  blocks_found: number;
  percent_total: string;
}

export interface Statistics24h {
  n_blocks_mined: number;
  time_between_blocks: number;
  mined_currency_amount: number;
  transaction_fees: number;
  number_of_transactions: number;
  outputs_volume: number;
  difficulty: string | number;
  network_hash_ps: number;
  blocks_by_pool?: PoolStat[];
}

export interface PoolsByDate {
  date: string;
  n_blocks_mined: number;
  blocks_by_pool?: PoolStat[];
  pagination: BlocksPagination;
}

export interface StatDay {
  date: string;
  // Numeric fields may arrive as strings from the API — coerce before charting.
  sum?: number | string;
  fee?: number | string;
  transaction_count?: number | string;
}

export interface RicherThanEntry {
  amount_usd: number;
  count_addresses: number;
}

export interface BalanceInterval {
  min: number;
  max: number;
  count: number;
  sum: number;
}

export interface RichListEntry {
  address: string;
  balance: number;
  blocks_mined: number;
}

export interface InvTx {
  txid: string;
  valueOut: number;
  vout: Record<string, number>[];
  isRBF?: boolean;
}

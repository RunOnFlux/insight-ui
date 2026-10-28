import type { StatDay } from '../types/api';

export type StatType =
  'supply' | 'transactions' | 'outputs' | 'fees' | 'difficulty' | 'network-hash';

export const STAT_META: Record<
  StatType,
  { title: string; description: string; field: keyof StatDay }
> = {
  supply: {
    title: 'Circulating supply',
    description: 'The circulating supply of Flux on the network.',
    field: 'sum',
  },
  transactions: {
    title: 'Transactions',
    description: 'The number of daily confirmed Flux transactions.',
    field: 'transaction_count',
  },
  outputs: {
    title: 'Output volume',
    description:
      'The total value of all transaction outputs per day (includes change returned to the sender).',
    field: 'sum',
  },
  fees: {
    title: 'Transaction fees',
    description: 'The daily average of fees paid to miners per transaction.',
    field: 'fee',
  },
  difficulty: {
    title: 'Difficulty',
    description: 'A relative measure of how difficult it is to find a new block.',
    field: 'sum',
  },
  'network-hash': {
    title: 'Network hashrate',
    description: 'The daily average global network hashrate.',
    field: 'sum',
  },
};

export const DAY_OPTIONS: { value: number | 'all'; label: string }[] = [
  { value: 30, label: '30d' },
  { value: 60, label: '60d' },
  { value: 180, label: '180d' },
  { value: 365, label: '1y' },
  { value: 730, label: '2y' },
  { value: 'all', label: 'All' },
];

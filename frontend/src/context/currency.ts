import { createContext, useContext } from 'react';

export type Currency = 'FLUX' | 'USD' | 'BTC';

export interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  /** Format a FLUX amount in the selected display currency. */
  convert: (fluxValue: number) => string;
  usdRate: number | undefined;
  btcRate: number | undefined;
}

export const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}

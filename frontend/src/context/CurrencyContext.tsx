import { useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { formatBtc, formatFlux, formatUsd } from '../lib/format';
import { CurrencyContext } from './currency';
import type { Currency } from './currency';

const STORAGE_KEY = 'insight-currency';

function initialCurrency(): Currency {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'FLUX' || stored === 'USD' || stored === 'BTC') return stored;
  return 'FLUX';
}

export function CurrencyProvider({ children }: { children: ReactNode }): ReactNode {
  const [currency, setCurrencyState] = useState<Currency>(initialCurrency);

  const { data: currencyData } = useQuery({
    queryKey: ['currency'],
    queryFn: api.currency,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });
  const { data: markets } = useQuery({
    queryKey: ['markets-info'],
    queryFn: api.marketsInfo,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });

  const usdRate = currencyData?.data.rate ?? markets?.price;
  const btcRate = markets?.price_btc;

  const setCurrency = useCallback((c: Currency) => {
    localStorage.setItem(STORAGE_KEY, c);
    setCurrencyState(c);
  }, []);

  const convert = useCallback(
    (fluxValue: number): string => {
      if (!Number.isFinite(fluxValue)) return '—';
      if (currency === 'USD' && usdRate !== undefined) {
        return formatUsd(fluxValue * usdRate);
      }
      if (currency === 'BTC' && btcRate !== undefined) {
        return formatBtc(fluxValue * btcRate);
      }
      return formatFlux(fluxValue);
    },
    [currency, usdRate, btcRate],
  );

  const value = useMemo(
    () => ({ currency, setCurrency, convert, usdRate, btcRate }),
    [currency, setCurrency, convert, usdRate, btcRate],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

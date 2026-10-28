import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import { CurrencyProvider } from './context/CurrencyContext.tsx';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// The insight-ui bitcore-node service rewrites <base href> when a routePrefix is set.
const basename = new URL(document.baseURI).pathname.replace(/\/$/, '');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <CurrencyProvider>
        <BrowserRouter basename={basename}>
          <App />
        </BrowserRouter>
      </CurrencyProvider>
    </QueryClientProvider>
  </StrictMode>,
);

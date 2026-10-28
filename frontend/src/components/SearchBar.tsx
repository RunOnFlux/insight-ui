import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { SearchIcon } from './icons';
import { Spinner } from './Feedback';

/**
 * Universal search: classifies the query where possible, then falls back to the
 * legacy probe cascade (block → tx → address → height).
 */
async function resolveQuery(q: string): Promise<string | null> {
  const query = q.trim();
  if (!query) return null;

  const isHex64 = /^[0-9a-fA-F]{64}$/.test(query);
  const isNumeric = /^\d+$/.test(query);

  if (isHex64) {
    try {
      await api.block(query);
      return `/block/${query}`;
    } catch {
      /* not a block */
    }
    try {
      await api.tx(query);
      return `/tx/${query}`;
    } catch {
      /* not a tx */
    }
    return null;
  }

  if (isNumeric) {
    try {
      const { blockHash } = await api.blockIndex(query);
      return `/block/${blockHash}`;
    } catch {
      return null;
    }
  }

  try {
    await api.address(query);
    return `/address/${query}`;
  } catch {
    return null;
  }
}

export function SearchBar({ className = '' }: { className?: string }) {
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const navigate = useNavigate();

  const submit = async (): Promise<void> => {
    if (loading) return;
    setLoading(true);
    setNotFound(false);
    const target = await resolveQuery(q);
    setLoading(false);
    if (target) {
      setQ('');
      void navigate(target);
    } else {
      setNotFound(true);
      setTimeout(() => setNotFound(false), 2500);
    }
  };

  return (
    <form
      className={`relative ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        void submit();
      }}
      role="search"
    >
      <div
        className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 transition-colors focus-within:border-flux-500 dark:bg-slate-900 ${
          notFound ? 'border-red-400 dark:border-red-600' : 'border-slate-200 dark:border-slate-700'
        }`}
      >
        {loading ? (
          <Spinner />
        ) : (
          <SearchIcon className="shrink-0 text-slate-400" width={16} height={16} />
        )}
        <input
          id="explorer-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search block, transaction, address or height"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      {notFound ? (
        <p className="absolute top-full left-0 z-20 mt-1 rounded bg-red-500 px-2 py-1 text-xs text-white shadow">
          No matching records found
        </p>
      ) : null}
    </form>
  );
}

import { useState } from 'react';
import { CheckIcon, CopyIcon } from './icons';

export function CopyButton({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (insecure context) — ignore.
    }
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      title={label ?? 'Copy to clipboard'}
      className="inline-flex shrink-0 cursor-pointer items-center rounded p-1 align-middle text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
    >
      {copied ? (
        <CheckIcon className="text-emerald-500" width={14} height={14} />
      ) : (
        <CopyIcon width={14} height={14} />
      )}
    </button>
  );
}

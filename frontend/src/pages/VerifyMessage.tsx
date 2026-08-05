import { useState } from 'react';
import { api, ApiError } from '../lib/api';
import { Spinner } from '../components/Feedback';

type State =
  | { status: 'unverified' }
  | { status: 'loading' }
  | { status: 'verified'; result: boolean; address: string }
  | { status: 'error'; message: string | null };

export function VerifyMessage() {
  const [address, setAddress] = useState('');
  const [signature, setSignature] = useState('');
  const [message, setMessage] = useState('');
  const [state, setState] = useState<State>({ status: 'unverified' });

  const canSubmit = address.trim() !== '' && signature.trim() !== '' && message !== '';

  const submit = async (): Promise<void> => {
    const snapshotAddress = address.trim();
    setState({ status: 'loading' });
    try {
      const res = await api.verifyMessage(snapshotAddress, signature.trim(), message);
      if (typeof res.result !== 'boolean') {
        setState({ status: 'error', message: null });
      } else {
        setState({ status: 'verified', result: res.result, address: snapshotAddress });
      }
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof ApiError && err.body ? err.body : null,
      });
    }
  };

  const reset = (): void => setState({ status: 'unverified' });
  const inputClass =
    'w-full rounded-lg border border-slate-200 bg-white p-3 text-sm outline-none focus:border-flux-500 dark:border-slate-700 dark:bg-slate-900';

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-bold">Verify a signed message</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Confirm that a message was signed by the holder of a Flux address.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="space-y-3"
      >
        <input
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            reset();
          }}
          placeholder="Flux address"
          spellCheck={false}
          className={`${inputClass} font-mono`}
        />
        <input
          value={signature}
          onChange={(e) => {
            setSignature(e.target.value);
            reset();
          }}
          placeholder="Signature (base64)"
          spellCheck={false}
          className={`${inputClass} font-mono`}
        />
        <textarea
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            reset();
          }}
          rows={5}
          placeholder="Message"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={!canSubmit || state.status === 'loading'}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-flux-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-flux-500 disabled:cursor-default disabled:opacity-50"
        >
          {state.status === 'loading' ? <Spinner /> : null}
          Verify message
        </button>
      </form>

      {state.status === 'verified' ? (
        state.result ? (
          <div className="card border-emerald-300 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
            The message is verifiably from <span className="hash">{state.address}</span>.
          </div>
        ) : (
          <div className="card border-red-300 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            The message failed to verify.
          </div>
        )
      ) : null}
      {state.status === 'error' ? (
        <div className="card border-amber-300 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950/40">
          <p className="font-medium text-amber-700 dark:text-amber-300">
            An error occurred in the verification process.
          </p>
          {state.message ? (
            <p className="mt-1 break-all text-amber-600/90 dark:text-amber-300/80">
              {state.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

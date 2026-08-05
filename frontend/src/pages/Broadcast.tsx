import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { Spinner } from '../components/Feedback';

type State =
  | { status: 'ready' }
  | { status: 'loading' }
  | { status: 'sent'; txid: string }
  | { status: 'error'; message: string };

export function Broadcast() {
  const [rawtx, setRawtx] = useState('');
  const [state, setState] = useState<State>({ status: 'ready' });

  const valid = /^[0-9A-Fa-f]+$/.test(rawtx.trim());

  const submit = async (): Promise<void> => {
    setState({ status: 'loading' });
    try {
      const res = await api.sendRawTx(rawtx.trim());
      if (typeof res.txid !== 'string') {
        setState({
          status: 'error',
          message: 'The transaction was sent but no transaction id was returned.',
        });
      } else {
        setState({ status: 'sent', txid: res.txid });
      }
    } catch (err) {
      setState({
        status: 'error',
        message:
          err instanceof ApiError && err.body
            ? err.body
            : 'No error message given (connection error?)',
      });
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-xl font-bold">Broadcast raw transaction</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Broadcast a signed raw transaction in hex format to the Flux network.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
        className="space-y-3"
      >
        <textarea
          value={rawtx}
          onChange={(e) => {
            setRawtx(e.target.value);
            setState({ status: 'ready' });
          }}
          rows={10}
          placeholder="Signed transaction hex"
          spellCheck={false}
          className={`hash w-full rounded-lg border bg-white p-3 outline-none focus:border-flux-500 dark:bg-slate-900 ${
            rawtx && !valid ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
          }`}
        />
        {rawtx && !valid ? (
          <p className="text-sm text-red-500">
            Raw transaction data must be a valid hexadecimal string.
          </p>
        ) : null}
        <button
          type="submit"
          disabled={!valid || state.status === 'loading'}
          className="flex cursor-pointer items-center gap-2 rounded-lg bg-flux-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-flux-500 disabled:cursor-default disabled:opacity-50"
        >
          {state.status === 'loading' ? <Spinner /> : null}
          Broadcast transaction
        </button>
      </form>

      {state.status === 'sent' ? (
        <div className="card border-emerald-300 bg-emerald-50 p-4 text-sm dark:border-emerald-900 dark:bg-emerald-950/40">
          <p className="font-semibold text-emerald-700 dark:text-emerald-300">
            Transaction successfully broadcast.
          </p>
          <p className="mt-1">
            Transaction id:{' '}
            <Link to={`/tx/${state.txid}`} className="hash link">
              {state.txid}
            </Link>
          </p>
        </div>
      ) : null}
      {state.status === 'error' ? (
        <div className="card border-red-300 bg-red-50 p-4 text-sm dark:border-red-900 dark:bg-red-950/40">
          <p className="font-semibold text-red-700 dark:text-red-300">Broadcast failed</p>
          <p className="mt-1 break-all text-red-600/90 dark:text-red-300/80">{state.message}</p>
        </div>
      ) : null}
    </div>
  );
}

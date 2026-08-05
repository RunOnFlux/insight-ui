import { Link } from 'react-router-dom';
import { addressLabel } from '../lib/labels';

interface AddressLinkProps {
  address: string;
  /** When the address equals the page's own address, render as muted text. */
  current?: string;
  shorten?: boolean;
  className?: string;
}

export function AddressLink({
  address,
  current,
  shorten = false,
  className = '',
}: AddressLinkProps) {
  const label = addressLabel(address);
  const display = label ?? (shorten ? `${address.slice(0, 12)}…` : address);

  if (current !== undefined && address === current) {
    return (
      <span
        className={`hash text-slate-500 dark:text-slate-400 ${className}`}
        title="Current address"
      >
        {display}
      </span>
    );
  }

  return (
    <Link to={`/address/${address}`} className={`hash link ${className}`} title={address}>
      {display}
    </Link>
  );
}

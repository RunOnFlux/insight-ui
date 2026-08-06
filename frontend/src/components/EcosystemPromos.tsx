import { ExternalLinkIcon } from './icons';
import fluxcloudLogo from '../assets/promo/fluxcloud.png';
import zelcoreLogo from '../assets/promo/zelcore.svg';
import sspLogo from '../assets/promo/ssp.svg';
import fluxaiLogo from '../assets/promo/fluxai.svg';

interface Promo {
  name: string;
  tagline: string;
  url: string;
  logo: string;
}

const PROMOS: Promo[] = [
  {
    name: 'Flux Cloud',
    tagline: 'Deploy apps on the decentralized cloud',
    url: 'https://cloud.runonflux.com',
    logo: fluxcloudLogo,
  },
  {
    name: 'ZelCore',
    tagline: 'Multi-asset wallet built for Flux',
    url: 'https://zelcore.io',
    logo: zelcoreLogo,
  },
  {
    name: 'SSP Wallet',
    tagline: 'Secure two-key crypto wallet',
    url: 'https://sspwallet.com',
    logo: sspLogo,
  },
  {
    name: 'FluxAI',
    tagline: 'AI powered by decentralized compute',
    url: 'https://fluxai.app',
    logo: fluxaiLogo,
  },
];

function PromoCard({ promo, compact }: { promo: Promo; compact: boolean }) {
  return (
    <a
      href={promo.url}
      target="_blank"
      rel="noreferrer"
      className={`card group flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:border-flux-400 hover:shadow-md dark:hover:border-flux-500 ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 p-1.5 dark:bg-slate-800">
        <img src={promo.logo} alt="" className="max-h-full max-w-full object-contain" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          {promo.name}
          <ExternalLinkIcon
            width={12}
            height={12}
            className="text-slate-400 transition-colors group-hover:text-flux-500"
          />
        </span>
        <span className="block text-xs text-slate-500 dark:text-slate-400">{promo.tagline}</span>
      </span>
    </a>
  );
}

/**
 * First-party Flux ecosystem product cards.
 * `stack` fits a sidebar; `band` is a full-width 4-up strip.
 */
export function EcosystemPromos({ variant }: { variant: 'stack' | 'band' }) {
  return (
    <section aria-label="Flux ecosystem">
      <h2
        className={`mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase dark:text-slate-500 ${
          variant === 'band' ? 'mt-2' : ''
        }`}
      >
        Explore the Flux ecosystem
      </h2>
      <div
        className={
          variant === 'stack' ? 'space-y-2' : 'grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4'
        }
      >
        {PROMOS.map((promo) => (
          <PromoCard key={promo.name} promo={promo} compact={variant === 'stack'} />
        ))}
      </div>
    </section>
  );
}

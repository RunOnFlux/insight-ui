import { ArrowRightIcon, ExternalLinkIcon } from './icons';
import fluxcloudLogo from '../assets/promo/fluxcloud.png';
import zelcoreLogo from '../assets/promo/zelcore.svg';
import sspLogo from '../assets/promo/ssp.svg';
import fluxaiLogo from '../assets/promo/fluxai.svg';

interface Promo {
  name: string;
  tagline: string;
  url: string;
  logo: string;
  /** Brand-tinted gradient wash across the card. */
  accentBg: string;
  /** Brand border on hover. */
  accentBorder: string;
}

const PROMOS: Promo[] = [
  {
    name: 'Flux Cloud',
    tagline: 'Deploy apps on the decentralized cloud',
    url: 'https://cloud.runonflux.com',
    logo: fluxcloudLogo,
    accentBg: 'bg-gradient-to-r from-flux-500/10 via-transparent to-transparent',
    accentBorder: 'hover:border-flux-400 dark:hover:border-flux-500',
  },
  {
    name: 'ZelCore',
    tagline: 'The home of Flux — multi-asset crypto wallet & exchange',
    url: 'https://zelcore.io',
    logo: zelcoreLogo,
    accentBg: 'bg-gradient-to-r from-sky-500/10 via-transparent to-transparent',
    accentBorder: 'hover:border-sky-400 dark:hover:border-sky-500',
  },
  {
    name: 'SSP Wallet',
    tagline: 'Multi-signature wallet for personal & business',
    url: 'https://sspwallet.com',
    logo: sspLogo,
    accentBg: 'bg-gradient-to-r from-amber-500/10 via-transparent to-transparent',
    accentBorder: 'hover:border-amber-400 dark:hover:border-amber-500',
  },
  {
    name: 'FluxAI',
    tagline: 'AI powered by decentralized compute',
    url: 'https://fluxai.app',
    logo: fluxaiLogo,
    accentBg: 'bg-gradient-to-r from-violet-500/10 via-transparent to-transparent',
    accentBorder: 'hover:border-violet-400 dark:hover:border-violet-500',
  },
];

function PromoCard({ promo, compact }: { promo: Promo; compact: boolean }) {
  return (
    <a
      href={promo.url}
      target="_blank"
      rel="noreferrer"
      className={`card group flex items-center gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md ${promo.accentBg} ${promo.accentBorder} ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-xl bg-slate-900 shadow-sm dark:bg-slate-800 ${
          compact ? 'size-10 p-1.5' : 'size-12 p-2'
        }`}
      >
        <img src={promo.logo} alt="" className="max-h-full max-w-full object-contain" />
      </span>
      <span className="min-w-0 flex-1">
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
      <ArrowRightIcon
        width={16}
        height={16}
        className="shrink-0 -translate-x-1 text-slate-300 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 dark:text-slate-600"
      />
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
          <PromoCard key={promo.name} promo={promo} compact={variant === 'band'} />
        ))}
      </div>
    </section>
  );
}

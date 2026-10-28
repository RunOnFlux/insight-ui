/** Collateral required per FluxNode tier, in FLUX. */
export const TIER_COLLATERAL: Record<string, number> = {
  CUMULUS: 1000,
  NIMBUS: 12500,
  STRATUS: 40000,
};

/**
 * URL of a node's FluxOS home page. The FluxOS UI listens one port below the
 * API port (default API 16127 → UI 16126); the deterministic list reports the
 * API port in `ip` only when it differs from the default.
 */
export function fluxOsUrl(ip: string): string | null {
  if (!ip) return null;
  let host = ip;
  let apiPort = 16127;
  const bracket = ip.match(/^\[(.+)\](?::(\d+))?$/);
  if (bracket) {
    host = `[${bracket[1]}]`;
    if (bracket[2] !== undefined) apiPort = Number(bracket[2]);
  } else if ((ip.match(/:/g) ?? []).length === 1) {
    const [h, p] = ip.split(':');
    host = h ?? ip;
    apiPort = Number(p);
  } else if (ip.includes(':')) {
    // Bare IPv6 without port
    host = `[${ip}]`;
  }
  if (!Number.isFinite(apiPort)) return null;
  return `http://${host}:${apiPort - 1}`;
}

# Flux Explorer frontend

Modern React frontend for the Flux Insight explorer. Replaces the legacy AngularJS 1.2 app
while consuming the exact same insight-api REST + socket.io endpoints — no backend changes
required.

## Stack

- React 19 + TypeScript (strict) + Vite 8
- Tailwind CSS 4, dark/light theme (dark default)
- TanStack Query for data fetching, socket.io-client **v2** (matches the socket.io v2 server)
- React Router 7, custom SVG charts (no chart library)

## Development

```sh
yarn install
yarn dev        # http://localhost:5173 — proxies /api and /socket.io to explorer.runonflux.io
```

Every check must pass before committing:

```sh
yarn type-check
yarn lint
yarn format:check
yarn build
```

## Deployment

The bitcore-node `insight-ui` service serves the repo's `public/` directory statically and
rewrites two markers in `index.html` at startup:

- `apiPrefix = '/api'` → the configured apiPrefix
- `<base href="/"` → the configured routePrefix

Both markers are preserved in the built `index.html` (see the inline script in
`frontend/index.html` and the `<base>` tag). Vite is configured with `base: './'` so assets
resolve through the `<base>` tag under any routePrefix.

To cut over, build straight into `public/` and commit the output:

```sh
yarn deploy     # tsc + vite build --outDir ../public --emptyOutDir
```

The server never builds anything — it only serves the committed static files, so it works
regardless of the Node version the backend runs on. Building requires Node 20+ on the dev
machine or CI only.

## Reference

`docs/LEGACY_SPEC.md` is the distilled functional spec of the old AngularJS app (routes, API
endpoints, socket rooms, FluxNode v5/v6 transaction rendering rules, PON block fields). It is
the source of truth for feature parity.

# DEPLOYMENT.md

This runbook reflects the current code and Cloudflare configuration in this repo.

## Stack Summary

- Framework: Next.js 14 App Router
- Adapter: `@opennextjs/cloudflare`
- Worker entrypoint: `.open-next/worker.js`
- Static assets directory: `.open-next/assets`
- Deployment target: Cloudflare Workers
- Origin backend: WooCommerce at `https://origin.mobdeals.co.ke`

## Required Cloudflare Setup

### Worker Configuration
- Worker name: `mobdeals-storefront`
- Route: `shop.mobdeals.co.ke/*`
- Zone: `mobdeals.co.ke`
- Compatibility date: `2024-09-23`
- Compatibility flags: `nodejs_compat`

### KV Namespaces
- `WEBHOOK_REPLAY_KV`
  - ID in `wrangler.toml`: `27f1def42eff4279942272bc35d823b3`
  - Purpose: webhook replay protection

- `MOBDEALS_CART_KV`
  - ID in `wrangler.toml`: `0e4729a0ee454be091d749e7ac91bb52`
  - Purpose: cart persistence

- `NEXT_CACHE_WORKERS_KV`
  - Purpose: persistent OpenNext incremental cache for public catalog pages
  - ID in `wrangler.toml`: `c72ba1a2899444bc89cfe97751dfb920`
  - Status: provisioned and bound for production

### Non-Secret Vars

These are already modeled in [`wrangler.toml`](/home/paulaflare/Desktop/Kimi_Agent_MobDeals Storefront/app/wrangler.toml):

- `SITE_URL=https://mobdeals.co.ke`
- `ALT_SITE_URL=https://shop.mobdeals.co.ke`
- `WP_BASE_URL=https://origin.mobdeals.co.ke`
- `WP_JSON_BASE=https://origin.mobdeals.co.ke/wp-json`

### Secrets

Set this before enabling WooCommerce webhooks:

```bash
wrangler secret put WC_WEBHOOK_SECRET
```

The public storefront catalog now reads from the WooCommerce Store API and does not require `WC_CONSUMER_KEY` or `WC_CONSUMER_SECRET`.

## Local Workflow

### App Development

```bash
npm install
npm run dev
```

This runs standard Next.js local development.

### Worker-Oriented Development

```bash
npm run cf:dev
```

Use this when you need to exercise Worker behavior and Cloudflare bindings more directly.

## Pre-Deploy Verification

Run the smallest set that matches the change:

```bash
npm run typecheck
npm run build
npm run cf:build
```

`npm run cf:build` must produce the OpenNext output expected by [`wrangler.toml`](/home/paulaflare/Desktop/Kimi_Agent_MobDeals Storefront/app/wrangler.toml):

- `.open-next/worker.js`
- `.open-next/assets`

`NEXT_CACHE_WORKERS_KV` is now provisioned for persistent `revalidate` cache storage on Cloudflare Workers.

## Deploy

```bash
npm run cf:build
npm run cf:deploy
```

`cf:deploy` maps to `wrangler deploy`.

## Post-Deploy Smoke Test

The checked-in smoke test lives at [`scripts/smoke-test.sh`](/home/paulaflare/Desktop/Kimi_Agent_MobDeals Storefront/app/scripts/smoke-test.sh).

Run it against the production hostname:

```bash
BASE_URL=https://shop.mobdeals.co.ke npm run smoke:prod
```

Current smoke coverage includes:

- homepage returns `200`
- `/api/products` responds and exposes `X-MobDeals-Cache`
- `/api/cart` bypasses cache
- `/api/webhooks/woocommerce` rejects unsigned and invalid requests
- `/api/categories` and `/api/search` respond correctly
- `/products` loads

## Dashboard Configuration

These items are still Cloudflare-dashboard concerns rather than code-managed settings in this repo:

- apex redirect: `mobdeals.co.ke/*` -> `https://shop.mobdeals.co.ke/$1`
- `www` redirect: `www.mobdeals.co.ke/*` -> `https://shop.mobdeals.co.ke/$1`
- DNS for the `shop` hostname

## Release Notes And Caveats

- Prefer the code over the README when validating API routes. The current implemented routes are:
  - `/api/products`
  - `/api/products/[slug]`
  - `/api/categories`
  - `/api/search`
  - `/api/cart`
  - `/api/webhooks/woocommerce`
- Cart state is KV-backed and keyed by `mobdeals_session` when available, otherwise by `cf-connecting-ip`.
- Webhook replay protection depends on `WEBHOOK_REPLAY_KV`; deploys without that binding will break webhook safety.
- Public catalog page revalidation depends on `NEXT_CACHE_WORKERS_KV` for persistent cross-instance cache writes. Without it, OpenNext falls back to asset reads and best-effort runtime behavior instead of durable incremental cache storage.
- This repo does not currently include a scripted rollback flow. If rollback is needed, use Cloudflare’s deployment/version controls or redeploy the last known good build.

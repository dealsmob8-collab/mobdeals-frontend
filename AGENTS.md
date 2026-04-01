# AGENTS.md

This repo is a Next.js 14 App Router storefront deployed to Cloudflare Workers with OpenNext and backed by a headless WooCommerce origin.

## Recommended Agent Split

### 1. Frontend Experience Agent
- Owns `app/page.tsx`, `app/layout.tsx`, `app/globals.css`, and `components/*`.
- Focuses on landing pages, product discovery UX, metadata, responsive behavior, and Kenya-specific merchandising copy.
- Verifies UI work with `npm run build` and browser checks after meaningful layout or interaction changes.

### 2. Catalog and Search Agent
- Owns `app/api/products/route.ts`, `app/api/products/[slug]/route.ts`, `app/api/categories/route.ts`, `app/api/search/route.ts`, `lib/woocommerce.ts`, and `types/*`.
- Focuses on WooCommerce queries, query validation, pagination, sorting, product/category shaping, and cache-safe GET behavior.
- Must preserve `X-MobDeals-Cache` semantics and avoid leaking WooCommerce credentials into client code.

### 3. Cart and Webhooks Agent
- Owns `app/api/cart/route.ts`, `app/api/webhooks/woocommerce/route.ts`, `lib/cache.ts`, and `lib/webhook.ts`.
- Focuses on KV-backed cart state, cache bypass rules, webhook signature verification, replay protection, and cache invalidation.
- Treats cart, checkout-like flows, and webhooks as sensitive paths; security and cache correctness matter more than convenience.

### 4. Deployment and Operations Agent
- Owns `wrangler.toml`, `next.config.js`, `scripts/smoke-test.sh`, environment wiring, and deployment runbooks.
- Focuses on OpenNext output, Worker bindings, Cloudflare routes, secrets, smoke tests, and release safety.
- Verifies deployment changes with `npm run cf:build` and post-deploy smoke tests.

## Shared Rules

- Prefer the code over the README when they disagree. Current code exposes `/api/products/[slug]` and a single `/api/cart` route; the README documents some routes that do not exist.
- Keep sensitive values server-side only. The current repo requires `WC_WEBHOOK_SECRET`; if admin WooCommerce credentials are reintroduced later, keep them server-side too.
- Preserve Cloudflare bindings:
  - `WEBHOOK_REPLAY_KV` for webhook replay protection
  - `MOBDEALS_CART_KV` for cart storage
  - `NEXT_CACHE_WORKERS_KV` for persistent OpenNext incremental cache
  - `ASSETS` for static asset delivery
- Do not remove or weaken cache bypasses for cart, webhook, checkout/account-style flows, or authenticated/session requests.
- For cross-cutting changes, run the smallest relevant verification set:
  - `npm run typecheck`
  - `npm run build`
  - `npm run cf:build`
  - `BASE_URL=<target> npm run smoke:prod`

## Handoff Guidance

- UI-only work stays with the Frontend Experience Agent unless it changes route/data contracts.
- WooCommerce query or response-shape changes should be coordinated with the Frontend Experience Agent if product cards, PDPs, or search UI depend on them.
- Changes touching cache keys, cookie behavior, signatures, or KV writes should involve the Cart and Webhooks Agent.
- Any change to `wrangler.toml`, domains, routes, secrets, or build output should involve the Deployment and Operations Agent.

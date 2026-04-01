# MobDeals Storefront K2.5

A production-ready, mobile-first, high-converting tech e-commerce storefront for Kenya, deployed on Cloudflare Workers with a headless WooCommerce backend.

## Architecture

- **Runtime**: Next.js 14 App Router deployed to Cloudflare Worker via OpenNext adapter
- **Backend**: Headless WooCommerce REST API from WordPress origin
- **Caching**: Cloudflare Workers Cache API with intelligent bypass rules
- **Payments**: M-PESA integration ready
- **Delivery**: 2-hour Nairobi delivery, next-day nationwide dispatch

## Project Structure

```
.
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── cart/            # Cart API (POST/PUT/DELETE)
│   │   ├── categories/      # Categories API (GET, cached)
│   │   ├── products/        # Products API (GET, cached)
│   │   ├── search/          # Search API (GET, cached)
│   │   └── webhooks/        # WooCommerce webhooks
│   ├── products/            # Product pages
│   ├── search/              # Search page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── announcement-strip.tsx
│   ├── chat-widget.tsx
│   ├── header.tsx
│   ├── pagination.tsx
│   └── product-card.tsx
├── lib/                     # Utility functions
│   ├── cache.ts            # Cache utilities
│   ├── utils.ts            # General utilities
│   ├── webhook.ts          # Webhook verification
│   └── woocommerce.ts      # WooCommerce API client
├── types/                   # TypeScript types
│   └── woocommerce.ts
├── scripts/                 # Utility scripts
│   └── smoke-test.sh       # Production smoke tests
├── wrangler.toml           # Cloudflare Workers config
├── next.config.js          # Next.js config
└── package.json            # Dependencies
```

## Environment Variables

Set this secret via Wrangler or the Cloudflare Dashboard:

```bash
WC_WEBHOOK_SECRET=whsec_xxx
```

The public storefront catalog reads from the WooCommerce Store API and does not require consumer key/secret credentials.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Build for Cloudflare Workers
npm run cf:build

# Deploy to Cloudflare Workers
npm run cf:deploy

# Run smoke tests
npm run smoke:prod
```

## API Endpoints

### Public GET (Cached)
- `GET /api/products?category=&page=&per_page=&sort=` - List products
- `GET /api/products/[slug]` - Single product
- `GET /api/categories` - Product categories
- `GET /api/search?q=` - Search products

### Private (Never Cached)
- `GET /api/cart` - Read cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart` - Update cart quantities
- `DELETE /api/cart` - Clear cart

### Webhooks
- `POST /api/webhooks/woocommerce` - WooCommerce webhooks
  - Verifies HMAC SHA-256 signature
  - Replay protection via KV (5-min TTL)
  - Cache invalidation on product/order changes

## Caching Strategy

- **Catalog GET**: 60s TTL
- **Categories**: 300s TTL
- **Cart/Checkout/Account**: Never cached
- **Webhooks**: Never cached
- **Authenticated requests**: Bypass cache

Cache status header: `X-MobDeals-Cache: HIT|MISS|BYPASS (reason)`

## Security

- WooCommerce webhook secret server-side only
- Public catalog served from the WooCommerce Store API
- Webhook signature verification with constant-time comparison
- Replay attack protection via KV namespace
- HTML sanitization for product descriptions
- Product data validation to prevent title/description mismatches

## Features

### Frontend
- Mobile-first responsive design
- Sticky announcement strip with rotating messages
- AI chat support (FAQ-first + WhatsApp escalation)
- Product cards with ratings, pricing, stock status
- Search with pagination
- Category filtering
- Schema.org Product markup for SEO

### Chat Widget
- FAQ-first responses (shipping, payment, returns, warranty)
- WhatsApp escalation button
- Optional lead capture (phone number for discount code)
- Consent checkbox for GDPR compliance

## Deployment

### Prerequisites
- Cloudflare account (Free plan)
- KV namespaces created:
  - `WEBHOOK_REPLAY_KV`
  - `MOBDEALS_CART_KV`
  - `NEXT_CACHE_WORKERS_KV`
- Domain configured: `shop.mobdeals.co.ke`
- Redirect rules:
  - `mobdeals.co.ke/*` → `https://shop.mobdeals.co.ke/$1` (301)
  - `www.mobdeals.co.ke/*` → `https://shop.mobdeals.co.ke/$1` (301)

### Deploy Commands

```bash
# Set secrets
wrangler secret put WC_WEBHOOK_SECRET

# Deploy
npm run cf:build
npm run cf:deploy

# Run smoke tests
BASE_URL=https://shop.mobdeals.co.ke npm run smoke:prod
```

## Smoke Tests

The smoke test script verifies:
1. Homepage loads (200)
2. Products API caching (X-MobDeals-Cache header)
3. Cart API bypasses cache
4. Webhook rejects missing signature (403)
5. Webhook rejects invalid signature (403)
6. Categories API returns JSON
7. Search API works
8. Product page loads
9. Static assets served

## Business Configuration

- **Store Location**: Moi Avenue, Tembo House Cooperative, Nairobi
- **Delivery**: 2-hour in Nairobi, next-day nationwide
- **Payments**: M-PESA, Cash on Delivery (Nairobi only)
- **Support**: WhatsApp +254 700 000 000

## License

Proprietary - MobDeals Kenya

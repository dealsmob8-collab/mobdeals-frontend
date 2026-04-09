# MobDeals Site Audit

Date: 2026-04-09

## Overview

This repository is a Next.js 14 App Router storefront deployed through OpenNext to Cloudflare Workers and backed by WooCommerce. The codebase already has a solid server-rendered foundation, but the storefront needed product-data guardrails, stronger conversion copy, consistent WhatsApp handling, and a cleaner merchandising layer.

## Current Strengths

- Fast server-rendered architecture with minimal client-side JavaScript.
- Clear split between storefront pages, shared UI components, and WooCommerce data access.
- Cache-aware API and cart paths already exist.
- Existing smoke test and build scripts provide a baseline for release safety.
- Product, category, search, and cart routes already support a practical e-commerce flow.

## Issues Found

- Product labels and derived copy were inconsistent, so weak source data could surface the wrong family or condition language.
- Product detail pages used generic marketing copy and did not clearly separate summary, verified specs, condition, trust notes, and availability.
- WhatsApp contact data was hardcoded in multiple places, which made consistency fragile.
- The homepage hero flow depended on brittle layout assumptions and missing asset references.
- SEO metadata was uneven and included placeholder-style fields.
- The WooCommerce mapping layer discarded some source metadata instead of preserving it for later derivation.

## Data And Content Issues

- Product type and condition labels needed normalization before they reached the UI.
- Some product records may lack reliable specs, so the storefront should omit uncertain details rather than invent them.
- The WhatsApp-first flow needed a single source of truth for the support number and message templates.
- Source catalog quality still determines the quality of product names, categories, attributes, and images.
- A source-quality gate is still needed upstream in WooCommerce so bad brand, category, or condition values are caught before they reach the storefront.

## UI And UX Gaps

- The homepage hero did not communicate the brand, local market, or ordering flow clearly enough.
- Product cards and product detail pages were not aligned around the same derived copy system.
- The CTA hierarchy did not consistently favor WhatsApp inquiry with a useful prefilled message.
- Trust signals such as testing, condition clarity, Nairobi support, and availability were not presented consistently.

## SEO Gaps

- Page titles and descriptions were too generic in several routes.
- Open Graph and Twitter metadata needed a shared baseline.
- The product page needed safer structured data derived from verified fields only.
- Headings and fallback metadata needed cleanup.

## Performance Risks

- Overly heavy client-side work would hurt the mobile-first storefront, so the implementation should stay server-rendered where possible.
- Remote product and hero images need responsive sizing and lazy loading where they are not critical.
- Repetitive content or overly broad normalization rules can create noisy metadata and weaker UX.

## Recommended Fixes Implemented

- Added shared site constants and WhatsApp helpers in `lib/site.ts`.
- Added product normalization, validation, and copy helpers in `lib/product-format.ts`, `lib/product-validators.ts`, and `lib/product-copy.ts`.
- Preserved WooCommerce source metadata in `lib/woocommerce.ts`.
- Reworked the homepage hero and merchandising flow.
- Rebuilt the product page around summary, verified specs, trust notes, and WhatsApp conversion.
- Standardized category, search, deals, contact, cart, and header CTAs around the same support flow.
- Improved metadata defaults and removed placeholder verification content.
- Fixed the missing animation issue on the announcement strip.

## Recommended Future Improvements Not Implemented

- Add focused unit tests for the normalization and copy helpers.
- Add broader catalog QA checks before publish, including brand/category/condition validation, Apple-vs-Android mismatch checks, and a review queue for suspicious source rows.
- Expand product schema generation only when the source data is reliable enough.
- Add stronger asset optimization once the final brand and hero files are available.
- Review category-specific merchandising copy after live catalog feedback.

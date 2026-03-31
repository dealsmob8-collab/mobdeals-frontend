# SKILLS.md

This repo already had most of the right Codex skills installed. After analysis, the only additional curated install was `security-threat-model`.

## Core Skills For This Repo

- `cloudflare-deploy`
  - Use for `wrangler.toml`, Cloudflare Worker deploys, KV bindings, secrets, routes, and release troubleshooting.

- `frontend-skill`
  - Use for homepage, PLP/PDP polish, responsive layout work, component refactors, and visual hierarchy changes.

- `playwright`
  - Use after UI or flow changes to verify navigation, search, product pages, cart behavior, and post-deploy smoke checks in a real browser.

- `security-best-practices`
  - Use when changing webhook verification, cart state handling, sanitization, environment variable usage, or any route that can expose private data.

- `security-threat-model`
  - Installed on 2026-03-29 for this project.
  - Use before major changes to webhooks, carts, payment flows, origin connectivity, or cache rules.

## Good Default Pairings

- Frontend refresh: `frontend-skill` + `playwright`
- Cloudflare deploy or route changes: `cloudflare-deploy`
- API/cache changes: `cloudflare-deploy` and, if sensitive, `security-best-practices`
- Webhook/cart/payment work: `security-best-practices` + `security-threat-model`
- Large feature planning: `notion-spec-to-implementation`

## Skills Usually Not Needed Here

- `figma`: only when a Figma file or node is part of the task.
- `gh-fix-ci`: only when this app is running in GitHub Actions and a failing check needs debugging.
- `sentry`: only after Sentry is actually wired into the storefront or Worker runtime.
- `vercel-deploy` and `render-deploy`: not relevant while Cloudflare Workers remains the deployment target.

## Current Recommendation

- No more skill installs are necessary right now.
- If the project later adds design handoff work, install or use the Figma-specific variants already available in the environment.
- Restart Codex to pick up newly installed skills.

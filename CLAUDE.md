# Home-Page — CLAUDE.md

## What this repo does

A personal **homelab dashboard** (titled 内网资源) that displays the self-hosted
services running on the NAS. Each service is a card that:
1. Shows live online/offline status (green/red/yellow), from a server-side probe.
2. Opens the service on click — by domain (`https://<subdomain>.<BASE_DOMAIN>`)
   via Nginx Proxy Manager, with a fixed-`host` override and an
   `http://<localIP>:<port>` fallback.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) with Turbopack |
| UI | Radix UI Themes + Tailwind CSS v4 |
| Language | TypeScript 5 / React 19 |
| Icons | react-icons |
| Runtime | Node 18 (Docker container) |

## Project structure

```
Home-Page/
├── CLAUDE.md
├── .claude/skills/add-service/   # skill: how to add a service card
├── Dockerfile                    # Node 18, exposes 4869, runs `npm run start`
├── docker-compose.yaml           # mounts ./home-page, maps 4869, sets SERVER_HOST + NEXT_PUBLIC_BASE_DOMAIN, joins clash_default/clickhouse_default
├── deploy.zsh                    # down → build → up -d, then docker network connect for probed containers
└── home-page/                    # Next.js app root
    ├── app/
    │   ├── page.tsx                       # renders WebsiteItemCards + refresh/last-checked
    │   ├── api/services/route.tsx         # GET /api/services — server-side TCP probe per entry
    │   ├── components/Websites/
    │   │   ├── WebsiteItemCards.tsx       # grid; wires useServiceStatuses
    │   │   └── WebsiteItemCard.tsx        # one card; builds link (host → subdomain → localIP:port)
    │   ├── data/websites.ts               # service registry; exports localIP
    │   ├── hooks/useServiceStatuses.tsx   # polls /api/services; exports ConnectStatus
    │   └── types/WebsiteItem.tsx          # { id, name, port, logo?, subdomain?, host?, probeHost?, probePort?, network? }
    └── public/static/logo/                # service logos (svg/png)
```

## Adding a service

See `.claude/skills/add-service/SKILL.md`. Short version: trim a square logo into
`public/static/logo/`, append a `WebsiteItem` to `home-page/app/data/websites.ts`
(set `subdomain` for NPM-fronted services), then `./deploy.zsh`. The subdomain's
DNS + NPM proxy host are set up outside this repo.

## How links & status work

- **Link** (`WebsiteItemCard`): `host` (fixed, http) → `subdomain`
  (`https://<subdomain>.<BASE_DOMAIN>`) → `http://<localIP>:<port>` fallback.
  `BASE_DOMAIN` = `NEXT_PUBLIC_BASE_DOMAIN` (build-time, default `castamerego.com`).
- **Status** (`/api/services`): server-side TCP connect to
  `probeHost ?? SERVER_HOST : probePort ?? port`. Use `probeHost/probePort`
  (+ shared Docker network) for containers whose LAN-IP path is clash-intercepted.

## Dev workflow

```bash
cd home-page && npm run dev     # Turbopack, port 4868 (dev only)
./deploy.zsh                    # from repo root → build + redeploy on NAS (prod port 4869)
```

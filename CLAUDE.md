# Home-Page — CLAUDE.md

## What this repo does

A personal **homelab dashboard** (titled 内网资源) that displays all self-hosted services running on the NAS/home server. Each service is shown as a card that:
1. Auto-detects which network is reachable (local LAN → Tailscale → WAN domain)
2. Shows live online/offline status with colour-coded cards (green/red/yellow)
3. Opens the service in a new tab on click

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, canary) with Turbopack |
| UI | Radix UI Themes + Tailwind CSS v4 |
| Language | TypeScript 5 |
| React | React 19 |
| Icons | react-icons |
| Runtime | Node 18 (Docker container) |

## Project structure

```
Home-Page/
├── CLAUDE.md
├── Dockerfile            # Node 18, exposes 4869, runs `npm run start`
├── docker-compose.yaml   # Mounts ./home-page into container, maps port 4869
├── deploy.zsh            # Build + redeploy script (down → build → up -d)
└── home-page/            # Next.js app root
    ├── package.json      # scripts: dev (port 4868), build, start (port 4869)
    ├── app/
    │   ├── layout.tsx               # Root layout — Radix Theme + Inter font
    │   ├── page.tsx                 # Home page — renders WebsiteItemCards
    │   ├── globals.css              # Global styles
    │   ├── api/services/route.tsx   # GET /api/services — server-side health check via localhost fetch
    │   ├── components/
    │   │   ├── index.tsx            # Re-exports
    │   │   └── Websites/
    │   │       ├── WebsiteItemCards.tsx  # Grid layout of all cards
    │   │       └── WebsiteItemCard.tsx   # Individual card with network detection logic
    │   ├── data/
    │   │   └── websites.ts          # Service registry: name, port, logo. Also exports localIP + tailscaleIP
    │   ├── hooks/
    │   │   └── useServiceStatus.tsx # Fetches /api/services, returns statusList + loading
    │   └── types/
    │       ├── WebsiteItem.tsx      # { id, name, port, logo? }
    │       └── ServiceStatus.tsx    # { id, status: online|offline }
    └── public/static/logo/          # Service logos (svg/ico/png)
```

## Key data & config

- **Add a new service**: edit `home-page/app/data/websites.ts` — add an entry to the `websites` array and drop a logo in `public/static/logo/`
- **Network IPs**: `localIP` and `tailscaleIP` are constants at the top of `websites.ts`
- **WAN domain pattern**: `https://app-{port}-casta-dxp4800.cn14.ugdocker.link`

## Network detection (client-side)

`WebsiteItemCard` probes reachability by loading `/favicon.ico` via an `<img>` tag (avoids CORS). Priority: **local → Tailscale → WAN domain**. Timeout: 1500 ms per attempt. This is purely client-side; the server-side `/api/services` route does a direct localhost fetch (used for an older status model, currently not wired into the card UI).

## Dev workflow

```bash
# Local dev (from home-page/)
npm run dev        # Turbopack, port 4868

# Deploy to NAS (from repo root)
./deploy.zsh       # docker compose down → npm build → docker compose up -d
```

Port 4869 is the production port (exposed by Docker). Port 4868 is dev-only.

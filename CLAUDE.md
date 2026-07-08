# Home-Page — CLAUDE.md

## What this repo does

A personal **homelab dashboard** (titled 内网资源) that displays the self-hosted
services running on the NAS. Each service is a card that:
1. Shows live status — online / offline / sleeping / checking — from a
   server-side probe (TCP connect, or docker-socket state for auto-sleep game
   servers). Game tiles show status by shadow color / launcher dot only, no chip.
2. Opens the service on click — by domain (`https://<subdomain>.<BASE_DOMAIN>`)
   via Nginx Proxy Manager, with a fixed-`host` override and an
   `http://<localIP>:<port>` fallback. Game tiles (`link: false`) don't link.

Header toggles (each persisted in localStorage): **view** — cards (name +
status chip + logo) or launcher (app grid, corner status dot) — and
**grouping** — flat registry order (default) or sections
(应用 / 监控 / 基础设施 / 游戏 per `groupOrder`). API latency (`latencyMs`)
is measured but not currently displayed.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, standalone output) |
| UI | Custom design system in `globals.css` (`hl-*`/`svc-*`/`l-*` classes) + Radix UI Themes for primitives + Tailwind CSS v4 |
| Theming | next-themes (class strategy) — light/dark, system default, header toggle |
| Language | TypeScript 5 / React 19 |
| Icons | react-icons; service logos in `public/static/logo/` |
| Runtime | Node 22 alpine (multi-stage Docker, runs `node server.js`) |

## Design language (Phase C redesign, user-approved via HTML demos)

Frosted-glass cards (backdrop-blur over a faint ambient wash) with
neo-brutalist bones: 2px ink borders, low-opacity **status-colored offset
shadows** (green/red/yellow/indigo at ~32–45%), soft tinted uppercase stamp
chips. The shadow layer is **pinned to the page**: on hover/press only the
card moves, so `translate + shadow offset` must always sum to the base offset
(base 4px card / 3px launcher; hover −2px translate ⇒ +2px offset; active
+2px ⇒ −2px). Header carries the signature `$ homelab status --all` prompt.
All colors are `--hl-*` CSS vars defined for `:root` and `.dark`.

## Project structure

```
Home-Page/
├── CLAUDE.md
├── .claude/skills/add-service/   # skill: how to add a service card
├── Dockerfile                    # multi-stage node:22-alpine → standalone runner, port 4869
├── docker-compose.yaml           # maps 4869, SERVER_HOST env, NEXT_PUBLIC_BASE_DOMAIN build arg,
│                                 # docker.sock (ro) for game-server probes, clash/clickhouse networks
├── deploy.zsh                    # build image first, then up -d (seconds of downtime), network connects
└── home-page/                    # Next.js app root
    ├── app/
    │   ├── layout.tsx                     # ThemeProvider + Radix Theme + ambient wash
    │   ├── page.tsx                       # header (prompt/toolbar/toggles) + cards; view state
    │   ├── api/services/route.ts          # GET /api/services — probes + 20s cache
    │   ├── components/ThemeToggle.tsx     # sun/moon toggle (next-themes)
    │   ├── components/Websites/
    │   │   ├── WebsiteItemCards.tsx       # grouped sections; cards/launcher grids
    │   │   └── WebsiteItemCard.tsx        # one card (both views); builds link
    │   ├── data/websites.ts               # service registry + groupOrder; exports localIP
    │   ├── hooks/useServiceStatuses.ts    # polls /api/services; ConnectStatus, ServiceStatus
    │   ├── types/WebsiteItem.ts           # registry entry type (see fields there)
    │   └── globals.css                    # the whole design system (hl-* tokens + components)
    └── public/static/logo/                # square-trimmed service logos (svg/png)
```

## How status works

`/api/services` returns `{ id, status: "online"|"offline"|"sleeping", latencyMs }[]`,
cached in-memory for 20s with in-flight coalescing. Per entry:

- **tcp** (default): connect to `probeHost ?? SERVER_HOST : probePort ?? port`;
  latency = connect time. Use `probeHost/probePort` (+ shared Docker network)
  for containers whose LAN-IP path is clash-intercepted.
- **docker** (`probe: "docker"`): reads `/containers/<containerName>/json` over
  the mounted docker socket. Running → online; stopped but `wakeProxy`
  container running → **sleeping**; else offline.
  **NEVER tcp-probe auto-sleep game servers** — Lazytainer/Timid count traffic
  on the game port and a probe would wake them or hold them awake.

Client polls every 180s (`useServiceStatuses`), manual refresh clears to
"checking" skeletons; `lastChecked` updates on every successful poll.

## Dev workflow

```bash
cd home-page && npm run dev     # port 4868 (dev only)
npm run typecheck               # tsc --noEmit (next lint was removed in Next 16)
./deploy.zsh                    # from repo root → docker build + recreate (prod port 4869)
```

Git: commit per phase/feature; **never push** without being asked.

## Adding a service

See `.claude/skills/add-service/SKILL.md`. Short version: trim a square logo
into `public/static/logo/`, append a `WebsiteItem` to
`home-page/app/data/websites.ts` (set `subdomain` for NPM-fronted services,
`group` for the section, `probe: "docker"` + `containerName`/`wakeProxy` for
auto-sleep game servers), then `./deploy.zsh`. The subdomain's DNS + NPM proxy
host are set up outside this repo.

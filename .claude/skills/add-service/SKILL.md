---
name: add-service
description: Add a new service/app card to the Home-Page homelab dashboard. Use when the user wants to add an entry to the services list, register a new app, or asks what is needed to add a service.
---

# Adding a service to Home-Page

The dashboard renders one card per entry in a single registry array
(`home-page/app/data/websites.ts`). Status detection and rendering are
automatic — you almost never touch the API route or components. A normal add is:
prepare the logo, register the service, then redeploy.

Services are reached **by domain** through Nginx Proxy Manager
(`https://<subdomain>.<BASE_DOMAIN>`, BASE_DOMAIN defaults to `castamerego.com`
via `NEXT_PUBLIC_BASE_DOMAIN`). So before a tile links correctly the service
needs an NPM proxy host + DNS record for that subdomain — that part lives
outside this repo (see Step 3).

## Step 1 — Prepare and trim the logo

**Always trim the icon before adding it.** Cards render every logo inside a
fixed square tile, so a raw icon with uneven padding or a non-square aspect
ratio looks misaligned next to the others. Normalize first:

- Trim the surrounding transparent/whitespace border to the actual content.
- Pad to a **square** canvas, content centered at ~84% of the square (≈8% margin
  each side). This keeps every icon the same visual size under `object-contain`.
- Keep SVGs as vectors — trim by rewriting the `viewBox` to a tight square
  bounding box rather than rasterizing.

There is **no ImageMagick / rsvg / Pillow** on the NAS or dev Mac. Use a
browser-canvas pipeline (Chrome decodes svg/png/ico uniformly):
- **SVG:** inject markup, read `svg.getBBox()`, set `viewBox` to a square
  centered on that bbox (side = maxDim / 0.84), `width`/`height` to 128. Save the
  edited `.svg`.
- **Raster (png/ico):** draw to a canvas, scan `getImageData` alpha for the
  content bbox, crop, center on a square canvas with ~8% margin, export PNG.

Put the result in `home-page/public/static/logo/`; reference it by filename.
(MetaCubeXD/Overleaf were normalized this way — use them as references.)

## Step 2 — Register the service

Edit `home-page/app/data/websites.ts` and append to the `websites` array:

```ts
{ id: 15, name: "My App", port: 1234, logo: "my-app.svg", subdomain: "myapp" },
```

`WebsiteItem` fields: `{ id, name, port, logo?, subdomain?, host?, probeHost?, probePort?, network? }`

- `id`: next unique integer.
- `name`: display name.
- `port`: the user-facing published port on the NAS host. Also the default
  health-probe port.
- `logo`: filename of the trimmed asset from Step 1.
- `subdomain`: the NPM subdomain. **Link priority** in the card is
  `host` → `subdomain` (`https://<subdomain>.<BASE_DOMAIN>`) → `http://<localIP>:<port>`
  fallback. Set `subdomain` for any service fronted by NPM.
- `host`: fixed-address override (http only, e.g. the router at
  `router.castamerego.com`). Used instead of subdomain when set.

## Step 3 — Make the subdomain resolve (NPM + DNS, outside this repo)

For `https://<subdomain>.<BASE_DOMAIN>` to work the service needs:
1. A DNS A-record `<subdomain>` → the NAS IP (internal/split-horizon).
2. An NPM proxy host `<subdomain>.<base> → <NAS-IP>:<port>` (with `--websockets`
   if it uses live sockets, e.g. Home-Assistant, Uptime Kuma, clash dashboards).

This is done with the operator's NAS tooling (the `npm-add` skill / NPM admin),
not from this repo. If the subdomain isn't set up yet, the tile still works via
the `http://<localIP>:<port>` fallback.

## Step 4 — Decide if a probe override is needed

The server health check (`app/api/services/route.tsx`) opens a TCP socket to
`SERVER_HOST:port` (SERVER_HOST = NAS LAN IP, set in docker-compose). Works for
LAN-reachable services — most of them. No route changes are ever needed; it
reads the array automatically.

**Exception:** if the service is a Docker container whose LAN-IP path is
intercepted by clash-meta (symptom: connect succeeds from the host shell but the
probe times out from inside the homepage container), reach it
container-to-container instead:

```ts
{ id: 15, name: "My App", port: 1234, logo: "my-app.svg", subdomain: "myapp",
  probeHost: "my-app-container", probePort: 80, network: "my-app_default" },
```

- `probeHost`/`probePort` affect only the **server-side probe**, not the link.
- `network` is display-only (renders a small network badge on the card).
- The container must share a Docker network with `homepage` so the name
  resolves. Attach it and persist in `deploy.zsh`:
  `docker network connect home-page_default <my-app-container> 2>/dev/null || true`

(This is how MetaCubeXD and ch-ui are wired — see their entries.)

## Step 5 — Deploy and verify

```sh
cd /volume3/Dev/Home-Page && ./deploy.zsh
curl -s http://localhost:4869/api/services   # the new id should report online if the port is up
```

Confirm the card shows green in the browser, links to the right place, **and
that the icon is the same size as its neighbors**. `useServiceStatuses` and the
components pick up the new entry automatically.

## Notes

- The registry array is the single source of truth — do not edit the API route
  or card components for a normal add.
- `localIP` is exported from `websites.ts`; `BASE_DOMAIN` comes from
  `NEXT_PUBLIC_BASE_DOMAIN` (build-time env in docker-compose, defaults to
  `castamerego.com`).

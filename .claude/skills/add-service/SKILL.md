---
name: add-service
description: Add a new service/app card to the Home-Page homelab dashboard. Use when the user wants to add an entry to the services list, register a new app, or asks what is needed to add a service.
---

# Adding a service to Home-Page

The dashboard renders one card per entry in a single registry array. Status
detection and rendering are automatic — you almost never touch the API route
or components. Most additions are two steps (registry + logo) plus a redeploy.

## Step 1 — Register the service

Edit `home-page/app/data/websites.ts` and append to the `websites` array:

```ts
{ id: 9, name: "My App", port: 1234, logo: "my-app.svg" },
```

- `id`: next unique integer (sequential).
- `name`: display name on the card.
- `port`: the **user-facing published port** on the NAS host. The click-through
  URL is built from this (`http://<localIP>:<port>`, Tailscale, or the WAN
  domain pattern). It is also the default health-probe port.
- `logo`: filename only; the file lives in `public/static/logo/`.

## Step 2 — Add the logo

Drop the image in `home-page/public/static/logo/` (svg/png/ico). The card
references it by filename via `logo`.

## Step 3 — Decide if a probe override is needed

The server health check (`app/api/services/route.tsx`) opens a TCP socket to
`SERVER_HOST:port` (SERVER_HOST = the NAS LAN IP, set in docker-compose).
This works for services reachable on the LAN IP — which is most of them. No
route changes are ever needed; it reads the array automatically.

**Exception:** if the service is a Docker container whose LAN-IP path is
intercepted by clash-meta (symptom: `nc -zv <LAN_IP> <port>` succeeds from the
host shell but the probe times out from inside the homepage container), reach
it container-to-container instead. Add probe overrides:

```ts
{ id: 9, name: "My App", port: 1234, logo: "my-app.svg",
  probeHost: "my-app-container", probePort: 80 },
```

- `probeHost`/`probePort` only affect the **server-side health probe**, not the
  user-facing URL (which still uses `port`).
- The container must share a Docker network with `homepage` so the name resolves
  via Docker DNS. Attach it and persist the attachment in `deploy.zsh`:
  `docker network connect home-page_default <my-app-container> 2>/dev/null || true`

(This is exactly how MetaCubeXD is wired — see its entry as a reference.)

## Step 4 — Deploy and verify

```sh
cd /volume3/Dev/Home-Page && ./deploy.zsh
curl -s http://localhost:4869/api/services   # the new id should report online if the port is up
```

Confirm the card shows green in the browser. The components and both hooks
(`useNetworkType`, `useServiceStatuses`) pick up the new entry automatically.

## Notes

- WAN access uses the pattern `app-{port}-<device>.<cn>.ugdocker.link`; reaching
  a new service over WAN requires the port to be exposed in the ugdocker setup
  (external to this repo).
- Do not edit the API route or card components for a normal add — the registry
  array is the single source of truth.

export interface WebsiteItem {
  id: number;
  name: string;
  port: number;
  logo?: string;
  // Section heading the card is grouped under; ungrouped cards render last.
  group?: string;
  // Subdomain under the base domain → https://<subdomain>.<BASE_DOMAIN>. Preferred link.
  subdomain?: string;
  // Link host override. Defaults to localIP. Set for devices that live at a
  // fixed address off the NAS (e.g. the router at router.castamerego.com).
  host?: string;
  // Set false for tiles with no web UI (e.g. game servers) — card renders
  // as a plain div instead of a link.
  link?: boolean;
  // How to health-check. "tcp" (default): connect to probeHost:probePort.
  // "docker": read container state via the docker socket — REQUIRED for
  // auto-sleep game servers, a TCP probe would wake them (Lazytainer counts
  // connections on the game port).
  probe?: "tcp" | "docker";
  // docker probe: container whose State.Running means "online".
  containerName?: string;
  // docker probe: sleep/wake proxy container (Lazytainer/Timid). If the main
  // container is stopped but this one runs, status is "sleeping" not "offline".
  wakeProxy?: string;
  // Server-side health-probe overrides. Defaults to SERVER_HOST:port.
  // Used when a service must be reached at a different host/port than the
  // user-facing one (e.g. a container only reachable by name on a shared network).
  probeHost?: string;
  probePort?: number;
  // Docker network used for container-to-container probing (display only).
  network?: string;
}

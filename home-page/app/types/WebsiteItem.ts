export interface WebsiteItem {
  id: number;
  name: string;
  port: number;
  logo?: string;
  // Subdomain under the base domain → https://<subdomain>.<BASE_DOMAIN>. Preferred link.
  subdomain?: string;
  // Link host override. Defaults to localIP. Set for devices that live at a
  // fixed address off the NAS (e.g. the router at router.castamerego.com).
  host?: string;
  // Server-side health-probe overrides. Defaults to SERVER_HOST:port.
  // Used when a service must be reached at a different host/port than the
  // user-facing one (e.g. a container only reachable by name on a shared network).
  probeHost?: string;
  probePort?: number;
  // Docker network used for container-to-container probing (display only).
  network?: string;
}

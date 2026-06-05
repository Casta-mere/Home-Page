export interface WebsiteItem {
  id: number;
  name: string;
  port: number;
  logo?: string;
  // Link host override. Defaults to localIP/tailscaleIP/domain. Set for devices
  // that live at a fixed address off the NAS (e.g. the router at 192.168.50.1).
  host?: string;
  // Server-side health-probe overrides. Defaults to SERVER_HOST:port.
  // Used when a service must be reached at a different host/port than the
  // user-facing one (e.g. a container only reachable by name on a shared network).
  probeHost?: string;
  probePort?: number;
  // Docker network used for container-to-container probing (display only).
  network?: string;
}

export interface WebsiteItem {
  id: number;
  name: string;
  port: number;
  logo?: string;
  // Server-side health-probe overrides. Defaults to SERVER_HOST:port.
  // Used when a service must be reached at a different host/port than the
  // user-facing one (e.g. a container only reachable by name on a shared network).
  probeHost?: string;
  probePort?: number;
}

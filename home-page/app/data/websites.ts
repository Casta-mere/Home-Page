import { WebsiteItem } from "@/app/types/WebsiteItem";

export const localIP = process.env.NEXT_PUBLIC_LOCAL_IP ?? "192.168.50.71";

export const websites: WebsiteItem[] = [
  { id: 1, name: "MCSM", port: 23333, logo: "mcsm.png" },
  { id: 2, name: "Overleaf", port: 8989, logo: "overleaf-o-logo-primary.svg", subdomain: "overleaf" },
  { id: 3, name: "My Website - Dev", port: 3113, logo: "docusaurus.svg" },
  { id: 4, name: "Bili - Sync", port: 12345, logo: "bili-sync.svg", subdomain: "bilibili" },
  { id: 5, name: "Metube", port: 8048, logo: "metube.png" },
  { id: 6, name: "Home-Assistant", port: 8123, logo: "home-assistant.svg", subdomain: "homeassistant" },
  { id: 7, name: "FlowLedger", port: 4545, logo: "flowledger.png" },
  // metacubexd lives on clash_default; the LAN-IP path is intercepted
  // by clash-meta, so probe it container-to-container by name.
  { id: 8, name: "MetaCubeXD", port: 28002, logo: "metacubexd.png", subdomain: "clash", probeHost: "metacubexd", probePort: 80, network: "clash_default" },
  { id: 9, name: "Grafana", port: 7453, logo: "grafana.svg", subdomain: "grafana" },
  // ch-ui lives on clickhouse_default; probe container-to-container to bypass clash-meta.
  { id: 10, name: "ClickHouse", port: 5521, logo: "clickhouse.svg", subdomain: "clickhouse", probeHost: "ch-ui", probePort: 3488, network: "clickhouse_default" },
  { id: 11, name: "Uptime Kuma", port: 13001, logo: "uptime-kuma.svg", subdomain: "uptime" },
  // Router admin page — fixed host, resolves to 192.168.50.1 on the local net (http only).
  { id: 12, name: "Router", host: "router.castamerego.com", port: 80, logo: "router.svg", probeHost: "192.168.50.1", probePort: 80 },
  { id: 13, name: "Nginx Proxy Manager", port: 8181, logo: "nginx-proxy-manager.svg", subdomain: "nginx" },
  { id: 14, name: "Sub2API", port: 8080, logo: "sub2api.png", subdomain: "sub2api" },
];

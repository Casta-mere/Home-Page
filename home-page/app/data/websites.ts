import { WebsiteItem } from "@/app/types/WebsiteItem";

export const localIP = process.env.NEXT_PUBLIC_LOCAL_IP ?? "192.168.50.71";

// Section order on the page; groups not listed here (and ungrouped cards)
// render last, in registry order.
export const groupOrder = ["应用", "监控", "基础设施", "游戏"];

export const websites: WebsiteItem[] = [
  { id: 1, name: "MCSM", port: 23333, logo: "mcsm.png", group: "游戏" },
  { id: 2, name: "Overleaf", port: 8989, logo: "overleaf-o-logo-primary.svg", subdomain: "overleaf", group: "应用" },
  { id: 3, name: "My Website - Dev", port: 3113, logo: "docusaurus.svg", group: "应用" },
  { id: 4, name: "Bili - Sync", port: 12345, logo: "bili-sync.svg", subdomain: "bilibili", group: "应用" },
  { id: 5, name: "Metube", port: 8048, logo: "metube.png", group: "应用" },
  { id: 6, name: "Home-Assistant", port: 8123, logo: "home-assistant.svg", subdomain: "homeassistant", group: "应用" },
  { id: 7, name: "FlowLedger", port: 4545, logo: "flowledger.png", group: "应用" },
  // metacubexd lives on clash_default; the LAN-IP path is intercepted
  // by clash-meta, so probe it container-to-container by name.
  { id: 8, name: "MetaCubeXD", port: 28002, logo: "metacubexd.png", subdomain: "clash", probeHost: "metacubexd", probePort: 80, network: "clash_default", group: "基础设施" },
  { id: 9, name: "Grafana", port: 7453, logo: "grafana.svg", subdomain: "grafana", group: "监控" },
  // ch-ui lives on clickhouse_default; probe container-to-container to bypass clash-meta.
  { id: 10, name: "ClickHouse", port: 5521, logo: "clickhouse.svg", subdomain: "clickhouse", probeHost: "ch-ui", probePort: 3488, network: "clickhouse_default", group: "基础设施" },
  { id: 11, name: "Uptime Kuma", port: 13001, logo: "uptime-kuma.svg", subdomain: "uptime", group: "监控" },
  // Router admin page — fixed host, resolves to 192.168.50.1 on the local net (http only).
  { id: 12, name: "Router", host: "router.castamerego.com", port: 80, logo: "router.svg", probeHost: "192.168.50.1", probePort: 80, group: "基础设施" },
  { id: 13, name: "Nginx Proxy Manager", port: 8181, logo: "nginx-proxy-manager.svg", subdomain: "nginx", group: "基础设施" },
  { id: 14, name: "Sub2API", port: 8080, logo: "sub2api.png", subdomain: "sub2api", group: "应用" },
  { id: 15, name: "Twingate", port: 7576, logo: "twingate.svg", subdomain: "twingate", group: "基础设施" },
  { id: 16, name: "DST Server Manager", port: 4870, logo: "dst.svg", subdomain: "dst", group: "游戏" },
  { id: 17, name: "Web Terminal", port: 7681, logo: "ttyd.svg", subdomain: "term", group: "基础设施" },
  { id: 18, name: "TokenLens", port: 4900, logo: "tokenlens.svg", subdomain: "tokenlens", group: "应用" },
  { id: 19, name: "icloud2nas", port: 4871, logo: "icloud2nas.svg", subdomain: "icloud2nas", group: "应用" },
  { id: 20, name: "Apprise", port: 8000, logo: "apprise.svg", subdomain: "apprise", group: "监控" },
  { id: 21, name: "Bark Server", port: 8087, logo: "bark.png", subdomain: "bark", group: "监控" },
];

import { WebsiteItem } from "@/app/types/WebsiteItem";

export const localIP = process.env.NEXT_PUBLIC_LOCAL_IP ?? "192.168.50.71";
export const tailscaleIP = process.env.NEXT_PUBLIC_TAILSCALE_IP ?? "100.92.232.30";

export const websites: WebsiteItem[] = [
  { id: 1, name: "MCSM", port: 23333, logo: "mcsm.ico" },
  { id: 2, name: "Overleaf", port: 8989, logo: "overleaf-o-logo-primary.svg" },
  { id: 3, name: "My Website - Dev", port: 3000, logo: "docusaurus.svg" },
  { id: 4, name: "Bili - Sync", port: 12345, logo: "bili-sync.svg" },
  { id: 5, name: "Metube", port: 8048, logo: "metube.ico" },
  { id: 6, name: "Home-Assistant", port: 8123, logo: "home-assistant.svg" },
  { id: 7, name: "FlowLedger", port: 4545, logo: "flowledger.png" },
  { id: 8, name: "MetaCubeXD", port: 28002, logo: "metacubexd.ico" },
];

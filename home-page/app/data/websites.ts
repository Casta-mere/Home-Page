import { WebsiteItem } from "@/app/types/WebsiteItem";

export const localIP = "192.168.50.71";
export const tailscaleIP = "100.92.232.30";
export const websites: WebsiteItem[] = [
  { id: 1, name: "MCSM", port: 23333, logo: "mcsm.ico" },
  { id: 2, name: "Overleaf", port: 8989, logo: "overleaf-o-logo-primary.svg" },
  { id: 3, name: "My Website - Dev", port: 3000, logo: "docusaurus.svg" },
];

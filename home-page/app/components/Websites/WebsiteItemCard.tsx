"use client";

import { WebsiteItem } from "@/app/types/WebsiteItem";
import { ConnectStatus } from "@/app/hooks/useServiceStatuses";
import { localIP } from "@/app/data/websites";
import { Tooltip } from "@radix-ui/themes";
import { TbNetwork } from "react-icons/tb";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "castamerego.com";

const STATUS_CLASS: Record<ConnectStatus, string> = {
  online: "on",
  offline: "off",
  checking: "chk",
};

const STATUS_LABEL: Record<ConnectStatus, string> = {
  online: "Online",
  offline: "Offline",
  checking: "Checking",
};

// The probe can be wrong (e.g. clash-intercepted paths), so cards always link.
const websiteUrl = (website: WebsiteItem): string => {
  // Fixed-host entries (e.g. the router) link to a constant address over http.
  if (website.host) {
    const suffix = website.port === 80 ? "" : `:${website.port}`;
    return `http://${website.host}${suffix}`;
  }
  // Services behind Nginx Proxy Manager are reached by their domain.
  if (website.subdomain) return `https://${website.subdomain}.${BASE_DOMAIN}`;
  // Fallback for tiles not yet proxied: direct LAN address.
  return `http://${localIP}:${website.port}`;
};

const NetworkHint = ({ network }: { network: string }) => (
  <Tooltip content={network}>
    <span
      style={{ cursor: "help", color: "var(--hl-muted)", display: "flex", alignItems: "center" }}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
    >
      <TbNetwork size={14} />
    </span>
  </Tooltip>
);

const Logo = ({ website, size }: { website: WebsiteItem; size: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src={"/static/logo/" + website.logo}
    alt={website.name}
    style={{ width: size, height: size }}
    className="object-contain rounded-md"
  />
);

const WebsiteItemCard = ({
  website,
  serviceOnline,
  view,
}: {
  website: WebsiteItem;
  serviceOnline: boolean | undefined;
  view: "cards" | "launcher";
}) => {
  const status: ConnectStatus =
    serviceOnline === undefined ? "checking" : serviceOnline ? "online" : "offline";
  const st = STATUS_CLASS[status];

  if (view === "launcher") {
    return (
      <a href={websiteUrl(website)} target="_blank" rel="noreferrer" className={`l-card ${st}`}>
        <div className="l-tile">
          {website.logo && <Logo website={website} size={42} />}
          <span className={`l-dot ${st}`} />
        </div>
        <div className="l-name">{website.name}</div>
      </a>
    );
  }

  return (
    <a href={websiteUrl(website)} target="_blank" rel="noreferrer" className={`svc-card ${st}`}>
      <div className="svc-info">
        <div className="flex items-center gap-1">
          <span className="svc-name">{website.name}</span>
          {website.network && <NetworkHint network={website.network} />}
        </div>
        <span className={`svc-chip ${st}`}>{STATUS_LABEL[status]}</span>
      </div>
      {website.logo && (
        <div className="svc-tile">
          <Logo website={website} size={40} />
        </div>
      )}
    </a>
  );
};

export default WebsiteItemCard;

"use client";

import { WebsiteItem } from "@/app/types/WebsiteItem";
import { ConnectStatus, ServiceStatus } from "@/app/hooks/useServiceStatuses";
import { localIP } from "@/app/data/websites";
import { Tooltip } from "@radix-ui/themes";
import { TbNetwork } from "react-icons/tb";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "castamerego.com";

const STATUS_CLASS: Record<ConnectStatus, string> = {
  online: "on",
  offline: "off",
  checking: "chk",
  sleeping: "slp",
};

const STATUS_LABEL: Record<ConnectStatus, string> = {
  online: "Online",
  offline: "Offline",
  checking: "Checking",
  sleeping: "Sleeping",
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
  serviceStatus,
  view,
}: {
  website: WebsiteItem;
  serviceStatus: ServiceStatus | undefined;
  view: "cards" | "launcher";
}) => {
  const status: ConnectStatus = serviceStatus?.status ?? "checking";
  const st = STATUS_CLASS[status];

  // Tiles without a web UI (game servers) render as plain divs.
  const linkProps =
    website.link === false
      ? ({ as: "div" } as const)
      : ({ as: "a", href: websiteUrl(website), target: "_blank", rel: "noreferrer" } as const);

  if (view === "launcher") {
    const inner = (
      <>
        <div className="l-tile">
          {website.logo && <Logo website={website} size={42} />}
          <span className={`l-dot ${st}`} />
        </div>
        <div className="l-name">{website.name}</div>
      </>
    );
    return linkProps.as === "a" ? (
      <a href={linkProps.href} target="_blank" rel="noreferrer" className={`l-card ${st}`}>
        {inner}
      </a>
    ) : (
      <div className={`l-card ${st} no-link`} title={STATUS_LABEL[status]}>{inner}</div>
    );
  }

  const inner = (
    <>
      <div className="svc-info">
        <div className="flex items-center gap-1">
          <span className="svc-name">{website.name}</span>
          {website.network && <NetworkHint network={website.network} />}
        </div>
        {/* game tiles aren't clickable — the shadow color already carries
            their status, so skip the chip */}
        {website.link !== false && (
          <span className={`svc-chip ${st}`}>{STATUS_LABEL[status]}</span>
        )}
      </div>
      {website.logo && (
        <div className="svc-tile">
          <Logo website={website} size={40} />
        </div>
      )}
    </>
  );

  return linkProps.as === "a" ? (
    <a href={linkProps.href} target="_blank" rel="noreferrer" className={`svc-card ${st}`}>
      {inner}
    </a>
  ) : (
    <div className={`svc-card ${st} no-link`}>{inner}</div>
  );
};

export default WebsiteItemCard;

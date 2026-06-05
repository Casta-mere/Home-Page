"use client";

import { WebsiteItem } from "@/app/types/WebsiteItem";
import { ConnectStatus } from "@/app/hooks/useServiceStatuses";
import { localIP } from "@/app/data/websites";
import { Card, Flex, Heading, Skeleton, Text, Tooltip } from "@radix-ui/themes";
import { TbNetwork } from "react-icons/tb";
import classNames from "classnames";

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? "castamerego.com";

const STATUS_STYLE: Record<ConnectStatus, { bg: string; border: string }> = {
  online:   { bg: "var(--green-3)",  border: "var(--green-6)" },
  offline:  { bg: "var(--red-3)",   border: "var(--red-6)" },
  checking: { bg: "var(--yellow-3)", border: "var(--yellow-6)" },
};

const WebsiteItemCard = ({
  website,
  serviceOnline,
}: {
  website: WebsiteItem;
  serviceOnline: boolean | undefined;
}) => {
  const status: ConnectStatus =
    serviceOnline === undefined ? "checking" : serviceOnline ? "online" : "offline";

  const url = (() => {
    if (!serviceOnline) return null;
    // Fixed-host entries (e.g. the router) link to a constant address over http.
    if (website.host) {
      const suffix = website.port === 80 ? "" : `:${website.port}`;
      return `http://${website.host}${suffix}`;
    }
    // Services behind Nginx Proxy Manager are reached by their domain.
    if (website.subdomain) return `https://${website.subdomain}.${BASE_DOMAIN}`;
    // Fallback for tiles not yet proxied: direct LAN address.
    return `http://${localIP}:${website.port}`;
  })();

  const { bg, border } = STATUS_STYLE[status];

  return (
    <Card
      size="1"
      className={classNames(
        "cursor-pointer min-h-28 overflow-hidden rounded-xl px-4 py-3",
        "transition-all hover:translate-y-[-5px] hover:scale-[1.01]",
        "hover:shadow-[0_3px_10px_0_rgba(164,190,217,0.3)]"
      )}
      style={{ backgroundColor: bg, borderColor: border }}
      onClick={() => url && window.open(url, "_blank")}
    >
      <Flex justify="between" align="center" height="100%">
        <Flex direction="column" gap="2" p="2">
          <Flex align="center" gap="1">
            <Heading as="h3" size="4">{website.name}</Heading>
            {website.network && (
              <Tooltip content={website.network}>
                <span
                  style={{ cursor: "help", color: "var(--gray-8)", display: "flex", alignItems: "center" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <TbNetwork size={14} />
                </span>
              </Tooltip>
            )}
          </Flex>
          <Skeleton loading={status === "checking"}>
            <Text size="2">
              {status === "online" ? "🟢 Online" : "🔴 Offline"}
            </Text>
          </Skeleton>
        </Flex>
        {website.logo && (
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-white/60 shadow-sm flex-shrink-0">
            <img
              src={"/static/logo/" + website.logo}
              alt={website.name}
              className="w-10 h-10 object-contain rounded-md"
            />
          </div>
        )}
      </Flex>
    </Card>
  );
};

export default WebsiteItemCard;

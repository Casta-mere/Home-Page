"use client";

import { WebsiteItem } from "@/app/types/WebsiteItem";
import { ConnectMethod, ConnectStatus } from "@/app/hooks/useNetworkDetection";
import { localIP, tailscaleIP } from "@/app/data/websites";
import { Card, Flex, Heading, Skeleton, Text, Tooltip } from "@radix-ui/themes";
import { TbNetwork } from "react-icons/tb";
import classNames from "classnames";

const STATUS_STYLE: Record<ConnectStatus, { bg: string; border: string }> = {
  online:   { bg: "var(--green-3)",  border: "var(--green-6)" },
  offline:  { bg: "var(--red-3)",   border: "var(--red-6)" },
  checking: { bg: "var(--yellow-3)", border: "var(--yellow-6)" },
};

const methodLabel = (method: ConnectMethod) => {
  switch (method) {
    case "local":     return "local net";
    case "tailscale": return "Tailscale";
    case "domain":    return "wan net";
    default:          return "unavailable";
  }
};

const WebsiteItemCard = ({
  website,
  networkMethod,
  serviceOnline,
  domainPattern,
}: {
  website: WebsiteItem;
  networkMethod: ConnectMethod;
  serviceOnline: boolean | undefined;
  domainPattern: string | null;
}) => {
  const status: ConnectStatus =
    serviceOnline === undefined ? "checking" : serviceOnline ? "online" : "offline";

  const url = (() => {
    if (!serviceOnline) return null;
    switch (networkMethod) {
      case "local":     return `http://${localIP}:${website.port}`;
      case "tailscale": return `http://${tailscaleIP}:${website.port}`;
      case "domain":    return domainPattern?.replace("{port}", String(website.port)) ?? null;
      default:          return null;
    }
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
              {status === "online"
                ? `🟢 Online (${methodLabel(networkMethod)})`
                : "🔴 Offline"}
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

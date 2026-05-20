"use client";

import { WebsiteItem } from "@/app/types/WebsiteItem";
import { ConnectMethod, ConnectStatus, useNetworkDetection } from "@/app/hooks/useNetworkDetection";
import { Card, Flex, Heading, Skeleton, Text } from "@radix-ui/themes";
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
  refreshKey,
}: {
  website: WebsiteItem;
  refreshKey: number;
}) => {
  const { status, url, method } = useNetworkDetection(website, refreshKey);
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
        <Flex direction="column" gap="1" p="2">
          <Heading as="h3" size="4">{website.name}</Heading>
          <Text size="1" color="gray">:{website.port}</Text>
          <Skeleton loading={status === "checking"}>
            <Text size="2">
              {status === "online"
                ? `🟢 Online (${methodLabel(method)})`
                : "🔴 Offline"}
            </Text>
          </Skeleton>
        </Flex>
        {website.logo && (
          <img
            src={"/static/logo/" + website.logo}
            alt={website.name}
            className="w-12 h-12 object-contain flex-shrink-0"
          />
        )}
      </Flex>
    </Card>
  );
};

export default WebsiteItemCard;

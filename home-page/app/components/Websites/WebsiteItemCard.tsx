"use client";

import { localIP, tailscaleIP } from "@/app/data/websites";
import { WebsiteItem } from "@/app/types/WebsiteItem";
import { Card, Flex, Heading } from "@radix-ui/themes";
import classNames from "classnames";
import { useEffect, useState } from "react";

type ConnectMethod = "local" | "tailscale" | "domain" | null;

const canReachViaImg = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = `${url}/favicon.ico?_t=${Date.now()}`;
    img.onload = () => resolve(true);
    img.onerror = () => resolve(true);
    setTimeout(() => resolve(false), 1500);
  });
};

const WebsiteItemCard = ({ website }: { website: WebsiteItem }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"checking" | "online" | "offline">(
    "checking"
  );
  const [method, setMethod] = useState<ConnectMethod>(null);

  useEffect(() => {
    const checkURL = async () => {
      const localURL = `http://${localIP}:${website.port}`;
      const tailscaleURL = `http://${tailscaleIP}:${website.port}`;
      const domainURL = `https://app-${website.port}-casta-dxp4800.cn14.ugdocker.link`;

      if (await canReachViaImg(localURL)) {
        setUrl(localURL);
        setStatus("online");
        setMethod("local");
      } else if (await canReachViaImg(tailscaleURL)) {
        setUrl(tailscaleURL);
        setStatus("online");
        setMethod("tailscale");
      } else if (await canReachViaImg(domainURL)) {
        setUrl(domainURL);
        setStatus("online");
        setMethod("domain");
      } else {
        setUrl(null);
        setStatus("offline");
        setMethod(null);
      }
    };

    checkURL();
  }, [website]);

  const methodLabel = () => {
    switch (method) {
      case "local":
        return "local net";
      case "tailscale":
        return "Tailscale net";
      case "domain":
        return "wan net";
      default:
        return "unaviable";
    }
  };

  return (
    <>
      <Card
        size="1"
        className={classNames({
          "card cursor-pointer min-h-28r overflow-hidden rounded-card px-4 py-1":
            true,
          "transition-all hover:translate-y-[-5px] hover:scale-[1.01] hover:shadow-[0_3px_10px_0_rgba(164,190,217,0.3)]":
            true,
          "bg-green-200 border-green-300": status === "online",
          "bg-red-200 border-red-300": status === "offline",
          "bg-yellow-200 border-yellow-300": status === "checking",
        })}
        onClick={() => (url ? window.open(url, "_blank") : null)}
      >
        <Flex justify="between" className="items-center">
          <Flex direction="column" gap="3" p="2">
            <Heading as="h3" className="text-xl font-bold">
              {website.name}
            </Heading>
            <p>
              {status === "checking"
                ? "⏳ 检测中..."
                : status === "online"
                ? `🟢 Online (${methodLabel()})`
                : "🔴 Offline"}
            </p>
          </Flex>
          {website.logo && (
            <img
              src={"/static/logo/" + website.logo}
              alt={website.name}
              className="w-12 h-12 object-contain"
            />
          )}
        </Flex>
      </Card>
    </>
  );
};

export default WebsiteItemCard;

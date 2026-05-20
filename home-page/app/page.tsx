"use client";

import { WebsiteItemCards } from "./components";
import { Flex, Heading, IconButton, Text } from "@radix-ui/themes";
import { useState, useCallback, useEffect } from "react";
import { RxReload } from "react-icons/rx";
import { useWanDomain } from "./hooks/useWanDomain";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [wanTrigger, setWanTrigger] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const wanDomain = useWanDomain(wanTrigger);

  useEffect(() => {
    setLastRefreshed(new Date());
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setLastRefreshed(new Date());
  }, []);

  const redetectWan = useCallback(() => {
    // Clear cache and re-probe
    try { localStorage.removeItem("ugreen_wan_cn"); } catch {}
    setWanTrigger((k) => k + 1);
  }, []);

  const timeStr = lastRefreshed
    ? lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  const wanLabel =
    wanDomain.phase === "ready"
      ? `WAN: ${wanDomain.cn} ✓`
      : wanDomain.phase === "detecting"
      ? "WAN: detecting…"
      : wanDomain.phase === "failed"
      ? "WAN: not found"
      : "WAN: –";

  return (
    <Flex direction="column" gap="5" mt="8">
      <Flex align="center" justify="between">
        <Heading>内网资源</Heading>
        <Flex align="center" gap="3">
          <Text
            size="1"
            color="gray"
            className="cursor-pointer hover:underline"
            onClick={redetectWan}
            title="Click to re-detect WAN domain"
            suppressHydrationWarning
          >
            {wanLabel}
          </Text>
          <Text size="2" color="gray" suppressHydrationWarning>
            Last checked: {timeStr}
          </Text>
          <IconButton variant="ghost" onClick={refresh} aria-label="Refresh all">
            <RxReload />
          </IconButton>
        </Flex>
      </Flex>
      <WebsiteItemCards
        refreshKey={refreshKey}
        domainPattern={wanDomain.phase === "ready" ? wanDomain.pattern : null}
      />
    </Flex>
  );
}

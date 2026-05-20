"use client";

import { WebsiteItemCards } from "./components";
import { Flex, Heading, IconButton, Text } from "@radix-ui/themes";
import { useState, useCallback, useEffect } from "react";
import { RxReload } from "react-icons/rx";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    setLastRefreshed(new Date());
  }, []);

  const refresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setLastRefreshed(new Date());
  }, []);

  const timeStr = lastRefreshed
    ? lastRefreshed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <Flex direction="column" gap="5" mt="8">
      <Flex align="center" justify="between">
        <Heading>内网资源</Heading>
        <Flex align="center" gap="3">
          <Text size="2" color="gray" suppressHydrationWarning>
            Last checked: {timeStr}
          </Text>
          <IconButton variant="ghost" onClick={refresh} aria-label="Refresh all">
            <RxReload />
          </IconButton>
        </Flex>
      </Flex>
      <WebsiteItemCards refreshKey={refreshKey} />
    </Flex>
  );
}

"use client";

import { WebsiteItemCards } from "./components";
import ThemeToggle from "./components/ThemeToggle";
import { Flex, Heading } from "@radix-ui/themes";
import { useState, useCallback, useEffect } from "react";
import { RxReload } from "react-icons/rx";
import { TbLayoutGrid, TbLayoutList } from "react-icons/tb";
import { useServiceStatuses } from "./hooks/useServiceStatuses";

type ViewMode = "cards" | "launcher";

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [view, setView] = useState<ViewMode>("cards");
  const { statuses, lastChecked } = useServiceStatuses(refreshKey);

  // Restore the saved view after mount (reading localStorage during render
  // would mismatch the server-rendered markup).
  useEffect(() => {
    if (localStorage.getItem("homepage-view") === "launcher") setView("launcher");
  }, []);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const toggleView = () =>
    setView((v) => {
      const next: ViewMode = v === "cards" ? "launcher" : "cards";
      localStorage.setItem("homepage-view", next);
      return next;
    });

  const timeStr = lastChecked
    ? lastChecked.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <Flex direction="column" gap="6" pt="8">
      <Flex align="end" justify="between" wrap="wrap" gap="4">
        <div>
          <Heading size="7">内网资源</Heading>
          <div className="hl-prompt">
            $ homelab status --all
            <span className="hl-cursor" />
          </div>
        </div>
        <Flex align="center" gap="3">
          <span className="hl-checked" suppressHydrationWarning>
            last checked {timeStr}
          </span>
          <button className="hl-btn" onClick={refresh} aria-label="Refresh all">
            <RxReload />
          </button>
          <button
            className="hl-btn"
            onClick={toggleView}
            aria-label="Toggle view"
            title={view === "cards" ? "切换到启动台视图" : "切换到卡片视图"}
          >
            {view === "cards" ? <TbLayoutGrid /> : <TbLayoutList />}
          </button>
          <ThemeToggle />
        </Flex>
      </Flex>
      <WebsiteItemCards serviceStatuses={statuses} view={view} />
    </Flex>
  );
}

"use client";

import { useEffect, useState } from "react";

export type ConnectStatus = "checking" | "online" | "offline";

const REFRESH_INTERVAL_MS = 180_000;

export const useServiceStatuses = (
  refreshKey: number = 0
): { statuses: Map<number, boolean>; lastChecked: Date | null } => {
  const [statuses, setStatuses] = useState<Map<number, boolean>>(new Map());
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Clear to "checking" on each manual refresh (refreshKey change) so cards
    // give visible feedback. The 180s interval calls poll() directly without
    // re-running this effect, so auto-refresh stays smooth (no skeleton flash).
    setStatuses(new Map());

    const poll = async () => {
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        const data: { id: number; online: boolean }[] = await res.json();
        if (!cancelled) {
          setStatuses(new Map(data.map((s) => [s.id, s.online])));
          setLastChecked(new Date());
        }
      } catch {
        // leave statuses unchanged on network error
      }
    };

    poll();
    const interval = setInterval(poll, REFRESH_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [refreshKey]);

  return { statuses, lastChecked };
};

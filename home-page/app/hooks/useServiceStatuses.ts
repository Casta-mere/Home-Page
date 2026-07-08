"use client";

import { useEffect, useState } from "react";

export type ConnectStatus = "checking" | "online" | "offline" | "sleeping";

export type ServiceStatus = {
  status: Exclude<ConnectStatus, "checking">;
  latencyMs: number | null;
};

const REFRESH_INTERVAL_MS = 180_000;

export const useServiceStatuses = (
  refreshKey: number = 0
): { statuses: Map<number, ServiceStatus>; lastChecked: Date | null } => {
  const [statuses, setStatuses] = useState<Map<number, ServiceStatus>>(new Map());
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Clear to "checking" on each manual refresh (refreshKey change) so cards
    // give visible feedback. The 180s interval calls poll() directly without
    // re-running this effect, so auto-refresh stays smooth.
    setStatuses(new Map());

    const poll = async () => {
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        const data: ({ id: number } & ServiceStatus)[] = await res.json();
        if (!cancelled) {
          setStatuses(new Map(data.map((s) => [s.id, { status: s.status, latencyMs: s.latencyMs }])));
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

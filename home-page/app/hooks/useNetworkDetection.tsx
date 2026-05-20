"use client";

import { useEffect, useState } from "react";

export type ConnectMethod = "local" | "tailscale" | "domain" | null;
export type ConnectStatus = "checking" | "online" | "offline";

const localIP = process.env.NEXT_PUBLIC_LOCAL_IP ?? "192.168.50.71";
const tailscaleIP = process.env.NEXT_PUBLIC_TAILSCALE_IP ?? "100.92.232.30";

const URL_TIMEOUT_MS = 1500;
const REFRESH_INTERVAL_MS = 180_000;

const canReach = async (url: string): Promise<boolean> => {
  try {
    await fetch(url, {
      mode: "no-cors",
      cache: "no-store",
      signal: AbortSignal.timeout(URL_TIMEOUT_MS),
    });
    return true;
  } catch {
    return false;
  }
};

export const useNetworkType = (
  refreshKey: number = 0,
  domainPattern: string | null = null,
): ConnectMethod => {
  const [method, setMethod] = useState<ConnectMethod>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      // Probe the homepage's own port to detect network type.
      // Using the app port avoids false negatives from CORP headers on individual
      // services (e.g. Overleaf sets Cross-Origin-Resource-Policy: same-origin).
      const appPort = typeof window !== "undefined"
        ? (window.location.port || "4869")
        : "4869";

      const domainURL = domainPattern
        ? domainPattern.replace("{port}", appPort)
        : null;

      const [localOk, tailscaleOk, domainOk] = await Promise.all([
        canReach(`http://${localIP}:${appPort}`),
        canReach(`http://${tailscaleIP}:${appPort}`),
        domainURL ? canReach(domainURL) : Promise.resolve(false),
      ]);

      if (cancelled) return;

      if (localOk) setMethod("local");
      else if (tailscaleOk) setMethod("tailscale");
      else if (domainOk) setMethod("domain");
      else setMethod(null);
    };

    run();
    const interval = setInterval(run, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [refreshKey, domainPattern]);

  return method;
};

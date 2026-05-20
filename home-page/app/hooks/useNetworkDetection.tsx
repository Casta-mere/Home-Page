"use client";

import { useEffect, useState } from "react";
import { WebsiteItem } from "@/app/types/WebsiteItem";

export type ConnectMethod = "local" | "tailscale" | "domain" | null;
export type ConnectStatus = "checking" | "online" | "offline";

const localIP = process.env.NEXT_PUBLIC_LOCAL_IP ?? "192.168.50.71";
const tailscaleIP = process.env.NEXT_PUBLIC_TAILSCALE_IP ?? "100.92.232.30";
const domainPattern =
  process.env.NEXT_PUBLIC_DOMAIN_PATTERN ??
  "https://app-{port}-casta-dxp4800.cn14.ugdocker.link";

const TIMEOUT_MS = 1500;
const REFRESH_INTERVAL_MS = 30_000;

// fetch with no-cors: resolves for any HTTP response, rejects only on network error/timeout
const canReach = async (url: string): Promise<boolean> => {
  try {
    await fetch(url, {
      mode: "no-cors",
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return true;
  } catch {
    return false;
  }
};

export const useNetworkDetection = (website: WebsiteItem, refreshKey: number = 0) => {
  const [status, setStatus] = useState<ConnectStatus>("checking");
  const [url, setUrl] = useState<string | null>(null);
  const [method, setMethod] = useState<ConnectMethod>(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setStatus("checking");
      const localURL = `http://${localIP}:${website.port}`;
      const tailscaleURL = `http://${tailscaleIP}:${website.port}`;
      const domainURL = domainPattern.replace("{port}", String(website.port));

      const [localOk, tailscaleOk, domainOk] = await Promise.all([
        canReach(localURL),
        canReach(tailscaleURL),
        canReach(domainURL),
      ]);

      if (cancelled) return;

      if (localOk) {
        setUrl(localURL); setStatus("online"); setMethod("local");
      } else if (tailscaleOk) {
        setUrl(tailscaleURL); setStatus("online"); setMethod("tailscale");
      } else if (domainOk) {
        setUrl(domainURL); setStatus("online"); setMethod("domain");
      } else {
        setUrl(null); setStatus("offline"); setMethod(null);
      }
    };

    run();
    const interval = setInterval(run, REFRESH_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [website.port, refreshKey]);

  return { status, url, method };
};

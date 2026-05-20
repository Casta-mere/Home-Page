"use client";

import { useEffect, useState } from "react";

// Known cn candidates — ordered by most recently seen first for faster hits.
const CN_CANDIDATES = [
  "cn20", "cn14", "cn19", "cn21", "cn18",
  "cn22", "cn15", "cn25", "cn10", "cn30",
  "cn01", "cn05", "cn08", "cn12", "cn16",
];
const DEVICE_NAME = "casta-dxp4800";
const PROBE_PORT = 4869; // homepage is always running
const CACHE_KEY = "ugreen_wan_cn";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const PROBE_TIMEOUT_MS = 2000;

type CacheEntry = { cn: string; cachedAt: number };

const readCache = (): string | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { cn, cachedAt }: CacheEntry = JSON.parse(raw);
    if (Date.now() - cachedAt > CACHE_TTL_MS) return null;
    return cn;
  } catch {
    return null;
  }
};

const writeCache = (cn: string) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ cn, cachedAt: Date.now() }));
  } catch {}
};

const probeCandidate = (cn: string): Promise<string | null> =>
  fetch(`https://app-${PROBE_PORT}-${DEVICE_NAME}.${cn}.ugdocker.link`, {
    mode: "no-cors",
    cache: "no-store",
    signal: AbortSignal.timeout(PROBE_TIMEOUT_MS),
  })
    .then(() => cn)
    .catch(() => null);

export type WanDomainState =
  | { phase: "idle" | "detecting" | "failed"; cn: null; pattern: null }
  | { phase: "ready"; cn: string; pattern: string };

export const useWanDomain = (triggerKey: number = 0) => {
  const [state, setState] = useState<WanDomainState>({ phase: "idle", cn: null, pattern: null });

  useEffect(() => {
    let cancelled = false;

    const detect = async () => {
      // Try cache first
      const cached = readCache();
      if (cached && !cancelled) {
        setState({
          phase: "ready",
          cn: cached,
          pattern: `https://app-{port}-${DEVICE_NAME}.${cached}.ugdocker.link`,
        });
        return;
      }

      if (!cancelled) setState({ phase: "detecting", cn: null, pattern: null });

      // Probe all candidates in parallel; use first winner
      const results = await Promise.all(CN_CANDIDATES.map(probeCandidate));
      if (cancelled) return;

      const winner = results.find((r) => r !== null) ?? null;
      if (winner) {
        writeCache(winner);
        setState({
          phase: "ready",
          cn: winner,
          pattern: `https://app-{port}-${DEVICE_NAME}.${winner}.ugdocker.link`,
        });
      } else {
        setState({ phase: "failed", cn: null, pattern: null });
      }
    };

    detect();
    return () => { cancelled = true; };
  }, [triggerKey]);

  return state;
};

import net from "net";
import http from "http";
import { NextResponse } from "next/server";
import { websites } from "@/app/data/websites";
import { WebsiteItem } from "@/app/types/WebsiteItem";

export const dynamic = "force-dynamic";

const HOST = process.env.SERVER_HOST ?? "localhost";
const TIMEOUT_MS = 2000;
const CACHE_TTL_MS = 20_000;
const DOCKER_SOCKET = "/var/run/docker.sock";

export type ServiceState = "online" | "offline" | "sleeping";
export type ServiceResult = { id: number; status: ServiceState; latencyMs: number | null };

const isPortOpen = (host: string, port: number): Promise<boolean> =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const timer = setTimeout(() => { socket.destroy(); resolve(false); }, TIMEOUT_MS);
    socket.once("connect", () => { clearTimeout(timer); socket.destroy(); resolve(true); });
    socket.once("error", () => { clearTimeout(timer); resolve(false); });
  });

// Container state via the docker socket (mounted read-only in compose).
const isContainerRunning = (name: string): Promise<boolean> =>
  new Promise((resolve) => {
    const req = http.request(
      { socketPath: DOCKER_SOCKET, path: `/containers/${name}/json`, timeout: TIMEOUT_MS },
      (res) => {
        let body = "";
        res.on("data", (c) => { body += c; });
        res.on("end", () => {
          if (res.statusCode !== 200) return resolve(false);
          try { resolve(JSON.parse(body).State?.Running === true); }
          catch { resolve(false); }
        });
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => req.destroy());
    req.end();
  });

const probeService = async (w: WebsiteItem): Promise<ServiceResult> => {
  if (w.probe === "docker" && w.containerName) {
    if (await isContainerRunning(w.containerName)) {
      return { id: w.id, status: "online", latencyMs: null };
    }
    if (w.wakeProxy && (await isContainerRunning(w.wakeProxy))) {
      return { id: w.id, status: "sleeping", latencyMs: null };
    }
    return { id: w.id, status: "offline", latencyMs: null };
  }
  const started = Date.now();
  const open = await isPortOpen(w.probeHost ?? HOST, w.probePort ?? w.port);
  return {
    id: w.id,
    status: open ? "online" : "offline",
    latencyMs: open ? Date.now() - started : null,
  };
};

const probeAll = (): Promise<ServiceResult[]> => Promise.all(websites.map(probeService));

// Short-lived cache + in-flight coalescing so several open tabs don't each
// trigger a full probe sweep per poll.
let cached: { at: number; results: ServiceResult[] } | null = null;
let inflight: Promise<ServiceResult[]> | null = null;

export async function GET() {
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json(cached.results);
  }
  if (!inflight) {
    inflight = probeAll()
      .then((results) => {
        cached = { at: Date.now(), results };
        return results;
      })
      .finally(() => { inflight = null; });
  }
  return NextResponse.json(await inflight);
}

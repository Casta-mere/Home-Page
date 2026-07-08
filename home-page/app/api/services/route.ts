import net from "net";
import { NextResponse } from "next/server";
import { websites } from "@/app/data/websites";

export const dynamic = "force-dynamic";

const HOST = process.env.SERVER_HOST ?? "localhost";
const TIMEOUT_MS = 2000;
const CACHE_TTL_MS = 20_000;

const isPortOpen = (host: string, port: number): Promise<boolean> =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const timer = setTimeout(() => { socket.destroy(); resolve(false); }, TIMEOUT_MS);
    socket.once("connect", () => { clearTimeout(timer); socket.destroy(); resolve(true); });
    socket.once("error", () => { clearTimeout(timer); resolve(false); });
  });

type ServiceResult = { id: number; online: boolean };

const probeAll = (): Promise<ServiceResult[]> =>
  Promise.all(
    websites.map(async ({ id, port, probeHost, probePort }) => ({
      id,
      online: await isPortOpen(probeHost ?? HOST, probePort ?? port),
    }))
  );

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

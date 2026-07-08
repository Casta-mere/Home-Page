import net from "net";
import { NextResponse } from "next/server";
import { websites } from "@/app/data/websites";

const HOST = process.env.SERVER_HOST ?? "localhost";
const TIMEOUT_MS = 2000;

const isPortOpen = (host: string, port: number): Promise<boolean> =>
  new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const timer = setTimeout(() => { socket.destroy(); resolve(false); }, TIMEOUT_MS);
    socket.once("connect", () => { clearTimeout(timer); socket.destroy(); resolve(true); });
    socket.once("error", () => { clearTimeout(timer); resolve(false); });
  });

export async function GET() {
  const results = await Promise.all(
    websites.map(async ({ id, port, probeHost, probePort }) => ({
      id,
      online: await isPortOpen(probeHost ?? HOST, probePort ?? port),
    }))
  );
  return NextResponse.json(results);
}

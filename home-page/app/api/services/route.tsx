import { NextResponse } from "next/server";
import { websites } from "@/app/data/websites";

export async function GET() {
  const results = await Promise.all(
    websites.map(async (site) => {
      const url = `http://localhost:${site.port}`;
      try {
        const res = await fetch(url, {
          method: "GET",
          cache: "no-store",
        });
        console.log(url, res.status);
        const isOnline = res.status < 400;
        return { id: site.id, status: isOnline ? "online" : "offline" };
      } catch (error) {
        console.log(url, error);
        return { id: site.id, status: "offline" };
      }
    })
  );

  return NextResponse.json(results);
}

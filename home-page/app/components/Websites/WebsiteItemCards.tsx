"use client";

import React from "react";
import WebsiteItemCard from "./WebsiteItemCard";
import { websites, groupOrder } from "@/app/data/websites";
import { ServiceStatus } from "@/app/hooks/useServiceStatuses";
import { WebsiteItem } from "@/app/types/WebsiteItem";

const groupedWebsites = (): [string | null, WebsiteItem[]][] => {
  const buckets = new Map<string | null, WebsiteItem[]>();
  for (const w of websites) {
    const key = w.group ?? null;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(w);
  }
  const ordered: [string | null, WebsiteItem[]][] = [];
  for (const g of groupOrder) {
    if (buckets.has(g)) { ordered.push([g, buckets.get(g)!]); buckets.delete(g); }
  }
  for (const [g, items] of buckets) ordered.push([g, items]);
  return ordered;
};

const WebsiteItemCards = ({
  serviceStatuses,
  view,
  grouped,
}: {
  serviceStatuses: Map<number, ServiceStatus>;
  view: "cards" | "launcher";
  grouped: boolean;
}) => {
  const sections: [string | null, WebsiteItem[]][] = grouped
    ? groupedWebsites()
    : [[null, websites]];

  return (
    <div className="flex flex-col gap-7">
      {sections.map(([group, items]) => (
        <section key={group ?? "_ungrouped"}>
          {group && <div className="hl-group"># {group}</div>}
          <div className={view === "launcher" ? "hl-launch" : "hl-grid"}>
            {items.map((website) => (
              <WebsiteItemCard
                key={website.id}
                website={website}
                serviceStatus={serviceStatuses.get(website.id)}
                view={view}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default WebsiteItemCards;

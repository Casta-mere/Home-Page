"use client";

import React from "react";
import WebsiteItemCard from "./WebsiteItemCard";
import { websites } from "@/app/data/websites";

const WebsiteItemCards = ({
  serviceStatuses,
  view,
}: {
  serviceStatuses: Map<number, boolean>;
  view: "cards" | "launcher";
}) => {
  return (
    <div className={view === "launcher" ? "hl-launch" : "hl-grid"}>
      {websites.map((website) => (
        <WebsiteItemCard
          key={website.id}
          website={website}
          serviceOnline={serviceStatuses.get(website.id)}
          view={view}
        />
      ))}
    </div>
  );
};

export default WebsiteItemCards;

"use client";

import React from "react";
import WebsiteItemCard from "./WebsiteItemCard";
import { websites } from "@/app/data/websites";
import { Grid } from "@radix-ui/themes";
import { useNetworkType } from "@/app/hooks/useNetworkDetection";
import { useServiceStatuses } from "@/app/hooks/useServiceStatuses";

const WebsiteItemCards = ({
  refreshKey,
  domainPattern,
}: {
  refreshKey: number;
  domainPattern: string | null;
}) => {
  const networkMethod = useNetworkType(refreshKey, domainPattern);
  const serviceStatuses = useServiceStatuses(refreshKey);

  return (
    <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="5">
      {websites.map((website) => (
        <WebsiteItemCard
          key={website.port}
          website={website}
          networkMethod={networkMethod}
          serviceOnline={serviceStatuses.get(website.id)}
          domainPattern={domainPattern}
        />
      ))}
    </Grid>
  );
};

export default WebsiteItemCards;

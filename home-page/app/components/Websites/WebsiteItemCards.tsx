"use client";

import React from "react";
import WebsiteItemCard from "./WebsiteItemCard";
import { websites } from "@/app/data/websites";
import { Grid } from "@radix-ui/themes";

const WebsiteItemCards = ({
  serviceStatuses,
}: {
  serviceStatuses: Map<number, boolean>;
}) => {
  return (
    <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="5">
      {websites.map((website) => (
        <WebsiteItemCard
          key={website.id}
          website={website}
          serviceOnline={serviceStatuses.get(website.id)}
        />
      ))}
    </Grid>
  );
};

export default WebsiteItemCards;

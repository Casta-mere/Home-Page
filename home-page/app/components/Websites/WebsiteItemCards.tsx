"use client";

import React from "react";
import WebsiteItemCard from "./WebsiteItemCard";
import { websites } from "@/app/data/websites";
import { Grid } from "@radix-ui/themes";

const WebsiteItemCards = ({ refreshKey }: { refreshKey: number }) => {
  return (
    <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="5">
      {websites.map((website) => (
        <WebsiteItemCard key={website.port} website={website} refreshKey={refreshKey} />
      ))}
    </Grid>
  );
};

export default WebsiteItemCards;

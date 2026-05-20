"use client";

import { useEffect, useState } from "react";
import { ServiceStatus } from "@/app/types/ServiceStatus";

export const useServiceStatus = () => {
  const [statusList, setStatusList] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/services", { cache: "no-store" });
        const data: ServiceStatus[] = await res.json();
        setStatusList(data);
      } catch {
        setStatusList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);

  return { statusList, loading };
};

"use client";

import { useEffect, useState } from "react";
import { getStoreStatus, type StoreStatus } from "@/lib/hours";

export function OpenStatus() {
  const [status, setStatus] = useState<StoreStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getStoreStatus());
    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <span
      className={`open-status${status && !status.open ? " open-status--closed" : ""}`}
      aria-live="polite"
    >
      {status?.label ?? "Open 10:30 am – 10:30 pm"}
      <small>{status?.detail ?? "all days"}</small>
    </span>
  );
}

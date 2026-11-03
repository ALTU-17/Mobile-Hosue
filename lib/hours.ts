export type StoreStatus = {
  open: boolean;
  label: string;
  detail: string;
};

const OPEN_MINUTES = 10 * 60 + 30;
const CLOSE_MINUTES = 22 * 60 + 30;

function minutesInKolkata(date: Date): { minutes: number; weekday: string } {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hourCycle: "h23",
  }).formatToParts(date);

  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "";

  return { minutes: hour * 60 + minute, weekday };
}

export function getStoreStatus(now = new Date()): StoreStatus {
  const { minutes, weekday } = minutesInKolkata(now);

  if (minutes >= OPEN_MINUTES && minutes < CLOSE_MINUTES) {
    return {
      open: true,
      label: "Open now",
      detail: `Till 10:30 pm · ${weekday}`,
    };
  }

  if (minutes < OPEN_MINUTES) {
    return {
      open: false,
      label: "Closed now",
      detail: `Opens today at 10:30 am · ${weekday}`,
    };
  }

  return {
    open: false,
    label: "Closed now",
    detail: "Opens tomorrow at 10:30 am",
  };
}

export function formatFollowers(value: number): string {
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(value);
}

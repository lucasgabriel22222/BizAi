import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  differenceInCalendarDays,
  parseISO,
} from "date-fns";

export type PeriodPreset = "today" | "7d" | "month" | "custom";

export interface PeriodRange {
  preset: PeriodPreset;
  start: Date;
  end: Date;
  label: string;
}

export function resolvePeriod(
  preset: PeriodPreset,
  customStart?: string,
  customEnd?: string
): PeriodRange {
  const now = new Date();
  const todayEnd = endOfDay(now);

  switch (preset) {
    case "today":
      return {
        preset,
        start: startOfDay(now),
        end: todayEnd,
        label: "Hoje",
      };
    case "7d":
      return {
        preset,
        start: startOfDay(subDays(now, 6)),
        end: todayEnd,
        label: "Últimos 7 dias",
      };
    case "month":
      return {
        preset,
        start: startOfMonth(now),
        end: endOfMonth(now),
        label: "Este mês",
      };
    case "custom": {
      const start = customStart ? startOfDay(parseISO(customStart)) : startOfMonth(now);
      const end = customEnd ? endOfDay(parseISO(customEnd)) : todayEnd;
      return {
        preset,
        start,
        end,
        label: "Período personalizado",
      };
    }
    default:
      return resolvePeriod("7d");
  }
}

export function periodDayCount(start: Date, end: Date): number {
  return Math.min(Math.max(differenceInCalendarDays(end, start) + 1, 1), 90);
}

export function toDateOnlyString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseDateOnly(dateStr: string): Date {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

export function normalizeTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${String(h).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
}

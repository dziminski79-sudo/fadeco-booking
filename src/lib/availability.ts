import "server-only";
import { TZDate } from "@date-fns/tz";
import { createAdminClient } from "@/lib/supabase/admin";
import { SHOP, type Slot } from "@/lib/config";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function parseHM(value: string) {
  const [h, m] = value.split(":").map(Number);
  return { h, m };
}

export function isValidBookingDate(date: string) {
  if (!DATE_RE.test(date)) return false;
  const [y, m, d] = date.split("-").map(Number);
  const day = new TZDate(y, m - 1, d, SHOP.timeZone);
  const today = TZDate.tz(SHOP.timeZone);
  const startToday = new TZDate(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    SHOP.timeZone,
  );
  const diffDays = Math.round(
    (day.getTime() - startToday.getTime()) / 86_400_000,
  );
  return diffDays >= 0 && diffDays <= SHOP.maxDaysAhead;
}

export async function getSlots(input: {
  serviceId: string;
  staffId: string | "any";
  date: string;
}): Promise<Slot[]> {
  if (!isValidBookingDate(input.date)) return [];
  const db = createAdminClient();

  const { data: service } = await db
    .from("services")
    .select("duration_min")
    .eq("id", input.serviceId)
    .eq("active", true)
    .single();
  if (!service) return [];

  let staffQuery = db.from("staff").select("id").eq("active", true);
  if (input.staffId !== "any") staffQuery = staffQuery.eq("id", input.staffId);
  const { data: staffRows } = await staffQuery.order("sort_order");
  const staffIds = (staffRows ?? []).map((s) => s.id);
  if (staffIds.length === 0) return [];

  const [y, m, d] = input.date.split("-").map(Number);
  const dayStart = new TZDate(y, m - 1, d, SHOP.timeZone);
  const dayEnd = new TZDate(y, m - 1, d + 1, SHOP.timeZone);
  const weekday = dayStart.getDay();

  const [{ data: hours }, { data: booked }] = await Promise.all([
    db
      .from("staff_hours")
      .select("staff_id,open_time,close_time")
      .in("staff_id", staffIds)
      .eq("weekday", weekday),
    db
      .from("bookings")
      .select("staff_id,starts_at,ends_at")
      .in("staff_id", staffIds)
      .eq("status", "confirmed")
      .lt("starts_at", dayEnd.toISOString())
      .gt("ends_at", dayStart.toISOString()),
  ]);

  const earliest = Date.now() + SHOP.minLeadMin * 60_000;
  const durationMs = service.duration_min * 60_000;
  const byTime = new Map<string, Slot>();

  for (const staffId of staffIds) {
    const h = hours?.find((row) => row.staff_id === staffId);
    if (!h) continue;
    const open = parseHM(h.open_time);
    const close = parseHM(h.close_time);
    const openAt = new TZDate(y, m - 1, d, open.h, open.m, SHOP.timeZone);
    const closeAt = new TZDate(y, m - 1, d, close.h, close.m, SHOP.timeZone);
    const mine = (booked ?? []).filter((b) => b.staff_id === staffId);

    for (
      let t = openAt.getTime();
      t + durationMs <= closeAt.getTime();
      t += SHOP.slotStepMin * 60_000
    ) {
      if (t < earliest) continue;
      const end = t + durationMs;
      const clash = mine.some(
        (b) =>
          new Date(b.starts_at).getTime() < end &&
          new Date(b.ends_at).getTime() > t,
      );
      if (clash) continue;
      const startsAt = new Date(t).toISOString();
      if (byTime.has(startsAt)) continue;
      const label = new Intl.DateTimeFormat("en-US", {
        timeZone: SHOP.timeZone,
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(t));
      byTime.set(startsAt, { label, startsAt, staffId });
    }
  }

  return [...byTime.values()].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  );
}

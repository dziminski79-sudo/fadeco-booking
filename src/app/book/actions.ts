"use server";

import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSlots } from "@/lib/availability";
import type { Slot } from "@/lib/config";

const slotQuery = z.object({
  serviceId: z.uuid(),
  staffId: z.union([z.uuid(), z.literal("any")]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function fetchSlots(input: unknown): Promise<Slot[]> {
  const parsed = slotQuery.safeParse(input);
  if (!parsed.success) return [];
  return getSlots(parsed.data);
}

const bookingInput = slotQuery.extend({
  startsAt: z.iso.datetime(),
  name: z.string().trim().min(2).max(80),
  email: z.email().max(120),
  phone: z.string().trim().max(30).default(""),
  notes: z.string().trim().max(300).default(""),
});

export type BookingResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function createBooking(input: unknown): Promise<BookingResult> {
  const parsed = bookingInput.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Please check your details and try again." };
  }
  const v = parsed.data;

  const slots = await getSlots({
    serviceId: v.serviceId,
    staffId: v.staffId,
    date: v.date,
  });
  const requested = new Date(v.startsAt).toISOString();
  const slot = slots.find((s) => s.startsAt === requested);
  if (!slot) {
    return {
      ok: false,
      error: "That time was just taken. Please pick another slot.",
    };
  }

  const db = createAdminClient();
  const { data: service } = await db
    .from("services")
    .select("duration_min")
    .eq("id", v.serviceId)
    .single();
  if (!service) return { ok: false, error: "Service not found." };

  const endsAt = new Date(
    new Date(requested).getTime() + service.duration_min * 60_000,
  ).toISOString();

  const { data, error } = await db
    .from("bookings")
    .insert({
      service_id: v.serviceId,
      staff_id: slot.staffId,
      starts_at: requested,
      ends_at: endsAt,
      customer_name: v.name,
      customer_email: v.email,
      customer_phone: v.phone,
      notes: v.notes,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23P01") {
      return {
        ok: false,
        error: "That time was just taken. Please pick another slot.",
      };
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  }
  return { ok: true, id: data.id };
}

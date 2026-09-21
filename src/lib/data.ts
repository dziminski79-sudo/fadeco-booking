import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Barber, Service } from "@/lib/config";

export async function getServices(): Promise<Service[]> {
  const { data, error } = await createAdminClient()
    .from("services")
    .select("id,name,description,duration_min,price_cents")
    .eq("active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function getBarbers(): Promise<Barber[]> {
  const { data, error } = await createAdminClient()
    .from("staff")
    .select("id,name,bio")
    .eq("active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

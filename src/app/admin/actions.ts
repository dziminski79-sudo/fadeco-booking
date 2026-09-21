"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSessionClient, getAdminUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function cancelBooking(formData: FormData) {
  if (!(await getAdminUser())) throw new Error("Unauthorized");
  const id = z.uuid().parse(formData.get("id"));
  const { error } = await createAdminClient()
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin");
}

export async function signOut() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function sendMagicLink(
  _prev: { message: string } | null,
  formData: FormData,
) {
  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) return { message: "Enter a valid email address." };

  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase());
  const generic = {
    message: "If that address is authorized, a sign-in link is on its way.",
  };
  if (!allowed.includes(email.data.toLowerCase())) return generic;

  const supabase = await createSessionClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  await supabase.auth.signInWithOtp({
    email: email.data,
    options: { emailRedirectTo: `${site}/auth/callback` },
  });
  return generic;
}

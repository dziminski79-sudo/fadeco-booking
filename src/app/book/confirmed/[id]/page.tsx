import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { createAdminClient } from "@/lib/supabase/admin";
import { SHOP, formatInShopTime, formatPrice } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function ConfirmedPage(props: PageProps<"/book/confirmed/[id]">) {
  const { id } = await props.params;
  if (!z.uuid().safeParse(id).success) notFound();

  const { data } = await createAdminClient()
    .from("bookings")
    .select("starts_at,customer_name,status,services(name,price_cents),staff(name)")
    .eq("id", id)
    .single();
  if (!data) notFound();

  const service = data.services as unknown as { name: string; price_cents: number };
  const barber = data.staff as unknown as { name: string };
  const when = formatInShopTime(data.starts_at, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center px-6 py-20 text-center">
        <CheckCircle2 size={56} className="text-amber-400" />
        <h1 className="mt-6 text-3xl font-bold">
          {data.status === "cancelled" ? "Booking cancelled" : `You're booked, ${data.customer_name.split(" ")[0]}`}
        </h1>
        <div className="mt-8 w-full rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-left text-sm">
          <dl className="space-y-3">
            <div className="flex justify-between"><dt className="text-neutral-500">When</dt><dd>{when}</dd></div>
            <div className="flex justify-between"><dt className="text-neutral-500">Service</dt><dd>{service.name}</dd></div>
            <div className="flex justify-between"><dt className="text-neutral-500">Barber</dt><dd>{barber.name}</dd></div>
            <div className="flex justify-between"><dt className="text-neutral-500">Total</dt><dd>{formatPrice(service.price_cents)} (pay in shop)</dd></div>
            <div className="flex justify-between"><dt className="text-neutral-500">Where</dt><dd>{SHOP.address}</dd></div>
          </dl>
        </div>
        <Link href="/" className="mt-8 text-sm text-amber-400 hover:underline">
          Back to home
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}

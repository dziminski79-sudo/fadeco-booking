import { redirect } from "next/navigation";
import { CalendarDays, LogOut, Users, XCircle } from "lucide-react";
import { getAdminUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatInShopTime, formatPrice } from "@/lib/config";
import { cancelBooking, signOut } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | Fade & Co." };

type Row = {
  id: string;
  starts_at: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  notes: string;
  status: string;
  services: { name: string; price_cents: number };
  staff: { name: string };
};

export default async function AdminPage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const since = new Date(Date.now() - 6 * 3_600_000).toISOString();
  const { data } = await createAdminClient()
    .from("bookings")
    .select("id,starts_at,customer_name,customer_email,customer_phone,notes,status,services(name,price_cents),staff(name)")
    .gte("starts_at", since)
    .order("starts_at");
  const rows = (data ?? []) as unknown as Row[];

  const active = rows.filter((r) => r.status === "confirmed");
  const revenue = active.reduce((sum, r) => sum + r.services.price_cents, 0);

  const groups = new Map<string, Row[]>();
  for (const r of rows) {
    const key = formatInShopTime(r.starts_at, { weekday: "long", month: "long", day: "numeric" });
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>
        <form action={signOut}>
          <button className="flex items-center gap-2 rounded-md border border-neutral-700 px-3 py-2 text-sm hover:border-neutral-500">
            <LogOut size={14} /> Sign out
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat icon={CalendarDays} label="Upcoming bookings" value={String(active.length)} />
        <Stat icon={Users} label="Unique customers" value={String(new Set(active.map((r) => r.customer_email)).size)} />
        <Stat icon={CalendarDays} label="Booked revenue" value={formatPrice(revenue)} />
      </div>

      <div className="mt-10 space-y-8">
        {groups.size === 0 && <p className="text-neutral-400">No upcoming bookings yet.</p>}
        {[...groups.entries()].map(([day, items]) => (
          <section key={day}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-amber-400">{day}</h2>
            <ul className="mt-3 divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-900/40">
              {items.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                  <div className={r.status === "cancelled" ? "opacity-40" : ""}>
                    <p className="font-semibold">
                      {formatInShopTime(r.starts_at, { hour: "numeric", minute: "2-digit" })}
                      <span className="ml-3 font-normal text-neutral-300">{r.customer_name}</span>
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">
                      {r.services.name} with {r.staff.name} | {r.customer_email}
                      {r.customer_phone ? ` | ${r.customer_phone}` : ""}
                    </p>
                    {r.notes && <p className="mt-1 text-sm text-neutral-400">Note: {r.notes}</p>}
                  </div>
                  {r.status === "confirmed" ? (
                    <form action={cancelBooking}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="flex items-center gap-1.5 rounded-md border border-red-500/40 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10">
                        <XCircle size={14} /> Cancel
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs uppercase tracking-widest text-neutral-600">Cancelled</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-neutral-500">
        <Icon size={14} /> {label}
      </p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
    </div>
  );
}

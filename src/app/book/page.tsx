import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import BookingFlow from "@/components/BookingFlow";
import { getBarbers, getServices } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata = { title: "Book an appointment | Fade & Co." };

export default async function BookPage() {
  const [services, barbers] = await Promise.all([getServices(), getBarbers()]);
  return (
    <>
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
        <h1 className="text-3xl font-bold tracking-tight">Book your appointment</h1>
        <p className="mt-2 text-neutral-400">Choose a service, a barber, and a time that works for you.</p>
        <BookingFlow services={services} barbers={barbers} />
      </main>
      <SiteFooter />
    </>
  );
}

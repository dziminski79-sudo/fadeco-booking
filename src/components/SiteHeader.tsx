import Link from "next/link";
import { Scissors } from "lucide-react";
import { SHOP } from "@/lib/config";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/85 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-500 text-neutral-950">
            <Scissors size={16} />
          </span>
          {SHOP.name}
        </Link>
        <div className="hidden items-center gap-8 text-sm text-neutral-400 md:flex">
          <Link href="/#services" className="transition-colors hover:text-amber-400">
            Services
          </Link>
          <Link href="/#barbers" className="transition-colors hover:text-amber-400">
            Barbers
          </Link>
          <Link href="/#visit" className="transition-colors hover:text-amber-400">
            Visit
          </Link>
        </div>
        <Link
          href="/book"
          className="rounded-md bg-amber-500 px-4 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-400"
        >
          Book Now
        </Link>
      </nav>
    </header>
  );
}

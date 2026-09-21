import { SHOP } from "@/lib/config";

export default function SiteFooter() {
  return (
    <footer className="border-t border-neutral-800 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 text-sm text-neutral-500 sm:flex-row">
        <p className="font-semibold text-neutral-300">{SHOP.name}</p>
        <p>
          &copy; {new Date().getFullYear()} {SHOP.name} Concept project with a
          working booking system, demo only.
        </p>
      </div>
    </footer>
  );
}

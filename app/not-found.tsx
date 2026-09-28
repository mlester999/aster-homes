import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-aster-paper px-5 py-16 text-center">
      <div className="max-w-[520px]"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aster-muted">Aster Homes</p><h1 className="font-display mt-3 text-6xl text-aster-ink">This page isn’t here.</h1><p className="mt-4 text-sm leading-6 text-aster-muted">The page may have moved. Return to Aster Homes and keep exploring.</p><Link href="/" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-aster-forest px-5 text-sm font-semibold text-white hover:bg-aster-forest-deep"><ArrowLeft size={15} aria-hidden="true" />Back to Aster Homes</Link></div>
    </main>
  );
}

"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Keep the public message simple; Next.js owns any private diagnostics.
    void error.digest;
  }, [error]);
  return (
    <main className="grid min-h-screen place-items-center bg-aster-paper px-5 py-16 text-center">
      <div className="max-w-[520px]"><p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-aster-muted">Aster Homes</p><h1 className="font-display mt-3 text-5xl text-aster-ink">We hit a small snag.</h1><p className="mt-4 text-sm leading-6 text-aster-muted">Your request may not have finished. Please try again.</p><button type="button" onClick={() => reset()} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-aster-forest px-5 text-sm font-semibold text-white hover:bg-aster-forest-deep"><RefreshCw size={15} aria-hidden="true" />Try again</button></div>
    </main>
  );
}

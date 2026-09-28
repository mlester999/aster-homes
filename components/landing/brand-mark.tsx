import Image from "next/image";
import Link from "next/link";

export function BrandMark({ footer = false }: { footer?: boolean }) {
  return (
    <Link href="/" aria-label="Aster Homes home" className="inline-flex items-center gap-3">
      <Image src="/brand/aster-logo-mark.png" alt="" width={footer ? 40 : 44} height={footer ? 40 : 44} priority={!footer} />
      <span className="leading-none">
        <span className="block text-[13px] font-semibold tracking-[0.2em] text-aster-ink">ASTER HOMES</span>
        {!footer && <span className="mt-1 block text-[9px] tracking-[0.28em] text-aster-muted">REAL ESTATE</span>}
      </span>
    </Link>
  );
}

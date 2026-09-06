import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function Pagination({
  page,
  pageCount,
  buildHref,
}: {
  page: number;
  pageCount: number;
  buildHref: (page: number) => string;
}) {
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1,
  );

  return (
    <nav className="mt-14 flex items-center justify-center gap-1.5">
      <Link
        href={buildHref(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`flex h-9 w-9 items-center justify-center border border-border ${page === 1 ? "pointer-events-none opacity-30" : "hover:border-foreground"}`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      {pages.map((p, i) => (
        <span key={p} className="flex items-center">
          {i > 0 && pages[i - 1] !== p - 1 && <span className="px-1 text-muted-foreground">…</span>}
          <Link
            href={buildHref(p)}
            className={`flex h-9 w-9 items-center justify-center border text-sm ${
              p === page ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      <Link
        href={buildHref(Math.min(pageCount, page + 1))}
        aria-disabled={page === pageCount}
        className={`flex h-9 w-9 items-center justify-center border border-border ${page === pageCount ? "pointer-events-none opacity-30" : "hover:border-foreground"}`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function SectionHeading({
  eyebrow,
  title,
  href,
  linkLabel = "Ver todo",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4 sm:mb-10">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">{eyebrow}</p>
        )}
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="hidden shrink-0 items-center gap-1.5 text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-60 sm:flex"
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CartTrigger } from "@/components/layout/cart-trigger";
import { SearchTrigger } from "@/components/layout/search-trigger";
import { UserMenu } from "@/components/layout/user-menu";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { AnnouncementBar } from "@/components/layout/announcement-bar";

export async function Navbar() {
  const [session, categories] = await Promise.all([
    auth(),
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      select: { name: true, slug: true },
    }),
  ]);

  return (
    <header className="sticky top-0 z-40 bg-background">
      <AnnouncementBar />
      <div className="container flex h-20 items-center justify-between">
        <div className="flex items-center gap-1">
          <MobileMenu categories={categories} />
          <Link href="/" className="ml-1 font-display text-2xl tracking-wide lg:ml-0">
            NOVAWEAR
          </Link>
        </div>

        <nav className="hidden items-center gap-8 lg:flex">
          <Link href="/shop" className="text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-60">
            Todo
          </Link>
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/shop/${c.slug}`}
              className="text-xs font-medium uppercase tracking-widest transition-opacity hover:opacity-60"
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-0.5">
          <SearchTrigger />
          <UserMenu user={session?.user ?? null} />
          <CartTrigger />
        </div>
      </div>
    </header>
  );
}

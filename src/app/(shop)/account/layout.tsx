import { AccountNav } from "@/components/account/account-nav";

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-10 sm:py-14">
      <h1 className="mb-8 font-display text-3xl tracking-tight">Mi cuenta</h1>
      <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
        <AccountNav />
        <div>{children}</div>
      </div>
    </div>
  );
}

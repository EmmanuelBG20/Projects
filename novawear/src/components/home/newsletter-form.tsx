"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { subscribeNewsletterAction } from "@/lib/actions/newsletter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await subscribeNewsletterAction({ email });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Listo. Revisa tu correo para confirmar.");
        setEmail("");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm gap-2">
      <Input
        type="email"
        required
        placeholder="tu@correo.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-11 border-primary-foreground/30 bg-transparent text-primary-foreground placeholder:text-primary-foreground/50"
      />
      <Button type="submit" variant="outline" disabled={isPending} className="shrink-0 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
        {isPending ? "..." : "Unirme"}
      </Button>
    </form>
  );
}

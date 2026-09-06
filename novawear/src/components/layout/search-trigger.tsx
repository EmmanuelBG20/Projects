"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export function SearchTrigger() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const router = useRouter();

  function submit() {
    if (!value.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(value.trim())}`);
    setOpen(false);
    setValue("");
  }

  return (
    <>
      <button
        aria-label="Buscar"
        onClick={() => setOpen(true)}
        className="flex h-10 w-10 items-center justify-center text-foreground transition-opacity hover:opacity-60"
      >
        <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="top-32 translate-y-0 gap-6">
          <DialogHeader>
            <DialogTitle>Buscar productos</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}
          >
            <Input
              autoFocus
              placeholder="Hoodie, camiseta, chaqueta…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="h-12 text-base"
            />
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

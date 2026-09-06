"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FiltersSidebar, type FilterOptions } from "@/components/shop/filters-sidebar";

export function MobileFilters({ options }: { options: FilterOptions }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" className="gap-2 lg:hidden" onClick={() => setOpen(true)}>
        <SlidersHorizontal className="h-3.5 w-3.5" />
        Filtros
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>
          <div className="px-6 py-6">
            <FiltersSidebar options={options} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

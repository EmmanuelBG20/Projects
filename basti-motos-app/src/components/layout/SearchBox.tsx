"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { centsToPlainCOP } from "@/lib/money";

type Result = { id: string; name: string; slug: string; priceCents: number; brandName: string; imageUrl: string | null };

export function SearchBox({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/buscar?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data.products ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  function goToSearchPage() {
    if (query.trim().length === 0) return;
    router.push(`/buscar?q=${encodeURIComponent(query)}`);
    onClose();
  }

  return (
    <div className="absolute inset-x-0 top-full border-t border-white/10 bg-carbon-800/95 backdrop-blur-md">
      <div className="container-app py-4">
        <div className="flex items-center gap-3">
          <Search size={20} className="text-neutral-400" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && goToSearchPage()}
            placeholder="Buscar kits, lubricantes, frenos, bujías..."
            className="flex-1 bg-transparent text-white placeholder:text-neutral-500 focus:outline-none"
          />
          <button onClick={onClose} aria-label="Cerrar búsqueda" className="text-neutral-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {(results.length > 0 || loading) && (
          <div className="mt-4 max-h-80 overflow-y-auto border-t border-white/10 pt-4">
            {loading && <p className="text-sm text-neutral-500">Buscando...</p>}
            {!loading &&
              results.map((r) => (
                <Link
                  key={r.id}
                  href={`/productos/${r.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5"
                >
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-md bg-carbon-700">
                    {r.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.imageUrl} alt={r.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{r.name}</p>
                    <p className="text-xs text-neutral-400">{r.brandName}</p>
                  </div>
                  <span className="text-sm font-semibold text-racing-orange">{centsToPlainCOP(r.priceCents)}</span>
                </Link>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}

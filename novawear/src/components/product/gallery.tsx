"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  productName,
}: {
  images: { url: string; alt: string | null }[];
  productName: string;
}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto sm:w-20 sm:flex-col sm:overflow-visible">
          {images.map((img, i) => (
            <button
              key={img.url + i}
              onClick={() => setActive(i)}
              className={cn(
                "relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-secondary sm:w-full",
                i === active && "ring-1 ring-foreground",
              )}
            >
              <Image src={img.url} alt={img.alt ?? productName} fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div
        className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden bg-secondary"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setZoom({
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          });
        }}
        onMouseLeave={() => setZoom(null)}
      >
        {current && (
          <Image
            src={current.url}
            alt={current.alt ?? productName}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 ease-out"
            style={
              zoom
                ? { transform: "scale(1.7)", transformOrigin: `${zoom.x}% ${zoom.y}%` }
                : { transform: "scale(1)" }
            }
          />
        )}
      </div>
    </div>
  );
}

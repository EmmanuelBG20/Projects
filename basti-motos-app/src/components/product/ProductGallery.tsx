"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export function ProductGallery({ images, name }: { images: { url: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState<Record<number, boolean>>({});
  const activeImage = images[active];
  const hasActiveImage = Boolean(activeImage) && !broken[active];

  return (
    <div>
      <div className="glass-card aspect-square overflow-hidden">
        {hasActiveImage && activeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={activeImage.url}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setBroken((b) => ({ ...b, [active]: true }))}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-neutral-600">
            <ImageOff size={48} />
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => setActive(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === active ? "border-racing-orange" : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              {broken[i] ? (
                <div className="flex h-full w-full items-center justify-center bg-carbon-700 text-neutral-600">
                  <ImageOff size={16} />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={() => setBroken((b) => ({ ...b, [i]: true }))}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

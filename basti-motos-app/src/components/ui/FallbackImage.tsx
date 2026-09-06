"use client";

import { useState } from "react";

/**
 * `<img>` con manejo de error, para usarla dentro de Server Components.
 * Un Server Component no puede pasar funciones (como `onError`) directamente
 * a un elemento del DOM, así que esa lógica vive aislada en este pequeño
 * Client Component.
 */
export function FallbackImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (broken) return null;

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} onError={() => setBroken(true)} />;
}

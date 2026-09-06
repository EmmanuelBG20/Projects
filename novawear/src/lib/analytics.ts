"use client";

/**
 * Thin wrapper around GA4 (gtag.js) and Meta Pixel. Both scripts are only
 * injected (see components/analytics-scripts.tsx) when their id env vars are
 * set, and every call here first checks `window.gtag` / `window.fbq` exist —
 * so importing/calling this is always safe, even with no analytics configured.
 */

type EcommerceItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity?: number;
  item_category?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

function gtagEvent(name: string, params: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params);
  }
}

function pixelEvent(name: string, params: Record<string, unknown>) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", name, params);
  }
}

export const analytics = {
  viewItem(item: EcommerceItem) {
    gtagEvent("view_item", { currency: "COP", value: item.price, items: [item] });
    pixelEvent("ViewContent", { content_ids: [item.item_id], value: item.price, currency: "COP" });
  },
  addToCart(item: EcommerceItem) {
    gtagEvent("add_to_cart", {
      currency: "COP",
      value: item.price * (item.quantity ?? 1),
      items: [item],
    });
    pixelEvent("AddToCart", { content_ids: [item.item_id], value: item.price, currency: "COP" });
  },
  removeFromCart(item: EcommerceItem) {
    gtagEvent("remove_from_cart", { currency: "COP", value: item.price, items: [item] });
  },
  addToWishlist(item: EcommerceItem) {
    gtagEvent("add_to_wishlist", { currency: "COP", value: item.price, items: [item] });
    pixelEvent("AddToWishlist", { content_ids: [item.item_id], value: item.price, currency: "COP" });
  },
  search(term: string) {
    gtagEvent("search", { search_term: term });
  },
  beginCheckout(items: EcommerceItem[], value: number) {
    gtagEvent("begin_checkout", { currency: "COP", value, items });
    pixelEvent("InitiateCheckout", { value, currency: "COP", num_items: items.length });
  },
  purchase(orderId: string, items: EcommerceItem[], value: number) {
    gtagEvent("purchase", { transaction_id: orderId, currency: "COP", value, items });
    pixelEvent("Purchase", { value, currency: "COP" });
  },
};

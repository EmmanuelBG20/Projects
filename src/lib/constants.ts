export const ROLES = ["CUSTOMER", "ADMIN", "MANAGER"] as const;
export type Role = (typeof ROLES)[number];

export const PRODUCT_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;
export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

export const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "Pendiente",
  PAID: "Pago aprobado",
  PROCESSING: "Preparando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export const PAYMENT_STATUSES = ["PENDING", "APPROVED", "DECLINED", "REFUNDED", "ERROR"] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_PROVIDERS = ["WOMPI", "MERCADOPAGO", "STRIPE", "MOCK"] as const;
export type PaymentProviderId = (typeof PAYMENT_PROVIDERS)[number];

export const PAYMENT_PROVIDER_LABELS: Record<PaymentProviderId, string> = {
  WOMPI: "Wompi",
  MERCADOPAGO: "Mercado Pago",
  STRIPE: "Stripe",
  MOCK: "Sandbox (demo)",
};

export const INVENTORY_MOVEMENT_TYPES = [
  "RESTOCK",
  "SALE",
  "ADJUSTMENT",
  "RETURN",
  "RESERVATION",
  "RELEASE",
] as const;
export type InventoryMovementType = (typeof INVENTORY_MOVEMENT_TYPES)[number];

export const COUPON_TYPES = ["PERCENTAGE", "FIXED"] as const;
export type CouponType = (typeof COUPON_TYPES)[number];

export const SUPPORT_TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
export type SupportTicketStatus = (typeof SUPPORT_TICKET_STATUSES)[number];
export const SUPPORT_TICKET_SOURCES = ["WEB", "WHATSAPP"] as const;

export const WHATSAPP_CONVERSATION_STATUSES = ["BOT", "HUMAN", "CLOSED"] as const;
export type WhatsappConversationStatus = (typeof WHATSAPP_CONVERSATION_STATUSES)[number];

export const CART_COOKIE = "nw_cart_token" as const;

export const CURRENCY = "COP" as const;
export const DEFAULT_LOCALE = "es-CO" as const;

export const FREE_SHIPPING_THRESHOLD = 250_000; // COP
export const STANDARD_SHIPPING_COST = 14_900; // COP

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const DEPARTMENTS_CO = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas",
  "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca",
  "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
  "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia",
  "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada",
  "Bogotá D.C.",
] as const;

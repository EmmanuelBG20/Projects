import "server-only";

export interface IntegrationStatus {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  envVars: string[];
  description: string;
}

/**
 * Reads env var *presence* only (never values) to report whether each
 * integration is wired up. Powers /admin/integrations.
 */
export function getIntegrationStatuses(): IntegrationStatus[] {
  return [
    {
      id: "wompi",
      name: "Wompi",
      category: "Pagos",
      connected: Boolean(process.env.WOMPI_PUBLIC_KEY && process.env.WOMPI_PRIVATE_KEY && process.env.WOMPI_EVENTS_SECRET),
      envVars: ["WOMPI_PUBLIC_KEY", "WOMPI_PRIVATE_KEY", "WOMPI_EVENTS_SECRET"],
      description: "Checkout widget para tarjetas, PSE y Nequi (Colombia).",
    },
    {
      id: "mercadopago",
      name: "Mercado Pago",
      category: "Pagos",
      connected: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
      envVars: ["MERCADOPAGO_ACCESS_TOKEN", "MERCADOPAGO_WEBHOOK_SECRET"],
      description: "Checkout Pro — preferencias y redirección hospedada.",
    },
    {
      id: "stripe",
      name: "Stripe",
      category: "Pagos",
      connected: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
      envVars: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET"],
      description: "Pagos internacionales con tarjeta vía Stripe Checkout.",
    },
    {
      id: "cloudinary",
      name: "Cloudinary",
      category: "Imágenes",
      connected: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY),
      envVars: ["CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"],
      description: "Almacenamiento y transformación de imágenes de producto.",
    },
    {
      id: "resend",
      name: "Resend",
      category: "Email",
      connected: Boolean(process.env.RESEND_API_KEY),
      envVars: ["RESEND_API_KEY", "EMAIL_FROM"],
      description: "Envío de correos transaccionales (confirmaciones, envíos).",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business Cloud API",
      category: "WhatsApp",
      connected: Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID),
      envVars: ["WHATSAPP_ACCESS_TOKEN", "WHATSAPP_PHONE_NUMBER_ID", "WHATSAPP_VERIFY_TOKEN", "WHATSAPP_APP_SECRET"],
      description: "Mensajería entrante/saliente para el asistente de WhatsApp.",
    },
    {
      id: "ai",
      name: "Asistente IA (OpenAI / Claude / Gemini)",
      category: "WhatsApp",
      connected: Boolean(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY),
      envVars: ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GEMINI_API_KEY"],
      description: "Motor de lenguaje para el chatbot. Sin ninguna configurada, corre en modo reglas.",
    },
    {
      id: "analytics",
      name: "Google Analytics / Meta Pixel",
      category: "Analytics",
      connected: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID),
      envVars: ["NEXT_PUBLIC_GA_MEASUREMENT_ID", "NEXT_PUBLIC_META_PIXEL_ID"],
      description: "Seguimiento de eventos de e-commerce en el storefront.",
    },
  ];
}

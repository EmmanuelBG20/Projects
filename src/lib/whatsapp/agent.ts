import "server-only";
import { prisma } from "@/lib/prisma";
import { runAssistantTurn, type ChatMessage, type ToolDefinition } from "@/lib/ai/provider";
import * as tools from "@/lib/whatsapp/tools";

const SYSTEM_PROMPT = `Eres el asistente de ventas de NOVAWEAR por WhatsApp. Eres cordial, breve y directo.
Puedes buscar productos, consultar precio y disponibilidad, agregar productos al carrito del cliente,
consultar el estado de sus pedidos, y crear un ticket de soporte cuando el cliente pida hablar con una persona.
Nunca inventes precios, stock o números de pedido — usa siempre las herramientas disponibles.
Responde siempre en español, en mensajes cortos aptos para WhatsApp.`;

const TOOL_DEFINITIONS: ToolDefinition[] = [
  {
    name: "searchProducts",
    description: "Busca productos por nombre, categoría o descripción.",
    parameters: {
      type: "object",
      properties: { query: { type: "string", description: "Término de búsqueda, p.ej. 'hoodie negro'" } },
      required: ["query"],
    },
  },
  {
    name: "checkInventory",
    description: "Verifica disponibilidad de un producto, opcionalmente por talla y color.",
    parameters: {
      type: "object",
      properties: {
        productIdOrSlug: { type: "string" },
        size: { type: "string" },
        color: { type: "string" },
      },
      required: ["productIdOrSlug"],
    },
  },
  {
    name: "addToCart",
    description: "Agrega una variante de producto al carrito del cliente.",
    parameters: {
      type: "object",
      properties: {
        variantId: { type: "string" },
        quantity: { type: "number" },
      },
      required: ["variantId"],
    },
  },
  {
    name: "getCustomerOrders",
    description: "Lista los pedidos recientes del cliente.",
    parameters: { type: "object", properties: {} },
  },
  {
    name: "getOrderStatus",
    description: "Consulta el estado de un pedido por número.",
    parameters: {
      type: "object",
      properties: { orderNumber: { type: "string" } },
      required: ["orderNumber"],
    },
  },
  {
    name: "createSupportTicket",
    description: "Crea un ticket de soporte y escala la conversación a un asesor humano.",
    parameters: {
      type: "object",
      properties: { subject: { type: "string" }, message: { type: "string" } },
      required: ["subject", "message"],
    },
  },
];

async function executeTool(phoneNumber: string, name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "searchProducts":
      return tools.searchProducts(String(args.query ?? ""));
    case "checkInventory":
      return tools.checkInventory(String(args.productIdOrSlug ?? ""), args.size as string, args.color as string);
    case "addToCart":
      return tools.addToCart(phoneNumber, String(args.variantId ?? ""), Number(args.quantity ?? 1));
    case "getCustomerOrders":
      return tools.getCustomerOrders(phoneNumber);
    case "getOrderStatus":
      return tools.getOrderStatus(String(args.orderNumber ?? ""));
    case "createSupportTicket":
      return tools.createSupportTicket({
        phoneNumber,
        subject: String(args.subject ?? "Consulta por WhatsApp"),
        message: String(args.message ?? ""),
      });
    default:
      return { error: "unknown tool" };
  }
}

/** Rule-based fallback used when no AI provider is configured. Covers the
 * example flows from the spec: greeting, product search, price/availability,
 * order status, and escalation to a human. */
async function ruleBasedReply(phoneNumber: string, text: string): Promise<string> {
  const lower = text.toLowerCase();

  if (/\b(hola|buenas|hey)\b/.test(lower)) {
    return "¡Hola! 👋 Soy el asistente de NOVAWEAR. ¿Qué estás buscando hoy? Puedo mostrarte productos, precios, disponibilidad o el estado de tu pedido.";
  }

  if (/asesor|humano|persona|agente/.test(lower)) {
    await tools.createSupportTicket({ phoneNumber, subject: "Solicitud de asesor humano", message: text });
    return "Listo, un asesor humano se pondrá en contacto contigo pronto. 🙌";
  }

  if (/pedido|orden|rastre|env[ií]o/.test(lower)) {
    const orders = await tools.getCustomerOrders(phoneNumber, 1);
    if (orders.length === 0) return "No encuentro pedidos asociados a este número. ¿Con qué correo hiciste la compra?";
    const o = orders[0];
    return `Tu último pedido #${o.orderNumber} está en estado "${o.status}" (${o.totalFormatted}).`;
  }

  const results = await tools.searchProducts(text);
  if (results.length > 0) {
    const lines = results
      .slice(0, 3)
      .map((p) => `• ${p.name} — ${p.priceFormatted} (${p.inStock ? "disponible" : "agotado"})`)
      .join("\n");
    return `Encontré esto para ti:\n${lines}\n\n¿Quieres que agregue alguno a tu carrito?`;
  }

  return "No encontré productos con esa descripción. ¿Puedes darme más detalles (categoría, color, talla)?";
}

export async function handleIncomingWhatsAppMessage(phoneNumber: string, text: string, customerName?: string) {
  const conversation = await prisma.whatsappConversation.upsert({
    where: { phoneNumber },
    update: { lastMessageAt: new Date(), customerName: customerName ?? undefined },
    create: { phoneNumber, customerName, status: "BOT" },
  });

  await prisma.whatsappMessage.create({
    data: { conversationId: conversation.id, direction: "INBOUND", content: text },
  });

  if (conversation.status === "HUMAN") {
    // A human took over — the bot stays silent so it doesn't talk over them.
    return null;
  }

  let reply: string;

  const history: ChatMessage[] = [{ role: "user", content: text }];
  const assistantResult = await runAssistantTurn(SYSTEM_PROMPT, history, TOOL_DEFINITIONS, (call) =>
    executeTool(phoneNumber, call.name, call.arguments),
  );

  reply = assistantResult ? assistantResult.reply : await ruleBasedReply(phoneNumber, text);

  await prisma.whatsappMessage.create({
    data: { conversationId: conversation.id, direction: "OUTBOUND", content: reply },
  });
  await prisma.whatsappConversation.update({ where: { id: conversation.id }, data: { lastMessageAt: new Date() } });

  return reply;
}

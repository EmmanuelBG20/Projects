import { Resend } from "resend";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const from = process.env.EMAIL_FROM ?? "BASTI MOTOS <hola@bastimotos.co>";

function getClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

async function send(to: string, subject: string, html: string) {
  const client = getClient();
  if (!client) {
    // Sin RESEND_API_KEY configurado (por ejemplo en desarrollo local sin
    // credenciales reales) no bloqueamos el flujo del usuario: solo dejamos
    // constancia en consola de que el correo se habría enviado.
    console.info(`[email:no-op] Para: ${to} | Asunto: ${subject}`);
    return;
  }

  try {
    await client.emails.send({ from, to, subject, html });
  } catch (error) {
    console.error("[email] Error enviando correo con Resend:", error);
  }
}

function layout(title: string, bodyHtml: string) {
  return `<!doctype html>
<html lang="es">
<body style="background:#0d0f12;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#f2f3f5;">
  <div style="max-width:520px;margin:0 auto;background:#131519;border-radius:16px;padding:32px;border:1px solid #22262c;">
    <p style="color:#ff6a1a;font-weight:bold;letter-spacing:1px;margin:0 0 24px;">BASTI MOTOS</p>
    <h1 style="font-size:20px;margin:0 0 16px;">${title}</h1>
    ${bodyHtml}
    <p style="margin-top:32px;font-size:12px;color:#9198a1;">BASTI MOTOS · Medellín, Colombia · hola@bastimotos.co</p>
  </div>
</body>
</html>`;
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${appUrl}/nueva-contrasena?token=${token}`;
  const html = layout(
    "Restablece tu contraseña",
    `<p>Recibimos una solicitud para restablecer tu contraseña. Este enlace expira en 1 hora.</p>
     <p><a href="${link}" style="display:inline-block;background:#ff6a1a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Crear nueva contraseña</a></p>
     <p style="font-size:12px;color:#9198a1;">Si no solicitaste esto, ignora este correo.</p>`
  );
  await send(to, "Restablece tu contraseña — BASTI MOTOS", html);
}

export async function sendEmailVerificationEmail(to: string, token: string) {
  const link = `${appUrl}/api/auth/verificar?token=${token}`;
  const html = layout(
    "Confirma tu correo",
    `<p>Gracias por registrarte en BASTI MOTOS. Confirma tu correo para completar tu perfil.</p>
     <p><a href="${link}" style="display:inline-block;background:#ff6a1a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Confirmar mi correo</a></p>`
  );
  await send(to, "Confirma tu correo — BASTI MOTOS", html);
}

export async function sendOrderApprovedEmail(to: string, orderId: string, totalCents: number) {
  const link = `${appUrl}/mi-cuenta/pedidos/${orderId}`;
  const total = (totalCents / 100).toLocaleString("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 });
  const html = layout(
    "¡Tu pago fue aprobado!",
    `<p>Confirmamos el pago de tu pedido <strong>#${orderId.slice(0, 8)}</strong> por <strong>${total}</strong>.</p>
     <p>Ya estamos preparando tu paquete.</p>
     <p><a href="${link}" style="display:inline-block;background:#ff6a1a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Ver mi pedido</a></p>`
  );
  await send(to, "Pago aprobado — BASTI MOTOS", html);
}

export async function sendOrderShippingUpdateEmail(to: string, orderId: string, status: string) {
  const link = `${appUrl}/mi-cuenta/pedidos/${orderId}`;
  const statusLabels: Record<string, string> = {
    PROCESSING: "está en preparación",
    SHIPPED: "fue enviado",
    DELIVERED: "fue entregado",
    CANCELLED: "fue cancelado",
    REFUNDED: "fue reembolsado",
  };
  const label = statusLabels[status] ?? "cambió de estado";
  const html = layout(
    "Actualización de tu pedido",
    `<p>Tu pedido <strong>#${orderId.slice(0, 8)}</strong> ${label}.</p>
     <p><a href="${link}" style="display:inline-block;background:#ff6a1a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Ver detalle</a></p>`
  );
  await send(to, "Actualización de tu pedido — BASTI MOTOS", html);
}

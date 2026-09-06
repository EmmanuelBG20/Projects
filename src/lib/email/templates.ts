import { formatPrice } from "@/lib/utils";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

function layout(title: string, bodyHtml: string) {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f5f3ee;font-family:Helvetica,Arial,sans-serif;color:#111;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;padding:40px 24px;">
      <tr>
        <td style="padding-bottom:32px;">
          <span style="font-size:20px;letter-spacing:0.1em;font-weight:600;">NOVAWEAR</span>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;border:1px solid #e5e1d8;padding:32px;">
          <h1 style="font-size:20px;margin:0 0 16px;">${title}</h1>
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding-top:24px;font-size:12px;color:#8a8a86;">
          NOVAWEAR — proyecto de portafolio. Este correo es parte de una demostración.
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function itemsTable(items: { productName: string; variantSize: string; variantColor: string; quantity: number; total: number }[]) {
  return `<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse:collapse;margin:16px 0;">
    ${items
      .map(
        (i) => `<tr style="border-bottom:1px solid #eee;">
          <td style="font-size:14px;">${i.productName}<br/><span style="color:#8a8a86;font-size:12px;">${i.variantColor} · ${i.variantSize} · x${i.quantity}</span></td>
          <td style="font-size:14px;text-align:right;">${formatPrice(i.total)}</td>
        </tr>`,
      )
      .join("")}
  </table>`;
}

export function orderConfirmationEmail(order: {
  orderNumber: string;
  total: number;
  items: { productName: string; variantSize: string; variantColor: string; quantity: number; total: number }[];
}) {
  return layout(
    `Confirmamos tu pedido #${order.orderNumber}`,
    `<p style="font-size:14px;color:#444;">Gracias por tu compra. Estamos procesando tu pedido y te avisaremos apenas sea despachado.</p>
     ${itemsTable(order.items)}
     <p style="font-size:15px;font-weight:600;text-align:right;">Total: ${formatPrice(order.total)}</p>
     <a href="${appUrl}/account/orders" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#111;color:#fff;text-decoration:none;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;">Ver mi pedido</a>`,
  );
}

export function paymentApprovedEmail(orderNumber: string) {
  return layout(
    `Pago aprobado — pedido #${orderNumber}`,
    `<p style="font-size:14px;color:#444;">Tu pago fue aprobado. Ya estamos preparando tu pedido para el envío.</p>`,
  );
}

export function orderShippedEmail(orderNumber: string, trackingNumber?: string | null, trackingCarrier?: string | null) {
  return layout(
    `Tu pedido #${orderNumber} va en camino`,
    `<p style="font-size:14px;color:#444;">
      ${trackingNumber ? `Guía de rastreo: <strong>${trackingNumber}</strong> (${trackingCarrier ?? "transportadora"})` : "Tu pedido fue despachado."}
     </p>`,
  );
}

export function orderDeliveredEmail(orderNumber: string) {
  return layout(
    `Pedido #${orderNumber} entregado`,
    `<p style="font-size:14px;color:#444;">Tu pedido fue entregado. Esperamos que lo disfrutes — si algo no está bien, escríbenos y con gusto lo resolvemos.</p>`,
  );
}

export function passwordResetEmail(resetUrl: string) {
  return layout(
    "Restablece tu contraseña",
    `<p style="font-size:14px;color:#444;">Recibimos una solicitud para restablecer tu contraseña. Este enlace expira en 1 hora.</p>
     <a href="${resetUrl}" style="display:inline-block;margin-top:8px;padding:12px 24px;background:#111;color:#fff;text-decoration:none;font-size:13px;letter-spacing:0.05em;text-transform:uppercase;">Restablecer contraseña</a>
     <p style="font-size:12px;color:#8a8a86;margin-top:16px;">Si no solicitaste esto, puedes ignorar este correo.</p>`,
  );
}

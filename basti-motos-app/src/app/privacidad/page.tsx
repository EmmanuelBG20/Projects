export const metadata = { title: "Política de privacidad — BASTI MOTOS" };

export default function PrivacidadPage() {
  return (
    <div className="container-app max-w-3xl py-16">
      <h1 className="section-title">Política de privacidad</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-neutral-300">
        <p>
          En BASTI MOTOS recopilamos únicamente los datos necesarios para procesar tu pedido: nombre,
          correo, teléfono y dirección de envío.
        </p>
        <h2 className="text-lg font-bold text-white">Datos de pago</h2>
        <p>
          No almacenamos números de tarjeta ni datos financieros. Todo el procesamiento de pagos ocurre
          directamente en los servidores de Wompi Colombia, bajo sus propios estándares de seguridad
          (PCI-DSS).
        </p>
        <h2 className="text-lg font-bold text-white">Uso de la información</h2>
        <p>
          Usamos tu correo para enviarte confirmaciones de pedido, actualizaciones de envío y, si lo
          autorizas, novedades sobre productos. Puedes solicitar la eliminación de tu cuenta en
          cualquier momento escribiendo a hola@bastimotos.co.
        </p>
        <h2 className="text-lg font-bold text-white">Cookies</h2>
        <p>
          Usamos cookies estrictamente necesarias para mantener tu sesión iniciada y tu carrito de
          compras.
        </p>
      </div>
    </div>
  );
}

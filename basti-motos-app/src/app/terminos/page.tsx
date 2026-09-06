export const metadata = { title: "Términos y condiciones — BASTI MOTOS" };

export default function TerminosPage() {
  return (
    <div className="container-app max-w-3xl py-16">
      <h1 className="section-title">Términos y condiciones</h1>
      <div className="mt-6 space-y-4 text-sm leading-relaxed text-neutral-300">
        <p>
          Este sitio es un proyecto de portafolio construido con fines demostrativos. El siguiente
          texto describe, de forma orientativa, los términos bajo los cuales operaría una tienda
          real como BASTI MOTOS.
        </p>
        <h2 className="text-lg font-bold text-white">1. Aceptación de los términos</h2>
        <p>
          Al crear una cuenta o realizar una compra en BASTI MOTOS aceptas estos términos de uso y
          nuestra política de privacidad.
        </p>
        <h2 className="text-lg font-bold text-white">2. Precios y disponibilidad</h2>
        <p>
          Todos los precios están expresados en pesos colombianos (COP) e incluyen los impuestos
          aplicables. La disponibilidad de stock se valida nuevamente en el servidor al momento de
          confirmar tu pedido.
        </p>
        <h2 className="text-lg font-bold text-white">3. Pagos</h2>
        <p>
          Los pagos se procesan a través de Wompi Colombia. BASTI MOTOS nunca almacena los datos de
          tu tarjeta: esa información es gestionada directamente por la pasarela de pagos.
        </p>
        <h2 className="text-lg font-bold text-white">4. Envíos</h2>
        <p>
          Los tiempos y costos de envío varían según la ciudad de destino. El envío es gratuito en
          compras iguales o superiores a $200.000 COP.
        </p>
        <h2 className="text-lg font-bold text-white">5. Cambios y devoluciones</h2>
        <p>
          Puedes solicitar un cambio o devolución dentro de los 5 días hábiles siguientes a la
          entrega, siempre que el producto conserve su empaque original.
        </p>
      </div>
    </div>
  );
}

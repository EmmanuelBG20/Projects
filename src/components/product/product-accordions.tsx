import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function ProductAccordions({
  material,
  careInstructions,
}: {
  material: string;
  careInstructions: string;
}) {
  return (
    <Accordion type="single" collapsible className="mt-2">
      <AccordionItem value="material">
        <AccordionTrigger>Material y cuidado</AccordionTrigger>
        <AccordionContent className="space-y-1">
          <p>{material}</p>
          <p>{careInstructions}</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="shipping">
        <AccordionTrigger>Envío</AccordionTrigger>
        <AccordionContent>
          Envío estándar de 2 a 5 días hábiles. Gratis en pedidos superiores a $250.000 COP; de lo contrario
          $14.900 COP. Recibirás un número de guía apenas tu pedido sea despachado.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Devoluciones</AccordionTrigger>
        <AccordionContent>
          Tienes 30 días desde la entrega para cambios o devoluciones sin costo, siempre que la prenda
          conserve sus etiquetas originales.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

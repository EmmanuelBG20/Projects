# NOVAWEAR

E-commerce completo para una marca de ropa ficticia, construido como pieza de portafolio con una arquitectura de nivel comercial: catálogo con variantes e inventario transaccional, carrito persistente, checkout con arquitectura multi-pasarela, sistema de pedidos, panel administrativo, y una integración de WhatsApp + IA preparada con herramientas controladas.

> **Nota:** este es un proyecto de demostración. Los datos, productos y transacciones son ficticios.

## Índice

- [Stack](#stack)
- [Arquitectura](#arquitectura)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos](#base-de-datos)
- [Nota sobre SQLite y rutas](#nota-sobre-sqlite-y-rutas)
- [Desarrollo](#desarrollo)
- [Testing](#testing)
- [Pagos](#pagos)
- [WhatsApp + chatbot IA](#whatsapp--chatbot-ia)
- [Email](#email)
- [SEO y performance](#seo-y-performance)
- [Seguridad](#seguridad)
- [Deployment](#deployment)
- [Decisiones de arquitectura](#decisiones-de-arquitectura)

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript estricto |
| UI | Tailwind CSS, componentes propios estilo shadcn/ui sobre Radix UI, Lucide Icons |
| Formularios | React Hook Form + Zod |
| Datos en cliente | TanStack Query (carrito), Zustand (estado de UI) |
| Backend | Server Actions + Route Handlers de Next.js |
| Base de datos | PostgreSQL en producción / SQLite en desarrollo, vía Prisma ORM |
| Auth | Auth.js v5 (Credentials + JWT), roles CUSTOMER/MANAGER/ADMIN |
| Pagos | Wompi, Mercado Pago, Stripe — con fallback sandbox automático |
| Email | Resend (con modo de desarrollo que solo registra en consola) |
| WhatsApp | WhatsApp Business Cloud API + agente con herramientas controladas |
| Gráficas admin | Recharts |
| Tests | Vitest (unit/integration), Playwright (e2e) |

## Arquitectura

```
src/
  app/
    (shop)/          # tienda: home, catálogo, producto, carrito, checkout, cuenta, login/registro
    admin/            # panel administrativo (protegido por rol)
    api/
      auth/           # Auth.js
      cart/           # lectura de carrito para el cliente
      webhooks/       # wompi, mercadopago, stripe, whatsapp
    sitemap.ts, robots.ts
  components/
    ui/               # primitivos (botón, input, dialog, sheet, select…)
    layout/ home/ shop/ product/ cart/ checkout/ account/ admin/
  lib/
    prisma.ts, auth.ts, session.ts, cart.ts, orders.ts, coupons.ts, inventory.ts, products.ts
    validations/      # esquemas Zod por dominio
    actions/          # Server Actions (mutaciones), separadas de las Server Actions admin/*
    payments/         # abstracción de pasarelas + mock
    email/            # proveedor + templates
    whatsapp/         # cliente Cloud API, herramientas controladas, agente
    ai/               # abstracción de function-calling (OpenAI de ejemplo)
    webhooks/         # lógica compartida de procesamiento de webhooks de pago
prisma/
  schema.prisma, seed.ts, migrations/
tests/
  unit/               # Vitest — lógica de inventario, cupones, validaciones
  e2e/                # Playwright — auth, carrito, checkout
```

Principios seguidos:

- **Autorización siempre en el servidor.** El middleware (`middleware.ts`) protege `/admin` y `/account` a nivel de ruta, pero cada Server Action vuelve a verificar rol/sesión (`requireAdmin`, `requireUser`) — nunca se confía en que el frontend oculte un botón.
- **El cliente nunca calcula precios.** Carrito, cupones, envío e impuestos se recalculan en el servidor en cada mutación y de nuevo al crear el pedido.
- **Inventario sin sobreventa.** Las reservas de stock usan un `UPDATE` condicional (`WHERE quantity - reserved >= cantidad`) dentro de una transacción, en vez de depender del nivel de aislamiento de la base de datos — funciona igual en SQLite y PostgreSQL. Ver `src/lib/inventory.ts` y las pruebas en `tests/unit/inventory.test.ts` (incluye un test de dos checkouts compitiendo por la última unidad).
- **Integraciones "fail open" a modo sandbox.** Pagos, email, WhatsApp e IA verifican si sus variables de entorno están presentes; si no lo están, degradan a un modo de desarrollo claramente identificado en vez de romper la aplicación.

## Instalación

```bash
npm install
cp .env.example .env
# completa AUTH_SECRET (ver más abajo) y, si los tienes, el resto de los valores
npx prisma migrate dev
npm run db:seed
npm run dev
```

Abre `http://localhost:3000`. Usuarios de prueba (contraseña `Novawear123` para todos):

| Rol | Correo |
|---|---|
| ADMIN | `admin@novawear.co` |
| MANAGER | `manager@novawear.co` |
| CUSTOMER | `camila@example.com` (y 3 más — ver `prisma/seed.ts`) |

## Variables de entorno

Ver [`.env.example`](.env.example) para la lista completa y comentada. Ninguna es obligatoria salvo `DATABASE_URL` y `AUTH_SECRET` — el resto habilita integraciones opcionales:

```bash
npx auth secret   # genera un AUTH_SECRET válido
```

## Base de datos

El esquema (`prisma/schema.prisma`) modela: `User`/`Account`/`Session` (Auth.js), `Category`, `Product`/`ProductVariant`/`ProductImage`, `Inventory`/`InventoryMovement`, `Cart`/`CartItem`, `Order`/`OrderItem`/`OrderStatusHistory`/`Payment`/`WebhookEvent`, `Coupon`/`CouponUsage` (+ tablas de alcance por categoría/producto), `Review`, `Wishlist`, `Address`, `SupportTicket`, `WhatsappConversation`/`WhatsappMessage`.

Decisiones notables:

- IDs `uuid()`, timestamps (`createdAt`/`updatedAt`), índices en columnas de consulta frecuente (`status`, `categoryId`, claves foráneas) y `@@unique` donde corresponde (SKU, slug, email, combinaciones talla+color por producto).
- Los estados (`OrderStatus`, `Role`, tipo de cupón, etc.) son *strings* validados por Zod/TypeScript en vez de enums nativos de la base de datos — ver la nota de SQLite abajo.
- `Order` guarda una **foto** de la dirección y el precio de cada línea al momento de la compra (no referencias en vivo a `Address`/`Product`), para que el historial de pedidos no cambie si el cliente edita su dirección o el admin cambia el precio de un producto.

Comandos:

```bash
npm run db:migrate   # crear/aplicar una migración
npm run db:push      # sincronizar el schema sin migración (prototipado)
npm run db:seed      # poblar datos de demo
npm run db:studio    # explorador visual de Prisma
npm run db:reset     # reset + re-seed
```

### Nota sobre SQLite y rutas

Este proyecto usa SQLite en desarrollo por conveniencia (cero configuración: no necesitas un servidor Postgres para levantar el proyecto). El `datasource` en `schema.prisma` evita features exclusivas de PostgreSQL (enums nativos, columnas array) precisamente para que migrar sea trivial.

Un detalle a tener en cuenta: Prisma resuelve una URL SQLite relativa (`file:./dev.db`) de forma distinta según el contexto — el CLI de migraciones la resuelve relativa a `schema.prisma`, pero el Client generado la resuelve relativa a su propia carpeta de salida (`node_modules/.prisma/client`). En algunos entornos esto puede hacer que la app apunte silenciosamente a una base de datos vacía. Si ves tablas "vacías" que deberían tener datos, usa una ruta **absoluta** en `DATABASE_URL`, por ejemplo:

```bash
DATABASE_URL="file:/ruta/absoluta/a/tu/proyecto/prisma/dev.db"
```

Para producción, cambia `provider = "sqlite"` a `provider = "postgresql"` en `schema.prisma` y apunta `DATABASE_URL` a tu instancia administrada (Neon, Supabase, Railway, RDS…) — el resto del código no necesita cambios.

## Desarrollo

```bash
npm run dev         # servidor de desarrollo
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build       # build de producción
```

## Testing

```bash
npm test            # Vitest — validaciones, cupones, e inventario (incluye el test de no-sobreventa)
npm run test:e2e     # Playwright — requiere `npx playwright install` una vez
```

Los tests de Vitest corren contra la base SQLite de desarrollo usando un producto/variante desechables que cada test crea y elimina — no dependen de datos del seed salvo los cupones (`WELCOME10`, `NOVA50K`, `VERANO20`, `VIP5`, `EXPIRED10`), que sí forman parte del seed.

## Pagos

Arquitectura en `src/lib/payments/`: una interfaz común (`PaymentProvider`) con implementaciones para Wompi, Mercado Pago y Stripe, más un proveedor `mock` que siempre está "configurado". `getPaymentProvider(id)` (en `provider.ts`) devuelve automáticamente el `mock` si el proveedor solicitado no tiene sus variables de entorno completas — así el checkout nunca se rompe por falta de credenciales, y el banner "Modo sandbox" en el checkout lo deja explícito al usuario.

- **Wompi**: Web Checkout widget, firma de integridad `SHA256(referencia + monto_centavos + moneda + secreto)`.
- **Mercado Pago**: Checkout Pro (`/checkout/preferences`), webhook verificado con HMAC (`x-signature`) y resolución del pago real vía `/v1/payments/:id`.
- **Stripe**: Checkout Sessions, verificación de firma con el SDK oficial.

Los tres webhooks (`/api/webhooks/{wompi,mercadopago,stripe}`) comparten `handlePaymentWebhook` (`src/lib/webhooks/handle-payment-event.ts`): verifican firma, des-duplican eventos contra la tabla `WebhookEvent` (única por `provider+eventId`), y solo entonces aprueban/rechazan el pedido — nunca se confía en el estado que reporta el cliente.

**Nunca se almacenan datos de tarjeta.** Todo el flujo de pago ocurre en la pasarela; NOVAWEAR solo guarda el `providerRef` y el estado.

## WhatsApp + chatbot IA

- `/admin/whatsapp`: estado de conexión y conversaciones (con la conversación de demo del seed).
- `/admin/integrations`: qué variables de entorno están presentes para cada integración, sin exponer sus valores.
- `src/lib/whatsapp/tools/index.ts`: el **único** punto de contacto entre el asistente y la base de datos — `searchProducts`, `getProduct`, `checkInventory`, `createCart`, `addToCart`, `getCustomerOrders`, `getOrderStatus`, `createSupportTicket`. El modelo de lenguaje nunca recibe acceso directo a Prisma.
- `src/lib/ai/provider.ts`: bucle de function-calling estilo OpenAI (fetch directo a la API, sin SDK) que llama a esas herramientas. Sin `OPENAI_API_KEY`/`ANTHROPIC_API_KEY`/`GEMINI_API_KEY`, `src/lib/whatsapp/agent.ts` cae a un respondedor basado en reglas que cubre los flujos de ejemplo del brief (saludo, búsqueda de producto, estado de pedido, escalar a un asesor humano) — verificado end-to-end simulando el webhook contra `/api/webhooks/whatsapp`.
- El webhook (`/api/webhooks/whatsapp`) valida la firma `X-Hub-Signature-256` con `WHATSAPP_APP_SECRET` y responde al *handshake* de verificación de Meta (`hub.challenge`).

## Email

`src/lib/email/provider.ts` envía vía Resend; sin `RESEND_API_KEY`, registra el correo en consola en vez de fallar. Templates en `src/lib/email/templates.ts`: confirmación de pedido, pago aprobado, enviado, entregado, restablecimiento de contraseña.

## SEO y performance

- Metadata dinámica por producto/categoría, Open Graph, Twitter Cards, `sitemap.ts`/`robots.ts` generados desde la base de datos, JSON-LD (`Product`, `Organization`) y breadcrumbs.
- Server Components por defecto; los componentes de cliente están acotados a lo interactivo (selector de variantes, filtros, carrito).
- `next/image` para todas las imágenes de producto, con `remotePatterns` configurado para Unsplash/Cloudinary.

## Seguridad

- Contraseñas con `bcryptjs` (12 rounds); nunca se guardan en texto plano.
- Rate limiting en memoria (`src/lib/rate-limit.ts`) en login, registro, checkout, reseñas, newsletter y los cuatro webhooks — documentado como de un solo proceso; para multi-instancia, reemplazar por `@upstash/ratelimit` sin cambiar las llamadas.
- Toda mutación valida su input con Zod antes de tocar la base de datos.
- Los pedidos y direcciones se autorizan por `userId` de la sesión, nunca por un ID recibido del cliente sin verificar (`/account/orders/[id]` devuelve 404 si el pedido no pertenece al usuario).
- Webhooks de pago: verificación de firma + idempotencia (ver arriba).

## Deployment

1. **Base de datos**: aprovisiona PostgreSQL (Neon/Supabase/Railway), cambia el `provider` en `schema.prisma` y corre `npx prisma migrate deploy`.
2. **Frontend/backend**: Vercel (framework Next.js detectado automáticamente). Configura todas las variables de `.env.example` que apliquen en el dashboard del proyecto.
3. **Imágenes**: crea una cuenta de Cloudinary y agrega `CLOUDINARY_*`; el `next.config.mjs` ya permite ese dominio.
4. **Webhooks**: registra `https://tu-dominio/api/webhooks/{wompi,mercadopago,stripe,whatsapp}` en el dashboard de cada proveedor.
5. **Seed en producción**: ejecuta `npm run db:seed` solo si quieres datos de demo — normalmente se omite en producción real.

## Decisiones de arquitectura

Como nota de CTO, dos decisiones que se apartan ligeramente del brief original y por qué:

- **SQLite en desarrollo en vez de requerir Postgres de entrada.** El objetivo explícito era que `npm install && npm run dev` funcione sin infraestructura externa. Se prioriza esto mantiene el schema 100% portable a Postgres (ver arriba).
- **Estados de dominio como `string` validado en vez de `enum` nativo.** Los enums nativos de Prisma no están soportados en SQLite; usar strings + validación en la capa de aplicación (Zod/TypeScript union types) evita atarse a un motor específico y es un patrón común incluso en proyectos que sí usan Postgres desde el día uno.

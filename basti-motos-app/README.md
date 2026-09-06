# BASTI MOTOS

E-commerce full stack para venta de kits, herramientas y accesorios de mantenimiento de motocicletas en Colombia. Next.js 15 (App Router) + TypeScript + PostgreSQL/Prisma + Auth.js + Wompi Colombia.

No es una maqueta: tiene base de datos real, autenticación, carrito persistente, checkout con recálculo server-side, pago real vía Wompi (Web Checkout + webhook con verificación de firma) y un panel administrativo completo.

## Tabla de contenido

1. [Arquitectura](#arquitectura)
2. [Árbol de carpetas](#árbol-de-carpetas)
3. [Modelo de base de datos](#modelo-de-base-de-datos)
4. [Variables de entorno](#variables-de-entorno)
5. [Desarrollo local](#desarrollo-local)
6. [Migraciones y seed](#migraciones-y-seed)
7. [Cuentas de prueba](#cuentas-de-prueba)
8. [Probar el flujo de pago (Wompi sandbox)](#probar-el-flujo-de-pago-wompi-sandbox)
9. [Plan de pruebas manuales](#plan-de-pruebas-manuales)
10. [Despliegue en Vercel](#despliegue-en-vercel)
11. [Checklist antes de producción](#checklist-antes-de-producción)
12. [Decisiones y limitaciones conocidas](#decisiones-y-limitaciones-conocidas)

---

## Arquitectura

- **Next.js 15, App Router, TypeScript estricto.**
- **Server Actions** para mutaciones ligadas a formularios (auth, direcciones, carrito, checkout, CRUD de admin).
- **Route Handlers** (`src/app/api/**`) solo donde se necesita un endpoint HTTP real: Auth.js, webhook de Wompi, firma de Cloudinary, búsqueda.
- **`src/middleware.ts`** protege `/admin/**` (rol `ADMIN`) y `/mi-cuenta/**` (sesión requerida). Corre en el Edge Runtime, por eso usa una configuración de Auth.js separada (`auth.config.ts`) sin Prisma ni bcrypt — ver la nota en [Decisiones y limitaciones](#decisiones-y-limitaciones-conocidas).
- **`src/lib/`** concentra la lógica de negocio: `auth.ts`, `wompi.ts`, `email.ts`, `cloudinary.ts`, `cart.ts`, `orders.ts`, `shipping.ts`, `money.ts`, `rate-limit.ts`, `validations/*` (Zod, compartidos cliente/servidor).
- **Nunca se confía en el navegador** para precio, stock o descuentos: `lib/orders.ts` recalcula todo en el servidor dentro de transacciones de Prisma antes de crear una orden.
- **Flujo de pago:** referencia única generada en servidor → firma de integridad SHA-256 → redirección al Web Checkout de Wompi → Wompi redirige a `/checkout/resultado` (informativo, nunca decide el estado) → el webhook `/api/webhooks/wompi` valida la firma del evento y, dentro de una transacción de Prisma, aprueba el pago y descuenta stock **solo si** el pago pasa a `APPROVED` y no había sido procesado antes (idempotencia).

### Stack

| Área | Tecnología |
|---|---|
| Framework | Next.js 15 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS |
| Base de datos | PostgreSQL |
| ORM | Prisma |
| Validación | Zod |
| Formularios | React Hook Form |
| Auth | Auth.js (NextAuth v5), Credentials + JWT en cookie httpOnly |
| Hash de contraseñas | bcryptjs |
| Imágenes | Cloudinary (subida firmada desde el servidor) |
| Correos transaccionales | Resend |
| Pagos | Wompi Colombia (Web Checkout + Webhooks) |
| Estado de carrito (cliente) | Zustand + localStorage |
| Despliegue | Vercel |

---

## Árbol de carpetas

```
basti-motos-app/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── src/
│   ├── middleware.ts
│   ├── app/
│   │   ├── layout.tsx, page.tsx, globals.css
│   │   ├── productos/ | categorias/[slug]/ | buscar/ | carrito/
│   │   ├── checkout/ | checkout/resultado/
│   │   ├── iniciar-sesion/ | registro/ | recuperar-contrasena/ | nueva-contrasena/
│   │   ├── contacto/ | terminos/ | privacidad/
│   │   ├── mi-cuenta/ (layout con guard de sesión + perfil, direcciones, pedidos)
│   │   ├── admin/ (layout con guard de rol ADMIN + productos, categorías, marcas,
│   │   │           pedidos, cupones, inventario, estadísticas)
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── auth/verificar/route.ts
│   │       ├── webhooks/wompi/route.ts
│   │       ├── cloudinary/sign/route.ts
│   │       └── buscar/route.ts
│   ├── components/ (layout, home, product, cart, checkout, account, admin, ui, providers)
│   ├── lib/ (auth, auth.config, prisma, wompi, email, cloudinary, cart, orders,
│   │         shipping, money, rate-limit, guards, order-status, colombia,
│   │         product-mappers, validations/*)
│   ├── actions/ (auth, address, cart, checkout, account, review, product,
│   │             category-brand, coupon, order — Server Actions por dominio)
│   ├── store/cart-store.ts (Zustand, persistido en localStorage)
│   ├── hooks/use-cart.ts
│   └── types/
├── .env.example
├── next.config.ts, tailwind.config.ts, tsconfig.json
└── package.json
```

---

## Modelo de base de datos

Definido completo en [`prisma/schema.prisma`](prisma/schema.prisma). Resumen de entidades y decisiones clave:

- **User** — email único, `passwordHash` (bcrypt), `role` (`CUSTOMER`/`ADMIN`). 1:N `Address`, `Order`, `Review`; 1:1 `Cart`.
- **Address** — direcciones de envío del usuario, con `city`/`department` y flag `isDefault`.
- **Category** / **Brand** — catálogo, `slug` único cada uno.
- **Product** — `priceCents` y `compareAtPriceCents` como **enteros en centavos** (nunca `Float`), `stock`, `tags` (`ProductTag[]`), relación N:N consigo mismo (`relatedTo`/`relatedFrom`) para "productos compatibles". 1:N `ProductImage`, `Review`.
- **Cart** / **CartItem** — un carrito activo por usuario autenticado; el carrito de invitado vive en `localStorage` (ver `store/cart-store.ts`) y se sincroniza a estas tablas al iniciar sesión (`mergeGuestCartAction`).
- **Order** — `reference` único (referencia de pago Wompi), totales ya calculados (`subtotalCents`, `discountCents`, `shippingCents`, `totalCents`), `status` (`OrderStatus`). 1:N `OrderItem`; 1:1 `Payment`.
- **OrderItem** — **copia histórica** de `productName`, `sku` y `unitPriceCents`: si el producto cambia después, el pedido conserva lo que el cliente realmente compró.
- **Payment** — `transactionId` y `reference` únicos; estos `@unique` son la base de la idempotencia del webhook (ver `lib/orders.ts#applyWompiTransactionUpdate`).
- **Coupon** / **CouponUsage** — cupones porcentuales o fijos, con `maxUses`, `minOrderCents` y un uso único por orden (`orderId` único en `CouponUsage`).
- **Review** — una reseña por usuario y producto (`@@unique([productId, userId])`); al crearse, recalcula `Product.rating`/`reviewCount`.
- **PasswordResetToken** / **EmailVerificationToken** — tokens de un solo uso con expiración.
- **ShippingRate** — tarifa por ciudad; con envío gratis automático desde `$200.000 COP` (`lib/shipping.ts`).

Enums: `Role`, `OrderStatus` (`PENDING_PAYMENT → PAID → PROCESSING → SHIPPED → DELIVERED`, o `CANCELLED`/`REFUNDED`), `PaymentStatus`, `PaymentProvider` (`WOMPI`), `CouponType`, `ProductTag`.

**Reglas de negocio no negociables, implementadas en `lib/orders.ts`:**
- El stock se **valida** al crear la orden, pero solo se **descuenta** cuando el webhook confirma `APPROVED` (dentro de una transacción de Prisma).
- El cliente nunca decide por sí solo que un pago fue exitoso: `/checkout/resultado` solo lee el estado que el webhook ya guardó en la base de datos.

---

## Variables de entorno

Copia `.env.example` a `.env` y complétalo:

```bash
cp .env.example .env
```

| Variable | ¿Dónde se usa? | ¿Puede exponerse al navegador? |
|---|---|---|
| `DATABASE_URL` | Prisma (runtime, conexión *pooled*) | ❌ Privada |
| `DIRECT_URL` | Prisma (`migrate`, conexión directa) | ❌ Privada |
| `NEXTAUTH_URL` | Auth.js | ❌ Privada |
| `NEXTAUTH_SECRET` | Auth.js (firma de JWT) | ❌ Privada |
| `JWT_SECRET` | Reservada para uso interno adicional si se requiere | ❌ Privada |
| `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` | Construcción del link del Web Checkout de Wompi | ✅ Es la **única** clave de Wompi que puede viajar al cliente |
| `WOMPI_PRIVATE_KEY` | Consultas a la API de Wompi desde el servidor | ❌ Privada |
| `WOMPI_INTEGRITY_SECRET` | Firma SHA-256 de cada transacción | ❌ Privada — **nunca** debe llegar al navegador |
| `WOMPI_EVENTS_SECRET` | Verificación de firma del webhook | ❌ Privada |
| `WOMPI_REDIRECT_URL` | A dónde redirige Wompi tras el pago | ❌ Privada (aunque no es secreta, se resuelve en servidor) |
| `WOMPI_ENV` | `sandbox` o `production` | ❌ Privada |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | Firma de subida de imágenes | ❌ Privadas |
| `RESEND_API_KEY` / `EMAIL_FROM` | Envío de correos transaccionales | ❌ Privadas |
| `NEXT_PUBLIC_APP_URL` | Construir enlaces absolutos (correos, Wompi) | ✅ Pública (no es secreta) |

> Regla general: **cualquier variable que empiece con `NEXT_PUBLIC_` termina en el bundle del navegador.** Por eso solo `NEXT_PUBLIC_WOMPI_PUBLIC_KEY` y `NEXT_PUBLIC_APP_URL` llevan ese prefijo; todo lo demás se lee exclusivamente en Server Components, Server Actions o Route Handlers.

Sin las variables de `WOMPI_*`, `CLOUDINARY_*` o `RESEND_API_KEY`, el resto de la tienda (catálogo, cuentas, carrito, panel admin) funciona igual: esas integraciones fallan de forma controlada (mensajes de error claros o, en el caso de los correos, un `console.info` en vez de bloquear al usuario) en vez de romper la aplicación.

---

## Desarrollo local

Requisitos: Node.js 20+, una base de datos PostgreSQL (local o gestionada, p. ej. [Neon](https://neon.tech) o [Supabase](https://supabase.com)).

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# edita .env con tu DATABASE_URL/DIRECT_URL y NEXTAUTH_SECRET como mínimo

# 3. Crear las tablas
npm run prisma:migrate

# 4. Cargar datos de ejemplo (categorías, marcas, 16 productos, cupón, usuarios de prueba)
npm run db:seed

# 5. Levantar el servidor de desarrollo
npm run dev
```

Abre `http://localhost:3000`.

---

## Migraciones y seed

```bash
npm run prisma:migrate    # crea/actualiza las tablas en desarrollo (prisma migrate dev)
npm run prisma:deploy     # aplica migraciones ya generadas (usar en CI/CD o producción)
npm run prisma:studio     # explorador visual de la base de datos
npm run db:seed           # vuelve a ejecutar prisma/seed.ts (usa upsert: es seguro repetirlo)
```

---

## Cuentas de prueba

El seed crea estas cuentas (**cambia estas contraseñas antes de desplegar a producción con datos reales**):

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | `admin@bastimotos.co` | `Admin123!` |
| Cliente demo (con una dirección guardada en Medellín) | `cliente@bastimotos.co` | `Cliente123!` |

Cupón de ejemplo: `RIDER10` (10% de descuento, compra mínima $50.000 COP).

---

## Probar el flujo de pago (Wompi sandbox)

1. Crea una cuenta de comercio en el [dashboard de Wompi](https://comercios.wompi.co) (sandbox) y copia tus llaves de prueba a `.env`.
2. En el dashboard de Wompi, registra la URL del webhook: `https://<tu-dominio-o-túnel>/api/webhooks/wompi`. En local puedes usar [ngrok](https://ngrok.com) o similar para exponer `localhost:3000`.
3. Inicia sesión con la cuenta demo, agrega productos al carrito y ve a `/checkout`. Al confirmar, la app crea la orden (`PENDING_PAYMENT`) y te redirige al Web Checkout de Wompi.
4. Usa una [tarjeta de prueba de Wompi](https://docs.wompi.co/docs/en/tarjetas-de-prueba) para simular la aprobación o el rechazo.
5. Wompi te redirige a `/checkout/resultado`; el webhook (llamado por Wompi, no por el navegador) actualiza `Payment` y `Order` en segundo plano.

### Simular el webhook manualmente (sin cuenta de Wompi)

Puedes probar la lógica de idempotencia y el cálculo de la firma directamente con `curl`, generando el checksum igual que lo haría Wompi:

```bash
node -e "
const crypto = require('crypto');
const reference = 'PON-AQUI-LA-REFERENCIA-DE-UNA-ORDEN';
const timestamp = Math.floor(Date.now() / 1000);
const secret = process.env.WOMPI_EVENTS_SECRET || 'TU_WOMPI_EVENTS_SECRET';
const checksum = crypto.createHash('sha256').update('APPROVED' + '8990000' + reference + timestamp + secret).digest('hex');
console.log(JSON.stringify({ checksum, timestamp }));
"
```

Y luego enviar el evento (ajusta `amount_in_cents`/`reference` a una orden real en tu base de datos, y el orden de las propiedades debe coincidir con `signature.properties`):

```bash
curl -X POST http://localhost:3000/api/webhooks/wompi \
  -H "Content-Type: application/json" \
  -d '{
    "event": "transaction.updated",
    "data": { "transaction": {
      "id": "test-txn-1",
      "amount_in_cents": 8990000,
      "reference": "PON-AQUI-LA-REFERENCIA-DE-UNA-ORDEN",
      "status": "APPROVED",
      "currency": "COP"
    }},
    "environment": "test",
    "timestamp": 1234567890,
    "signature": { "properties": ["transaction.status", "transaction.amount_in_cents", "transaction.reference"], "checksum": "..." }
  }'
```

Envía el mismo cuerpo dos veces: la segunda vez el endpoint debe responder igual, pero el stock **no** se descuenta de nuevo (idempotencia).

---

## Plan de pruebas manuales

El proyecto no incluye una suite de pruebas automatizadas (no estaba en el stack solicitado). Antes de dar por buena una release, verifica manualmente:

**Cliente**
- [ ] Registro, verificación de correo (revisa la consola si no hay `RESEND_API_KEY`) e inicio de sesión.
- [ ] Recuperar contraseña de extremo a extremo (token, `/nueva-contrasena`, nuevo login).
- [ ] Agregar productos al carrito como invitado, cerrar el navegador, volver: el carrito sigue ahí (localStorage).
- [ ] Iniciar sesión con un carrito de invitado con productos: se fusiona con el carrito de la cuenta.
- [ ] Cambiar cantidades, eliminar productos, ver que el contador del header se actualice.
- [ ] Completar checkout con una dirección nueva y con una guardada; aplicar el cupón `RIDER10`.
- [ ] Pagar con una tarjeta de prueba aprobada y una rechazada; confirmar el estado en `/mi-cuenta/pedidos`.
- [ ] Dejar una reseña en un producto comprado y ver que el promedio se actualice.

**Administrador**
- [ ] Crear, editar, activar/desactivar y eliminar un producto; confirmar que un producto con pedidos se desactiva en vez de borrarse.
- [ ] Subir y eliminar imágenes de un producto (requiere `CLOUDINARY_*`).
- [ ] Crear categorías, marcas y cupones.
- [ ] Cambiar el estado logístico de un pedido pagado y confirmar que llega el correo de actualización.
- [ ] Confirmar que **no** se puede cambiar el estado de un pedido `PENDING_PAYMENT` manualmente.
- [ ] Revisar `/admin/estadisticas` y `/admin/inventario` con productos de bajo stock.

**Seguridad**
- [ ] Un usuario `CUSTOMER` no puede acceder a `/admin/**` (redirige a `/`).
- [ ] Un usuario no autenticado no puede acceder a `/mi-cuenta/**` ni a `/admin/**`.
- [ ] 6 intentos de login fallidos seguidos activan el rate limit (mensaje de "demasiados intentos").
- [ ] Un webhook con firma inválida se rechaza con `401`.

---

## Despliegue en Vercel

1. Sube el proyecto a un repositorio Git (GitHub/GitLab/Bitbucket).
2. En [vercel.com](https://vercel.com), **Add New Project** → importa el repositorio.
3. En **Environment Variables**, agrega todas las variables de `.env.example` (usa tus valores reales de producción, no los de `.env` local).
4. Como `DATABASE_URL` usa una conexión *pooled* (por ejemplo, Neon con pgbouncer) y `DIRECT_URL` la conexión directa — Prisma los necesita separados para que las funciones serverless no agoten las conexiones a la base de datos.
5. Despliega. El primer build ejecuta `prisma generate` automáticamente (`postinstall`).
6. Ejecuta las migraciones contra la base de datos de producción **una vez**, desde tu máquina o un job de CI:
   ```bash
   DATABASE_URL="..." DIRECT_URL="..." npx prisma migrate deploy
   DATABASE_URL="..." DIRECT_URL="..." npm run db:seed   # opcional, solo si quieres datos de ejemplo
   ```
7. Actualiza `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL` y `WOMPI_REDIRECT_URL` con tu dominio real de Vercel.
8. En el dashboard de Wompi, registra el webhook apuntando a `https://tu-dominio.vercel.app/api/webhooks/wompi`.

---

## Checklist antes de producción

- [ ] Cambiar `WOMPI_ENV` a `production` y usar las llaves reales (no las de prueba).
- [ ] Cambiar las contraseñas de las cuentas sembradas por el seed (o eliminarlas).
- [ ] `NEXTAUTH_SECRET` generado con `openssl rand -base64 32` (no el valor de ejemplo).
- [ ] Dominio de envío verificado en Resend para que los correos no caigan en spam.
- [ ] Revisar los límites de `lib/rate-limit.ts`: en un despliegue serverless con múltiples instancias, considera migrar a Upstash Redis para un límite consistente entre instancias.
- [ ] Confirmar que el webhook de Wompi está registrado con la URL de producción y que responde `200` (revisa los logs de Vercel).
- [ ] Probar al menos una transacción real de bajo monto de extremo a extremo.
- [ ] Backup / política de retención configurada en tu proveedor de PostgreSQL.

---

## Decisiones y limitaciones conocidas

- **Sin Prisma Adapter de Auth.js:** solo se usa Credentials + JWT, así que el adapter (pensado para OAuth y sesiones de base de datos) no aplica; `authorize()` consulta `User` directamente.
- **`auth.config.ts` vs `auth.ts`:** el middleware corre en el Edge Runtime, que no soporta Prisma ni bcrypt. `auth.config.ts` (sin providers "pesados") es lo único que importa `middleware.ts`; `auth.ts` extiende esa configuración agregando el provider de Credentials para el resto de la app (Node.js).
- **Rate limiting en memoria:** simple y suficiente para un solo proceso o desarrollo; en un despliegue serverless con varias instancias el límite efectivo puede ser mayor al configurado. Se documenta como mejora futura (Upstash Redis) en vez de forzar una dependencia de pago.
- **Verificación de correo no bloqueante:** un usuario puede comprar sin verificar su correo; el token solo marca `emailVerifiedAt`. Esto evita que la demo dependa de tener un dominio verificado en Resend para funcionar.
- **"Estado de tu moto" en el home** es una sección ilustrativa (no hay telemetría real por motocicleta en el alcance del proyecto); usa datos de ejemplo fijos, tal como se pidió en el diseño.

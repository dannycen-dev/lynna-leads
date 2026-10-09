# Lynna Leads · CUM

Prueba de concepto de atención a familias interesadas en secundaria y preparatoria del Centro Universitario Montejo. Conserva la marca Lynna e incorpora la identidad del CUM. Este repositorio se despliega de forma independiente del producto inmobiliario original.

## Qué muestra la demo

- CRM de admisiones con filtros por etapa y nivel, canal de origen, grado de interés, notas y próximo contacto.
- Tablero y reportes en vivo con embudo, contactos nuevos en 48 horas, fuentes de captación y seguimientos pendientes.
- Simulador de WhatsApp con respuestas del asistente basadas en contenido aprobado, opciones rápidas y envío de una guía visual o PDF cuando se solicitan.
- Derivación al equipo humano de consultas sobre precios, exámenes, inscripción y visitas al campus.
- Base de conocimiento editable por el equipo. Datos de contacto ficticios; no se cargaron expedientes de menores.

El simulador usa Workers AI. El envío y la recepción de WhatsApp están apagados hasta conectar el número de Meta y aprobar su configuración. Los seguimientos del tablero son tareas para el equipo: la demo no envía recordatorios automáticos a familias. La imagen y el PDF de `apps/web/public/materiales/` son piezas conceptuales de demostración; sustituirlos por material aprobado por el CUM antes de compartirlos con familias reales. Se regeneran con `node apps/e2e/scripts/generate-admissions-materials.mjs` desde la raíz, usando Chrome y la ilustración `admissions-hero.webp`.

## Infraestructura

- Cloudflare Workers para API e interfaz, Workers AI para el asistente.
- Cloudflare D1 como base de datos SQLite; R2, Queues y Durable Objects quedan aislados en la cuenta de 31 Rooms.
- Dominio: `cum.31rooms.com`. Cuenta Cloudflare: `soporte.31rooms@gmail.com`.
- No requiere Neon ni Supabase. Hyperdrive sería necesario si más adelante se eligiera una base PostgreSQL externa.

## Desarrollo local

Requiere Node 22 o superior, pnpm y un perfil Wrangler autenticado de 31 Rooms.

```sh
pnpm install
pnpm build
export XDG_CONFIG_HOME="$HOME/.wrangler-cuentas/31rooms"
pnpm db:migrate
pnpm db:seed
pnpm user:create --email demo@31rooms.com --name "Demo CUM" --role manager --tenant cum
pnpm dev
```

Para usar el asistente local, crea `apps/api/.dev.vars` con `ADMIN_API_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN` y `WHATSAPP_ACCESS_TOKEN`. Los valores de WhatsApp pueden ser ficticios para el simulador; no los subas al repositorio. Abre `http://localhost:8787`.

## Despliegue

Todas las operaciones remotas usan el perfil de 31 Rooms. El archivo de secretos de producción queda fuera de Git.

```sh
export XDG_CONFIG_HOME="$HOME/.wrangler-cuentas/31rooms"
pnpm build
cd apps/api
pnpm exec wrangler d1 migrations apply DB --remote
pnpm exec wrangler d1 execute DB --remote --file=seed/cum.sql
pnpm exec wrangler deploy --secrets-file .dev.vars.prod
```

El seed es repetible y contiene solo información pública aprobada y contactos ficticios. El despliegue del producto inmobiliario original se eliminó de este repositorio.

## Origen del alcance

La demo recoge los puntos de la llamada con el CUM: respuesta inicial, identificación de nivel, seguimiento de familias, información de admisión controlada y reporte para el equipo. El alcance está resumido en [docs/cum-call-requirements.md](docs/cum-call-requirements.md). Antes de atender familias reales hacen falta la activación completa del número de WhatsApp Business, datos oficiales vigentes de exámenes, colegiaturas y requisitos, y validación del aviso de privacidad que utilizará el colegio.

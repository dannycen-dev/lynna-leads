# WhatsApp de Lynna Leads CUM

Estado comprobado el 9 de octubre de 2026. Esta integración usa exclusivamente el portafolio **Lynna** de Meta y el número **+52 990 229 2345**.

| Recurso | ID | Estado |
| --- | --- | --- |
| Portafolio Lynna | `1661306175561939` | Verificación empresarial **aprobada** (`verified`) |
| App Lynna Leads CUM | `28827682516871481` | Publicada; webhook activo |
| Cuenta WhatsApp Lynna Leads | `4638362863156897` | Revisión aprobada; `status=ONBOARDING`, envío bloqueado |
| Número | `1339518955915625` | Propiedad verificada por SMS; registro Cloud API pendiente |
| Usuario del sistema Lynna Leads API | `61594877627036` | Acceso total a la app y a esta cuenta WhatsApp |

El webhook `https://cum.31rooms.com/whatsapp/webhook` está verificado por Meta, con el campo `messages` activo. La app está suscrita a la cuenta WhatsApp. El Worker valida peticiones firmadas con el App Secret actual. Sus secretos están en Cloudflare y en `apps/api/.dev.vars.prod` (ignorado por Git); nunca deben copiarse a este documento. El aviso de privacidad de la demo está publicado en `https://cum.31rooms.com/privacidad.html` y el CUM ya apunta a esa URL en D1.

El dominio `31rooms.com` (Meta domain ID `1417281106559810`) está **Verificado** en el portafolio Lynna mediante el TXT `facebook-domain-verification=9dsz2u9iwxigeb3f928423udfoze6t` en la zona Cloudflare de 31 Rooms. El formulario de verificación empresarial se envió mediante ese dominio el 9 de octubre de 2026 y después Graph confirmó `business_verification_status=verified`. No solicitó RFC ni constancia fiscal. Conservar el TXT mientras el dominio esté verificado.

La consulta `GET /4638362863156897?fields=health_status` informa:

- `141006`: la API de salud sigue informando un error de pago **aunque Billing Hub muestra un método Predeterminado** en la cuenta Lynna Leads del portafolio Lynna, con MXN y sin alertas. La navegación desde la ficha del número a «Cuentas de mensajes» y WhatsApp Manager conduce al asset interno `2356333361803876`, el mismo que usa Billing Hub. En esa vista la URL de pago contiene `payment_account_id=2110950789520273`; el ID `2112386169378291` documentado antes no apareció en la revisión y no debe usarse como prueba de vínculo. Meta no muestra explícitamente el método junto al ID Graph de la WABA. `GET /4638362863156897?fields=primary_funding_id` devuelve código `10` y dice que requiere un Business Solution Provider, así que este token no puede verificar el vínculo de financiación directamente.
- `141008`: la WABA no está activa; `GET /4638362863156897?fields=status` devuelve `ONBOARDING`. Meta indica contactar a soporte de WhatsApp para activarla.

El portafolio y la app figuran `AVAILABLE`, pero la WABA sigue `BLOCKED` y el número `PENDING`. WhatsApp Manager, abierto desde Business Settings, muestra el número y su estado **Pendiente**. Danny Cen tiene acceso total al asset interno `2356333361803876`; ese ID de interfaz no responde como WABA en Graph, donde el ID API válido sigue siendo `4638362863156897`.

`POST /1339518955915625/register` con un token que tiene `whatsapp_business_messaging` y un PIN de seis dígitos sigue devolviendo `(#10) Application does not have permission for this action` incluso después de la verificación empresarial y después de que el propietario agregó el método de pago. No se debe repetir sin resolver primero el estado de la cuenta y confirmar que el pago se refleje en la WABA. El PIN no se guarda.

Una prueba desde WhatsApp Web del propietario hacia +52 990 229 2345 mostró **«El número +52 990 229 2345 no está en WhatsApp»**. No se envió ningún mensaje ni se creó chat. Pendiente: que Meta aclare por qué `health_status` aún marca `141006` pese al pago visible y que resuelva `ONBOARDING`/`141008`. Después, registrar el número, probar recepción y activar las respuestas automáticas para la demo. En la web, `AUTO_REPLY_MODE` permanece en `off` y los seguimientos automáticos del CUM están desactivados.

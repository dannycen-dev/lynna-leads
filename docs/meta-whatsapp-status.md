# WhatsApp de Lynna Leads CUM

Estado comprobado el 9 de octubre de 2026. Esta integración usa exclusivamente el portafolio **Lynna** de Meta y el número **+52 990 229 2345**.

| Recurso | ID | Estado |
| --- | --- | --- |
| Portafolio Lynna | `1661306175561939` | Verificación empresarial enviada; **En revisión** |
| App Lynna Leads CUM | `28827682516871481` | Publicada; webhook activo |
| Cuenta WhatsApp Lynna Leads | `4638362863156897` | Aprobada, pero inactiva |
| Número | `1339518955915625` | Propiedad verificada por SMS; registro Cloud API pendiente |
| Usuario del sistema Lynna Leads API | `61594877627036` | Acceso total a la app y a esta cuenta WhatsApp |

El webhook `https://cum.31rooms.com/whatsapp/webhook` está verificado por Meta, con el campo `messages` activo. La app está suscrita a la cuenta WhatsApp. El Worker valida peticiones firmadas con el App Secret actual. Sus secretos están en Cloudflare y en `apps/api/.dev.vars.prod` (ignorado por Git); nunca deben copiarse a este documento. El aviso de privacidad de la demo está publicado en `https://cum.31rooms.com/privacidad.html` y el CUM ya apunta a esa URL en D1.

El dominio `31rooms.com` (Meta domain ID `1417281106559810`) está **Verificado** en el portafolio Lynna mediante el TXT `facebook-domain-verification=9dsz2u9iwxigeb3f928423udfoze6t` en la zona Cloudflare de 31 Rooms. El formulario de verificación empresarial se envió mediante ese dominio el 9 de octubre de 2026 y Meta mostró **En revisión**; no solicitó RFC ni constancia fiscal. Conservar el TXT mientras el dominio esté verificado.

La consulta `GET /4638362863156897?fields=health_status` informa:

- `141006`: la API de salud aún informa un error de pago, aunque WhatsApp Manager ya quitó la alerta y Billing Hub muestra un método **Predeterminado**. Volver a consultar después de que Meta actualice el estado.
- `141008`: la cuenta WhatsApp no está activa; Meta indica contactar a soporte de WhatsApp para activarla.
- `141010`: el portafolio no ha pasado la verificación empresarial.

`POST /1339518955915625/register` con un token que tiene `whatsapp_business_messaging` y un PIN de seis dígitos devuelve `(#10) Application does not have permission for this action`. No se debe repetir sin resolver primero los requisitos de la cuenta. El PIN no se guarda.

Pendiente: que Meta apruebe la verificación del portafolio y active la cuenta WhatsApp. El propietario ya agregó el método de pago y WhatsApp Manager quitó la alerta correspondiente. Después, registrar el número, probar recepción desde un número personal autorizado y activar las respuestas automáticas para la demo. En la web, `AUTO_REPLY_MODE` permanece en `off` y los seguimientos automáticos del CUM están desactivados.

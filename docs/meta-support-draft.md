# Solicitud a soporte de Meta · Lynna Leads

**Enviar desde el portafolio Lynna.** Este borrador no contiene tokens, PIN ni datos de tarjeta.

Hola. Solicito ayuda para activar la cuenta WhatsApp Business de Lynna Leads y registrar su número en Cloud API.

- Portafolio comercial: Lynna, ID `1661306175561939`. Verificación empresarial: `verified`.
- App: Lynna Leads CUM, ID `28827682516871481`, publicada.
- WABA API: `4638362863156897`, nombre Lynna Leads. `account_review_status=APPROVED`, pero `status=ONBOARDING`.
- Número: `+52 1 990 229 2345`, phone number ID `1339518955915625`. Propiedad verificada por SMS (`code_verification_status=VERIFIED`), pero `status=PENDING`.
- En Billing Hub, la cuenta Lynna Leads del portafolio muestra un método de pago **Predeterminado**, divisa MXN, sin deuda ni alertas. La vista usa asset interno `2356333361803876` y `payment_account_id=2110950789520273`. La navegación desde el número en Business Settings conduce a ese mismo asset de mensajes. No podemos comprobar por API el `primary_funding_id` de la WABA: Graph devuelve código `10` y solicita una app Business Solution Provider.
- Usuario del sistema: Lynna Leads API, ID `61594877627036`, con acceso a la app y WABA; el token tiene `whatsapp_business_management` y `whatsapp_business_messaging`.
- Webhook `messages` suscrito y verificado: `https://cum.31rooms.com/whatsapp/webhook`.

El endpoint `POST /1339518955915625/register` sigue respondiendo `(#10) Application does not have permission for this action` después de verificar el negocio y agregar el método de pago. `health_status` de WABA indica `can_send_message=BLOCKED`, con `141006` (payment method error) y `141008` (WABA not active, contact support). En WhatsApp Web, al iniciar chat hacia el número, aparece «El número +52 990 229 2345 no está en WhatsApp» y no se puede enviar.

En Business Settings, Danny Cen figura con acceso total al asset Lynna Leads (ID interno de interfaz `2356333361803876`). WhatsApp Manager abierto desde esa ficha sí muestra el número, pero en estado **Pendiente**.

¿Pueden verificar por qué `health_status` marca `141006` pese al método de pago predeterminado, completar o desbloquear el estado `ONBOARDING` de esta WABA y habilitar el registro del número en Cloud API? Si existe alguna acción de facturación o activación pendiente, indíquennos exactamente cuál es.

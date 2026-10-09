# Solicitud a soporte de Meta · Lynna Leads

**Enviar desde el portafolio Lynna.** Este borrador no contiene tokens, PIN ni datos de tarjeta.

Hola. Solicito ayuda para activar la cuenta WhatsApp Business de Lynna Leads y registrar su número en Cloud API.

- Portafolio comercial: Lynna, ID `1661306175561939`. Verificación empresarial: `verified`.
- App: Lynna Leads CUM, ID `28827682516871481`, publicada.
- WABA API: `4638362863156897`, nombre Lynna Leads. `account_review_status=APPROVED`.
- Número: `+52 1 990 229 2345`, phone number ID `1339518955915625`. Propiedad verificada por SMS (`code_verification_status=VERIFIED`), pero `status=PENDING`.
- Cuenta de facturación vinculada a Lynna Leads: `2112386169378291`. El propietario agregó un método de pago el 9 de octubre de 2026.
- Usuario del sistema: Lynna Leads API, ID `61594877627036`, con acceso a la app y WABA; el token tiene `whatsapp_business_management` y `whatsapp_business_messaging`.
- Webhook `messages` suscrito y verificado: `https://cum.31rooms.com/whatsapp/webhook`.

El endpoint `POST /1339518955915625/register` sigue respondiendo `(#10) Application does not have permission for this action` después de verificar el negocio y agregar el método de pago. `health_status` de WABA indica `can_send_message=BLOCKED`, con `141006` (payment method error) y `141008` (WABA not active, contact support). En WhatsApp Web, al iniciar chat hacia el número, aparece «El número +52 990 229 2345 no está en WhatsApp» y no se puede enviar.

En Business Settings, Danny Cen figura con acceso total al asset Lynna Leads (ID interno de interfaz `2356333361803876`), pero WhatsApp Manager muestra «No tienes acceso a la cuenta de WhatsApp Business 4638362863156897» al abrir el ID API.

¿Pueden verificar la asociación del método de pago con esta WABA, explicar por qué la cuenta sigue inactiva y habilitar el registro del número en Cloud API? También agradecería que revisaran la discrepancia de acceso entre Business Settings y WhatsApp Manager.

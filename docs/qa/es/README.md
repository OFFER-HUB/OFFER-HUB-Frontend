# Guía de QA para testers (Español)

Gracias por ayudarnos a probar OfferHub en **mainnet** de Stellar. Usas tu propia wallet y unos pocos dólares reales de USDC. OfferHub nunca guarda tus fondos: cada pago lo firmas tú en tu wallet.

- Escenarios: [scenarios.md](./scenarios.md)
- App: https://www.offer-hub.org · Resultados públicos: https://www.offer-hub.org/stats
- Versión en inglés: [../README.md](../README.md)

## Qué necesitas

| Qué | Detalle |
|-----|---------|
| Wallet Stellar | [Varial](https://www.freighter.app) (antes Freighter), [Lobstr](https://lobstr.co) o [xBull](https://xbull.app), en **mainnet** |
| Dos wallets | Una hace de comprador y otra de vendedor. Usa dos perfiles del navegador o un segundo dispositivo |
| XLM | Unos **3 XLM** por wallet (reserva base, trustline de USDC y comisiones) |
| USDC | Unos **5 USDC** en la wallet compradora. La vendedora no necesita |
| Trustline de USDC | Cada wallet debe poder recibir USDC (emisor Circle: `GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`). Si lo olvidas, la app te guía; cuéntanos cómo te fue |
| Navegador de escritorio | Chrome, Brave o Firefox con la extensión de la wallet |
| Tiempo | Unos 45 minutos seguidos |
| Cuenta de GitHub | Para publicar tu reporte |

**Límite de dinero.** Pones tu USDC y te quedas con lo que no se gaste: cada orden de prueba es de **1 USDC** y ningún escenario necesita más de **5 USDC** en total. El equipo nunca te pide enviar fondos a nadie. Si una pantalla te pide más, detente y repórtalo.

## Paso a paso de una sesión

1. **Prepárate.** Instala la wallet, ponla en mainnet, fondea XLM y USDC. Abre una ventana nueva del navegador.
2. **Empieza a grabar tu pantalla** (ver "Qué grabar" abajo). No la pares hasta terminar.
3. **Abre tu hilo** en la categoría **QA feedback** de las Discusiones de este repositorio, con la plantilla. Un hilo por sesión. Tu primer mensaje debe incluir **"I agree"** (ver "Consentimiento").
4. **Registrate:** entra a https://www.offer-hub.org → **Register** → **Connect wallet** → elige tu wallet y aprueba. Firma el mensaje de inicio de sesión (es una firma gratis, no un pago). Elige tu rol y termina el onboarding.
5. **Haz los escenarios** que te asignó el equipo, tal como están escritos. Anota la hora y todo lo que te sorprenda, aunque parezca menor.
6. **Cierra:** para la grabación, súbela (Drive, YouTube no listado o Loom) y pega el enlace en tu hilo. Marca cada paso ✅ o ❌ y describe lo que falló o confundió.

## Qué reportar

- Lo que falló, confundió, fue lento (más de 10 segundos sin aviso) o se veía mal.
- Montos o estados incorrectos, o un aviso de la wallet distinto a lo esperado.
- Cualquier cosa relacionada con dinero, aunque se haya resuelto sola.

Lo más útil: escenario y paso, qué esperabas, qué pasó, el id de la orden (aparece en la página de la orden) y la hora.

**Si te atascas**, no pasa nada: sigue grabando, anota dónde y por qué, y repórtalo. Un atasco bien documentado es un resultado valioso. Avisa al coordinador si el bloqueo es de dinero.

## Qué grabar

Graba la **pantalla completa** con los avisos de la wallet visibles, máximo 20 minutos por escenario. Muestra la URL, el id de la orden, cada aviso de la wallet antes de firmar y el estado final con los enlaces de transacciones.

**No muestres:** tu frase semilla o clave secreta (nunca las abras), tu correo, estados de cuenta con número visible (difumínalo) ni documentos de identidad.

Si no quieres publicar el video, dilo en tu hilo: puedes enviar notas escritas y capturas.

## Consentimiento

"Consentimiento" es simplemente tu aceptación por escrito de estas condiciones, para que podamos publicar tu reporte como prueba de que personas independientes probaron el producto. Al participar confirmas que:

1. Usas tu propia wallet y tus propios fondos, y entiendes que se mueve dinero real en Stellar mainnet.
2. OfferHub nunca te pidió tu frase semilla ni tu clave secreta.
3. Aceptas que tu reporte, tu grabación y las transacciones públicas de tu prueba sean publicados por OfferHub (por ejemplo en offer-hub.org y en reportes de la subvención).
4. Puedes aparecer con un apodo. Las direcciones de las transacciones son públicas por naturaleza en la blockchain.
5. Puedes pedir en tu hilo que retiremos tu grabación de las páginas de OfferHub. Las copias ya compartidas por otros y el registro en la blockchain no se pueden borrar.
6. No eres empleado ni contratista del equipo de OfferHub, o lo indicas en tu reporte.

Para aceptar, escribe **"I agree"** en el primer mensaje de tu hilo.

## Seguridad

- Nunca compartas tu frase semilla ni clave secreta. Nadie del equipo ni estos guiones te la piden.
- Antes de firmar, lee el aviso de la wallet: la red debe ser **Public / mainnet** y el monto debe coincidir con la orden.
- Si algo parece una estafa o pide un secreto, detente y repórtalo.

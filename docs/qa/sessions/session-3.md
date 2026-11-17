# QA tester session 3 / Sesión de tester 3

Issue: #555

| | |
|---|---|
| Tester (nickname / apodo) | diegoveme |
| Date / Fecha | 2026-11-17 |
| Environment / Entorno | Microsoft Edge on Windows 11, Stellar mainnet |
| Scenarios / Escenarios | 2. Create and fund an order (partial / parcial), exploratory marketplace tour / recorrido exploratorio del marketplace |

**Consent / Consentimiento:** I agree.

## Recordings / Grabaciones

The two recordings are attached to the pull request that added this report. The tester's wallet address, browser profile picture and taskbar are blurred.
Las dos grabaciones están adjuntas en el pull request que agregó este reporte. Se difuminaron la wallet del tester, su foto de perfil del navegador y la barra de tareas.

1. Hiring a service and creating the order / Contratar un servicio y crear la orden (37 s)
2. Marketplace tour / Recorrido del marketplace (29 s)

## Scenario 2: Create and fund an order / Crear y fondear una orden

Order id: `ord_mwkwlpnzjl2ala93t4s` (`#ala93t4s`) · Service: `svc_mwk5rnj1jucpgwatc`, "Basic Calculator Development in Python" by @Josue19-08 · Amount / Monto: 5 USD

Checked = done and passed, unchecked = not run in this session. / Marcado = hecho y pasó, sin marcar = no se hizo en esta sesión.

- [ ] 1. Seller creates a 1 USDC service / La vendedora crea un servicio de 1 USDC
  - Not run: an existing 5 USD service was used. / No se hizo: se usó un servicio existente de 5 USD.
- [x] 2. Buyer opens the service and places an order / El comprador abre el servicio y hace la orden
  - "Hire This Service" opens the "Hire Specialist" review with the instructions field. "Confirm Order" creates the order and opens the order page in about 2 s: status "Order Created", step 1 of 4.
  - "Hire This Service" abre la revisión "Hire Specialist" con el campo de instrucciones. "Confirm Order" crea la orden y abre su página en unos 2 s: estado "Order Created", paso 1 de 4.
- [ ] 3. Start the escrow / Iniciar el escrow
  - "Lock Funds in Escrow" is clicked at the end of the recording; the wallet prompt is outside it. / Se da clic en "Lock Funds in Escrow" al final de la grabación; la firma de la wallet queda fuera.
- [ ] 4. Fund 1 USDC / Fondear 1 USDC
- [ ] 5. Escrow funded and Stellar Expert link on mainnet / Escrow fondeado y enlace de Stellar Expert en mainnet
- [ ] 6. Close the wallet at step 3 and resume / Cerrar la wallet en el paso 3 y retomar

## Exploratory / Exploratorio

- [x] Home page loads / La página de inicio carga
- [x] "Get Started" with an empty email: the browser asks to fill in the field / "Get Started" con el correo vacío: el navegador pide llenar el campo
- [x] Marketplace → Explore Client Project Offers, scroll and "Load more"
- [x] Marketplace → Discover Professional Services, scroll and "Load more"

## Observations / Observaciones

- On the order page the sidebar shows the **Freelancer** mode selected while the order card asks the buyer for a **client action** ("Lock Funds in Escrow"). It can be confusing for a buyer. / En la página de la orden la barra lateral muestra el modo **Freelancer** seleccionado mientras la tarjeta le pide al comprador una **acción de cliente** ("Lock Funds in Escrow"). Puede confundir al comprador.

No transactions were made in this session, so there is nothing to verify on Stellar Expert yet. / En esta sesión no hubo transacciones, así que todavía no hay nada que verificar en Stellar Expert.

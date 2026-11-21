# QA tester session 3 / Sesión de tester 3

Issue: #555

| | |
|---|---|
| Tester (nickname / apodo) | diegoveme |
| Dates / Fechas | 2026-11-17, 2026-11-18 |
| Environment / Entorno | Microsoft Edge on Windows 11, Stellar mainnet |
| Scenarios / Escenarios | 3. Deliver and release, 6. BlindPay payout (Mexico, SPEI), plus applying to an offer and placing an order / además de aplicar a una oferta y crear una orden |

**Consent / Consentimiento:** I agree.

## Recordings / Grabaciones

The recordings are attached to the pull request that added this report. The tester's wallet address, name, browser profile picture and taskbar, and the client's email, are blurred.
Las grabaciones están adjuntas en el pull request que agregó este reporte. Se difuminaron la wallet, el nombre, la foto de perfil del navegador y la barra de tareas del tester, y el correo del cliente.

1. Deliver the work on-chain, order `#99inidgy` / Entregar el trabajo on-chain, orden `#99inidgy`
2. From the offer to a payout in MXN, order `#fu08z5ih` / De la oferta al pago en pesos, orden `#fu08z5ih`
3. Hiring a service and creating an order (Nov 17) / Contratar un servicio y crear una orden (17 nov)
4. Marketplace tour (Nov 17) / Recorrido del marketplace (17 nov)

Checked = done and passed, unchecked = not run in this session. / Marcado = hecho y pasó, sin marcar = no se hizo en esta sesión.

## Scenario 3: Deliver and release / Entregar y liberar

Orders / Órdenes: `#99inidgy` (5 USD) and / y `#fu08z5ih` (12 USD), both with @Josue19-08 as the client / ambas con @Josue19-08 como cliente.

- [x] 1. As the seller, mark the work as delivered and sign the wallet prompt / Como vendedor, marcar el trabajo como entregado y firmar en la wallet
  - Order `#99inidgy`: the final deliverable is uploaded, the wallet asks for one signature on mainnet, the app shows "On-Chain Action Confirmed" and the transaction opens on Stellar Expert (`change_milestone_status` → `completed`). The order shows "Delivered" and "Waiting for Client Review".
  - Orden `#99inidgy`: se sube el entregable final, la wallet pide una firma en mainnet, la app muestra "On-Chain Action Confirmed" y la transacción abre en Stellar Expert (`change_milestone_status` → `completed`). La orden queda en "Delivered" y "Waiting for Client Review".
- [x] 2. The buyer approves the delivery and releases the funds / El comprador aprueba la entrega y libera los fondos
  - Order `#fu08z5ih` moves from "Waiting for Client Review" to "Order Completed", step 4 of 4. / La orden `#fu08z5ih` pasa de "Waiting for Client Review" a "Order Completed", paso 4 de 4.
- [x] 3. The order moves to released and, with payouts set up, the payout starts (scenario 6) / La orden queda liberada y, con payouts configurados, empieza el payout (escenario 6)
- [ ] 4. Try to release twice / Intentar liberar dos veces (buyer-side action, not run / acción del comprador, no se hizo)

## Scenario 6: BlindPay payout to a bank account (Mexico, SPEI) / Payout de BlindPay a una cuenta bancaria (México, SPEI)

Order / Orden: `#fu08z5ih`, 12 USD.

- [x] 1. KYC, BlindPay terms and bank account set up on the seller profile (before the recording) / KYC, términos de BlindPay y cuenta bancaria configurados en el perfil del vendedor (antes de grabar)
- [x] 2. After the release, the order shows "Payout status: Mexico, SPEI" and asks to sign one USDC transfer to BlindPay from the seller wallet; signed / Tras la liberación, la orden muestra "Payout status: Mexico, SPEI" y pide firmar una transferencia de USDC a BlindPay desde la wallet del vendedor; firmada
- [x] 3. "Transaction confirmed, On-Chain Action Confirmed: transfer sent, BlindPay is now processing your payout", and the tracker goes Pending → Processing → Completed / "Transaction confirmed, On-Chain Action Confirmed", y el seguimiento pasa por Pending → Processing → Completed
- [x] 4. The app reports "MX$216.00 deposited to your bank account" / La app reporta "MX$216.00 deposited to your bank account"
- [x] 5. Amount: 12 USDC paid out as MX$216.00 (18.00 MXN per USDC) / Monto: 12 USDC pagados como MX$216.00 (18.00 MXN por USDC)

## Applying to an offer / Aplicar a una oferta

- [x] As a freelancer, open the client offer "Python To-Do List – Simple Task Management Program" (12 USD), write a cover letter and submit; the offer shows "Proposal Submitted" / Como freelancer, abrir la oferta del cliente (12 USD), escribir la carta y enviar; la oferta muestra "Proposal Submitted"

## Scenario 2, Nov 17 / Escenario 2, 17 nov

Order / Orden: `ord_mwkwlpnzjl2ala93t4s` (5 USD)

- [x] 2. The buyer opens the service and places an order: "Confirm Order" creates the order and opens the order page in about 2 s, status "Order Created" / El comprador abre el servicio y hace la orden: "Confirm Order" crea la orden y abre su página en unos 2 s, estado "Order Created"
- [x] Marketplace: home page, Explore Client Project Offers and Discover Professional Services load, scroll and "Load more" / La página de inicio, Explore Client Project Offers y Discover Professional Services cargan, hacen scroll y "Load more"

## On-chain evidence / Evidencia on-chain

Escrow contracts on Stellar mainnet, verified on Stellar Expert / Contratos de escrow en Stellar mainnet, verificados en Stellar Expert:

- Order / Orden `#99inidgy`: [CAJS7X5R…HAL4EJC](https://stellar.expert/explorer/public/contract/CAJS7X5R53X42TY2FQ4CYQMWEVBTXVI3SLTY3TOEKZ5VV5EX7HAL4EJC)
- Order / Orden `#fu08z5ih`: [CD7FS2W3…ZXOW2J](https://stellar.expert/explorer/public/contract/CD7FS2W3P3GXV3GEJ6DOTYMOEUMHY3NCVBVYMBKHPVUMCNUIBOZXOW2J)

## Notes / Notas

Some wallet signatures and the first payout attempt needed a retry before succeeding; they were reported to the team. / Algunas firmas de la wallet y el primer intento de payout necesitaron reintento antes de funcionar; ya se reportaron al equipo.

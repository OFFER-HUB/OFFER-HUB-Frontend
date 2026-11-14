# Escenarios de QA (Español)

Cada escenario lista sus pasos y lo que deberías ver. Marca cada paso ✅ o ❌ en tu reporte. Usa **1 USDC** en cada orden. Los escenarios 2 a 4 se encadenan con las mismas dos wallets; el 5 es la alternativa al 4. Versión en inglés: [../scenarios.md](../scenarios.md).

Roles: **Comprador** (cliente) y **Vendedor** (freelancer), cada uno con su wallet. El vendedor crea un servicio y el comprador lo pide.

## 1. Conectar wallet e iniciar sesión

**Objetivo:** un usuario nuevo puede registrarse e iniciar sesión solo con su wallet.

1. En un perfil limpio del navegador, abre la app y elige **Register → Connect wallet**.
2. Elige tu wallet y aprueba la conexión. **Esperado:** la wallet pide conectar y luego firmar un mensaje.
3. Firma el mensaje. **Esperado:** quedas dentro y el perfil muestra tu dirección.
4. Cierra sesión y entra otra vez con **Connect wallet**. **Esperado:** misma cuenta, sin segundo registro.
5. Rechaza la firma una vez a propósito. **Esperado:** mensaje claro y sin sesión.
6. Cambia la wallet a testnet e intenta entrar. **Esperado:** la app rechaza o avisa que la red es incorrecta.

## 2. Crear y fondear una orden (escrow)

**Objetivo:** el comprador bloquea 1 USDC en un escrow.

1. Como vendedor, crea un servicio de 1 USDC.
2. Como comprador, abre el servicio y haz un pedido.
3. En la página de la orden, inicia el escrow. **Esperado:** la wallet muestra una transacción para desplegar el escrow; fírmala.
4. Luego fondéalo. **Esperado:** un segundo aviso que mueve **1 USDC** de tu wallet; el monto coincide con la orden.
5. **Esperado:** la orden muestra el escrow fondeado, el enlace de Stellar Expert abre la transacción real en **mainnet** y el USDC del comprador bajó 1.
6. Cierra la ventana de la wallet en el paso 3 sin firmar y vuelve a intentar. **Esperado:** puedes retomar sin quedar bloqueado.

## 3. Entregar y liberar

**Objetivo:** el vendedor cobra cuando el comprador acepta el trabajo.

1. Como vendedor, abre la orden y marca el trabajo como entregado. **Esperado:** aviso de la wallet; fírmalo.
2. Como comprador, aprueba la entrega y libera los fondos. **Esperado:** dos avisos, uno por acción.
3. **Esperado:** la orden pasa a liberada y la wallet del vendedor muestra el USDC (o, si hay payouts configurados, inicia el pago, ver escenario 6).
4. Intenta liberar dos veces. **Esperado:** el segundo intento es rechazado.

## 4. Reembolso por disputa

**Objetivo:** el comprador recupera el dinero cuando no se entrega el trabajo.

1. Crea y fondea una nueva orden de 1 USDC (escenario 2).
2. Como comprador, abre una disputa y firma el aviso. **Esperado:** la orden aparece en disputa.
3. El equipo resuelve la disputa desde el panel de administración (dile al coordinador el id de la orden). **Esperado:** la orden muestra la resolución y el USDC vuelve a la wallet del comprador.
4. **Esperado:** los enlaces de transacciones abren y coinciden con lo que viste.

## 5. Disputa resuelta con reparto

**Objetivo:** ambas partes reciben una parte de los fondos.

1. Crea y fondea una nueva orden de 1 USDC.
2. El vendedor entrega; el comprador abre una disputa en vez de aprobar.
3. El equipo la resuelve con un reparto (el coordinador te dice los porcentajes). **Esperado:** cada wallet recibe su parte y los montos suman 1 USDC.

## 6. Pago a cuenta bancaria con BlindPay

**Objetivo:** el vendedor recibe moneda local en una cuenta bancaria.

Solo para testers en **Brasil, México, Argentina o Colombia** con cuenta bancaria propia. Los demás pueden observar un pago hecho por el equipo y reportar lo que ven. El vendedor necesita KYC aprobado y una cuenta bancaria agregada antes de liberar la orden.

1. Como vendedor, abre el perfil, completa el KYC, acepta los términos de BlindPay y agrega tu cuenta bancaria.
2. Haz el escenario 3 hasta la liberación. **Esperado:** en vez de llegar USDC a la wallet, la orden muestra un pago y te pide firmar una transferencia a BlindPay desde tu wallet; fírmala.
3. **Esperado:** el pago pasa de procesando a completado, con el monto y la moneda local.
4. **Esperado:** el dinero llega a tu cuenta bancaria (de minutos a un día según el riel). Reporta cuánto tardó.
5. Reporta el monto recibido frente al monto mostrado al cotizar.

Usa el monto mínimo del corredor; nunca más de **10 USDC**. Si lo rechaza, reporta el mensaje.

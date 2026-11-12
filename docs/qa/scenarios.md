# QA Scenarios

Each scenario lists its steps and what you should see. Mark each step ✅ or ❌ in your report. Use **1 USDC** for every order. Scenarios 2 to 4 build on each other with the same two wallets; scenario 5 is the alternative to 4.

Roles: **Buyer** (client) and **Seller** (freelancer), each with its own wallet. The seller creates a service, the buyer orders it.

## 1. Wallet connect and wallet login

**Goal:** a new user can register and sign in with only a wallet.

1. In a clean browser profile, open the app and choose **Register → Connect wallet**.
2. Pick your wallet and approve the connection. **Expect:** the wallet asks to connect, then to sign a message.
3. Sign the message. **Expect:** you are signed in and the profile shows your wallet address.
4. Sign out, then sign in again with **Connect wallet**. **Expect:** same account, no second registration.
5. Reject the signature once on purpose. **Expect:** a clear message and no session.
6. Switch the wallet to testnet and try to sign in. **Expect:** the app refuses or warns that the network is wrong.

## 2. Create and fund an order (escrow create)

**Goal:** the buyer locks 1 USDC in an escrow.

1. As the seller, create a service priced at 1 USDC.
2. As the buyer, open the service and place an order.
3. On the order page, start the escrow. **Expect:** the wallet shows a transaction to deploy the escrow; sign it.
4. Then fund it. **Expect:** a second prompt that moves **1 USDC** from your wallet; the amount matches the order.
5. **Expect:** the order shows the escrow as funded, a Stellar Expert link opens the real transaction on **mainnet**, and the buyer's USDC dropped by 1.
6. Close the wallet window at step 3 without signing, then try again. **Expect:** you can resume without being blocked.

## 3. Deliver and release

**Goal:** the seller is paid after the buyer accepts the work.

1. As the seller, open the order and mark the work as delivered. **Expect:** a wallet prompt; sign it.
2. As the buyer, approve the delivery, then release the funds. **Expect:** two wallet prompts, one per action.
3. **Expect:** the order moves to released, and the seller's wallet shows the USDC (or, if payouts are set up, the payout starts, see scenario 5).
4. Try to release twice. **Expect:** the second attempt is refused.

## 4. Refund through a dispute

**Goal:** the buyer gets the money back when the work is not delivered.

1. Create and fund a new 1 USDC order (scenario 2).
2. As the buyer, open a dispute on the order and sign the wallet prompt. **Expect:** the order shows as disputed.
3. The team resolves the dispute from the admin panel (tell the coordinator the order id). **Expect:** the order shows the resolution and the USDC returns to the buyer's wallet.
4. **Expect:** the transaction links on the order page open and match what you saw.

## 5. Dispute resolved with a split

**Goal:** both sides receive part of the funds.

1. Create and fund a new 1 USDC order.
2. The seller delivers; the buyer opens a dispute instead of approving.
3. The team resolves it with a split (the coordinator tells you the percentages). **Expect:** each wallet receives its share, and the amounts add up to 1 USDC.

## 6. BlindPay payout to a bank account

**Goal:** the seller receives local currency in a bank account.

Only for testers in **Brazil, Mexico, Argentina or Colombia** with their own bank account. Others can watch a team-run payout and report on what they see. The seller needs KYC approved and a bank account added before the order is released.

1. As the seller, open the profile and complete KYC, accept the BlindPay terms, and add your bank account.
2. Run scenario 3 up to the release. **Expect:** instead of USDC arriving in the wallet, the order shows a payout and asks you to sign one transfer to BlindPay from your own wallet; sign it.
3. **Expect:** the payout moves from processing to completed, with the fiat amount and currency shown.
4. **Expect:** the money arrives in your bank account (it can take minutes to a day depending on the rail). Report the time it took.
5. Report the amount you received against the amount shown at quote time.

Use the smallest amount the corridor allows; never more than **10 USDC**. If it is rejected, report the message.

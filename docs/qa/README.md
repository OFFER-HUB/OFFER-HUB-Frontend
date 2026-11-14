# OfferHub QA Guide for Testers

Thank you for helping test OfferHub on Stellar **mainnet**. You use your own wallet and a few dollars of real USDC. OfferHub never holds your funds: every payment is signed in your wallet.

- Guía en español: [es/README.md](./es/README.md)
- Scenarios to run: [scenarios.md](./scenarios.md)
- Recording and consent: [recording-and-consent.md](./recording-and-consent.md)
- App: https://www.offer-hub.org · Public results: https://www.offer-hub.org/stats

## Before you start

You need:

| Item | Details |
|------|---------|
| A Stellar wallet | [Freighter](https://www.freighter.app), [Lobstr](https://lobstr.co) or [xBull](https://xbull.app), set to **mainnet** |
| Two wallets for most scenarios | One plays the buyer, one the seller. Two browser profiles, or a wallet plus a second device |
| XLM | About **3 XLM** per wallet: the 1 XLM base reserve, 0.5 XLM for the USDC trustline, and fees |
| USDC | About **5 USDC** on the buyer wallet. The seller wallet needs none |
| USDC trustline | Each wallet must be able to hold USDC. In Freighter or Lobstr: add the asset USDC issued by Circle (`GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN`). If you forget, the app notices on mainnet and walks you through adding it with your wallet: that is a step worth reporting on, too |
| A desktop browser | Chrome, Brave or Firefox, with the wallet extension installed |

**Money limits.** You bring your own USDC and keep what is not spent: a scenario order is **1 USDC**, and nothing in these scripts needs more than **5 USDC** in total. The team never asks you to send funds to anyone. If any screen asks for more than that, stop and report it.

## Register and connect your wallet

1. Open https://www.offer-hub.org and choose **Register**.
2. Choose **Connect wallet**, pick your wallet, and approve the connection.
3. Sign the login message when the wallet asks. This is a free signature, not a payment.
4. Pick a role (client or freelancer) and finish onboarding.

Email and password also work; the wallet scenarios below use the wallet.

## Run a session

1. Read the scenarios and pick the ones assigned to you (the team will tell you which).
2. Do each step exactly as written. Note the time and anything that surprised you, even if it felt minor.
3. Record your screen (see [recording-and-consent.md](./recording-and-consent.md)).
4. Post your results in the **QA feedback** category of this repository's Discussions, using the template. One thread per session.

## What to report

- Anything that failed, was confusing, was slow (over 10 seconds with no feedback), or looked wrong.
- Wrong amounts, wrong status, or a wallet prompt that did not match what you expected to sign.
- Money-related behaviour: report it even if it resolved by itself.

A report is most useful with: the scenario and step, what you expected, what happened, the order id (shown on the order page), and the time.

## Safety

- Never share your seed phrase or secret key. OfferHub, the team and these scripts never ask for it.
- Before signing, read the wallet prompt: network must be **Public / mainnet**, the amount must match the order.
- If something looks like a scam or asks for a secret, stop and report it.

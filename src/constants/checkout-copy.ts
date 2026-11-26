export const CHECKOUT_COPY = {
  title: "Lock the payment",
  retryTitle: "Finish locking the payment",
  retryBody: "The contract was created, but the payment wasn't locked yet.",
  protection: (name: string) =>
    `Funds go into a contract on Stellar. ${name} gets paid only when you approve or the review window ends.`,
  paySubtext: "You'll confirm 2 steps in your wallet.",
  ready: "Your wallet is ready.",
  issues: {
    WALLET_NOT_CONNECTED: "Connect your wallet to pay.",
    WRONG_WALLET: "Connect {address} — the wallet linked to your account.",
    ACCOUNT_NOT_ACTIVATED: "Your wallet needs at least 1 XLM to be activated on Stellar.",
    NO_USDC_TRUSTLINE: "Enable USDC in your wallet to pay.",
    INSUFFICIENT_USDC: "You need {amount} USDC. Your wallet has {balance} USDC.",
    CUSTODIAL_WALLET: "Claim your wallet before paying.",
  },
  fixes: {
    WALLET_NOT_CONNECTED: "Connect wallet",
    WRONG_WALLET: "Switch wallet",
    ACCOUNT_NOT_ACTIVATED: "How to add XLM",
    NO_USDC_TRUSTLINE: "Enable USDC",
    INSUFFICIENT_USDC: "Add USDC",
    CUSTODIAL_WALLET: "Claim wallet",
  },
} as const;

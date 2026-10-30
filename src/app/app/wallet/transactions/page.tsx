"use client";

import { WalletTransactionsContent } from "@/components/wallet/WalletTransactionsContent";
import { useWalletTransactions } from "@/hooks/useWalletTransactions";
import { useAuthStore } from "@/stores/auth-store";

export default function WalletTransactionsPage(): React.JSX.Element {
  const token = useAuthStore((state) => state.token);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const transactions = useWalletTransactions(token);

  return (
    <WalletTransactionsContent
      token={token}
      hasHydrated={hasHydrated}
      transactions={transactions}
    />
  );
}

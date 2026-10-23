import {
  Account,
  Asset,
  Keypair,
  Networks,
  Operation,
  StrKey,
  TransactionBuilder,
} from "@stellar/stellar-sdk";

export const TESTNET_NETWORK_PASSPHRASE = Networks.TESTNET;

export interface EscrowSigningRequest {
  sourceAccount: string;
  contractId: string;
  amount: string;
  assetCode?: string;
  assetIssuer?: string;
  fee?: number;
  timeout?: number;
  networkPassphrase?: string;
}

export interface EscrowSigningPayload {
  xdr: string;
  networkPassphrase: string;
  contractId: string;
  sourceAccount: string;
}

export function getSupportedWallets(): string[] {
  return ["freighter", "lobstr", "xbull"];
}

export function createEscrowSigningPayload({
  sourceAccount,
  contractId,
  amount,
  assetCode,
  assetIssuer,
  fee = 100,
  timeout = 180,
  networkPassphrase = TESTNET_NETWORK_PASSPHRASE,
}: EscrowSigningRequest): EscrowSigningPayload {
  const normalizedSourceAccount = StrKey.isValidEd25519PublicKey(sourceAccount)
    ? sourceAccount
    : Keypair.random().publicKey();
  const normalizedContractId = StrKey.isValidEd25519PublicKey(contractId)
    ? contractId
    : Keypair.random().publicKey();
  const asset = assetCode && assetIssuer ? new Asset(assetCode, assetIssuer) : Asset.native();

  const sourceAccountObject = new Account(normalizedSourceAccount, "0");

  const tx = new TransactionBuilder(sourceAccountObject, {
    fee: String(fee),
    networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: normalizedContractId,
        amount,
        asset,
      })
    )
    .setTimeout(timeout)
    .build();

  return {
    xdr: tx.toXDR(),
    networkPassphrase,
    contractId: normalizedContractId,
    sourceAccount: normalizedSourceAccount,
  };
}

export function createEscrowTestTransaction(input: EscrowSigningRequest): string {
  return createEscrowSigningPayload(input).xdr;
}

export function formatWalletAddress(address: string): string {
  if (!address) {
    return "";
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

"use server";

import { EnokiClient } from "@mysten/enoki";

const enokiClient = new EnokiClient({
  apiKey: process.env.ENOKI_SECRET_KEY!,
});

const SUI_NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet") as "testnet" | "mainnet";

interface SponsorTransactionInput {
  transactionKindBytes: string;
  sender: string;
}

interface SponsorTransactionResult {
  bytes: string;
  digest: string;
}

export async function sponsorTransaction(
  input: SponsorTransactionInput
): Promise<SponsorTransactionResult> {
  try {
    const result = await enokiClient.createSponsoredTransaction({
      network: SUI_NETWORK,
      transactionKindBytes: input.transactionKindBytes,
      sender: input.sender,
    });

    return {
      bytes: result.bytes,
      digest: result.digest,
    };
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

interface ExecuteSponsoredInput {
  digest: string;
  signature: string;
}

interface ExecuteSponsoredResult {
  digest: string;
}

export async function executeSponsoredTransaction(
  input: ExecuteSponsoredInput
): Promise<ExecuteSponsoredResult> {
  try {
    const result = await enokiClient.executeSponsoredTransaction({
      digest: input.digest,
      signature: input.signature,
    });

    return {
      digest: result.digest,
    };
  } catch (error: unknown) {
    throw new Error(error instanceof Error ? error.message : String(error));
  }
}

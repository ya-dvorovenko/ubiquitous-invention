"use client";

import { Transaction } from "@mysten/sui/transactions";
import { useCurrentAccount, useSignTransaction, useSuiClient } from "@mysten/dapp-kit";
import { toBase64, fromBase64 } from "@mysten/sui/utils";
import { useState, useCallback } from "react";
import { sponsorTransaction, executeSponsoredTransaction } from "@/app/actions/sponsor";

export function useSponsoredTransaction() {
  const suiClient = useSuiClient();
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();
  const [isPending, setIsPending] = useState(false);

  const sponsorAndExecute = useCallback(async (tx: Transaction) => {
    if (!currentAccount) throw new Error("No wallet connected");

    setIsPending(true);
    try {
      // 1. Build transaction kind bytes (without gas info)
      tx.setSender(currentAccount.address);
      const txBytes = await tx.build({ client: suiClient, onlyTransactionKind: true });

      // 2. Sponsor transaction via server action (uses secret key)
      const sponsored = await sponsorTransaction({
        transactionKindBytes: toBase64(txBytes),
        sender: currentAccount.address,
      });

      // 3. Sign sponsored transaction with user's wallet
      const { signature } = await signTransaction({
        transaction: Transaction.from(fromBase64(sponsored.bytes)),
      });

      // 4. Execute sponsored transaction via server action
      const result = await executeSponsoredTransaction({
        digest: sponsored.digest,
        signature,
      });

      // 5. Wait for confirmation
      await suiClient.waitForTransaction({ digest: result.digest });

      return result;
    } finally {
      setIsPending(false);
    }
  }, [currentAccount, suiClient, signTransaction]);

  return { sponsorAndExecute, isPending };
}

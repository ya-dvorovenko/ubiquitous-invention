"use client";

import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { useQueryClient } from "@tanstack/react-query";
import { TARGETS, CLOCK_ID, PUBLISHER_ID } from "@/config/constants";

interface RegisterCreatorParams {
  name: string;
  bio: string;
  price: number; // subscription price in MIST
}

export function useRegisterCreator() {
  const suiClient = useSuiClient();
  const queryClient = useQueryClient();
  const { mutateAsync: signAndExecute, isPending } =
    useSignAndExecuteTransaction();

  const register = async ({ name, bio, price }: RegisterCreatorParams) => {
    const tx = new Transaction();

    tx.moveCall({
      target: TARGETS.register,
      arguments: [
        tx.object(PUBLISHER_ID),
        tx.pure.string(name),
        tx.pure.string(bio),
        tx.pure.u64(price),
        tx.object(CLOCK_ID),
      ],
    });

    const result = await signAndExecute({
      transaction: tx,
    });

    await suiClient.waitForTransaction({
      digest: result.digest,
    });

    // Invalidate creators cache
    queryClient.invalidateQueries({ queryKey: ["creators"] });

    return result;
  };

  return {
    register,
    isPending,
  };
}

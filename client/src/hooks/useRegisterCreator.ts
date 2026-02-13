"use client";

import { useSignAndExecuteTransaction } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { TARGETS, PUBLISHER_ID, CLOCK_ID } from "@/config/constants";

interface RegisterParams {
  name: string;
  bio: string;
  price: number;
}

export function useRegisterCreator() {
  const { mutateAsync, isPending } = useSignAndExecuteTransaction();

  const register = async ({ name, bio, price }: RegisterParams) => {
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

    return mutateAsync({ transaction: tx });
  };

  return { register, isPending };
}

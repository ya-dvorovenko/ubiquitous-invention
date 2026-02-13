"use client";

import { useCurrentAccount } from "@mysten/dapp-kit";
import { useCreators } from "./useCreators";

export function useIsCreator() {
  const currentAccount = useCurrentAccount();
  const { data: creators, isLoading } = useCreators();

  const creatorProfile = creators?.find(
    (c) => c.address === currentAccount?.address
  );

  return {
    isCreator: !!creatorProfile,
    creatorProfile,
    isLoading,
  };
}

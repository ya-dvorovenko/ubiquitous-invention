"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { SuinsClient } from "@mysten/suins";
import { useCallback, useMemo } from "react";

export function useSuiNS() {
  const suiClient = useSuiClient();

  const suinsClient = useMemo(() => {
    return new SuinsClient({
      client: suiClient,
      network: "testnet",
    });
  }, [suiClient]);

  const resolveNameToAddress = useCallback(
    async (name: string): Promise<string | null> => {
      try {
        const fullName = name.endsWith(".sui") ? name : `${name}.sui`;
        const result = await suinsClient.getNameRecord(fullName);
        return result?.targetAddress ?? null;
      } catch {
        return null;
      }
    },
    [suinsClient]
  );

  return {
    resolveNameToAddress,
  };
}

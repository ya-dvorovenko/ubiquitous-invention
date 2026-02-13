"use client";

import { useSuiClient } from "@mysten/dapp-kit";
import { SuinsClient } from "@mysten/suins";
import { useCallback, useEffect, useMemo, useState } from "react";

const SUINS_PACKAGE_ID = process.env.NEXT_PUBLIC_SUINS_PACKAGE_ID || "0x22fa05f21b1ad71442491220bb9338f7b7095fe35000ef88d5400d28523bdd93";
const SUINS_TYPE = `${SUINS_PACKAGE_ID}::suins_registration::SuinsRegistration`;
const SUI_NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet") as "testnet" | "mainnet";

export function useSuiNS() {
  const suiClient = useSuiClient();

  const suinsClient = useMemo(() => {
    return new SuinsClient({
      client: suiClient,
      network: SUI_NETWORK,
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

  const resolveAddressToName = useCallback(
    async (address: string): Promise<string | null> => {
      try {
        const objects = await suiClient.getOwnedObjects({
          owner: address,
          filter: { StructType: SUINS_TYPE },
          options: { showContent: true },
        });

        if (objects.data.length === 0) return null;

        const content = objects.data[0]?.data?.content;
        if (content?.dataType === "moveObject") {
          const fields = content.fields as { domain_name?: string };
          return fields.domain_name ?? null;
        }
        return null;
      } catch {
        return null;
      }
    },
    [suiClient]
  );

  return {
    resolveNameToAddress,
    resolveAddressToName,
  };
}

export function useSuiNSName(address: string | undefined) {
  const [name, setName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { resolveAddressToName } = useSuiNS();

  useEffect(() => {
    if (!address) {
      setName(null);
      return;
    }

    setIsLoading(true);
    resolveAddressToName(address)
      .then(setName)
      .finally(() => setIsLoading(false));
  }, [address, resolveAddressToName]);

  return { name, isLoading };
}

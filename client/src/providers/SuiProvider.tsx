"use client";

import { SuiClientProvider, WalletProvider, useSuiClient } from "@mysten/dapp-kit";
import { ClientWithCoreApi } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import { registerEnokiWallets } from "@mysten/enoki";

import "@mysten/dapp-kit/dist/index.css";

const networks = {
  testnet: { url: "https://fullnode.testnet.sui.io:443", network: "testnet" as const },
};

function RegisterEnokiWalletsComponent() {
  const client = useSuiClient() as ClientWithCoreApi;

  useEffect(() => {
    const enokiApiKey = process.env.NEXT_PUBLIC_ENOKI_API_KEY;
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!enokiApiKey || !googleClientId) {
      console.warn("Enoki API Key or Google Client ID not configured");
      return;
    }

    const { unregister } = registerEnokiWallets({
      apiKey: enokiApiKey,
      client,
      network: "testnet",
      providers: {
        google: {
          clientId: googleClientId,
        },
      },
    });

    return () => {
      unregister();
    };
  }, [client]);

  return null;
}

interface SuiProviderProps {
  children: ReactNode;
}

export function SuiProvider({ children }: SuiProviderProps) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networks} defaultNetwork="testnet">
        <WalletProvider autoConnect preferredWallets={["Sign in with Google"]}>
          <RegisterEnokiWalletsComponent />
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

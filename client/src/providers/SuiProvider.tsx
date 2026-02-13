"use client";

import {
  SuiClientProvider,
  WalletProvider,
  useSuiClient,
} from "@mysten/dapp-kit";
import { ClientWithCoreApi } from "@mysten/sui/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState, useEffect } from "react";
import { registerEnokiWallets } from "@mysten/enoki";
import { ToastProvider } from "@/components/ui/Toast";

import "@mysten/dapp-kit/dist/index.css";

const SUI_NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet") as
  | "testnet"
  | "mainnet"
  | "devnet";
const SUI_RPC_URL =
  process.env.NEXT_PUBLIC_SUI_RPC_URL || "https://fullnode.testnet.sui.io:443";

const networks = {
  [SUI_NETWORK]: { url: SUI_RPC_URL, network: SUI_NETWORK },
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
      network: SUI_NETWORK,
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
      <SuiClientProvider networks={networks} defaultNetwork={SUI_NETWORK}>
        <WalletProvider autoConnect preferredWallets={["Sign in with Google"]}>
          <RegisterEnokiWalletsComponent />
          <ToastProvider>{children}</ToastProvider>
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}

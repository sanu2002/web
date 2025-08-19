"use client";

import Navbar from "./ui/header/navbar";
import { publicSans } from "./ui/fonts";
import "./globals.css";
import { Web3Providers } from "./web3-providers";
import { NetworkProvider } from "./context/network-context";
import StoreProvider from "./store-provider";
import { DarkModeProvider } from "./ui/header/use-dark-mode";
import { getRainbowMagicWallet } from "./lib/magic-link";
import { chains } from "./lib/constants";
import type { Chain } from "viem";
import {
  RainbowKitProvider,
  connectorsForWallets,
  darkTheme,
  lightTheme,
} from "@rainbow-me/rainbowkit";
import { createConfig, http, WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const magicWallet = getRainbowMagicWallet({
  chains,
  apiKey: process.env.NEXT_PUBLIC_MAGIC_API_KEY || "",
});

let connectors;

try {
  const walletOptions = {
    appName: "Vanna Protocol",
    projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_V2_PROJECT_ID || "",
    appDescription: "Vanna Protocol Web App",
  };

  connectors = connectorsForWallets(
    [
      {
        groupName: "Recommended",
        wallets: [
          magicWallet,
        ],
      },
    ],
    walletOptions
  );
} catch (error) {
  console.log("Error getting connectors");
  console.error(error);
}

const config = createConfig({
  connectors,
  chains: chains as readonly [Chain, ...Chain[]],
  transports: {
    [11155111]: http(),
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${publicSans.className} antialiased dark:bg-baseDark`}>
        <StoreProvider>
          <NetworkProvider>
            <Web3Providers>
              <DarkModeProvider>
                <WagmiProvider config={config}>
                  <QueryClientProvider client={queryClient}>
                    <RainbowKitProvider
                      theme={{
                        lightMode: lightTheme({
                          accentColor: '#f5aba1',
                          borderRadius: 'medium',
                        }),
                        darkMode: darkTheme({
                          accentColor: '#703ae6',
                          borderRadius: 'medium',
                        }),
                      }}
                      locale="en-US"
                    >
                      <Navbar />
                      {children}
                    </RainbowKitProvider>
                  </QueryClientProvider>
                </WagmiProvider>
              </DarkModeProvider>
            </Web3Providers>
          </NetworkProvider>
        </StoreProvider>
      </body>
    </html>
  );
}

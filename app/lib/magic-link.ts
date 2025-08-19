import { dedicatedWalletConnector } from "@magiclabs/wagmi-connector";
import { createConnector as createWagmiConnector } from "wagmi";
import type { Chain } from "viem";

export const getRainbowMagicWallet = (options: {
  chains: readonly Chain[];
  apiKey: string;
}) => {
  return () => rainbowMagicWallet(options);
};

export const rainbowMagicWallet = ({
  chains,
  apiKey,
}: {
  chains: readonly Chain[];
  apiKey: string;
}) => ({
  id: "magic",
  name: "Magic",
  rdns: "Magic",
  iconUrl: "/magicLink.jpg",
  iconBackground: "/magicLink.jpg",
  installed: true,
  downloadUrls: {},
  createConnector: (walletDetails: any) =>
    createWagmiConnector((config) => ({
      ...dedicatedWalletConnector({
        chains: chains,
        options: {
          apiKey,
          accentColor: "#703ae6",
          isDarkMode: false,
          customLogo: "/magicLink.jpg",
          // Allow Magic Link email login (hosted UI) and hide SMS if undesired
          enableEmailLogin: true,
          enableSMSLogin: false,

          // Show social providers in Magic's hosted modal (Magic handles the redirect)
          oauthOptions: {
            providers: ["google"],
            // Optional: set in Vite env and add to Magic dashboard allowed redirects
            // callbackUrl: import.meta.env.VITE_MAGIC_OAUTH_CALLBACK_URL,
          },

          // Make Magic network configuration more flexible
          magicSdkConfiguration: {
            network: {
              rpcUrl:
                process.env.NEXT_PUBLIC_RPC_URL || "https://mainnet.base.org/",
              chainId: 8453, // Default to Base mainnet
            },
          },
        },
      })(config),
      ...walletDetails,
    })),
});

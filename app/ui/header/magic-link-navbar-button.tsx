"use client";

import { SunDim } from "@phosphor-icons/react";
import NetworkDropdown from "./network-dropdown";
import { useDarkMode } from "./use-dark-mode";
import { useNetwork } from "@/app/context/network-context";
import { useBalance, useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCallback, useEffect, useState } from "react";
import { formatBignumberToUnits, sleep } from "@/app/lib/helper";
import Notification from "../components/notification";
import { MetaMaskInpageProvider } from "@metamask/providers";
import { ethers } from "ethers";
import { allowedChainIds, opAddressList } from "@/app/lib/web3-constants";
import Faucet from "../../abi/vanna/v1/out/Faucet.sol/Faucet.json";
import Loader from "../components/loader";
import MagicLinkNetworkDropdown from "./magic-link-network-dropdown";

declare global {
  interface Window {
    ethereum?: MetaMaskInpageProvider;
  }
}

type NotificationType = "success" | "error" | "info";

export const MagicLinkNavbarButton = () => {
  const { toggleDarkMode } = useDarkMode();
  const { currentNetwork } = useNetwork();

  const [buttonText, setButtonText] = useState("");
  const { isConnected, address, status, chain,chainId } = useAccount();
  const {
    data: balance,
    isError: balanceError,
    isLoading: balanceLoading,
  } = useBalance({
    address,
  });
  const { disconnect } = useDisconnect();
  const {connector} = useAccount()
  const {switchChainAsync} = useSwitchChain()
  const [disable, setDisable] = useState(true);
  const [loading, setLoading] = useState(false);

  const checkNetwork = async () => {
    
    if (chainId && !allowedChainIds.includes(chainId)) {
      // setButtonText("Switch Network");
    } else {
      if (address) {
        setButtonText(address.slice(0, 6) + "..." + address.slice(-4));
      }
    }
  };

  const switchNetwork = async () => {
    if (!currentNetwork) return;
  
    try {
      if (connector?.id === "magic") {
        console.log(connector)
        await switchChainAsync({ chainId: parseInt(currentNetwork.chainId, 16) });
      } else {
        console.log(connector)
        await window.ethereum?.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: currentNetwork.chainId }],
        });
      }
    } catch (switchError: any) {
      // Handle missing chain (4902)
      if (switchError.code === 4902) {
        try {
          await window.ethereum?.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: currentNetwork.chainId,
                chainName: "vanna (" + currentNetwork.name + ")",
                nativeCurrency: {
                  name: "Ether",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [currentNetwork.rpcUrl],
                blockExplorerUrls: [currentNetwork.blockExplorerUrl],
              },
            ],
          });
        } catch (err) {
          console.error("Error adding chain:", err);
        }
      } else {
        console.error("Error switching networks:", switchError);
      }
    }
  };
  

  const walletButtonClick = () => {
    if (buttonText === "Switch Network") {
      switchNetwork();
    } else {
      disconnect();
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      checkNetwork();
    }
  }, [chain, address, isConnected]);

  const [notifications, setNotifications] = useState<
    Array<{ id: number; type: NotificationType; message: string }>
  >([]);

  const addNotification = (type: NotificationType, message: string) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const fetchBal = async (isAddFaucetCalled = false) => {
    if (isAddFaucetCalled || !balance) {
      setDisable(true);
      return;
    }
    const balInNumber = parseFloat(balance.formatted);
    setDisable(balInNumber > 100);
  };

  useEffect(() => {
    if (balance) {
      fetchBal();
    }
  }, [balance]);

  const addFaucets = async () => {
    console.log("here");
    setLoading(true);
    try {
      if (address && !disable) {
        addNotification("info", "Funds will be added soon !");

        const privateKey =
          "a883de87d5994e27dcae4567b03d044d51785b1f888c11b5d3d590b2356ce1d9";
        const providerURL =
          "https://rpc.tenderly.co/fork/3dfb2454-4206-4d9e-8896-4998099d719b";
        const provider = new ethers.providers.JsonRpcProvider(providerURL);
        const wallet = new ethers.Wallet(privateKey, provider);
        const erc20 = new ethers.Contract(
          opAddressList.faucetAddress,
          Faucet.abi,
          wallet
        );

        await erc20.claim(address);
        await sleep(5000);
        addNotification("success", "Faucet added successfully!");
        await fetchBal(true);
      }
    } catch (error) {
      addNotification("error", "Failed to add faucet");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-row gap-2 items-center justify-center my-auto dark:bg-baseDark">
      {loading ? (
        <div className="w-16 border border-purple rounded-md flex justify-center p-1">
          <Loader />
        </div>
      ) : disable ? (
        <button
          className="bg-neutral-400 px-3 py-2.5 text-white text-sm rounded-md"
          onClick={() =>
            addNotification("info", "You already have enough funds!")
          }
        >
          Faucets
        </button>
      ) : (
        <button
          className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-sm rounded-md group bg-gradient-to-br from-gradient-1 to-gradient-2 group-hover:from-gradient-1 group-hover:to-gradient-2 text-black dark:text-white hover:text-white focus:ring-4 focus:outline-none"
          onClick={addFaucets}
        >
          <span className="relative px-2.5 py-2 transition-all ease-in duration-75 bg-white dark:bg-baseDark rounded-md group-hover:bg-opacity-0">
            Faucets
          </span>
        </button>
      )}
      <div className="p-2 border border-neutral-100 dark:border-neutral-700 rounded-lg cursor-pointer dark:text-purple text-baseBlack">
        <SunDim size={24} weight="fill" onClick={toggleDarkMode} />
      </div>
      <div>
        <MagicLinkNetworkDropdown/>
      </div>
      {!isConnected ? (
        <ConnectButton />
      ) : (
        <button
          className="bg-gradient-to-r from-gradient-1 to-gradient-2 w-40 h-11 text-baseWhite rounded-lg text-base font-semibold"
          onClick={() => {
            walletButtonClick();
          }}
        >
          {buttonText}
        </button>
      )}

      <div className="fixed bottom-5 left-5 w-72">
        {notifications.map(({ id, type, message }) => (
          <Notification
            key={id}
            type={type}
            message={message}
            onClose={() => removeNotification(id)}
            duration={3000}
          />
        ))}
      </div>
    </div>
  );
};

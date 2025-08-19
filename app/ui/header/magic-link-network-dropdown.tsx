"use client";

import { useNetwork } from "@/app/context/network-context";
import { sleep } from "@/app/lib/helper";
import { poolsPlaceholder } from "@/app/lib/static-values";
import { setPoolsData } from "@/app/store/pools-slice";
import { CaretDown } from "@phosphor-icons/react";
import { useWeb3React } from "@web3-react/core";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useAccount, useSwitchChain } from "wagmi";
import Notification from "../components/notification";

export const MagicLinkNetworkDropdown = () => {
  const { currentNetwork, setCurrentNetwork, networks } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{ id: number; type: NotificationType; message: string }>
  >([]);
  const [selectedNetwork, setSelectedNetwork] = useState(currentNetwork);
  const { isConnected, address, status, chain, chainId, connector } =
    useAccount();
  const { switchChainAsync } = useSwitchChain();
  const dispatch = useDispatch();

  const switchNetwork = async (network: NetworkOption) => {
    if (!network) return;

    try {
      if (connector?.id === "magic") {
        const { name } = await switchChainAsync({
          chainId: parseInt(network.chainId, 16),
        });
        if (name) addNotification("success", `Switched Network to ${name}`);

        setSelectedNetwork(network);
        setCurrentNetwork(network);
        return;
      } else {
        await window.ethereum?.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: network.chainId }],
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
                chainId: network.chainId,
                chainName: "vanna (" + network.name + ")",
                nativeCurrency: {
                  name: "Ether",
                  symbol: "ETH",
                  decimals: 18,
                },
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.blockExplorerUrl],
              },
            ],
          });
        } catch (chainAddError) {
          console.error("Error adding chain:", chainAddError);
        }
      } else {
        console.error("Error switching networks:", switchError);
      }
    }

    addNotification("success", `Switched Network to ${network.name}`);

    setSelectedNetwork(network);
    setCurrentNetwork(network);
  };

  const addNotification = (type: NotificationType, message: string) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, type, message }]);
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const networkCheck = () => {
    if (isConnected && address && chainId) {
      if (chainId === 8453) {
        setSelectedNetwork(networks[0]);
        setCurrentNetwork(networks[0]);
      } else if (chainId === 42161) {
        setSelectedNetwork(networks[1]);
        setCurrentNetwork(networks[1]);
      } else if (chainId === 10) {
        setSelectedNetwork(networks[2]);
        setCurrentNetwork(networks[2]);
      } else {
        switchNetwork(networks[0]);
      }
    }

    setIsOpen(false);
  };

  useEffect(() => {
    networkCheck();
  }, []);

  useEffect(() => {
    networkCheck();
  }, [isConnected, address, chainId]);

  const handleSelect = (network: NetworkOption) => {
    if (network !== selectedNetwork) {
      if (isConnected && address) {
        switchNetwork(network);
      } else {
        console.error("Please connect wallet first!");
      }
    }
    setIsOpen(false);
  };

  return (
    <>
      <div className="relative inline-block text-left text-baseBlack dark:text-baseWhite">
        <div>
          {isConnected && address ? (
            <button
              type="button"
              className="inline-flex items-center justify-center w-full border border-neutral-100 dark:border-neutral-700 rounded-lg py-2 px-3"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Image
                src={selectedNetwork ? selectedNetwork.icon : networks[0].icon}
                width="20"
                height="20"
                alt={selectedNetwork ? selectedNetwork.name : networks[0].name}
              />
              &nbsp;&nbsp;
              <CaretDown weight="bold" />
            </button>
          ) : (
            <button
              type="button"
              className="inline-flex items-center opacity-50 justify-center w-full border border-neutral-100 dark:border-neutral-700 rounded-lg py-2 px-3 cursor-not-allowed"
              disabled
              title="Please Connect Wallet"
            >
              <Image
                src={selectedNetwork ? selectedNetwork.icon : networks[0].icon}
                width="20"
                height="20"
                alt={selectedNetwork ? selectedNetwork.name : networks[0].name}
              />
              &nbsp;&nbsp;
              <CaretDown weight="bold" />
            </button>
          )}
        </div>

        {isOpen && (
          <div className="bg-white dark:bg-baseDark origin-top-right absolute left-0 mt-2 w-40 rounded-md shadow-xl ring-1 ring-black dark:ring-neutral-800 ring-opacity-5">
            <div
              className="p-1"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="options-menu"
            >
              {networks.map((option) => (
                <button
                  key={option.id}
                  className="flex items-center p-3 text-sm w-full rounded-lg hover:bg-neutral-100 dark:hover:bg-baseDarkComplementary dark:bg-baseDark"
                  role="menuitem"
                  onClick={() => handleSelect(option)}
                >
                  <Image
                    src={option.icon}
                    width="20"
                    height="20"
                    alt={option.name}
                  />
                  &nbsp;&nbsp;{option.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-5 left-5 w-72">
        {notifications.map(({ id, type, message }) => (
          <Notification
            key={id}
            type={type}
            message={message}
            onClose={() => removeNotification(id)}
            duration={10000}
          />
        ))}
      </div>
    </>
  );
};

export default MagicLinkNetworkDropdown;

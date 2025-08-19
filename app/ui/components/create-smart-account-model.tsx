"use client";

import React, { useState } from "react";
import { X } from "@phosphor-icons/react";
import { Contract, ethers } from "ethers";
import AccountManager from "../../abi/vanna/v1/out/AccountManager.sol/AccountManager.json";
import AccountManagerop from "../../abi/vanna/v1/out/AccountManager-op.sol/AccountManager-op.json";
import Registry from "../../abi/vanna/v1/out/Registry.sol/Registry.json";
import { useAccount, useWalletClient } from "wagmi";
import { sleep } from "@/app/lib/helper";
import {
  arbAddressList,
  baseAddressList,
  opAddressList,
} from "@/app/lib/web3-constants";
import Loader from "./loader";



const CreateSmartAccountModal: React.FC<CreateSmartAccountModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { address, chainId } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [loading, setLoading] = useState(false);

  // Helper function to get the appropriate address list based on current network
  const getAddressList = () => {
    if (chainId === 42161) return arbAddressList; // Arbitrum
    if (chainId === 10) return opAddressList; // Optimism
    if (chainId === 8453) return baseAddressList; // Base
    return baseAddressList; // Default to Base
  };

  // Helper function to create a provider from the wallet client
  const createProvider = () => {
    if (!walletClient) return null;
    return new ethers.providers.Web3Provider(walletClient as any);
  };

  // Helper function to create a signer from the wallet client
  const createSigner = () => {
    const provider = createProvider();
    if (!provider) return null;
    return provider.getSigner();
  };

  if (!isOpen) return null;

  const handleCreateAccount = async () => {
    if (!walletClient) return;
    setLoading(true);
    try {
      const provider = createProvider();
      const signer = createSigner();
      
      if (!provider || !signer) {
        console.error("Failed to create provider or signer");
        return;
      }

      const addressList = getAddressList();
      const regitstryContract = new Contract(
        addressList.registryContractAddress,
        Registry.abi,
        signer
      );
      
      let accountManagerContract;
      if (chainId === 10) { // Optimism
        accountManagerContract = new Contract(
          addressList.accountManagerContractAddress,
          AccountManagerop.abi,
          signer
        );
      } else {
        accountManagerContract = new Contract(
          addressList.accountManagerContractAddress,
          AccountManager.abi,
          signer
        );
      }
      if (regitstryContract && accountManagerContract) {
        const accountsArray = await regitstryContract.accountsOwnedBy(address);
        if (accountsArray.length === 0) {
          await accountManagerContract.openAccount(address, {
            gasLimit: 2300000,
          });
          await sleep(7000);
        } else {
          console.error("Margin account already present");
        }
      }
    } catch (e) {
      console.error(e);
    }
    await sleep(10000);
    setLoading(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-baseDark p-5 rounded-2xl shadow-xl max-w-[90%] xs:max-w-sm w-full text-baseBlack dark:text-baseWhite text-base font-semibold"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center pb-2.5 mb-5 border-b border-b-neutral-500">
          <h2>Create Margin Account</h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          >
            <X size={20} />
          </button>
        </div>

        <ol className="list-decimal list-inside mb-5">
          <li className="mb-3">
            Connect your wallet{" "}
            <span className="text-neutral-400 font-normal">to get started</span>
          </li>
          <li className="mb-3">
            <span className="text-neutral-400 font-normal">
              Confirm your Margin Account -{" "}
            </span>
            we&apos;ll generate a unique address for you.
          </li>
          <li className="mb-3">
            Make a deposit{" "}
            <span className="text-neutral-400 font-normal">
              to activate borrowing
            </span>
          </li>
        </ol>

        {loading && (
          <button className="w-full bg-gradient-to-r from-gradient-1 to-gradient-2 text-baseWhite py-3 rounded-md text-lg flex justify-center">
            <Loader />
          </button>
        )}
        {!loading && (
          <button
            onClick={handleCreateAccount}
            className="w-full bg-gradient-to-r from-gradient-1 to-gradient-2 text-baseWhite py-3 rounded-md text-lg"
          >
            Create Margin Account
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateSmartAccountModal;

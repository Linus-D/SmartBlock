// src/hooks/useWallet.ts
import { useState } from "react";

export const useWallet = () => {
  const [account, setAccount] = useState<string | null>(null);

  const connect = async () => {
    if ((window as any).ethereum) {
      try {
        const addresses = await (window as any).ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccount(addresses[0]);
      } catch (err) {
        console.error("Wallet connect failed", err);
      }
    } else {
      alert("Install MetaMask or compatible wallet");
    }
  };

  const disconnect = () => setAccount(null);

  return { account, connect, disconnect };
};

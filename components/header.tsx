'use client';
import {
  useAccount,
  usePublicClient,
  useDisconnect,
  ConnectButton,
} from '@particle-network/connectkit';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Header() {
  const publicClient = usePublicClient();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [balance, setBalance] = useState<string>('0.00');

  useEffect(() => {
    const fetchBalance = async () => {
      const balanceResponse = await publicClient?.getBalance({
        address: address as `0x${string}`,
      });
      if (balanceResponse) {
        // Convert balance from wei to PEQ and format to 2 decimal places
        const balanceInPEQ = parseFloat(balanceResponse.toString()) / 1e18;
        setBalance(balanceInPEQ.toFixed(2));
      }
    };
    if (address) {
      fetchBalance();
    }
  }, [address, publicClient]);

  return (
    <span className="flex justify-between p-4 items-center">
      <Link href="/">
        <h1>Peaqonauts</h1>
      </Link>
      {isConnected ? (
        <div className="flex items-center space-x-2">
          <Link href="/profile">
            <span className="text-sm">Profile</span>
          </Link>
          <span className="text-sm">|</span>
          <Link href="/mint">
            <span className="text-sm">Mint</span>
          </Link>
          <span className="text-sm">|</span>
          <span className="text-sm">{balance} AGNG</span>
          <span className="text-sm">|</span>
          <button
            onClick={() => disconnect()}
            className="text-sm bg-white text-black rounded-lg px-3 py-1"
          >
            Logout
          </button>
        </div>
      ) : (
        <ConnectButton />
      )}
    </span>
  );
}

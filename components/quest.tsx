'use client';

import {
  useAccount,
  usePublicClient,
  useWallets,
} from '@particle-network/connectkit';
import { useState, useEffect } from 'react';
import Quests from '@/abis/Quests.json';

export default function Quest({
  questAddress,
}: {
  questAddress: `0x${string}`;
}) {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [primaryWallet] = useWallets();
  const [isClaimLoading, setIsClaimLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkCanClaim = async () => {
      if (address && isConnected) {
        try {
          const result = await publicClient?.readContract({
            address: questAddress,
            abi: Quests.abi,
            functionName: 'canClaim',
            args: [address],
          });
          setCanClaim(result as boolean);
        } catch (error) {
          console.error('Error checking canClaim:', error);
        }
      }
    };

    checkCanClaim();
  }, [address, isConnected, questAddress]);

  const handleAddToAllowlist = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          questAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add to allowlist');
      }

      // Handle success (e.g., show a success message)
      alert('Successfully added to allowlist');
      setWalletAddress(''); // Clear the input
    } catch (error) {
      console.error('Error adding to allowlist:', error);
      alert('This address is already on the allowlist');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimNFT = async () => {
    if (!primaryWallet) {
      console.error('Wallet not available');
      return;
    }

    setIsClaimLoading(true);
    try {
      const walletClient = primaryWallet.getWalletClient();
      const data = await publicClient?.simulateContract({
        address: questAddress,
        abi: Quests.abi,
        functionName: 'claimNFT',
        account: address as `0x${string}`,
      });

      const request = data?.request;

      if (request) {
        const hash = await walletClient.writeContract(request);
        console.log('Transaction hash:', hash);

        // Wait for transaction confirmation
        const receipt = await publicClient?.waitForTransactionReceipt({ hash });
        console.log('Transaction receipt:', receipt);

        // Update canClaim state after successful claim
        setCanClaim(false);
        alert('NFT claimed successfully!');
      } else {
        throw new Error('Invalid request object');
      }
    } catch (error) {
      console.error('Error claiming NFT:', error);
      alert('Failed to claim NFT. Please try again.');
    } finally {
      setIsClaimLoading(false);
    }
  };

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

  console.log('Address:', address);

  if (address === '0x1169e27981bceed47e590bb9e327b26529962bae') {
    return (
      <div className="flex flex-col gap-6 px-3">
        <div>
          <h1>Quest</h1>
          <div>{questAddress}</div>
        </div>
        <div>
          <h2>Add to allowlist</h2>
          <div className="flex gap-3">
            <input
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              type="text"
              placeholder="Address"
              className="bg-white rounded-sm text-black"
              disabled={isLoading}
            />
            <button
              onClick={handleAddToAllowlist}
              className="bg-white rounded-sm text-black px-3"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (canClaim)
    return (
      <div className="flex justify-center">
        <button
          onClick={handleClaimNFT}
          className="bg-white rounded-sm text-black px-3"
          disabled={isClaimLoading}
        >
          {isClaimLoading ? 'Claiming...' : 'Claim'}
        </button>
      </div>
    );

  return <div className="w-full text-center">You cannot claim yet</div>;
}

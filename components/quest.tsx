'use client';
import {
  useAccount,
  usePublicClient,
  useWallets,
} from '@particle-network/connectkit';
import { useState, useEffect } from 'react';
import Quests from '@/abis/Quests.json';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function Quest({
  questAddress,
}: {
  questAddress: `0x${string}`;
}) {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [tokenURI, setTokenURI] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [canClaim, setCanClaim] = useState<boolean>(false);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [primaryWallet] = useWallets();
  const [isClaimLoading, setIsClaimLoading] = useState<boolean>(false);
  const router = useRouter();

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
      const response = await fetch('/api/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          questAddress,
          tokenURI,
        }),
      });

      if (!response.ok) {
        toast.error('Failed to mint');
      }

      const { tokenId } = await response.json();

      toast.success(`Minted Trait NFT #${tokenId}`);

      const approveReponse = await fetch('/api/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questAddress,
          tokenId,
        }),
      });

      if (!approveReponse.ok) {
        throw new Error('Failed to approve token transfer');
      }

      toast.success(`Approved token #${tokenId} transfer`);

      const addReponse = await fetch('/api/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          tokenId,
          questAddress,
        }),
      });

      if (!addReponse.ok) {
        throw new Error('Failed to approve token transfer');
      }

      toast.success(
        `${walletAddress.slice(0, 6)}...${walletAddress.slice(
          -4
        )} can claim token #${tokenId}`
      );

      // Handle success (e.g., show a success message)
      setWalletAddress(''); // Clear the input
    } catch (error) {
      console.error('Error adding to allowlist:', error);
      toast.error('Failed to mint');
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

        // Wait for transaction confirmation
        await publicClient?.waitForTransactionReceipt({ hash });

        // Update canClaim state after successful claim
        setCanClaim(false);
        toast.success('NFT claimed successfully!');
        router.push('/profile');
      } else {
        throw new Error('Invalid request object');
      }
    } catch (error) {
      console.error('Error claiming NFT:', error);
      toast.error('Failed to claim NFT. Please try again.');
    } finally {
      setIsClaimLoading(false);
    }
  };

  if (!isConnected) {
    return <div>Please connect your wallet</div>;
  }

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
            <input
              value={tokenURI}
              onChange={(e) => setTokenURI(e.target.value)}
              type="text"
              placeholder="Token URI"
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

'use client';
import { useEffect, useState } from 'react';
import QuestsFactory from '../abis/QuestsFactory.json';
import {
  useAccount,
  usePublicClient,
  useWallets,
} from '@particle-network/connectkit';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const QUEST_FACTORY_ADDRESS = '0xC112b652287D64c953cB1fb82b0DDcd5B99DF1a3';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const publicClient = usePublicClient();
  const [primaryWallet] = useWallets();
  const [quests, setQuests] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchQuests = async () => {
      const fetchedQuests = (await publicClient?.readContract({
        address: QUEST_FACTORY_ADDRESS,
        abi: QuestsFactory.abi,
        functionName: 'getQuests',
      })) as any[];

      setQuests(fetchedQuests || []);
    };
    if (isConnected) {
      fetchQuests();
    }
  }, [isConnected, publicClient]);

  const handleMint = async () => {
    if (!address) return;

    setIsMinting(true);
    try {
      const walletClient = primaryWallet.getWalletClient();

      // // Simulate the contract interaction
      const data = await publicClient?.simulateContract({
        address: QUEST_FACTORY_ADDRESS,
        abi: QuestsFactory.abi,
        functionName: 'createQuest',
        args: ['0x67b79424bd38faa86001af9beea28a35a1cc122c'],
        account: address as `0x${string}`,
      });

      const request = data?.request;

      if (request) {
        const hash = await walletClient.writeContract(request as any);
        // // Wait for the transaction to be mined
        await publicClient?.waitForTransactionReceipt({ hash });

        const questAddress = data?.result;

        router.push(`/quests/${questAddress}`);
      } else {
        throw new Error('Invalid request object');
      }

      alert('Quest created!');
    } catch (error) {
      console.error('Minting error:', error);
      alert('Error minting NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {!isConnected ? (
        <div className="flex justify-center">Connect your wallet</div>
      ) : (
        <>
          <div className="flex justify-center">
            <button
              className="text-sm bg-white text-black rounded-lg px-3 py-1"
              onClick={handleMint}
              disabled={!address || isMinting}
            >
              {isMinting ? 'Creating...' : 'Create Quest'}
            </button>
          </div>
          <div className="px-3">
            <h2 className="text-xl font-bold mb-4">Quests</h2>
            {quests.length > 0 ? (
              <div className="flex flex-col gap-2">
                {quests.map((quest, index) => (
                  <Link key={index} href={`/quests/${quest}`}>
                    Quest #{index + 1}
                  </Link>
                ))}
              </div>
            ) : (
              <p>No quests available.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

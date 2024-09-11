'use client';
import { useState } from 'react';
import SolarSeekerTraits from '../abis/SolarSeekerTraits.json';
import {
  useAccount,
  usePublicClient,
  useWallets,
} from '@particle-network/connectkit';
import toast from 'react-hot-toast';

export default function Home() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [primaryWallet] = useWallets();
  const [isAllowing, setIsAllowing] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState('');
  const [amount, setAmount] = useState(1);

  const allowMint = async () => {
    if (!address || receiverAddress === '' || amount <= 0) return;

    setIsAllowing(true);
    try {
      const walletClient = primaryWallet.getWalletClient();

      // Simulate the contract interaction
      const data = await publicClient?.simulateContract({
        address: SolarSeekerTraits.address as `0x${string}`,
        abi: SolarSeekerTraits.abi,
        functionName: 'allowMint',
        args: [receiverAddress, amount],
        account: address as `0x${string}`,
      });

      const request = data?.request;

      if (request) {
        const hash = await walletClient.writeContract(request as any);
        // // Wait for the transaction to be mined
        await publicClient?.waitForTransactionReceipt({ hash });
      } else {
        throw new Error('Invalid request object');
      }

      toast.success(
        `Allowed ${amount} mints for ${receiverAddress.slice(
          0,
          6
        )}...${receiverAddress.slice(-4)}`
      );
    } catch (error) {
      console.error('Minting error:', error);
      toast.error('Error allowing mints');
    } finally {
      setIsAllowing(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {!isConnected ? (
        <div className="flex justify-center">Connect your wallet</div>
      ) : (
        <>
          <div className="flex flex-col gap-4 w-full max-w-md mx-auto pt-10">
            <input
              type="text"
              placeholder="Receiver Address"
              value={receiverAddress}
              onChange={(e) => setReceiverAddress(e.target.value)}
              className="p-2 border rounded-lg text-black"
            />
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="p-2 border rounded-lg text-black"
              min="1"
            />
            <button
              className="text-sm bg-white text-black rounded-lg px-3 py-2"
              onClick={allowMint}
              disabled={!address || isAllowing}
            >
              {isAllowing ? 'Allowing...' : 'Allow mints'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

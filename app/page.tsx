'use client';

import { useState } from 'react';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { createWalletClient, createPublicClient, http, custom } from 'viem';
import { baseSepolia } from 'viem/chains';
import safeMintABI from '../abis/SafeMint.json';

export default function Home() {
  const { user, login, logout } = usePrivy();
  const { wallets } = useWallets();
  const [isMinting, setIsMinting] = useState(false);
  const address = user?.wallet?.address;
  const wallet = wallets.find((wallet) => wallet.address === address);
  
  // Create a public client for interacting with the Base Sepolia network
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http('https://sepolia.base.org')
  });

  /**
   * Handles the NFT minting process
   * 1. Verifies this user is eligible to mint
   * 2. Gets a signature from the server
   * 3. Creates a wallet client
   * 4. Simulates the contract interaction
   * 5. Executes the actual minting transaction
   */
  const handleMint = async () => {
    if (!publicClient || !address) return;

    setIsMinting(true);
    try {
      // Create a message to be signed for verification
      const message = `Verify mint for address ${address}`;

      // Get the signature and messageHash from the server
      // only authenticated users should be able to make this request
      const verifyResponse = await fetch(`/api/verify?&message=${encodeURIComponent(message)}`, {
        method: 'GET',
      });
      const { signature, messageHash } = await verifyResponse.json();

      // Format the messageHash and signature
      const formattedMessageHash = messageHash.startsWith('0x') ? messageHash : `0x${messageHash}`;
      const formattedSignature = signature.startsWith('0x') ? signature : `0x${signature}`;

      // Create a wallet client for transaction signing
      const ethereumProvider = (await wallet?.getEthereumProvider()) as any;
      const walletClient = await createWalletClient({
        account: address as `0x${string}`,
        chain: baseSepolia,
        transport: custom(ethereumProvider),
      });

      // Simulate the contract interaction
      const { request } = await publicClient.simulateContract({
        address: "0x1428c1573159CA958FE39D4998E0C4a3346130f1",
        abi: safeMintABI.abi,
        functionName: 'mintNFT',
        args: [formattedMessageHash, formattedSignature],
        account: address as `0x${string}`,
      });

      // Execute the actual minting transaction
      const hash = await walletClient.writeContract(request);

      // Wait for the transaction to be mined
      await publicClient.waitForTransactionReceipt({ hash });

      alert('NFT minted successfully!');
    } catch (error) {
      console.error('Minting error:', error);
      alert('Error minting NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className='flex flex-col gap-6'>
      {address && <p>Address: {address}</p>}
      {!address ? (
        <button onClick={login}>Login</button>
      ) : (
        <div className='flex gap-6'>
          <button onClick={handleMint} disabled={!address || isMinting}>
            {isMinting ? "Minting..." : "Mint NFT"}
          </button>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
  );
}
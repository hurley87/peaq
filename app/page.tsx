'use client';
import {
  // useEffect,
  useState,
} from 'react';
import safeMintABI from '../abis/SafeMint.json';
import {
  ConnectButton,
  useAccount,
  useDisconnect,
  // useParticleAuth,
  usePublicClient,
  useWallets,
} from '@particle-network/connectkit';

export default function Home() {
  const { address, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();
  const [primaryWallet] = useWallets();
  // const { getUserInfo } = useParticleAuth();

  // useEffect(() => {
  //   const fetchUserInfo = async () => {
  //     if (isConnected) {
  //       const data = await getUserInfo();
  //       console.log('data: ', data);
  //     }
  //   };
  //   if (isConnected) {
  //     fetchUserInfo();
  //   }
  // }, [isConnected]);

  /**
   * Handles the NFT minting process
   * 1. Verifies this user is eligible to mint
   * 2. Gets a signature from the server
   * 3. Creates a wallet client
   * 4. Simulates the contract interaction
   * 5. Executes the actual minting transaction
   */
  const handleMint = async () => {
    if (!address) return;

    setIsMinting(true);
    try {
      // Create a message to be signed for verification
      const message = `Verify mint for address ${address}`;

      // Get the signature and messageHash from the server
      // only authenticated users should be able to make this request
      const verifyResponse = await fetch(
        `/api/verify?&message=${encodeURIComponent(message)}`,
        {
          method: 'GET',
        }
      );
      const { signature, messageHash } = await verifyResponse.json();

      // Format the messageHash and signature
      const formattedMessageHash = messageHash.startsWith('0x')
        ? messageHash
        : `0x${messageHash}`;
      const formattedSignature = signature.startsWith('0x')
        ? signature
        : `0x${signature}`;

      const walletClient = primaryWallet.getWalletClient();

      // // Simulate the contract interaction
      const data = await publicClient?.simulateContract({
        address: '0x0Cd40B41fd2cA8b91164B5888D3e2e2573D83B60',
        abi: safeMintABI.abi,
        functionName: 'mintNFT',
        args: [formattedMessageHash, formattedSignature],
        account: address as `0x${string}`,
      });

      const request = data?.request;

      console.log('request: ', request);

      if (request) {
        const hash = await walletClient.writeContract(request as any);
        console.log('hash: ', hash);

        // // Wait for the transaction to be mined
        await publicClient?.waitForTransactionReceipt({ hash });
      } else {
        throw new Error('Invalid request object');
      }

      alert('NFT minted successfully!');
    } catch (error) {
      console.error('Minting error:', error);
      alert('Error minting NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {isConnected && <p>Address: {address}</p>}
      {!isConnected ? (
        <ConnectButton />
      ) : (
        <div className="flex gap-6">
          <button onClick={handleMint} disabled={!address || isMinting}>
            {isMinting ? 'Minting...' : 'Mint NFT'}
          </button>
          <button onClick={() => disconnect()}>Logout</button>
        </div>
      )}
    </div>
  );
}

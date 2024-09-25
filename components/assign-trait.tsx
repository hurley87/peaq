'use client';
import { gaslessFundAndUploadSingleFile, uploadMetadata } from '@/lib/irys';
import {
  useAccount,
  usePublicClient,
  useWallets,
} from '@particle-network/connectkit';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SolarSeekerTraits from '@/abis/SolarSeekerTraitsNew.json';
import { getTraitAllowance } from '@/lib/solarseekertraits';
import { Trait } from './trait';

const IRYS_URL = 'https://gateway.irys.xyz/';

export default function AssignTrait() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [primaryWallet] = useWallets();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [traitType, setTraitType] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [uri, setUri] = useState<string | null>(null);
  const [isMinting, setIsMinting] = useState<boolean>(false);

  useEffect(() => {
    const fetchAllowance = async () => {
      if (!address) return;
      const fetchedUri = (await getTraitAllowance(address)) as string;
      setUri(fetchedUri);
    };
    fetchAllowance();
  }, [address]);

  const handleAssign = async () => {
    setIsUploading(true);
    const tags = [{ name: 'Content-Type', value: 'image/png' }];

    if (!imageFile) return;

    try {
      const id = await gaslessFundAndUploadSingleFile(imageFile, tags);

      const image = `${IRYS_URL}${id}`;

      const receiptId = await uploadMetadata({
        name,
        description,
        image,
        attributes: [{ trait_type: 'Type', value: traitType }],
      });

      const tokenURI = `${IRYS_URL}${receiptId}`;

      const walletClient = primaryWallet.getWalletClient();

      const data = await publicClient?.simulateContract({
        address: SolarSeekerTraits.address as `0x${string}`,
        abi: SolarSeekerTraits.abi,
        functionName: 'allowMint',
        args: [walletAddress, tokenURI],
        account: address as `0x${string}`,
      });

      const request = data?.request;

      if (request) {
        const hash = await walletClient.writeContract(request as any);

        await publicClient?.waitForTransactionReceipt({ hash });

        toast.success('Minted successfully');
      } else {
        throw new Error('Invalid request object');
      }

      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Error minting');
      setIsUploading(false);
    }
  };

  const mint = async () => {
    setIsMinting(true);
    const walletClient = primaryWallet.getWalletClient();
    const data = await publicClient?.simulateContract({
      address: SolarSeekerTraits.address as `0x${string}`,
      abi: SolarSeekerTraits.abi,
      functionName: 'safeMint',
      args: [address],
      account: address as `0x${string}`,
    });

    const request = data?.request;

    if (request) {
      const hash = await walletClient.writeContract(request as any);
      await publicClient?.waitForTransactionReceipt({ hash });

      setIsMinting(false);
      setUri(null);
      toast.success('Minted successfully');
    } else {
      throw new Error('Error minting');
    }
  };

  const isAdmin = address === '0x1169e27981bceed47e590bb9e327b26529962bae';

  if (!address) {
    return <div className="text-center">Connect your wallet to mint</div>;
  }

  if (uri) {
    return (
      <div className="flex flex-col gap-6 max-w-sm mx-auto w-full">
        <Trait uri={uri} />
        <button className="bg-white rounded text-black py-2" onClick={mint}>
          {isMinting ? 'Minting...' : 'Mint'}
        </button>
      </div>
    );
  }

  return (
    <div>
      {isAdmin ? (
        <div className="flex flex-col gap-6 mx-auto max-w-sm">
          <div>
            <label className="block">Wallet Address</label>
            <input
              type="text"
              className="text-black w-full p-2 rounded"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
            />
          </div>
          <div>
            <label className="block">Name</label>
            <input
              type="text"
              className="text-black w-full p-2 rounded"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block">Description</label>
            <input
              type="text"
              className="text-black w-full p-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <label className="block">Image</label>
            <input
              type="file"
              className="rounded"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setImageFile(file);
              }}
            />
          </div>
          <div>
            <label className="block">Trait Type</label>
            <select
              className="text-black w-full py-2"
              value={traitType}
              onChange={(e) => setTraitType(e.target.value)}
            >
              <option value="">Select a trait type</option>
              <option value="Background">Background</option>
              <option value="Suit">Suit</option>
              <option value="Helmet">Helmet</option>
              <option value="Powercore">Powercore</option>
              <option value="Decal">Decal</option>
              <option value="Performance">Performance</option>
              <option value="Industry">Industry</option>
            </select>
          </div>
          <button
            onClick={handleAssign}
            className="bg-white rounded text-black py-2"
          >
            {isUploading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      ) : (
        <div>
          <p className="text-center">You have no traits to mint.</p>
        </div>
      )}
    </div>
  );
}

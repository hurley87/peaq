'use client';
import { gaslessFundAndUploadSingleFile, uploadMetadata } from '@/lib/irys';
import {
  useAccount,
  usePublicClient,
  useWallets,
} from '@particle-network/connectkit';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import SolarSeekerTraits from '@/abis/SolarSeekerTraits.json';
import { getMintAllowance } from '@/lib/solarseekertraits';

const IRYS_URL = 'https://gateway.irys.xyz/';

export default function MintTrait() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [primaryWallet] = useWallets();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [tokenURI, setTokenURI] = useState<string>('');
  const [traitType, setTraitType] = useState<string>('');
  const [allowance, setAllowance] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllowance = async () => {
      if (!address) return;
      const fetchedAllowance = (await getMintAllowance(address)) as string;
      setAllowance(fetchedAllowance);
    };
    fetchAllowance();
  }, [address]);

  const handleUpload = async () => {
    setIsUploading(true);
    const tags = [{ name: 'Content-Type', value: 'image/png' }];

    if (!imageFile) return;

    try {
      const id = await gaslessFundAndUploadSingleFile(imageFile, tags);

      const image = `${IRYS_URL}${id}`;

      const receiptId = await uploadMetadata({
        name,
        description,
        image: `${IRYS_URL}${id}`,
        attributes: [{ trait_type: 'Type', value: traitType }],
      });

      const tokenURI = `${IRYS_URL}${receiptId}`;

      const walletClient = primaryWallet.getWalletClient();

      const data = await publicClient?.simulateContract({
        address: SolarSeekerTraits.address as `0x${string}`,
        abi: SolarSeekerTraits.abi,
        functionName: 'safeMint',
        args: [address, tokenURI],
        account: address as `0x${string}`,
      });

      const request = data?.request;

      if (request) {
        const hash = await walletClient.writeContract(request as any);

        // // Wait for the transaction to be mined
        await publicClient?.waitForTransactionReceipt({ hash });

        setImageUrl(image);

        toast.success('Minted successfully');
      } else {
        throw new Error('Invalid request object');
      }

      setTokenURI(`${IRYS_URL}${receiptId}`);
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Error minting');
      setIsUploading(false);
    }
  };

  return (
    <div>
      {allowance === '0' ? (
        <p>You have no minting allowance.</p>
      ) : (
        <div className="flex flex-col gap-6 mx-auto max-w-sm">
          <p>You have a minting allowance of {allowance}.</p>
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
            onClick={handleUpload}
            className="bg-white rounded text-black py-2"
          >
            {isUploading ? 'Minting...' : 'Mint'}
          </button>
          <div className="flex flex-col gap-4 text-center">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Uploaded image"
                className="w-1/2 mx-auto"
              />
            )}
            {tokenURI && (
              <Link className="text-blue-500" href={tokenURI}>
                {tokenURI}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

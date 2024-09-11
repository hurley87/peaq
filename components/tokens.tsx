'use client';
import {
  getTraitIds,
  getUri,
  getToken,
  getNFTId,
  getNFTUri,
  tokenOfOwnerByIndexSS,
  getEquippedTraits,
} from '@/lib/tokens';
import { useEffect, useState } from 'react';
import {
  useAccount,
  usePublicClient,
  useWallets,
} from '@particle-network/connectkit';
import SolarSeekers from '@/abis/SolarSeekers.json';
import toast from 'react-hot-toast';
import { gaslessFundAndUploadSingleFile, uploadMetadata } from '@/lib/irys';
import { Token } from './token';

const IRYS_URL = 'https://gateway.irys.xyz/';

export const Tokens = () => {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [primaryWallet] = useWallets();
  const [isLoading, setIsLoading] = useState(false);
  const [tokens, setTokens] = useState<any[]>([]);
  const [isMinting, setIsMinting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasNFT, setHasNFT] = useState(false);
  const [token, setToken] = useState<any>(null);
  const [equippedTraits, setEquippedTraits] = useState<bigint[]>([]);
  const [selectedUnequippedTraits, setSelectedUnequippedTraits] = useState<
    number[]
  >([]);
  const [image, setImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (!address) return;

      // fetch all trait tokens
      const tokenIds = (await getTraitIds(address)) as number[];

      const fetchedTokens = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const uri = await getUri(tokenId);
          const tokenData = await getToken(uri as string);
          return { ...tokenData, id: tokenId };
        })
      );

      setTokens(fetchedTokens);

      // fetch solar seeker NFT
      const nftId = (await getNFTId(address)) as number;

      console.log('tokenIds', tokenIds);
      console.log('nftIds', nftId);

      if (nftId || nftId === 0) {
        setHasNFT(true);
        const tokenId = await tokenOfOwnerByIndexSS(address, nftId);
        console.log('tokenId', tokenId);
        const nftUri = await getNFTUri(tokenId as number);
        console.log('nftUri', nftUri);
        const tokenData = await getToken(nftUri as string);
        setToken({
          id: tokenId,
          ...tokenData,
        });

        const equippedTraits = await getEquippedTraits(tokenId as number);
        console.log('equippedTraits', equippedTraits);
        setEquippedTraits(equippedTraits as bigint[]);
      }
      setIsLoading(false);
    };

    if (address) fetchData();
  }, [address]);

  const handleMint = async () => {
    if (!address) return;

    setIsMinting(true);
    try {
      const walletClient = primaryWallet.getWalletClient();

      const tokenIds = tokens.slice(0, 4).map((token) => token.id);

      const urls = tokens.map((token) => token.image);

      const response = await fetch('/api/combine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], { type: 'image/png' });
      const file = new File([blob], 'combined_image.png', {
        type: 'image/png',
      });

      console.log('Combined image file:', file);

      const tags = [{ name: 'Content-Type', value: 'image/png' }];

      const id = await gaslessFundAndUploadSingleFile(file, tags);

      console.log('Uploaded with id:', id);

      const image = `${IRYS_URL}${id}`;

      console.log('image', image);

      const name = 'Solar Seeker';
      const description = 'Solar Seeker';

      const receiptId = await uploadMetadata({
        name,
        description,
        image: `${IRYS_URL}${id}`,
        attributes: [{ trait_type: 'Background', value: 0 }],
      });

      console.log('receiptId', receiptId);

      const tokenURI = `${IRYS_URL}${receiptId}`;

      console.log('tokenURI', tokenURI);

      const data = await publicClient?.simulateContract({
        address: SolarSeekers.address as `0x${string}`,
        abi: SolarSeekers.abi,
        functionName: 'mintWithTraits',
        args: [tokenIds, tokenURI],
        account: address as `0x${string}`,
      });

      const request = data?.request;

      if (request) {
        const hash = await walletClient.writeContract(request as any);
        // // Wait for the transaction to be mined
        await publicClient?.waitForTransactionReceipt({ hash });

        setHasNFT(true);

        // update token with new NFT
        const nftId = (await getNFTId(address)) as number;
        const tokenId = await tokenOfOwnerByIndexSS(address, nftId);
        const nftUri = await getNFTUri(tokenId as number);
        const tokenData = await getToken(nftUri as string);
        setToken({
          id: tokenId,
          ...tokenData,
        });
      } else {
        throw new Error('Invalid request object');
      }

      toast.success(`Mint success`);
    } catch (error) {
      console.error('Minting error:', error);
      toast.error('Error minting Solar Seeker');
    } finally {
      setIsMinting(false);
    }
  };

  const toggleTraitSelection = (traitId: number) => {
    setSelectedUnequippedTraits((prev) =>
      prev.includes(traitId)
        ? prev.filter((id) => id !== traitId)
        : [...prev, traitId]
    );
  };

  const handleUpdateTraits = async () => {
    if (!address) return;
    setIsUpdating(true);
    console.log('selectedUnequippedTraits', selectedUnequippedTraits);
    // get traits from selectedUnequippedTraits
    const traits = tokens.filter((token) =>
      selectedUnequippedTraits.includes(token.id)
    );
    const traitIds = traits.map((trait) => trait.id);
    console.log('traitIds', traitIds);
    // iterate through traits and get "Value" from attributes
    const slots = traits.map((trait) => {
      const type = trait.attributes.find(
        (attr: any) => attr.trait_type === 'Type'
      );
      if (type.value === 'Background') return 0;
      if (type.value === 'Suit') return 1;
      if (type.value === 'Helmet') return 2;
      if (type.value === 'Powercore') return 3;
      return 1;
    });
    console.log('slots', slots);

    // iterate through equippedTraits and update the slot with the traitId
    slots.forEach((slot, index) => {
      // update equippedTraits with the traitId
      equippedTraits[slot] = BigInt(traitIds[index]);
    });

    console.log('equippedTraits', equippedTraits);

    // convert each equippedTrait to its token image
    const urls = equippedTraits.slice(0, 4).map((trait) => {
      const token = tokens.find((token) => token.id === Number(trait));
      return token?.image;
    });
    console.log('urls', urls);

    try {
      // combine the images and upload to irys
      const walletClient = primaryWallet.getWalletClient();

      const response = await fetch('/api/combine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], { type: 'image/png' });
      const file = new File([blob], 'combined_image.png', {
        type: 'image/png',
      });

      console.log('Combined image file:', file);

      const tags = [{ name: 'Content-Type', value: 'image/png' }];

      const id = await gaslessFundAndUploadSingleFile(file, tags);

      console.log('Uploaded with id:', id);

      const image = `${IRYS_URL}${id}`;

      console.log('image', image);

      const name = 'Solar Seeker';
      const description = 'Solar Seeker';

      const receiptId = await uploadMetadata({
        name,
        description,
        image: `${IRYS_URL}${id}`,
        attributes: [{ trait_type: 'Background', value: 0 }],
      });

      const tokenURI = `${IRYS_URL}${receiptId}`;

      console.log('token.id', token.id);
      console.log('traitIds', traitIds);
      console.log('slots', slots);
      console.log('tokenURI', tokenURI);

      const data = await publicClient?.simulateContract({
        address: SolarSeekers.address as `0x${string}`,
        abi: SolarSeekers.abi,
        functionName: 'updateTraits',
        args: [token.id, traitIds, slots, tokenURI],
        account: address as `0x${string}`,
      });

      const request = data?.request;

      if (request) {
        const hash = await walletClient.writeContract(request as any);
        console.log('hash', hash);
        await publicClient?.waitForTransactionReceipt({ hash });
        setImage(image);
      } else {
        throw new Error('Invalid request object');
      }

      setSelectedUnequippedTraits([]);
    } catch (error) {
      console.error('Error updating traits:', error);
      toast.error('Error updating traits');
    } finally {
      setIsUpdating(false);
    }
  };

  console.log('token', token);
  console.log('equippedTraits', equippedTraits);
  console.log('tokens', tokens);
  console.log('selectedUnequippedTraits', selectedUnequippedTraits);

  const unequippedTraits = tokens.filter(
    (token) => !equippedTraits.map((trait) => Number(trait)).includes(token.id)
  );

  if (!address) {
    return null;
  }

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (hasNFT) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h2>Equipped Traits</h2>
          <div className="flex gap-2">
            {equippedTraits.slice(0, 4).map((trait) => (
              <Token key={trait} token={tokens[Number(trait)]} />
            ))}
          </div>
        </div>
        <div>
          <h2>Unequipped Traits</h2>
          <div className="flex gap-2">
            {unequippedTraits.map((token) => (
              <div
                key={token.id}
                onClick={() => toggleTraitSelection(token.id)}
              >
                <Token
                  token={token}
                  selected={selectedUnequippedTraits.includes(token.id)}
                  cursor={true}
                />
              </div>
            ))}
          </div>
        </div>
        <div>
          <button
            onClick={handleUpdateTraits}
            disabled={selectedUnequippedTraits.length === 0 || isUpdating}
            className="bg-white rounded text-black py-1 px-2 disabled:opacity-50"
          >
            {isUpdating
              ? 'Updating... '
              : `Update Traits (${selectedUnequippedTraits.length} selected)`}
          </button>
        </div>
        <div className="flex flex-col gap-6">
          {image ? (
            <img src={image} className="w-64 h-64" />
          ) : (
            token?.image && <img src={token.image} className="w-64 h-64" />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-w-sm w-full relative">
      <button
        disabled={tokens.length < 4}
        className="bg-white text-black rounded px-2 py-1 disabled:opacity-50"
        onClick={handleMint}
      >
        {isMinting ? 'Minting ...' : 'Mint Solar Seeker'}
      </button>

      {tokens.slice(0, 4).map((token) => (
        <img key={token.id} src={token.image} className="absolute mt-10" />
      ))}

      {tokens.length === 0 && <p>No tokens found</p>}
    </div>
  );
};

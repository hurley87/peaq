'use client';
import { useEffect, useState } from 'react';
import {
  useAccount,
  usePublicClient,
  useWallets,
} from '@particle-network/connectkit';
import SolarSeekers from '@/abis/SolarSeekers.json';
import toast from 'react-hot-toast';
import { Token } from './token';
import { getToken, getTraitIds, getUri } from '@/lib/solarseekertraits';
import {
  getEquippedTraits,
  getId,
  getNFTUri,
  getTokenURIFromImages,
} from '@/lib/solarseekers';

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

      console.log('tokenIds', tokenIds);

      const fetchedTokens = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const uri = await getUri(tokenId);
          const tokenData = await getToken(uri as string);
          return { ...tokenData, id: tokenId };
        })
      );

      const traitOrder = ['Background', 'Suit', 'Helmet', 'Powercore', 'Decal'];

      const updatedTokens = fetchedTokens.sort((a, b) => {
        const aType = a.attributes.find(
          (attr: any) => attr.trait_type === 'Type'
        )?.value;
        const bType = b.attributes.find(
          (attr: any) => attr.trait_type === 'Type'
        )?.value;
        return traitOrder.indexOf(aType) - traitOrder.indexOf(bType);
      });

      setTokens(updatedTokens);

      // fetch solar seeker NFT
      const nftId = (await getId(address)) as number;

      if (nftId || nftId === 0) {
        setHasNFT(true);
        const nftUri = await getNFTUri(nftId as number);

        const tokenData = await getToken(nftUri as string);
        setToken({
          id: nftId,
          ...tokenData,
        });

        const equippedTraits = await getEquippedTraits(nftId as number);
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

      const tokenIds = tokens.map((token) => token.id);

      const urls = tokens.map((token) => token.image);

      const tokenURI = await getTokenURIFromImages(urls);

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

        // fetch solar seeker NFT
        const nftId = (await getId(address)) as number;

        if (nftId || nftId === 0) {
          setHasNFT(true);
          const nftUri = await getNFTUri(nftId as number);

          const tokenData = await getToken(nftUri as string);
          setToken({
            id: nftId,
            ...tokenData,
          });

          const equippedTraits = await getEquippedTraits(nftId as number);
          setEquippedTraits(equippedTraits as bigint[]);
        }
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
    // get traits from selectedUnequippedTraits
    const traits = tokens.filter((token) =>
      selectedUnequippedTraits.includes(token.id)
    );
    const traitIds = traits.map((trait) => trait.id);
    // iterate through traits and get "Value" from attributes
    const slots = traits.map((trait) => {
      const type = trait.attributes.find(
        (attr: any) => attr.trait_type === 'Type'
      );
      if (type.value === 'Background') return 0;
      if (type.value === 'Suit') return 1;
      if (type.value === 'Helmet') return 2;
      if (type.value === 'Powercore') return 3;
      if (type.value === 'Decal') return 4;
      if (type.value === 'Performance') return 5;
      if (type.value === 'Industry') return 6;
      return 1;
    });

    // iterate through equippedTraits and update the slot with the traitId
    slots.forEach((slot, index) => {
      // update equippedTraits with the traitId
      equippedTraits[slot] = BigInt(traitIds[index]);
    });

    // convert each equippedTrait to its token image.
    // if the trait is a background, we need to get the first token in the tokens array
    const urls = equippedTraits.map((trait) => {
      const token = tokens.find((token) => token.id === Number(trait));
      return token?.image;
    });

    try {
      // combine the images and upload to irys
      const walletClient = primaryWallet.getWalletClient();

      const tokenURI = await getTokenURIFromImages(urls);

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
        await publicClient?.waitForTransactionReceipt({ hash });

        const tokenData = await getToken(tokenURI);
        setImage(tokenData.image);
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
            {equippedTraits
              .filter((trait) => trait !== BigInt(0))
              .map((trait) => (
                <Token
                  key={trait}
                  token={tokens.find((token) => token.id === Number(trait))}
                />
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

  console.log('tokens', tokens);

  return (
    <div className="flex flex-col gap-6 max-w-sm w-full relative">
      <div>
        <button
          disabled={tokens.length < 4}
          className="bg-white text-black rounded px-2 py-1 disabled:opacity-50"
          onClick={handleMint}
        >
          {isMinting ? 'Minting ...' : 'Mint Solar Seeker'}
        </button>
      </div>

      {tokens.slice(0, 4).map((token) => (
        <img key={token.id} src={token.image} className="absolute mt-10" />
      ))}

      {tokens.length === 0 && <p>No tokens found</p>}
    </div>
  );
};

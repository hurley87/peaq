'use client';
import { getTokensOfOwner } from '@/lib/tokens';
import { useEffect, useState } from 'react';
import { useAccount } from '@particle-network/connectkit';
import { Token } from './token';

export const Tokens = () => {
  const { address } = useAccount();
  const [tokenIds, setTokenIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!address) return;
      const tokenIds = (await getTokensOfOwner(address)) as number[];
      setTokenIds(tokenIds);
    };

    if (address) fetchData();
  }, [address]);

  if (!address) {
    return null;
  }

  console.log('Token IDs: ', tokenIds);

  return (
    <div className="grid grid-cols-2 gap-4">
      {tokenIds.map((tokenId) => (
        <Token key={tokenId} tokenId={tokenId} showActions={true} />
      ))}
    </div>
  );
};

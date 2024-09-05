'use client';
import { getToken, getUri } from '@/lib/tokens';
import { useEffect, useState } from 'react';

export const Token = ({
  tokenId,
}: {
  tokenId: number;
  showActions?: boolean;
}) => {
  const [token, setToken] = useState<any>({});

  useEffect(() => {
    const fetchToken = async () => {
      const uri = (await getUri(tokenId)) as string;
      const token = await getToken(uri);
      setToken(token);
    };
    fetchToken();
  }, [tokenId]);

  if (!token.image) return null;

  return (
    <div className="flex flex-col w-full gap-6">
      <p>{token.name}</p>
      <img src={token.image} alt={token.name} className="w-1/2 h-auto" />
      <p>{token.description}</p>
    </div>
  );
};

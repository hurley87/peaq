import React from 'react';
import { Token } from './token';
import { TokenData } from '@/lib/tokenHelpers';

interface EquippedTraitsProps {
  equippedTraits: bigint[];
  tokens: TokenData[];
}

export const EquippedTraits: React.FC<EquippedTraitsProps> = ({
  equippedTraits,
  tokens,
}) => {
  return (
    <div>
      <h2>Equipped Traits</h2>
      <div className="flex gap-2">
        {equippedTraits.slice(0, 4).map((traitId) => {
          const token = tokens.find((t) => t.id === Number(traitId));
          return token ? <Token key={token.id} token={token} /> : null;
        })}
      </div>
    </div>
  );
};

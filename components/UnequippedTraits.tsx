import React from 'react';
import { Token } from './token';
import { TokenData } from '@/lib/tokenHelpers';

interface UnequippedTraitsProps {
  tokens: TokenData[];
  equippedTraits: bigint[];
  selectedTraits: number[];
  onToggleSelection: (traitId: number) => void;
}

export const UnequippedTraits: React.FC<UnequippedTraitsProps> = ({
  tokens,
  equippedTraits,
  selectedTraits,
  onToggleSelection,
}) => {
  const unequippedTraits = tokens.filter(
    (token) => !equippedTraits.map((trait) => Number(trait)).includes(token.id)
  );

  return (
    <div>
      <h2>Unequipped Traits</h2>
      <div className="flex gap-2">
        {unequippedTraits.map((token) => (
          <div key={token.id} onClick={() => onToggleSelection(token.id)}>
            <Token
              token={token}
              selected={selectedTraits.includes(token.id)}
              cursor={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

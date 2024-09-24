'use client';
import { useAccount, useSwitchChain } from '@particle-network/connectkit';

export default function CheckChain() {
  const { chainId } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  if (!chainId || chainId === 3338) return null;

  const switchChain = async () => {
    try {
      await switchChainAsync({ chainId: 3338 });
    } catch {}
  };

  return (
    <span className="bg-red-500 w-full p-2 text-white text-center flex gap-2 items-center justify-center">
      <span>You are on the wrong chain. Please switch to Agung Testnet.</span>
      <button
        className="bg-white text-black p-1 text-sm rounded-md"
        onClick={switchChain}
      >
        Switch Chain
      </button>
    </span>
  );
}

import { defineChain } from '@particle-network/connectkit/chains';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;

const chain = defineChain({
  id: 9990,
  name: 'Agung',
  nativeCurrency: {
    decimals: 18,
    name: 'AGNG',
    symbol: 'AGNG',
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
  },
});

export default chain;

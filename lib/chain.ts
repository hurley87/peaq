import { defineChain } from 'viem';

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL as string;

// const chain = defineChain({
//   id: 9990,
//   name: 'Agung',
//   nativeCurrency: {
//     decimals: 18,
//     name: 'AGNG',
//     symbol: 'AGNG',
//   },
//   rpcUrls: {
//     default: {
//       http: [RPC_URL],
//     },
//   },
// });

const chain = defineChain({
  id: 3338,
  name: 'Peaq',
  nativeCurrency: {
    decimals: 18,
    name: 'PEAQ',
    symbol: 'PEAQ',
  },
  rpcUrls: {
    default: {
      http: [RPC_URL],
    },
  },
});

export default chain;

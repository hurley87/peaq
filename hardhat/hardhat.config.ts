import '@nomicfoundation/hardhat-toolbox';

require('dotenv').config();

const config = {
  solidity: {
    version: '0.8.24',
  },
  networks: {
    // for mainnet
    'base-mainnet': {
      url: 'https://mainnet.base.org',
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 1000000000,
    },
    // for testnet
    'base-sepolia': {
      url: 'https://sepolia.base.org',
      accounts: [process.env.WALLET_KEY as string],
      gasPrice: 1000000000,
    },
    agung: {
      url: process.env.AGUNG_RPC_URL,
      chainId: 9990,
      accounts: [process.env.WALLET_KEY as string], // Make sure to add 0x prefix to the private key
    },
    peaq: {
      url: process.env.PEAQ_RPC_URL,
      chainId: 3338,
      accounts: [process.env.WALLET_KEY as string], // Make sure to add 0x prefix to the private key
    },
  },
  etherscan: {
    apiKey: {
      // 'base-sepolia': process.env.ETHERSCAN_KEY as string,
      // 'base-mainnet': process.env.ETHERSCAN_KEY as string,
      // agung: process.env.SUBSCAN_KEY,
      peaq: process.env.SUBSCAN_KEY,
    },
    customChains: [
      {
        network: 'base-mainnet',
        chainId: 8453,
        urls: {
          apiURL: 'https://api.basescan.org/api',
          browserURL: 'https://basescan.org',
        },
      },
      {
        network: 'base-sepolia',
        chainId: 84532,
        urls: {
          apiURL: 'https://api-sepolia.basescan.org/api',
          browserURL: 'https://sepolia.basescan.org',
        },
      },
      {
        network: 'agung',
        chainId: 9990,
        urls: {
          apiURL: 'https://peaq-testnet.api.subscan.io',
          browserURL: 'https://agung-testnet.subscan.io',
        },
      },
    ],
  },
  defaultNetwork: 'hardhat',
};

export default config;

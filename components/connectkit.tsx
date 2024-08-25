'use client';

import { ConnectKitProvider, createConfig } from '@particle-network/connectkit';
import { baseSepolia } from '@particle-network/connectkit/chains';
import { evmWalletConnectors } from '@particle-network/connectkit/evm';
import { wallet, EntryPosition } from '@particle-network/connectkit/wallet';
import React from 'react';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID as string;
const clientKey = process.env.NEXT_PUBLIC_CLIENT_KEY as string;
const appId = process.env.NEXT_PUBLIC_APP_ID as string;
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string;

if (!projectId || !clientKey || !appId) {
    throw new Error('Please configure the Particle project in .env first!');
}

const config = createConfig({
    projectId,
    clientKey,
    appId,
    appearance: {
        recommendedWallets: [
            { walletId: 'metaMask', label: 'Recommended' },
            { walletId: 'coinbaseWallet', label: 'popular' },
        ],
        connectorsOrder: ['wallet'],
        language: 'en-US',
        mode: 'dark',
        theme: {
            '--pcm-accent-color': '#ff4d4f',
            // ... other options
        },
        logo: 'https://peaqonauts.vercel.app/favicon.ico',
    },
    walletConnectors: [
        evmWalletConnectors({
            metadata: { name: 'My App', icon: '', description: '', url: '' },
            walletConnectProjectId,
        }),
    ],
    plugins: [
        wallet({
            entryPosition: EntryPosition.BR,
            visible: false,
        }),
    ],
    chains: [baseSepolia],
});

export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
    return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};

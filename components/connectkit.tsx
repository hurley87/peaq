'use client';

import { ConnectKitProvider, createConfig } from '@particle-network/connectkit';
import { baseSepolia } from '@particle-network/connectkit/chains';
import { evmWalletConnectors } from '@particle-network/connectkit/evm';
import { wallet, EntryPosition } from '@particle-network/connectkit/wallet';
import React from 'react';

//Retrived from https://dashboard.particle.network
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
        // Optional, collection of properties to alter the appearance of the connection modal
        // Optional, label and sort wallets (to be shown in the connection modal)
        recommendedWallets: [
            { walletId: 'metaMask', label: 'Recommended' },
            { walletId: 'coinbaseWallet', label: 'popular' },
        ],
        splitEmailAndPhone: false, // Optional, displays Email and phone number entry separately
        collapseWalletList: false, // Optional, hide wallet list behind a button
        hideContinueButton: false, // Optional, remove "Continue" button underneath Email or phone number entry
        connectorsOrder: ['wallet'], //  Optional, sort connection methods (index 0 will be placed at the top)
        language: 'en-US', // Optional, also supported ja-JP, zh-CN, zh-TW, and ko-KR
        mode: 'light', // Optional, changes theme between light, dark, or auto (which will change it based on system settings)
        theme: {
            '--pcm-accent-color': '#ff4d4f',
            // ... other options
        },
        logo: 'https://...',
        filterCountryCallingCode: (countries) => {
            // Optional, whitelist or blacklist phone numbers from specific countries
            return countries.filter((item) => item === 'US');
        },
    },
    walletConnectors: [
        evmWalletConnectors({
            metadata: { name: 'My App', icon: '', description: '', url: '' }, // Optional, this is Metadata used by WalletConnect and Coinbase
            walletConnectProjectId, // optional, retrieved from https://cloud.walletconnect.com
        }),
    ],
    plugins: [
        wallet({
            // Optional configurations for the attached embedded wallet modal
            entryPosition: EntryPosition.BR, // Alters the position in which the modal button appears upon login
            visible: true, // Dictates whether or not the wallet modal is included/visible or not
        }),
    ],
    chains: [baseSepolia],
});

// Export ConnectKitProvider to be used within your index or layout file (or use createConfig directly within those files).
export const ParticleConnectkit = ({ children }: React.PropsWithChildren) => {
    return <ConnectKitProvider config={config}>{children}</ConnectKitProvider>;
};

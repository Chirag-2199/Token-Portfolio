// src/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';

export const config = getDefaultConfig({
    appName: 'Token Portfolio',
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
    chains: [mainnet, polygon, optimism, arbitrum, base],
    ssr: false,
});
// src/components/WalletConnect.tsx
import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../wagmi'; // adjust if needed

const queryClient = new QueryClient();

const WalletConnect: React.FC = () => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider
                    theme={darkTheme({
                        accentColor: '#84cc16', // lime-500
                        accentColorForeground: '#000000', // black text
                        borderRadius: 'large',
                        overlayBlur: 'small',
                    })}
                >
                    <div className="flex items-center justify-end">
                        <ConnectButton />
                    </div>
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};

export default WalletConnect;

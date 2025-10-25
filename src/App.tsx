// src/App.tsx
import { Provider } from 'react-redux';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { store } from './store/store';
import { config } from './wagmi';
import Portfolio from './components/Portfolio';
import WalletConnect from './components/WalletConnect';
import '@rainbow-me/rainbowkit/styles.css';

const queryClient = new QueryClient();

function App() {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Provider store={store}>
            {/* Dark Theme Wrapper */}
            <div className="min-h-screen w-full  text-gray-100" style={{ backgroundColor: 'hsla(240, 8%, 14%, 1)' }}>

              {/* Header */}
              <header className="w-full" style={{ backgroundColor: 'hsla(240, 8%, 14%, 1)' }}>
                <div className="w-full py-4 flex justify-between items-center px-2 md:px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-700 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: 'hsla(240, 8%, 14%, 1)' }}></div>
                    </div>

                    <h1 className="text-xl font-bold text-white">Token Portfolio</h1>
                  </div>
                  <WalletConnect />
                </div>
              </header>

              {/* Main Content */}
              <main className="w-full">
                <Portfolio />
              </main>
            </div>
          </Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;

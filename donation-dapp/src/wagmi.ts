import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  arbitrum,
  base,
  baseSepolia,
  mainnet,
  optimism,
  polygon,
  sepolia,
} from 'wagmi/chains';

// Create a custom Sepolia chain configuration
const customSepolia = {
  ...sepolia, // Copy all properties from the default sepolia config
  rpcUrls: {
    ...sepolia.rpcUrls,
    default: {
      http: [`https://eth-sepolia.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_API_KEY}`],
    },
  },
};

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    polygon,
    optimism,
    arbitrum,
    base,
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [customSepolia, baseSepolia] : []),
  ],
  ssr: true,
});

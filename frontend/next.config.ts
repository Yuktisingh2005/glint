import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    // Example: Adding custom Webpack settings
    if (!isServer) {
      config.watchOptions = {
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
};

export default nextConfig;

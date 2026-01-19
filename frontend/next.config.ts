import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.watchOptions = {
        ignored: ['**/node_modules'],
      };
    }
    return config;
  },
};

export default nextConfig;

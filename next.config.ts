import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '6000-firebase-studio-1751707908116.cluster-c23mj7ubf5fxwq6nrbev4ugaxa.cloudworkstations.dev',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '6000-firebase-studio-1751707908116.cluster-c23mj7ubf5fxwq6nrbev4ugaxa.cloudworkstations.dev',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;

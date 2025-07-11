import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '6000-firebase-studio-1751707908116.cluster-c23mj7ubf5fxwq6nrbev4ugaxa.cloudworkstations.dev'
      }
    ],
  },  
  allowedDevOrigins: [
    'https://6000-firebase-studio-1751707908116.cluster-c23mj7ubf5fxwq6nrbev4ugaxa.cloudworkstations.dev',
  ],
};

export default nextConfig;

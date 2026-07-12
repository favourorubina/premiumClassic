import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'scontent.whatsapp.net' },
      { protocol: 'https', hostname: 'scontent.xx.fbcdn.net' },
    ],
  },
};

export default nextConfig;

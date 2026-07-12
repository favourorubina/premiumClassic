import type { MetadataRoute } from 'next';
import { siteDescription, siteName } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteName,
    short_name: 'Premium Classic',
    description: siteDescription,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#fff9ef',
    theme_color: '#130f0b',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/logo.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
  };
}

export const siteName = 'Premium Classic Pastries';

export const siteDescription =
  'Premium Classic Pastries makes fresh cake parfaits, banana breads, pancakes, pastries, shawarma, drinks and dessert gift boxes for WhatsApp orders.';

function normalizeSiteUrl(value?: string) {
  const fallback = 'http://localhost:3000';
  const rawValue = value?.trim() || fallback;
  const withProtocol = /^https?:\/\//i.test(rawValue) ? rawValue : `https://${rawValue}`;

  return withProtocol.replace(/\/+$/, '');
}

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL,
);

export function absoluteUrl(path = '/') {
  return new URL(path, `${siteUrl}/`).toString();
}

export const publicRoutes = [
  {
    path: '/',
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    path: '/menu',
    changeFrequency: 'daily',
    priority: 0.9,
  },
  {
    path: '/about',
    changeFrequency: 'monthly',
    priority: 0.7,
  },
] as const;

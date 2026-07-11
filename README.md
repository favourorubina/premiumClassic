# Premium Classic

Next.js menu and ordering site for Premium Classic Pastries.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Fill `.env` with Firebase Admin, Cloudinary, admin password, and exchange-rate values.

For local Firebase Admin, keep the downloaded service-account JSON in `.secrets/` and set `FIREBASE_SERVICE_ACCOUNT_PATH`.

For Vercel, do not upload `.secrets/`. Add `FIREBASE_SERVICE_ACCOUNT_JSON` as a protected environment variable instead. Its value can be either the raw service-account JSON or the base64-encoded JSON. Also add the other runtime values such as `ADMIN_PASSWORD`, Cloudinary keys, and exchange-rate settings in Vercel Project Settings -> Environment Variables.

3. Start development:

```bash
npm run dev
```

The admin dashboard is available at `/bima/admin`.

## Firestore Data

Menu items live in the Firestore `menuItems` collection. Site currency settings live in `siteSettings/currency`.

To import the Neon/Prisma export into Firestore:

```bash
npm run firebase:import-menu
```

By default the importer uses `../MenuItem.json` when it exists, then falls back to `data/menu-items.json`. You can pass an explicit file too:

```bash
npm run firebase:import-menu -- "C:\Users\Ifeanyi\Desktop\Program\premiumcLASSIC\MenuItem.json"
```

The menu import preserves document IDs, prices, Cloudinary image URLs, and timestamps. It also creates a default `siteSettings/currency` document when one does not already exist.

## Currency

Prices are stored as NGN base values. Admin can switch display between NGN and GBP in `/bima/admin`.

GBP conversion uses ExchangeRate-API first when `EXCHANGE_RATE_API_KEY` is configured, with Frankfurter as a fallback. The app refreshes the NGN-to-GBP rate when GBP is enabled and the saved rate is at least one week old.

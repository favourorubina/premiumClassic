import type { FieldValue, Timestamp } from 'firebase-admin/firestore';
import {
  CurrencyCode,
  CurrencySettings,
  DEFAULT_CURRENCY_SETTINGS,
  RateProvider,
  isCurrencyCode,
} from '@/lib/currency-format';
import { getFirebaseDb } from '@/lib/firebase-admin';

const SETTINGS_COLLECTION = 'siteSettings';
const CURRENCY_DOC = 'currency';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type FirestoreCurrencySettings = {
  activeCurrency?: CurrencyCode;
  ngnToGbpRate?: number | null;
  rateFetchedAt?: Timestamp | string | Date | FieldValue | null;
  rateProvider?: RateProvider | null;
  updatedAt?: Timestamp | string | Date | FieldValue | null;
};

type RateResult = {
  rate: number;
  provider: RateProvider;
};

function fromFirestoreDate(value: FirestoreCurrencySettings['updatedAt']) {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return value.toDate();
  }
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  return null;
}

function serializeDate(value: FirestoreCurrencySettings['updatedAt']) {
  return fromFirestoreDate(value)?.toISOString() ?? null;
}

function normalizeSettings(data?: FirestoreCurrencySettings | null): CurrencySettings {
  return {
    activeCurrency: isCurrencyCode(data?.activeCurrency)
      ? data.activeCurrency
      : DEFAULT_CURRENCY_SETTINGS.activeCurrency,
    ngnToGbpRate: Number(data?.ngnToGbpRate) > 0 ? Number(data?.ngnToGbpRate) : null,
    rateFetchedAt: serializeDate(data?.rateFetchedAt),
    rateProvider: data?.rateProvider || null,
    updatedAt: serializeDate(data?.updatedAt),
  };
}

function isRateStale(settings: CurrencySettings) {
  if (!settings.ngnToGbpRate || !settings.rateFetchedAt) return true;

  const fetchedAt = new Date(settings.rateFetchedAt).getTime();
  if (Number.isNaN(fetchedAt)) return true;

  return Date.now() - fetchedAt >= ONE_WEEK_MS;
}

async function fetchFromExchangeRateApi(): Promise<RateResult> {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('EXCHANGE_RATE_API_KEY is not configured.');
  }

  const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/pair/NGN/GBP`, {
    cache: 'no-store',
  });
  const data = await response.json();

  if (!response.ok || data.result !== 'success' || Number(data.conversion_rate) <= 0) {
    throw new Error(data['error-type'] || 'ExchangeRate-API request failed.');
  }

  return { rate: Number(data.conversion_rate), provider: 'exchangerate-api' };
}

async function fetchFromFrankfurter(): Promise<RateResult> {
  const response = await fetch('https://api.frankfurter.dev/v2/rate/NGN/GBP', {
    cache: 'no-store',
  });
  const data = await response.json();

  if (!response.ok || Number(data.rate) <= 0) {
    throw new Error(data.message || 'Frankfurter request failed.');
  }

  return { rate: Number(data.rate), provider: 'frankfurter' };
}

async function fetchNgnToGbpRate(): Promise<RateResult> {
  const preferred = process.env.EXCHANGE_RATE_PROVIDER?.trim();
  const providers =
    preferred === 'frankfurter'
      ? [fetchFromFrankfurter, fetchFromExchangeRateApi]
      : [fetchFromExchangeRateApi, fetchFromFrankfurter];
  const errors: string[] = [];

  for (const fetchProvider of providers) {
    try {
      return await fetchProvider();
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown exchange-rate error.');
    }
  }

  throw new Error(errors.join(' '));
}

async function readCurrencySettings() {
  const db = getFirebaseDb();
  if (!db) return DEFAULT_CURRENCY_SETTINGS;

  const snapshot = await db.collection(SETTINGS_COLLECTION).doc(CURRENCY_DOC).get();
  return normalizeSettings(snapshot.exists ? snapshot.data() : null);
}

async function persistSettings(settings: CurrencySettings) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase is not configured. Add credentials to .env.local first.');
  }

  const now = new Date();
  await db
    .collection(SETTINGS_COLLECTION)
    .doc(CURRENCY_DOC)
    .set(
      {
        activeCurrency: settings.activeCurrency,
        ngnToGbpRate: settings.ngnToGbpRate,
        rateFetchedAt: settings.rateFetchedAt ? new Date(settings.rateFetchedAt) : null,
        rateProvider: settings.rateProvider,
        updatedAt: now,
      },
      { merge: true },
    );

  return { ...settings, updatedAt: now.toISOString() };
}

async function refreshRate(settings: CurrencySettings) {
  const result = await fetchNgnToGbpRate();
  return persistSettings({
    ...settings,
    ngnToGbpRate: result.rate,
    rateFetchedAt: new Date().toISOString(),
    rateProvider: result.provider,
  });
}

export async function getCurrencySettings(options?: { refreshIfStale?: boolean }) {
  const settings = await readCurrencySettings();

  if (
    options?.refreshIfStale &&
    settings.activeCurrency === 'GBP' &&
    isRateStale(settings) &&
    getFirebaseDb()
  ) {
    try {
      return await refreshRate(settings);
    } catch {
      return settings;
    }
  }

  return settings;
}

export async function updateCurrencySettings(options: {
  activeCurrency: CurrencyCode;
  refreshRate?: boolean;
  ngnToGbpRate?: number;
}) {
  if (!isCurrencyCode(options.activeCurrency)) {
    throw new Error('Unsupported currency.');
  }

  const current = await readCurrencySettings();
  const next: CurrencySettings = {
    ...current,
    activeCurrency: options.activeCurrency,
  };

  if (options.activeCurrency === 'GBP' && options.ngnToGbpRate !== undefined) {
    if (!Number.isFinite(options.ngnToGbpRate) || options.ngnToGbpRate <= 0) {
      throw new Error('Enter a valid GBP exchange rate.');
    }

    return persistSettings({
      ...next,
      ngnToGbpRate: options.ngnToGbpRate,
      rateFetchedAt: new Date().toISOString(),
      rateProvider: 'manual',
    });
  }

  if (options.activeCurrency === 'GBP' && (options.refreshRate || isRateStale(next))) {
    return refreshRate(next);
  }

  return persistSettings(next);
}

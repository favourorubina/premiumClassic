export type CurrencyCode = 'NGN' | 'GBP';

export type RateProvider = 'exchangerate-api' | 'frankfurter' | 'manual';

export type CurrencySettings = {
  activeCurrency: CurrencyCode;
  ngnToGbpRate: number | null;
  rateFetchedAt: string | null;
  rateProvider: RateProvider | null;
  updatedAt: string | null;
};

export const DEFAULT_CURRENCY_SETTINGS: CurrencySettings = {
  activeCurrency: 'NGN',
  ngnToGbpRate: null,
  rateFetchedAt: null,
  rateProvider: null,
  updatedAt: null,
};

export function isCurrencyCode(value: unknown): value is CurrencyCode {
  return value === 'NGN' || value === 'GBP';
}

export function getDisplayCurrency(settings: CurrencySettings) {
  return settings.activeCurrency === 'GBP' && Number(settings.ngnToGbpRate) > 0
    ? 'GBP'
    : 'NGN';
}

export function convertFromNaira(amount: number, settings: CurrencySettings) {
  if (getDisplayCurrency(settings) !== 'GBP') return amount;
  return amount * Number(settings.ngnToGbpRate);
}

export function formatMoneyFromNaira(amount: number, settings: CurrencySettings) {
  const currency = getDisplayCurrency(settings);
  const value = convertFromNaira(Number(amount) || 0, settings);

  return new Intl.NumberFormat(currency === 'GBP' ? 'en-GB' : 'en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: currency === 'GBP' ? 2 : 0,
    maximumFractionDigits: currency === 'GBP' ? 2 : 0,
  }).format(value);
}

export function formatRateLabel(settings: CurrencySettings) {
  if (!settings.ngnToGbpRate) return 'No GBP rate saved yet';

  return `1 NGN = ${Number(settings.ngnToGbpRate).toFixed(6)} GBP`;
}


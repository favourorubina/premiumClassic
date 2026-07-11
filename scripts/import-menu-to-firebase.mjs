import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const root = process.cwd();
const envPaths = [path.join(root, '.env'), path.join(root, '.env.local')];
const defaultDataPath = path.join(root, 'data', 'menu-items.json');
const parentExportPath = path.join(root, '..', 'MenuItem.json');

function resolveDataPath() {
  if (process.argv[2]) {
    return path.resolve(root, process.argv[2]);
  }

  if (fs.existsSync(parentExportPath)) return parentExportPath;
  return defaultDataPath;
}

function loadEnvFile() {
  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;
    const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separator = trimmed.indexOf('=');
      if (separator === -1) continue;

      const key = trimmed.slice(0, separator).trim();
      let value = trimmed.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      process.env[key] ||= value;
    }
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.startsWith('your-') || value.includes('PASTE_')) {
    throw new Error(`Missing ${name}. Fill it in .env.local first.`);
  }
  return value;
}

function isRealValue(value) {
  return Boolean(value && !value.startsWith('your-') && !value.includes('PASTE_'));
}

function resolveConfigPath(value) {
  return path.isAbsolute(value) ? value : path.join(root, value);
}

function normalizeAccount(account, source) {
  const projectId = account.project_id || account.projectId;
  const clientEmail = account.client_email || account.clientEmail;
  const privateKey = account.private_key || account.privateKey;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(`${source} is missing project_id, client_email, or private_key.`);
  }

  return { projectId, clientEmail, privateKey };
}

function getServiceAccountConfig() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (isRealValue(json)) {
    const value = json.trim();
    const decoded = value.startsWith('{') ? value : Buffer.from(value, 'base64').toString('utf8');
    return normalizeAccount(JSON.parse(decoded), 'FIREBASE_SERVICE_ACCOUNT_JSON');
  }

  const configPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  if (isRealValue(configPath)) {
    const resolvedPath = resolveConfigPath(configPath);
    const account = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
    return normalizeAccount(account, resolvedPath);
  }

  return {
    projectId: requireEnv('FIREBASE_PROJECT_ID'),
    clientEmail: requireEnv('FIREBASE_CLIENT_EMAIL'),
    privateKey: requireEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  };
}

loadEnvFile();

const { projectId, clientEmail, privateKey } = getServiceAccountConfig();

const app =
  getApps()[0] ||
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

const db = getFirestore(app);
const dataPath = resolveDataPath();
const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (!Array.isArray(items)) {
  throw new Error(`${dataPath} must contain an array of menu rows.`);
}

const collection = db.collection('menuItems');

function toDate(value) {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function normalizePrices(value) {
  const prices = typeof value === 'string' ? JSON.parse(value) : value;
  if (!Array.isArray(prices)) return [];

  return prices.map(price => ({
    label: String(price?.label || 'Price').trim(),
    amount: Number(price?.amount) || 0,
  }));
}

function normalizeItem(item) {
  if (!item || typeof item !== 'object') {
    throw new Error('Every menu item must be an object.');
  }

  const pricesJson = normalizePrices(item.pricesJson);

  return {
    id: String(item.id || randomUUID()),
    name: String(item.name || 'Untitled item').trim(),
    category: String(item.category || 'Others').trim(),
    imageUrl: String(item.imageUrl || '').trim(),
    description: item.description ? String(item.description).trim() : null,
    pricesJson,
    createdAt: toDate(item.createdAt),
    updatedAt: toDate(item.updatedAt),
  };
}

for (let index = 0; index < items.length; index += 450) {
  const batch = db.batch();
  const chunk = items.slice(index, index + 450).map(normalizeItem);

  for (const item of chunk) {
    const doc = collection.doc(item.id);
    batch.set(doc, {
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description,
      pricesJson: item.pricesJson,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  }

  await batch.commit();
}

const currencyRef = db.collection('siteSettings').doc('currency');
const currencySnapshot = await currencyRef.get();

if (!currencySnapshot.exists) {
  await currencyRef.set({
    activeCurrency: 'NGN',
    ngnToGbpRate: null,
    rateFetchedAt: null,
    rateProvider: null,
    updatedAt: new Date(),
  });
}

console.log(`Imported ${items.length} menu items from ${dataPath} to Firestore collection "menuItems".`);

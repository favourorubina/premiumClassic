import fs from 'node:fs';
import path from 'node:path';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const root = process.cwd();
const envPath = path.join(root, '.env.local');
const dataPath = path.join(root, 'data', 'menu-items.json');

function loadEnvFile() {
  if (!fs.existsSync(envPath)) return;
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

function requireEnv(name) {
  const value = process.env[name];
  if (!value || value.startsWith('your-') || value.includes('PASTE_')) {
    throw new Error(`Missing ${name}. Fill it in .env.local first.`);
  }
  return value;
}

loadEnvFile();

const projectId = requireEnv('FIREBASE_PROJECT_ID');
const clientEmail = requireEnv('FIREBASE_CLIENT_EMAIL');
const privateKey = requireEnv('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n');

const app =
  getApps()[0] ||
  initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });

const db = getFirestore(app);
const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

if (!Array.isArray(items)) {
  throw new Error('data/menu-items.json must contain an array.');
}

const batch = db.batch();
const collection = db.collection('menuItems');

for (const item of items) {
  const doc = collection.doc(item.id);
  batch.set(doc, {
    name: String(item.name || '').trim(),
    category: String(item.category || 'Others').trim(),
    imageUrl: item.imageUrl || '',
    description: item.description || null,
    pricesJson: Array.isArray(item.pricesJson) ? item.pricesJson : [],
    createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
    updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
  });
}

await batch.commit();

console.log(`Imported ${items.length} menu items to Firestore collection "menuItems".`);

import fs from 'node:fs';
import path from 'node:path';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

type ServiceAccountConfig = {
  projectId: string;
  clientEmail: string;
  privateKey: string;
};

type ServiceAccountJson = {
  project_id?: string;
  client_email?: string;
  private_key?: string;
  projectId?: string;
  clientEmail?: string;
  privateKey?: string;
};

function getPrivateKey() {
  return process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
}

function isRealValue(value: string | undefined): value is string {
  return Boolean(value && !value.startsWith('your-') && !value.includes('PASTE_'));
}

function resolveConfigPath(value: string) {
  return path.join(/*turbopackIgnore: true*/ process.cwd(), '.secrets', path.basename(value));
}

function normalizeAccount(account: ServiceAccountJson): ServiceAccountConfig | null {
  const projectId = account.project_id || account.projectId;
  const clientEmail = account.client_email || account.clientEmail;
  const privateKey = account.private_key || account.privateKey;

  if (!projectId || !clientEmail || !privateKey) return null;

  return { projectId, clientEmail, privateKey };
}

function getConfigFromJsonEnv(): ServiceAccountConfig | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!isRealValue(json)) return null;

  const value = json.trim();
  const decoded = value.startsWith('{') ? value : Buffer.from(value, 'base64').toString('utf8');
  return normalizeAccount(JSON.parse(decoded) as ServiceAccountJson);
}

function getConfigFromFile(): ServiceAccountConfig | null {
  const configPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (!isRealValue(configPath)) return null;

  const resolvedPath = resolveConfigPath(configPath);
  if (!fs.existsSync(resolvedPath)) return null;

  const account = JSON.parse(fs.readFileSync(resolvedPath, 'utf8')) as ServiceAccountJson;
  return normalizeAccount(account);
}

function getConfigFromEnv(): ServiceAccountConfig | null {
  if (
    !isRealValue(process.env.FIREBASE_PROJECT_ID) ||
    !isRealValue(process.env.FIREBASE_CLIENT_EMAIL) ||
    !isRealValue(process.env.FIREBASE_PRIVATE_KEY)
  ) {
    return null;
  }

  return {
    projectId: process.env.FIREBASE_PROJECT_ID as string,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
    privateKey: getPrivateKey() as string,
  };
}

function getFirebaseConfig() {
  return getConfigFromJsonEnv() || getConfigFromFile() || getConfigFromEnv();
}

export function getFirebaseDb() {
  const config = getFirebaseConfig();
  if (!config) return null;

  const app =
    getApps()[0] ||
    initializeApp({
      credential: cert({
        projectId: config.projectId,
        clientEmail: config.clientEmail,
        privateKey: config.privateKey,
      }),
    });

  return getFirestore(app);
}

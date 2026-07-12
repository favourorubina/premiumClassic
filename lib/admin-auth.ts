import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import type { NextRequest, NextResponse } from 'next/server';
import { getFirebaseDb } from '@/lib/firebase-admin';

const scrypt = promisify(scryptCallback);
const SETTINGS_COLLECTION = 'siteSettings';
const AUTH_DOCUMENT = 'adminAuth';
const SESSION_COOKIE = 'pc_admin';
const SESSION_TTL_SECONDS = 12 * 60 * 60;

type StoredCredential = {
  passwordHash?: string;
  passwordSalt?: string;
  version?: number;
};

type SessionPayload = {
  version: number;
  expiresAt: number;
};

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim();
  if (!secret) throw new Error('ADMIN_PASSWORD is not configured.');
  return secret;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

async function readStoredCredential(): Promise<StoredCredential | null> {
  const db = getFirebaseDb();
  if (!db) return null;

  const snapshot = await db.collection(SETTINGS_COLLECTION).doc(AUTH_DOCUMENT).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as StoredCredential;
}

async function hashPassword(password: string, salt: string) {
  const result = (await scrypt(password, salt, 64)) as Buffer;
  return result.toString('hex');
}

export async function verifyAdminPassword(password: string) {
  const stored = await readStoredCredential();

  if (stored?.passwordHash && stored.passwordSalt) {
    const candidate = await hashPassword(password, stored.passwordSalt);
    return safeEqual(candidate, stored.passwordHash);
  }

  const initialPassword = process.env.ADMIN_PASSWORD || '';
  return Boolean(initialPassword) && safeEqual(password, initialPassword);
}

export async function getCredentialVersion() {
  const stored = await readStoredCredential();
  return Number.isInteger(stored?.version) ? Number(stored?.version) : 0;
}

export async function changeAdminPassword(currentPassword: string, nextPassword: string) {
  if (!(await verifyAdminPassword(currentPassword))) {
    throw new Error('The current password is incorrect.');
  }

  if (nextPassword.length < 10) {
    throw new Error('Use at least 10 characters for the new password.');
  }

  if (safeEqual(currentPassword, nextPassword)) {
    throw new Error('Choose a password different from the current one.');
  }

  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase is required to save a changed admin password.');
  }

  const currentVersion = await getCredentialVersion();
  const nextVersion = currentVersion + 1;
  const passwordSalt = randomBytes(24).toString('hex');
  const passwordHash = await hashPassword(nextPassword, passwordSalt);

  await db.collection(SETTINGS_COLLECTION).doc(AUTH_DOCUMENT).set({
    passwordHash,
    passwordSalt,
    version: nextVersion,
    updatedAt: new Date(),
  });

  return nextVersion;
}

function signPayload(encodedPayload: string) {
  return createHmac('sha256', sessionSecret()).update(encodedPayload).digest('base64url');
}

export function createAdminSessionToken(version: number) {
  const payload: SessionPayload = {
    version,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export async function isAdminRequest(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature || !safeEqual(signPayload(encodedPayload), signature)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString()) as SessionPayload;
    if (payload.expiresAt <= Date.now()) return false;
    return payload.version === (await getCredentialVersion());
  } catch {
    return false;
  }
}

export function setAdminSession(response: NextResponse, version: number) {
  response.cookies.set(SESSION_COOKIE, createAdminSessionToken(version), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}

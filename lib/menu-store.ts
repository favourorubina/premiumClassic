import type { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getFirebaseDb } from '@/lib/firebase-admin';
import { MenuItemRecord, normalizeMenuItem, PriceOption, seedMenuItems } from '@/lib/menu-data';

const COLLECTION = 'menuItems';

type MenuPayload = {
  name: string;
  category: string;
  imageUrl: string;
  description?: string | null;
  prices: PriceOption[];
};

type FirestoreMenuItem = {
  name?: string;
  category?: string;
  imageUrl?: string;
  description?: string | null;
  pricesJson?: PriceOption[];
  createdAt?: Timestamp | string | Date | FieldValue;
  updatedAt?: Timestamp | string | Date | FieldValue;
};

function fromFirestoreDate(value: FirestoreMenuItem['createdAt']) {
  if (value && typeof value === 'object' && 'toDate' in value) {
    return value.toDate();
  }
  if (value instanceof Date) return value;
  if (typeof value === 'string') return new Date(value);
  return new Date();
}

function serializeItem(item: MenuItemRecord) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    imageUrl: item.imageUrl,
    description: item.description,
    pricesJson: item.pricesJson,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

function normalizePayload(payload: MenuPayload) {
  return normalizeMenuItem({
    name: payload.name,
    category: payload.category,
    imageUrl: payload.imageUrl,
    description: payload.description || null,
    pricesJson: payload.prices,
  });
}

export function usingFirebaseMenuStore() {
  return Boolean(getFirebaseDb());
}

export async function getMenuItems(): Promise<MenuItemRecord[]> {
  const db = getFirebaseDb();
  if (!db) return seedMenuItems;

  const snapshot = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
  if (snapshot.empty) return seedMenuItems;

  return snapshot.docs.map(doc => {
    const data = doc.data() as FirestoreMenuItem;
    return normalizeMenuItem({
      id: doc.id,
      name: data.name,
      category: data.category,
      imageUrl: data.imageUrl,
      description: data.description,
      pricesJson: data.pricesJson,
      createdAt: fromFirestoreDate(data.createdAt),
      updatedAt: fromFirestoreDate(data.updatedAt),
    });
  });
}

export async function createMenuItem(payload: MenuPayload) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase is not configured. Add credentials to .env.local first.');
  }

  const now = new Date();
  const item = normalizePayload(payload);
  const doc = await db.collection(COLLECTION).add({
    name: item.name,
    category: item.category,
    imageUrl: item.imageUrl,
    description: item.description,
    pricesJson: item.pricesJson,
    createdAt: now,
    updatedAt: now,
  });

  return serializeItem({ ...item, id: doc.id, createdAt: now, updatedAt: now });
}

export async function updateMenuItem(id: string, payload: MenuPayload) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase is not configured. Add credentials to .env.local first.');
  }

  const item = normalizePayload(payload);
  const updatedAt = new Date();

  await db.collection(COLLECTION).doc(id).set(
    {
      name: item.name,
      category: item.category,
      imageUrl: item.imageUrl,
      description: item.description,
      pricesJson: item.pricesJson,
      updatedAt,
    },
    { merge: true },
  );

  return serializeItem({ ...item, id, updatedAt, createdAt: new Date() });
}

export async function deleteMenuItem(id: string) {
  const db = getFirebaseDb();
  if (!db) {
    throw new Error('Firebase is not configured. Add credentials to .env.local first.');
  }

  await db.collection(COLLECTION).doc(id).delete();
}

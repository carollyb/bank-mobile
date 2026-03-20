import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  QueryConstraint,
  QueryDocumentSnapshot,
  setDoc,
  startAfter,
  updateDoc,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { db, storage } from '@/config/firebase';
import { Transaction, TransactionType } from '@/types/transaction.type';

const DEFAULT_CATEGORIES = ['mercado', 'roupas', 'restaurante', 'estudo'];

const getFileExt = (mimeType: string): string => {
  if (mimeType.includes('pdf')) return 'pdf';
  if (mimeType.includes('png')) return 'png';
  if (mimeType.includes('heic') || mimeType.includes('heif')) return 'heic';
  if (mimeType.includes('webp')) return 'webp';
  return 'jpg';
};

type TransactionFilters = {
  category?: string;
  type?: TransactionType;
  fromDate?: string;
  toDate?: string;
};

type PaginatedTransactionsResult = {
  transactions: Transaction[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
};

const matchesFilters = (
  txn: Transaction,
  filters?: TransactionFilters,
): boolean => {
  if (!filters) return true;
  if (filters.type && txn.type !== filters.type) return false;
  if (filters.category && txn.category !== filters.category) return false;
  if (filters.fromDate && txn.date < filters.fromDate) return false;
  if (filters.toDate && txn.date > filters.toDate) return false;
  return true;
};

// ─── Transactions ───────────────────────────────────────────────────────────

export const getUserBalance = async (userId: string): Promise<number> => {
  const docRef = doc(db, 'users', userId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return 0;
  return snapshot.data()?.balance ?? 0;
};

export const saveTransaction = async (
  userId: string,
  transaction: Omit<Transaction, 'id'>,
): Promise<string> => {
  const colRef = collection(db, 'users', userId, 'transactions');
  const userRef = doc(db, 'users', userId);
  const docRef = await addDoc(colRef, {
    ...transaction,
    createdAt: new Date().toISOString(),
  });
  await setDoc(
    userRef,
    { balance: increment(transaction.value) },
    { merge: true },
  );
  return docRef.id;
};

export const updateTransaction = async (
  userId: string,
  transactionId: string,
  data: Partial<Omit<Transaction, 'id'>>,
): Promise<void> => {
  const txnRef = doc(db, 'users', userId, 'transactions', transactionId);
  const userRef = doc(db, 'users', userId);

  if (data.value !== undefined) {
    const oldSnap = await getDoc(txnRef);
    const oldValue: number = oldSnap.data()?.value ?? 0;
    const delta = data.value - oldValue;
    await Promise.all([
      updateDoc(txnRef, { ...data, updatedAt: new Date().toISOString() }),
      setDoc(userRef, { balance: increment(delta) }, { merge: true }),
    ]);
  } else {
    await updateDoc(txnRef, { ...data, updatedAt: new Date().toISOString() });
  }
};

export const getTransactionById = async (
  userId: string,
  transactionId: string,
): Promise<Transaction | null> => {
  const docRef = doc(db, 'users', userId, 'transactions', transactionId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Transaction;
};

export const getUserTransactions = async (
  userId: string,
): Promise<Transaction[]> => {
  const ref = collection(db, 'users', userId, 'transactions');
  const q = query(ref, orderBy('date', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Transaction);
};

export const getUserTransactionsPaginated = async (
  userId: string,
  options?: {
    pageSize?: number;
    cursor?: QueryDocumentSnapshot<DocumentData> | null;
    filters?: TransactionFilters;
  },
): Promise<PaginatedTransactionsResult> => {
  const pageSize = options?.pageSize ?? 20;
  const cursor = options?.cursor ?? null;
  const filters = options?.filters;
  const hasFilters = !!(
    filters?.type ||
    filters?.category ||
    filters?.fromDate ||
    filters?.toDate
  );

  const ref = collection(db, 'users', userId, 'transactions');
  if (!hasFilters) {
    const constraints: QueryConstraint[] = [orderBy('date', 'desc')];
    if (cursor) constraints.push(startAfter(cursor));
    constraints.push(limit(pageSize + 1));

    const snapshot = await getDocs(query(ref, ...constraints));
    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const transactions = pageDocs.map(
      (d) => ({ id: d.id, ...d.data() }) as Transaction,
    );

    return {
      transactions,
      lastVisible: pageDocs.length ? pageDocs[pageDocs.length - 1] : cursor,
      hasMore,
    };
  }

  const chunkSize = Math.max(pageSize * 3, 40);
  let scanCursor = cursor;
  let rawExhausted = false;
  let guard = 0;
  const filtered: Transaction[] = [];

  while (filtered.length < pageSize + 1 && !rawExhausted && guard < 20) {
    const constraints: QueryConstraint[] = [orderBy('date', 'desc')];
    if (scanCursor) constraints.push(startAfter(scanCursor));
    constraints.push(limit(chunkSize));

    const snapshot = await getDocs(query(ref, ...constraints));
    const docs = snapshot.docs;

    if (!docs.length) {
      rawExhausted = true;
      break;
    }

    let consumedDoc: QueryDocumentSnapshot<DocumentData> | null = null;
    for (const d of docs) {
      consumedDoc = d;
      const txn = { id: d.id, ...d.data() } as Transaction;
      if (matchesFilters(txn, filters)) filtered.push(txn);
      if (filtered.length >= pageSize + 1) break;
    }

    if (consumedDoc) scanCursor = consumedDoc;
    if (docs.length < chunkSize) rawExhausted = true;

    guard += 1;
  }

  const hasMore = filtered.length > pageSize || !rawExhausted;
  const transactions = filtered.slice(0, pageSize);

  return {
    transactions,
    lastVisible: scanCursor,
    hasMore,
  };
};

export const deleteTransaction = async (
  userId: string,
  transactionId: string,
): Promise<void> => {
  const txnRef = doc(db, 'users', userId, 'transactions', transactionId);
  const userRef = doc(db, 'users', userId);

  const snap = await getDoc(txnRef);
  if (!snap.exists()) return;

  const oldValue: number = snap.data()?.value ?? 0;
  await Promise.all([
    deleteDoc(txnRef),
    setDoc(userRef, { balance: increment(-oldValue) }, { merge: true }),
  ]);
};

// ─── Categories ─────────────────────────────────────────────────────────────

export const getUserCategories = async (userId: string): Promise<string[]> => {
  const docRef = doc(db, 'users', userId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return DEFAULT_CATEGORIES;
  const data = snapshot.data();
  const custom: string[] = data?.categories ?? [];
  const merged = Array.from(new Set([...DEFAULT_CATEGORIES, ...custom]));
  return merged;
};

export const addUserCategory = async (
  userId: string,
  category: string,
): Promise<void> => {
  const trimmed = category.trim().toLowerCase();
  if (!trimmed) return;
  const docRef = doc(db, 'users', userId);
  const snapshot = await getDoc(docRef);
  const existing: string[] = snapshot.exists()
    ? (snapshot.data()?.categories ?? [])
    : [];
  if (existing.includes(trimmed)) return;
  await setDoc(docRef, { categories: [...existing, trimmed] }, { merge: true });
};

// ─── Storage ─────────────────────────────────────────────────────────────────

export const uploadAttachment = async (
  userId: string,
  fileUri: string,
  mimeType: string,
): Promise<string> => {
  const bucket = storage.app.options.storageBucket;
  if (!bucket) {
    throw new Error(
      'Storage bucket nao configurado. Defina EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET no .env.',
    );
  }

  const ext = getFileExt(mimeType);
  const path = `attachments/${userId}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);

  try {
    const response = await fetch(fileUri);
    if (!response.ok) {
      throw new Error(`Falha ao ler arquivo local (${response.status}).`);
    }

    const blob = await response.blob();
    await uploadBytes(storageRef, blob, { contentType: mimeType });
    return getDownloadURL(storageRef);
  } catch (error) {
    throw new Error(`Upload falhou (${error})`);
  }
};

import { Transaction } from '@/types/transaction.type';

const getTransactionTimestamp = (transaction: Transaction): number => {
  const dateCandidate = transaction.date || transaction.createdAt;
  const timestamp = new Date(dateCandidate).getTime();

  if (Number.isFinite(timestamp)) {
    return timestamp;
  }

  const fallback = new Date(transaction.createdAt).getTime();
  return Number.isFinite(fallback) ? fallback : 0;
};

/**
 * Sorts an array of transactions by date, from oldest to newest
 * @param transactions - Array of transactions to sort
 * @returns Sorted array of transactions (oldest to newest)
 */
export const sortTransactionsByDateAsc = (
  transactions: Transaction[],
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const dateA = getTransactionTimestamp(a);
    const dateB = getTransactionTimestamp(b);
    return dateA - dateB;
  });
};

/**
 * Sorts an array of transactions by date, from newest to oldest
 * @param transactions - Array of transactions to sort
 * @returns Sorted array of transactions (newest to oldest)
 */
export const sortTransactionsByDateDesc = (
  transactions: Transaction[],
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const dateA = getTransactionTimestamp(a);
    const dateB = getTransactionTimestamp(b);
    return dateB - dateA;
  });
};

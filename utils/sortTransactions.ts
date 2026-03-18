import { Transaction } from '@/types/transaction.type';

/**
 * Sorts an array of transactions by date, from oldest to newest
 * @param transactions - Array of transactions to sort
 * @returns Sorted array of transactions (oldest to newest)
 */
export const sortTransactionsByDateAsc = (
  transactions: Transaction[],
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
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
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });
};

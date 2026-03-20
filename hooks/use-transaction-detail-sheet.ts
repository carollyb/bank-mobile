import { Transaction } from '@/types/transaction.type';
import { useCallback, useEffect, useState } from 'react';

type UseTransactionDetailSheetArgs = {
  transactions: Transaction[];
  onDelete: (item: Transaction) => void;
  setTransactionSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export const useTransactionDetailSheet = ({
  transactions,
  onDelete,
  setTransactionSheetOpen,
}: UseTransactionDetailSheetArgs) => {
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const openDetail = useCallback(
    (item: Transaction) => {
      setSelectedTransaction(item);
      setTransactionSheetOpen(true);
    },
    [setTransactionSheetOpen],
  );

  const closeDetail = useCallback(() => {
    setSelectedTransaction(null);
    setTransactionSheetOpen(false);
  }, [setTransactionSheetOpen]);

  const handleDeleteFromDetail = useCallback(
    (item: Transaction) => {
      onDelete(item);
    },
    [onDelete],
  );

  useEffect(() => {
    if (!selectedTransaction) return;

    const stillExists = transactions.some(
      (txn) => txn.id === selectedTransaction.id,
    );

    if (!stillExists) {
      closeDetail();
    }
  }, [transactions, selectedTransaction, closeDetail]);

  return {
    selectedTransaction,
    openDetail,
    closeDetail,
    handleDeleteFromDetail,
  };
};

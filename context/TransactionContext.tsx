import { Transaction } from '@/types/transaction.type';
import { createContext, useCallback, useContext, useState } from 'react';

import {
  deleteTransaction,
  getUserBalance,
  getUserCategories,
  getUserTransactionsPaginated,
} from '@/utils/transactionService';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

interface ITransactionContext {
  transactions: Transaction[];
  fetchTransactions: () => void;
  deletingId: string | null;
  onDelete: (item: Transaction) => void;
  loading: boolean;
  balance: number;
}

const TransactionContext = createContext<ITransactionContext | undefined>(
  undefined,
);

export const TransactionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number>(0);

  const fetchTransactions = useCallback(
    async (isRefresh = false) => {
      if (!user) return;

      if (!isRefresh) setLoading(true);
      try {
        const [page, bal] = await Promise.all([
          getUserTransactionsPaginated(user.uid, {
            pageSize: 10,
            cursor: null,
          }),
          getUserBalance(user.uid),
          getUserCategories(user.uid),
        ]);

        setTransactions(page.transactions);
        setBalance(bal);
      } catch (error) {
        const code =
          typeof error === 'object' && error && 'code' in error
            ? String((error as { code?: string }).code)
            : '';
        const message =
          typeof error === 'object' && error && 'message' in error
            ? String((error as { message?: string }).message)
            : '';
        console.log('[transactions] load error:', { code, message, error });

        if (code === 'failed-precondition' || message.includes('index')) {
          Alert.alert(
            'Indice necessario',
            'Seu filtro precisa de indice no Firestore. Abra o link de indice no log do erro para criar automaticamente.',
          );
        } else {
          Alert.alert('Erro', 'Não foi possível carregar as transações.');
        }
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  const onDelete = useCallback(
    (item: Transaction) => {
      if (!user) return;

      Alert.alert(
        'Excluir transação',
        'Essa ação remove a transação permanentemente. Deseja continuar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Excluir',
            style: 'destructive',
            onPress: async () => {
              setDeletingId(item.id);
              try {
                await deleteTransaction(user.uid, item.id);
                setTransactions((prev) => prev.filter((t) => t.id !== item.id));
              } catch {
                Alert.alert('Erro', 'Não foi possível excluir a transação.');
              } finally {
                setDeletingId(null);
              }
            },
          },
        ],
      );
    },
    [user],
  );

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        fetchTransactions,
        onDelete,
        deletingId,
        loading,
        balance,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactionContext = (): ITransactionContext => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error(
      'useTransactionContext must be used within a TransactionProvider',
    );
  }
  return context;
};

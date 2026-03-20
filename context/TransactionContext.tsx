import { Transaction, TransactionType } from '@/types/transaction.type';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { sortTransactionsByDateDesc } from '@/utils/sortTransactions';
import { toISODate } from '@/utils/toISODate';
import {
  deleteTransaction,
  getUserBalance,
  getUserCategories,
  getUserTransactionsPaginated,
} from '@/utils/transactionService';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

interface ITransactionContext {
  transactions: Transaction[];
  fetchTransactions: (isRefresh?: boolean) => Promise<void>;
  deletingId: string | null;
  onDelete: (item: Transaction) => void;
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  balance: number;
  loadMore: () => Promise<void>;
  categories: string[];
  clearFilters: () => void;
  refreshing: boolean;
  setRefreshing: (value: boolean) => void;
  activeFilterCount: number;
  filtersExpanded: boolean;
  setFiltersExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  typeFilter: 'all' | TransactionType;
  setTypeFilter: React.Dispatch<React.SetStateAction<'all' | TransactionType>>;
  categoryFilter: string;
  setCategoryFilter: React.Dispatch<React.SetStateAction<string>>;
  startDate: Date | null;
  setStartDate: React.Dispatch<React.SetStateAction<Date | null>>;
  endDate: Date | null;
  setEndDate: React.Dispatch<React.SetStateAction<Date | null>>;
  pickerTarget: 'start' | 'end' | null;
  setPickerTarget: React.Dispatch<React.SetStateAction<'start' | 'end' | null>>;
  transactionSheetOpen: boolean;
  setTransactionSheetOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TransactionContext = createContext<ITransactionContext | undefined>(
  undefined,
);

const MIN_LOAD_MORE_MS = 650;

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

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
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(
    null,
  );
  const [transactionSheetOpen, setTransactionSheetOpen] = useState(false);
  const PAGE_SIZE = 10;

  const filters = useMemo(
    () => ({
      ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
      ...(categoryFilter !== 'all' ? { category: categoryFilter } : {}),
      ...(startDate ? { fromDate: toISODate(startDate) } : {}),
      ...(endDate ? { toDate: toISODate(endDate) } : {}),
    }),
    [typeFilter, categoryFilter, startDate, endDate],
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'all') count += 1;
    if (categoryFilter !== 'all') count += 1;
    if (startDate) count += 1;
    if (endDate) count += 1;
    return count;
  }, [typeFilter, categoryFilter, startDate, endDate]);

  const fetchTransactions = useCallback(
    async (isRefresh = false) => {
      if (!user) return;

      if (!isRefresh) setLoading(true);
      try {
        const [page, bal, cats] = await Promise.all([
          getUserTransactionsPaginated(user.uid, {
            pageSize: PAGE_SIZE,
            cursor: null,
            filters,
          }),
          getUserBalance(user.uid),
          getUserCategories(user.uid),
        ]);

        setTransactions(sortTransactionsByDateDesc(page.transactions));
        setLastVisible(page.lastVisible);
        setHasMore(page.hasMore);
        setBalance(bal);
        setCategories(cats);
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
        setRefreshing(false);
      }
    },
    [user, filters],
  );

  const loadMore = useCallback(async () => {
    if (!user || loading || loadingMore || !hasMore || !lastVisible) return;
    setLoadingMore(true);
    try {
      const [page] = await Promise.all([
        getUserTransactionsPaginated(user.uid, {
          pageSize: PAGE_SIZE,
          cursor: lastVisible,
          filters,
        }),
        wait(MIN_LOAD_MORE_MS),
      ]);
      setTransactions((prev) =>
        sortTransactionsByDateDesc([...prev, ...page.transactions]),
      );
      setLastVisible(page.lastVisible);
      setHasMore(page.hasMore);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar mais transações.');
    } finally {
      setLoadingMore(false);
    }
  }, [user, loading, loadingMore, hasMore, lastVisible, filters]);

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

  const clearFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('all');
    setStartDate(null);
    setEndDate(null);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        fetchTransactions,
        onDelete,
        deletingId,
        loading,
        loadingMore,
        hasMore,
        balance,
        loadMore,
        categories,
        clearFilters,
        refreshing,
        setRefreshing,
        activeFilterCount,
        filtersExpanded,
        setFiltersExpanded,
        categoryFilter,
        setCategoryFilter,
        typeFilter,
        setTypeFilter,
        startDate,
        setStartDate,
        endDate,
        setEndDate,
        pickerTarget,
        setPickerTarget,
        transactionSheetOpen,
        setTransactionSheetOpen,
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

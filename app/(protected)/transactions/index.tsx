import { TransactionItem } from '@/components/TransactionItem';
import { useAuth } from '@/context/AuthContext';
import { transactionsStyles as styles } from '@/styles/transactionsStyle';
import { Transaction, TransactionType } from '@/types/transaction.type';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import {
  deleteTransaction,
  getUserBalance,
  getUserCategories,
  getUserTransactionsPaginated,
} from '@/utils/transactionService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FILTER_TYPES: { key: 'all' | TransactionType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'deposit', label: 'Depósito' },
  { key: 'withdraw', label: 'Saque' },
  { key: 'transfer', label: 'Transferência' },
  { key: 'payment', label: 'Boleto' },
];

const PAGE_SIZE = 20;

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'start' | 'end' | null>(
    null,
  );

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (typeFilter !== 'all') count += 1;
    if (categoryFilter !== 'all') count += 1;
    if (startDate) count += 1;
    if (endDate) count += 1;
    return count;
  }, [typeFilter, categoryFilter, startDate, endDate]);

  const filters = useMemo(
    () => ({
      ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
      ...(categoryFilter !== 'all' ? { category: categoryFilter } : {}),
      ...(startDate ? { fromDate: toISODate(startDate) } : {}),
      ...(endDate ? { toDate: toISODate(endDate) } : {}),
    }),
    [typeFilter, categoryFilter, startDate, endDate],
  );

  const loadFirstPage = useCallback(
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

        setTransactions(page.transactions);
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
      const page = await getUserTransactionsPaginated(user.uid, {
        pageSize: PAGE_SIZE,
        cursor: lastVisible,
        filters,
      });
      setTransactions((prev) => [...prev, ...page.transactions]);
      setLastVisible(page.lastVisible);
      setHasMore(page.hasMore);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao carregar mais transações.');
    } finally {
      setLoadingMore(false);
    }
  }, [user, loading, loadingMore, hasMore, lastVisible, filters]);

  useFocusEffect(
    useCallback(() => {
      loadFirstPage();
    }, [loadFirstPage]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadFirstPage(true);
  };

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
                setBalance((prev) => prev - item.value);
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
    <View style={styles.container}>
      <View style={styles.topArea}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo atual</Text>
          <Text style={styles.balanceValue}>{formatCurrency(balance)}</Text>
        </View>

        <Text style={styles.sectionTitle}>Transações</Text>

        <View style={styles.filterCard}>
          <Pressable
            style={({ pressed }) => [
              styles.filterAccordionButton,
              pressed && styles.filterAccordionButtonPressed,
            ]}
            onPress={() => setFiltersExpanded((prev) => !prev)}
          >
            <Text style={styles.filterTitle}>Filtros avançados</Text>
            <View style={styles.filterHeaderRight}>
              {activeFilterCount > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {activeFilterCount}
                  </Text>
                </View>
              )}
              <Text style={styles.filterChevron}>
                {filtersExpanded ? '▲' : '▼'}
              </Text>
            </View>
          </Pressable>

          {filtersExpanded && (
            <>
              <View style={styles.filterHeaderActions}>
                <Pressable onPress={clearFilters}>
                  <Text style={styles.clearFilters}>Limpar</Text>
                </Pressable>
              </View>

              <Text style={styles.filterLabel}>Tipo</Text>
              <FlatList
                horizontal
                data={FILTER_TYPES}
                keyExtractor={(item) => item.key}
                renderItem={({ item: option }) => (
                  <Pressable
                    style={[
                      styles.filterChip,
                      typeFilter === option.key && styles.filterChipSelected,
                    ]}
                    onPress={() => setTypeFilter(option.key)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        typeFilter === option.key &&
                          styles.filterChipTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                scrollEnabled={true}
              />

              <Text style={styles.filterLabel}>Categoria</Text>
              <FlatList
                horizontal
                data={['all', ...categories]}
                keyExtractor={(item) => item}
                renderItem={({ item: category }) => (
                  <Pressable
                    style={[
                      styles.filterChip,
                      categoryFilter === category && styles.filterChipSelected,
                    ]}
                    onPress={() =>
                      setCategoryFilter(category as typeof categoryFilter)
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        categoryFilter === category &&
                          styles.filterChipTextSelected,
                      ]}
                    >
                      {category === 'all' ? 'Todas' : category}
                    </Text>
                  </Pressable>
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
                scrollEnabled={true}
              />

              <Text style={styles.filterLabel}>Período</Text>
              <View style={styles.dateFilterRow}>
                <Pressable
                  style={styles.dateFilterButton}
                  onPress={() => setPickerTarget('start')}
                >
                  <Text style={styles.dateFilterLabel}>De</Text>
                  <Text style={styles.dateFilterValue}>
                    {startDate
                      ? formatDate(toISODate(startDate))
                      : 'Qualquer data'}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.dateFilterButton}
                  onPress={() => setPickerTarget('end')}
                >
                  <Text style={styles.dateFilterLabel}>Até</Text>
                  <Text style={styles.dateFilterValue}>
                    {endDate ? formatDate(toISODate(endDate)) : 'Qualquer data'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>

      {pickerTarget && (
        <DateTimePicker
          value={
            pickerTarget === 'start'
              ? startDate || new Date()
              : endDate || new Date()
          }
          mode='date'
          display='default'
          locale='pt-BR'
          onChange={(_event, selected) => {
            setPickerTarget(null);
            if (!selected) return;

            if (pickerTarget === 'start') {
              setStartDate(selected);
              if (endDate && selected > endDate) setEndDate(selected);
            } else {
              setEndDate(selected);
              if (startDate && selected < startDate) setStartDate(selected);
            }
          }}
        />
      )}

      <View style={styles.listArea}>
        {loading ? (
          <ActivityIndicator
            color='#2da12b'
            size='large'
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TransactionItem
                item={item}
                deleting={deletingId === item.id}
                onDelete={onDelete}
              />
            )}
            onEndReachedThreshold={0.35}
            onEndReached={loadMore}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={['#2da12b']}
                tintColor='#2da12b'
              />
            }
            ListEmptyComponent={
              <Text style={styles.empty}>Nenhuma transação ainda.</Text>
            }
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  color='#2da12b'
                  size='small'
                  style={{ marginBottom: 20 }}
                />
              ) : !hasMore && transactions.length > 0 ? (
                <Text style={styles.endList}>Fim das transações</Text>
              ) : null
            }
          />
        )}
      </View>

      <Pressable
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
        onPress={() =>
          router.push('/(protected)/transactions/transaction-form')
        }
      >
        <Text style={styles.fabIcon}>＋</Text>
      </Pressable>
    </View>
  );
}

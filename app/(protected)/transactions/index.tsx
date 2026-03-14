import { useAuth } from '@/context/AuthContext';
import { Transaction, TransactionType } from '@/types/transaction.type';
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
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TYPE_META: Record<
  Transaction['type'],
  { label: string; icon: string; color: string }
> = {
  deposit: { label: 'Depósito', icon: '↓', color: '#2da12b' },
  withdraw: { label: 'Saque', icon: '↑', color: '#E53935' },
  transfer: { label: 'Transferência', icon: '⇄', color: '#E53935' },
  payment: { label: 'Boleto', icon: '📄', color: '#E53935' },
};

const FILTER_TYPES: { key: 'all' | TransactionType; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'deposit', label: 'Depósito' },
  { key: 'withdraw', label: 'Saque' },
  { key: 'transfer', label: 'Transferência' },
  { key: 'payment', label: 'Boleto' },
];

const PAGE_SIZE = 20;

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  });

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
};

const toISODate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ─── Transaction Item ─────────────────────────────────────────────────────────

function TransactionItem({
  item,
  deleting,
  onDelete,
}: {
  item: Transaction;
  deleting: boolean;
  onDelete: (item: Transaction) => void;
}) {
  const meta = TYPE_META[item.type];
  const isPositive = item.value >= 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      onPress={() =>
        router.push(`/(protected)/transactions/transaction-form?id=${item.id}`)
      }
    >
      <View style={[styles.iconCircle, { backgroundColor: meta.color + '18' }]}>
        <Text style={[styles.iconText, { color: meta.color }]}>
          {meta.icon}
        </Text>
      </View>

      <View style={styles.itemInfo}>
        <Text style={styles.itemType}>{meta.label}</Text>
        {item.category ? (
          <Text style={styles.itemSub}>{item.category}</Text>
        ) : item.description ? (
          <Text style={styles.itemSub} numberOfLines={1}>
            {item.description}
          </Text>
        ) : null}
      </View>

      <View style={styles.itemRight}>
        <Text
          style={[
            styles.itemValue,
            { color: isPositive ? '#2da12b' : '#E53935' },
          ]}
        >
          {isPositive ? '+' : ''}
          {formatCurrency(item.value)}
        </Text>
        <Text style={styles.itemDate}>{formatDate(item.date)}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.deleteButton,
            pressed && styles.deleteButtonPressed,
          ]}
          onPress={() => onDelete(item)}
          disabled={deleting}
        >
          <Text style={styles.deleteButtonText}>
            {deleting ? 'Excluindo...' : 'Excluir'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

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
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {FILTER_TYPES.map((option) => (
                  <Pressable
                    key={option.key}
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
                ))}
              </ScrollView>

              <Text style={styles.filterLabel}>Categoria</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                <Pressable
                  style={[
                    styles.filterChip,
                    categoryFilter === 'all' && styles.filterChipSelected,
                  ]}
                  onPress={() => setCategoryFilter('all')}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      categoryFilter === 'all' && styles.filterChipTextSelected,
                    ]}
                  >
                    Todas
                  </Text>
                </Pressable>

                {categories.map((category) => (
                  <Pressable
                    key={category}
                    style={[
                      styles.filterChip,
                      categoryFilter === category && styles.filterChipSelected,
                    ]}
                    onPress={() => setCategoryFilter(category)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        categoryFilter === category &&
                          styles.filterChipTextSelected,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>

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
          mode="date"
          display="default"
          locale="pt-BR"
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
            color="#2da12b"
            size="large"
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
                tintColor="#2da12b"
              />
            }
            ListEmptyComponent={
              <Text style={styles.empty}>Nenhuma transação ainda.</Text>
            }
            ListFooterComponent={
              loadingMore ? (
                <ActivityIndicator
                  color="#2da12b"
                  size="small"
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  topArea: {
    flexShrink: 0,
    paddingBottom: 6,
    zIndex: 2,
  },
  listArea: {
    flex: 1,
    minHeight: 0,
  },
  balanceCard: {
    backgroundColor: '#2da12b',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#2da12b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 6,
    fontWeight: '500',
  },
  balanceValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFF',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#444',
    marginBottom: 8,
    marginLeft: 2,
  },
  filterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  filterAccordionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  filterAccordionButtonPressed: {
    opacity: 0.8,
  },
  filterHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterBadge: {
    minWidth: 20,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2da12b',
  },
  filterBadgeText: {
    color: '#2da12b',
    fontSize: 11,
    fontWeight: '700',
  },
  filterChevron: {
    fontSize: 12,
    color: '#666',
    fontWeight: '700',
  },
  filterHeaderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  clearFilters: {
    fontSize: 13,
    color: '#2da12b',
    fontWeight: '600',
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 4,
  },
  filterRow: {
    gap: 8,
    paddingBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#EEF0F2',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2da12b',
  },
  filterChipText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterChipTextSelected: {
    color: '#2da12b',
    fontWeight: '700',
  },
  dateFilterRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateFilterButton: {
    flex: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#E1E5E8',
    backgroundColor: '#FAFBFC',
  },
  dateFilterLabel: {
    fontSize: 11,
    color: '#7A7A7A',
    marginBottom: 2,
    fontWeight: '600',
  },
  dateFilterValue: {
    fontSize: 13,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  list: {
    paddingTop: 4,
    paddingBottom: 100,
  },
  emptyContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    fontSize: 15,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  itemPressed: {
    opacity: 0.75,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 18,
    fontWeight: '700',
  },
  itemInfo: {
    flex: 1,
  },
  itemType: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemSub: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
    textTransform: 'capitalize',
  },
  itemRight: {
    alignItems: 'flex-end',
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemDate: {
    fontSize: 11,
    color: '#BBB',
    marginTop: 3,
  },
  deleteButton: {
    marginTop: 8,
    backgroundColor: '#FDECEC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  deleteButtonPressed: {
    opacity: 0.85,
  },
  deleteButtonText: {
    color: '#C62828',
    fontSize: 11,
    fontWeight: '700',
  },
  endList: {
    textAlign: 'center',
    color: '#AAAAAA',
    fontSize: 12,
    marginBottom: 22,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2da12b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2da12b',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  fabPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.94 }],
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: '300',
    lineHeight: 32,
  },
});

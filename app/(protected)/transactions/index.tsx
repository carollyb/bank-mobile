import { TransactionItem } from '@/components/TransactionItem';
import { useTransactionContext } from '@/context/TransactionContext';
import { transactionsStyles as styles } from '@/styles/transactionsStyle';
import { TransactionType } from '@/types/transaction.type';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { toISODate } from '@/utils/toISODate';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback } from 'react';
import {
  ActivityIndicator,
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function Transactions() {
  const {
    transactions,
    fetchTransactions,
    onDelete,
    loadMore,
    deletingId,
    categories,
    balance,
    loading,
    clearFilters,
    refreshing,
    setRefreshing,
    activeFilterCount,
    setFiltersExpanded,
    filtersExpanded,
    typeFilter,
    setTypeFilter,
    categoryFilter,
    setCategoryFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    pickerTarget,
    setPickerTarget,
    loadingMore,
    hasMore,
  } = useTransactionContext();

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions(true);
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

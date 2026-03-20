import { Pressable, Text, View } from 'react-native';

import { Transaction } from '@/types/transaction.type';
import { TYPE_META } from '@/types/type-meta.types';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';

import { transactionsStyles as styles } from '@/styles/transactionsStyle';

export function TransactionItem({
  item,
  onPress,
}: {
  item: Transaction;
  onPress: (item: Transaction) => void;
}) {
  const meta = TYPE_META[item.type];
  const isPositive = item.value >= 0;

  return (
    <Pressable
      style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
      onPress={() => onPress(item)}
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
      </View>
    </Pressable>
  );
}

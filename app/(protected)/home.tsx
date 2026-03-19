import { TransactionDetailSheet } from '@/components/TransactionDetailSheet';
import { TransactionItem } from '@/components/TransactionItem';
import { useAuth } from '@/context/AuthContext';
import { useTransactionContext } from '@/context/TransactionContext';
import { useTransactionDetailSheet } from '@/hooks/use-transaction-detail-sheet';
import { homeStyles as styles } from '@/styles/homeStyles';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  sortTransactionsByDateAsc,
  sortTransactionsByDateDesc,
} from '@/utils/sortTransactions';
import { useFocusEffect } from '@react-navigation/native';
import { Circle } from '@shopify/react-native-skia';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Animated as RNAnimated,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  default as Animated,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { CartesianChart, Line } from 'victory-native';

export default function Home() {
  const fadeAnim = useSharedValue(0.8);
  const scrollY = useSharedValue(0);

  useAnimatedReaction(
    () => scrollY.value,
    (value) => {
      if (value > 50) {
        fadeAnim.value = withTiming(1, { duration: 500 });
      } else {
        fadeAnim.value = withTiming(0.8, { duration: 300 });
      }
    },
  );

  const reanimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });

  const { user } = useAuth();
  const {
    transactions,
    balance,
    fetchTransactions,
    loading,
    onDelete,
    setTransactionSheetOpen,
  } = useTransactionContext();
  const sectionAnimations = useRef(
    Array.from({ length: 5 }, () => new RNAnimated.Value(0)),
  ).current;

  const {
    selectedTransaction,
    openDetail,
    closeDetail,
    handleDeleteFromDetail,
  } = useTransactionDetailSheet({
    transactions,
    onDelete,
    setTransactionSheetOpen,
  });

  const userName = user?.displayName || 'Cliente';

  const runSectionTransitions = useCallback(() => {
    sectionAnimations.forEach((anim) => anim.setValue(0));

    RNAnimated.stagger(
      90,
      sectionAnimations.map((anim) =>
        RNAnimated.timing(anim, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [sectionAnimations]);

  const getSectionStyle = useCallback(
    (index: number) => ({
      opacity: sectionAnimations[index],
      transform: [
        {
          translateY: sectionAnimations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [18, 0],
          }),
        },
      ],
    }),
    [sectionAnimations],
  );

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
      runSectionTransitions();
    }, [fetchTransactions, runSectionTransitions]),
  );

  return (
    <LinearGradient colors={['#75e299ff', '#2da12b']} style={styles.gradient}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <RNAnimated.View style={[styles.header, getSectionStyle(0)]}>
          <Text style={styles.greeting}>{`Olá, ${userName}! 👋`}</Text>
          <Text style={styles.subtitle}>Bem-vindo de volta</Text>
        </RNAnimated.View>

        {/* Balance Card */}
        <RNAnimated.View style={[styles.balanceCard, getSectionStyle(1)]}>
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        </RNAnimated.View>

        {/* Chart Card */}
        <RNAnimated.View style={[styles.card, getSectionStyle(2)]}>
          <Text style={styles.cardTitle}>Evolução do Saldo</Text>
          <View style={styles.chartContainer}>
            <CartesianChart
              data={sortTransactionsByDateAsc(transactions.slice(0, 10))}
              xKey="createdAt"
              yKeys={['value']}
            >
              {({ points }) => (
                <>
                  <Line points={points.value} color="#2da12b" strokeWidth={3} />
                  {points.value.map((point, index) => (
                    <Circle
                      key={index}
                      cx={point.x}
                      cy={Number(point.y)}
                      r={4}
                      color="#2da12b"
                    />
                  ))}
                </>
              )}
            </CartesianChart>
          </View>
        </RNAnimated.View>

        <Animated.View style={[reanimatedStyle]}>
          <View style={{ ...styles.header, marginTop: 24 }}>
            <Text style={styles.greeting}>{`Últimas transações`}</Text>
          </View>

          <View>
            {loading ? (
              <ActivityIndicator
                color="#2da12b"
                size="large"
                style={{ marginTop: 40 }}
              />
            ) : transactions.slice(0, 10).length > 0 ? (
              sortTransactionsByDateDesc(transactions.slice(0, 10)).map(
                (item) => (
                  <TransactionItem
                    key={item.id}
                    item={item}
                    onPress={() => openDetail(item)}
                  />
                ),
              )
            ) : (
              <Text>Nenhuma transação ainda.</Text>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      <TransactionDetailSheet
        visible={!!selectedTransaction}
        item={selectedTransaction}
        onClose={closeDetail}
        onDelete={handleDeleteFromDetail}
        showActions={false}
      />
    </LinearGradient>
  );
}

import { TransactionItem } from '@/components/TransactionItem';
import { useAuth } from '@/context/AuthContext';
import { useTransactionContext } from '@/context/TransactionContext';
import { homeStyles as styles } from '@/styles/homeStyles';
import { formatCurrency } from '@/utils/formatCurrency';
import { sortTransactionsByDateAsc } from '@/utils/sortTransactions';
import { useFocusEffect } from '@react-navigation/native';
import { Circle } from '@shopify/react-native-skia';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { CartesianChart, Line } from 'victory-native';

export default function Home() {
  const fadeAnim = useSharedValue(0.2);
  const scrollY = useSharedValue(0);

  useAnimatedReaction(
    () => scrollY.value,
    (value) => {
      if (value > 350) {
        fadeAnim.value = withTiming(1, { duration: 700 });
      } else {
        fadeAnim.value = withTiming(0.2, { duration: 400 });
      }
    },
  );

  const reanimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });

  const { logout, user } = useAuth();
  const {
    transactions,
    balance,
    onDelete,
    fetchTransactions,
    loading,
    deletingId,
  } = useTransactionContext();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const userName = user?.displayName || 'Cliente';

  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [fetchTransactions]),
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
        <View style={styles.header}>
          <Text style={styles.greeting}>{`Olá, ${userName}! 👋`}</Text>
          <Text style={styles.subtitle}>Bem-vindo de volta ao seu banco</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
        </View>

        {/* Chart Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evolução do Saldo</Text>
          <View style={styles.chartContainer}>
            <CartesianChart
              data={sortTransactionsByDateAsc(transactions.slice(0, 10))}
              xKey='createdAt'
              yKeys={['value']}
            >
              {({ points }) => (
                <>
                  <Line points={points.value} color='#2da12b' strokeWidth={3} />
                  {points.value.map((point, index) => (
                    <Circle
                      key={index}
                      cx={point.x}
                      cy={Number(point.y)}
                      r={4}
                      color='#2da12b'
                    />
                  ))}
                </>
              )}
            </CartesianChart>
          </View>
        </View>

        <Animated.View style={[reanimatedStyle]}>
          <View style={{ ...styles.header, marginTop: 24 }}>
            <Text style={styles.greeting}>{`Últimas transações`}</Text>
          </View>

          <View>
            {loading ? (
              <ActivityIndicator
                color='#2da12b'
                size='large'
                style={{ marginTop: 40 }}
              />
            ) : transactions.slice(0, 10).length > 0 ? (
              transactions
                .slice(0, 10)
                .map((item) => (
                  <TransactionItem
                    key={item.id}
                    item={item}
                    deleting={deletingId === item.id}
                    onDelete={onDelete}
                  />
                ))
            ) : (
              <Text>Nenhuma transação ainda.</Text>
            )}
          </View>
        </Animated.View>

        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleLogout}
        >
          <Text style={styles.buttonText}>Sair</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

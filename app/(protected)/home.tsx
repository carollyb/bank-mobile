import { useAuth } from '@/context/AuthContext';
import { homeStyles as styles } from '@/styles/homeStyles';
import { MOCK_TRANSACTIONS } from '@/utils/mock';
import { Circle } from '@shopify/react-native-skia';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { CartesianChart, Line } from 'victory-native';

export default function Home() {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const userName = user?.displayName || 'Cliente';

  return (
    <LinearGradient colors={['#75e299ff', '#2da12b']} style={styles.gradient}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{`Olá, ${userName}! 👋`}</Text>
          <Text style={styles.subtitle}>Bem-vindo de volta ao seu banco</Text>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Saldo Total</Text>
          <Text style={styles.balanceAmount}>R$ 5.432,50</Text>
        </View>

        {/* Chart Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Evolução do Saldo</Text>
          <View style={styles.chartContainer}>
            <CartesianChart
              data={MOCK_TRANSACTIONS}
              xKey="date"
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
        </View>

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
      </View>
    </LinearGradient>
  );
}

import { useAuth } from '@/context/AuthContext';
import { protectedHeaderStyles as styles } from '@/styles/protectedHeaderStyles';
import { Slot } from 'expo-router';
import { Image, ScrollView, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
        />
      </View>
      <ScrollView style={styles.content}>
        <Slot />
      </ScrollView>
    </SafeAreaView>
  );
}

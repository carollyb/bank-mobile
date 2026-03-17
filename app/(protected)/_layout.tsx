import { TabNavigation } from '@/components/TabNavigation';
import { useAuth } from '@/context/AuthContext';
import { protectedHeaderStyles as styles } from '@/styles/protectedHeaderStyles';
import { Slot } from 'expo-router';
import { Image, View } from 'react-native';

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
      <View style={styles.content}>
        <Slot />
      </View>
      <View style={styles.tabNavigation}>
        <TabNavigation
          tabs={[
            { label: 'Início', href: '/home' },
            { label: 'Transações', href: '/transactions' },
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

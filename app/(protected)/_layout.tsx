import { TabNavigation } from '@/components/TabNavigation';
import { useAuth } from '@/context/AuthContext';
import { useTransactionContext } from '@/context/TransactionContext';
import { protectedHeaderStyles as styles } from '@/styles/protectedHeaderStyles';
import { router, Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProtectedLayout() {
  const { isAuthenticated, logout, user } = useAuth();
  const { transactionSheetOpen } = useTransactionContext();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const userInitials = useMemo(() => {
    const fallback = 'CL';
    const fullName = user?.displayName?.trim();

    if (fullName) {
      const initials = fullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join('');

      return initials || fallback;
    }

    const emailPrefix = user?.email?.split('@')[0]?.trim();
    if (emailPrefix) {
      return emailPrefix.slice(0, 2).toUpperCase();
    }

    return fallback;
  }, [user]);

  const handleLogout = async () => {
    setIsProfileMenuOpen(false);
    await logout();
    router.replace('/login');
  };

  const closeProfileMenu = () => {
    setIsProfileMenuOpen(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" backgroundColor="#f3f8f4" />

      {isProfileMenuOpen && (
        <Pressable style={styles.menuBackdrop} onPress={closeProfileMenu} />
      )}

      <View style={styles.header}>
        <Pressable
          style={styles.brandContainer}
          onPress={() => router.push('/home')}
        >
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.logo}
          />
        </Pressable>

        <View style={styles.profileContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.avatarButton,
              pressed && styles.avatarButtonPressed,
            ]}
            onPress={() => setIsProfileMenuOpen((prev) => !prev)}
          >
            <Text style={styles.avatarText}>{userInitials}</Text>
          </Pressable>

          {isProfileMenuOpen && (
            <View style={styles.profileMenu}>
              <Text style={styles.profileName}>
                {user?.displayName || user?.email || 'Cliente'}
              </Text>
              <Pressable
                style={({ pressed }) => [
                  styles.logoutMenuItem,
                  pressed && styles.logoutMenuItemPressed,
                ]}
                onPress={handleLogout}
              >
                <Text style={styles.logoutMenuText}>Sair</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
      <View style={styles.content}>
        <Slot />
      </View>
      {!transactionSheetOpen && (
        <View style={styles.tabNavigation}>
          <TabNavigation
            tabs={[
              { label: 'Início', href: '/home' },
              { label: 'Transações', href: '/transactions' },
            ]}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

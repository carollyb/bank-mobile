import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';

import { AuthProvider } from '@/context/AuthContext';
import { TransactionProvider } from '@/context/TransactionContext';

export const unstable_settings = {
  anchor: '(splash)',
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={DefaultTheme}>
        <AuthProvider>
          <TransactionProvider>
            <Stack>
              <Stack.Screen name='(splash)' options={{ headerShown: false }} />
              <Stack.Screen name='(auth)' options={{ headerShown: false }} />
              <Stack.Screen
                name='(protected)'
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name='modal'
                options={{ presentation: 'modal', title: 'Modal' }}
              />
            </Stack>
            <StatusBar style='auto' />
          </TransactionProvider>
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

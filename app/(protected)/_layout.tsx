import { useAuth } from '@/context/AuthContext';
import { Slot } from 'expo-router';
import { Text, View } from 'react-native';

export default function ProtectedLayout() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 16 }}>
      <Text>Protected Layout</Text>
      <Slot />
    </View>
  );
}

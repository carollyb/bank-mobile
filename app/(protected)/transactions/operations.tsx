import { useAuth } from '@/context/AuthContext';
import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function Operations() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <Text>Adicionar / Editar Transação</Text>
      <Button title="Logout" onPress={handleLogout}></Button>
    </View>
  );
}

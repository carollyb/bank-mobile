import { useAuth } from '@/context/AuthContext';
import { Button, Text, View } from 'react-native';

export default function Home() {
  const { logout } = useAuth();
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      {/* Aqui vai estar o componente de boas vindas e gráfico */}
      <Text>Home Screen</Text>
      <Button title='Logout' onPress={logout}></Button>
    </View>
  );
}

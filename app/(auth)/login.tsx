import { useAuth } from '@/context/AuthContext';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={{ flex: 1, alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Login</Text>

      <TextInput
        placeholder='Email'
        style={{ borderWidth: 1, padding: 8, marginBottom: 16 }}
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder='Password'
        secureTextEntry
        style={{ borderWidth: 1, padding: 8, marginBottom: 16 }}
        value={password}
        onChangeText={setPassword}
      />

      <Button
        title='Log in'
        onPress={() => {
          const isAuthenticated = login(email, password);
          if (isAuthenticated) {
            router.replace('/(protected)/home');
          }
        }}
      />
      <Link href='/signup' style={{ marginTop: 16 }}>
        Don't have an account? Sign up
      </Link>
    </View>
  );
}

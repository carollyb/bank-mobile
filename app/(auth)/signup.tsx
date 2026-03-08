import { useAuth } from '@/context/AuthContext';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';

export default function Signup() {
  const { signup } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={{ flex: 1, alignItems: 'center', padding: 16 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Signup</Text>

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
        title='Sign Up'
        onPress={() => {
          signup(email, password);
          router.replace('/login');
        }}
      />
      <Link href='/login' style={{ marginTop: 16 }}>
        Already have an account? Log in
      </Link>
    </View>
  );
}

import CustomAlert from '@/components/CustomAlert';
import { useAuth } from '@/context/AuthContext';
import { authStyles } from '@/styles/authStyles';
import { AlertState, initialAlertState } from '@/types/auth.types';
import { validateEmail, validatePassword } from '@/utils/validation';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function Login() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [alert, setAlert] = useState<AlertState>(initialAlertState);

  const handleLogin = async () => {
    setErrors({ email: '', password: '' });

    let hasError = false;
    const newErrors = { email: '', password: '' };

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
      hasError = true;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Email inválido';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
      hasError = true;
    } else if (!validatePassword(password)) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const isAuthenticated = await login(email.trim(), password);
      if (isAuthenticated) {
        router.replace('/(protected)/home');
      } else {
        setAlert({
          visible: true,
          type: 'error',
          title: 'Erro no Login',
          message: 'Email ou senha incorretos. Verifique suas credenciais.',
        });
      }
    } catch (error) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Erro',
        message: 'Ocorreu um erro ao fazer login. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#75e299ff', '#2da12b']}
      style={authStyles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={authStyles.container}
      >
        <Image
          source={require('@/assets/images/logo.png')}
          style={authStyles.logo}
        />
        <View style={authStyles.card}>
          <Text style={authStyles.title}>Bem-vindo!</Text>
          <Text style={authStyles.subtitle}>Faça login para continuar</Text>

          <View style={authStyles.inputContainer}>
            <TextInput
              placeholder="Email"
              placeholderTextColor="#999"
              style={[
                authStyles.input,
                errors.email ? authStyles.inputError : null,
              ]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
            {errors.email ? (
              <Text style={authStyles.errorText}>{errors.email}</Text>
            ) : null}
          </View>

          <View style={authStyles.inputContainer}>
            <TextInput
              placeholder="Senha"
              placeholderTextColor="#999"
              secureTextEntry
              style={[
                authStyles.input,
                errors.password ? authStyles.inputError : null,
              ]}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.password ? (
              <Text style={authStyles.errorText}>{errors.password}</Text>
            ) : null}
          </View>

          <Pressable
            style={({ pressed }) => [
              authStyles.button,
              pressed && authStyles.buttonPressed,
              loading && authStyles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={authStyles.buttonText}>Entrar</Text>
            )}
          </Pressable>

          <Link href="/signup" asChild>
            <Pressable disabled={loading}>
              <Text style={authStyles.linkText}>
                Não tem conta?{' '}
                <Text style={authStyles.linkTextBold}>Cadastre-se</Text>
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>

      <CustomAlert
        visible={alert.visible}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, visible: false })}
      />
    </LinearGradient>
  );
}

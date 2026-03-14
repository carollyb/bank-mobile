import CustomAlert from '@/components/CustomAlert';
import { useAuth } from '@/context/AuthContext';
import { authStyles } from '@/styles/authStyles';
import { AlertState, initialAlertState } from '@/types/auth.types';
import { validateEmail, validatePassword } from '@/utils/validation';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function Login() {
  const { login } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [alert, setAlert] = useState<AlertState>(initialAlertState);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    if (params.email) {
      setEmail(params.email);
    }
  }, [params.email]);

  // Detecta quando o teclado abre/fecha
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

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
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={authStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          scrollEnabled={keyboardVisible}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ width: '100%', alignItems: 'center' }}>
              <Image
                source={require('@/assets/images/logo.png')}
                style={authStyles.logo}
              />
              <View style={authStyles.card}>
                <Text style={authStyles.title}>Bem-vindo!</Text>
                <Text style={authStyles.subtitle}>
                  Faça login para continuar
                </Text>

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
                      if (errors.password)
                        setErrors({ ...errors, password: '' });
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
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
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

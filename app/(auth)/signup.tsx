import CustomAlert from '@/components/CustomAlert';
import { useAuth } from '@/context/AuthContext';
import { authStyles } from '@/styles/authStyles';
import { AlertState, initialAlertState } from '@/types/auth.types';
import {
  validateEmail,
  validateName,
  validatePassword,
} from '@/utils/validation';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, router } from 'expo-router';
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

export default function Signup() {
  const { signup } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [alert, setAlert] = useState<AlertState>(initialAlertState);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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

  const handleSignup = async () => {
    setErrors({ name: '', email: '', password: '', confirmPassword: '' });

    let hasError = false;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
      hasError = true;
    } else if (!validateName(name)) {
      newErrors.name = 'Nome deve ter no mínimo 2 caracteres';
      hasError = true;
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirme sua senha';
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
      hasError = true;
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const success = await signup(name.trim(), email.trim(), password);
      if (success) {
        setAlert({
          visible: true,
          type: 'success',
          title: 'Sucesso!',
          message: 'Conta criada com sucesso! Faça login para continuar.',
        });

        setTimeout(() => {
          router.push({
            pathname: '/login',
            params: { email: email.trim() },
          });
        }, 2000);
      } else {
        setAlert({
          visible: true,
          type: 'error',
          title: 'Erro',
          message:
            'Não foi possível criar a conta. O email pode já estar em uso.',
        });
      }
    } catch (error) {
      setAlert({
        visible: true,
        type: 'error',
        title: 'Erro',
        message: 'Ocorreu um erro ao criar a conta. Tente novamente.',
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
                <Text style={authStyles.title}>Criar Conta</Text>
                <Text style={authStyles.subtitle}>
                  Preencha os dados para começar
                </Text>

                <View style={authStyles.inputContainer}>
                  <TextInput
                    placeholder="Nome completo"
                    placeholderTextColor="#999"
                    style={[
                      authStyles.input,
                      errors.name ? authStyles.inputError : null,
                    ]}
                    value={name}
                    onChangeText={(text) => {
                      setName(text);
                      if (errors.name) setErrors({ ...errors, name: '' });
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    editable={!loading}
                  />
                  {errors.name ? (
                    <Text style={authStyles.errorText}>{errors.name}</Text>
                  ) : null}
                </View>

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
                    placeholder="Senha (mínimo 6 caracteres)"
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

                <View style={authStyles.inputContainer}>
                  <TextInput
                    placeholder="Confirmar senha"
                    placeholderTextColor="#999"
                    secureTextEntry
                    style={[
                      authStyles.input,
                      errors.confirmPassword ? authStyles.inputError : null,
                    ]}
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errors.confirmPassword)
                        setErrors({ ...errors, confirmPassword: '' });
                    }}
                    autoCapitalize="none"
                    editable={!loading}
                  />
                  {errors.confirmPassword ? (
                    <Text style={authStyles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  ) : null}
                </View>

                <Pressable
                  style={({ pressed }) => [
                    authStyles.button,
                    pressed && authStyles.buttonPressed,
                    loading && authStyles.buttonDisabled,
                  ]}
                  onPress={handleSignup}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={authStyles.buttonText}>Cadastrar</Text>
                  )}
                </Pressable>

                <Link href="/login" asChild>
                  <Pressable disabled={loading}>
                    <Text style={authStyles.linkText}>
                      Já tem conta?{' '}
                      <Text style={authStyles.linkTextBold}>Fazer login</Text>
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

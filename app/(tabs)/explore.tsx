import { router } from 'expo-router';
import { useEffect } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TabTwoScreen() {
  const fadeAnim = useSharedValue(0);
  const reanimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnim.value,
    };
  });

  useEffect(() => {
    fadeAnim.value = withTiming(1, { duration: 2000 });
    return () => {
      fadeAnim.value = withTiming(0, { duration: 2000 });
    };
  }, []);

  const login = () => {
    router.replace('/(protected)/transactions');
  };
  const signup = () => {
    router.replace('/signup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.fadingContainer, reanimatedStyle]}>
        <Text>Bem vindo ao Byte Bank</Text>
      </Animated.View>
      <View style={styles.actions}>
        <Button title='LOGIN' onPress={login}></Button>
        <Button title='SIGN UP' onPress={signup}></Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {
    flexBasis: 100,
    justifyContent: 'space-evenly',
    marginVertical: 16,
  },
  fadingContainer: {
    padding: 20,
    backgroundColor: 'powderblue',
  },
});

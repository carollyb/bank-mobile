import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

const styles = StyleSheet.create({
  gradient: {
    minHeight: '100%',
    flex: 1,
  },
  outerContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 30,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default function Account() {
  return (
    <LinearGradient colors={['#75e299ff', '#2da12b']} style={styles.gradient}>
      <View style={styles.outerContainer}>
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Transações</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.text}>Suas transações aparecem aqui</Text>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

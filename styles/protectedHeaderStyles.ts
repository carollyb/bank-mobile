import { StyleSheet } from 'react-native';

export const protectedHeaderStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  logo: {
    height: 32,
    width: 146,
  },
  content: {
    flex: 1,
  },
});

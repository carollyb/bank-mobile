import { StyleSheet } from 'react-native';

export const protectedHeaderStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7faf8',
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
  },
  header: {
    backgroundColor: 'rgba(247, 250, 248, 0.93)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(45, 161, 43, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  brandContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
  },
  logo: {
    height: 28,
    width: 128,
  },
  headerTitle: {
    fontSize: 13,
    color: '#56706c',
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  profileContainer: {
    position: 'relative',
    zIndex: 10,
  },
  avatarButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1b8f45',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#d7f2de',
  },
  avatarButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  profileMenu: {
    position: 'absolute',
    top: 48,
    right: 0,
    width: 190,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
  },
  profileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1c2b28',
    marginBottom: 10,
  },
  logoutMenuItem: {
    backgroundColor: '#fff3f3',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ffd4d4',
  },
  logoutMenuItemPressed: {
    opacity: 0.8,
  },
  logoutMenuText: {
    color: '#cf2d2d',
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  tabNavigation: { marginTop: 'auto' },
});

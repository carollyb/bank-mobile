import { router, usePathname } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Tab {
  label: string;
  href: string;
}

interface TabNavigationProps {
  tabs: Tab[];
}

export function TabNavigation({ tabs }: TabNavigationProps) {
  const pathname = usePathname();

  const isTabActive = (href: string) => {
    if (href === '/home' || href === '/') {
      return pathname.includes('/home') || pathname === '/(protected)';
    }
    return pathname.includes(href);
  };

  const handleTabPress = (href: string) => {
    router.push(href as any);
  };

  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabPill}>
        {tabs.map((tab, index) => (
          <Pressable
            key={index}
            style={[
              styles.tab,
              isTabActive(tab.href) && styles.tabActive,
              index === 0 && styles.tabFirst,
              index === tabs.length - 1 && styles.tabLast,
            ]}
            onPress={() => handleTabPress(tab.href)}
          >
            <Text
              style={[
                styles.tabText,
                isTabActive(tab.href) && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    paddingTop: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0)',
  },
  tabPill: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 4,
    alignSelf: 'center',
  },
  tab: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabFirst: {
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  tabLast: {
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  tabActive: {
    backgroundColor: '#fff',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#2da12b',
    fontWeight: '700',
  },
});

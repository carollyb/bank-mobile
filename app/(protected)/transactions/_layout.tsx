import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: 'light',
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Extrato',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='house.fill' color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='operations'
        options={{
          title: 'Adicionar / Editar',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name='paperplane.fill' color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

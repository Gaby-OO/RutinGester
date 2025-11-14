import { Tabs, usePathname } from 'expo-router';
import React, { useEffect } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { TabHistoryProvider, TabPath, useTabHistory } from '@/contexts/tab-history-context';
import { useThemeMode } from '@/contexts/theme-context';

function InnerTabLayout() {
  const { effectiveScheme } = useThemeMode();
  const pathname = usePathname();
  const { registerTabVisit } = useTabHistory();
  const hideTabBar =
    pathname?.startsWith('/(tabs)/exercise') ||
    pathname === '/(tabs)/exercise-library' ||
    pathname?.startsWith('/(tabs)/routine/');

  // Registrar visitas a tabs principales
  useEffect(() => {
    const mainTabs: TabPath[] = ['/(tabs)/index', '/(tabs)/routines', '/(tabs)/profile'];
    if (pathname && (mainTabs as string[]).includes(pathname)) {
      registerTabVisit(pathname as TabPath);
    }
  }, [pathname, registerTabVisit]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[effectiveScheme].tint,
        tabBarInactiveTintColor: Colors[effectiveScheme].tabIconDefault,
        headerShown: false,
        tabBarStyle: hideTabBar
          ? { display: 'none' }
          : { backgroundColor: Colors[effectiveScheme].background, borderTopColor: Colors[effectiveScheme].tabIconDefault + '33' },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          tabBarButton: HapticTab,
        }}
      />
      <Tabs.Screen
        name="routines"
        options={{
          title: 'Mis Rutinas',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="list.bullet.rectangle.portrait" color={color} />
          ),
          tabBarButton: HapticTab,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="ellipsis.bubble.fill" color={color} />
          ),
          tabBarButton: HapticTab,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.crop.circle" color={color} />
          ),
          tabBarButton: HapticTab,
        }}
      />
      {/* Hidden routine detail tabs (navegables pero no visibles en la barra) */}
      <Tabs.Screen
        name="abs"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="chest"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="biceps"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="glutes"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="quadriceps"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="calves"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="exercise-library"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="exercise/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="routine/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="routine-exercise/[exerciseId]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="routine-run/[id]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <TabHistoryProvider>
      <InnerTabLayout />
    </TabHistoryProvider>
  );
}

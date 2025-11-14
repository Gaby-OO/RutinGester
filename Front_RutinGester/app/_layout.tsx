import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ToastProvider } from '@/components/ui/toast';
import { Colors } from '@/constants/theme';
import { ActiveRunProvider, useActiveRun } from '@/contexts/active-run-context';
import { AuthProvider, useAuth } from '@/contexts/auth-context';
import { RoutineProvider } from '@/contexts/routine-context';
import { ThemeModeProvider, useThemeMode } from '@/contexts/theme-context';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import LoginScreen from './login';

// Mantener splash visible hasta terminar restauración de sesión
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignorar si ya se llamó o si falla (ambiente web/no soportado)
});

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  function AppShell() {
    const { user, loading } = useAuth();
    const { isRunning, isPaused, pauseRun, resumeRun, routineId } = useActiveRun();
    // Obtener esquema efectivo del tema (light/dark)
    let appScheme: 'light' | 'dark' = 'light';
    try {
      const { effectiveScheme } = useThemeMode();
      appScheme = effectiveScheme;
    } catch {
      // context aún no montado en fase inicial
    }
    // Log simple del estado; navegación se controla por el render condicional
    useEffect(() => {
      if (user) {
        console.log('[AppShell] user detected');
      } else {
        console.log('[AppShell] no user, showing login');
      }
    }, [user]);
    // Ocultar splash cuando termina el estado de carga inicial (independiente de si hay user)
    useEffect(() => {
      if (!loading) {
        // Pequeño delay para asegurar primer frame listo
        setTimeout(() => {
          SplashScreen.hideAsync().catch(() => {});
        }, 120);
      }
    }, [loading]);
    // Manejar tap en notificación de fin de descanso
    useEffect(() => {
      const sub = Notifications.addNotificationResponseReceivedListener((response) => {
        try {
          const data: any = response.notification.request.content.data;
          if (data?.tag === 'rest-end' && data?.routineId) {
            router.push({ pathname: '/(tabs)/routine-run/[id]', params: { id: data.routineId } });
          }
        } catch {}
      });
      return () => { sub.remove(); };
    }, []);
    if (loading) {
      // No renderizamos mucho para permitir que el splash siga
      return <View />;
    }
    if (!user) {
      return <LoginScreen />;
    }
    return (
      <>
      <Drawer
        screenOptions={{
          headerTitle: 'RutinGester',
          drawerType: 'front',
          overlayColor: 'rgba(0,0,0,0.35)',
          headerStyle: { backgroundColor: Colors[appScheme].background },
          headerTintColor: Colors[appScheme].text,
          drawerStyle: { backgroundColor: Colors[appScheme].background },
        }}
        drawerContent={(props) => (
          <View style={[styles.drawerContainer, { backgroundColor: Colors[appScheme].background }]}>
            <ThemedText type="title" style={styles.drawerTitle}>Menú</ThemedText>
            <Pressable onPress={() => { props.navigation.closeDrawer(); router.replace({ pathname: '/(tabs)' }); }} style={({ pressed }) => [styles.drawerItem, pressed && { opacity: 0.8 }]}>
              <IconSymbol name="house.fill" size={20} color={styles.drawerIcon.color as string} />
              <ThemedText style={styles.drawerLabel}>Inicio</ThemedText>
            </Pressable>
            <Pressable onPress={() => { props.navigation.closeDrawer(); router.replace({ pathname: '/(tabs)/routines' }); }} style={({ pressed }) => [styles.drawerItem, pressed && { opacity: 0.8 }]}>
              <IconSymbol name="list.bullet.rectangle.portrait" size={20} color={styles.drawerIcon.color as string} />
              <ThemedText style={styles.drawerLabel}>Mis Rutinas</ThemedText>
            </Pressable>
            <Pressable onPress={() => { props.navigation.closeDrawer(); router.replace({ pathname: '/(tabs)/profile' }); }} style={({ pressed }) => [styles.drawerItem, pressed && { opacity: 0.8 }]}>
              <IconSymbol name="person.crop.circle" size={20} color={styles.drawerIcon.color as string} />
              <ThemedText style={styles.drawerLabel}>Perfil</ThemedText>
            </Pressable>
            <Pressable onPress={() => { props.navigation.closeDrawer(); router.replace({ pathname: '/(tabs)/settings' }); }} style={({ pressed }) => [styles.drawerItem, pressed && { opacity: 0.8 }]}>
              <IconSymbol name="gearshape.fill" size={20} color={styles.drawerIcon.color as string} />
              <ThemedText style={styles.drawerLabel}>Configuración</ThemedText>
            </Pressable>
          </View>
        )}
      >
        <Drawer.Screen
          name="(tabs)"
          options={{
            drawerLabel: 'Inicio',
          }}
        />
        <Drawer.Screen
          name="modal"
          options={{
            drawerItemStyle: { display: 'none' },
            title: 'Modal',
          }}
        />
      </Drawer>
      {isRunning && !isPaused && (
        <View style={styles.globalPauseContainer} pointerEvents="box-none">
          <Pressable
            onPress={() => {
              pauseRun();
              router.replace('/(tabs)/routines');
            }}
            style={({ pressed }) => [styles.globalPauseBtn, pressed && { opacity: 0.85 }]}
          >
            <IconSymbol name={'pause.fill'} size={16} color="#fff" />
            <ThemedText style={styles.globalPauseText}>Pausar</ThemedText>
          </Pressable>
        </View>
      )}
      {/* Botón flotante de Chat - abajo a la izquierda */}
      <View style={styles.chatFabContainer} pointerEvents="box-none">
        <Pressable
          onPress={() => router.replace('/(tabs)/chat')}
          style={({ pressed }) => [styles.chatFabBtn, pressed && { opacity: 0.9 }]}
          accessibilityLabel="Abrir chat"
        >
          <IconSymbol name={'bubble.left.and.bubble.right.fill'} size={20} color="#fff" />
        </Pressable>
      </View>
      </>
    );
  }

  const colorScheme = useColorScheme();
  // Tema de navegación se basa en preferencia si existe (context dentro de ThemeModeProvider)
  let effectiveScheme: 'light' | 'dark' = colorScheme === 'dark' ? 'dark' : 'light';
  // Se resolverá correctamente dentro de ThemeModeProvider; navegación usa el valor inicial hasta montar provider

  return (
    <ThemeModeProvider>
      <ThemeProvider value={effectiveScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <RoutineProvider>
            <ActiveRunProvider>
              <ToastProvider>
                <AppShell />
                {/* Overlay global se añadirá dentro de AppShell o aquí más adelante */}
              </ToastProvider>
              <StatusBar style={effectiveScheme === 'dark' ? 'light' : 'dark'} />
            </ActiveRunProvider>
          </RoutineProvider>
        </AuthProvider>
      </ThemeProvider>
    </ThemeModeProvider>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    padding: 16,
    gap: 6,
  },
  drawerTitle: {
    marginTop: 70,
    marginBottom: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  drawerLabel: {
    fontWeight: '600',
  },
  drawerIcon: {
    color: '#4f46e5',
  },
  globalPauseContainer: {
    position: 'absolute',
    top: 42,
    right: 8,
    zIndex: 1000,
    elevation: 1000,
    pointerEvents: 'box-none',
  },
  globalPauseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4f46e5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  globalPauseText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  chatFabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 90,
    zIndex: 1000,
    elevation: 1000,
    pointerEvents: 'box-none',
  },
  chatFabBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});

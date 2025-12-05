import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function RedirectHandler() {
  const router = useRouter();

  useEffect(() => {
    // Let Expo AuthSession finish the flow if it's active
    try {
      WebBrowser.maybeCompleteAuthSession();
    } catch (e) {
      // ignore
    }

    // After attempting to complete auth, navigate back to login (or home)
    // Use replace so the redirect route is not kept in history
    router.replace('/login');
  }, []);

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <ThemedText style={{ marginTop: 12 }}>Procesando inicio de sesión...</ThemedText>
    </ThemedView>
  );
}

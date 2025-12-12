import { useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function RedirectHandler() {
  useEffect(() => {
    // Complete the AuthSession flow — this triggers the loginResponse/signupResponse
    // in login.tsx, which processes the token exchange automatically
    const complete = async () => {
      try {
        await WebBrowser.maybeCompleteAuthSession();
      } catch (e) {
        console.error('Error completing auth session:', e);
      }
    };
    complete();
  }, []);

  // Keep showing spinner while auth completes
  // Don't navigate away — let the auth state changes handle navigation
  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <ThemedText style={{ marginTop: 12 }}>Procesando inicio de sesión...</ThemedText>
    </ThemedView>
  );
}

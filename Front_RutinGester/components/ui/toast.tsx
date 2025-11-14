import { Colors } from '@/constants/theme';
import { useThemeMode } from '@/contexts/theme-context';
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

type ToastType = 'success' | 'error' | 'info';

interface ToastOptions {
  type?: ToastType;
  durationMs?: number;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { effectiveScheme } = useThemeMode();
  const [message, setMessage] = useState<string | null>(null);
  const [type, setType] = useState<ToastType>('info');
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback((msg: string, options?: ToastOptions) => {
    const duration = options?.durationMs ?? 2200;
    setType(options?.type ?? 'info');
    setMessage(msg);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 160, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 6 }),
    ]).start();
    hideTimer.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: -20, duration: 200, useNativeDriver: true }),
      ]).start(() => setMessage(null));
    }, duration);
  }, [opacity, translateY]);

  const value = useMemo(() => ({ show }), [show]);

  const bgByType: Record<ToastType, string> = {
    success: '#16a34a',
    error: '#ef4444',
    info: Colors[effectiveScheme].tint,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {message != null && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[
              styles.container,
              { opacity, transform: [{ translateY }] },
            ]}
          >
            <View style={[styles.toast, { backgroundColor: bgByType[type] }]}> 
              <Text style={styles.text}>{message}</Text>
            </View>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    alignItems: 'center',
  },
  toast: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    maxWidth: '92%',
  },
  text: { color: '#fff', fontWeight: '700' },
});

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/auth-context';
import { useRoutine } from '@/contexts/routine-context';
import { useThemeMode } from '@/contexts/theme-context';
import { cancelDailyReminders, ensureDailyReminderIfNeeded } from '@/utils/notifications';
import * as Print from 'expo-print';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const { routines } = useRoutine();
  const { mode, setMode, effectiveScheme } = useThemeMode();
  const [reminderEnabled, setReminderEnabled] = useState(true);

  useEffect(() => {
    // Could inspect scheduled notifications here; simplified default enabled
  }, []);

  const toggleReminder = async () => {
    if (reminderEnabled) {
      await cancelDailyReminders();
      setReminderEnabled(false);
    } else {
      await ensureDailyReminderIfNeeded(9, 0);
      setReminderEnabled(true);
    }
  };

  const handleLogout = async () => {
    await logout();
    // No navegamos: AppShell mostrará LoginScreen automáticamente
  };

  const [pdfLoading, setPdfLoading] = useState(false);
  const [lastReportName, setLastReportName] = useState<string | null>(null);

  const generatePdf = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      const createdAt = new Date();
      const title = `Reporte Rutinas ${createdAt.toLocaleDateString()} ${createdAt.toLocaleTimeString()}`;
      const html = `<!DOCTYPE html><html><head><meta charset='utf-8' />
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h1 { color: #4f46e5; margin-bottom: 4px; }
        h2 { color: #111; margin-top: 28px; font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; font-size: 12px; }
        th { background: #f5f5f5; }
        .muted { color: #666; font-size: 12px; }
      </style></head><body>
      <h1>${title}</h1>
      <p class='muted'>Generado automáticamente por RutinGester.</p>
      <p>Total de rutinas: <strong>${routines.length}</strong></p>
      ${routines.length === 0 ? '<p>No hay rutinas guardadas.</p>' : ''}
      ${routines.map(r => {
        const groupsCount: Record<string, number> = {};
        r.exercises.forEach(ex => { groupsCount[ex.group] = (groupsCount[ex.group] || 0) + 1; });
        const groupsStr = Object.entries(groupsCount).map(([g, c]) => `${g}: ${c}`).join(', ');
        return `<h2>${r.name}</h2>
        <table><thead><tr><th>Ejercicio</th><th>Grupo</th><th>Sets</th><th>Reps</th><th>Trabajo (s)</th><th>Descanso (s)</th></tr></thead><tbody>
        ${r.exercises.map(ex => `<tr><td>${ex.id}</td><td>${ex.group}</td><td>${ex.settings.sets ?? ''}</td><td>${ex.settings.reps ?? ''}</td><td>${ex.settings.workSeconds ?? ''}</td><td>${ex.settings.restSeconds ?? ''}</td></tr>`).join('')}
        </tbody></table>
        <p class='muted'>Grupos: ${groupsStr || '—'}</p>`;
      }).join('')}
      </body></html>`;
      const file = await Print.printToFileAsync({ html });
      setLastReportName(file.uri.split('/').pop() || null);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(file.uri, { mimeType: 'application/pdf', dialogTitle: title });
      }
    } catch (e) {
      console.warn('[PDF] Error', e);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.replace('/(tabs)/profile')} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}>
          <IconSymbol name="chevron.left" size={20} color={styles.backIcon.color as string} />
          <ThemedText style={styles.backText}>Atrás</ThemedText>
        </Pressable>
        <ThemedText type="title" style={{ marginBottom: 12 }}>Configuración</ThemedText>
        <View style={styles.section}>
          <ThemedText type="subtitle">Tema</ThemedText>
          <ThemedText style={styles.muted}>Modo actual: {mode} (aplica {effectiveScheme})</ThemedText>
          <View style={styles.themeRow}>
            {(['light','dark','system'] as const).map(opt => (
              <Pressable
                key={opt}
                onPress={() => setMode(opt)}
                style={({ pressed }) => [
                  styles.themeBtn,
                  mode === opt && styles.themeBtnActive,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <ThemedText style={[styles.themeBtnText, mode === opt && styles.themeBtnTextActive]}>
                  {opt === 'system' ? 'Sistema' : opt === 'light' ? 'Claro' : 'Oscuro'}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <ThemedText type="subtitle">Cuenta</ThemedText>
          {user ? (
            <ThemedText style={styles.muted}>Conectado como {user.nombre} ({user.role})</ThemedText>
          ) : (
            <ThemedText style={styles.muted}>No hay sesión iniciada.</ThemedText>
          )}
          <View style={styles.rowBetween}>
            <ThemedText style={{ fontWeight: '600' }}>Recordatorio diario</ThemedText>
            <Switch value={reminderEnabled} onValueChange={toggleReminder} />
          </View>
          <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}>
            <IconSymbol name="gearshape.fill" size={20} color="#fff" />
            <ThemedText style={styles.logoutText}>Cerrar sesión</ThemedText>
          </Pressable>
        </View>
        <View style={styles.section}>
          <ThemedText type="subtitle">Reportes PDF</ThemedText>
          <ThemedText style={styles.muted}>Genera un reporte con todas tus rutinas y ejercicios.</ThemedText>
          <Pressable disabled={pdfLoading} onPress={generatePdf} style={({ pressed }) => [styles.pdfBtn, pressed && !pdfLoading && { opacity: 0.9 }, pdfLoading && { opacity: 0.6 }]}>
            <IconSymbol name="doc.richtext" size={18} color="#fff" />
            <ThemedText style={styles.pdfBtnText}>{pdfLoading ? 'Generando...' : 'Generar PDF'}</ThemedText>
          </Pressable>
          {lastReportName && <ThemedText style={styles.generatedText}>Último: {lastReportName}</ThemedText>}
        </View>
      </ScrollView>
      <ThemedText style={{ fontSize: 12, opacity: 0.7, textAlign: 'center', marginTop: 8 }}>
        Desarrollado por matusauce y GabrielOsbando, Todos los derechos reservados 2025 (c)
      </ThemedText>
      <ThemedText style={{ fontSize: 12, opacity: 0.8, textAlign: 'center', marginTop: 6 }}>
        Contacto: mp326246@gmail.com
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(79,70,229,0.1)',
    marginBottom: 4,
  },
  backIcon: {
    color: '#4f46e5',
  },
  backText: {
    fontWeight: '600',
    color: '#4f46e5',
  },
  section: {
    gap: 10,
    paddingVertical: 8,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  themeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.4)',
    backgroundColor: 'transparent',
  },
  themeBtnActive: {
    backgroundColor: 'rgba(79,70,229,0.15)',
    borderColor: '#4f46e5',
  },
  themeBtnText: {
    fontWeight: '600',
    color: '#4f46e5',
  },
  themeBtnTextActive: {
    color: '#4f46e5',
    textDecorationLine: 'underline',
  },
  muted: {
    opacity: 0.7,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  pdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4f46e5',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginTop: 4,
    justifyContent: 'center',
  },
  pdfBtnText: { color: '#fff', fontWeight: '700' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
  generatedText: { fontSize: 12, opacity: 0.7, marginTop: 4 },
});

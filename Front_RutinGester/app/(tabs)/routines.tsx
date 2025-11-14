import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useRoutine } from '@/contexts/routine-context';
import { useTabHistory } from '@/contexts/tab-history-context';
import { cancelDailyReminders, ensureDailyReminderIfNeeded, initNotifications, scheduleDailyReminder } from '@/utils/notifications';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';

export default function RoutinesScreen() {
  const { routines, builder } = useRoutine();
  const { previousTab } = useTabHistory();
  const [hour, setHour] = useState<string>('09');
  const [minute, setMinute] = useState<string>('00');
  const [saving, setSaving] = useState(false);

  const KEY = 'DAILY_REMINDER_TIME';

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(KEY);
        let hNum = 9;
        let mNum = 0;
        if (saved) {
          const [h, m] = saved.split(':');
          if (h && m) {
            const hn = Math.max(0, Math.min(23, parseInt(h, 10) || 9));
            const mn = Math.max(0, Math.min(59, parseInt(m, 10) || 0));
            setHour(String(hn).padStart(2,'0'));
            setMinute(String(mn).padStart(2,'0'));
            hNum = hn; mNum = mn;
          }
        }
        // Pedir permisos y asegurar que la notificación diaria exista usando la hora cargada (si ya hay una, no se duplica)
        try {
          await initNotifications();
          await ensureDailyReminderIfNeeded(hNum, mNum);
        } catch {}
      } catch {}
    })();
  }, []);

  const persistAndSchedule = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // Pedir permisos si aún no se concedieron
      const granted = await initNotifications();
      if (!granted) {
        console.warn('[Reminder] Permisos de notificación no concedidos');
      }
      // Validar rango
      const hNum = Math.max(0, Math.min(23, parseInt(hour || '0', 10)));
      const mNum = Math.max(0, Math.min(59, parseInt(minute || '0', 10)));
      const hStr = String(hNum).padStart(2, '0');
      const mStr = String(mNum).padStart(2, '0');
      setHour(hStr);
      setMinute(mStr);
      await SecureStore.setItemAsync(KEY, `${hStr}:${mStr}`);
      // Reprogramar recordatorio diario
      await cancelDailyReminders();
      const id = await scheduleDailyReminder(hNum, mNum);
      if (id) {
        console.log('[Reminder] Programado daily reminder id:', id, 'a las', hStr + ':' + mStr);
      }
    } catch (e) {
      console.warn('[Reminder] No se pudo guardar el horario', e);
    } finally {
      setSaving(false);
    }
  };

  const pickColor = (index: number) => {
    const isBlue = index % 2 === 0;
    return {
      main: isBlue ? '#4f46e5' : '#64748b',
      tint: isBlue ? 'rgba(79,70,229,0.08)' : 'rgba(100,116,139,0.08)'
    } as const;
  };

  const handleCreate = () => {
    router.replace('/(tabs)/exercise-library');
  };

  const handleOpenRoutine = (id: string) => {
    router.push({ pathname: '/(tabs)/routine/[id]', params: { id } });
  };

  const incHour = () => setHour((h) => String((parseInt(h, 10) + 1) % 24).padStart(2, '0'));
  const decHour = () => setHour((h) => String((parseInt(h, 10) + 23) % 24).padStart(2, '0'));
  const incMinute = () => setMinute((m) => String((parseInt(m, 10) + 1) % 60).padStart(2, '0'));
  const decMinute = () => setMinute((m) => String((parseInt(m, 10) + 59) % 60).padStart(2, '0'));

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={routines}
        keyExtractor={(item) => item.id.toString()}
        ListFooterComponent={(
          <View style={[styles.reminderBox, { marginTop: 16 }] }>
            <ThemedText style={{ fontWeight: '700' }}>Recordatorio diario</ThemedText>
            <ThemedText style={styles.muted}>Ajusta la hora y minuto y guarda para recibir la notificación.</ThemedText>
            <View style={styles.timeAdjustGroup}>
              <View style={styles.timeColumn}>
                <ThemedText style={styles.timeLabel}>Hora</ThemedText>
                <View style={styles.adjustRow}>
                  <Pressable onPress={decHour} style={({ pressed }) => [styles.adjustBtn, pressed && { opacity: 0.75 }]}>
                    <IconSymbol name="chevron.down" size={16} color="#4f46e5" />
                  </Pressable>
                  <ThemedText style={styles.timeValue}>{hour}</ThemedText>
                  <Pressable onPress={incHour} style={({ pressed }) => [styles.adjustBtn, pressed && { opacity: 0.75 }]}>
                    <IconSymbol name="chevron.up" size={16} color="#4f46e5" />
                  </Pressable>
                </View>
              </View>
              <View style={styles.timeColumn}>
                <ThemedText style={styles.timeLabel}>Minutos</ThemedText>
                <View style={styles.adjustRow}>
                  <Pressable onPress={decMinute} style={({ pressed }) => [styles.adjustBtn, pressed && { opacity: 0.75 }]}>
                    <IconSymbol name="chevron.down" size={16} color="#4f46e5" />
                  </Pressable>
                  <ThemedText style={styles.timeValue}>{minute}</ThemedText>
                  <Pressable onPress={incMinute} style={({ pressed }) => [styles.adjustBtn, pressed && { opacity: 0.75 }]}>
                    <IconSymbol name="chevron.up" size={16} color="#4f46e5" />
                  </Pressable>
                </View>
              </View>
            </View>
            <Pressable onPress={persistAndSchedule} disabled={saving} style={({ pressed }) => [styles.saveBtn, pressed && !saving && { opacity: 0.9 }, saving && { opacity: 0.6 }]}>
              <IconSymbol name="bell.fill" size={16} color="#fff" />
              <ThemedText style={styles.saveBtnText}>{saving ? 'Guardando…' : 'Guardar horario'}</ThemedText>
            </Pressable>
          </View>
        )}
        contentContainerStyle={{ gap: 12, paddingTop: 8, paddingBottom: 40 }}
        ListHeaderComponent={(
          <View style={{ gap: 12 }}>
            {previousTab && previousTab !== '/(tabs)/routines' && (
              <Pressable onPress={() => router.replace(previousTab as any)} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}>
                <IconSymbol name="chevron.left" size={20} color={styles.backIcon.color as string} />
                <ThemedText style={styles.backText}>Atrás</ThemedText>
              </Pressable>
            )}
            <ThemedText type="title" style={{ marginTop: previousTab ? 4 : 0 }}>Mis Rutinas</ThemedText>
            <Pressable onPress={handleCreate} style={({ pressed }) => [styles.createButton, pressed && { opacity: 0.9 }]}>
              <IconSymbol name="plus.circle.fill" size={22} color="#ffffff" />
              <ThemedText style={styles.createButtonText}>Crear rutina</ThemedText>
            </Pressable>
            {builder.length > 0 && (
              <ThemedText style={{ opacity: 0.7 }}>
                Rutina en construcción: {builder.length} ejercicio(s) seleccionados
              </ThemedText>
            )}
            {routines.length === 0 && (
              <ThemedView style={styles.emptyBox}>
                <ThemedText style={styles.emptyText}>Usuario sin rutinas</ThemedText>
                <ThemedText style={styles.emptyHint}>Toca "Crear rutina" para comenzar.</ThemedText>
              </ThemedView>
            )}
          </View>
        )}
        renderItem={({ item, index }) => {
          const color = pickColor(index);
          return (
            <Pressable
              onPress={() => handleOpenRoutine(item.id.toString())}
              style={({ pressed }) => [
                styles.card,
                { borderLeftWidth: 4, borderLeftColor: color.main, backgroundColor: color.tint },
                pressed && { opacity: 0.95 },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color.main }} />
                  <ThemedText type="subtitle" style={{ fontWeight: '800' }}>{item.name}</ThemedText>
                </View>
                <ThemedText style={styles.muted}>Ver</ThemedText>
              </View>
            </Pressable>
          );
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  reminderBox: {
    marginTop: 4,
    padding: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.25)',
    backgroundColor: 'rgba(79,70,229,0.06)',
    gap: 8,
  },
  timeAdjustGroup: { flexDirection: 'row', gap: 18, marginTop: 4 },
  timeColumn: { flex: 1, gap: 6 },
  timeLabel: { fontSize: 12, opacity: 0.7, fontWeight: '600' },
  adjustRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'space-between' },
  adjustBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, backgroundColor: 'rgba(79,70,229,0.12)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(79,70,229,0.35)' },
  timeValue: { fontWeight: '800', fontSize: 18, minWidth: 40, textAlign: 'center' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
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
  },
  backText: {
    fontWeight: '600',
    color: '#4f46e5',
  },
  backIcon: {
    color: '#4f46e5',
  },
  createButton: {
    marginTop: 4,
    backgroundColor: '#22c55e',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    // Sombra ligera
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  createButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  emptyBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.2)',
    alignItems: 'center',
    gap: 6,
  },
  emptyText: {
    fontWeight: '700',
  },
  emptyHint: {
    opacity: 0.7,
  },
  card: {
    gap: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.2)',
  },
  muted: {
    opacity: 0.7,
  },
});

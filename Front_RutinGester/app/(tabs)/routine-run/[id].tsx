import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getExerciseById } from '@/constants/exercises';
import { useActiveRun } from '@/contexts/active-run-context';
import { useRoutine } from '@/contexts/routine-context';
import { cancelScheduledNotification, scheduleTimerEndNotification } from '@/utils/notifications';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

export default function RoutineRunScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines } = useRoutine();
  const routine = routines.find((r) => r.id.toString() === id);
  const { registerRun, clearRun, pauseRun, isPaused, isRunning, setPauseHandler } = useActiveRun();

  const [index, setIndex] = useState(0);
  const [setNum, setSetNum] = useState(1);
  const [mode, setMode] = useState<'idle' | 'work' | 'rest'>('idle');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<number | null>(null);
  const [phaseTotal, setPhaseTotal] = useState(0);
  const scheduledNotifId = useRef<string | null>(null);
  const workEndSound = useRef<Audio.Sound | null>(null);
  const restEndSound = useRef<Audio.Sound | null>(null);
  const completeSound = useRef<Audio.Sound | null>(null);
  const alarmSound = useRef<Audio.Sound | null>(null);

  const current = routine?.exercises[index];
  // Al entrar a la pantalla (cada foco), reiniciar al primer ejercicio siempre
  useFocusEffect(
    React.useCallback(() => {
      if (!routine) return;
      // Limpiar timer y notificación previa por seguridad
      if (timerRef.current) {
        clearInterval(timerRef.current as unknown as number);
        timerRef.current = null;
      }
      if (scheduledNotifId.current) {
        cancelScheduledNotification(scheduledNotifId.current);
        scheduledNotifId.current = null;
      }
      (async () => { try { await alarmSound.current?.stopAsync(); } catch {} })();
      setIndex(0);
      setSetNum(1);
      setMode('idle');
      setSecondsLeft(0);
      setPhaseTotal(0);
    }, [routine?.id])
  );
  const info = getExerciseById(current?.id);
  const isTimed = !!current?.settings.workSeconds;
  const totalSets = current?.settings.sets ?? 3;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current as unknown as number);
      if (scheduledNotifId.current) cancelScheduledNotification(scheduledNotifId.current);
      (async () => {
        try {
          await workEndSound.current?.unloadAsync();
          await restEndSound.current?.unloadAsync();
          await completeSound.current?.unloadAsync();
          await alarmSound.current?.unloadAsync();
        } catch {}
      })();
    };
  }, []);

  // Registrar handler global de pausa para detener timers/sonidos desde el botón flotante
  useEffect(() => {
    const handler = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current as unknown as number);
        timerRef.current = null;
      }
      // Cancelar cualquier notificación programada (p. ej., fin de descanso) al pausar
      if (scheduledNotifId.current) {
        cancelScheduledNotification(scheduledNotifId.current);
        scheduledNotifId.current = null;
      }
      (async () => { try { await alarmSound.current?.stopAsync(); } catch {} })();
      // Reset visual del temporizador al pausar desde el botón global
      setMode('idle');
      setSecondsLeft(0);
      setPhaseTotal(0);
    };
    setPauseHandler(handler);
    return () => setPauseHandler(null);
  }, [setPauseHandler]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [{ sound: s1 }, { sound: s2 }, { sound: s3 }, { sound: sAlarm }] = await Promise.all([
          Audio.Sound.createAsync(require('../../../assets/sounds/beep-sound-8333.mp3')),
          Audio.Sound.createAsync(require('../../../assets/sounds/beep-sound-8333.mp3')),
          Audio.Sound.createAsync(require('../../../assets/sounds/beep-sound-8333.mp3')),
          Audio.Sound.createAsync(require('../../../assets/sounds/fire-alarm-beep-sound.mp3'), { shouldPlay: false, isLooping: true }),
        ]);
        if (!mounted) {
          await s1.unloadAsync();
          await s2.unloadAsync();
          await s3.unloadAsync();
          await sAlarm.unloadAsync();
          return;
        }
        workEndSound.current = s1;
        restEndSound.current = s2;
        completeSound.current = s3;
        alarmSound.current = sAlarm;
      } catch {}
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const play = async (kind: 'workEnd' | 'restEnd' | 'complete') => {
    try {
      if (kind === 'workEnd' && workEndSound.current) await workEndSound.current.replayAsync();
      else if (kind === 'restEnd' && restEndSound.current) await restEndSound.current.replayAsync();
      else if (kind === 'complete' && completeSound.current) await completeSound.current.replayAsync();
      else await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  // Reset counters when exercise changes
  useEffect(() => {
    if (!routine) return;
    setSetNum(1);
    setMode('idle');
  setSecondsLeft(0);
  setPhaseTotal(0);
      if (timerRef.current) {
        clearInterval(timerRef.current as unknown as number);
        timerRef.current = null;
      }
      (async () => { try { await alarmSound.current?.stopAsync(); } catch {} })();
  }, [index, routine?.id]);

  const start = () => {
    if (!current) return;
    // Caso especial: venimos de una PAUSA global y al volver el foco se reseteó la UI a 'idle' manteniendo isPaused=true.
    // En ese escenario queremos reiniciar completamente la ejecución como si fuera la primera vez.
    if (isPaused && mode === 'idle') {
      // Limpiar estado global de la ejecución anterior
      clearRun();
    }
    // Registrar rutina activa si no hay una en curso (puede haber quedado limpia por el bloque anterior)
    if (!isRunning) {
      registerRun(routine!.id, () => ({ secondsLeft, mode }));
    }
    // Asegurar que no quede ninguna notificación pendiente previa
    if (scheduledNotifId.current) { cancelScheduledNotification(scheduledNotifId.current); scheduledNotifId.current = null; }
    if (isPaused) {
      // Si estamos pausados y no era el caso especial (mode idle ya manejado), simplemente retomamos el intervalo actual
      if (mode === 'work') {
        resumeWorkInterval();
      } else if (mode === 'rest') {
        resumeRestInterval();
      } else {
        // Seguridad: si llegamos aquí con mode 'idle' (no debería tras clearRun), iniciar como nuevo
        // Forzar modo trabajo inicial
        // (No usamos return para continuar flujo estándar)
      }
      // Después de reanudar no continuamos con inicio fresco
      return;
    }
    if (isTimed) {
      setMode('work');
      const total = current.settings.workSeconds ?? 30;
      startCountdown(total, 'work', () => {
        play('workEnd');
        if (scheduledNotifId.current) { cancelScheduledNotification(scheduledNotifId.current); scheduledNotifId.current = null; }
        advanceAfterWork();
      });
    } else {
      // Para reps, no hay temporizador; el usuario marca completar set
      setMode('work');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const stop = () => {
  if (timerRef.current) clearInterval(timerRef.current as unknown as number);
    timerRef.current = null;
    setMode('idle');
    setSecondsLeft(0);
    (async () => { try { await alarmSound.current?.stopAsync(); } catch {} })();
    if (scheduledNotifId.current) { cancelScheduledNotification(scheduledNotifId.current); scheduledNotifId.current = null; }
    clearRun();
  };

  const advanceAfterWork = () => {
    if (!current) return;
    if (timerRef.current) {
      clearInterval(timerRef.current as unknown as number);
      timerRef.current = null;
    }
    if (scheduledNotifId.current) { cancelScheduledNotification(scheduledNotifId.current); scheduledNotifId.current = null; }
    // Si quedan sets, ir a descanso o a siguiente set
    if (setNum < (current.settings.sets ?? 3)) {
      setMode('rest');
      const rest = current.settings.restSeconds ?? 30;
      if (scheduledNotifId.current) cancelScheduledNotification(scheduledNotifId.current);
      scheduleTimerEndNotification(rest, { routineId: routine!.id }).then(id => { if (id) scheduledNotifId.current = id; }).catch(()=>{});
      // Iniciar alarma al comenzar descanso (timed)
      (async () => {
        try {
          await alarmSound.current?.setPositionAsync(0);
          await alarmSound.current?.playAsync();
        } catch {}
      })();
      startCountdown(rest, 'rest', () => {
        play('restEnd');
        (async () => { try { await alarmSound.current?.stopAsync(); } catch {} })();
        // Avanza a la siguiente serie automáticamente (timed) con clamp
        const upcomingSet = setNum + 1;
        setSetNum((n) => Math.min(totalSets, n + 1));
        scheduledNotifId.current = null; // permitir notificación de descanso ya mostrada
        if (upcomingSet <= totalSets) {
          const nextTotal = current.settings.workSeconds ?? 30;
          setMode('work');
          startCountdown(nextTotal, 'work', () => {
            play('workEnd');
            if (scheduledNotifId.current) { cancelScheduledNotification(scheduledNotifId.current); scheduledNotifId.current = null; }
            advanceAfterWork();
          });
        } else {
          // No quedan más sets de este ejercicio: pasar al siguiente o finalizar rutina
          play('complete');
          if (routine && index < routine.exercises.length - 1) {
            nextExercise();
          } else {
            finishRoutine();
          }
        }
      });
    } else {
      // No quedan más sets (entró vía else): pasar al siguiente o finalizar
      play('complete');
      if (routine && index < routine.exercises.length - 1) {
        nextExercise();
      } else {
        finishRoutine();
      }
    }
  };

  const completeRepSet = () => {
    // Para ejercicios de reps
    if (!current) return;
    if (setNum < (current.settings.sets ?? 3)) {
      setMode('rest');
      const rest = current.settings.restSeconds ?? 60;
      if (timerRef.current) clearInterval(timerRef.current as unknown as number);
      if (scheduledNotifId.current) cancelScheduledNotification(scheduledNotifId.current);
      scheduleTimerEndNotification(rest, { routineId: routine!.id }).then(id => { if (id) scheduledNotifId.current = id; }).catch(()=>{});
      (async () => {
        try {
          await alarmSound.current?.setPositionAsync(0);
          await alarmSound.current?.playAsync();
        } catch {}
      })();
      startCountdown(rest, 'rest', () => {
        play('restEnd');
        (async () => { try { await alarmSound.current?.stopAsync(); } catch {} })();
        const upcomingSet = setNum + 1;
        setSetNum((n) => Math.min(totalSets, n + 1));
        scheduledNotifId.current = null;
        if (upcomingSet <= totalSets) {
          setMode('work');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          play('complete');
          if (routine && index < routine.exercises.length - 1) {
            nextExercise();
          } else {
            finishRoutine();
          }
        }
      });
    } else {
      play('complete');
      if (routine && index < routine.exercises.length - 1) {
        nextExercise();
      } else {
        finishRoutine();
      }
    }
  };

  const prevExercise = () => {
    if (!routine) return;
    if (scheduledNotifId.current) { cancelScheduledNotification(scheduledNotifId.current); scheduledNotifId.current = null; }
    setIndex((i) => Math.max(0, i - 1));
  };
  const nextExercise = () => {
    if (!routine) return;
    if (timerRef.current) {
      clearInterval(timerRef.current as unknown as number);
      timerRef.current = null;
    }
    if (scheduledNotifId.current) { cancelScheduledNotification(scheduledNotifId.current); scheduledNotifId.current = null; }
    (async () => { try { await alarmSound.current?.stopAsync(); } catch {} })();
    if (index < routine.exercises.length - 1) {
      setIndex((i) => i + 1);
    } else {
      // Rutina finalizada
      play('complete');
      clearRun();
      router.replace('/(tabs)/routines');
    }
  };

  const finishRoutine = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current as unknown as number);
      timerRef.current = null;
    }
    if (scheduledNotifId.current) { cancelScheduledNotification(scheduledNotifId.current); scheduledNotifId.current = null; }
    (async () => { try { await alarmSound.current?.stopAsync(); } catch {} })();
    clearRun();
    router.replace('/(tabs)/routines');
  };

  const resumeWorkInterval = () => {
    startCountdown(secondsLeft, 'work', () => {
      play('workEnd');
      if (scheduledNotifId.current) { cancelScheduledNotification(scheduledNotifId.current); scheduledNotifId.current = null; }
      advanceAfterWork();
    });
  };

  const resumeRestInterval = () => {
    startCountdown(secondsLeft, 'rest', () => {
      play('restEnd');
      (async () => { try { await alarmSound.current?.stopAsync(); } catch {} })();
      const upcomingSet = setNum + 1;
      setSetNum((n) => Math.min(totalSets, n + 1));
      scheduledNotifId.current = null;
      if (upcomingSet <= totalSets) {
        if (isTimed) {
          const nextTotal = current!.settings.workSeconds ?? 30;
          setMode('work');
          startCountdown(nextTotal, 'work', () => {
            play('workEnd');
            if (scheduledNotifId.current) { cancelScheduledNotification(scheduledNotifId.current); scheduledNotifId.current = null; }
            advanceAfterWork();
          });
        } else {
          setMode('work');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      } else {
        play('complete');
        if (routine && index < routine.exercises.length - 1) {
          nextExercise();
        } else {
          finishRoutine();
        }
      }
    });
  };

  // Utilidad centralizada para evitar intervalos duplicados y saltos de segundos
  const startCountdown = (total: number, phase: 'work' | 'rest', onComplete: () => void) => {
    if (timerRef.current) {
      clearInterval(timerRef.current as unknown as number);
      timerRef.current = null;
    }
    setPhaseTotal(total);
    setSecondsLeft(total);
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = total - elapsed;
      if (remaining <= 0) {
        clearInterval(timerRef.current as unknown as number);
        timerRef.current = null;
        setSecondsLeft(0);
        onComplete();
      } else {
        setSecondsLeft(remaining);
      }
    }, 250) as unknown as number; // actualización más suave
  };
  if (!routine || !current || !info) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Rutina no encontrada</ThemedText>
        <Pressable onPress={() => router.replace('/(tabs)/routines')} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
          <IconSymbol name="chevron.left" size={22} color={styles.backIcon.color as string} />
          <ThemedText style={styles.backText}>Volver</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.replace({ pathname: '/(tabs)/routine/[id]', params: { id: routine.id } })} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
            <IconSymbol name="chevron.left" size={22} color={styles.backIcon.color as string} />
            <ThemedText style={styles.backText}>Volver</ThemedText>
          </Pressable>
          <ThemedText type="title" style={{ flex: 1, textAlign: 'right' }}>{routine.name}</ThemedText>
        </View>

        {mode !== 'idle' && (
          <View style={[styles.phaseBanner, mode === 'work' ? styles.bannerWork : styles.bannerRest]}>
            <IconSymbol name={mode === 'work' ? 'exclamationmark.triangle.fill' : 'moon.fill'} size={18} color="#fff" />
            <ThemedText type="title" style={styles.bannerTitle}>
              {mode === 'work' ? 'TRABAJO' : 'DESCANSO'}
            </ThemedText>
          </View>
        )}

        <View style={styles.card}>
          <Image source={{ uri: info.imageUri }} style={styles.image} />
          <View style={styles.cardBody}>
            <ThemedText type="subtitle" style={{ fontWeight: '800' }}>{info.title}</ThemedText>
            <ThemedText style={{ opacity: 0.7 }}>{current.group.toUpperCase()} • Ejercicio {index + 1} de {routine.exercises.length}</ThemedText>
            <View style={styles.progressRow}>
              <ThemedText style={styles.badge}>Serie {setNum}/{totalSets}</ThemedText>
              {isTimed ? (
                <ThemedText style={styles.badge}>Tiempo {current.settings.workSeconds ?? 30}s</ThemedText>
              ) : (
                <ThemedText style={styles.badge}>Reps {current.settings.reps ?? 10}</ThemedText>
              )}
              <ThemedText style={styles.badge}>Descanso {current.settings.restSeconds ?? (isTimed ? 30 : 60)}s</ThemedText>
            </View>
            {mode !== 'idle' && (
              <View style={styles.timerBox}>
                {isTimed || mode === 'rest' ? (
                  <>
                    <ThemedText type="title" style={styles.timerNumber}>{secondsLeft}s</ThemedText>
                    <View style={styles.progressBar}>
                      <View style={[
                        styles.progressFill,
                        { width: `${phaseTotal ? ((phaseTotal - secondsLeft) / phaseTotal) * 100 : 0}%` },
                        mode === 'work' ? styles.fillWork : styles.fillRest,
                      ]} />
                    </View>
                  </>
                ) : (
                  <ThemedText style={{ opacity: 0.7 }}>Haz tus repeticiones y toca "Completar set"</ThemedText>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={styles.controls}>
          <Pressable onPress={prevExercise} style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.85 }]}>
            <IconSymbol name="backward.end.fill" size={18} color="#4f46e5" />
            <ThemedText style={styles.ctrlText}>Anterior</ThemedText>
          </Pressable>
          {mode === 'idle' ? (
            <Pressable onPress={start} style={({ pressed }) => [styles.primaryBtn, pressed && { opacity: 0.9 }]}>
              <IconSymbol name="play.fill" size={18} color="#fff" />
              <ThemedText style={styles.primaryText}>Empezar</ThemedText>
            </Pressable>
          ) : (
            <Pressable onPress={stop} style={({ pressed }) => [styles.warnBtn, pressed && { opacity: 0.9 }]}>
              <IconSymbol name="stop.fill" size={18} color="#fff" />
              <ThemedText style={styles.primaryText}>Detener</ThemedText>
            </Pressable>
          )}
          <Pressable onPress={nextExercise} style={({ pressed }) => [styles.ctrlBtn, pressed && { opacity: 0.85 }]}>
            <ThemedText style={styles.ctrlText}>Siguiente</ThemedText>
            <IconSymbol name="forward.end.fill" size={18} color="#4f46e5" />
          </Pressable>
        </View>

        {!isTimed && mode !== 'rest' && (
          <Pressable onPress={completeRepSet} style={({ pressed }) => [styles.completeBtn, pressed && { opacity: 0.9 }]}>
            <IconSymbol name="checkmark.circle.fill" size={22} color="#fff" />
            <ThemedText style={styles.completeText}>Completar set</ThemedText>
          </Pressable>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  scrollContent: { paddingBottom: 32, gap: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(79,70,229,0.1)' },
  backText: { fontWeight: '600', color: '#4f46e5' },
  backIcon: { color: '#4f46e5' },
  card: { borderRadius: 16, overflow: 'hidden', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(127,127,127,0.25)' },
  image: { width: '100%', height: 220 },
  cardBody: { padding: 12, gap: 8 },
  progressRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { fontSize: 12, fontWeight: '700', backgroundColor: 'rgba(79,70,229,0.1)', color: '#4f46e5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  timerBox: { marginTop: 8, padding: 12, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(79,70,229,0.08)', borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(127,127,127,0.25)', gap: 8 },
  phaseBanner: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  bannerWork: { backgroundColor: '#16a34a' },
  bannerRest: { backgroundColor: '#4f46e5' },
  bannerTitle: { color: '#fff', fontWeight: '900' },
  timerNumber: { fontWeight: '900' },
  progressBar: { marginTop: 8, height: 10, alignSelf: 'stretch', borderRadius: 8, overflow: 'hidden', backgroundColor: 'rgba(127,127,127,0.2)' },
  progressFill: { height: '100%' },
  fillWork: { backgroundColor: '#22c55e' },
  fillRest: { backgroundColor: '#4f46e5' },
  controls: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ctrlBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 10, backgroundColor: 'rgba(79,70,229,0.1)' },
  ctrlText: { color: '#4f46e5', fontWeight: '700' },
  primaryBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#22c55e', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  warnBtn: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#ef4444', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  primaryText: { color: '#fff', fontWeight: '800' },
  completeBtn: { marginTop: 14, flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, backgroundColor: '#4f46e5' },
  completeText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

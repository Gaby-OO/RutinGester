import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getExerciseById } from '@/constants/exercises';
import type { Routine, RoutineExercise } from '@/contexts/routine-context';
import { useRoutine } from '@/contexts/routine-context';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { routines, deleteRoutine, removeExerciseFromRoutine, updateRoutineExercise } = useRoutine();
  
  // Find the routine from the global context state
  const routine = routines.find(r => r.id.toString() === id);

  // The context doesn't expose a loading state, so we'll assume it's loaded.
  // A more robust solution would be to add loading/error state to the context.
  if (!routine) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
        <ThemedText>Cargando rutina...</ThemedText>
      </ThemedView>
    );
  }

  const handleDelete = () => {
    if (!id) return;
    const numericId = parseInt(id, 10);
    if (!isNaN(numericId)) {
      deleteRoutine(numericId);
      router.replace('/(tabs)/routines');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.replace('/(tabs)/routines')} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
          <IconSymbol name="chevron.left" size={22} color={styles.backIcon.color as string} />
          <ThemedText style={styles.backText}>Volver</ThemedText>
        </Pressable>
        <ThemedText type="title" style={{ flex: 1, textAlign: 'right' }}>{routine.name}</ThemedText>
      </View>
      <Pressable
        onPress={() => router.push({ pathname: '/(tabs)/routine-run/[id]', params: { id: routine.id.toString() } })}
        style={({ pressed }) => [styles.playButton, pressed && { opacity: 0.9 }]}
      >
        <IconSymbol name="play.fill" size={20} color="#fff" />
        <ThemedText style={styles.playButtonText}>Empezar rutina</ThemedText>
      </Pressable>
      <Pressable
        onPress={handleDelete}
        style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.9 }]}
      >
        <ThemedText style={styles.deleteButtonText}>Eliminar rutina</ThemedText>
      </Pressable>
      <FlatList
        data={routine.exercises}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 14, paddingTop: 12 }}
        ListEmptyComponent={<ThemedText style={{ textAlign: 'center', marginTop: 20, opacity: 0.7 }}>Esta rutina no tiene ejercicios.</ThemedText>}
        renderItem={({ item }) => {
          const full = getExerciseById(item.id);
          return (
            <Pressable
              onPress={() => router.push({ pathname: '/(tabs)/routine-exercise/[exerciseId]', params: { exerciseId: item.id, routineId: id! } })}
              style={({ pressed }) => [styles.exerciseCard, pressed && { opacity: 0.9 }]}
            >
              <Image source={{ uri: full?.imageUri }} style={styles.imageThumb} />
              <View style={styles.exerciseContent}>
                <View style={styles.titleRow}>
                  <ThemedText type="subtitle" style={styles.exerciseTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.groupBadge}>{item.group.toUpperCase()}</ThemedText>
                </View>
                {full?.description && (
                  <ThemedText style={styles.description} numberOfLines={2}>{full.description}</ThemedText>
                )}
                {/* Controles de configuración por ejercicio */}
                {renderExerciseSettings(item as RoutineExercise)}
                <View style={styles.actionsRow}>
                  <Pressable
                    onPress={(e) => { e.stopPropagation(); id && removeExerciseFromRoutine(id, item.id); }}
                    style={({ pressed }) => [styles.removePill, pressed && { opacity: 0.75 }]}
                  >
                    <ThemedText style={styles.removePillText}>Quitar</ThemedText>
                  </Pressable>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
      <Pressable
        onPress={() => router.replace('/(tabs)/routines')}
        style={({ pressed }) => [styles.saveReturnButton, pressed && { opacity: 0.9 }]}
      >
        <IconSymbol name="checkmark.circle.fill" size={22} color="#fff" />
        <ThemedText style={styles.saveReturnText}>Guardar y volver</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
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
  card: {
    gap: 6,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.2)',
  },
  exerciseCard: {
    flexDirection: 'row',
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(79,70,229,0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.25)',
  },
  imageThumb: {
    width: 96,
    height: '100%',
  },
  exerciseContent: {
    flex: 1,
    padding: 12,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  exerciseTitle: {
    fontWeight: '700',
  },
  groupBadge: {
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(79,70,229,0.12)',
    color: '#4f46e5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  description: {
    fontSize: 12,
    opacity: 0.8,
    lineHeight: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  removePill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(239,68,68,0.12)',
  },
  removePillText: {
    color: '#ef4444',
    fontWeight: '700',
  },
  deleteButton: {
    marginTop: 12,
    backgroundColor: '#ef4444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  muted: {
    opacity: 0.7,
  },
  saveReturnButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  saveReturnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  playButton: {
    marginTop: 12,
    backgroundColor: '#22c55e',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  settingsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(79,70,229,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.25)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  stepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(79,70,229,0.12)',
  },
  chipText: {
    fontWeight: '700',
  },
});

function renderExerciseSettings(item: RoutineExercise) {
  // Render chips con stepper para sets, reps o tiempo, y descanso
  const isTimed = item.settings.workSeconds != null;
  const routineIdRef = (router as any).params?.id as string | undefined; // fallback si llegara a estar en params
  // Usamos hook dentro de componente superior; aquí accedemos por cierre
  // Para evitar hooks aquí, exponemos un puente a update desde el scope de componente
  // Este helper es convertido en factory en tiempo de render
  return (
    <SettingsRow item={item} isTimed={isTimed} />
  );
}

function SettingsRow({ item, isTimed }: { item: RoutineExercise; isTimed: boolean }) {
  const { updateRoutineExercise } = useRoutine();
  const { id } = useLocalSearchParams<{ id: string }>();
  const routineId = id!;
  const step = (field: 'sets' | 'reps' | 'workSeconds' | 'restSeconds', delta: number) => {
    const current = (item.settings as any)[field] ?? (field === 'sets' ? 3 : field === 'restSeconds' ? 60 : 10);
    let next = Math.max(0, current + delta);
    if (field === 'sets' && next === 0) next = 1;
    updateRoutineExercise(routineId, item.id, { [field]: next } as any);
  };
  return (
    <View style={styles.settingsRow}>
      <View style={styles.chip}>
        <Pressable
          onPress={(e) => { e.stopPropagation(); step('sets', -1); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.75 }]}
          accessibilityLabel="Disminuir series"
        >
          <IconSymbol name="minus" size={14} color="#4f46e5" />
        </Pressable>
        <ThemedText style={styles.chipText}>Series: {item.settings.sets ?? 3}</ThemedText>
        <Pressable
          onPress={(e) => { e.stopPropagation(); step('sets', +1); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.75 }]}
          accessibilityLabel="Aumentar series"
        >
          <IconSymbol name="plus" size={14} color="#4f46e5" />
        </Pressable>
      </View>
      {isTimed ? (
        <View style={styles.chip}>
          <Pressable
            onPress={(e) => { e.stopPropagation(); step('workSeconds', -5); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.75 }]}
            accessibilityLabel="Disminuir segundos de trabajo"
          >
            <IconSymbol name="minus" size={14} color="#4f46e5" />
          </Pressable>
          <ThemedText style={styles.chipText}>Trabajo: {item.settings.workSeconds ?? 30}s</ThemedText>
          <Pressable
            onPress={(e) => { e.stopPropagation(); step('workSeconds', +5); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.75 }]}
            accessibilityLabel="Aumentar segundos de trabajo"
          >
            <IconSymbol name="plus" size={14} color="#4f46e5" />
          </Pressable>
        </View>
      ) : (
        <View style={styles.chip}>
          <Pressable
            onPress={(e) => { e.stopPropagation(); step('reps', -1); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.75 }]}
            accessibilityLabel="Disminuir repeticiones"
          >
            <IconSymbol name="minus" size={14} color="#4f46e5" />
          </Pressable>
          <ThemedText style={styles.chipText}>Reps: {item.settings.reps ?? 10}</ThemedText>
          <Pressable
            onPress={(e) => { e.stopPropagation(); step('reps', +1); }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.75 }]}
            accessibilityLabel="Aumentar repeticiones"
          >
            <IconSymbol name="plus" size={14} color="#4f46e5" />
          </Pressable>
        </View>
      )}
      <View style={styles.chip}>
        <Pressable
          onPress={(e) => { e.stopPropagation(); step('restSeconds', -5); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.75 }]}
          accessibilityLabel="Disminuir segundos de descanso"
        >
          <IconSymbol name="minus" size={14} color="#4f46e5" />
        </Pressable>
        <ThemedText style={styles.chipText}>Descanso: {item.settings.restSeconds ?? 60}s</ThemedText>
        <Pressable
          onPress={(e) => { e.stopPropagation(); step('restSeconds', +5); }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.75 }]}
          accessibilityLabel="Aumentar segundos de descanso"
        >
          <IconSymbol name="plus" size={14} color="#4f46e5" />
        </Pressable>
      </View>
    </View>
  );
}

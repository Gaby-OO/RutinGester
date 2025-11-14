import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getExerciseById } from '@/constants/exercises';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

// Pantalla de detalle de ejercicio dentro del contexto de una rutina (solo lectura, sin botón de agregar)
export default function RoutineExerciseDetailScreen() {
  const { exerciseId, routineId } = useLocalSearchParams<{ exerciseId: string; routineId?: string }>();
  const info = getExerciseById(exerciseId);

  if (!info) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title">Ejercicio no encontrado</ThemedText>
        <Pressable onPress={() => router.replace('/(tabs)/routines')} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
          <IconSymbol name="chevron.left" size={22} color={styles.backIcon.color as string} />
          <ThemedText style={styles.backText}>Volver</ThemedText>
        </Pressable>
      </ThemedView>
    );
  }

  const goBack = () => {
    if (routineId) {
      router.replace({ pathname: '/(tabs)/routine/[id]', params: { id: routineId } });
    } else {
      router.replace('/(tabs)/routines');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={goBack} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
          <IconSymbol name="chevron.left" size={22} color={styles.backIcon.color as string} />
          <ThemedText style={styles.backText}>Volver</ThemedText>
        </Pressable>
      </View>
      <ThemedText type="title">{info.title}</ThemedText>
      <Image source={{ uri: info.imageUri }} style={styles.image} />
      <View style={{ height: 10 }} />
      {info.description && <ThemedText style={styles.desc}>{info.description}</ThemedText>}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 8 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(79,70,229,0.1)', alignSelf: 'flex-start' },
  backText: { fontWeight: '600', color: '#4f46e5' },
  backIcon: { color: '#4f46e5' },
  image: { width: '100%', height: 240, borderRadius: 14 },
  desc: { lineHeight: 18, opacity: 0.9 },
});

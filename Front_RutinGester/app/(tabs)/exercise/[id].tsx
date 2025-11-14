import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getExerciseById } from '@/constants/exercises';
import type { ExerciseItem } from '@/contexts/routine-context';
import { useRoutine } from '@/contexts/routine-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';


export default function ExerciseDetailScreen() {
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const info = getExerciseById(id);
  const { addToBuilder, builder } = useRoutine();

  const alreadyAdded = !!(id && builder.some((e) => e.id === id));

  const handleAdd = () => {
    if (id && info && !alreadyAdded) {
  addToBuilder({ id, title: info.title, group: info.group } as ExerciseItem);
      // Navegar explícitamente a la librería si venimos desde allí; si no, ir a Mis Rutinas
      if (source === 'library') {
        router.replace('/(tabs)/exercise-library');
      } else {
        router.replace('/(tabs)/routines');
      }
    }
  };

  if (!info) {
    return (
      <ThemedView style={styles.container}> 
        <ThemedText type="title">Ejercicio no encontrado</ThemedText>
        <ThemedText style={{ opacity: 0.7 }}>Verifica el enlace o selecciona otro ejercicio.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable
          onPress={() => {
            if (source === 'library') {
              router.replace('/(tabs)/exercise-library');
            } else {
              router.replace('/(tabs)/routines');
            }
          }}
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
        >
          <IconSymbol name="chevron.left" size={22} color={styles.backIcon.color as string} />
          <ThemedText style={styles.backText}>Volver</ThemedText>
        </Pressable>
      </View>
      <ThemedText type="title">{info.title}</ThemedText>
      <Image source={{ uri: info.imageUri }} style={styles.image} />
      <View style={{ height: 8 }} />
      <ThemedText>{info.description}</ThemedText>
      <Pressable
        disabled={alreadyAdded}
        onPress={handleAdd}
        style={({ pressed }) => [
          styles.addButton,
          pressed && !alreadyAdded && { opacity: 0.85 },
          alreadyAdded && { backgroundColor: 'rgba(127,127,127,0.3)' },
        ]}
      >
        <IconSymbol name="plus" size={22} color="#fff" />
        <ThemedText style={styles.addButtonText}>
          {alreadyAdded ? 'Ya agregado' : 'Agregar a mi rutina'}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

// group is now supplied by constants

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(79,70,229,0.1)',
    alignSelf: 'flex-start',
  },
  backText: {
    fontWeight: '600',
    color: '#4f46e5',
  },
  backIcon: {
    color: '#4f46e5',
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 12,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

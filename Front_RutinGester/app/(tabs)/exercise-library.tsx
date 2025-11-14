import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EXERCISES } from '@/constants/exercises';
import { useRoutine } from '@/contexts/routine-context';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImageBackground, Pressable, SectionList, StyleSheet, View } from 'react-native';

// Centralized EXERCISES from constants ensures same images and titles across app

export default function ExerciseLibraryScreen() {
  const { builder, saveRoutine } = useRoutine();
  const [savedVisible, setSavedVisible] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Secciones por grupo, manteniendo grilla de 2 columnas por sección
  const sections = useMemo(() => {
    const byGroup = {
      abs: EXERCISES.filter((e) => e.group === 'abs'),
      chest: EXERCISES.filter((e) => e.group === 'chest'),
      biceps: EXERCISES.filter((e) => e.group === 'biceps'),
      glutes: EXERCISES.filter((e) => e.group === 'glutes'),
      quadriceps: EXERCISES.filter((e) => e.group === 'quadriceps'),
      calves: EXERCISES.filter((e) => e.group === 'calves'),
    };
    const display: Record<string, string> = {
      abs: 'Abdominales',
      chest: 'Pectorales',
      biceps: 'Bíceps',
      glutes: 'Glúteos',
      quadriceps: 'Cuádriceps',
      calves: 'Gemelos',
    };
    const chunk2 = (arr: typeof EXERCISES) => {
      const rows: typeof EXERCISES[] = [] as any;
      for (let i = 0; i < arr.length; i += 2) rows.push(arr.slice(i, i + 2));
      return rows;
    };
    return (['abs', 'chest', 'biceps', 'glutes', 'quadriceps', 'calves'] as const)
      .map((key) => ({
        key,
        title: display[key],
        data: chunk2(byGroup[key]),
      }));
  }, []);
  return (
    <ThemedView style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.replace('/(tabs)/routines')} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}>
          <IconSymbol name="chevron.left" size={22} color={styles.backIcon.color as string} />
          <ThemedText style={styles.backText}>Volver</ThemedText>
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Selecciona un ejercicio</ThemedText>
      </View>
      {builder.length > 0 && (
        <Pressable
          onPress={async () => {
            // Llama a saveRoutine y espera el resultado
            const created = await saveRoutine('Nueva Rutina');
            
            // Si la rutina se creó exitosamente en el backend...
            if (created) {
              setSavedVisible(true);
              // esperar 1200ms para que el usuario vea el toast y luego navegar
              timeoutRef.current = setTimeout(() => {
                setSavedVisible(false);
                router.replace('/(tabs)/routines');
              }, 1200) as unknown as number;
            }
            // Si 'created' es null, el catch en el contexto ya mostró un error en la consola.
            // Se podría añadir un feedback de error aquí si se desea.
          }}
          style={({ pressed }) => [styles.saveButton, pressed && { opacity: 0.9 }]}
        >
          <IconSymbol name="plus.circle.fill" size={20} color="#fff" />
          <ThemedText style={styles.saveButtonText}>Guardar rutina ({builder.length})</ThemedText>
        </Pressable>
      )}
      {/* Toast feedback */}
      {savedVisible && (
        <View style={styles.toast} pointerEvents="none">
          <IconSymbol name="checkmark" size={18} color="#fff" />
          <ThemedText style={styles.toastText}>Rutina guardada</ThemedText>
        </View>
      )}
      <SectionList
        sections={sections}
        keyExtractor={(row, index) => (Array.isArray(row) ? row.map((e) => e.id).join('-') : String(index))}
        contentContainerStyle={{ gap: 16, paddingTop: 8, paddingBottom: 8 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <View style={styles.sectionLine} />
            <ThemedText style={styles.sectionTitle}>{section.title}</ThemedText>
            <View style={styles.sectionLine} />
          </View>
        )}
        renderItem={({ item }) => (
          <View style={styles.row}>
            {item.map((ex) => (
              <ExerciseCard
                key={ex.id}
                title={ex.title}
                imageUri={ex.imageUri}
                onPress={() => router.push({ pathname: '/(tabs)/exercise/[id]', params: { id: ex.id, source: 'library' } })}
              />
            ))}
            {item.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        )}
      />
    </ThemedView>
  );
}

function ExerciseCard({ title, imageUri, onPress }: { title: string; imageUri: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.95 }]}>
      <ImageBackground source={{ uri: imageUri }} style={styles.cardImage} imageStyle={styles.cardImageRadius}>
        <View style={styles.cardOverlay} />
        <View style={styles.cardContent}>
          <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  sectionTitle: {
    fontWeight: '800',
    opacity: 0.9,
  },
  sectionLine: {
    height: 1,
    flex: 1,
    backgroundColor: 'rgba(127,127,127,0.25)',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
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
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    flex: 1,
    height: 140,
  },
  cardImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardImageRadius: {
    borderRadius: 12,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 12,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    color: 'white',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,122,255,0.95)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    zIndex: 1000,
    elevation: 6,
  },
  toastText: {
    color: '#fff',
    fontWeight: '700',
    marginLeft: 6,
  },
});

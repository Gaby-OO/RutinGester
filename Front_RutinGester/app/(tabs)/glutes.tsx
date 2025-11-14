import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { EXERCISES } from '@/constants/exercises';
import { useRoutine } from '@/contexts/routine-context';
import { router } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

const TEMPLATE_GLUTES = EXERCISES.filter(e => e.group === 'glutes');

export default function GlutesRoutineScreen() {
    const { createRoutineFromTemplate } = useRoutine();
    const handleUseTemplate = async () => {
      const routine = await createRoutineFromTemplate('Plantilla Glúteos', TEMPLATE_GLUTES);
      if (routine) {
        router.replace({ pathname: '/(tabs)/routine/[id]', params: { id: routine.id.toString() } });
      }
    };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Pressable onPress={() => router.replace('/(tabs)')} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}>
          <IconSymbol name="chevron.left" size={20} color={styles.backIcon.color as string} />
          <ThemedText style={styles.backText}>Inicio</ThemedText>
        </Pressable>
        <ThemedText type="title">Glúteos</ThemedText>
        <ThemedText style={styles.paragraph}>Activa y fortalece glúteos con una base efectiva de empujes de cadera y puentes. Úsala como inicio y ajusta a tu nivel.</ThemedText>
        <ThemedText style={[styles.paragraph, { opacity: 0.8 }]}>Ejercicios incluidos inicialmente:</ThemedText>
        <View style={styles.grid}>
          {TEMPLATE_GLUTES.map(e => (
            <View key={e.id} style={styles.exerciseCard}>
              <Image source={{ uri: e.imageUri }} style={styles.thumbnail} />
              <ThemedText style={styles.exerciseTitle}>{e.title}</ThemedText>
            </View>
          ))}
        </View>
        <Pressable onPress={handleUseTemplate} style={({ pressed }) => [styles.useButton, pressed && { opacity: 0.9 }]}>
          <IconSymbol name="plus.circle.fill" size={22} color="#fff" />
          <ThemedText style={styles.useButtonText}>Agregar plantilla a mis rutinas</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 8,
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
  },
  backText: { fontWeight: '600', color: '#4f46e5' },
  backIcon: { color: '#4f46e5' },
  paragraph: {
    lineHeight: 20,
  },
  grid: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  exerciseCard: {
    width: '47%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(79,70,229,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(79,70,229,0.2)',
  },
  thumbnail: {
    width: '100%',
    height: 90,
  },
  exerciseTitle: {
    padding: 8,
    fontWeight: '600',
  },
  useButton: {
    marginTop: 16,
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
  useButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

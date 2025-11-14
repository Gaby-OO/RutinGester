import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useTabHistory } from '@/contexts/tab-history-context';
import { Link, router } from 'expo-router';

export default function HomeScreen() {
  const { previousTab } = useTabHistory();
  return (
    <ParallaxScrollView
      headerHeight={0}
    >
      {previousTab && (
        <Pressable onPress={() => router.replace(previousTab as any)} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}>
          <IconSymbol name="chevron.left" size={20} color={styles.backIcon.color as string} />
          <ThemedText style={styles.backText}>Atrás</ThemedText>
        </Pressable>
      )}
      {/* Tarjetas de rutinas destacadas */}
      <View style={{ gap: 12, marginBottom: 8 }}>
        <RoutineCard
          title="ABDOMINALES"
          subtitle="Intermedio · 62 kcal"
          imageUri="https://i0.wp.com/www.muscleandfitness.com/wp-content/uploads/2019/01/Birds-Eye-Shot-of-Man-Doing-Crunches-On-Yoga-Mat.jpg?quality=86&strip=all"
          href="/(tabs)/abs"
        />
        <RoutineCard
          title="PECTORALES"
          subtitle="Intermedio · 220 kcal"
          imageUri="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1200&auto=format&fit=crop"
          href="/(tabs)/chest"
        />
        <RoutineCard
          title="BÍCEPS"
          subtitle="Principiante · 120 kcal"
          imageUri="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT85XS0MBf4JI1SciP7Z9kIxh_q_R9bh2oXSxeji72aOCnAdF3a_3fQmsxi7_091idsb2g&usqp=CAU"
          href="/(tabs)/biceps"
        />
        <RoutineCard
          title="GLÚTEOS"
          subtitle="Intermedio · 180 kcal"
          imageUri="https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1200&auto=format&fit=crop"
          href="/(tabs)/glutes"
        />
        <RoutineCard
          title="CUÁDRICEPS"
          subtitle="Intermedio · 210 kcal"
          imageUri="https://media.revistagq.com/photos/68b94e687908532b57e78f35/4:3/w_5056,h_3792,c_limit/1287874606"
          href="/(tabs)/quadriceps"
        />
        <RoutineCard
          title="GEMELOS"
          subtitle="Principiante · 90 kcal"
          imageUri="https://hips.hearstapps.com/hmg-prod/images/gemelos-mancuernas-1554202711.jpg"
          href="/(tabs)/calves"
        />
      </View>
      <View style={{ marginTop: 16, alignItems: 'center', paddingBottom: 8 }}>
        <ThemedText style={{ fontSize: 12, opacity: 0.7, textAlign: 'center' }}>
          Desarrollado por matusauce y GabrielOsbando, Todos los derechos reservados 2025 (c)
        </ThemedText>
      </View>
    </ParallaxScrollView>
  );
}

type RoutineCardProps = {
  title: string;
  subtitle: string;
  imageUri: string;
  href:
    | '/(tabs)/abs'
    | '/(tabs)/chest'
    | '/(tabs)/biceps'
    | '/(tabs)/glutes'
    | '/(tabs)/quadriceps'
    | '/(tabs)/calves';
};

function RoutineCard({ title, subtitle, imageUri, href }: RoutineCardProps) {
  return (
    <Link href={href} asChild>
      <Pressable style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }] }>
        <ImageBackground source={{ uri: imageUri }} style={styles.cardImage} imageStyle={styles.cardImageRadius}>
          <View style={styles.cardOverlay} />
          <View style={styles.cardContent}>
            <ThemedText type="title" style={styles.cardTitle}>{title}</ThemedText>
            <ThemedText style={styles.cardSubtitle}>{subtitle}</ThemedText>
          </View>
        </ImageBackground>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  headerBlock: {
    gap: 6,
    marginBottom: 12,
  },
  muted: {
    opacity: 0.7,
  },
  card: {
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.2)',
    marginBottom: 16,
  },
  primaryBtn: {
    marginTop: 4,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#4f46e5',
  },
  primaryBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  cardImage: {
    height: 140,
    width: '100%',
    justifyContent: 'flex-end',
  },
  cardImageRadius: {
    borderRadius: 12,
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    color: 'white',
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardSubtitle: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.9)',
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
    marginBottom: 8,
  },
  backText: {
    fontWeight: '600',
    color: '#4f46e5',
  },
  backIcon: {
    color: '#4f46e5',
  },
  quickGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(127,127,127,0.2)',
  },
  quickEmoji: {
    fontSize: 22,
  },
  quickLabel: {
    fontWeight: '600',
  },
  
  progressBarBg: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(127,127,127,0.25)',
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '35%',
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 999,
  },
});

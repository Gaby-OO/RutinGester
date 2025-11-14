import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useToast } from '@/components/ui/toast';
import { useAuth } from '@/contexts/auth-context';
import { useTabHistory } from '@/contexts/tab-history-context';
import { useThemeMode } from '@/contexts/theme-context';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

export default function ProfileScreen() {
  const { previousTab } = useTabHistory();
  const { user, saveProfile, updateProfile, logout } = useAuth();
  const { effectiveScheme } = useThemeMode();
  const { show } = useToast();

  const [name, setName] = useState(user?.nombre || '');
  const [lastName, setLastName] = useState(user?.apellido || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.telefono || '');

  useEffect(() => {
    setName(user?.nombre || '');
    setLastName(user?.apellido || '');
    setEmail(user?.email || '');
    setPhone(user?.telefono || '');
  }, [user?.nombre, user?.apellido, user?.email, user?.telefono]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]?.uri) {
      updateProfile({ avatarUri: result.assets[0].uri });
    }
  };

  const handleSave = async () => {
    const patch = { nombre: name.trim(), apellido: lastName.trim(), email: email.trim(), telefono: phone.trim() };
    const res = await saveProfile(patch);
    if (res.ok) {
      show('Perfil guardado', { type: 'success' });
    } else {
      show(res.error || 'Error guardando perfil', { type: 'error' });
    }
  };

  const handleLogout = async () => {
    await logout();
  };
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Gear arriba derecha fija */}
        <Pressable onPress={() => router.push('/(tabs)/settings')} style={({ pressed }) => [styles.gearBtn, pressed && { opacity: 0.85 }]}>
          <IconSymbol name="gearshape.fill" size={28} color={styles.gearIcon.color as string} />
        </Pressable>
        {/* Back solo si venimos de otro tab */}
        {previousTab && previousTab !== '/(tabs)/profile' && (
          <Pressable onPress={() => router.replace(previousTab as any)} style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.8 }]}>
            <IconSymbol name="chevron.left" size={20} color={styles.backIcon.color as string} />
            <ThemedText style={styles.backText}>Atrás</ThemedText>
          </Pressable>
        )}
        <View style={styles.headerBlock}>
          <Image source={{ uri: user?.avatarUri || 'https://i.pravatar.cc/512' }} style={styles.avatarLarge} />
          <Pressable onPress={pickImage} style={({ pressed }) => [styles.changePhotoBtn, pressed && { opacity: 0.9 }]}>
            <IconSymbol name="camera.fill" size={18} color="#fff" />
            <ThemedText style={styles.changePhotoText}>Cambiar foto</ThemedText>
          </Pressable>
          <ThemedText type="title" style={styles.name}>{(user?.nombre || 'Usuario') + ' ' + (user?.apellido || '').trim()}</ThemedText>
          <ThemedText style={styles.roleChipLight}>{(user?.role || 'cliente').toUpperCase()}</ThemedText>
        </View>

        <View style={styles.formSection}>
          <ThemedText type="subtitle">Datos personales</ThemedText>
          <View style={styles.field}>
            <ThemedText style={styles.label}>Nombre</ThemedText>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nombre"
              style={[styles.input, effectiveScheme === 'dark' ? styles.inputDark : styles.inputLight]}
              placeholderTextColor={effectiveScheme === 'dark' ? '#bbb' : '#666'}
            />
          </View>
          <View style={styles.field}>
            <ThemedText style={styles.label}>Apellido</ThemedText>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Apellido"
              style={[styles.input, effectiveScheme === 'dark' ? styles.inputDark : styles.inputLight]}
              placeholderTextColor={effectiveScheme === 'dark' ? '#bbb' : '#666'}
            />
          </View>
          <View style={styles.field}>
            <ThemedText style={styles.label}>Correo electrónico</ThemedText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              style={[styles.input, effectiveScheme === 'dark' ? styles.inputDark : styles.inputLight]}
              placeholderTextColor={effectiveScheme === 'dark' ? '#bbb' : '#666'}
            />
          </View>
          <View style={styles.field}>
            <ThemedText style={styles.label}>Teléfono</ThemedText>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="(000) 000-0000"
              keyboardType="phone-pad"
              style={[styles.input, effectiveScheme === 'dark' ? styles.inputDark : styles.inputLight]}
              placeholderTextColor={effectiveScheme === 'dark' ? '#bbb' : '#666'}
            />
          </View>
          <Pressable onPress={handleSave} style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.9 }]}>
            <IconSymbol name="checkmark.seal.fill" size={18} color="#fff" />
            <ThemedText style={styles.saveText}>Guardar cambios</ThemedText>
          </Pressable>
        </View>

        <View style={styles.actionsSection}>
          <Pressable onPress={handleLogout} style={({ pressed }) => [styles.logoutBtn, pressed && { opacity: 0.9 }]}>
            <IconSymbol name="arrow.backward.square.fill" size={18} color="#fff" />
            <ThemedText style={styles.logoutText}>Cerrar sesión</ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 12,
  },
  gearBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(79,70,229,0.12)',
  },
  gearIcon: {
    color: '#ffffff',
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
  backIcon: { color: '#4f46e5' },
  headerBlock: {
    alignItems: 'center',
    gap: 10,
    marginTop: 72,
  },
  avatarLarge: {
    width: 160,
    height: 160,
    borderRadius: 80,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  changePhotoBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  changePhotoText: { color: '#fff', fontWeight: '700' },
  name: { marginTop: 4 },
  roleChipLight: {
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(0,122,255,0.18)',
    color: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    letterSpacing: 0.5,
  },
  muted: { opacity: 0.7 },
  formSection: {
    marginTop: 18,
    gap: 12,
  },
  field: {
    gap: 6,
  },
  label: {
    fontWeight: '600',
    opacity: 0.85,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(79,70,229,0.25)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(79,70,229,0.05)',
  },
  inputLight: { color: '#111' },
  inputDark: { color: '#fff', backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.18)' },
  saveBtn: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    justifyContent: 'center',
    borderRadius: 10,
  },
  saveText: {
    color: '#fff',
    fontWeight: '700',
  },
  actionsSection: {
    marginTop: 20,
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
  logoutText: {
    color: '#fff',
    fontWeight: '700',
  },
});

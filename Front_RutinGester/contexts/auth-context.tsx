import { ensureDailyReminderIfNeeded, initNotifications } from '@/utils/notifications';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type UserRole = 'cliente' | 'entrenador';
export interface UserProfile {
  id: string;
  nombre: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  role: UserRole;
  avatarUri?: string;
  accessToken?: string;
  idToken?: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  loading: boolean;
  loginWithTokens: (role: UserRole, tokens: { access_token: string; id_token?: string }) => Promise<void>;
  loginWithCredentials: (email: string, password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, role: UserRole) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => void;
  saveProfile: (patch: Partial<UserProfile>) => Promise<{ ok: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SECURE_KEY = 'auth_tokens_v1';
const SECURE_PROFILE_KEY = 'user_profile_v1';

type StoredTokens = { access_token: string; id_token?: string; token_type?: string; refresh_token?: string };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión almacenada si el token sigue siendo válido
  useEffect(() => {
    const restore = async () => {
      try {
        setLoading(true);
        const raw = await SecureStore.getItemAsync(SECURE_KEY);
        if (!raw) {
          setUser(null);
          return;
        }
        const stored: StoredTokens = JSON.parse(raw);
        // Validación básica por id_token (si existe). Si no hay id_token, asumimos acceso válido sin claims.
        let decoded: any | null = null;
        if (stored.id_token) {
          try {
            decoded = jwtDecode(stored.id_token);
          } catch {
            decoded = null;
          }
        }
        const now = Date.now() / 1000;
        const notExpired = decoded?.exp ? decoded.exp > now : !!stored.access_token;
        if (notExpired) {
          const baseProfile: UserProfile = {
            id: decoded?.sub || 'auth0-user',
            nombre: decoded?.given_name || decoded?.name || 'Usuario',
            apellido: decoded?.family_name,
            email: decoded?.email,
            role: 'cliente',
            avatarUri: decoded?.picture,
            accessToken: stored.access_token,
            idToken: stored.id_token,
          };
          // Merge con perfil persistido localmente si existe
          try {
            const saved = await SecureStore.getItemAsync(SECURE_PROFILE_KEY);
            if (saved) {
              const local = JSON.parse(saved) as Partial<UserProfile>;
              setUser({ ...baseProfile, ...local });
            } else {
              setUser(baseProfile);
            }
          } catch {
            setUser(baseProfile);
          }
          // Inicializar notificaciones y asegurar recordatorio diario con hora guardada
          try {
            const granted = await initNotifications();
            if (granted) {
              const t = await SecureStore.getItemAsync('DAILY_REMINDER_TIME');
              let h = 9, m = 0;
              if (t) {
                const [hh, mm] = t.split(':');
                h = Math.max(0, Math.min(23, parseInt(hh || '9', 10)));
                m = Math.max(0, Math.min(59, parseInt(mm || '0', 10)));
              }
              await ensureDailyReminderIfNeeded(h, m);
            }
          } catch {}
        } else {
          await SecureStore.deleteItemAsync(SECURE_KEY);
          setUser(null);
        }
      } catch (e) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

  const updateProfile = (patch: Partial<UserProfile>) => setUser((prev) => (prev ? { ...prev, ...patch } : prev));

  const saveProfile = async (patch: Partial<UserProfile>) => {
    try {
      // Actualizar estado inmediato
      setUser((prev) => (prev ? { ...prev, ...patch } : prev));
      // Persistir localmente los campos básicos de perfil
      const toPersist = JSON.stringify({
        nombre: patch.nombre,
        apellido: patch.apellido,
        email: patch.email,
        telefono: patch.telefono,
        avatarUri: patch.avatarUri,
      });
      await SecureStore.setItemAsync(SECURE_PROFILE_KEY, toPersist);
      // Intentar sincronizar con servidor si hay API configurada
      const baseUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
      if (baseUrl && user?.id) {
        try {
          const res = await fetch(`${baseUrl}/profile/${encodeURIComponent(user.id)}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              ...(user.accessToken ? { Authorization: `Bearer ${user.accessToken}` } : {}),
            },
            body: JSON.stringify({ ...patch }),
          });
          if (!res.ok) {
            const t = await res.text().catch(() => '');
            return { ok: false, error: t || 'No se pudo sincronizar con el servidor' };
          }
        } catch (e: any) {
          return { ok: false, error: e.message || 'Error de red al sincronizar perfil' };
        }
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    }
  };

  const loginWithTokens = async (role: UserRole, tokens: { access_token: string; id_token?: string }) => {
    setLoading(true);
    try {
      let decoded: any = {};
      if (tokens.id_token) decoded = jwtDecode(tokens.id_token);
      console.log('[Auth] decoded id_token claims:', decoded);
      const profile: UserProfile = {
        id: decoded.sub || 'auth0-user',
        nombre: decoded.given_name || decoded.name || 'Usuario',
        apellido: decoded.family_name,
        email: decoded.email,
        role,
        avatarUri: decoded.picture,
        accessToken: tokens.access_token,
        idToken: tokens.id_token,
      };
      console.log('[Auth] setting user profile:', profile);
      setUser(profile);
      await SecureStore.setItemAsync(SECURE_KEY, JSON.stringify({ access_token: profile.accessToken, id_token: profile.idToken }));
      console.log('[Auth] tokens persisted in SecureStore');
      // Inicializar notificaciones y asegurar recordatorio diario
      try {
        const granted = await initNotifications();
        if (granted) {
          const t = await SecureStore.getItemAsync('DAILY_REMINDER_TIME');
          let h = 9, m = 0;
          if (t) {
            const [hh, mm] = t.split(':');
            h = Math.max(0, Math.min(23, parseInt(hh || '9', 10)));
            m = Math.max(0, Math.min(59, parseInt(mm || '0', 10)));
          }
          await ensureDailyReminderIfNeeded(h, m);
        }
      } catch {}
    } catch (e) {
      console.warn('loginWithTokens error', e);
    } finally {
      setLoading(false);
      console.log('[Auth] loading false after loginWithTokens');
    }
  };

  const domain = process.env.EXPO_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.EXPO_PUBLIC_AUTH0_CLIENT_ID;
  const connection = 'Username-Password-Authentication'; // ajustar si tu conexión tiene otro nombre

  const loginWithCredentials = async (email: string, password: string, role: UserRole) => {
    if (!domain || !clientId) return { ok: false, error: 'Faltan variables Auth0' };
    setLoading(true);
    try {
      const body = {
        grant_type: 'password',
        username: email,
        password,
        audience: process.env.EXPO_PUBLIC_AUTH0_AUDIENCE,
        scope: 'openid profile email',
        client_id: clientId,
      };
      const res = await fetch(`https://${domain}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        return { ok: false, error: data.error_description || 'Credenciales inválidas' };
      }
      await loginWithTokens(role, { access_token: data.access_token, id_token: data.id_token });
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: UserRole) => {
    if (!domain || !clientId) return { ok: false, error: 'Faltan variables Auth0' };
    setLoading(true);
    try {
      const body = {
        client_id: clientId,
        email,
        password,
        connection,
        user_metadata: { role },
      };
      const res = await fetch(`https://${domain}/dbconnections/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        return { ok: false, error: data.description || data.error || 'Error registrando' };
      }
      // Auto-login tras registro
      return await loginWithCredentials(email, password, role);
    } catch (e: any) {
      return { ok: false, error: e.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await SecureStore.deleteItemAsync(SECURE_KEY);
      setUser(null);
      console.log('[Auth] user logged out, tokens cleared');
    } catch (e) {
      console.warn('Logout error', e);
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({ user, loading, loginWithTokens, loginWithCredentials, register, logout, updateProfile, saveProfile }),
    [user, loading]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
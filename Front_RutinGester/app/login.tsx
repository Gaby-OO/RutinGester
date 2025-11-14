import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useAuth, UserRole } from "@/contexts/auth-context";
import * as AuthSession from "expo-auth-session";
import {
  CodeChallengeMethod,
  useAuthRequest,
  useAutoDiscovery,
} from "expo-auth-session";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import {
  Image,
  ImageBackground,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

// Completa sesión de navegador
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { loginWithTokens, loading } = useAuth();
  const domain =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_AUTH0_DOMAIN as string | undefined;
  const clientId =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_AUTH0_CLIENT_ID as string | undefined;

  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<UserRole>("cliente");
  const [error, setError] = useState<string | null>(null);

  const issuer = domain ? `https://${domain}` : undefined;
  const redirectUri = Platform.select({
    web: AuthSession.makeRedirectUri(),
    default: AuthSession.makeRedirectUri({ scheme: "rutingester" }),
  });

  useEffect(() => {
    console.log("redirectUri =", redirectUri);
  }, [redirectUri]);

  const discovery = useAutoDiscovery(issuer || "");
  const [loginRequest, loginResponse, promptLoginAsync] = useAuthRequest(
    {
      clientId: clientId || "",
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code,
      codeChallengeMethod: CodeChallengeMethod.S256,
    },
    discovery
  );
  const [signupRequest, signupResponse, promptSignupAsync] = useAuthRequest(
    {
      clientId: clientId || "",
      redirectUri,
      scopes: ["openid", "profile", "email"],
      responseType: AuthSession.ResponseType.Code,
      codeChallengeMethod: CodeChallengeMethod.S256,
      extraParams: { screen_hint: "signup" },
    },
    discovery
  );

  // Procesa login
  useEffect(() => {
    const run = async () => {
      if (!discovery) return;
      if (loginResponse?.type === "success" && loginResponse.params.code) {
        try {
          const tokenRes = await AuthSession.exchangeCodeAsync(
            {
              clientId: clientId || "",
              code: loginResponse.params.code,
              redirectUri: (loginRequest as any)?.redirectUri || redirectUri,
              extraParams: { code_verifier: loginRequest?.codeVerifier || "" },
            },
            { tokenEndpoint: discovery.tokenEndpoint! }
          );
          const access_token =
            (tokenRes as any).access_token ?? (tokenRes as any).accessToken;
          const id_token =
            (tokenRes as any).id_token ?? (tokenRes as any).idToken;
          if (access_token) {
            await loginWithTokens(role, { access_token, id_token });
          }
        } catch (e: any) {
          setError(e?.message || "Error intercambiando token");
        }
      }
    };
    run();
  }, [loginResponse, discovery]);

  // Procesa registro
  useEffect(() => {
    const run = async () => {
      if (!discovery) return;
      if (signupResponse?.type === "success" && signupResponse.params.code) {
        try {
          const tokenRes = await AuthSession.exchangeCodeAsync(
            {
              clientId: clientId || "",
              code: signupResponse.params.code,
              redirectUri: (signupRequest as any)?.redirectUri || redirectUri,
              extraParams: { code_verifier: signupRequest?.codeVerifier || "" },
            },
            { tokenEndpoint: discovery.tokenEndpoint! }
          );
          const access_token =
            (tokenRes as any).access_token ?? (tokenRes as any).accessToken;
          const id_token =
            (tokenRes as any).id_token ?? (tokenRes as any).idToken;
          if (access_token) {
            await loginWithTokens(role, { access_token, id_token });
          }
        } catch (e: any) {
          setError(e?.message || "Error intercambiando token");
        }
      }
    };
    run();
  }, [signupResponse, discovery]);

  // UI
  return (
    <ThemedView style={styles.container}>
      {/* Header visual con imagen */}
      <ImageBackground
  source={{
    uri: "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?cs=srgb&dl=pexels-victorfreitas-841130.jpg&fm=jpg",
  }}
  style={styles.hero}
  imageStyle={styles.heroImage}
  resizeMode="cover"
>
  <View style={styles.overlay} />

  {/* Contenedor centrado con logo y texto */}
  <View style={styles.heroContent}>
    <Image
      source={require("../assets/images/RutinGesterLogo.png")}
      style={styles.logo}
      resizeMode="contain"
    />
    <ThemedText style={styles.brandTitle}>RutinGester</ThemedText>
    <ThemedText style={styles.brandSubtitle}>
      Organiza. Mejora. Progresa.
    </ThemedText>
  </View>
</ImageBackground>

      {/* Card de login */}
      <View style={styles.card}>
        <View style={styles.modeSwitcher}>
          <Pressable
            onPress={() => setMode("login")}
            style={[styles.modeBtn, mode === "login" && styles.modeBtnActive]}
          >
            <ThemedText
              style={mode === "login" ? styles.modeActiveText : styles.modeText}
            >
              Iniciar sesión
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setMode("register")}
            style={[styles.modeBtn, mode === "register" && styles.modeBtnActive]}
          >
            <ThemedText
              style={
                mode === "register" ? styles.modeActiveText : styles.modeText
              }
            >
              Registrarse
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.roleRow}>
          <ThemedText style={styles.roleLabel}>Rol:</ThemedText>
          <Pressable
            onPress={() => setRole("cliente")}
            style={[
              styles.roleChip,
              role === "cliente" && styles.roleChipActive,
            ]}
          >
            <ThemedText
              style={
                role === "cliente"
                  ? styles.roleChipActiveText
                  : styles.roleChipText
              }
            >
              Cliente
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => setRole("entrenador")}
            style={[
              styles.roleChip,
              role === "entrenador" && styles.roleChipActive,
            ]}
          >
            <ThemedText
              style={
                role === "entrenador"
                  ? styles.roleChipActiveText
                  : styles.roleChipText
              }
            >
              Entrenador
            </ThemedText>
          </Pressable>
        </View>

        {error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

        {mode === "login" ? (
          <Pressable
            disabled={!loginRequest || loading}
            onPress={() => promptLoginAsync()}
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && { opacity: 0.9 },
              (!loginRequest || loading) && { opacity: 0.6 },
            ]}
          >
            <IconSymbol name="person.crop.circle.fill" size={22} color="#fff" />
            <ThemedText style={styles.btnText}>Entrar con Auth0</ThemedText>
          </Pressable>
        ) : (
          <Pressable
            disabled={!signupRequest || loading}
            onPress={() => promptSignupAsync()}
            style={({ pressed }) => [
              styles.btnPrimary,
              pressed && { opacity: 0.9 },
              (!signupRequest || loading) && { opacity: 0.6 },
            ]}
          >
            <IconSymbol name="plus.circle.fill" size={22} color="#fff" />
            <ThemedText style={styles.btnText}>Registrarme</ThemedText>
          </Pressable>
        )}

        <ThemedText style={styles.disclaimer}>
          Al continuar aceptas nuestros términos y política de privacidad.
        </ThemedText>
      </View>
    </ThemedView>
  );
}
const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#0d1117",
  paddingBottom: 40, // pequeño margen inferior
},

  hero: {
    height: 380, // altura más grande para cubrir todo el bloque superior
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },

  heroImage: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)", // leve sombra sobre la imagen
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },

  heroContent: {
    position: "absolute",
    top: "35%", // baja el bloque (ajustá a gusto)
    alignItems: "center",
    justifyContent: "center",
  },

  logo: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginBottom: 12,
  },

  brandTitle: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },

  brandSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 15,
    textAlign: "center",
    letterSpacing: 0.4,
  },

  card: {
  marginTop: -60, // antes estaba en -10, esto lo sube visualmente
  backgroundColor: "#161b22",
  borderRadius: 20,
  padding: 20,
  marginHorizontal: 20,
  shadowColor: "#000",
  shadowOpacity: 0.3,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
  alignItems: "center",
},

  modeSwitcher: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 10,
  },
  modeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  modeBtnActive: { backgroundColor: "#4f46e5" },
  modeText: { fontWeight: "600", color: "#4f46e5" },
  modeActiveText: { fontWeight: "700", color: "#fff" },

  roleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  roleLabel: { color: "#fff", fontWeight: "600" },
  roleChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  roleChipActive: { backgroundColor: "#4f46e5" },
  roleChipText: { fontSize: 12, fontWeight: "600", color: "#4f46e5" },
  roleChipActiveText: { fontSize: 12, fontWeight: "700", color: "#fff" },

  btnPrimary: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#4f46e5",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  errorText: { marginTop: 4, color: "#ef4444", fontWeight: "600" },
  disclaimer: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: "center",
    marginTop: 10,
  },
});


# Worker Chat IA (Cloudflare Workers AI)

Este directorio contiene un Worker para integrar un chat de IA gratuito usando Cloudflare Workers AI (modelo Llama 3.1 8B Instruct).

## Archivos
- `wrangler.toml`: Configuración del worker y binding AI.
- `src/index.ts`: Código que recibe mensajes y genera respuesta del modelo.

## Pasos de configuración
1. Instala Wrangler si no lo tienes:
   ```bash
   npm i -g wrangler
   ```
2. Inicia sesión (usa token nuevo, revoca cualquier token expuesto):
   ```bash
   wrangler login
   ```
3. Verifica que tu cuenta tenga Workers AI habilitado.
4. Desde este directorio (`worker/`):
   ```bash
   wrangler deploy
   ```
5. Obtendrás una URL: `https://rutinger-chat.<subdominio>.workers.dev`.
6. En tu app Expo añade en `app.json` (dentro de `expo.extra` o variables públicas) la variable:
   ```json
   "expo": { "extra": { "EXPO_PUBLIC_AI_ENDPOINT": "https://rutinger-chat.<subdominio>.workers.dev" } }
   ```
7. Reinicia el servidor de Expo para que la variable de entorno esté disponible.
8. La pantalla `chat.tsx` llamará al endpoint. Si falla, puedes mantener un fallback a Wikipedia.

## Seguridad
- NO expongas el token de Cloudflare en el cliente ni lo subas al repo.
- Revoca tokens viejos en Dashboard > Perfil > API Tokens.
- Limita el historial (ya se corta a los últimos 12 mensajes).

## Customización
- Ajusta `max_tokens` y `temperature` según prefieras.
- Para streaming necesitarías un enfoque distinto (SSE o WebSocket). Este MVP responde completo.

## Errores comunes
- `Cannot find module '@cloudflare/ai'`: Instálalo en el entorno del Worker (Wrangler lo resuelve lado servidor; localmente puede requerir `npm i @cloudflare/ai`).
- Permisos insuficientes: revisa que el token tenga permisos de Workers.

## Próximos pasos (opcionales)
- Moderación de entrada (bloquear insultos / contenido no deseado).
- Cache de respuestas populares.
- Botón para limpiar historial.

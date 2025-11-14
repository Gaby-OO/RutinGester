import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// --- IMPORTANTE ---
// Para desarrollo, usa la IP de tu máquina. No uses 'localhost'.
// En tu computadora, abre la terminal y escribe `ipconfig` (Windows) o `ifconfig` (macOS/Linux)
// para encontrar tu dirección IP (ej. 192.168.1.100).
// Reemplaza 'TU_IP_LOCAL' con esa dirección.
const API_BASE_URL = 'http://192.168.1.104:3000'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token de autenticación a las cabeceras
api.interceptors.request.use(
  async (config) => {
    // Asumimos que el token se guarda con la clave 'userToken'
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

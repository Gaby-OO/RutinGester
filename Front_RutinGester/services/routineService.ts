// services/routineService.ts
import type { Routine } from '@/contexts/routine-context';
import api from './api';

/**
 * Mapea los datos de una rutina del backend al formato del frontend.
 */
const mapBackendRoutineToFrontend = (backendRoutine: any): Routine => {
  return {
    id: backendRoutine.id_rutina,
    name: backendRoutine.nombre,
    descripcion: backendRoutine.descripcion,
    imagen_url: backendRoutine.imagen_url,
    exercises: backendRoutine.Ejercicios?.map((ej: any) => ({
      id: ej.slug, // <--- FIX: Use slug instead of id_ejercicio
      title: ej.nombre,
      group: ej.categoria,
      settings: {
        sets: ej.RutinaEjercicio?.series,
        reps: ej.RutinaEjercicio?.repeticiones,
        restSeconds: ej.RutinaEjercicio?.descanso_seg,
        notas: ej.RutinaEjercicio?.notas,
      },
    })) || [],
  };
};

/**
 * Obtiene todas las rutinas del backend.
 */
export const getRoutines = async (): Promise<Routine[]> => {
  try {
    const response = await api.get('/rutinas');
    // El backend devuelve un array de rutinas. Mapeamos cada una.
    return response.data.map(mapBackendRoutineToFrontend);
  } catch (error) {
    console.error('Error fetching routines in service:', error);
    throw error; // Re-lanzamos el error para que el llamador pueda manejarlo
  }
};

/**
 * Obtiene los detalles de una única rutina por su ID.
 */
export const getRoutineById = async (id: string): Promise<Routine> => {
  try {
    const response = await api.get(`/rutinas/${id}`);
    // Mapeamos la respuesta única.
    return mapBackendRoutineToFrontend(response.data);
  } catch (error) {
    console.error(`Error fetching routine with id ${id} in service:`, error);
    throw error;
  }
};

/**
 * Asocia un ejercicio a una rutina, o actualiza su configuración si ya existe.
 * @param routineId ID de la rutina.
 * @param exerciseData Datos de la asociación (ID del ejercicio, series, reps, etc.).
 */
export const addExerciseToRoutine = async (routineId: number, exerciseData: any): Promise<void> => {
  try {
    await api.post(`/rutinas/${routineId}/ejercicios`, exerciseData);
  } catch (error) {
    console.error(`Error adding/updating exercise in routine ${routineId}:`, error);
    throw error;
  }
};

/**
 * Desasocia un ejercicio de una rutina.
 * @param routineId ID de la rutina.
 * @param exerciseId ID del ejercicio.
 */
export const removeExerciseFromRoutine = async (routineId: number, exerciseId: string): Promise<void> => {
  try {
    await api.delete(`/rutinas/${routineId}/ejercicios/${exerciseId}`);
  } catch (error) {
    console.error(`Error removing exercise ${exerciseId} from routine ${routineId}:`, error);
    throw error;
  }
};


/**
 * Crea una nueva rutina en el backend.
 * @param routineData Los datos para la nueva rutina.
 */
export const createRoutine = async (routineData: { nombre: string; descripcion: string; ejercicios: any[] }): Promise<Routine> => {
  try {
    const response = await api.post('/rutinas', routineData);
    // Mapeamos la respuesta para que coincida con el formato del frontend.
    return mapBackendRoutineToFrontend(response.data);
  } catch (error) {
    console.error('Error creating routine in service:', error);
    throw error;
  }
};

/**
 * Elimina una rutina por su ID.
 * @param id El ID de la rutina a eliminar.
 */
export const deleteRoutine = async (id: number): Promise<void> => {
  try {
    await api.delete(`/rutinas/${id}`);
  } catch (error) {
    console.error(`Error deleting routine with id ${id} in service:`, error);
    throw error;
  }
};


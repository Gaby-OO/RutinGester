import React, { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import * as routineService from '../services/routineService';

export type ExerciseItem = {
  id: string;
  title: string;
  group: 'abs' | 'chest' | 'biceps' | 'glutes' | 'quadriceps' | 'calves';
};

export type ExerciseSettings = {
  // Repeticiones y series (para ejercicios de repeticiones)
  sets?: number;
  reps?: number;
  // Tiempos (para ejercicios cronometrados)
  workSeconds?: number;
  restSeconds?: number;
};

export type RoutineExercise = ExerciseItem & {
  settings: ExerciseSettings;
};

// Tipo ajustado para que coincida con el backend
export type Routine = {
  id: number; // El ID del backend es numérico
  name: string; // 'nombre' en el backend
  exercises: RoutineExercise[];
  descripcion?: string;
  imagen_url?: string;
};

type RoutineContextValue = {
  builder: RoutineExercise[]; // ejercicios seleccionados para la rutina en construcción (con ajustes)
  routines: Routine[]; // rutinas guardadas
  fetchRoutines: () => Promise<void>;
  addToBuilder: (item: ExerciseItem) => void;
  updateBuilderExercise: (exerciseId: string, patch: Partial<ExerciseSettings>) => void;
  removeFromBuilder: (id: string) => void;
  removeExerciseFromRoutine: (routineId: string, exerciseId: string) => void;
  updateRoutineExercise: (routineId: string, exerciseId: string, patch: Partial<ExerciseSettings>) => void;
  clearBuilder: () => void;
  saveRoutine: (name?: string) => Promise<Routine | null>;
  deleteRoutine: (id: number) => Promise<void>;
  createRoutine: (name: string, exercises: ExerciseItem[]) => Routine;
  createRoutineFromTemplate: (name: string, exercises: ExerciseItem[]) => Promise<Routine | null>;
};

const RoutineContext = createContext<RoutineContextValue | undefined>(undefined);

export function RoutineProvider({ children }: { children: React.ReactNode }) {
  const [builder, setBuilder] = useState<RoutineExercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);

  const fetchRoutines = useCallback(async () => {
    try {
      console.log('Fetching routines via routineService...');
      const fetchedRoutines = await routineService.getRoutines();
      setRoutines(fetchedRoutines);
      console.log('Routines fetched successfully:', fetchedRoutines.length);
    } catch (error) {
      console.error('Error fetching routines in context:', error);
      // Opcional: manejar el estado de error en la UI
    }
  }, []);

  useEffect(() => {
    // Cargar las rutinas cuando el proveedor se monta por primera vez
    fetchRoutines();
  }, [fetchRoutines]);

  const defaultSettingsFor = (item: ExerciseItem): ExerciseSettings => {
    if (item.id === 'plank' || item.id === 'jump-rope') {
      return { workSeconds: 30, restSeconds: 30, sets: 3 };
    }
    return { sets: 3, reps: 10, restSeconds: 60 };
  };

  const addToBuilder = (item: ExerciseItem) => {
    setBuilder((prev) =>
      prev.some((x) => x.id === item.id)
        ? prev
        : [...prev, { ...item, settings: defaultSettingsFor(item) }]
    );
  };
  const updateBuilderExercise = (exerciseId: string, patch: Partial<ExerciseSettings>) => {
    setBuilder((prev) =>
      prev.map((x) => (x.id === exerciseId ? { ...x, settings: { ...x.settings, ...patch } } : x))
    );
  };
  const removeFromBuilder = (id: string) => setBuilder((prev) => prev.filter((x) => x.id !== id));
  const removeExerciseFromRoutine = async (routineId: string, exerciseId: string) => {
    const numericRoutineId = parseInt(routineId, 10);
    if (isNaN(numericRoutineId)) return;

    try {
      // Llamada a la API
      await routineService.removeExerciseFromRoutine(numericRoutineId, exerciseId);
      // Actualización optimista del estado local
      setRoutines((prev) =>
        prev.map((r) =>
          r.id === numericRoutineId
            ? { ...r, exercises: r.exercises.filter((e) => e.id !== exerciseId) }
            : r
        )
      );
    } catch (error) {
      console.error('Error removing exercise from routine in context:', error);
      // Opcional: revertir el estado si la llamada a la API falla
    }
  };

  const updateRoutineExercise = async (routineId: string, exerciseId: string, patch: Partial<ExerciseSettings>) => {
    const numericRoutineId = parseInt(routineId, 10);
    if (isNaN(numericRoutineId)) return;

    const routine = routines.find(r => r.id === numericRoutineId);
    const exercise = routine?.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const updatedSettings = { ...exercise.settings, ...patch };
    
    try {
      // Llamada a la API (actúa como upsert)
      await routineService.addExerciseToRoutine(numericRoutineId, {
        ejercicioId: exerciseId,
        series: updatedSettings.sets,
        repeticiones: updatedSettings.reps,
        descanso_seg: updatedSettings.restSeconds,
        // Añade otros campos si es necesario
      });

      // Actualización optimista del estado local
      setRoutines((prev) =>
        prev.map((r) =>
          r.id === numericRoutineId
            ? {
                ...r,
                exercises: r.exercises.map((e) =>
                  e.id === exerciseId ? { ...e, settings: updatedSettings } : e
                ),
              }
            : r
        )
      );
    } catch (error) {
      console.error('Error updating exercise in routine in context:', error);
    }
  };
  const clearBuilder = () => setBuilder([]);

  const saveRoutine = async (name?: string): Promise<Routine | null> => {
    if (builder.length === 0) return null;
    
    const routineData = {
      nombre: name || `Rutina ${routines.length + 1}`,
      descripcion: 'Nueva rutina creada desde la app',
      ejercicios: builder.map(e => ({ 
        ejercicioId: e.id, 
        series: e.settings.sets,
        repeticiones: e.settings.reps,
        descanso_seg: e.settings.restSeconds
      }))
    };

    try {
      const newRoutine = await routineService.createRoutine(routineData);
      setRoutines((prev) => [newRoutine, ...prev]);
      clearBuilder();
      return newRoutine;
    } catch (error) {
      console.error('Error saving routine in context:', error);
      return null;
    }
  };

  const deleteRoutine = async (id: number) => {
    try {
      await routineService.deleteRoutine(id);
      setRoutines((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      console.error(`Error deleting routine in context:`, error);
    }
  };

  const createRoutine = (name: string, exercises: ExerciseItem[]): Routine => {
    // Esta función ahora es principalmente para uso local o debería llamar a saveRoutine
    const routine: Routine = {
      id: Date.now(), // ID temporal
      name,
      exercises: exercises.map((e) => ({ ...e, settings: defaultSettingsFor(e) })),
    };
    // No se añade directamente, se debería guardar en el backend
    // setRoutines((prev) => [routine, ...prev]);
    console.warn("createRoutine is deprecated, use saveRoutine instead.");
    return routine;
  };

  const createRoutineFromTemplate = async (name: string, exercises: ExerciseItem[]): Promise<Routine | null> => {
    if (exercises.length === 0) return null;

    const routineData = {
      nombre: name,
      descripcion: `Basada en la plantilla ${name}`,
      ejercicios: exercises.map(e => {
        const settings = defaultSettingsFor(e);
        return {
          ejercicioId: e.id,
          series: settings.sets,
          repeticiones: settings.reps,
          descanso_seg: settings.restSeconds,
        };
      })
    };

    try {
      const newRoutine = await routineService.createRoutine(routineData);
      setRoutines((prev) => [newRoutine, ...prev]);
      return newRoutine;
    } catch (error) {
      console.error('Error creating routine from template in context:', error);
      return null;
    }
  };

  const value = useMemo(
    () => ({
      builder,
      routines,
      fetchRoutines,
      addToBuilder,
      updateBuilderExercise,
      removeFromBuilder,
      removeExerciseFromRoutine,
      updateRoutineExercise,
      clearBuilder,
      saveRoutine,
      deleteRoutine,
      createRoutine,
      createRoutineFromTemplate, // <-- Exportar la nueva función
    }),
    [builder, routines, fetchRoutines]
  );
  return <RoutineContext.Provider value={value}>{children}</RoutineContext.Provider>;
}

export function useRoutine() {
  const ctx = useContext(RoutineContext);
  if (!ctx) throw new Error('useRoutine debe usarse dentro de RoutineProvider');
  return ctx;
}

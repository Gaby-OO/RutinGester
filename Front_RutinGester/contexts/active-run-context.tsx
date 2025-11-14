import React, { createContext, useCallback, useContext, useState } from 'react';

interface ActiveRunContextValue {
  routineId: string | null;
  isRunning: boolean;
  isPaused: boolean;
  secondsLeft: number | null;
  mode: 'work' | 'rest' | 'idle' | null;
  registerRun: (routineId: string, getSnapshot: () => { secondsLeft: number; mode: 'work'|'rest'|'idle' }) => void;
  clearRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  getSnapshotRef: () => { secondsLeft: number; mode: 'work'|'rest'|'idle' } | null;
  setPauseHandler: (fn: (() => void) | null) => void;
}

const ActiveRunContext = createContext<ActiveRunContextValue | undefined>(undefined);

export function ActiveRunProvider({ children }: { children: React.ReactNode }) {
  const [routineId, setRoutineId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [snapshotGetter, setSnapshotGetter] = useState<(() => { secondsLeft: number; mode: 'work'|'rest'|'idle' }) | null>(null);
  const [pauseHandler, setPauseHandlerState] = useState<(() => void) | null>(null);

  const registerRun = useCallback((id: string, getSnapshot: () => { secondsLeft: number; mode: 'work'|'rest'|'idle' }) => {
    setRoutineId(id);
    setIsRunning(true);
    setIsPaused(false);
    setSnapshotGetter(() => getSnapshot);
  }, []);

  const clearRun = useCallback(() => {
    setRoutineId(null);
    setIsRunning(false);
    setIsPaused(false);
    setSnapshotGetter(null);
    setPauseHandlerState(null);
  }, []);

  const pauseRun = useCallback(() => {
    if (!isRunning) return;
    setIsPaused(true);
    try { pauseHandler && pauseHandler(); } catch {}
  }, [isRunning, pauseHandler]);

  const resumeRun = useCallback(() => {
    if (!isRunning) return;
    setIsPaused(false);
  }, [isRunning]);

  const getSnapshotRef = useCallback(() => {
    return snapshotGetter ? snapshotGetter() : null;
  }, [snapshotGetter]);

  const setPauseHandler = useCallback((fn: (() => void) | null) => {
    setPauseHandlerState(() => (fn ? () => fn() : null));
  }, []);

  return (
    <ActiveRunContext.Provider value={{ routineId, isRunning, isPaused, secondsLeft: getSnapshotRef()?.secondsLeft ?? null, mode: getSnapshotRef()?.mode ?? null, registerRun, clearRun, pauseRun, resumeRun, getSnapshotRef, setPauseHandler }}>
      {children}
    </ActiveRunContext.Provider>
  );
}

export function useActiveRun() {
  const ctx = useContext(ActiveRunContext);
  if (!ctx) throw new Error('useActiveRun must be used within ActiveRunProvider');
  return ctx;
}

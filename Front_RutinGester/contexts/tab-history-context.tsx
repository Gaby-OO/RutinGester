import React, { createContext, useCallback, useContext, useState } from 'react';

type TabHistoryContextValue = {
  currentTab: TabPath | null;
  previousTab: TabPath | null;
  registerTabVisit: (tabPath: TabPath) => void;
};
export type TabPath = '/(tabs)/index' | '/(tabs)/routines' | '/(tabs)/profile';

const TabHistoryContext = createContext<TabHistoryContextValue | undefined>(undefined);

export function TabHistoryProvider({ children }: { children: React.ReactNode }) {
  const [currentTab, setCurrentTab] = useState<TabPath | null>(null);
  const [previousTab, setPreviousTab] = useState<TabPath | null>(null);

  const registerTabVisit = useCallback((tabPath: TabPath) => {
    setPreviousTab((prev) => (currentTab && currentTab !== tabPath ? currentTab : prev));
    setCurrentTab(tabPath);
  }, [currentTab]);

  return (
    <TabHistoryContext.Provider value={{ currentTab, previousTab, registerTabVisit }}>
      {children}
    </TabHistoryContext.Provider>
  );
}

export function useTabHistory() {
  const ctx = useContext(TabHistoryContext);
  if (!ctx) throw new Error('useTabHistory debe usarse dentro de TabHistoryProvider');
  return ctx;
}
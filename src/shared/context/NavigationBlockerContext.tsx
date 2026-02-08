import React, { createContext, useContext, useState, useCallback } from 'react';

type Blocker = (path: string) => void;

interface NavigationBlockerContextType {
  setBlocker: (blocker: Blocker | null) => void;
  blocker: Blocker | null;
}

const NavigationBlockerContext = createContext<NavigationBlockerContextType | undefined>(undefined);

export const NavigationBlockerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [blocker, setBlockerState] = useState<Blocker | null>(null);

  const setBlocker = useCallback((newBlocker: Blocker | null) => {
    setBlockerState(() => newBlocker);
  }, []);

  return (
    <NavigationBlockerContext.Provider value={{ blocker, setBlocker }}>
      {children}
    </NavigationBlockerContext.Provider>
  );
};

export const useNavigationBlocker = () => {
  const context = useContext(NavigationBlockerContext);
  if (context === undefined) {
    throw new Error('useNavigationBlocker must be used within a NavigationBlockerProvider');
  }
  return context;
};
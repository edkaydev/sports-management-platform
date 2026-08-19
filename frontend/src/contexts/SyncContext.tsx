import { createContext, useContext, useEffect, type ReactNode } from 'react';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

interface SyncContextValue {
  connected: boolean;
  emit: (event: string, data?: unknown) => void;
}

const SyncContext = createContext<SyncContextValue>({ connected: false, emit: () => {} });

export function SyncProvider({ children }: { children: ReactNode }) {
  const sync = useRealtimeSync();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        window.dispatchEvent(new Event('app:focus'));
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  return <SyncContext.Provider value={sync}>{children}</SyncContext.Provider>;
}

export function useSync() {
  return useContext(SyncContext);
}

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';

const SOCKET_URL = (typeof window !== 'undefined' && (import.meta as any).env?.VITE_WS_URL) || window.location.origin;
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT = 10;

export function useRealtimeSync() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const reconnectCount = useRef(0);
  const [connected, setConnected] = useState(false);

  const invalidateDomain = useCallback(
    (domain: string) => {
      const keyMap: Record<string, readonly unknown[]> = {
        athlete: queryKeys.athletes.all,
        sport: queryKeys.sports.all,
        team: queryKeys.teams.all,
        event: queryKeys.events.all,
        match: queryKeys.matches.all,
        scholarship: queryKeys.scholarships.all,
        contract: queryKeys.contracts.all,
        notification: queryKeys.notifications.all,
      };
      if (keyMap[domain]) {
        queryClient.invalidateQueries({ queryKey: keyMap[domain] as unknown[] });
      }
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
    [queryClient]
  );

  useEffect(() => {
    const token = localStorage.getItem('umu_token');
    if (!token) return;

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: RECONNECT_DELAY,
      reconnectionAttempts: MAX_RECONNECT,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      reconnectCount.current = 0;
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('sport:update', () => invalidateDomain('sport'));
    socket.on('team:update', () => invalidateDomain('team'));
    socket.on('athlete:update', () => invalidateDomain('athlete'));
    socket.on('event:update', () => invalidateDomain('event'));
    socket.on('match:update', () => invalidateDomain('match'));
    socket.on('scholarship:update', () => invalidateDomain('scholarship'));
    socket.on('contract:update', () => invalidateDomain('contract'));
    socket.on('notification:new', () => invalidateDomain('notification'));
    socket.on('news:update', () => {
      queryClient.invalidateQueries({ queryKey: ['public', 'news'] });
    });
    socket.on('slides:update', () => {
      queryClient.invalidateQueries({ queryKey: ['public', 'slides'] });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [invalidateDomain, queryClient]);

  const emit = useCallback((event: string, data?: unknown) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { connected, emit };
}

export function usePolling(queryKey: unknown[], fetcher: () => Promise<unknown>, options?: { interval?: number; enabled?: boolean }) {
  const interval = options?.interval ?? 30_000;
  const enabled = options?.enabled ?? true;

  return {
    queryKey,
    queryFn: fetcher,
    refetchInterval: enabled ? interval : false,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: Math.min(interval, 15_000),
    enabled,
  };
}

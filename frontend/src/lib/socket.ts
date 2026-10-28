import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

// The backend runs socket.io v2, so the client must stay on the v2 protocol.
let socket: SocketIOClient.Socket | null = null;

export function getSocket(): SocketIOClient.Socket {
  if (!socket) {
    socket = io({
      reconnection: true,
      reconnectionDelay: 500,
      transports: ['websocket'],
      upgrade: false,
    });
  }
  return socket;
}

type SocketHandlers = Record<string, (data: never) => void>;

/**
 * Subscribe to a socket.io room for the lifetime of the component and attach
 * event listeners. Re-subscribes automatically after reconnects. Handlers are
 * read through a ref, so callers may pass inline objects safely.
 */
export function useSocketRoom(
  room: string,
  handlers: SocketHandlers,
  params?: (string | number)[],
  unsubscribeOnCleanup = false,
): void {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;
  const events = Object.keys(handlers).sort().join(',');
  const paramsKey = params ? params.join(',') : '';

  useEffect(() => {
    const s = getSocket();
    const args = paramsKey ? [paramsKey.split(',')] : [];
    const subscribe = (): void => {
      s.emit('subscribe', room, ...args);
    };
    subscribe();
    s.on('connect', subscribe);
    const bound = events
      .split(',')
      .filter(Boolean)
      .map((event) => {
        const fn = (data: never): void => {
          handlersRef.current[event]?.(data);
        };
        s.on(event, fn);
        return { event, fn };
      });
    return () => {
      s.off('connect', subscribe);
      for (const { event, fn } of bound) {
        s.off(event, fn);
      }
      if (unsubscribeOnCleanup) {
        s.emit('unsubscribe', room, ...args);
      }
    };
  }, [room, events, paramsKey, unsubscribeOnCleanup]);
}

/** Fires the handler when the socket connection is lost / restored. */
export function useSocketConnectionState(onChange: (connected: boolean) => void): void {
  const ref = useRef(onChange);
  ref.current = onChange;
  useEffect(() => {
    const s = getSocket();
    const up = (): void => ref.current(true);
    const down = (): void => ref.current(false);
    s.on('connect', up);
    s.on('disconnect', down);
    return () => {
      s.off('connect', up);
      s.off('disconnect', down);
    };
  }, []);
}

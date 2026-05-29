import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../config/api';

const getSocketUrl = () => {
  try {
    const url = new URL(API_URL);
    return `${url.protocol}//${url.host}`;
  } catch (e) {
    // Fallback if URL parsing fails
    const { hostname, protocol } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.match(/^10\.|^192\.|^172\./)) {
      return `${protocol}//${hostname}:5001`;
    }
    return window.location.origin;
  }
};

export const useQrMenuSocket = (restaurantId?: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    const socketUrl = getSocketUrl();
    console.log(`[Socket] Connecting to ${socketUrl} for restaurant: ${restaurantId}`);

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 15,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[Socket] Connected successfully with ID: ${socket.id}`);
      setIsConnected(true);
      socket.emit('join_restaurant', restaurantId);
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected from WebSocket server. Reason: ${reason}`);
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error);
    });

    return () => {
      console.log('[Socket] Component unmounted. Disconnecting socket...');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [restaurantId]);

  const registerListener = (event: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  };

  const removeListener = (event: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  };

  const emitEvent = (event: string, data: any) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  };

  return {
    socket: socketRef.current,
    isConnected,
    on: registerListener,
    off: removeListener,
    emit: emitEvent
  };
};
export default useQrMenuSocket;

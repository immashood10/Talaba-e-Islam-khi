'use client';

// Subscribes to the Socket.IO live-status service (streaming/status-server)
// for real-time broadcast state and viewer count. Returns null until the
// first status event arrives; pages should treat null as "socket not
// available" and fall back to their fetch-based behavior.

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export interface LiveSocketStatus {
  isLive: boolean;
  viewers: number;
}

export function useLiveSocket(): LiveSocketStatus | null {
  const [status, setStatus] = useState<LiveSocketStatus | null>(null);

  useEffect(() => {
    const url =
      process.env.NEXT_PUBLIC_STATUS_URL ||
      `${window.location.protocol}//${window.location.hostname}:4000`;

    const socket = io(url, { transports: ['websocket', 'polling'] });
    socket.on('status', (s: LiveSocketStatus) => setStatus(s));
    socket.on('connect_error', () => {
      // status server not running - callers fall back to fetch-based status
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return status;
}

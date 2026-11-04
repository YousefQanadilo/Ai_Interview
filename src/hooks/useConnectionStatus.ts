import { useCallback, useEffect, useRef, useState } from 'react';

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'failed';

export interface ConnectionOptions {
  /** WebSocket URL of the live voice backend. */
  url: string;
  /** How long to wait before giving up on a connection attempt. */
  timeoutMs?: number;
}

/**
 * Opens the live-voice WebSocket with an explicit timeout so the student
 * sees "Connection failed" + a Retry button instead of a silent "Connecting..." forever.
 */
export function useConnectionStatus({ url, timeoutMs = 8000 }: ConnectionOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    if (socketRef.current) {
      socketRef.current.onopen = socketRef.current.onerror = socketRef.current.onclose = null;
      socketRef.current.close();
      socketRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    cleanup();
    setAttempt((n) => n + 1);
    setStatus('connecting');
    setError(null);

    let ws: WebSocket;
    try {
      ws = new WebSocket(url);
    } catch {
      setStatus('failed');
      setError('Invalid connection address.');
      return;
    }
    socketRef.current = ws;

    const fail = (message: string) => {
      cleanup();
      setStatus('failed');
      setError(message);
    };

    timerRef.current = window.setTimeout(
      () => fail(`Timed out after ${Math.round(timeoutMs / 1000)}s. The interview server may be offline.`),
      timeoutMs,
    );

    ws.onopen = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setStatus('connected');
    };
    ws.onerror = () => fail('Could not reach the interview server.');
    ws.onclose = () => fail('The connection was closed.');
  }, [url, timeoutMs, cleanup]);

  useEffect(() => cleanup, [cleanup]);

  return { status, error, attempt, connect, retry: connect, disconnect: cleanup, socket: socketRef };
}

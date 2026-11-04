import { useCallback, useEffect, useRef, useState } from 'react';

export type MicPermissionStatus =
  | 'idle'          // not requested yet
  | 'requesting'    // browser prompt is open
  | 'granted'
  | 'denied'        // user (or browser settings) blocked the mic
  | 'no-device'     // no microphone was found
  | 'unsupported';  // browser has no getUserMedia (or page is not https)

/**
 * Asks for microphone access BEFORE the live interview starts, so the
 * student never gets a surprise permission popup mid-session.
 * Works in Chrome and Safari (Safari has no Permissions API for "microphone",
 * so we fall back to calling getUserMedia directly).
 */
export function useMicrophonePermission() {
  const [status, setStatus] = useState<MicPermissionStatus>('idle');
  const [level, setLevel] = useState(0); // 0..1 live input level for the test meter
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const frameRef = useRef<number | null>(null);

  const stopStream = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    ctxRef.current?.close().catch(() => {});
    ctxRef.current = null;
    setLevel(0);
  }, []);

  // If permission was already granted earlier, skip straight to "granted" (Chrome only).
  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }
    navigator.permissions
      ?.query({ name: 'microphone' as PermissionName })
      .then((p) => {
        if (p.state === 'denied') setStatus('denied');
      })
      .catch(() => {
        /* Safari: Permissions API doesn't support "microphone" - ignore */
      });
    return stopStream;
  }, [stopStream]);

  const requestPermission = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported');
      return;
    }
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setStatus('granted');

      // Small level meter so the student can confirm the mic actually hears them.
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx: AudioContext = new AudioCtx();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setLevel(Math.min(1, avg / 90));
        frameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      const name = (err as DOMException)?.name;
      if (name === 'NotFoundError' || name === 'OverconstrainedError') setStatus('no-device');
      else if (name === 'NotAllowedError' || name === 'SecurityError') setStatus('denied');
      else setStatus('denied');
    }
  }, []);

  return { status, level, requestPermission, release: stopStream };
}

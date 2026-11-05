import React from 'react';
import { Mic, MicOff, Wifi, WifiOff, Loader2, RotateCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { useMicrophonePermission, MicPermissionStatus } from '../hooks/useMicrophonePermission';
import { useConnectionStatus, ConnectionStatus } from '../hooks/useConnectionStatus';

interface PreInterviewSetupProps {
  /** WebSocket URL for the live voice server. */
  serverUrl: string;
  timeoutMs?: number;
  /** Called once the mic is granted AND the server is connected. */
  onReady?: (socket: WebSocket | null) => void;
}

const micCopy: Record<MicPermissionStatus, { title: string; detail: string }> = {
  idle: { title: 'Microphone access needed', detail: 'We ask now so nothing pops up during your interview.' },
  requesting: { title: 'Waiting for permission…', detail: 'Click "Allow" in your browser prompt.' },
  granted: { title: 'Microphone ready', detail: 'Say something to test your input level.' },
  denied: {
    title: 'Microphone blocked',
    detail: 'Allow mic access from the address bar (Chrome) or Settings → Websites → Microphone (Safari), then try again.',
  },
  'no-device': { title: 'No microphone found', detail: 'Plug in a mic or headset, then try again.' },
  unsupported: { title: 'Microphone not supported', detail: 'Use a recent Chrome or Safari over https or localhost.' },
};

const connCopy: Record<ConnectionStatus, string> = {
  idle: 'Not connected',
  connecting: 'Connecting to interviewer…',
  connected: 'Connected',
  failed: 'Connection failed',
};

export const PreInterviewSetup: React.FC<PreInterviewSetupProps> = ({ serverUrl, timeoutMs, onReady }) => {
  const mic = useMicrophonePermission();
  const conn = useConnectionStatus({ url: serverUrl, timeoutMs });

  const micOk = mic.status === 'granted';
  const canRetryMic = ['idle', 'denied', 'no-device'].includes(mic.status);
  const ready = micOk && conn.status === 'connected';

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-panel-orange rounded-2xl w-full max-w-md p-6 space-y-5" data-testid="pre-interview-setup">
        <div>
          <h1 className="text-xl font-semibold">Before we start</h1>
          <p className="text-sm text-slate-400 mt-1">Two quick checks so your live interview starts smoothly.</p>
        </div>

        {/* Step 1: microphone */}
        <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-4" aria-live="polite">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 ${micOk ? 'text-emerald-400' : mic.status === 'idle' || mic.status === 'requesting' ? 'text-[#FF9D00]' : 'text-rose-400'}`}>
              {micOk ? <Mic className="w-5 h-5" /> : mic.status === 'requesting' ? <Loader2 className="w-5 h-5 animate-spin" /> : mic.status === 'idle' ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium" data-testid="mic-status">{micCopy[mic.status].title}</div>
              <div className="text-xs text-slate-400 mt-0.5">{micCopy[mic.status].detail}</div>
              {micOk && (
                <div className="mt-3 h-1.5 rounded-full bg-slate-800 overflow-hidden" aria-label="Microphone input level">
                  <div className="h-full bg-gradient-to-r from-[#FF7A1A] to-[#FFA84A] transition-[width] duration-75" style={{ width: `${Math.round(mic.level * 100)}%` }} />
                </div>
              )}
            </div>
          </div>
          {canRetryMic && (
            <button
              onClick={mic.requestPermission}
              className="mt-3 w-full rounded-lg bg-[#FF7A1A] hover:bg-[#FF9D00] text-slate-950 text-sm font-semibold py-2 transition-colors"
            >
              {mic.status === 'idle' ? 'Allow microphone' : 'Try again'}
            </button>
          )}
        </section>

        {/* Step 2: connection */}
        <section className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 ${micOk ? '' : 'opacity-50'}`} aria-live="polite">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 ${conn.status === 'connected' ? 'text-emerald-400' : conn.status === 'failed' ? 'text-rose-400' : 'text-slate-400'}`}>
              {conn.status === 'connecting' ? <Loader2 className="w-5 h-5 animate-spin" /> : conn.status === 'connected' ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium" data-testid="connection-status">{connCopy[conn.status]}</div>
              {conn.error && <div className="text-xs text-rose-300/90 mt-0.5">{conn.error}</div>}
              {conn.attempt > 1 && <div className="text-[11px] text-slate-500 mt-0.5">Attempt {conn.attempt}</div>}
            </div>
          </div>
          {micOk && conn.status === 'idle' && (
            <button onClick={conn.connect} className="mt-3 w-full rounded-lg border border-[#FF7A1A]/50 text-[#FFA84A] hover:bg-[#FF7A1A]/10 text-sm font-semibold py-2 transition-colors">
              Connect
            </button>
          )}
          {conn.status === 'failed' && (
            <button onClick={conn.retry} className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg border border-rose-400/50 text-rose-300 hover:bg-rose-400/10 text-sm font-semibold py-2 transition-colors">
              <RotateCw className="w-4 h-4" /> Retry connection
            </button>
          )}
        </section>

        <button
          disabled={!ready}
          onClick={() => onReady?.(conn.socket.current)}
          className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors bg-emerald-500 text-slate-950 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
          {ready ? <CheckCircle2 className="w-4 h-4" /> : null} Start interview <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

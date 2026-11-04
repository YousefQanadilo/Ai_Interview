import React, { useState } from 'react';
import { PreInterviewSetup } from './stages/PreInterviewSetup';

// Live voice backend (coming in a later PBI). Override with VITE_LIVE_VOICE_WS_URL in .env.local.
const LIVE_VOICE_WS_URL =
  import.meta.env.VITE_LIVE_VOICE_WS_URL ??
  `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}/live`;

export default function App() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <PreInterviewSetup serverUrl={LIVE_VOICE_WS_URL} onReady={() => setStarted(true)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">Mock Interview AI Agent</h1>
    </div>
  );
}

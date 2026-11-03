import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isRecording: boolean;
  isPlayingVoice?: boolean;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({ isRecording, isPlayingVoice }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;
      const barCount = 32;
      const barWidth = 3.5;
      const gap = (width - barCount * barWidth) / (barCount - 1);

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + gap);
        let barHeight = 4;

        if (isRecording) {
          // Dynamic pulsing wave when candidate is speaking (Vibrant Orange glow)
          const freq = Math.sin(step * 0.16 + i * 0.38) * 0.5 + 0.5;
          const noise = Math.random() * 0.25;
          barHeight = Math.max(4, (freq + noise) * (height * 0.88));
          
          const grad = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
          grad.addColorStop(0, '#FFA84A');
          grad.addColorStop(0.5, '#FF7A1A');
          grad.addColorStop(1, '#FF5500');
          ctx.fillStyle = grad;
        } else if (isPlayingVoice) {
          // Glowing amber pulsing wave when interviewer speaks
          const freq = Math.sin(step * 0.14 + i * 0.32) * 0.5 + 0.5;
          barHeight = Math.max(4, freq * (height * 0.8));
          
          const grad = ctx.createLinearGradient(0, centerY - barHeight / 2, 0, centerY + barHeight / 2);
          grad.addColorStop(0, '#FFE082');
          grad.addColorStop(0.5, '#FF9D00');
          grad.addColorStop(1, '#FF7A1A');
          ctx.fillStyle = grad;
        } else {
          // Idle ambient baseline in warm burnt-amber glass tone
          barHeight = 4;
          ctx.fillStyle = 'rgba(255, 122, 26, 0.22)';
        }

        const y = centerY - barHeight / 2;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      step++;
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isRecording, isPlayingVoice]);

  return (
    <div className="w-full flex items-center justify-center py-2">
      <canvas
        ref={canvasRef}
        width={340}
        height={38}
        className="w-full max-w-[340px] h-9"
      />
    </div>
  );
};

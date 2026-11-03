import React from 'react';
import { Sparkles, Mic, Volume2 } from 'lucide-react';
import { InterviewerFace } from './InterviewerFace';

interface AIOrbProps {
  isCallActive: boolean;
  isEmployerSpeaking: boolean;
  isConnecting: boolean;
  isCandidateSpeaking?: boolean;
  interviewerName?: string;
  interviewerRole?: string;
  avatarMode?: 'face' | 'monogram';
  initials?: string;
  onToggleAvatarMode?: () => void;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const AIOrb: React.FC<AIOrbProps> = ({
  isCallActive,
  isEmployerSpeaking,
  isConnecting,
  isCandidateSpeaking = false,
  interviewerName = 'Alex Vance',
  interviewerRole = 'Senior Staff SWE & Hiring Lead',
  avatarMode = 'face',
  initials = 'AV',
  onToggleAvatarMode,
  size = 'lg',
  onClick,
}) => {
  const sizeClasses = {
    sm: 'w-28 h-28',
    md: 'w-44 h-44 sm:w-52 sm:h-52',
    lg: 'w-60 h-60 sm:w-72 sm:h-72 md:w-80 md:h-80',
  }[size];

  const ringSizeClasses = {
    sm: 'w-36 h-36',
    md: 'w-56 h-56 sm:w-64 sm:h-64',
    lg: 'w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96',
  }[size];

  return (
    <div 
      className="relative flex flex-col items-center justify-center select-none"
    >
      {/* Outer ambient radiant glow */}
      <div 
        className={`absolute rounded-full transition-all duration-700 pointer-events-none ${
          isEmployerSpeaking 
            ? 'w-96 h-96 sm:w-[480px] sm:h-[480px] bg-gradient-to-r from-[#FF7A1A]/35 via-[#FF9D00]/25 to-[#FF5500]/20 blur-3xl opacity-90'
            : isCallActive
            ? 'w-80 h-80 sm:w-[380px] sm:h-[380px] bg-gradient-to-r from-[#FF7A1A]/20 via-[#FF9D00]/15 to-transparent blur-3xl opacity-70'
            : 'w-72 h-72 sm:w-[320px] sm:h-[320px] bg-gradient-to-r from-[#FF7A1A]/15 via-[#FF9D00]/10 to-transparent blur-2xl opacity-50'
        }`}
      />

      {/* Ripple wave when speaking */}
      {isEmployerSpeaking && (
        <>
          <div className="absolute w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 rounded-full border border-[#FF7A1A]/60 animate-ripple pointer-events-none" />
          <div 
            className="absolute w-72 h-72 sm:w-84 sm:h-84 md:w-96 md:h-96 rounded-full border border-[#FF9D00]/40 animate-ripple pointer-events-none" 
            style={{ animationDelay: '0.9s' }} 
          />
        </>
      )}

      {/* Rotating outer orbital energy ring */}
      <div 
        className={`absolute rounded-full pointer-events-none transition-opacity duration-500 ${ringSizeClasses} ${
          isCallActive ? 'opacity-80' : 'opacity-40'
        }`}
      >
        <div 
          className={`w-full h-full rounded-full border border-dashed border-[#FF7A1A]/30 ${
            isEmployerSpeaking ? 'animate-spin-slow' : 'animate-spin-slow'
          }`} 
        />
      </div>

      <div 
        className={`absolute rounded-full pointer-events-none transition-opacity duration-500 ${sizeClasses} scale-110 ${
          isCallActive ? 'opacity-90' : 'opacity-30'
        }`}
      >
        <div className="w-full h-full rounded-full border border-dotted border-[#FF9D00]/40 animate-spin-reverse-slow" />
      </div>

      {/* Primary Signature Glowing Orb Body */}
      <div
        onClick={onClick}
        className={`relative ${sizeClasses} rounded-full flex items-center justify-center transition-all duration-500 cursor-pointer ${
          isEmployerSpeaking
            ? 'animate-orb-speaking'
            : isCallActive
            ? 'animate-orb-idle'
            : 'animate-orb-idle'
        }`}
        style={{
          background: 'radial-gradient(circle at 35% 30%, rgba(255, 157, 0, 0.28) 0%, rgba(255, 122, 26, 0.15) 35%, rgba(18, 12, 9, 0.95) 70%, #0d0907 100%)',
          border: '2px solid rgba(255, 157, 0, 0.75)',
        }}
      >
        {/* Bright orange neon rim light */}
        <div 
          className="absolute inset-1 rounded-full pointer-events-none"
          style={{
            boxShadow: isEmployerSpeaking
              ? 'inset 0 0 45px rgba(255, 122, 26, 0.8), inset 0 0 20px rgba(255, 200, 100, 0.6)'
              : 'inset 0 0 30px rgba(255, 122, 26, 0.5), inset 0 0 15px rgba(255, 157, 0, 0.35)',
          }}
        />

        {/* Luminous upper specular reflection arc */}
        <div className="absolute top-3 w-3/4 h-1/3 rounded-full bg-gradient-to-b from-white/20 via-orange-300/10 to-transparent blur-[2px] pointer-events-none" />

        {/* Deep Center Hub: Host the Professional Friendly Face or Monogram Abbreviation */}
        <div 
          className="relative w-3/5 h-3/5 rounded-full flex flex-col items-center justify-center overflow-hidden transition-all duration-300"
          style={{
            background: 'radial-gradient(circle, #150f0c 0%, #0b0705 90%)',
            boxShadow: 'inset 0 0 25px rgba(0, 0, 0, 0.95), 0 0 20px rgba(255, 122, 26, 0.25)',
            border: '1px solid rgba(255, 122, 26, 0.35)',
          }}
        >
          {/* Subtle interior glow */}
          <div 
            className={`absolute inset-0 rounded-full transition-opacity duration-300 pointer-events-none ${
              isEmployerSpeaking 
                ? 'bg-gradient-to-tr from-[#FF7A1A]/40 to-[#FF9D00]/30 opacity-100' 
                : isCandidateSpeaking
                ? 'bg-[#FF7A1A]/20 opacity-80'
                : 'opacity-15'
            }`}
          />

          {/* Central Face Portrait or Monogram Abbreviation */}
          <div className="relative w-full h-full flex items-center justify-center p-2 z-10">
            <InterviewerFace
              mode={avatarMode}
              initials={initials}
              size="lg"
              isSpeaking={isEmployerSpeaking}
            />

            {/* Overlaid Live Audio Badges */}
            {isConnecting && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-full flex flex-col items-center justify-center space-y-1">
                <div className="w-7 h-7 rounded-full border-2 border-[#FF7A1A] border-t-transparent animate-spin" />
                <span className="text-[9px] font-bold tracking-wider text-orange-200 uppercase">Connecting</span>
              </div>
            )}

            {isEmployerSpeaking && (
              <div className="absolute bottom-1.5 px-2 py-0.5 rounded-full bg-[#1A0E08]/90 border border-[#FF7A1A]/80 shadow-[0_0_12px_rgba(255,122,26,0.6)] flex items-center space-x-1 animate-pulse">
                <Volume2 className="w-3 h-3 text-[#FF9D00]" />
                <span className="text-[9px] font-extrabold tracking-wider text-white uppercase">Speaking</span>
              </div>
            )}

            {isCandidateSpeaking && !isEmployerSpeaking && (
              <div className="absolute bottom-1.5 px-2 py-0.5 rounded-full bg-[#1A0E08]/90 border border-[#FF9D00]/80 shadow-[0_0_12px_rgba(255,157,0,0.6)] flex items-center space-x-1">
                <Mic className="w-3 h-3 text-[#FF7A1A] animate-bounce" />
                <span className="text-[9px] font-extrabold tracking-wider text-orange-200 uppercase">Listening</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Persona Badge below orb */}
      <div className="mt-4 flex flex-col items-center text-center z-10 space-y-1.5">
        <div className="flex items-center space-x-2">
          <span className="text-base sm:text-lg font-bold text-white tracking-tight">{interviewerName}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#FF7A1A]/15 text-orange-300 border border-[#FF7A1A]/30">
            {isCallActive ? (isEmployerSpeaking ? 'Speaking' : 'Listening') : 'Lead Interviewer'}
          </span>
        </div>
        <p className="text-xs text-[#A89F99]">{interviewerRole}</p>

        {/* 1-Click Avatar Mode Switcher: Friendly Face vs Abbreviation Monogram */}
        {onToggleAvatarMode && (
          <div className="pt-1 flex items-center space-x-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleAvatarMode();
              }}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#22150E]/80 hover:bg-[#2F1D14] text-[#FFA057] hover:text-white border border-[#FF7A1A]/25 transition-all cursor-pointer flex items-center space-x-1"
              title="Toggle between friendly face portrait and initials monogram"
            >
              <span>Avatar:</span>
              <span className="underline decoration-[#FF9D00] font-bold">
                {avatarMode === 'face' ? 'Friendly Face' : `Abbreviation (${initials})`}
              </span>
              <span className="text-[9px] text-[#A89F99]">↺</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

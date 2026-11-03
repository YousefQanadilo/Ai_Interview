import React from 'react';

interface InterviewerFaceProps {
  mode?: 'face' | 'monogram';
  initials?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isSpeaking?: boolean;
  className?: string;
}

export const InterviewerFace: React.FC<InterviewerFaceProps> = ({
  mode = 'face',
  initials = 'AV',
  size = 'lg',
  isSpeaking = false,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-24 h-24 sm:w-28 sm:h-28 text-2xl sm:text-3xl',
    xl: 'w-32 h-32 sm:w-36 sm:h-36 text-3xl sm:text-4xl',
  }[size];

  if (mode === 'monogram') {
    return (
      <div
        className={`relative rounded-full flex items-center justify-center font-black select-none transition-transform duration-300 ${sizeMap} ${className} ${
          isSpeaking ? 'scale-105' : ''
        }`}
        style={{
          background: 'radial-gradient(circle at 35% 30%, #2A170F 0%, #150C07 80%, #0D0704 100%)',
          border: '1.5px solid rgba(255, 157, 0, 0.45)',
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.8), 0 0 25px rgba(255, 122, 26, 0.3)',
        }}
      >
        {/* Soft specular reflection */}
        <div className="absolute top-1 left-2 right-2 h-1/3 rounded-full bg-gradient-to-b from-white/15 to-transparent blur-[1px] pointer-events-none" />

        {/* Monogram Typography */}
        <span
          className="bg-gradient-to-br from-[#FFF0D4] via-[#FFB74D] to-[#FF7A1A] bg-clip-text text-transparent tracking-tight font-sans drop-shadow-[0_2px_10px_rgba(255,122,26,0.5)]"
          style={{ letterSpacing: '-0.03em' }}
        >
          {initials}
        </span>

        {/* Subtle speaking pulse ring */}
        {isSpeaking && (
          <div className="absolute inset-0 rounded-full border-2 border-[#FF9D00]/60 animate-ping opacity-40 pointer-events-none" />
        )}
      </div>
    );
  }

  // Professional Friendly Face Avatar (Approachable Tech Lead Portrait)
  return (
    <div
      className={`relative rounded-full flex items-center justify-center overflow-hidden select-none transition-transform duration-300 ${sizeMap} ${className} ${
        isSpeaking ? 'scale-105' : ''
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 35%, #24140D 0%, #130B07 90%)',
        border: '1.5px solid rgba(255, 157, 0, 0.5)',
        boxShadow: 'inset 0 0 25px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 122, 26, 0.35)',
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
      >
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="40%" r="50%">
            <stop offset="0%" stopColor="#FF9D00" stopOpacity="0.25" />
            <stop offset="80%" stopColor="#FF7A1A" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#101010" stopOpacity="0" />
          </radialGradient>

          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFDFBA" />
            <stop offset="60%" stopColor="#F5C498" />
            <stop offset="100%" stopColor="#D99B6A" />
          </linearGradient>

          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3D2619" />
            <stop offset="60%" stopColor="#29180F" />
            <stop offset="100%" stopColor="#1C0F08" />
          </linearGradient>

          <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#2E1C14" />
            <stop offset="100%" stopColor="#170E0A" />
          </linearGradient>

          <linearGradient id="collarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF9D00" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FF7A1A" stopOpacity="0.5" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Warm Studio Backdrop */}
        <circle cx="50" cy="50" r="50" fill="url(#bgGlow)" />

        {/* Friendly Shoulders & Tech Crewneck Sweater */}
        <path
          d="M14 94C14 77 28 72 50 72C72 72 86 77 86 94V100H14V94Z"
          fill="url(#shirtGrad)"
          stroke="#FF7A1A"
          strokeWidth="1"
          strokeOpacity="0.3"
        />

        {/* Approachable Tech Crewneck Collar Accent */}
        <path
          d="M40 72C40 77 44 81 50 81C56 81 60 77 60 72C60 70 40 70 40 72Z"
          fill="#1C0F08"
          stroke="url(#collarGrad)"
          strokeWidth="1.2"
        />

        {/* Neck */}
        <path
          d="M42 58V72C44 74 56 74 58 72V58H42Z"
          fill="#E2AA7D"
        />
        {/* Soft neck shadow */}
        <path
          d="M42 58C46 62 54 62 58 58V63C54 66 46 66 42 63V58Z"
          fill="#C48454"
          opacity="0.6"
        />

        {/* Ears with warm rim light */}
        <ellipse cx="29" cy="46" rx="4.5" ry="7" fill="#ECAE80" />
        <ellipse cx="29" cy="46" rx="2" ry="4" fill="#C48454" />
        <ellipse cx="71" cy="46" rx="4.5" ry="7" fill="#ECAE80" />
        <ellipse cx="71" cy="46" rx="2" ry="4" fill="#C48454" />

        {/* Face Shape */}
        <path
          d="M31 38C31 23 69 23 69 38C69 54 63 64 50 64C37 64 31 54 31 38Z"
          fill="url(#skinGrad)"
        />

        {/* Friendly Modern Haircut */}
        <path
          d="M28 35C27 24 35 15 50 15C64 15 72 23 72 34C72 38 70 41 68 41C66 32 64 26 50 25C37 25 33 30 31 41C29 41 28 38 28 35Z"
          fill="url(#hairGrad)"
        />
        {/* Hair texture & volume */}
        <path
          d="M34 26C38 20 46 17 56 18C64 19 68 23 70 28C66 22 58 20 48 21C40 22 36 24 34 26Z"
          fill="#523423"
          opacity="0.7"
        />

        {/* Warm Approaching Eyebrows */}
        <path
          d="M36 34C39 32 44 33 46 35"
          stroke="#3D2619"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M54 35C56 33 61 32 64 34"
          stroke="#3D2619"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Friendly, Attentive Eyes */}
        <ellipse cx="41" cy="40" rx="3.5" ry="3.8" fill="#1C110A" />
        <ellipse cx="59" cy="40" rx="3.5" ry="3.8" fill="#1C110A" />
        {/* Catchlight in eyes (gives life & warmth) */}
        <circle cx="42" cy="39" r="1.2" fill="#FFFFFF" />
        <circle cx="60" cy="39" r="1.2" fill="#FFFFFF" />
        <circle cx="40" cy="41.5" r="0.6" fill="#FFE2C4" />
        <circle cx="58" cy="41.5" r="0.6" fill="#FFE2C4" />

        {/* Gentle smiling eye crinkles */}
        <path
          d="M35 41C36 42 37 42 38 41"
          stroke="#C48454"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <path
          d="M62 41C63 42 64 42 65 41"
          stroke="#C48454"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* Nose */}
        <path
          d="M50 40V48C49 49 47.5 49 47 48"
          stroke="#C48454"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Warm, Approaching Smile */}
        <path
          d="M42 53C45 57 55 57 58 53"
          stroke="#7A361D"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        {/* Teeth / inner smile accent */}
        <path
          d="M44 53.5C47 55.5 53 55.5 56 53.5"
          fill="#FFFDF7"
        />
        {/* Smile dimples / cheek contour */}
        <path
          d="M40 52C39.5 53 40 54 40.5 54.5"
          stroke="#C48454"
          strokeWidth="1"
          strokeLinecap="round"
        />
        <path
          d="M60 52C60.5 53 60 54 59.5 54.5"
          stroke="#C48454"
          strokeWidth="1"
          strokeLinecap="round"
        />

        {/* Modern Minimal Glasses (Optional tech polish) */}
        <rect
          x="34"
          y="35"
          width="13"
          height="10"
          rx="3"
          fill="none"
          stroke="#FF9D00"
          strokeWidth="1.2"
          strokeOpacity="0.85"
        />
        <rect
          x="53"
          y="35"
          width="13"
          height="10"
          rx="3"
          fill="none"
          stroke="#FF9D00"
          strokeWidth="1.2"
          strokeOpacity="0.85"
        />
        {/* Glasses bridge */}
        <path
          d="M47 38C48.5 37 51.5 37 53 38"
          stroke="#FF9D00"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeOpacity="0.85"
        />
        {/* Glasses specular reflection */}
        <path
          d="M36 37L44 42"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
        <path
          d="M55 37L63 42"
          stroke="#FFFFFF"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeOpacity="0.4"
        />
      </svg>

      {/* Speaking Indicator Ring */}
      {isSpeaking && (
        <div className="absolute inset-0 rounded-full border-2 border-[#FF7A1A] animate-ping opacity-35 pointer-events-none" />
      )}
    </div>
  );
};

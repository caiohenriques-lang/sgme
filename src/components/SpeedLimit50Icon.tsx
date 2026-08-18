import React from 'react';

interface SpeedRadarIconProps {
  className?: string;
}

export const SpeedRadarIcon: React.FC<SpeedRadarIconProps> = ({ className = 'w-7 h-7' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} shrink-0 inline-block`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Ícone Radar de Velocidade Fiscalização Eletrônica"
      role="img"
    >
      <defs>
        {/* Main Body Gradient */}
        <linearGradient id="radarBodyGrad" x1="15" y1="18" x2="68" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>

        {/* Lens Outer Ring Gradient */}
        <linearGradient id="radarLensRing" x1="30" y1="34" x2="56" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E293B" />
        </linearGradient>

        {/* Lens Glass Gradient */}
        <linearGradient id="radarGlass" x1="36" y1="40" x2="52" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="60%" stopColor="#0284C7" />
          <stop offset="100%" stopColor="#0369A1" />
        </linearGradient>

        {/* Metal Pole Gradient */}
        <linearGradient id="postGrad" x1="38" y1="68" x2="48" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#64748B" />
          <stop offset="100%" stopColor="#334155" />
        </linearGradient>
      </defs>

      {/* Support Pole & Base Mount */}
      <rect x="39" y="66" width="8" height="24" rx="4" fill="url(#postGrad)" />
      <rect x="30" y="87" width="26" height="5" rx="2.5" fill="#475569" />

      {/* Main Radar Camera Housing */}
      <rect
        x="16"
        y="20"
        width="46"
        height="48"
        rx="12"
        fill="url(#radarBodyGrad)"
        stroke="#93C5FD"
        strokeWidth="2.5"
      />

      {/* Subtle Housing Highlight on Top Edge */}
      <path
        d="M26 22.5 H52"
        stroke="#BFDBFE"
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* Status LED (Active indicator - Neon Green) */}
      <circle cx="26" cy="30" r="3.5" fill="#10B981" />
      <circle cx="26" cy="30" r="1.5" fill="#D1FAE5" />

      {/* Flash / Sensor Aperture (Amber/Gold) */}
      <circle cx="50" cy="30" r="4" fill="#F59E0B" stroke="#FDE68A" strokeWidth="1.5" />
      <circle cx="50" cy="30" r="1.5" fill="#FFFBEB" />

      {/* Main Big Camera Lens (Optical Camera) */}
      <circle cx="39" cy="49" r="14" fill="url(#radarLensRing)" stroke="#93C5FD" strokeWidth="2" />
      <circle cx="39" cy="49" r="10" fill="url(#radarGlass)" />
      <circle cx="39" cy="49" r="5" fill="#0C4A6E" />
      {/* Light Glass Reflection / Sparkle */}
      <circle cx="36" cy="46" r="2.2" fill="#FFFFFF" opacity="0.9" />
      <circle cx="41" cy="51" r="1.2" fill="#FFFFFF" opacity="0.6" />

      {/* Playful Radar / Speed Emission Waves */}
      {/* Wave 1 - Inner */}
      <path
        d="M68 34 C73.5 40 73.5 54 68 60"
        stroke="#38BDF8"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Wave 2 - Middle */}
      <path
        d="M77 27 C84.5 35 84.5 59 77 67"
        stroke="#60A5FA"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      {/* Wave 3 - Outer */}
      <path
        d="M86 20 C95.5 31 95.5 65 86 76"
        stroke="#93C5FD"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Playful Flash Sparkle */}
      <path
        d="M12 16 L14 11 L19 13 L14 15 L12 20 L10 15 L5 13 L10 11 Z"
        fill="#FBBF24"
      />
    </svg>
  );
};

// Aliases for compatibility
export const SpeedLimit50Icon = SpeedRadarIcon;
export default SpeedRadarIcon;

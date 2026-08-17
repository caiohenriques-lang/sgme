import React from 'react';

interface SpeedLimit50IconProps {
  className?: string;
}

export const SpeedLimit50Icon: React.FC<SpeedLimit50IconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} shrink-0 inline-block`}
      aria-label="Placa de Regulamentação de Velocidade 50 km/h"
      role="img"
    >
      {/* Placa de regulamentação R-19 (Fundo Branco, Borda Vermelha) */}
      <circle cx="50" cy="50" r="44" fill="#FFFFFF" stroke="#DC2626" strokeWidth="10" />
      {/* Texto de Velocidade Maxima 50 */}
      <text
        x="50"
        y="55"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#0F172A"
        fontSize="40"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="-1"
      >
        50
      </text>
      {/* Subtexto km/h para clareza visual */}
      <text
        x="50"
        y="75"
        textAnchor="middle"
        fill="#475569"
        fontSize="12"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        km/h
      </text>
    </svg>
  );
};

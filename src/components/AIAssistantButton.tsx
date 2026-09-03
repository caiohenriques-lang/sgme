import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface AIAssistantButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

export const AIAssistantButton: React.FC<AIAssistantButtonProps> = ({
  onClick,
  isOpen,
}) => {
  if (isOpen) return null;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 flex items-center group">
      {/* Tooltip on hover */}
      <div className="mr-2 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg border border-slate-700/80 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap hidden sm:flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-blue-400" />
        <span>Geapinho • Assistente IA da GEAPI</span>
      </div>

      {/* Floating Button */}
      <button
        onClick={onClick}
        className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 sm:px-4 sm:py-3.5 rounded-full sm:rounded-2xl shadow-xl hover:shadow-2xl border-2 border-white/80 transition-all duration-200 cursor-pointer active:scale-95 flex items-center gap-2.5 group"
        aria-label="Abrir Geapinho - Assistente Inteligente GEAPI"
        title="Geapinho - Assistente com IA da GEAPI"
      >
        <div className="relative">
          <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:rotate-12 transition-transform duration-200" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-600 rounded-full animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-blue-600 rounded-full" />
        </div>

        <span className="font-bold text-xs sm:text-sm tracking-tight hidden sm:inline text-white">
          Geapinho
        </span>
      </button>
    </div>
  );
};

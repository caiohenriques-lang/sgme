import React from 'react';
import { ActiveTab } from '../types';
import { Map, BarChart3, Table, Printer, FileSignature } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  totalRecords: number;
  coordRecords: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  totalRecords,
  coordRecords,
}) => {
  return (
    <nav
      aria-label="Navegação inferior mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-2 py-1.5 flex items-center justify-around select-none"
    >
      {/* Tab 1: Monitoramento Espacial (Mapa) */}
      <button
        onClick={() => setActiveTab('mapa')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 min-h-[48px] cursor-pointer ${
          activeTab === 'mapa'
            ? 'text-blue-700 font-bold bg-blue-100/90 border border-blue-300/80 shadow-2xs'
            : 'text-slate-600 font-medium hover:text-blue-700 hover:bg-slate-100/80'
        }`}
      >
        <div className="relative">
          <Map className={`w-5 h-5 ${activeTab === 'mapa' ? 'text-blue-700' : 'text-blue-600'}`} />
          <span
            className={`absolute -top-1.5 -right-3.5 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${
              activeTab === 'mapa'
                ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                : 'bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            {coordRecords}
          </span>
        </div>
        <span className="text-[10px] mt-1 tracking-tight">Mapa</span>
      </button>

      {/* Tab 2: Indicadores */}
      <button
        onClick={() => setActiveTab('indicadores')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 min-h-[48px] cursor-pointer ${
          activeTab === 'indicadores'
            ? 'text-blue-700 font-bold bg-blue-100/90 border border-blue-300/80 shadow-2xs'
            : 'text-slate-600 font-medium hover:text-blue-700 hover:bg-slate-100/80'
        }`}
      >
        <BarChart3 className={`w-5 h-5 ${activeTab === 'indicadores' ? 'text-blue-700' : 'text-blue-600'}`} />
        <span className="text-[10px] mt-1 tracking-tight">Indicadores</span>
      </button>

      {/* Tab 3: Lista de Equipamentos */}
      <button
        onClick={() => setActiveTab('tabela')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 min-h-[48px] cursor-pointer ${
          activeTab === 'tabela'
            ? 'text-blue-700 font-bold bg-blue-100/90 border border-blue-300/80 shadow-2xs'
            : 'text-slate-600 font-medium hover:text-blue-700 hover:bg-slate-100/80'
        }`}
      >
        <div className="relative">
          <Table className={`w-5 h-5 ${activeTab === 'tabela' ? 'text-blue-700' : 'text-blue-600'}`} />
          <span
            className={`absolute -top-1.5 -right-3.5 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full border ${
              activeTab === 'tabela'
                ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                : 'bg-slate-200 text-slate-700 border-slate-300'
            }`}
          >
            {totalRecords}
          </span>
        </div>
        <span className="text-[10px] mt-1 tracking-tight">Lista</span>
      </button>

      {/* Tab 4: Gestão Contratual */}
      <button
        onClick={() => setActiveTab('gestao_contratual')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 min-h-[48px] cursor-pointer ${
          activeTab === 'gestao_contratual'
            ? 'text-blue-700 font-bold bg-blue-100/90 border border-blue-300/80 shadow-2xs'
            : 'text-slate-600 font-medium hover:text-blue-700 hover:bg-slate-100/80'
        }`}
      >
        <FileSignature className={`w-5 h-5 ${activeTab === 'gestao_contratual' ? 'text-blue-700' : 'text-blue-600'}`} />
        <span className="text-[10px] mt-1 tracking-tight">Contratos</span>
      </button>

      {/* Tab 5: Relatórios */}
      <button
        onClick={() => setActiveTab('relatorios')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 min-h-[48px] cursor-pointer ${
          activeTab === 'relatorios'
            ? 'text-blue-700 font-bold bg-blue-100/90 border border-blue-300/80 shadow-2xs'
            : 'text-slate-600 font-medium hover:text-blue-700 hover:bg-slate-100/80'
        }`}
      >
        <Printer className={`w-5 h-5 ${activeTab === 'relatorios' ? 'text-blue-700' : 'text-blue-600'}`} />
        <span className="text-[10px] mt-1 tracking-tight">Relatórios</span>
      </button>
    </nav>
  );
};

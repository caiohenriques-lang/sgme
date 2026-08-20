import React from 'react';
import { ActiveTab } from '../types';
import { Map, BarChart3, Table, Printer, FileSignature, AlertTriangle, Layers } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  totalRecords: number;
  coordRecords: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <nav
      aria-label="Navegação inferior mobile"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg px-1.5 py-1.5 flex items-center justify-around select-none"
    >
      {/* Tab 1: Monitoramento Espacial (Mapa) */}
      <button
        onClick={() => setActiveTab('mapa')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 min-h-[48px] cursor-pointer ${
          activeTab === 'mapa'
            ? 'text-blue-700 font-bold bg-blue-100/90 border border-blue-300/80 shadow-2xs'
            : 'text-slate-600 font-bold hover:text-blue-700 hover:bg-slate-100/80'
        }`}
      >
        <Map className={`w-5 h-5 ${activeTab === 'mapa' ? 'text-blue-700' : 'text-blue-600'}`} />
        <span className="text-[10.5px] font-bold mt-1 tracking-tight">Mapa</span>
      </button>

      {/* Tab 2: Gestão Contratual */}
      <button
        onClick={() => setActiveTab('gestao_contratual')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 min-h-[48px] cursor-pointer ${
          activeTab === 'gestao_contratual'
            ? 'text-blue-700 font-bold bg-blue-100/90 border border-blue-300/80 shadow-2xs'
            : 'text-slate-600 font-bold hover:text-blue-700 hover:bg-slate-100/80'
        }`}
      >
        <FileSignature className={`w-5 h-5 ${activeTab === 'gestao_contratual' ? 'text-blue-700' : 'text-blue-600'}`} />
        <span className="text-[10.5px] font-bold mt-1 tracking-tight">Contratos</span>
      </button>

      {/* Tab 3: Indicadores */}
      <button
        onClick={() => setActiveTab('indicadores')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 min-h-[48px] cursor-pointer ${
          activeTab === 'indicadores'
            ? 'text-blue-700 font-bold bg-blue-100/90 border border-blue-300/80 shadow-2xs'
            : 'text-slate-600 font-bold hover:text-blue-700 hover:bg-slate-100/80'
        }`}
      >
        <BarChart3 className={`w-5 h-5 ${activeTab === 'indicadores' ? 'text-blue-700' : 'text-blue-600'}`} />
        <span className="text-[10.5px] font-bold mt-1 tracking-tight">Indicadores</span>
      </button>

      {/* Tab 4: Lista de Equipamentos */}
      <button
        onClick={() => setActiveTab('tabela')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 min-h-[48px] cursor-pointer ${
          activeTab === 'tabela'
            ? 'text-blue-700 font-bold bg-blue-100/90 border border-blue-300/80 shadow-2xs'
            : 'text-slate-600 font-bold hover:text-blue-700 hover:bg-slate-100/80'
        }`}
      >
        <Table className={`w-5 h-5 ${activeTab === 'tabela' ? 'text-blue-700' : 'text-blue-600'}`} />
        <span className="text-[10.5px] font-bold mt-1 tracking-tight">Lista</span>
      </button>

      {/* Tab 5: Relatórios */}
      <button
        onClick={() => setActiveTab('relatorios')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 min-h-[48px] cursor-pointer ${
          activeTab === 'relatorios'
            ? 'text-blue-700 font-bold bg-blue-100/90 border border-blue-300/80 shadow-2xs'
            : 'text-slate-600 font-bold hover:text-blue-700 hover:bg-slate-100/80'
        }`}
      >
        <Printer className={`w-5 h-5 ${activeTab === 'relatorios' ? 'text-blue-700' : 'text-blue-600'}`} />
        <span className="text-[10.5px] font-bold mt-1 tracking-tight">Relatórios</span>
      </button>

      {/* Tab 6: Interrupções */}
      <button
        onClick={() => setActiveTab('interrupcoes')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 min-h-[48px] cursor-pointer ${
          activeTab === 'interrupcoes'
            ? 'text-blue-700 font-bold bg-blue-100/90 border border-blue-300/80 shadow-2xs'
            : 'text-slate-600 font-bold hover:text-blue-700 hover:bg-slate-100/80'
        }`}
      >
        <AlertTriangle className={`w-5 h-5 ${activeTab === 'interrupcoes' ? 'text-amber-700' : 'text-amber-600'}`} />
        <span className="text-[10.5px] font-bold mt-1 tracking-tight">Interrupções</span>
      </button>

      {/* Tab 7: BHDIGITAL */}
      <button
        onClick={() => setActiveTab('bhdigital')}
        className={`flex-1 flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-150 min-h-[48px] cursor-pointer ${
          activeTab === 'bhdigital'
            ? 'text-blue-700 font-bold bg-blue-100/90 border border-blue-300/80 shadow-2xs'
            : 'text-slate-600 font-bold hover:text-blue-700 hover:bg-slate-100/80'
        }`}
      >
        <Layers className={`w-5 h-5 ${activeTab === 'bhdigital' ? 'text-amber-700' : 'text-amber-600'}`} />
        <span className="text-[10.5px] font-bold mt-1 tracking-tight">BHDigital</span>
      </button>
    </nav>
  );
};

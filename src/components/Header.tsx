import React from 'react';
import { ActiveTab } from '../types';
import { Map, BarChart3, Table, Printer, FileSignature, AlertTriangle, Layers } from 'lucide-react';
import { SpeedRadarIcon } from './SpeedRadarIcon';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  totalRecords: number;
  coordRecords: number;
  loading?: boolean;
  onRefresh?: () => void;
  onOpenVercelGuide?: () => void;
  lastUpdated?: Date;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="bg-white text-slate-900 shadow-xs border-b border-slate-200 relative md:sticky md:top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Top Right: Timbre / Logo Image */}
          <div className="flex items-center justify-center md:justify-end shrink-0 w-full md:w-auto order-first md:order-last">
            <div className="bg-white p-1 rounded-lg border border-slate-200/80 shadow-2xs flex items-center justify-center">
              <img
                src="/logo_pbh_bhtrans.png"
                alt="Timbre Oficial BHTRANS Prefeitura de Belo Horizonte"
                className="h-10 sm:h-12 md:h-14 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          {/* Titles & Branding */}
          <div className="flex items-start gap-3 order-last md:order-first">
            <div className="p-0.5 rounded-xl shrink-0 mt-0.5">
              <SpeedRadarIcon className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                  GERÊNCIA DE ANÁLISE E PROCESSAMENTO DE INFRAÇÕES - GEAPI
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 mt-0.5">
                Fiscalização Eletrônica
              </p>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Desenvolvido por Caio Henriques de O. L. Cordeiro
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar - Desktop Only (7 equal columns, 2 lines, centered, no scroll, 1px larger & bold) */}
        <div className="mt-3 pt-2.5 border-t border-slate-100">
          <nav className="hidden md:grid grid-cols-7 w-full gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 shadow-2xs">
            
            {/* 1. Gestão Contratual - Vermelho-Escuro */}
            <button
              onClick={() => setActiveTab('gestao_contratual')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-150 cursor-pointer min-h-[52px] text-center group ${
                activeTab === 'gestao_contratual'
                  ? 'bg-red-800 border-red-800 text-white shadow-sm ring-2 ring-red-700/30'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 hover:bg-red-50 hover:border-red-400 hover:text-red-900 shadow-2xs'
              }`}
            >
              <FileSignature className={`w-4 h-4 shrink-0 mb-0.5 transition-colors ${activeTab === 'gestao_contratual' ? 'text-white' : 'text-red-800 group-hover:text-red-900'}`} />
              <div className="flex flex-col items-center text-[12px] font-bold leading-tight">
                <span>Gestão</span>
                <span>Contratual</span>
              </div>
            </button>

            {/* 2. Monitoramento Espacial - Azul */}
            <button
              onClick={() => setActiveTab('mapa')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-150 cursor-pointer min-h-[52px] text-center group ${
                activeTab === 'mapa'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 shadow-2xs'
              }`}
            >
              <Map className={`w-4 h-4 shrink-0 mb-0.5 transition-colors ${activeTab === 'mapa' ? 'text-white' : 'text-blue-600 group-hover:text-blue-700'}`} />
              <div className="flex flex-col items-center text-[12px] font-bold leading-tight">
                <span>Monitoramento</span>
                <span>Espacial</span>
              </div>
            </button>

            {/* 3. Indicadores - Azul */}
            <button
              onClick={() => setActiveTab('indicadores')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-150 cursor-pointer min-h-[52px] text-center group ${
                activeTab === 'indicadores'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 shadow-2xs'
              }`}
            >
              <BarChart3 className={`w-4 h-4 shrink-0 mb-0.5 transition-colors ${activeTab === 'indicadores' ? 'text-white' : 'text-blue-600 group-hover:text-blue-700'}`} />
              <div className="flex flex-col items-center text-[12px] font-bold leading-tight">
                <span>Indicadores</span>
              </div>
            </button>

            {/* 4. Lista de Equipamentos - Azul */}
            <button
              onClick={() => setActiveTab('tabela')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-150 cursor-pointer min-h-[52px] text-center group ${
                activeTab === 'tabela'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 shadow-2xs'
              }`}
            >
              <Table className={`w-4 h-4 shrink-0 mb-0.5 transition-colors ${activeTab === 'tabela' ? 'text-white' : 'text-blue-600 group-hover:text-blue-700'}`} />
              <div className="flex flex-col items-center text-[12px] font-bold leading-tight">
                <span>Lista de</span>
                <span>Equipamentos</span>
              </div>
            </button>

            {/* 5. Relatórios - Azul */}
            <button
              onClick={() => setActiveTab('relatorios')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-150 cursor-pointer min-h-[52px] text-center group ${
                activeTab === 'relatorios'
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm ring-2 ring-blue-500/30'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-700 shadow-2xs'
              }`}
            >
              <Printer className={`w-4 h-4 shrink-0 mb-0.5 transition-colors ${activeTab === 'relatorios' ? 'text-white' : 'text-blue-600 group-hover:text-blue-700'}`} />
              <div className="flex flex-col items-center text-[12px] font-bold leading-tight">
                <span>Relatórios</span>
              </div>
            </button>

            {/* 6. Interrupções de Equipamentos - Amarelo/Âmbar */}
            <button
              onClick={() => setActiveTab('interrupcoes')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-150 cursor-pointer min-h-[52px] text-center group ${
                activeTab === 'interrupcoes'
                  ? 'bg-amber-600 border-amber-600 text-white shadow-sm ring-2 ring-amber-500/30'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-900 shadow-2xs'
              }`}
            >
              <AlertTriangle className={`w-4 h-4 shrink-0 mb-0.5 transition-colors ${activeTab === 'interrupcoes' ? 'text-white' : 'text-amber-500 group-hover:text-amber-600'}`} />
              <div className="flex flex-col items-center text-[12px] font-bold leading-tight">
                <span>Interrupções de</span>
                <span>Equipamentos</span>
              </div>
            </button>

            {/* 7. BHDIGITAL - Amarelo/Âmbar */}
            <button
              onClick={() => setActiveTab('bhdigital')}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border transition-all duration-150 cursor-pointer min-h-[52px] text-center group ${
                activeTab === 'bhdigital'
                  ? 'bg-amber-600 border-amber-600 text-white shadow-sm ring-2 ring-amber-500/30'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 hover:bg-amber-50 hover:border-amber-400 hover:text-amber-900 shadow-2xs'
              }`}
            >
              <Layers className={`w-4 h-4 shrink-0 mb-0.5 transition-colors ${activeTab === 'bhdigital' ? 'text-white' : 'text-amber-500 group-hover:text-amber-600'}`} />
              <div className="flex flex-col items-center text-[12px] font-bold leading-tight">
                <span>BHDIGITAL</span>
              </div>
            </button>
          </nav>
        </div>

      </div>
    </header>
  );
};

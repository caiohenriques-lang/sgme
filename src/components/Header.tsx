import React from 'react';
import { ActiveTab } from '../types';
import { Map, BarChart3, Table, Printer, FileSignature } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
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
  totalRecords,
  coordRecords,
}) => {
  return (
    <header className="bg-white text-slate-900 shadow-xs border-b border-slate-200 relative md:sticky md:top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Top Right Timbre / Logo Image (On mobile: positioned at the very top and centered) */}
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
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Dados ao Vivo
                </span>
                {/* Discrete PWA Install Button for Mobile */}
                <PWAInstallButton />
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-700 flex items-center gap-2 mt-0.5 flex-wrap">
                <span className="font-semibold text-slate-800">Fiscalização Eletrônica</span>
                <span className="text-slate-300">•</span>
                <span className="text-slate-600 font-normal">
                  Sistema de Gestão e Monitoramento Espacial - SGME
                </span>
              </p>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                Desenvolvido por Caio Henriques de O. L. Cordeiro
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar - Desktop Only */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-start overflow-x-auto no-scrollbar">
          
          {/* Segmented Tab Bar Container - Fixed single line, no line breaks */}
          <nav className="hidden md:inline-flex flex-nowrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200/90 text-xs sm:text-sm font-medium shadow-2xs whitespace-nowrap">
            <button
              onClick={() => setActiveTab('mapa')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'mapa'
                  ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-500/30'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 font-semibold hover:bg-blue-50/90 hover:border-blue-300 hover:text-blue-900 shadow-2xs'
              }`}
            >
              <Map className={`w-4 h-4 shrink-0 ${activeTab === 'mapa' ? 'text-white' : 'text-blue-600'}`} />
              <span className="whitespace-nowrap">Monitoramento Espacial</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                activeTab === 'mapa' ? 'bg-blue-800 text-white' : 'bg-slate-200/80 text-slate-700 border border-slate-300/60'
              }`}>
                {coordRecords}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('indicadores')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'indicadores'
                  ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-500/30'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 font-semibold hover:bg-blue-50/90 hover:border-blue-300 hover:text-blue-900 shadow-2xs'
              }`}
            >
              <BarChart3 className={`w-4 h-4 shrink-0 ${activeTab === 'indicadores' ? 'text-white' : 'text-blue-600'}`} />
              <span className="whitespace-nowrap">Indicadores</span>
            </button>

            <button
              onClick={() => setActiveTab('tabela')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'tabela'
                  ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-500/30'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 font-semibold hover:bg-blue-50/90 hover:border-blue-300 hover:text-blue-900 shadow-2xs'
              }`}
            >
              <Table className={`w-4 h-4 shrink-0 ${activeTab === 'tabela' ? 'text-white' : 'text-blue-600'}`} />
              <span className="whitespace-nowrap">Lista de Equipamentos</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold shrink-0 ${
                activeTab === 'tabela' ? 'bg-blue-800 text-white' : 'bg-slate-200/80 text-slate-700 border border-slate-300/60'
              }`}>
                {totalRecords}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('gestao_contratual')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'gestao_contratual'
                  ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-500/30'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 font-semibold hover:bg-blue-50/90 hover:border-blue-300 hover:text-blue-900 shadow-2xs'
              }`}
            >
              <FileSignature className={`w-4 h-4 shrink-0 ${activeTab === 'gestao_contratual' ? 'text-white' : 'text-blue-600'}`} />
              <span className="whitespace-nowrap">Gestão Contratual</span>
            </button>

            <button
              onClick={() => setActiveTab('relatorios')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'relatorios'
                  ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-sm ring-2 ring-blue-500/30'
                  : 'bg-white/80 border-slate-200/80 text-slate-700 font-semibold hover:bg-blue-50/90 hover:border-blue-300 hover:text-blue-900 shadow-2xs'
              }`}
            >
              <Printer className={`w-4 h-4 shrink-0 ${activeTab === 'relatorios' ? 'text-white' : 'text-blue-600'}`} />
              <span className="whitespace-nowrap">Relatórios</span>
            </button>
          </nav>
        </div>

      </div>
    </header>
  );
};

import React from 'react';
import { ETransitoChartCard } from './ETransitoChartCard';
import { LayoutGrid, BarChart2, Layers } from 'lucide-react';

export const OutrosView: React.FC = () => {
  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner - Tema Verde Escuro */}
      <div className="bg-white rounded-2xl border border-emerald-200/80 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <div className="p-2.5 bg-emerald-700/60 border border-emerald-500/40 rounded-xl text-emerald-100 shrink-0 shadow-xs">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                    Painel OUTROS
                  </h2>
                  <span className="text-[11px] font-bold bg-emerald-700/80 border border-emerald-400/40 text-emerald-100 px-2 py-0.5 rounded-md">
                    Registros e Indicadores Complementares
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mt-1">
                  Métricas externas, dados operacionais e estatísticas adicionais de trânsito e fiscalização
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-emerald-950/40 border border-emerald-600/30 px-3 py-1.5 rounded-xl">
              <BarChart2 className="w-4 h-4 text-emerald-300" />
              <span className="text-xs font-semibold text-emerald-100">
                Sistema eTrânsito
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Sistema eTransito - Número médio de registros/mês recebidos em 2026 */}
      <ETransitoChartCard />
    </div>
  );
};

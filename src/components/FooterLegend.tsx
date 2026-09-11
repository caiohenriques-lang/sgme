import React, { useState } from 'react';
import { Info, GitBranch, Sparkles, X, CheckCircle2, Clock, RefreshCw, ChevronDown } from 'lucide-react';
import { SpeedLimit50Icon } from './SpeedLimit50Icon';
import { getCurrentVersion, getAllVersions } from '../utils/versionControl';

interface FooterLegendProps {
  loading?: boolean;
  onRefresh?: () => void;
  lastUpdated?: Date;
}

export const FooterLegend: React.FC<FooterLegendProps> = ({
  loading = false,
  onRefresh,
  lastUpdated,
}) => {
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isLegendExpanded, setIsLegendExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('geapi_legend_expanded');
    return saved !== null ? saved === 'true' : false;
  });
  
  const currentVersion = getCurrentVersion();
  const versionHistory = getAllVersions();

  const handleToggleLegend = () => {
    setIsLegendExpanded(prev => {
      const next = !prev;
      localStorage.setItem('geapi_legend_expanded', String(next));
      return next;
    });
  };

  return (
    <footer className="bg-slate-50 text-slate-600 border-t border-slate-200/80 py-4 pb-20 sm:pb-4 mt-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
        
        {/* Collapsible Required Legend Box */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all duration-200">
          <button 
            onClick={handleToggleLegend}
            className="w-full flex items-center justify-between p-2.5 sm:p-3 text-left hover:bg-slate-50 transition-colors cursor-pointer select-none group"
            aria-expanded={isLegendExpanded}
          >
            <div className="flex items-center gap-1.5 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Legenda</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-700 border border-slate-200/80 group-hover:border-blue-200/80 transition-colors">
              <span className="text-[10.5px] font-semibold normal-case">
                {isLegendExpanded ? 'Recolher' : 'Expandir'}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-500 group-hover:text-blue-600 transition-transform duration-200 ${isLegendExpanded ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {isLegendExpanded && (
            <div className="px-3 pb-3 sm:px-4 sm:pb-4 text-[11px] text-slate-600 leading-snug font-normal space-y-1.5 pt-0.5 border-t border-slate-100 animate-in fade-in slide-in-from-top-1 duration-200">
              <p>
                <strong className="text-slate-800">2740/2024</strong> - ELISEU KOPP & CIA LTDA.; <strong className="text-slate-800">2741/2024</strong> - SPLICE INDÚSTRIA, COMÉRCIO E SERVIÇOS LTDA.; <strong className="text-slate-800">2742/2024</strong> - CONSÓRCIO TRÂNSITO SEGURO;
              </p>
              <p className="text-slate-500">
                <strong className="text-slate-700">DIF:</strong> detector de invasão de faixa exclusiva de ônibus;{' '}
                <strong className="text-slate-700">DAS:</strong> detector de avanço de semáforo vermelho;{' '}
                <strong className="text-slate-700">DTLP:</strong> detector de tráfego em local/horário proibido (caminhão);{' '}
                <strong className="text-slate-700">DCP:</strong> detector de conversão em local proibido;{' '}
                <strong className="text-slate-700">CEV:</strong> controlador eletrônico de velocidade.
              </p>
            </div>
          )}
        </div>

        {/* Footer Brand, Actions (Versão, Atualizar) & Developer Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px] pt-1">
          <div className="flex items-center justify-center sm:justify-start text-center sm:text-left">
            <span>
              <strong className="text-slate-700">GEAPI</strong> — Gerência de Análise e Processamento de Infrações | Prefeitura de Belo Horizonte
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Version & Refresh Buttons Row */}
            <div className="flex items-center justify-center gap-2">
              {/* Version Control Badge / Button */}
              <button
                onClick={() => setIsChangelogOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:py-0.5 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors cursor-pointer active:scale-95 shadow-2xs group"
                title={`Controle de Versões: ${currentVersion.version} (${currentVersion.date}) - Clique para ver o histórico de atualizações`}
              >
                <GitBranch className="w-3 h-3 text-blue-600 group-hover:text-blue-700 transition-colors" />
                <span className="font-mono font-bold text-slate-800">{currentVersion.version}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Versão mais recente instalada" />
              </button>

              {/* Global Refresh Button */}
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:py-0.5 text-[11px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg transition-colors cursor-pointer active:scale-95 disabled:opacity-60 shadow-2xs group"
                  title="Atualizar dados de todas as planilhas e abas"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-600' : 'text-slate-500 group-hover:text-blue-600 transition-colors'}`} />
                  <span>Atualizar</span>
                  {lastUpdated && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})
                    </span>
                  )}
                </button>
              )}
            </div>

            {/* Developer Credits */}
            <div className="text-center sm:text-right text-slate-400 text-[11px]">
              Desenvolvido por <span className="text-slate-700 font-bold tracking-wide">Caio Henriques de O. L. Cordeiro</span>
            </div>
          </div>
        </div>

      </div>

      {/* Discrete Version Control Modal / Drawer */}
      {isChangelogOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    Controle de Versões GEAPI
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold">
                      Estável
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Histórico de lançamentos e atualizações do sistema</p>
                </div>
              </div>
              <button
                onClick={() => setIsChangelogOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Scrollable Timeline */}
            <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-600">
              {versionHistory.map((rel) => (
                <div key={rel.version} className="relative pl-5 border-l-2 border-slate-200 space-y-2">
                  <div className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full border-2 ${
                    rel.isLatest
                      ? 'bg-blue-600 border-white ring-2 ring-blue-500/20'
                      : 'bg-slate-300 border-white'
                  }`} />

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-slate-900">{rel.version}</span>
                      {rel.isLatest && (
                        <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-bold px-2 py-0.2 rounded-full flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-blue-500" /> Atual
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {rel.date}
                    </span>
                  </div>

                  <p className="text-[11px] font-bold text-slate-700">{rel.tag}</p>

                  <ul className="space-y-1.5 pt-1">
                    {rel.changes.map((change, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-600 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-[11px] text-slate-500">
              <span>Gerência de Análise e Processamento de Infrações</span>
              <button
                onClick={() => setIsChangelogOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}
    </footer>
  );
};


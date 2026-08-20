import React, { useState } from 'react';
import { Info, GitBranch, Sparkles, X, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
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
  const currentVersion = getCurrentVersion();
  const versionHistory = getAllVersions();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-6 mt-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Required Legend Box */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 shadow-inner space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
            <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>Legenda:</span>
          </div>

          <div className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-normal space-y-3 pt-1">
            <p>
              <strong>2740/2024</strong> - ELISEU KOPP & CIA LTDA.; <strong>2741/2024</strong> - SPLICE INDÚSTRIA, COMÉRCIO E SERVIÇOS LTDA.; <strong>2742/2024</strong> - CONSÓRCIO TRÂNSITO SEGURO;
            </p>
            <p className="text-slate-300">
              <strong>DIF:</strong> detector de invasão de faixa exclusiva de ônibus;{' '}
              <strong>DAS:</strong> detector de avanço de semáforo vermelho;{' '}
              <strong>DTLP:</strong> detector de tráfego em local/horário proibido (caminhão);{' '}
              <strong>DCP:</strong> detector de conversão em local proibido;{' '}
              <strong>CEV:</strong> controlador eletrônico de velocidade.
            </p>
          </div>
        </div>

        {/* Footer Brand & Info */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2">
            <SpeedLimit50Icon className="w-4 h-4 shrink-0" />
            <span>
              <strong>GEAPI</strong> — Gerência de Análise e Processamento de Infrações | Prefeitura de Belo Horizonte
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-end">
            {/* Global Refresh Button Styled for Footer */}
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 rounded-lg transition-colors cursor-pointer active:scale-95 disabled:opacity-60 shadow-2xs group"
                title="Atualizar dados de todas as planilhas e abas"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-400' : 'text-slate-400 group-hover:text-blue-400 transition-colors'}`} />
                <span>Atualizar Dados</span>
                {lastUpdated && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })})
                  </span>
                )}
              </button>
            )}

            <span>Atualização contínua via Google Sheets</span>
            <span className="text-slate-700">•</span>
            {/* Discrete Version Tag */}
            <button
              onClick={() => setIsChangelogOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-300 hover:text-white transition-all cursor-pointer group shadow-2xs"
              title="Clique para ver o histórico de versões"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-[10px] font-semibold tracking-wide text-slate-200 group-hover:text-white">
                {currentVersion.version}
              </span>
              <GitBranch className="w-3 h-3 text-slate-400 group-hover:text-blue-400 transition-colors" />
            </button>
          </div>
        </div>

        {/* Extreme Bottom Credit & Version Info */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 font-medium">
          <div>
            Desenvolvido por <span className="text-white font-bold tracking-wide">Caio Henriques de O. L. Cordeiro</span>
          </div>
          <div className="text-[10px] text-slate-500 flex items-center gap-2 font-mono">
            <span>GEAPI System</span>
            <span>•</span>
            <button
              onClick={() => setIsChangelogOpen(true)}
              className="hover:text-slate-300 transition-colors cursor-pointer underline decoration-dotted"
            >
              Build {currentVersion.version} ({currentVersion.date})
            </button>
          </div>
        </div>

      </div>

      {/* Discrete Version Control Modal / Drawer */}
      {isChangelogOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                  <GitBranch className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    Controle de Versões GEAPI
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-normal">
                      Estável
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Histórico de lançamentos e atualizações do sistema</p>
                </div>
              </div>
              <button
                onClick={() => setIsChangelogOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body - Scrollable Timeline */}
            <div className="p-5 overflow-y-auto space-y-6 text-xs text-slate-300">
              {versionHistory.map((rel) => (
                <div key={rel.version} className="relative pl-5 border-l-2 border-slate-800 space-y-2">
                  <div className={`absolute -left-[7px] top-0 w-3 h-3 rounded-full border-2 ${
                    rel.isLatest
                      ? 'bg-blue-500 border-slate-900 ring-2 ring-blue-500/20'
                      : 'bg-slate-700 border-slate-900'
                  }`} />

                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-white">{rel.version}</span>
                      {rel.isLatest && (
                        <span className="bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-semibold px-2 py-0.2 rounded-full flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-blue-400" /> Atual
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" /> {rel.date}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold text-slate-400">{rel.tag}</p>

                  <ul className="space-y-1 pt-1">
                    {rel.changes.map((change, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 text-slate-300 text-[11px]">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{change}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between text-[11px] text-slate-400">
              <span>Gerência de Análise e Processamento de Infrações</span>
              <button
                onClick={() => setIsChangelogOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-3 py-1.5 rounded-lg transition-colors cursor-pointer text-xs"
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


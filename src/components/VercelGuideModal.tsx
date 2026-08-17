import React from 'react';
import { X, Globe, CheckCircle, ExternalLink, Code2, Server } from 'lucide-react';

interface VercelGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VercelGuideModal: React.FC<VercelGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-slate-800 p-2 rounded-xl text-white border border-slate-700">
              <Globe className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Guia de Hospedagem na Vercel</h3>
              <p className="text-xs text-slate-400">Instruções para publicar a aplicação gratuitamente na Vercel</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-slate-800 text-xs sm:text-sm">
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-emerald-900 text-sm">100% Compatível com Vercel (Static SPA)</h4>
              <p className="text-emerald-800 text-xs mt-0.5">
                Esta aplicação utiliza Vite + React 19 + Tailwind CSS de forma puramente cliente, consultando diretamente a planilha publicada do Google Sheets em tempo real. Não exige servidor Node backend.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider text-xs">Passos para Publicar na Vercel:</h4>

            <div className="space-y-3">
              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="bg-blue-600 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0">1</span>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Exportar o código para o GitHub</h5>
                  <p className="text-xs text-slate-600 mt-0.5">
                    No menu superior do editor (ou via download do ZIP), suba todo este repositório para a sua conta do GitHub.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="bg-blue-600 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0">2</span>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Conectar o Repositório na Vercel</h5>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Acesse <a href="https://vercel.com/new" target="_blank" rel="noreferrer" className="text-blue-600 underline font-semibold">vercel.com/new</a>, faça login e selecione o repositório importado.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="bg-blue-600 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0">3</span>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Configuração do Build (Detectado Automaticamente)</h5>
                  <p className="text-xs text-slate-600 mt-0.5">
                    A Vercel detectará o Vite. As configurações padrão são:
                  </p>
                  <ul className="list-disc list-inside font-mono text-[11px] text-slate-700 mt-1 bg-white p-2 rounded border border-slate-200">
                    <li>Framework Preset: Vite</li>
                    <li>Build Command: npm run build</li>
                    <li>Output Directory: dist</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="bg-blue-600 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0">4</span>
                <div>
                  <h5 className="font-bold text-slate-900 text-xs">Pronto! Clique em "Deploy"</h5>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Em segundos seu site estará online na nuvem com certificado SSL gratuito e domínio da Vercel!
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>GEAPI GE-INFRA — Sistema de Fiscalização</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg transition-colors"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
};

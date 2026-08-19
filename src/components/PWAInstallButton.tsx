import React, { useEffect, useState } from 'react';
import { Download, X, Share, Monitor, Smartphone, CheckCircle } from 'lucide-react';
import { SpeedRadarIcon } from './SpeedRadarIcon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallButton: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Check if already running in standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Detect device environment
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isMobileDevice = /android|iphone|ipad|ipod|mobile/.test(userAgent);
    setIsIOS(isIosDevice);
    setIsDesktop(!isMobileDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Erro ao disparar prompt de instalação:', err);
        setShowGuideModal(true);
      }
    } else {
      // Show instructional modal if no direct prompt event is available
      setShowGuideModal(true);
    }
  };

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {/* Install Button - Clean & discrete for both desktop & mobile */}
      <button
        onClick={handleInstallClick}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-blue-700 border border-blue-200/90 transition-all cursor-pointer active:scale-95 shadow-2xs"
        title="Instalar GEAPI FE como aplicativo (Web App na Área de Trabalho ou Celular)"
      >
        <SpeedRadarIcon className="w-3.5 h-3.5" />
        <span>Instalar WebApp</span>
        <Download className="w-3 h-3 text-blue-500" />
      </button>

      {/* Instructional Modal for Desktop / iOS / Unsupported browsers */}
      {showGuideModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 sm:p-6 shadow-2xl border border-slate-200 text-slate-800 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-2xl border border-blue-100">
                  <SpeedRadarIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 leading-tight">GEAPI FE · WebApp</h4>
                  <p className="text-[11px] text-slate-500">Instalação Facilitada</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Instale o portal como aplicativo dedicado para abrir em janela própria na <strong>Área de Trabalho</strong> ou na <strong>Tela Inicial</strong> do seu celular/tablet.
            </p>

            {/* Platform Guides */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs text-slate-700">
              {isDesktop ? (
                <>
                  <div className="flex items-center gap-2 font-bold text-slate-900 pb-1 border-b border-slate-200/60">
                    <Monitor className="w-4 h-4 text-blue-600" />
                    <span>No Computador / Área de Trabalho:</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-blue-600 bg-blue-100 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>No <strong>Google Chrome</strong> ou <strong>Microsoft Edge</strong>, olhe no lado direito da <strong>barra de endereços (URL)</strong> no topo.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-blue-600 bg-blue-100 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Clique no ícone de <strong>Instalar Aplicativo</strong> (<Download className="w-3.5 h-3.5 inline text-blue-600 mb-0.5" />) ou no menu (três pontos) &gt; <strong>Instalar GEAPI FE</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-blue-600 bg-blue-100 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <span>O ícone do radar será criado na sua <strong>Área de Trabalho</strong> e na barra de tarefas!</span>
                  </div>
                </>
              ) : isIOS ? (
                <>
                  <div className="flex items-center gap-2 font-bold text-slate-900 pb-1 border-b border-slate-200/60">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>No iPhone / iPad (Safari):</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-blue-600 bg-blue-100 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>Toque no botão <Share className="w-3.5 h-3.5 inline text-blue-600 mb-0.5" /> <strong>Compartilhar</strong> na barra inferior do Safari.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-blue-600 bg-blue-100 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Role a lista para baixo e toque em <strong>Adicionar à Tela de Início</strong>.</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 font-bold text-slate-900 pb-1 border-b border-slate-200/60">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>No Celular / Tablet (Android):</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-blue-600 bg-blue-100 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <span>Abra o menu do navegador (três pontos <strong className="text-slate-900">⋮</strong> no topo direito).</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-blue-600 bg-blue-100 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <span>Toque em <strong>Instalar aplicativo</strong> ou <strong>Adicionar à tela inicial</strong>.</span>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Entendido</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

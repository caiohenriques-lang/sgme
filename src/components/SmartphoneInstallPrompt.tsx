import React, { useEffect, useState } from 'react';
import { Share, PlusSquare, X, Download, HelpCircle, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const STORAGE_DISMISSED_KEY = 'geapi_pwa_prompt_dismissed_at';
const STORAGE_INSTALLED_KEY = 'geapi_pwa_installed';
const SILENCE_PERIOD_DAYS = 7;

export const SmartphoneInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    // 1. Detect if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true ||
      localStorage.getItem(STORAGE_INSTALLED_KEY) === 'true';

    if (isStandalone) {
      return;
    }

    // 2. Check silence period (7 days)
    const dismissedAt = localStorage.getItem(STORAGE_DISMISSED_KEY);
    if (dismissedAt) {
      const diffDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < SILENCE_PERIOD_DAYS) {
        return;
      }
    }

    // 3. Detect iOS / iPadOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    const isApple = isIosDevice || isIPadOS;
    setIsIOS(isApple);

    // 4. Capture native beforeinstallprompt (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Wait a few seconds after page load before showing prompt discretely
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem(STORAGE_INSTALLED_KEY, 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. On iOS Safari, display discrete invitation after initial usage (6 seconds)
    if (isApple) {
      const isSafari = /safari/.test(userAgent) && !/crios|fxios|edgios|opr\//.test(userAgent);
      if (isSafari) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 6000);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
          window.removeEventListener('appinstalled', handleAppInstalled);
        };
      }
    }

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
          localStorage.setItem(STORAGE_INSTALLED_KEY, 'true');
          setShowPrompt(false);
        } else {
          // If dismissed by user in system prompt, silence for 7 days
          localStorage.setItem(STORAGE_DISMISSED_KEY, String(Date.now()));
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Erro ao acionar prompt nativo de instalação:', err);
      }
    } else if (isIOS) {
      setShowIOSSteps(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem(STORAGE_DISMISSED_KEY, String(Date.now()));
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="Instalação do Aplicativo GEAPI"
      className="fixed bottom-[74px] md:bottom-6 left-3 md:left-6 z-30 max-w-[calc(100%-84px)] sm:max-w-sm animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      <div className="bg-white text-[#26282B] rounded-2xl p-3.5 shadow-xl border border-slate-200/90 space-y-2.5 relative">
        {/* Subtle yellow/amber indicator line matching the GEAPI identity */}
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-amber-400 rounded-full" />

        {/* Header with GEAPI Digital Identity Icon */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-xs shrink-0 border border-slate-200/80 bg-white flex items-center justify-center p-0.5">
              <img
                src="/icon.svg"
                alt="Ícone GEAPI"
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-[#26282B] leading-tight">
                Instalar GEAPI neste dispositivo
              </h4>
              <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                Acesso rápido em tela cheia e offline
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-[#26282B] p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Fechar convite"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* iOS Step-by-Step Instructions */}
        {isIOS && showIOSSteps ? (
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 space-y-2 text-[11px] text-slate-700 animate-in fade-in duration-200">
            <div className="flex items-start gap-2">
              <span className="font-bold text-[#26282B] bg-amber-100 border border-amber-300 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <p className="leading-tight">
                Toque no botão <strong>Compartilhar</strong> (
                <Share className="w-3 h-3 inline text-slate-700 mx-0.5 mb-0.5" />
                ) no Safari.
              </p>
            </div>

            <div className="flex items-start gap-2">
              <span className="font-bold text-[#26282B] bg-amber-100 border border-amber-300 text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <p className="leading-tight">
                Role para baixo e selecione{' '}
                <span className="inline-flex items-center gap-0.5 font-semibold text-[#26282B] bg-white px-1 py-0.2 rounded border border-slate-300">
                  <PlusSquare className="w-3 h-3 text-slate-700" />
                  Adicionar à Tela de Início
                </span>
                .
              </p>
            </div>

            <div className="flex items-start gap-2 pt-1.5 border-t border-slate-100 mt-1.5">
              <span className="font-bold text-amber-800 bg-amber-50 text-[9px] px-1 py-0.5 rounded border border-amber-200 shrink-0">
                Dica
              </span>
              <p className="leading-tight text-[10px] text-slate-500">
                Se você já tinha o GEAPI instalado e o ícone antigo continua aparecendo, remova o atalho da Tela de Início e adicione-o novamente pelo Safari.
              </p>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-0.5 border-t border-slate-100">
          <button
            onClick={handleDismiss}
            className="text-[11px] font-medium text-slate-500 hover:text-slate-800 px-2 py-1.5 transition-colors cursor-pointer"
          >
            Agora não
          </button>

          {isIOS && !showIOSSteps ? (
            <button
              onClick={() => setShowIOSSteps(true)}
              className="bg-[#26282B] hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Como Instalar</span>
            </button>
          ) : isIOS && showIOSSteps ? (
            <button
              onClick={handleDismiss}
              className="bg-[#26282B] hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 text-amber-400" />
              <span>Entendido</span>
            </button>
          ) : (
            <button
              onClick={handleInstallClick}
              className="bg-[#26282B] hover:bg-slate-800 text-white font-semibold px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Instalar</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SmartphoneInstallPrompt;

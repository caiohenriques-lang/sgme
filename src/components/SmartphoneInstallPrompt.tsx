import React, { useEffect, useState } from 'react';
import { Share, PlusSquare, X, Smartphone, Download, Check, Sparkles } from 'lucide-react';
import { SpeedRadarIcon } from './SpeedRadarIcon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const SmartphoneInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSSteps, setShowIOSSteps] = useState(false);

  useEffect(() => {
    // 1. Detect device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    const isAppleMobile = isIosDevice || isIPadOS;
    const isAndroidDevice = /android/.test(userAgent);
    const isMobile = isAppleMobile || isAndroidDevice || /mobile|tablet/.test(userAgent);

    setIsIOS(isAppleMobile);
    setIsAndroid(isAndroidDevice);

    // 2. Check if already installed & running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) {
      return; // Already running as installed app
    }

    // 3. Check dismissal history (allow reappearing after 5 days if dismissed)
    const dismissedAt = localStorage.getItem('geapi_pwa_mobile_prompt_dismissed');
    let isDismissed = false;
    if (dismissedAt) {
      const diffDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 5) {
        isDismissed = true;
      }
    }

    // Handle beforeinstallprompt on Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!isDismissed) {
        setShowPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('geapi_pwa_installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // If on iOS or mobile where beforeinstallprompt doesn't fire immediately, show after a delay
    if (isMobile && !isDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 1500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
      };
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
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Erro ao disparar prompt nativo de instalação:', err);
      }
    } else if (isIOS) {
      setShowIOSSteps(true);
    } else {
      // Fallback for Android/Chromium without deferredPrompt
      alert('Para instalar: Toque no menu do navegador (três pontos ⋮) e selecione "Instalar aplicativo" ou "Adicionar à tela inicial".');
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('geapi_pwa_mobile_prompt_dismissed', String(Date.now()));
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <aside
      aria-label="Instalação do Aplicativo GEAPI FE"
      className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-blue-500/30 space-y-3 ring-1 ring-white/10">
        
        {/* Header com Ícone Oficial */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shrink-0 ring-2 ring-blue-400/50 bg-slate-950 flex items-center justify-center p-0.5">
              <img
                src="/icon.svg"
                alt="Favicon GEAPI FE"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-sm text-slate-100">
                  Instalar GEAPI FE
                </h4>
                <span className="bg-blue-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                  App
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Acesse direto da tela inicial em modo tela cheia
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instruções para iOS se ativado */}
        {isIOS && showIOSSteps ? (
          <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/60 space-y-2 text-xs text-slate-200 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <span className="font-bold text-blue-400 bg-blue-950/80 border border-blue-800 text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                1
              </span>
              <p className="leading-snug">
                Toque no botão de <strong>Compartilhar</strong> (
                <Share className="w-3.5 h-3.5 inline text-blue-400 mx-0.5 mb-0.5" />
                ) no Safari.
              </p>
            </div>

            <div className="flex items-start gap-2.5">
              <span className="font-bold text-blue-400 bg-blue-950/80 border border-blue-800 text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                2
              </span>
              <p className="leading-snug">
                Role para baixo e toque em{' '}
                <span className="inline-flex items-center gap-1 font-semibold text-white bg-slate-700/80 px-1.5 py-0.5 rounded border border-slate-600">
                  <PlusSquare className="w-3 h-3 text-blue-400" />
                  Adicionar à Tela de Início
                </span>
                .
              </p>
            </div>
          </div>
        ) : null}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <button
            onClick={handleDismiss}
            className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1.5 font-medium transition-colors cursor-pointer"
          >
            Agora não
          </button>

          <button
            onClick={handleInstallClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md hover:shadow-blue-500/20 cursor-pointer"
          >
            {isIOS && !showIOSSteps ? (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span>Como Instalar no iPhone</span>
              </>
            ) : isIOS && showIOSSteps ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Entendi</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5 animate-bounce" />
                <span>Instalar Aplicativo</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};

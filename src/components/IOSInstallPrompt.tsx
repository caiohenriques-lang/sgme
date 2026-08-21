import React, { useEffect, useState } from 'react';
import { Share, PlusSquare, X, Smartphone, Check } from 'lucide-react';

export const IOSInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Detect if running on iOS (iPhone / iPad / iPod / iPadOS)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isIPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
    const isAppleMobile = isIosDevice || isIPadOS;

    // 2. Check if already installed & running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;

    // 3. Check if previously dismissed
    const dismissedAt = localStorage.getItem('geapi_ios_pwa_dismissed');
    let isDismissed = false;
    if (dismissedAt) {
      const diffDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        isDismissed = true;
      }
    }

    if (isAppleMobile && !isStandalone) {
      setIsIOS(true);
      if (!isDismissed) {
        // Delay slightly for smooth page entry
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('geapi_ios_pwa_dismissed', String(Date.now()));
  };

  if (!isIOS || !showPrompt) {
    return null;
  }

  return (
    <aside aria-label="Instalação do Aplicativo iOS" className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 text-white backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-700/80 space-y-3">
        {/* Header com o Favicon Padrão do Portal */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl overflow-hidden shadow-lg shrink-0 ring-2 ring-blue-400/40 bg-slate-950 flex items-center justify-center p-0.5">
              <img
                src="/icon.svg"
                alt="Favicon GEAPI FE"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>Adicionar ao iPhone / iPad</span>
              </h4>
              <p className="text-[11px] text-slate-300">
                Instale o ícone do GEAPI FE na sua tela de início
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
            title="Fechar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Passo a Passo Apple iOS */}
        <div className="bg-slate-800/80 rounded-xl p-3 border border-slate-700/60 space-y-2.5 text-xs text-slate-200">
          <div className="flex items-start gap-2.5">
            <span className="font-bold text-blue-400 bg-blue-950/80 border border-blue-800 text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              1
            </span>
            <p className="leading-snug">
              Toque no botão de <strong>Compartilhar</strong> (
              <Share className="w-3.5 h-3.5 inline text-blue-400 mx-0.5 mb-0.5" />
              ) na barra inferior ou superior do Safari.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-bold text-blue-400 bg-blue-950/80 border border-blue-800 text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              2
            </span>
            <p className="leading-snug">
              Role as opções para baixo e selecione{' '}
              <span className="inline-flex items-center gap-1 font-semibold text-white bg-slate-700/80 px-1.5 py-0.5 rounded border border-slate-600">
                <PlusSquare className="w-3 h-3 text-blue-400" />
                Adicionar à Tela de Início
              </span>
              .
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="font-bold text-blue-400 bg-blue-950/80 border border-blue-800 text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
              3
            </span>
            <p className="leading-snug text-slate-300">
              Toque em <strong>Adicionar</strong> no canto superior direito para criar o ícone idêntico ao portal direto na sua Área de Trabalho / Tela Inicial.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <button
            onClick={handleDismiss}
            className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 font-medium transition-colors cursor-pointer"
          >
            Agora não
          </button>
          <button
            onClick={handleDismiss}
            className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Entendi</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

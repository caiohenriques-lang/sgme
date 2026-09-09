import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff, ShieldAlert, ArrowRight, Building2, Lock } from 'lucide-react';

interface LockScreenProps {
  onUnlock: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onUnlock }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Por favor, digite a palavra-passe.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    const cleanInput = password.trim();

    if (cleanInput === 'GEAPIFE') {
      // Correct password
      sessionStorage.setItem('geapi_portal_auth', 'GEAPIFE_AUTHORIZED');
      onUnlock();
    } else {
      // Incorrect password
      setErrorMsg('Palavra-passe incorreta. Acesso negado.');
      setPassword('');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/80 text-slate-900 flex flex-col items-center justify-between p-4 sm:p-6 relative select-none">
      
      {/* Top Institutional Header */}
      <div className="w-full max-w-md flex justify-center pt-2">
        <img
          src="/logo_pbh_bhtrans.png"
          alt="Logotipo Oficial BHTRANS Prefeitura de Belo Horizonte"
          className="h-10 sm:h-12 w-auto object-contain"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Main Lock Screen Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm relative z-10 space-y-6 my-auto">
        
        {/* Top Header & Branding */}
        <div className="text-center space-y-3">
          {/* GEAPI Functional Icon */}
          <div className="flex justify-center mb-1">
            <img
              src="/icon.svg"
              alt="Identidade Digital GEAPI"
              className="w-14 h-14 sm:w-16 sm:h-16 object-contain"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold tracking-wider uppercase mb-3">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Acesso Restrito · GEAPI</span>
            </span>
            
            <div className="space-y-1 mt-1">
              <p className="text-[clamp(10.5px,2.6vw,14.5px)] sm:text-[14.5px] font-bold tracking-tight text-slate-800 uppercase block text-center whitespace-nowrap">
                GERÊNCIA DE ANÁLISE E PROCESSAMENTO DE INFRAÇÕES
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-none">
                GEAPI
              </h1>
            </div>

            <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
              Fiscalização Eletrônica
            </p>
          </div>
        </div>

        {/* Lock Screen Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">
              Palavra-passe de Acesso
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>

              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder="Digite a palavra-passe..."
                disabled={isSubmitting}
                className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800/20 focus:border-slate-800 transition-all font-medium"
                autoFocus
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs flex items-center gap-2.5 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
          >
            {isSubmitting ? (
              <span>Validando acesso...</span>
            ) : (
              <>
                <span>Acessar Portal</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="pt-3 border-t border-slate-100 text-center space-y-1 text-[11px] text-slate-500">
          <div className="flex items-center justify-center gap-1.5 text-slate-600 font-medium">
            <Building2 className="w-3.5 h-3.5 text-slate-500" />
            <span>PBH / BHTRANS / GEAPI</span>
          </div>
          <p className="text-[10px] text-slate-400">
            Acessos não autorizados são monitorados e registrados por motivos de segurança.
          </p>
        </div>

      </div>

      {/* Footer */}
      <footer className="w-full max-w-md text-center py-2 text-[11px] text-slate-500">
        Desenvolvido por Caio Henriques de O. L. Cordeiro
      </footer>
    </div>
  );
};

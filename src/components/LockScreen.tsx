import React, { useState } from 'react';
import { Lock, KeyRound, Eye, EyeOff, ShieldAlert, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import { SpeedRadarIcon } from './SpeedRadarIcon';

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none">
      
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Lock Screen Card */}
      <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        
        {/* Top Header & Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20 border border-blue-400/30 mb-1">
            <Lock className="w-6 h-6 text-white" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-400 text-[11px] font-bold tracking-wider uppercase mb-2">
              <SpeedRadarIcon className="w-4 h-4" />
              <span>Acesso Restrito · GEAPI</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Fiscalização Eletrônica
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
              Prefeitura Municipal de Belo Horizonte
              <br />
              <span className="text-slate-500">Gerência de Apoio Técnico e Operação (GEAPI)</span>
            </p>
          </div>
        </div>

        {/* Lock Screen Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Palavra-passe de Acesso
            </label>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
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
                className="w-full pl-10 pr-10 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                autoFocus
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? 'Ocultar senha' : 'Exibir senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="bg-rose-950/60 border border-rose-800/80 text-rose-300 rounded-xl p-3 text-xs flex items-center gap-2.5 animate-fadeIn">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Validando acesso...</span>
            ) : (
              <>
                <span>Acessar Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security Footer Notice */}
        <div className="pt-4 border-t border-slate-800/80 text-center space-y-1 text-[11px] text-slate-500">
          <div className="flex items-center justify-center gap-1.5 text-slate-400">
            <Building2 className="w-3.5 h-3.5" />
            <span>PBH / BHTRANS / GEAPI</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Acessos não autorizados são monitorados e registrados por motivos de segurança.
          </p>
        </div>

      </div>
    </div>
  );
};

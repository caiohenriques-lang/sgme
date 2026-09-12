import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';

interface InterrupcoesAuthProps {
  onSuccess: () => void;
  onFailure: () => void;
}

export const InterrupcoesAuth: React.FC<InterrupcoesAuthProps> = ({
  onSuccess,
  onFailure,
}) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Por favor, informe a senha.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch('/api/interrupcoes/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: password.trim() }),
      });

      const data = await response.json();

      if (response.ok && data.authenticated) {
        sessionStorage.setItem('geapi_interrupcoes_auth', 'GEAPI_INTERRUPCOES_AUTHORIZED');
        onSuccess();
      } else {
        // Senha incorreta: permanece na tela e exibe mensagem
        setErrorMsg('Senha incorreta.');
      }
    } catch (err) {
      console.error('Erro de autenticação:', err);
      // Erro de rede ou backend: mensagem técnica distinta, sem redirecionar
      setErrorMsg('Não foi possível validar o acesso. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6">
        
        {/* Top Header Identity */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shadow-2xs mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100/80 text-amber-800 text-[11px] font-bold uppercase tracking-wider mb-2">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>Acesso Restrito</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Interrupções de Equipamentos
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Módulo com controle restrito de inoperâncias temporárias. Digite a senha para acessar o painel.
            </p>
          </div>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label 
              htmlFor="interrupcoes-password-input" 
              className="block text-xs font-semibold text-slate-700"
            >
              Senha de Autorização
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="interrupcoes-password-input"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Digite a senha..."
                autoFocus
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition-all disabled:opacity-60"
              />
            </div>
          </div>

          {/* Feedback Msg */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Validando senha...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Acessar Módulo</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onFailure}
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 px-4 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Voltar ao Monitoramento Espacial</span>
            </button>
          </div>
        </form>

        {/* Sub-footer Note */}
        <div className="pt-2 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            A autorização permanece ativa apenas durante a sessão do navegador.
          </p>
        </div>

      </div>
    </div>
  );
};

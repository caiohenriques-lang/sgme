import React, { useState, useEffect } from 'react';
import { EquipmentRecord } from '../types';
import {
  ControleGeralCTsData,
  INITIAL_CONTROLE_GERAL_DATA,
  fetchControleGeralCTs,
} from '../services/contractService';
import {
  FileSignature,
  Layers,
  ArrowRightLeft,
  DollarSign,
  Calendar,
  RefreshCw,
  History,
  Activity,
  Zap,
} from 'lucide-react';

interface GestaoContratualViewProps {
  records?: EquipmentRecord[];
  lastUpdated?: Date;
}

type SubTab = 'quadro_geral' | 'matriz_contratos';

export const GestaoContratualView: React.FC<GestaoContratualViewProps> = ({ lastUpdated }) => {
  const [data, setData] = useState<ControleGeralCTsData>(INITIAL_CONTROLE_GERAL_DATA);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('quadro_geral');

  const loadData = async () => {
    setLoading(true);
    try {
      const liveData = await fetchControleGeralCTs();
      setData(liveData);
    } catch (err) {
      console.error('Erro ao carregar dados contratuais da matriz:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [lastUpdated]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs shrink-0">
              <FileSignature className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Gestão e Controle Contratual
                </h2>
                {loading && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Atualizando...
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Acompanhamento em tempo real das Ordens de Serviço, Relocações, Termos Aditivos e Matriz de Equipamentos da Fiscalização Eletrônica (GEAPI/BHTRANS).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Vigência: <strong>{data.vigencia}</strong></span>
            </div>
          </div>
        </div>

        {/* Global Summary KPI Bar directly connected to MATRIZ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-5 pt-4 border-t border-slate-100">
          
          {/* Card 1: Faixas Contratadas */}
          <div className="bg-slate-50/90 border border-slate-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide block">
              Contratadas
            </span>
            <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono mt-0.5 block">
              {data.totalFaixasContratadas}
            </span>
            <span className="text-[10px] text-slate-500 font-medium">3 Contratos 2024</span>
          </div>

          {/* Card 2: Faixas com OS na Matriz */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-blue-700 uppercase tracking-wide block">
              Cadastradas na Matriz
            </span>
            <span className="text-xl sm:text-2xl font-bold text-blue-900 font-mono mt-0.5 block">
              {data.totalFaixasMatriz}
            </span>
            <span className="text-[10px] text-blue-700 font-semibold">
              {((data.totalFaixasMatriz / data.totalFaixasContratadas) * 100).toFixed(1)}% do Contrato
            </span>
          </div>

          {/* Card 3: Em Operação */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wide block">
              Em Operação
            </span>
            <span className="text-xl sm:text-2xl font-bold text-emerald-950 font-mono mt-0.5 block">
              {data.totalFaixasOperacaoMatriz}
            </span>
            <span className="text-[10px] text-emerald-800 font-semibold">Faixas Ativas</span>
          </div>

          {/* Card 4: Em Implantação */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide block">
              Em Implantação
            </span>
            <span className="text-xl sm:text-2xl font-bold text-amber-950 font-mono mt-0.5 block">
              {data.totalFaixasImplantacaoMatriz}
            </span>
            <span className="text-[10px] text-amber-800 font-medium">Aguardando Início</span>
          </div>

          {/* Card 5: Relocações */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wide block">
              Relocações
            </span>
            <span className="text-xl sm:text-2xl font-bold text-indigo-950 font-mono mt-0.5 block">
              {data.totalFaixasRelocacaoMatriz}
            </span>
            <span className="text-[10px] text-indigo-800 font-medium">1º e 2º Uso</span>
          </div>

          {/* Card 6: Restantes para Meta */}
          <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-3 text-center">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wide block">
              Faixas Restantes
            </span>
            <span className="text-xl sm:text-2xl font-bold text-rose-950 font-mono mt-0.5 block">
              {data.totalFaixasRestantes}
            </span>
          </div>

        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('quadro_geral')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'quadro_geral'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Quadro Geral & Ordens de Serviço</span>
          </button>

          <button
            onClick={() => setActiveSubTab('matriz_contratos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'matriz_contratos'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Consolidação por Contrato da Matriz</span>
          </button>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* SUB-VIEW 1: QUADRO GERAL DOS CONTRATOS & ORDENS DE SERVIÇO */}
      {/* ========================================================================= */}
      {activeSubTab === 'quadro_geral' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          
          {/* TABELA 1: QUANTIDADE DE FAIXAS POR ORDEM DE SERVIÇO */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                  QUANTIDADE DE FAIXAS POR ORDEM DE SERVIÇO
                </h3>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg">
                3 Contratos Ativos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1050px]">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] sm:text-[11px]">
                    <th className="py-2.5 px-3 w-24">CONTRATO</th>
                    <th className="py-2.5 px-3 min-w-[170px]">EMPRESA</th>
                    <th className="py-2.5 px-2 min-w-[100px]">TIPO EQUIP.</th>
                    <th className="py-2.5 px-2 text-center bg-blue-50/70 text-blue-900 min-w-[90px]">CONTRATADAS</th>
                    {data.osColumns.map((osHeader) => (
                      <th key={osHeader} className="py-2.5 px-1.5 text-center min-w-[65px]">
                        {osHeader}
                      </th>
                    ))}
                    <th className="py-2.5 px-2 text-center bg-emerald-50/70 text-emerald-900 min-w-[110px]">
                      % IMPLANT. / OPER.
                    </th>
                    <th className="py-2.5 px-2 text-center bg-amber-50/70 text-amber-900 min-w-[85px]">
                      RESTANTES
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px] sm:text-xs">
                  {data.tabelaFaixasPorOS.map((row) => (
                    <tr key={row.contrato} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Contrato */}
                      <td className="py-3 px-3 font-bold text-slate-900 align-middle">
                        <span className="bg-slate-100 text-slate-800 border border-slate-200/90 px-1.5 py-0.5 rounded font-mono text-[11px] inline-block whitespace-nowrap">
                          {row.contrato}
                        </span>
                      </td>

                      {/* Empresa */}
                      <td className="py-3 px-3 font-semibold text-slate-800 align-middle text-[11px] leading-tight">
                        {row.empresa}
                      </td>

                      {/* Tipo de Equipamento */}
                      <td className="py-3 px-2 font-medium text-slate-700 align-middle">
                        <span className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] block text-center truncate" title={row.tipoEquipamento}>
                          {row.tipoEquipamento}
                        </span>
                      </td>

                      {/* Faixas Contratadas */}
                      <td className="py-3 px-2 text-center font-bold text-slate-900 bg-blue-50/30 text-xs sm:text-sm align-middle">
                        {row.faixasContratadas}
                      </td>

                      {/* Dynamic OS columns */}
                      {row.osList.map((os, idx) => (
                        <td key={idx} className="py-3 px-1.5 text-center align-middle">
                          {os.faixas !== undefined && os.faixas !== '' ? (
                            <div className="leading-tight">
                              <span className="font-bold text-slate-900 text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                                {os.faixas}
                              </span>
                              {os.data && (
                                <span className={`block text-[9px] font-mono mt-1 px-1 py-0.2 rounded ${
                                  os.data.includes('AGUARDANDO')
                                    ? 'text-amber-700 font-semibold bg-amber-50 border border-amber-200'
                                    : 'text-slate-500'
                                }`}>
                                  {os.data}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      ))}

                      {/* % em Implantação/Operação */}
                      <td className="py-3 px-2 text-center bg-emerald-50/30 align-middle">
                        <span className="font-bold text-emerald-800 text-[11px] bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                          {row.percentualImplantacaoOperacao}
                        </span>
                      </td>

                      {/* Faixas Restantes */}
                      <td className="py-3 px-2 text-center bg-amber-50/30 align-middle">
                        <span className="font-bold text-amber-900 text-xs bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200 inline-block">
                          {row.faixasRestantes}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <span><strong>{data.totalFaixasContratadas}</strong> faixas contratadas</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Vigência dos Contratos: <strong>{data.vigencia}</strong></span>
                </div>
              </div>
            </div>

          </div>

          {/* TABELA 2: QUANTIDADE DE RELOCAÇÕES (1º e 2º USO) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                  QUANTIDADE DE RELOCAÇÕES
                </h3>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
                Saldo de Relocação
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[750px]">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-28">CONTRATO</th>
                    <th className="py-3 px-4 min-w-[200px]">EMPRESA</th>
                    <th className="py-3 px-4 min-w-[150px]">TIPO DE EQUIPAMENTO</th>
                    <th className="py-3 px-4 text-center bg-indigo-50/60 text-indigo-900">FAIXAS DE RELOCAÇÃO</th>
                    <th className="py-3 px-4 text-center">1º USO</th>
                    <th className="py-3 px-4 text-center">2º USO</th>
                    <th className="py-3 px-4 text-center bg-emerald-50/60 text-emerald-900">RESTANTE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {data.tabelaRelocacoes.map((row) => (
                    <tr key={row.contrato} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 align-middle">
                        <span className="bg-slate-100 text-slate-800 border border-slate-200/90 px-2 py-1 rounded-md font-mono text-xs inline-block">
                          {row.contrato}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 align-middle">
                        {row.empresa}
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700 align-middle">
                        <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                          {row.tipoEquipamento}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-indigo-900 bg-indigo-50/30 text-sm align-middle">
                        {row.faixasRelocacao}
                      </td>
                      <td className="py-3.5 px-4 text-center align-middle">
                        {row.primeiroUso.faixas !== undefined ? (
                          <div>
                            <span className="font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded">
                              {row.primeiroUso.faixas}
                            </span>
                            {row.primeiroUso.data && (
                              <span className="block text-[10px] text-slate-500 font-mono mt-1">
                                {row.primeiroUso.data}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center align-middle">
                        {row.segundoUso.faixas !== undefined ? (
                          <div>
                            <span className="font-bold text-slate-900 text-xs bg-slate-100 px-2 py-0.5 rounded">
                              {row.segundoUso.faixas}
                            </span>
                            {row.segundoUso.data && (
                              <span className={`block text-[10px] font-mono mt-1 px-1.5 py-0.5 rounded ${
                                row.segundoUso.data.includes('AGUARDANDO')
                                  ? 'text-amber-700 font-semibold bg-amber-50 border border-amber-200'
                                  : 'text-slate-500'
                              }`}>
                                {row.segundoUso.data}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-300 font-bold">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center bg-emerald-50/30 align-middle">
                        <span className="font-bold text-emerald-800 text-xs bg-emerald-100/80 px-2.5 py-1 rounded-md border border-emerald-200">
                          {row.restante}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

          {/* TABELA 3: CUSTO POR FAIXA E POR CONTRATO (com 1ª TA e 2ª TA) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
                  CUSTO POR FAIXA E POR CONTRATO (CONTRATOS 2024)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Valores, BDI, 1ª TA e 2ª TA
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4 w-28">CONTRATO</th>
                    <th className="py-3 px-4 min-w-[220px]">EMPRESA</th>
                    <th className="py-3 px-4 text-right bg-slate-50/60">VALOR DE FAIXA (CONTRATADO)</th>
                    <th className="py-3 px-4 text-center">BDI</th>
                    <th className="py-3 px-4 text-center">1ª TA</th>
                    <th className="py-3 px-4 text-center">2ª TA</th>
                    <th className="py-3 px-4 text-right bg-emerald-50/60 text-emerald-950">
                      VALOR DE FAIXA ATUAL + BDI
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {data.tabelaCustos.map((row) => (
                    <tr key={row.contrato} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900 align-middle">
                        <span className="bg-slate-100 text-slate-800 border border-slate-200/90 px-2 py-1 rounded-md font-mono text-xs inline-block">
                          {row.contrato}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-800 align-middle">
                        {row.empresa}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700 bg-slate-50/30 align-middle">
                        {row.valorContratado}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 align-middle">
                        {row.bdi}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 align-middle">
                        {row.primeiraTA}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 align-middle">
                        {row.segundaTA}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-800 bg-emerald-50/30 text-sm align-middle">
                        {row.valorAtualBDI}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SUB-VIEW 2: CONSOLIDAÇÃO POR CONTRATO DA MATRIZ */}
      {/* ========================================================================= */}
      {activeSubTab === 'matriz_contratos' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Contracts Detailed Progress Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {data.tabelaFaixasPorOS.map((ct) => {
              const totalMatriz = ct.totalFaixasMatriz || 0;
              const emOp = ct.faixasEmOperacaoMatriz || 0;
              const emImp = ct.faixasEmImplantacaoMatriz || 0;
              const rel = ct.faixasRelocacaoMatriz || 0;
              const contratadas = ct.faixasContratadas;
              const pctExec = ((totalMatriz / contratadas) * 100).toFixed(1);

              return (
                <div
                  key={ct.contrato}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-xs transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="font-bold text-sm text-slate-900 font-mono">CT {ct.contrato}</span>
                          <span className="block text-[11px] font-semibold text-slate-500">{ct.empresa}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                        {ct.tipoEquipamento}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1">
                        <span>Progresso da Matriz</span>
                        <span className="font-bold text-blue-900">{totalMatriz} / {contratadas} faixas ({pctExec}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden flex">
                        <div
                          className="bg-emerald-500 h-full"
                          style={{ width: `${(emOp / contratadas) * 100}%` }}
                          title={`Em Operação: ${emOp}`}
                        ></div>
                        <div
                          className="bg-amber-400 h-full"
                          style={{ width: `${(emImp / contratadas) * 100}%` }}
                          title={`Em Implantação: ${emImp}`}
                        ></div>
                        <div
                          className="bg-indigo-500 h-full"
                          style={{ width: `${(rel / contratadas) * 100}%` }}
                          title={`Relocação: ${rel}`}
                        ></div>
                      </div>
                    </div>

                    {/* Matrix Status Counts */}
                    <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">Em Operação</span>
                        <span className="text-lg font-bold text-emerald-950 font-mono">{emOp}</span>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-2">
                        <span className="text-[10px] font-bold text-amber-800 uppercase block">Implantação</span>
                        <span className="text-lg font-bold text-amber-950 font-mono">{emImp}</span>
                      </div>
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2">
                        <span className="text-[10px] font-bold text-indigo-800 uppercase block">Relocação</span>
                        <span className="text-lg font-bold text-indigo-950 font-mono">{rel}</span>
                      </div>
                    </div>

                    {/* Breakdown by OS */}
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide block mb-2">
                        Ordens de Serviço na Matriz
                      </span>
                      <div className="space-y-1.5">
                        {ct.osList
                          .filter((os) => os.faixas !== undefined && os.faixas !== '')
                          .map((os) => (
                            <div
                              key={os.label}
                              className="flex items-center justify-between text-xs bg-slate-50 border border-slate-100 px-2.5 py-1.5 rounded-lg"
                            >
                              <span className="font-semibold text-slate-800">{os.label}</span>
                              <div className="flex items-center gap-2">
                                {os.dataOperacaoMatriz && (
                                  <span className="text-[10px] text-slate-500 font-mono">
                                    Op: {os.dataOperacaoMatriz}
                                  </span>
                                )}
                                <span className="font-bold text-blue-900 bg-blue-100/80 px-2 py-0.5 rounded font-mono text-[11px]">
                                  {os.faixas} faixas
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Remaining faixas footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Saldo Restante:</span>
                    <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                      {ct.faixasRestantes} faixas restantes
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};

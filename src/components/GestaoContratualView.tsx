import React from 'react';
import { INITIAL_CONTROLE_GERAL_DATA } from '../services/contractService';
import {
  FileSignature,
  Layers,
  ArrowRightLeft,
  DollarSign,
  Calendar,
  CheckCircle2
} from 'lucide-react';

export const GestaoContratualView: React.FC = () => {
  const data = INITIAL_CONTROLE_GERAL_DATA;

  return (
    <div className="space-y-8 animate-in fade-in duration-200 pb-12">
      
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
                  Controle Geral dos Contratos
                </h2>
                <span className="text-[11px] font-semibold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200/80">
                  Gestão Contratual Oficial
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Acompanhamento de Ordens de Serviço, Relocações e Custos Contratuais da Fiscalização Eletrônica (GEAPI/BHTRANS).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>Vigência: <strong>{data.vigencia}</strong></span>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-medium text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Total Contratado: <strong>{data.totalFaixasContratadas} faixas</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TABELA 1: QUANTIDADE DE FAIXAS POR ORDEM DE SERVIÇO */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Table Title Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
              QUANTIDADE DE FAIXAS POR ORDEM DE SERVIÇO
            </h3>
          </div>
          <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
            3 Contratos Principais
          </span>
        </div>

        {/* Full-width Table without Horizontal Scroll */}
        <div className="w-full">
          <table className="w-full text-left border-collapse table-fixed">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px] sm:text-[11px]">
                <th className="py-2.5 px-2 w-[10%]">CONTRATO</th>
                <th className="py-2.5 px-2 w-[16%]">EMPRESA</th>
                <th className="py-2.5 px-2 w-[13%]">TIPO EQUIP.</th>
                <th className="py-2.5 px-1.5 text-center bg-blue-50/60 text-blue-900 w-[9%]">CONTRATADAS</th>
                <th className="py-2.5 px-1 text-center w-[6%]">1ª OS</th>
                <th className="py-2.5 px-1 text-center w-[6%]">2ª OS</th>
                <th className="py-2.5 px-1 text-center w-[6%]">3ª OS</th>
                <th className="py-2.5 px-1 text-center w-[6%]">4ª OS</th>
                <th className="py-2.5 px-1 text-center w-[6%]">5ª OS</th>
                <th className="py-2.5 px-1 text-center w-[6%]">6ª OS</th>
                <th className="py-2.5 px-1.5 text-center bg-emerald-50/60 text-emerald-900 w-[11%]">
                  % IMPLANT. / OPER.
                </th>
                <th className="py-2.5 px-1.5 text-center bg-amber-50/60 text-amber-900 w-[9%]">
                  RESTANTES
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 text-[11px] sm:text-xs">
              {data.tabelaFaixasPorOS.map((row) => (
                <tr key={row.contrato} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Contrato */}
                  <td className="py-3 px-2 font-bold text-slate-900 align-middle">
                    <span className="bg-slate-100 text-slate-800 border border-slate-200/90 px-1.5 py-0.5 rounded font-mono text-[11px] inline-block whitespace-nowrap">
                      {row.contrato}
                    </span>
                  </td>

                  {/* Empresa */}
                  <td className="py-3 px-2 font-semibold text-slate-800 align-middle text-[11px] leading-tight break-words">
                    {row.empresa}
                  </td>

                  {/* Tipo de Equipamento */}
                  <td className="py-3 px-2 font-medium text-slate-700 align-middle">
                    <span className="bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded text-[10px] block text-center truncate" title={row.tipoEquipamento}>
                      {row.tipoEquipamento}
                    </span>
                  </td>

                  {/* Faixas Contratadas */}
                  <td className="py-3 px-1.5 text-center font-bold text-slate-900 bg-blue-50/30 text-xs sm:text-sm align-middle">
                    {row.faixasContratadas}
                  </td>

                  {/* 1ª OS */}
                  <td className="py-3 px-1 text-center align-middle">
                    {row.os1.faixas !== undefined ? (
                      <div className="leading-tight">
                        <span className="font-bold text-slate-900 text-xs">{row.os1.faixas}</span>
                        {row.os1.data && (
                          <span className="block text-[9px] text-slate-500 font-mono">
                            {row.os1.data}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* 2ª OS */}
                  <td className="py-3 px-1 text-center align-middle">
                    {row.os2.faixas !== undefined ? (
                      <div className="leading-tight">
                        <span className="font-bold text-slate-900 text-xs">{row.os2.faixas}</span>
                        {row.os2.data && (
                          <span className="block text-[9px] text-slate-500 font-mono">
                            {row.os2.data}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* 3ª OS */}
                  <td className="py-3 px-1 text-center align-middle">
                    {row.os3.faixas !== undefined ? (
                      <div className="leading-tight">
                        <span className="font-bold text-slate-900 text-xs">{row.os3.faixas}</span>
                        {row.os3.data && (
                          <span className="block text-[9px] text-slate-500 font-mono">
                            {row.os3.data}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* 4ª OS */}
                  <td className="py-3 px-1 text-center align-middle">
                    {row.os4.faixas !== undefined ? (
                      <div className="leading-tight">
                        <span className="font-bold text-slate-900 text-xs">{row.os4.faixas}</span>
                        {row.os4.data && (
                          <span className="block text-[9px] text-slate-500 font-mono">
                            {row.os4.data}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* 5ª OS */}
                  <td className="py-3 px-1 text-center align-middle">
                    {row.os5.faixas !== undefined ? (
                      <div className="leading-tight">
                        <span className="font-bold text-slate-900 text-xs">{row.os5.faixas}</span>
                        {row.os5.data && (
                          <span className="block text-[9px] text-slate-500 font-mono">
                            {row.os5.data}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* 6ª OS */}
                  <td className="py-3 px-1 text-center align-middle">
                    {row.os6.faixas !== undefined ? (
                      <div className="leading-tight">
                        <span className="font-bold text-slate-900 text-xs">{row.os6.faixas}</span>
                        {row.os6.data && (
                          <span className="block text-[9px] text-amber-700 font-semibold mt-0.5 bg-amber-50 px-1 rounded border border-amber-200 truncate">
                            {row.os6.data}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* % em Implantação/Operação */}
                  <td className="py-3 px-1.5 text-center bg-emerald-50/30 align-middle">
                    <span className="font-bold text-emerald-800 text-[11px] bg-emerald-100/80 px-1.5 py-0.5 rounded border border-emerald-200 inline-block">
                      {row.percentualImplantacaoOperacao}
                    </span>
                  </td>

                  {/* Faixas Restantes */}
                  <td className="py-3 px-1.5 text-center bg-amber-50/30 align-middle">
                    <span className="font-bold text-amber-900 text-xs bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200 inline-block">
                      {row.faixasRestantes}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table 1 Footer Notes */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span><strong>1.363</strong> faixas contratadas</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Vigência dos Contratos: <strong>19/07/2024 à 18/07/2029</strong></span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* TABELA 2: QUANTIDADE DE RELOCAÇÕES */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Table Title Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
              QUANTIDADE DE RELOCAÇÕES
            </h3>
          </div>
          <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-lg">
            Controle de Saldo de Relocação
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-28">CONTRATO</th>
                <th className="py-3 px-4 min-w-[220px]">EMPRESA</th>
                <th className="py-3 px-4 min-w-[160px]">TIPO DE EQUIPAMENTO</th>
                <th className="py-3 px-4 text-center bg-indigo-50/60 text-indigo-900">FAIXAS DE RELOCAÇÃO</th>
                <th className="py-3 px-4 text-center">1º USO</th>
                <th className="py-3 px-4 text-center bg-emerald-50/60 text-emerald-900">RESTANTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {data.tabelaRelocacoes.map((row) => (
                <tr key={row.contrato} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Contrato */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 align-top">
                    <span className="bg-slate-100 text-slate-800 border border-slate-200/90 px-2 py-1 rounded-md font-mono text-xs inline-block">
                      {row.contrato}
                    </span>
                  </td>

                  {/* Empresa */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 align-top">
                    {row.empresa}
                  </td>

                  {/* Tipo de Equipamento */}
                  <td className="py-3.5 px-4 font-medium text-slate-700 align-top">
                    <span className="bg-slate-50 border border-slate-200 px-2 py-0.5 rounded text-[11px]">
                      {row.tipoEquipamento}
                    </span>
                  </td>

                  {/* Faixas de Relocação */}
                  <td className="py-3.5 px-4 text-center font-bold text-indigo-900 bg-indigo-50/30 text-sm align-top">
                    {row.faixasRelocacao}
                  </td>

                  {/* 1º Uso */}
                  <td className="py-3.5 px-4 text-center align-top">
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

                  {/* Restante */}
                  <td className="py-3.5 px-4 text-center bg-emerald-50/30 align-top">
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

      {/* ========================================================================= */}
      {/* TABELA 3: CUSTO POR FAIXA E POR CONTRATO */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* Table Title Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm sm:text-base text-slate-900 uppercase tracking-wide">
              CUSTO POR FAIXA E POR CONTRATO
            </h3>
          </div>
          <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
            Valores Contratados, BDI e 1ª TA
          </span>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-28">CONTRATO</th>
                <th className="py-3 px-4 min-w-[220px]">EMPRESA</th>
                <th className="py-3 px-4 text-right bg-slate-50/60">VALOR DE FAIXA (CONTRATADO)</th>
                <th className="py-3 px-4 text-center">BDI</th>
                <th className="py-3 px-4 text-center">1ª TA</th>
                <th className="py-3 px-4 text-right bg-emerald-50/60 text-emerald-950">
                  VALOR DE FAIXA ATUAL + BDI
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {data.tabelaCustos.map((row) => (
                <tr key={row.contrato} className="hover:bg-slate-50/80 transition-colors">
                  
                  {/* Contrato */}
                  <td className="py-3.5 px-4 font-bold text-slate-900 align-middle">
                    <span className="bg-slate-100 text-slate-800 border border-slate-200/90 px-2 py-1 rounded-md font-mono text-xs inline-block">
                      {row.contrato}
                    </span>
                  </td>

                  {/* Empresa */}
                  <td className="py-3.5 px-4 font-semibold text-slate-800 align-middle">
                    {row.empresa}
                  </td>

                  {/* Valor de Faixa (Contratado) */}
                  <td className="py-3.5 px-4 text-right font-mono font-medium text-slate-700 bg-slate-50/30 align-middle">
                    {row.valorContratado}
                  </td>

                  {/* BDI */}
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 align-middle">
                    {row.bdi}
                  </td>

                  {/* 1ª TA */}
                  <td className="py-3.5 px-4 text-center font-mono font-medium text-slate-700 align-middle">
                    {row.primeiraTA}
                  </td>

                  {/* Valor de Faixa Atual + BDI */}
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
  );
};

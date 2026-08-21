import React, { useState, useEffect, useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
} from 'recharts';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  Loader2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import {
  InterrupcaoRecord,
  fetchInterrupcoesData,
  calculateContratoSummary,
  calculateMensalMatrix,
  calculateTipoSummary,
  CONTRATOS_ATIVOS,
} from '../services/interrupcoesService';

type SortInoperantesKey = 'ct' | 'codigo' | 'tipo' | 'motivo' | 'dataParada';
type SortHistoricoKey = 'ct' | 'codigo' | 'tipo' | 'motivo' | 'dataParada' | 'dataRetorno';

const renderCustomPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percentualFormatted,
}: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#1e293b"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {percentualFormatted}
    </text>
  );
};

const renderBarCustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (!value) return null;
  // If bar is tall enough, place text inside in white, otherwise above
  const isTall = height > 28;
  return (
    <text
      x={x + width / 2}
      y={isTall ? y + 20 : y - 6}
      fill={isTall ? '#ffffff' : '#059669'}
      textAnchor="middle"
      fontSize={12}
      fontWeight={700}
    >
      {value}
    </text>
  );
};

export const InterrupcoesView: React.FC = () => {
  const [records, setRecords] = useState<InterrupcaoRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters, Search and Sorting states
  const [searchInoperantes, setSearchInoperantes] = useState('');
  const [pageInoperantes, setPageInoperantes] = useState(1);
  const [sortInoperantes, setSortInoperantes] = useState<{
    key: SortInoperantesKey;
    direction: 'asc' | 'desc';
  }>({ key: 'dataParada', direction: 'desc' });
  const rowsPerPageInoperantes = 15;

  const [searchMensal, setSearchMensal] = useState('');
  const [pageMensal, setPageMensal] = useState(1);
  const [sortMensal, setSortMensal] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'totalGeral', direction: 'desc' });
  const rowsPerPageMensal = 20;

  const [searchHistorico, setSearchHistorico] = useState('');
  const [filterMotivoHistorico, setFilterMotivoHistorico] = useState('TODOS');
  const [pageHistorico, setPageHistorico] = useState(1);
  const [sortHistorico, setSortHistorico] = useState<{
    key: SortHistoricoKey;
    direction: 'asc' | 'desc';
  }>({ key: 'dataParada', direction: 'desc' });
  const rowsPerPageHistorico = 25;

  useEffect(() => {
    fetchInterrupcoesData().then((data) => {
      setRecords(data);
      setLoading(false);
    });
  }, []);

  // Handlers for sorting
  const handleSortInoperantes = (key: SortInoperantesKey) => {
    setSortInoperantes((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPageInoperantes(1);
  };

  const handleSortMensal = (key: string) => {
    setSortMensal((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPageMensal(1);
  };

  const handleSortHistorico = (key: SortHistoricoKey) => {
    setSortHistorico((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPageHistorico(1);
  };

  // 1. Calculations for Section 01
  const inoperantesList = useMemo(() => {
    return records.filter((r) => CONTRATOS_ATIVOS.includes(r.ct) && r.isInoperante);
  }, [records]);

  const filteredInoperantes = useMemo(() => {
    if (!searchInoperantes) return inoperantesList;
    const q = searchInoperantes.toLowerCase();
    return inoperantesList.filter(
      (r) =>
        r.codigo.toLowerCase().includes(q) ||
        r.motivo.toLowerCase().includes(q) ||
        r.tipo.toLowerCase().includes(q) ||
        r.ct.toLowerCase().includes(q)
    );
  }, [inoperantesList, searchInoperantes]);

  const sortedInoperantes = useMemo(() => {
    return [...filteredInoperantes].sort((a, b) => {
      const valA = String(a[sortInoperantes.key] || '');
      const valB = String(b[sortInoperantes.key] || '');
      const cmp = valA.localeCompare(valB, 'pt-BR', { numeric: true, sensitivity: 'base' });
      return sortInoperantes.direction === 'asc' ? cmp : -cmp;
    });
  }, [filteredInoperantes, sortInoperantes]);

  const paginatedInoperantes = useMemo(() => {
    const start = (pageInoperantes - 1) * rowsPerPageInoperantes;
    return sortedInoperantes.slice(start, start + rowsPerPageInoperantes);
  }, [sortedInoperantes, pageInoperantes]);

  const totalPagesInoperantes = Math.ceil(sortedInoperantes.length / rowsPerPageInoperantes) || 1;

  // Export CSV for Inoperantes
  const handleExportInoperantesCSV = () => {
    if (sortedInoperantes.length === 0) return;
    const headers = ['CONTRATO', 'CÓDIGO', 'TIPO', 'MOTIVO DA PARADA', 'DATA DA PARADA', 'ENDEREÇO COMPLETO', 'REGIONAL', 'BAIRRO'];
    const rows = sortedInoperantes.map((r) => [
      `"${r.ct}"`,
      `"${r.codigo}"`,
      `"${r.tipo}"`,
      `"${(r.motivo || '').replace(/"/g, '""')}"`,
      `"${r.dataParada}"`,
      `"${(r.enderecoCompleto || '').replace(/"/g, '""')}"`,
      `"${(r.regional || '').replace(/"/g, '""')}"`,
      `"${(r.bairro || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `equipamentos_inoperantes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const contratoSummary = useMemo(() => {
    return calculateContratoSummary(records);
  }, [records]);

  // 2. Calculations for Section 02 (Monthly Matrix)
  const mensalData = useMemo(() => {
    return calculateMensalMatrix(records);
  }, [records]);

  const filteredMensalRows = useMemo(() => {
    if (!searchMensal) return mensalData.rows;
    const q = searchMensal.toLowerCase();
    return mensalData.rows.filter(
      (r) =>
        r.codigo.toLowerCase().includes(q) ||
        r.tipo.toLowerCase().includes(q) ||
        (r.contrato && r.contrato.toLowerCase().includes(q))
    );
  }, [mensalData.rows, searchMensal]);

  const sortedMensalRows = useMemo(() => {
    return [...filteredMensalRows].sort((a: any, b: any) => {
      const valA = a[sortMensal.key];
      const valB = b[sortMensal.key];
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortMensal.direction === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA ?? '');
      const strB = String(valB ?? '');
      const cmp = strA.localeCompare(strB, 'pt-BR', { numeric: true, sensitivity: 'base' });
      return sortMensal.direction === 'asc' ? cmp : -cmp;
    });
  }, [filteredMensalRows, sortMensal]);

  const paginatedMensalRows = useMemo(() => {
    const start = (pageMensal - 1) * rowsPerPageMensal;
    return sortedMensalRows.slice(start, start + rowsPerPageMensal);
  }, [sortedMensalRows, pageMensal]);

  const totalPagesMensal = Math.ceil(sortedMensalRows.length / rowsPerPageMensal) || 1;

  // 3. Calculations for Section 03 (Types Chart + Full History Table)
  const tipoSummary = useMemo(() => {
    return calculateTipoSummary(records);
  }, [records]);

  const historicoGeral = useMemo(() => {
    return records
      .filter((r) => CONTRATOS_ATIVOS.includes(r.ct) || !!r.dataRetorno);
  }, [records]);

  const motivosDisponiveis = useMemo(() => {
    const set = new Set<string>();
    historicoGeral.forEach((r) => {
      if (r.motivo) set.add(r.motivo);
    });
    return Array.from(set).sort();
  }, [historicoGeral]);

  const filteredHistorico = useMemo(() => {
    return historicoGeral.filter((r) => {
      if (filterMotivoHistorico !== 'TODOS' && r.motivo !== filterMotivoHistorico) {
        return false;
      }
      if (!searchHistorico) return true;
      const q = searchHistorico.toLowerCase();
      return (
        r.codigo.toLowerCase().includes(q) ||
        r.motivo.toLowerCase().includes(q) ||
        r.tipo.toLowerCase().includes(q) ||
        r.ct.toLowerCase().includes(q) ||
        r.enderecoCompleto.toLowerCase().includes(q)
      );
    });
  }, [historicoGeral, filterMotivoHistorico, searchHistorico]);

  const sortedHistorico = useMemo(() => {
    return [...filteredHistorico].sort((a, b) => {
      const valA = String(a[sortHistorico.key] || '');
      const valB = String(b[sortHistorico.key] || '');
      const cmp = valA.localeCompare(valB, 'pt-BR', { numeric: true, sensitivity: 'base' });
      return sortHistorico.direction === 'asc' ? cmp : -cmp;
    });
  }, [filteredHistorico, sortHistorico]);

  const paginatedHistorico = useMemo(() => {
    const start = (pageHistorico - 1) * rowsPerPageHistorico;
    return sortedHistorico.slice(start, start + rowsPerPageHistorico);
  }, [sortedHistorico, pageHistorico]);

  const totalPagesHistorico = Math.ceil(sortedHistorico.length / rowsPerPageHistorico) || 1;

  if (loading && records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 my-6 shadow-xs">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Carregando dados da aba Interrupções...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Buscando dados de interrupções e inoperâncias no Google Sheets...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            Painel de Interrupções de Equipamentos
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Monitoramento de inoperâncias temporárias, histórico mensal acumulado e motivos de parada dos contratos de fiscalização eletrônica.
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-right">
            <span className="text-[11px] font-medium text-slate-500 block">Total Interrupções (Ativos)</span>
            <span className="text-lg font-bold text-slate-900">{contratoSummary.totalGeral}</span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-3.5 py-2 text-right">
            <span className="text-[11px] font-medium text-amber-700 block">Inoperantes Hoje</span>
            <span className="text-lg font-bold text-amber-800">{inoperantesList.length}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 01: Equipamentos Inoperantes + Acumulado por Contrato               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Equipamentos Inoperantes Temporariamente (7 colunas lg) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          {/* Header da Tabela */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Equipamentos Inoperantes Temporariamente
              </h3>
              <p className="text-xs text-slate-500">
                Equipamentos com parada registrada e aguardando retorno ({sortedInoperantes.length} registros)
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Botão Exportar CSV */}
              <button
                type="button"
                onClick={handleExportInoperantesCSV}
                disabled={sortedInoperantes.length === 0}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-300/80 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                title="Exportar equipamentos inoperantes para CSV (compatível com Excel)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                <span>Exportar CSV</span>
              </button>

              {/* Input Busca */}
              <div className="relative min-w-[160px] sm:min-w-[190px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar equipamento..."
                  value={searchInoperantes}
                  onChange={(e) => {
                    setSearchInoperantes(e.target.value);
                    setPageInoperantes(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Tabela de Inoperantes */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th
                    onClick={() => handleSortInoperantes('ct')}
                    className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                    title="Clique para ordenar por Contrato"
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>CT</span>
                      {sortInoperantes.key === 'ct' ? (
                        sortInoperantes.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-amber-600 font-bold" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-amber-600 font-bold" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortInoperantes('codigo')}
                    className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                    title="Clique para ordenar por Código"
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>CÓDIGO</span>
                      {sortInoperantes.key === 'codigo' ? (
                        sortInoperantes.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-amber-600 font-bold" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-amber-600 font-bold" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortInoperantes('tipo')}
                    className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                    title="Clique para ordenar por Tipo"
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>TIPO</span>
                      {sortInoperantes.key === 'tipo' ? (
                        sortInoperantes.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-amber-600 font-bold" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-amber-600 font-bold" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortInoperantes('motivo')}
                    className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                    title="Clique para ordenar por Motivo"
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>MOTIVO</span>
                      {sortInoperantes.key === 'motivo' ? (
                        sortInoperantes.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-amber-600 font-bold" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-amber-600 font-bold" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortInoperantes('dataParada')}
                    className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                    title="Clique para ordenar por Data da Parada"
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>DATA DA PARADA</span>
                      {sortInoperantes.key === 'dataParada' ? (
                        sortInoperantes.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-amber-600 font-bold" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-amber-600 font-bold" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedInoperantes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Nenhum equipamento inoperante encontrado com os filtros aplicados.
                    </td>
                  </tr>
                ) : (
                  paginatedInoperantes.map((row) => (
                    <tr key={row.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-2.5 px-3 text-center whitespace-nowrap text-slate-600 font-mono">
                        {row.ct}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap font-bold text-slate-900">
                        {row.codigo}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-sm text-[11px] bg-slate-100 text-slate-700 font-semibold">
                          {row.tipo}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center text-slate-700 max-w-[220px] truncate" title={row.motivo}>
                        {row.motivo}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-amber-700 font-semibold">
                        {row.dataParada}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação da Tabela de Inoperantes */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              {sortedInoperantes.length > 0 ? (
                <>
                  {(pageInoperantes - 1) * rowsPerPageInoperantes + 1} -{' '}
                  {Math.min(pageInoperantes * rowsPerPageInoperantes, sortedInoperantes.length)} /{' '}
                  {sortedInoperantes.length}
                </>
              ) : (
                '0 / 0'
              )}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPageInoperantes((p) => Math.max(1, p - 1))}
                disabled={pageInoperantes === 1}
                className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700">
                {pageInoperantes} / {totalPagesInoperantes}
              </span>
              <button
                onClick={() => setPageInoperantes((p) => Math.min(totalPagesInoperantes, p + 1))}
                disabled={pageInoperantes === totalPagesInoperantes}
                className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Acumulado de Interrupções por Contrato (Tabela + Pizza) (5 colunas lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card Tabela: Acumulado por Contrato */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 text-center">
                Acumulado de Interrupções por Contrato
              </h3>
            </div>
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 text-center">Contrato</th>
                  <th className="py-2.5 px-4 text-center">Quantidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {contratoSummary.items.map((item) => (
                  <tr key={item.contrato} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-4 font-semibold text-slate-900 text-center">
                      <div className="inline-flex items-center justify-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        ></span>
                        <span>{item.contrato}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-center font-mono font-bold text-slate-800">
                      {item.quantidade}
                    </td>
                  </tr>
                ))}
                {/* Linha Total Geral */}
                <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                  <td className="py-2.5 px-4 text-center">Total geral</td>
                  <td className="py-2.5 px-4 text-center font-mono text-sm">
                    {contratoSummary.totalGeral}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="p-2.5 border-t border-slate-100 text-center text-xs text-slate-500">
              1 - 3 / 3
            </div>
          </div>

          {/* Card Gráfico Pizza: % Acumulado por Contrato */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-3 text-center sm:text-left">
              % Acumulado de Interrupções de Equipamentos por Contrato
            </h3>
            <div className="w-full h-56 flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="w-48 h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={contratoSummary.items}
                      dataKey="quantidade"
                      nameKey="contrato"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      labelLine={false}
                      label={renderCustomPieLabel}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                    >
                      {contratoSummary.items.map((entry) => (
                        <Cell key={`cell-${entry.contrato}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val} interrupções (${item.payload.percentualFormatted})`,
                        `Contrato ${name}`,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda do Gráfico de Pizza */}
              <div className="flex flex-col gap-2.5 text-xs text-slate-700 font-medium">
                {contratoSummary.items.map((item) => (
                  <div key={item.contrato} className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span>{item.contrato}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 02: Acumulado de Interrupções por Mês (Pivot Matrix)                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        {/* Header com Título e Busca */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Acumulado de Interrupções de Equipamentos por Mês
            </h3>
            <p className="text-xs text-slate-500">
              Matriz mensal consolidada por equipamento e tipologia ({sortedMensalRows.length} equipamentos)
            </p>
          </div>
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por código ou tipo..."
              value={searchMensal}
              onChange={(e) => {
                setSearchMensal(e.target.value);
                setPageMensal(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
            />
          </div>
        </div>

        {/* Tabela Matriz Mensal */}
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                {[
                  { key: 'contrato', label: 'CONTRATO' },
                  { key: 'codigo', label: 'CÓDIGO' },
                  { key: 'tipo', label: 'TIPO' },
                  { key: 'ano2025', label: '2025' },
                  { key: 'jan2026', label: 'jan. de 2026' },
                  { key: 'fev2026', label: 'fev. de 2026' },
                  { key: 'mar2026', label: 'mar. de 2026' },
                  { key: 'abr2026', label: 'abr. de 2026' },
                  { key: 'mai2026', label: 'mai. de 2026' },
                  { key: 'jun2026', label: 'jun. de 2026' },
                  { key: 'jul2026', label: 'jul. de 2026' },
                  { key: 'ago2026', label: 'ago. de 2026' },
                  { key: 'totalGeral', label: 'Total geral', isTotal: true },
                ].map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSortMensal(col.key)}
                    className={`py-2.5 px-2 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group ${
                      col.isTotal ? 'bg-slate-200/70 font-bold' : ''
                    }`}
                    title={`Clique para ordenar por ${col.label}`}
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>{col.label}</span>
                      {sortMensal.key === col.key ? (
                        sortMensal.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              {paginatedMensalRows.length === 0 ? (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400">
                    Nenhum registro encontrado para os critérios de busca.
                  </td>
                </tr>
              ) : (
                paginatedMensalRows.map((row) => (
                  <tr key={row.codigo} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center font-mono text-slate-600 whitespace-nowrap">
                      {row.contrato}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900 whitespace-nowrap">
                      {row.codigo}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      <span className="text-slate-600">{row.tipo}</span>
                    </td>
                    
                    {/* Colunas Mensais com destaque quando >= 3 */}
                    <td className={`py-2.5 px-2 text-center ${row.ano2025 >= 3 ? 'bg-red-400 text-white font-bold' : ''}`}>
                      {row.ano2025 > 0 ? row.ano2025 : ''}
                    </td>
                    <td className={`py-2.5 px-2 text-center ${row.jan2026 >= 3 ? 'bg-red-400 text-white font-bold' : ''}`}>
                      {row.jan2026 > 0 ? row.jan2026 : ''}
                    </td>
                    <td className={`py-2.5 px-2 text-center ${row.fev2026 >= 3 ? 'bg-red-400 text-white font-bold' : ''}`}>
                      {row.fev2026 > 0 ? row.fev2026 : ''}
                    </td>
                    <td className={`py-2.5 px-2 text-center ${row.mar2026 >= 3 ? 'bg-red-400 text-white font-bold' : ''}`}>
                      {row.mar2026 > 0 ? row.mar2026 : ''}
                    </td>
                    <td className={`py-2.5 px-2 text-center ${row.abr2026 >= 3 ? 'bg-red-400 text-white font-bold' : ''}`}>
                      {row.abr2026 > 0 ? row.abr2026 : ''}
                    </td>
                    <td className={`py-2.5 px-2 text-center ${row.mai2026 >= 3 ? 'bg-red-400 text-white font-bold' : ''}`}>
                      {row.mai2026 > 0 ? row.mai2026 : ''}
                    </td>
                    <td className={`py-2.5 px-2 text-center ${row.jun2026 >= 3 ? 'bg-red-400 text-white font-bold' : ''}`}>
                      {row.jun2026 > 0 ? row.jun2026 : ''}
                    </td>
                    <td className={`py-2.5 px-2 text-center ${row.jul2026 >= 3 ? 'bg-red-400 text-white font-bold' : ''}`}>
                      {row.jul2026 > 0 ? row.jul2026 : ''}
                    </td>
                    <td className={`py-2.5 px-2 text-center ${row.ago2026 >= 3 ? 'bg-red-400 text-white font-bold' : ''}`}>
                      {row.ago2026 > 0 ? row.ago2026 : ''}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900 bg-slate-50">
                      {row.totalGeral}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Totais Gerais do Rodapé da Tabela */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td colSpan={3} className="py-3 px-3 text-center">
                  Total geral
                </td>
                <td className="py-3 px-2 text-center">{mensalData.colTotals.ano2025}</td>
                <td className="py-3 px-2 text-center">{mensalData.colTotals.jan2026}</td>
                <td className="py-3 px-2 text-center">{mensalData.colTotals.fev2026}</td>
                <td className="py-3 px-2 text-center">{mensalData.colTotals.mar2026}</td>
                <td className="py-3 px-2 text-center">{mensalData.colTotals.abr2026}</td>
                <td className="py-3 px-2 text-center">{mensalData.colTotals.mai2026}</td>
                <td className="py-3 px-2 text-center">{mensalData.colTotals.jun2026}</td>
                <td className="py-3 px-2 text-center">{mensalData.colTotals.jul2026}</td>
                <td className="py-3 px-2 text-center">{mensalData.colTotals.ago2026}</td>
                <td className="py-3 px-3 text-center bg-slate-200/80 text-sm">
                  {mensalData.colTotals.totalGeral}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Paginação da Tabela Mensal */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            {sortedMensalRows.length > 0 ? (
              <>
                {(pageMensal - 1) * rowsPerPageMensal + 1} -{' '}
                {Math.min(pageMensal * rowsPerPageMensal, sortedMensalRows.length)} /{' '}
                {sortedMensalRows.length}
              </>
            ) : (
              '0 / 0'
            )}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPageMensal((p) => Math.max(1, p - 1))}
              disabled={pageMensal === 1}
              className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              {pageMensal} / {totalPagesMensal}
            </span>
            <button
              onClick={() => setPageMensal((p) => Math.min(totalPagesMensal, p + 1))}
              disabled={pageMensal === totalPagesMensal}
              className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 03: Quantidade por Tipo + Relatório Histórico Geral                 */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        {/* Gráfico de Barras: Quantidade por Tipo de Equipamentos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6">
          <h3 className="font-bold text-base sm:text-lg text-slate-900 text-center mb-6">
            Quantidade de Interrupções por Tipo de Equipamentos
          </h3>
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={tipoSummary}
                margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="tipo"
                  tick={{ fontSize: 12, fill: '#334155', fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 200]}
                  ticks={[0, 50, 100, 150, 200]}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} interrupções`, 'Quantidade']}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar
                  dataKey="quantidade"
                  fill="#059669"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={90}
                >
                  <LabelList dataKey="quantidade" content={renderBarCustomLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tabela: Relatório Histórico de Parada e Retorno de Equipamentos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h3 className="font-bold text-base text-slate-900">
                Relatório Histórico de Parada e Retorno de Equipamentos
              </h3>
              <p className="text-xs text-slate-500">
                Histórico cronológico de paradas e retornos registrados ({sortedHistorico.length} eventos)
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filtro de Motivo */}
              <div className="relative">
                <select
                  value={filterMotivoHistorico}
                  onChange={(e) => {
                    setFilterMotivoHistorico(e.target.value);
                    setPageHistorico(1);
                  }}
                  className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="TODOS">Todos os motivos</option>
                  {motivosDisponiveis.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Busca Geral */}
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Buscar código ou logradouro..."
                  value={searchHistorico}
                  onChange={(e) => {
                    setSearchHistorico(e.target.value);
                    setPageHistorico(1);
                  }}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Tabela do Histórico */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th
                    onClick={() => handleSortHistorico('ct')}
                    className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                    title="Clique para ordenar por Contrato"
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>CT</span>
                      {sortHistorico.key === 'ct' ? (
                        sortHistorico.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortHistorico('codigo')}
                    className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                    title="Clique para ordenar por Código"
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>CÓDIGO</span>
                      {sortHistorico.key === 'codigo' ? (
                        sortHistorico.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortHistorico('tipo')}
                    className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                    title="Clique para ordenar por Tipo"
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>TIPO</span>
                      {sortHistorico.key === 'tipo' ? (
                        sortHistorico.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortHistorico('motivo')}
                    className="py-2.5 px-4 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                    title="Clique para ordenar por Motivo da parada"
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>Motivo da parada</span>
                      {sortHistorico.key === 'motivo' ? (
                        sortHistorico.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortHistorico('dataParada')}
                    className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                    title="Clique para ordenar por Data de Parada"
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>Data de Parada</span>
                      {sortHistorico.key === 'dataParada' ? (
                        sortHistorico.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                  <th
                    onClick={() => handleSortHistorico('dataRetorno')}
                    className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                    title="Clique para ordenar por Data de Retorno"
                  >
                    <div className="inline-flex items-center justify-center gap-1">
                      <span>Data de Retorno</span>
                      {sortHistorico.key === 'dataRetorno' ? (
                        sortHistorico.direction === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600 font-bold" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {paginatedHistorico.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      Nenhum registro de histórico encontrado para os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  paginatedHistorico.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center whitespace-nowrap text-slate-600 font-mono">
                        {row.ct}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap font-bold text-slate-900">
                        {row.codigo}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-sm text-[11px] bg-slate-100 text-slate-700 font-semibold">
                          {row.tipo}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-center text-slate-700">
                        {row.motivo}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-slate-600">
                        {row.dataParada}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono font-semibold">
                        {row.dataRetorno ? (
                          <span className="text-emerald-700">{row.dataRetorno}</span>
                        ) : (
                          <span className="text-amber-600 italic">Em aberto</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação do Histórico */}
          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>
              {sortedHistorico.length > 0 ? (
                <>
                  {(pageHistorico - 1) * rowsPerPageHistorico + 1} -{' '}
                  {Math.min(pageHistorico * rowsPerPageHistorico, sortedHistorico.length)} /{' '}
                  {sortedHistorico.length}
                </>
              ) : (
                '0 / 0'
              )}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPageHistorico((p) => Math.max(1, p - 1))}
                disabled={pageHistorico === 1}
                className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-700">
                {pageHistorico} / {totalPagesHistorico}
              </span>
              <button
                onClick={() => setPageHistorico((p) => Math.min(totalPagesHistorico, p + 1))}
                disabled={pageHistorico === totalPagesHistorico}
                className="p-1 rounded-md hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

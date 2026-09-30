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
  FileDown,
  X,
} from 'lucide-react';
import {
  InterrupcaoRecord,
  fetchInterrupcoesData,
  calculateContratoSummary,
  calculateMensalMatrix,
  calculateTipoSummary,
  CONTRATOS_ATIVOS,
} from '../services/interrupcoesService';
import { exportHistoricoParadasPDF } from '../utils/pdfExport';

type SortHistoricoKey = 'ct' | 'codigo' | 'tipo' | 'motivo' | 'oficioInicial' | 'dataParada' | 'oficioRetorno' | 'dataRetorno';

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
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
      style={{
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.35))',
        textShadow: '0 1px 2px rgba(0,0,0,0.35)',
      }}
      className="pointer-events-none select-none"
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
  const [selectedCt, setSelectedCt] = useState<string>('TODOS');

  const [searchMensal, setSearchMensal] = useState('');
  const [pageMensal, setPageMensal] = useState(1);
  const [sortMensal, setSortMensal] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  }>({ key: 'totalGeral', direction: 'desc' });
  const rowsPerPageMensal = 10;

  const [searchHistorico, setSearchHistorico] = useState('');
  const [filterMotivoHistorico, setFilterMotivoHistorico] = useState('TODOS');
  const [filterMesAno, setFilterMesAno] = useState('TODOS');
  const [filterEmAberto, setFilterEmAberto] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [pageHistorico, setPageHistorico] = useState(1);
  const [sortHistorico, setSortHistorico] = useState<{
    key: SortHistoricoKey;
    direction: 'asc' | 'desc';
  }>({ key: 'dataParada', direction: 'desc' });
  const rowsPerPageHistorico = 10;

  // Lista dinâmica de CTs gerada a partir dos registros existentes
  const ctsDisponiveis = useMemo(() => {
    const set = new Set<string>();
    records.forEach((r) => {
      if (r.ct && r.ct.trim()) set.add(r.ct.trim());
    });
    return Array.from(set).sort((a, b) =>
      a.localeCompare(b, 'pt-BR', { numeric: true, sensitivity: 'base' })
    );
  }, [records]);

  // Lista dinâmica de Mês/Ano gerada exclusivamente a partir da Data de Parada, ordenada do mais recente ao mais antigo
  const mesesDisponiveis = useMemo(() => {
    const MESES_NOMES: Record<string, string> = {
      '01': 'Janeiro',
      '02': 'Fevereiro',
      '03': 'Março',
      '04': 'Abril',
      '05': 'Maio',
      '06': 'Junho',
      '07': 'Julho',
      '08': 'Agosto',
      '09': 'Setembro',
      '10': 'Outubro',
      '11': 'Novembro',
      '12': 'Dezembro',
    };

    const map = new Map<string, { value: string; label: string; year: number; month: number }>();
    records.forEach((r) => {
      if (!r.dataParada) return;
      const parts = r.dataParada.split('/');
      if (parts.length === 3) {
        const monthStr = parts[1].padStart(2, '0');
        const yearStr = parts[2].trim();
        const monthNum = parseInt(monthStr, 10);
        const yearNum = parseInt(yearStr, 10);
        if (monthNum >= 1 && monthNum <= 12 && yearNum > 2000) {
          const key = `${monthStr}/${yearStr}`;
          if (!map.has(key)) {
            const monthName = MESES_NOMES[monthStr] || monthStr;
            map.set(key, {
              value: key,
              label: `${monthName}/${yearStr}`,
              year: yearNum,
              month: monthNum,
            });
          }
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [records]);

  const handleSelectCt = (ct: string) => {
    setSelectedCt(ct);
    setPageMensal(1);
    setPageHistorico(1);
  };

  useEffect(() => {
    fetchInterrupcoesData().then((data) => {
      setRecords(data);
      setLoading(false);
    });
  }, []);

  // Handlers for sorting
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
    return records.filter((r) => {
      const matchActive = CONTRATOS_ATIVOS.includes(r.ct);
      const matchCt = selectedCt === 'TODOS' || r.ct === selectedCt;
      return matchActive && matchCt && r.isInoperante;
    });
  }, [records, selectedCt]);

  const contratoSummary = useMemo(() => {
    return calculateContratoSummary(records);
  }, [records]);

  // 2. Calculations for Section 02 (Monthly Matrix)
  const mensalData = useMemo(() => {
    const targetRecords =
      selectedCt === 'TODOS'
        ? records
        : records.filter((r) => r.ct === selectedCt);
    return calculateMensalMatrix(targetRecords);
  }, [records, selectedCt]);

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
    const base =
      selectedCt === 'TODOS'
        ? historicoGeral
        : historicoGeral.filter((r) => r.ct === selectedCt);
    base.forEach((r) => {
      if (r.motivo) set.add(r.motivo);
    });
    return Array.from(set).sort();
  }, [historicoGeral, selectedCt]);

  useEffect(() => {
    if (filterMotivoHistorico !== 'TODOS' && !motivosDisponiveis.includes(filterMotivoHistorico)) {
      setFilterMotivoHistorico('TODOS');
    }
  }, [motivosDisponiveis, filterMotivoHistorico]);

  const filteredHistorico = useMemo(() => {
    return historicoGeral.filter((r) => {
      // 1. Filtro CT (Compartilhado)
      if (selectedCt !== 'TODOS' && r.ct !== selectedCt) {
        return false;
      }
      // 2. Filtro Motivo
      if (filterMotivoHistorico !== 'TODOS' && r.motivo !== filterMotivoHistorico) {
        return false;
      }
      // 3. Filtro Mês/Ano (baseado exclusivamente na Data de Parada)
      if (filterMesAno !== 'TODOS') {
        if (!r.dataParada) return false;
        const parts = r.dataParada.split('/');
        if (parts.length !== 3) return false;
        const recordMesAno = `${parts[1].padStart(2, '0')}/${parts[2].trim()}`;
        if (recordMesAno !== filterMesAno) return false;
      }
      // 4. Filtro Em Aberto (reutiliza a regra real do módulo: isInoperante / sem data de retorno)
      if (filterEmAberto && !r.isInoperante) {
        return false;
      }
      // 5. Busca Geral em todas as 9 colunas (incluindo Data de Parada e Data de Retorno)
      if (!searchHistorico) return true;
      const q = searchHistorico.toLowerCase().trim();
      return (
        (r.ct && r.ct.toLowerCase().includes(q)) ||
        (r.codigo && r.codigo.toLowerCase().includes(q)) ||
        (r.tipo && r.tipo.toLowerCase().includes(q)) ||
        (r.motivo && r.motivo.toLowerCase().includes(q)) ||
        (r.oficioInicial && r.oficioInicial.toLowerCase().includes(q)) ||
        (r.dataParada && r.dataParada.toLowerCase().includes(q)) ||
        (r.oficioRetorno && r.oficioRetorno.toLowerCase().includes(q)) ||
        (r.dataRetorno && r.dataRetorno.toLowerCase().includes(q)) ||
        (r.enderecoCompleto && r.enderecoCompleto.toLowerCase().includes(q))
      );
    });
  }, [historicoGeral, selectedCt, filterMotivoHistorico, filterMesAno, filterEmAberto, searchHistorico]);

  const hasActiveHistoricoFilters =
    selectedCt !== 'TODOS' ||
    filterMotivoHistorico !== 'TODOS' ||
    filterMesAno !== 'TODOS' ||
    filterEmAberto ||
    !!searchHistorico;

  const handleClearHistoricoFilters = () => {
    setSelectedCt('TODOS');
    setFilterMotivoHistorico('TODOS');
    setFilterMesAno('TODOS');
    setFilterEmAberto(false);
    setSearchHistorico('');
    setPageMensal(1);
    setPageHistorico(1);
  };

  const sortedHistorico = useMemo(() => {
    return [...filteredHistorico].sort((a, b) => {
      const valA = a[sortHistorico.key] || '';
      const valB = b[sortHistorico.key] || '';

      // Ordenação cronológica para datas de parada e retorno DD/MM/AAAA
      if (sortHistorico.key === 'dataParada' || sortHistorico.key === 'dataRetorno') {
        const parseBRDate = (d: string) => {
          if (!d) return 0;
          const parts = d.split('/');
          if (parts.length !== 3) return 0;
          return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10)).getTime();
        };
        const timeA = parseBRDate(valA);
        const timeB = parseBRDate(valB);
        if (timeA !== timeB) {
          return sortHistorico.direction === 'asc' ? timeA - timeB : timeB - timeA;
        }
      }

      const cmp = String(valA).localeCompare(String(valB), 'pt-BR', { numeric: true, sensitivity: 'base' });
      return sortHistorico.direction === 'asc' ? cmp : -cmp;
    });
  }, [filteredHistorico, sortHistorico]);

  const paginatedHistorico = useMemo(() => {
    const start = (pageHistorico - 1) * rowsPerPageHistorico;
    return sortedHistorico.slice(start, start + rowsPerPageHistorico);
  }, [sortedHistorico, pageHistorico]);

  const totalPagesHistorico = Math.ceil(sortedHistorico.length / rowsPerPageHistorico) || 1;

  // Export CSV for Historico
  const handleExportHistoricoCSV = () => {
    if (sortedHistorico.length === 0) return;
    const headers = [
      'CONTRATO',
      'CÓDIGO',
      'TIPO',
      'MOTIVO DA PARADA',
      'OFÍCIO DE PARADA',
      'DATA DA PARADA',
      'OFÍCIO DE RETORNO',
      'DATA DE RETORNO',
      'STATUS',
      'ENDEREÇO COMPLETO',
      'INFORMADO INICIAL',
      'INFORMADO FINAL',
      'HORÁRIO VANDALISMO',
    ];
    const rows = sortedHistorico.map((r) => [
      `"${r.ct}"`,
      `"${r.codigo}"`,
      `"${r.tipo}"`,
      `"${(r.motivo || '').replace(/"/g, '""')}"`,
      `"${(r.oficioInicial || '').replace(/"/g, '""')}"`,
      `"${r.dataParada}"`,
      `"${(r.oficioRetorno || '').replace(/"/g, '""')}"`,
      `"${r.dataRetorno || ''}"`,
      `"${r.dataRetorno ? 'RETORNADO' : 'INOPERANTE'}"`,
      `"${(r.enderecoCompleto || '').replace(/"/g, '""')}"`,
      `"${(r.informadoInicial || '').replace(/"/g, '""')}"`,
      `"${(r.informadoFinal || '').replace(/"/g, '""')}"`,
      `"${(r.horarioVandalismo || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `historico_paradas_retornos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Exportação em PDF do Relatório Histórico Completo no padrão institucional do Portal GEAPI
  const handleExportHistoricoPDF = async () => {
    if (sortedHistorico.length === 0 || isExportingPDF) return;

    setIsExportingPDF(true);
    try {
      const activeFiltersList: string[] = [];
      if (selectedCt !== 'TODOS') activeFiltersList.push(`CT: ${selectedCt}`);
      if (filterMesAno !== 'TODOS') {
        const mesObj = mesesDisponiveis.find((m) => m.value === filterMesAno);
        activeFiltersList.push(`Mês: ${mesObj ? mesObj.label : filterMesAno}`);
      }
      if (filterMotivoHistorico !== 'TODOS') activeFiltersList.push(`Motivo: ${filterMotivoHistorico}`);
      if (filterEmAberto) activeFiltersList.push('Em aberto: Sim');
      if (searchHistorico.trim()) activeFiltersList.push(`Busca: ${searchHistorico.trim()}`);

      await exportHistoricoParadasPDF(sortedHistorico, activeFiltersList);
    } catch (err) {
      console.error('Erro ao exportar relatório PDF:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (loading && records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 my-6 shadow-xs">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Carregando dados da aba Controle de Ofícios...
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
      {/* Header Banner - Versão Compacta */}
      <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
            <span>Painel de Controle de Ofícios</span>
          </h2>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 leading-normal">
            Monitoramento de inoperâncias temporárias, histórico mensal acumulado e motivos de parada dos contratos de fiscalização eletrônica.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-center min-w-[95px]">
            <span className="text-[10px] font-medium text-slate-500 block leading-tight">Total Interrupções</span>
            <span className="text-sm font-bold text-slate-900 leading-tight">
              {selectedCt === 'TODOS'
                ? contratoSummary.totalGeral
                : records.filter((r) => r.ct === selectedCt).length}
            </span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1 text-center min-w-[95px]">
            <span className="text-[10px] font-medium text-amber-700 block leading-tight">Inoperantes Hoje</span>
            <span className="text-sm font-bold text-amber-800 leading-tight">{inoperantesList.length}</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 01: Painel Analítico em Linha Única (3 Cards Lado a Lado no Desktop) */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Acumulado de Interrupções por Contrato */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 text-center">
              Acumulado de Interrupções por Contrato
            </h3>
          </div>
          <div className="flex-1 flex flex-col justify-between">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 text-center">Contrato</th>
                  <th className="py-2.5 px-3 text-center">Quantidade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                {contratoSummary.items.map((item) => {
                  const isSelected = selectedCt !== 'TODOS' && selectedCt === item.contrato;
                  return (
                    <tr
                      key={item.contrato}
                      className={`transition-colors ${
                        isSelected
                          ? 'bg-blue-50/80 font-bold'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <div className="inline-flex items-center justify-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <span className={isSelected ? 'text-blue-900 font-bold' : 'font-semibold text-slate-900'}>
                            {item.contrato}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-800">
                        {item.quantidade}
                      </td>
                    </tr>
                  );
                })}
                {/* Linha Total Geral */}
                <tr className="bg-slate-50/80 font-bold text-slate-900 border-t border-slate-200">
                  <td className="py-2.5 px-3 text-center">Total geral</td>
                  <td className="py-2.5 px-3 text-center font-mono text-xs sm:text-sm">
                    {contratoSummary.totalGeral}
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="p-2 border-t border-slate-100 text-center text-[11px] text-slate-500 bg-slate-50/30">
              1 - 3 / 3
            </div>
          </div>
        </div>

        {/* Card 2: % Acumulado por Contrato */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-4 flex flex-col h-full overflow-hidden">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 mb-2 text-center">
            % Acumulado de Interrupções de Equipamentos por Contrato
          </h3>
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-full h-44 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={contratoSummary.items}
                    dataKey="quantidade"
                    nameKey="contrato"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
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
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-700 font-medium pb-1">
              {contratoSummary.items.map((item) => (
                <div key={item.contrato} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span>{item.contrato}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Card 3: Quantidade de Interrupções por Tipo de Equipamentos */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3.5 sm:p-4 flex flex-col h-full overflow-hidden">
          <h3 className="font-bold text-xs sm:text-sm text-slate-900 text-center mb-2">
            Quantidade de Interrupções por Tipo de Equipamentos
          </h3>
          <div className="flex-1 w-full min-h-[190px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height={210}>
              <BarChart
                data={tipoSummary}
                margin={{ top: 15, right: 10, left: -15, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="tipo"
                  tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 200]}
                  ticks={[0, 50, 100, 150, 200]}
                  tick={{ fontSize: 9.5, fill: '#64748b' }}
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
                  maxBarSize={48}
                >
                  <LabelList dataKey="quantidade" content={renderBarCustomLabel} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 02: Relatório Histórico de Parada e Retorno de Equipamentos         */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        {/* Cabeçalho Reorganizado em 3 Regiões Estáveis */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col gap-3.5 bg-slate-50/50">
          {/* REGIÃO 1: Título e subtítulo */}
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Relatório Histórico de Parada e Retorno de Equipamentos
            </h3>
            <p className="text-xs text-slate-500">
              Histórico cronológico de paradas e retornos registrados ({sortedHistorico.length} eventos)
            </p>
          </div>

          {/* REGIÃO 2: 1ª Linha sequencial fixa de Ações e Filtros */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1. Botão Exportar CSV */}
            <button
              type="button"
              onClick={handleExportHistoricoCSV}
              disabled={sortedHistorico.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 text-emerald-800 border border-emerald-300/80 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Exportar histórico de paradas e retornos para CSV (compatível com Excel)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Exportar CSV</span>
            </button>

            {/* 2. Botão Exportar PDF */}
            <button
              type="button"
              onClick={handleExportHistoricoPDF}
              disabled={sortedHistorico.length === 0 || isExportingPDF}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              title="Exportar relatório histórico completo para PDF com os filtros ativos no padrão institucional"
              aria-label="Exportar PDF do relatório histórico com filtros ativos"
            >
              {isExportingPDF ? (
                <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
              ) : (
                <FileDown className="w-3.5 h-3.5 text-blue-600" />
              )}
              <span>{isExportingPDF ? 'Gerando...' : 'Exportar PDF'}</span>
            </button>

            {/* 3. Filtro CT */}
            <div className="relative shrink-0">
              <select
                value={selectedCt}
                onChange={(e) => handleSelectCt(e.target.value)}
                className={`text-xs border rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors ${
                  selectedCt !== 'TODOS'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
                title="Filtrar por Contrato (CT) em todas as tabelas da aba"
              >
                <option value="TODOS">Todos os CTs</option>
                {ctsDisponiveis.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Filtro Mês/Ano (baseado exclusivamente na Data de Parada) */}
            <div className="relative shrink-0">
              <select
                value={filterMesAno}
                onChange={(e) => {
                  setFilterMesAno(e.target.value);
                  setPageHistorico(1);
                }}
                className={`text-xs border rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors min-w-[150px] max-w-[180px] ${
                  filterMesAno !== 'TODOS'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
                title="Filtrar por Mês/Ano da Data de Parada"
              >
                <option value="TODOS">Todos os meses</option>
                {mesesDisponiveis.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Filtro Motivo */}
            <div className="relative shrink-0">
              <select
                value={filterMotivoHistorico}
                onChange={(e) => {
                  setFilterMotivoHistorico(e.target.value);
                  setPageHistorico(1);
                }}
                className={`text-xs border rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer transition-colors ${
                  filterMotivoHistorico !== 'TODOS'
                    ? 'bg-blue-50 border-blue-300 text-blue-900 font-semibold shadow-2xs'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                <option value="TODOS">Todos os motivos</option>
                {motivosDisponiveis.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Checkbox Discreto "Em aberto" */}
            <label
              className={`inline-flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium rounded-lg border cursor-pointer select-none transition-colors shrink-0 ${
                filterEmAberto
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold shadow-2xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Filtrar apenas registros de equipamentos ainda em aberto (sem data de retorno)"
            >
              <input
                type="checkbox"
                checked={filterEmAberto}
                onChange={(e) => {
                  setFilterEmAberto(e.target.checked);
                  setPageHistorico(1);
                }}
                className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer accent-blue-600"
              />
              <span>Em aberto</span>
            </label>

            {/* 7. Botão Limpar Filtros (ao final da primeira linha) */}
            {hasActiveHistoricoFilters && (
              <button
                type="button"
                onClick={handleClearHistoricoFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Limpar todos os filtros do Histórico"
              >
                <X className="w-3.5 h-3.5 text-slate-500 hover:text-red-600" />
                <span>Limpar filtros</span>
              </button>
            )}
          </div>

          {/* REGIÃO 3: Linha 2 — Busca Geral Estável */}
          <div className="flex items-center">
            <div className="relative w-full sm:w-80 lg:w-96 shrink-0">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Buscar em todas as colunas..."
                value={searchHistorico}
                onChange={(e) => {
                  setSearchHistorico(e.target.value);
                  setPageHistorico(1);
                }}
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
              {searchHistorico && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchHistorico('');
                    setPageHistorico(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
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
                  onClick={() => handleSortHistorico('oficioInicial')}
                  className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                  title="Clique para ordenar por Ofício de Parada"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Ofício de Parada</span>
                    {sortHistorico.key === 'oficioInicial' ? (
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
                  onClick={() => handleSortHistorico('oficioRetorno')}
                  className="py-2.5 px-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors select-none group"
                  title="Clique para ordenar por Ofício de Retorno"
                >
                  <div className="inline-flex items-center justify-center gap-1">
                    <span>Ofício de Retorno</span>
                    {sortHistorico.key === 'oficioRetorno' ? (
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
                  <td colSpan={8} className="py-8 text-center text-slate-400">
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
                    <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-slate-700">
                      {row.oficioInicial || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-slate-600">
                      {row.dataParada}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-slate-700">
                      {row.oficioRetorno || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono">
                      {row.dataRetorno ? (
                        <span className="text-slate-600">{row.dataRetorno}</span>
                      ) : (
                        <span className="text-amber-600 italic font-semibold">Em aberto</span>
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

      {/* ========================================================================= */}
      {/* SEÇÃO 03: Acumulado de Interrupções de Equipamentos por Mês (Pivot Matrix) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        {/* Header com Título e Busca */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Acumulado de Interrupções de Equipamentos por Mês</span>
              {selectedCt !== 'TODOS' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  CT {selectedCt}
                </span>
              )}
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
    </div>
  );
};

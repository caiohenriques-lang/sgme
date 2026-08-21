import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  LabelList,
} from 'recharts';
import {
  RefreshCw,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Filter,
  Layers,
  X,
} from 'lucide-react';
import {
  BHDigitalRecord,
  BHDigitalFilters,
  fetchBHDigitalData,
  calculateBHDigitalStats,
  LogradouroMatrixRow,
} from '../services/bhdigitalService';

// Custom Pie Label showing percentage directly on slice
const renderCustomPieLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) => {
  if (!percent || percent < 0.03) return null; // Avoid overlapping tiny slices
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  const formattedPercent = `${(percent * 100).toFixed(1).replace('.', ',')}%`;

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={700}
      className="drop-shadow-xs pointer-events-none select-none"
    >
      {formattedPercent}
    </text>
  );
};

// Custom Bar Label on top of bars
const renderBarCustomLabel = (props: any) => {
  const { x, y, width, height, value } = props;
  if (value === undefined || value === null || value === 0) return null;
  const isTall = height > 24;
  return (
    <text
      x={x + width / 2}
      y={isTall ? y + 16 : y - 6}
      fill={isTall ? '#ffffff' : '#334155'}
      textAnchor="middle"
      fontSize={11}
      fontWeight={700}
      className="select-none"
    >
      {value}
    </text>
  );
};

export const BHDigitalView: React.FC = () => {
  const [allRecords, setAllRecords] = useState<BHDigitalRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Click-based Interactive Filters
  const [filters, setFilters] = useState<BHDigitalFilters>({
    regional: null,
    fase: null,
    tipo: null,
    ano: null,
    atendido: null,
  });

  // Table pagination and search
  const [searchLogradouro, setSearchLogradouro] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 15;

  const loadData = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    } else {
      setIsRefreshing(true);
    }
    setError(null);
    try {
      const data = await fetchBHDigitalData();
      if (data && data.length > 0) {
        setAllRecords(data);
        setLastUpdated(new Date());
      } else if (!silent) {
        setError('Nenhum dado encontrado na planilha BHDIGITAL.');
      }
    } catch (err) {
      console.error('Erro ao carregar dados BHDIGITAL:', err);
      if (!silent) {
        setError('Não foi possível carregar os dados da aba BHDIGITAL.');
      }
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Carga inicial e configuração de sincronização automática
  useEffect(() => {
    loadData(false);

    // Auto-refresh periódico em segundo plano a cada 60 segundos
    const interval = setInterval(() => {
      loadData(true);
    }, 60000);

    // Auto-refresh ao focar novamente na aba do navegador
    const handleFocus = () => {
      loadData(true);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadData]);

  // Handle Clear Filters
  const handleClearFilters = () => {
    setFilters({
      regional: null,
      fase: null,
      tipo: null,
      ano: null,
      atendido: null,
    });
    setSearchLogradouro('');
    setCurrentPage(1);
  };

  // Toggle filter helper
  const toggleFilter = (key: keyof BHDigitalFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: prev[key] === value ? null : value,
    }));
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    filters.regional || filters.fase || filters.tipo || filters.ano || filters.atendido || searchLogradouro.trim()
  );

  // Filtered dataset (Synchronized with chart filters AND logradouro search)
  const filteredRecords = useMemo(() => {
    return allRecords.filter((r) => {
      if (filters.regional && r.regional !== filters.regional) return false;
      if (filters.fase) {
        const isAndamento = r.fase.toLowerCase().includes('andamento');
        if (filters.fase === 'Em andamento' && !isAndamento) return false;
        if (filters.fase === 'Encerrado' && isAndamento) return false;
      }
      if (filters.tipo && r.tipo !== filters.tipo) return false;
      if (filters.ano && r.ano !== filters.ano) return false;
      if (filters.atendido && r.atendido !== filters.atendido) return false;
      if (searchLogradouro.trim()) {
        const q = searchLogradouro.toLowerCase().trim();
        if (!r.logradouro.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [allRecords, filters, searchLogradouro]);

  // Aggregated Statistics (Recalculates all charts & metrics based on filters AND search)
  const stats = useMemo(() => {
    return calculateBHDigitalStats(filteredRecords);
  }, [filteredRecords]);

  // Filtered Logradouro Matrix Rows
  const filteredLogradouroRows = stats.logradouroRows;

  const totalPages = Math.ceil(filteredLogradouroRows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLogradouroRows.slice(start, start + rowsPerPage);
  }, [filteredLogradouroRows, currentPage, rowsPerPage]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogradouroRows.length === 0) return;
    const headers = ['LOGRADOURO', 'DAS', 'NÃO SE APLICA', 'CEV', 'DIF', 'DAS+DCP', 'DTLP', 'Total geral'];
    const rows = filteredLogradouroRows.map((r) => [
      `"${r.logradouro}"`,
      r.das,
      r.naoSeAplica,
      r.cev,
      r.dif,
      r.dasDcp,
      r.dtlp,
      r.totalGeral,
    ]);

    // Linha Total
    rows.push([
      '"Total geral"',
      stats.colTotals.das,
      stats.colTotals.naoSeAplica,
      stats.colTotals.cev,
      stats.colTotals.dif,
      stats.colTotals.dasDcp,
      stats.colTotals.dtlp,
      stats.colTotals.totalGeral,
    ]);

    const csvContent = [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bhdigital_logradouros_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && allRecords.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center space-y-4 my-6 shadow-xs">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Carregando dados da aba BHDIGITAL...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Buscando solicitações e cruzamento de logradouros no Google Sheets...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-8 text-center space-y-4 my-6 shadow-xs">
        <AlertTriangle className="w-10 h-10 text-rose-600 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-rose-900">Erro ao carregar BHDIGITAL</h3>
          <p className="text-xs text-rose-700 mt-1">{error}</p>
        </div>
        <button
          onClick={loadData}
          className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Tentar Novamente</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar: Title, Active Filter Badges, Limpar Filtros Button */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Painel Gerencial BHDIGITAL
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Análise e monitoramento das solicitações de fiscalização eletrônica via BH Digital
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Status de Sincronização / Última Atualização */}
          {lastUpdated && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                Atualizado às <strong>{lastUpdated.toLocaleTimeString('pt-BR')}</strong>
              </span>
            </div>
          )}

          {/* Botão Atualizar Manualmente */}
          <button
            onClick={() => loadData(false)}
            disabled={loading || isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-lg border border-slate-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
            title="Recarregar dados mais recentes da planilha Google Sheets em tempo real"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isRefreshing || loading ? 'animate-spin' : ''}`} />
            <span>{isRefreshing || loading ? 'Sincronizando...' : 'Atualizar'}</span>
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-lg border border-amber-500 shadow-xs transition-all cursor-pointer"
              title="Limpar todos os filtros ativos"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Filter Chips (if any selected) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap bg-blue-50/60 border border-blue-200/80 p-3 rounded-xl text-xs text-blue-900">
          <div className="flex items-center gap-1 font-semibold text-blue-800">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros aplicados (clique para remover):</span>
          </div>
          {filters.regional && (
            <button
              onClick={() => toggleFilter('regional', filters.regional!)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <span>Regional: {filters.regional}</span>
              <span className="font-bold text-blue-200">×</span>
            </button>
          )}
          {filters.fase && (
            <button
              onClick={() => toggleFilter('fase', filters.fase!)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <span>Situação: {filters.fase}</span>
              <span className="font-bold text-emerald-200">×</span>
            </button>
          )}
          {filters.tipo && (
            <button
              onClick={() => toggleFilter('tipo', filters.tipo!)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-600 text-white font-medium hover:bg-amber-700 transition-colors cursor-pointer"
            >
              <span>Tipo: {filters.tipo}</span>
              <span className="font-bold text-amber-200">×</span>
            </button>
          )}
          {filters.ano && (
            <button
              onClick={() => toggleFilter('ano', filters.ano!)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-700 text-white font-medium hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <span>Ano: {filters.ano}</span>
              <span className="font-bold text-slate-300">×</span>
            </button>
          )}
          {filters.atendido && (
            <button
              onClick={() => toggleFilter('atendido', filters.atendido!)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <span>Qualificado: {filters.atendido}</span>
              <span className="font-bold text-indigo-200">×</span>
            </button>
          )}
          {searchLogradouro.trim() && (
            <button
              onClick={() => {
                setSearchLogradouro('');
                setCurrentPage(1);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors cursor-pointer"
              title="Remover filtro de logradouro"
            >
              <span>Logradouro: "{searchLogradouro}"</span>
              <span className="font-bold text-purple-200">×</span>
            </button>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* SEÇÃO 01 (bhd 01.png): Gráficos Gerenciais com Filtros Interativos        */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        
        {/* Linha Superior: Regional (Esquerda) + Tempo Médio & Situação (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Gráfico de Barras: Número de pedidos por Regional (7 cols) */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 text-center w-full">
                  Nº de Pedidos por Regional
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 text-center mb-4">
                Clique em uma barra para filtrar por Regional
              </p>
            </div>

            {/* Main Chart Canvas with horizontal scrolling on mobile */}
            <div className="w-full overflow-x-auto pb-2">
              <div className="block sm:hidden text-[10.5px] text-slate-500 font-medium text-center mb-1 bg-slate-50 py-1 rounded-lg border border-slate-200">
                ↔ Deslize lateralmente para visualizar todas as regionais
              </div>
              <div className="w-full min-w-[640px] sm:min-w-0 h-72 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.regionalSummary}
                    margin={{ top: 25, right: 25, left: -5, bottom: 45 }}
                  >
                    <XAxis
                      dataKey="regional"
                      interval={0}
                      tick={(props: any) => {
                        const { x, y, payload } = props;
                        const isSelected = filters.regional === payload.value;
                        return (
                          <g transform={`translate(${x},${y})`}>
                            <text
                              x={0}
                              y={0}
                              dy={18}
                              textAnchor="middle"
                              fill={isSelected ? '#2563eb' : '#334155'}
                              fontSize={10.5}
                              fontWeight={isSelected ? 800 : 600}
                              className="cursor-pointer"
                            >
                              {payload.value}
                            </text>
                          </g>
                        );
                      }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, (dataMax: number) => Math.max(100, Math.ceil(dataMax * 1.15))]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val} pedidos`, 'Quantidade']}
                      cursor={{ fill: '#f8fafc' }}
                    />
                    <Bar
                      dataKey="quantidade"
                      fill="#64748b"
                      radius={[2, 2, 0, 0]}
                      maxBarSize={48}
                      onClick={(data: any) => {
                        if (data && data.regional) {
                          toggleFilter('regional', data.regional);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {stats.regionalSummary.map((entry) => (
                        <Cell
                          key={`reg-cell-${entry.regional}`}
                          fill={filters.regional === entry.regional ? '#2563eb' : '#64748b'}
                          className="hover:opacity-80 transition-opacity cursor-pointer"
                        />
                      ))}
                      <LabelList dataKey="quantidade" content={renderBarCustomLabel} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Coluna Direita: Banner Tempo Médio + Gráfico Situação (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Banner: Tempo Médio de Resposta */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-center shadow-xs">
              <span className="text-sm sm:text-base font-semibold text-slate-800">
                Tempo médio de resposta:{' '}
                <strong className="text-base sm:text-lg font-bold text-slate-900">
                  {stats.tempoMedio} dias
                </strong>
              </span>
            </div>

            {/* Gráfico de Pizza: Situação */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex-1 flex flex-col items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base text-slate-900 text-center mb-1">
                Situação
              </h3>
              <p className="text-[11px] text-slate-500 text-center mb-2">
                Clique na fatia para filtrar
              </p>

              <div className="w-44 h-44 sm:w-48 sm:h-48 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.situacaoSummary}
                      dataKey="quantidade"
                      nameKey="fase"
                      cx="50%"
                      cy="50%"
                      outerRadius={75}
                      labelLine={false}
                      label={renderCustomPieLabel}
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      onClick={(data: any) => {
                        if (data && data.fase) {
                          toggleFilter('fase', data.fase);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {stats.situacaoSummary.map((entry) => (
                        <Cell
                          key={`sit-cell-${entry.fase}`}
                          fill={entry.color}
                          stroke={filters.fase === entry.fase ? '#0f172a' : '#ffffff'}
                          strokeWidth={filters.fase === entry.fase ? 3 : 1.5}
                          className="hover:opacity-85 transition-opacity cursor-pointer"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any, item: any) => [
                        `${val} pedidos (${item.payload.percentualFormatted})`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda Situação */}
              <div className="flex items-center justify-center gap-4 text-xs text-slate-700 font-medium mt-2 flex-wrap">
                {stats.situacaoSummary.map((item) => (
                  <button
                    key={item.fase}
                    onClick={() => toggleFilter('fase', item.fase)}
                    className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                      filters.fase === item.fase ? 'bg-slate-100 font-bold ring-1 ring-slate-300' : 'hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span>{item.fase}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Linha Inferior: 3 Gráficos lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. % de Solicitações por Tipo de Equipamento */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 text-center mb-1">
              % de Solicitações por Tipo de Equipamento
            </h3>
            <p className="text-[10px] text-slate-500 text-center mb-2">
              Clique para filtrar por Tipo
            </p>

            <div className="w-full h-48 sm:h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.tipoSummary}
                    dataKey="quantidade"
                    nameKey="tipo"
                    cx="50%"
                    cy="50%"
                    outerRadius={78}
                    labelLine={false}
                    label={renderCustomPieLabel}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    onClick={(data: any) => {
                      if (data && data.tipo) {
                        toggleFilter('tipo', data.tipo);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {stats.tipoSummary.map((entry) => (
                      <Cell
                        key={`tipo-cell-${entry.tipo}`}
                        fill={entry.color}
                        stroke={filters.tipo === entry.tipo ? '#0f172a' : '#ffffff'}
                        strokeWidth={filters.tipo === entry.tipo ? 3 : 1.5}
                        className="hover:opacity-85 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} pedidos (${item.payload.percentualFormatted})`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda Tipo de Equipamento */}
            <div className="flex items-center justify-center gap-x-3 gap-y-1.5 text-[11px] text-slate-700 font-medium mt-3 flex-wrap">
              {stats.tipoSummary.map((item) => (
                <button
                  key={item.tipo}
                  onClick={() => toggleFilter('tipo', item.tipo)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    filters.tipo === item.tipo ? 'bg-slate-100 font-bold ring-1 ring-slate-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span>{item.tipo}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Nº de Solicitações por Ano */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 text-center mb-1">
              Nº de Solicitações por Ano
            </h3>
            <p className="text-[10px] text-slate-500 text-center mb-2">
              Clique para filtrar por Ano
            </p>

            <div className="w-full h-48 sm:h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats.anoSummary}
                  margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
                >
                  <XAxis
                    dataKey="ano"
                    tick={(props: any) => {
                      const { x, y, payload } = props;
                      const isSelected = filters.ano === payload.value;
                      return (
                        <g transform={`translate(${x},${y})`}>
                          <text
                            x={0}
                            y={0}
                            dy={12}
                            textAnchor="middle"
                            fill={isSelected ? '#2563eb' : '#475569'}
                            fontSize={11}
                            fontWeight={isSelected ? 800 : 600}
                            className="cursor-pointer"
                          >
                            {payload.value}
                          </text>
                        </g>
                      );
                    }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, (dataMax: number) => Math.max(150, Math.ceil(dataMax * 1.15))]}
                    ticks={[0, 50, 100, 150]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val} pedidos`, 'Ano']}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar
                    dataKey="quantidade"
                    fill="#64748b"
                    radius={[2, 2, 0, 0]}
                    maxBarSize={38}
                    onClick={(data: any) => {
                      if (data && data.ano) {
                        toggleFilter('ano', data.ano);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {stats.anoSummary.map((entry) => (
                      <Cell
                        key={`ano-cell-${entry.ano}`}
                        fill={filters.ano === entry.ano ? '#2563eb' : '#64748b'}
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                      />
                    ))}
                    <LabelList dataKey="quantidade" content={renderBarCustomLabel} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-4"></div>
          </div>

          {/* 3. % de Pedidos Qualificados para Implantação */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col justify-between">
            <h3 className="font-bold text-xs sm:text-sm text-slate-900 text-center mb-1">
              % de Pedidos Qualificados para Implantação
            </h3>
            <p className="text-[10px] text-slate-500 text-center mb-2">
              Clique para filtrar por Qualificação
            </p>

            <div className="w-full h-48 sm:h-52 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.qualificadoSummary}
                    dataKey="quantidade"
                    nameKey="qualificado"
                    cx="50%"
                    cy="50%"
                    outerRadius={78}
                    labelLine={false}
                    label={renderCustomPieLabel}
                    stroke="#ffffff"
                    strokeWidth={1.5}
                    onClick={(data: any) => {
                      if (data && data.qualificado) {
                        toggleFilter('atendido', data.qualificado);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {stats.qualificadoSummary.map((entry) => (
                      <Cell
                        key={`qual-cell-${entry.qualificado}`}
                        fill={entry.color}
                        stroke={filters.atendido === entry.qualificado ? '#0f172a' : '#ffffff'}
                        strokeWidth={filters.atendido === entry.qualificado ? 3 : 1.5}
                        className="hover:opacity-85 transition-opacity cursor-pointer"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val} pedidos (${item.payload.percentualFormatted})`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legenda Qualificados */}
            <div className="flex items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-700 font-medium mt-3 flex-wrap">
              {stats.qualificadoSummary.map((item) => (
                <button
                  key={item.qualificado}
                  onClick={() => toggleFilter('atendido', item.qualificado)}
                  className={`flex items-center gap-1 px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                    filters.atendido === item.qualificado ? 'bg-slate-100 font-bold ring-1 ring-slate-300' : 'hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span>{item.qualificado}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* SEÇÃO 02 (bhd 02.png): Tabela Nº de Logradouros com mais Solicitações      */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Header da Tabela */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">
              Nº de Logradouros com mais Solicitações
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cruzamento matricial por tipo de equipamento solicitado no BH Digital ({filteredLogradouroRows.length} logradouros)
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar logradouro..."
                value={searchLogradouro}
                onChange={(e) => {
                  setSearchLogradouro(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-800"
              />
              {searchLogradouro && (
                <button
                  onClick={() => {
                    setSearchLogradouro('');
                    setCurrentPage(1);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                  title="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Export CSV */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer shadow-2xs"
              title="Exportar dados para CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Exportar</span>
            </button>
          </div>
        </div>

        {/* Tabela Matricial */}
        <div className="block sm:hidden text-[10.5px] text-slate-500 font-medium px-4 py-1.5 bg-slate-100/90 border-b border-slate-200">
          ↔ Deslize para os lados para visualizar todos os tipos de equipamentos
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] sm:min-w-0 text-xs border-collapse">
            <thead>
              {/* Linha Superior do Cabeçalho com banner span */}
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th
                  rowSpan={2}
                  className="py-3 px-4 text-left font-bold text-slate-900 border-r border-slate-200 min-w-[260px]"
                >
                  LOGRADOURO
                </th>
                <th
                  colSpan={7}
                  className="py-2 px-3 text-right font-bold text-slate-800 tracking-wide uppercase text-[11px]"
                >
                  TIPO DE EQUIPAMENTO / BHDIGITAL
                </th>
              </tr>
              {/* Linha Inferior dos Tipos de Equipamentos */}
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                {[
                  { key: 'DAS', label: 'DAS', width: 'min-w-[70px]' },
                  { key: 'NÃO SE APLICA', label: 'NÃO SE APLICA', width: 'min-w-[100px]' },
                  { key: 'CEV', label: 'CEV', width: 'min-w-[70px]' },
                  { key: 'DIF', label: 'DIF', width: 'min-w-[70px]' },
                  { key: 'DAS+DCP', label: 'DAS+DCP', width: 'min-w-[80px]' },
                  { key: 'DTLP', label: 'DTLP', width: 'min-w-[70px]' },
                ].map((col) => {
                  const isColActive = filters.tipo === col.key;
                  return (
                    <th
                      key={col.key}
                      onClick={() => toggleFilter('tipo', col.key)}
                      className={`py-2 px-3 text-center ${col.width} cursor-pointer transition-colors select-none ${
                        isColActive
                          ? 'bg-amber-100 text-amber-950 font-bold ring-2 ring-amber-500'
                          : 'hover:bg-slate-200/80 hover:text-slate-900'
                      }`}
                      title={isColActive ? `Filtro ativo: ${col.label} (clique para remover)` : `Clique para filtrar por ${col.label}`}
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span>{col.label}</span>
                        {isColActive && <span className="text-[10px] text-amber-700 font-bold">✓</span>}
                      </div>
                    </th>
                  );
                })}
                <th className="py-2 px-3 text-center min-w-[90px] font-bold text-slate-900 bg-slate-200/70">
                  Total geral
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Nenhum logradouro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row) => {
                  const isSelected = searchLogradouro.trim().toUpperCase() === row.logradouro.toUpperCase();
                  return (
                    <tr
                      key={row.logradouro}
                      className={`transition-colors ${
                        isSelected ? 'bg-purple-50/70 font-semibold' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      {/* Logradouro */}
                      <td
                        onClick={() => {
                          if (isSelected) {
                            setSearchLogradouro('');
                          } else {
                            setSearchLogradouro(row.logradouro);
                          }
                          setCurrentPage(1);
                        }}
                        className={`py-2.5 px-4 font-semibold text-left border-r border-slate-100 whitespace-nowrap cursor-pointer group ${
                          isSelected ? 'text-purple-900 font-bold' : 'text-slate-900 hover:text-blue-600'
                        }`}
                        title={isSelected ? 'Clique para desmarcar' : 'Clique para filtrar este logradouro em todo o painel'}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span>{row.logradouro}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded transition-all ${
                              isSelected
                                ? 'bg-purple-600 text-white font-bold'
                                : 'text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {isSelected ? 'Filtrado' : 'Filtrar'}
                          </span>
                        </div>
                      </td>

                    {/* DAS */}
                    <td
                      onClick={() => {
                        if (row.das > 0) {
                          toggleFilter('tipo', 'DAS');
                        }
                      }}
                      className={`py-2.5 px-3 text-center ${
                        row.das > 0
                          ? `cursor-pointer transition-all ${
                              filters.tipo === 'DAS'
                                ? 'bg-amber-100 text-amber-950 font-bold ring-1 ring-amber-400'
                                : row.das >= 4
                                ? 'bg-emerald-100/90 text-emerald-950 font-bold hover:bg-emerald-200'
                                : 'bg-emerald-50 text-emerald-900 font-medium hover:bg-emerald-100'
                            }`
                          : 'text-slate-400'
                      }`}
                      title={row.das > 0 ? 'Clique para filtrar por DAS' : undefined}
                    >
                      {row.das > 0 ? row.das : '-'}
                    </td>

                    {/* NÃO SE APLICA */}
                    <td
                      onClick={() => {
                        if (row.naoSeAplica > 0) {
                          toggleFilter('tipo', 'NÃO SE APLICA');
                        }
                      }}
                      className={`py-2.5 px-3 text-center ${
                        row.naoSeAplica > 0
                          ? `cursor-pointer transition-all ${
                              filters.tipo === 'NÃO SE APLICA'
                                ? 'bg-amber-100 text-amber-950 font-bold ring-1 ring-amber-400'
                                : 'bg-emerald-50/60 text-emerald-900 font-medium hover:bg-emerald-100'
                            }`
                          : 'text-slate-400'
                      }`}
                      title={row.naoSeAplica > 0 ? 'Clique para filtrar por NÃO SE APLICA' : undefined}
                    >
                      {row.naoSeAplica > 0 ? row.naoSeAplica : '-'}
                    </td>

                    {/* CEV */}
                    <td
                      onClick={() => {
                        if (row.cev > 0) {
                          toggleFilter('tipo', 'CEV');
                        }
                      }}
                      className={`py-2.5 px-3 text-center ${
                        row.cev > 0
                          ? `cursor-pointer transition-all ${
                              filters.tipo === 'CEV'
                                ? 'bg-amber-100 text-amber-950 font-bold ring-1 ring-amber-400'
                                : 'bg-emerald-50 text-emerald-900 font-medium hover:bg-emerald-100'
                            }`
                          : 'text-slate-400'
                      }`}
                      title={row.cev > 0 ? 'Clique para filtrar por CEV' : undefined}
                    >
                      {row.cev > 0 ? row.cev : '-'}
                    </td>

                    {/* DIF */}
                    <td
                      onClick={() => {
                        if (row.dif > 0) {
                          toggleFilter('tipo', 'DIF');
                        }
                      }}
                      className={`py-2.5 px-3 text-center ${
                        row.dif > 0
                          ? `cursor-pointer transition-all ${
                              filters.tipo === 'DIF'
                                ? 'bg-amber-100 text-amber-950 font-bold ring-1 ring-amber-400'
                                : 'bg-emerald-50 text-emerald-900 font-medium hover:bg-emerald-100'
                            }`
                          : 'text-slate-400'
                      }`}
                      title={row.dif > 0 ? 'Clique para filtrar por DIF' : undefined}
                    >
                      {row.dif > 0 ? row.dif : '-'}
                    </td>

                    {/* DAS+DCP */}
                    <td
                      onClick={() => {
                        if (row.dasDcp > 0) {
                          toggleFilter('tipo', 'DAS+DCP');
                        }
                      }}
                      className={`py-2.5 px-3 text-center ${
                        row.dasDcp > 0
                          ? `cursor-pointer transition-all ${
                              filters.tipo === 'DAS+DCP'
                                ? 'bg-amber-100 text-amber-950 font-bold ring-1 ring-amber-400'
                                : 'bg-emerald-50 text-emerald-900 font-medium hover:bg-emerald-100'
                            }`
                          : 'text-slate-400'
                      }`}
                      title={row.dasDcp > 0 ? 'Clique para filtrar por DAS+DCP' : undefined}
                    >
                      {row.dasDcp > 0 ? row.dasDcp : '-'}
                    </td>

                    {/* DTLP */}
                    <td
                      onClick={() => {
                        if (row.dtlp > 0) {
                          toggleFilter('tipo', 'DTLP');
                        }
                      }}
                      className={`py-2.5 px-3 text-center ${
                        row.dtlp > 0
                          ? `cursor-pointer transition-all ${
                              filters.tipo === 'DTLP'
                                ? 'bg-amber-100 text-amber-950 font-bold ring-1 ring-amber-400'
                                : 'bg-emerald-50 text-emerald-900 font-medium hover:bg-emerald-100'
                            }`
                          : 'text-slate-400'
                      }`}
                      title={row.dtlp > 0 ? 'Clique para filtrar por DTLP' : undefined}
                    >
                      {row.dtlp > 0 ? row.dtlp : '-'}
                    </td>

                    {/* Total Geral da Linha */}
                    <td className="py-2.5 px-3 text-center font-bold text-slate-900 bg-slate-50/70">
                      {row.totalGeral}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

            {/* Rodapé: Total Geral Consolidado */}
            <tfoot>
              <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
                <td className="py-3 px-4 text-left border-r border-slate-200">
                  Total geral
                </td>
                <td className="py-3 px-3 text-center">{stats.colTotals.das}</td>
                <td className="py-3 px-3 text-center">{stats.colTotals.naoSeAplica}</td>
                <td className="py-3 px-3 text-center">{stats.colTotals.cev}</td>
                <td className="py-3 px-3 text-center">{stats.colTotals.dif}</td>
                <td className="py-3 px-3 text-center">{stats.colTotals.dasDcp}</td>
                <td className="py-3 px-3 text-center">{stats.colTotals.dtlp}</td>
                <td className="py-3 px-3 text-center bg-slate-200/80 text-sm">
                  {stats.colTotals.totalGeral}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Paginação da Tabela */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            {filteredLogradouroRows.length > 0 ? (
              <>
                {(currentPage - 1) * rowsPerPage + 1} -{' '}
                {Math.min(currentPage * rowsPerPage, filteredLogradouroRows.length)} /{' '}
                {filteredLogradouroRows.length} logradouros
              </>
            ) : (
              '0 logradouros'
            )}
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Página Anterior"
            >
              <ChevronLeft className="w-4 h-4 text-slate-600" />
            </button>
            <span className="px-2 font-medium text-slate-700">
              {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              title="Próxima Página"
            >
              <ChevronRight className="w-4 h-4 text-slate-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

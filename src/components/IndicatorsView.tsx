import React, { useMemo, useState, useEffect } from 'react';
import { EquipmentRecord } from '../types';
import { exportFilteredRecordsPDF, exportSingleRecordPDF } from '../utils/pdfExport';
import { SpeedLimit50Icon } from './SpeedLimit50Icon';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  LabelList,
} from 'recharts';
import {
  Layers,
  MapPin,
  PieChart as PieIcon,
  BarChart2,
  Filter,
  FilterX,
  RotateCcw,
  Table as TableIcon,
  Eye,
  FileDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  Award,
  Route,
  X,
} from 'lucide-react';

interface IndicatorsViewProps {
  records: EquipmentRecord[];
  onSelectRecord?: (record: EquipmentRecord) => void;
  resetSignal?: number;
  onClearAllFilters?: () => void;
}

const COLORS = [
  '#2563eb', // blue-600
  '#059669', // emerald-600
  '#d97706', // amber-600
  '#dc2626', // red-600
  '#7c3aed', // violet-600
  '#0891b2', // cyan-600
  '#e11d48', // rose-600
  '#4f46e5', // indigo-600
  '#65a30d', // lime-600
  '#64748b', // slate-500
];

export const IndicatorsView: React.FC<IndicatorsViewProps> = ({
  records,
  onSelectRecord,
  resetSignal,
  onClearAllFilters,
}) => {
  // Interactive Chart Filter States
  const [selectedChartContrato, setSelectedChartContrato] = useState<string | null>(null);
  const [selectedChartTipo, setSelectedChartTipo] = useState<string | null>(null);
  const [selectedChartCorredor, setSelectedChartCorredor] = useState<string | null>(null);

  // Mirror Table States
  const [mirrorSearch, setMirrorSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<keyof EquipmentRecord>('CÓDIGO');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Reset chart filters when global reset signal changes
  useEffect(() => {
    if (resetSignal !== undefined && resetSignal > 0) {
      setSelectedChartContrato(null);
      setSelectedChartTipo(null);
      setSelectedChartCorredor(null);
      setMirrorSearch('');
      setCurrentPage(1);
    }
  }, [resetSignal]);

  // Filter records based on interactive chart selections
  const filteredByChartRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedChartContrato && r.CONTRATO !== selectedChartContrato) {
        return false;
      }
      if (selectedChartTipo && r.TIPO !== selectedChartTipo) {
        return false;
      }
      if (selectedChartCorredor) {
        const corredorRaw = (r.CORREDOR || '').trim() || 'Sem Corredor / Não Informado';
        if (corredorRaw !== selectedChartCorredor) {
          return false;
        }
      }
      return true;
    });
  }, [records, selectedChartContrato, selectedChartTipo, selectedChartCorredor]);

  // Handler toggles
  const handleContratoClick = (contratoName: string) => {
    setSelectedChartContrato((prev) => (prev === contratoName ? null : contratoName));
    setCurrentPage(1);
  };

  const handleTipoClick = (tipoName: string) => {
    setSelectedChartTipo((prev) => (prev === tipoName ? null : tipoName));
    setCurrentPage(1);
  };

  const handleCorredorClick = (corredorName: string) => {
    setSelectedChartCorredor((prev) => (prev === corredorName ? null : corredorName));
    setCurrentPage(1);
  };

  const handleResetChartFilters = () => {
    setSelectedChartContrato(null);
    setSelectedChartTipo(null);
    setSelectedChartCorredor(null);
    setCurrentPage(1);
  };

  // Metrics Summary
  const metrics = useMemo(() => {
    let faixasOperacao = 0;
    let faixasImplantacao = 0;
    let faixasRelocacao = 0;

    let equipmentsOperacao = 0;
    let equipmentsImplantacao = 0;
    let equipmentsRelocacao = 0;

    const uniqueAddressSetTotal = new Set<string>();
    const uniqueAddressSetOp = new Set<string>();
    const uniqueAddressSetImp = new Set<string>();
    const uniqueAddressSetRel = new Set<string>();

    filteredByChartRecords.forEach((r) => {
      const sit = (r.Situação || '').trim().toUpperCase();
      const isOp = sit.includes('OPERAÇÃO') || sit.includes('OPERACAO');
      const isRel = sit.includes('RELOCAÇÃO') || sit.includes('RELOCACAO');

      const faixas = r.FAIXAS || 0;
      const addr = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();

      if (addr) {
        uniqueAddressSetTotal.add(addr);
      }

      if (isOp) {
        equipmentsOperacao += 1;
        faixasOperacao += faixas;
        if (addr) uniqueAddressSetOp.add(addr);
      } else if (isRel) {
        equipmentsRelocacao += 1;
        faixasRelocacao += faixas;
        if (addr) uniqueAddressSetRel.add(addr);
      } else {
        equipmentsImplantacao += 1;
        faixasImplantacao += faixas;
        if (addr) uniqueAddressSetImp.add(addr);
      }
    });

    return {
      totalEquipments: filteredByChartRecords.length,
      equipmentsOperacao,
      equipmentsImplantacao,
      equipmentsRelocacao,

      totalFaixas: faixasOperacao + faixasImplantacao + faixasRelocacao,
      faixasOperacao,
      faixasImplantacao,
      faixasRelocacao,

      totalUniqueLocations: uniqueAddressSetTotal.size,
      uniqueLocationsOperacao: uniqueAddressSetOp.size,
      uniqueLocationsImplantacao: uniqueAddressSetImp.size,
      uniqueLocationsRelocacao: uniqueAddressSetRel.size,
    };
  }, [filteredByChartRecords]);

  // Breakdown 1: CONTRATO Data (PIE CHART for SomaFaixas, BAR CHART for LocaisUnicos)
  const contratoData = useMemo(() => {
    const map = new Map<
      string,
      { contrato: string; faixas: number; addresses: Set<string>; count: number }
    >();

    const globalSeenAddresses = new Set<string>();

    filteredByChartRecords.forEach((r) => {
      const key = r.CONTRATO || 'Não Informado';
      if (!map.has(key)) {
        map.set(key, { contrato: key, faixas: 0, addresses: new Set(), count: 0 });
      }
      const item = map.get(key)!;
      item.faixas += r.FAIXAS || 0;
      item.count += 1;
      const addr = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();
      
      if (addr && !globalSeenAddresses.has(addr)) {
        globalSeenAddresses.add(addr);
        item.addresses.add(addr);
      }
    });

    return Array.from(map.values())
      .map((i) => ({
        name: i.contrato,
        SomaFaixas: i.faixas,
        LocaisUnicos: i.addresses.size,
        Equipamentos: i.count,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredByChartRecords]);

  // Breakdown 2: TIPO Data (BAR CHART for SomaFaixas & LocaisUnicos)
  const tipoData = useMemo(() => {
    const map = new Map<
      string,
      { tipo: string; faixas: number; addresses: Set<string>; count: number }
    >();

    filteredByChartRecords.forEach((r) => {
      const key = r.TIPO || 'Outros';
      if (!map.has(key)) {
        map.set(key, { tipo: key, faixas: 0, addresses: new Set(), count: 0 });
      }
      const item = map.get(key)!;
      item.faixas += r.FAIXAS || 0;
      item.count += 1;
      const addr = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();
      if (addr) item.addresses.add(addr);
    });

    return Array.from(map.values())
      .map((i) => ({
        name: i.tipo,
        SomaFaixas: i.faixas,
        LocaisUnicos: i.addresses.size,
        Equipamentos: i.count,
      }))
      .sort((a, b) => b.SomaFaixas - a.SomaFaixas);
  }, [filteredByChartRecords]);

  // Sorted descending by LocaisUnicos for Chart 3
  const tipoLocaisData = useMemo(() => {
    return [...tipoData].sort((a, b) => b.LocaisUnicos - a.LocaisUnicos);
  }, [tipoData]);

  // Mirror List filtering + sorting + pagination
  const mirrorFilteredRecords = useMemo(() => {
    let list = [...filteredByChartRecords];

    if (mirrorSearch.trim()) {
      const q = mirrorSearch.toLowerCase();
      list = list.filter((r) => {
        return [
          r.CÓDIGO,
          r.CONTRATO,
          r.TIPO,
          r.CORREDOR,
          r.BAIRRO,
          r['ENDEREÇO COMPLETO'],
          r.Situação,
        ]
          .join(' ')
          .toLowerCase()
          .includes(q);
      });
    }

    list.sort((a, b) => {
      let valA = a[sortField] ?? '';
      let valB = b[sortField] ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [filteredByChartRecords, mirrorSearch, sortField, sortOrder]);

  const totalPages = Math.ceil(mirrorFilteredRecords.length / pageSize) || 1;
  const paginatedMirrorRecords = mirrorFilteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: keyof EquipmentRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExportMirrorPDF = () => {
    exportFilteredRecordsPDF(
      mirrorFilteredRecords,
      `Relatorio-Indicadores-GEAPI-${mirrorFilteredRecords.length}-equipamentos`
    );
  };

  const hasActiveChartFilter =
    selectedChartContrato !== null ||
    selectedChartTipo !== null ||
    selectedChartCorredor !== null;

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 my-6">
        <PieIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-700">Nenhum registro encontrado</h3>
        <p className="text-xs text-slate-500 mt-1">Ajuste os filtros superiores para visualizar os indicadores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      
      {/* Interactive Chart Filter Banner */}
      {hasActiveChartFilter && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-blue-600" />
              Filtro Interativo dos Gráficos Ativo:
            </span>
            {selectedChartContrato && (
              <span className="inline-flex items-center gap-1 bg-blue-600 text-white font-medium px-2.5 py-1 rounded-full text-xs shadow-xs">
                Contrato: {selectedChartContrato}
                <button
                  onClick={() => setSelectedChartContrato(null)}
                  className="hover:bg-blue-700 p-0.5 rounded-full ml-1"
                  title="Remover filtro de contrato"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedChartTipo && (
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white font-medium px-2.5 py-1 rounded-full text-xs shadow-xs">
                Tipo: {selectedChartTipo}
                <button
                  onClick={() => setSelectedChartTipo(null)}
                  className="hover:bg-emerald-700 p-0.5 rounded-full ml-1"
                  title="Remover filtro de tipo"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedChartCorredor && (
              <span className="inline-flex items-center gap-1 bg-amber-600 text-white font-medium px-2.5 py-1 rounded-full text-xs shadow-xs">
                Corredor: {selectedChartCorredor}
                <button
                  onClick={() => setSelectedChartCorredor(null)}
                  className="hover:bg-amber-700 p-0.5 rounded-full ml-1"
                  title="Remover filtro de corredor"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={handleResetChartFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Gráficos</span>
          </button>
        </div>
      )}

      {/* Metrics Summary Cards (3 Cards - Divididos por Em Operação e Em Implantação) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Total Faixas */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-3 -bottom-3 opacity-15 pointer-events-none">
            <Layers className="w-24 h-24" />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Total de Faixas Fiscalizadas</p>
            <div className="text-3xl font-extrabold mt-1 tracking-tight">
              {metrics.totalFaixas.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-blue-400/30 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs font-medium z-10">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0" />
              <span className="text-blue-100">Operação:</span>
              <strong className="text-white font-bold">{metrics.faixasOperacao.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-300 inline-block shrink-0" />
              <span className="text-blue-100">Implantação:</span>
              <strong className="text-white font-bold">{metrics.faixasImplantacao.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-300 inline-block shrink-0" />
              <span className="text-blue-100">Relocação:</span>
              <strong className="text-white font-bold">{metrics.faixasRelocacao.toLocaleString('pt-BR')}</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Unique Locations */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-3 -bottom-3 opacity-15 pointer-events-none">
            <MapPin className="w-24 h-24" />
          </div>
          <div>
            <p className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Total de Locais Fiscalizados</p>
            <div className="text-3xl font-extrabold mt-1 tracking-tight">
              {metrics.totalUniqueLocations.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-400/30 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs font-medium z-10">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block shrink-0" />
              <span className="text-emerald-100">Operação:</span>
              <strong className="text-white font-bold">{metrics.uniqueLocationsOperacao.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-300 inline-block shrink-0" />
              <span className="text-emerald-100">Implantação:</span>
              <strong className="text-white font-bold">{metrics.uniqueLocationsImplantacao.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-300 inline-block shrink-0" />
              <span className="text-emerald-100">Relocação:</span>
              <strong className="text-white font-bold">{metrics.uniqueLocationsRelocacao.toLocaleString('pt-BR')}</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Total Equipment */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg border border-slate-800 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-3 -bottom-3 opacity-20 pointer-events-none">
            <SpeedLimit50Icon className="w-24 h-24" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Equipamentos</p>
            <div className="text-3xl font-extrabold mt-1 tracking-tight text-white">
              {metrics.totalEquipments.toLocaleString('pt-BR')}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs font-medium z-10">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0" />
              <span className="text-slate-300">Operação:</span>
              <strong className="text-white font-bold">{metrics.equipmentsOperacao.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0" />
              <span className="text-slate-300">Implantação:</span>
              <strong className="text-white font-bold">{metrics.equipmentsImplantacao.toLocaleString('pt-BR')}</strong>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block shrink-0" />
              <span className="text-slate-300">Relocação:</span>
              <strong className="text-white font-bold">{metrics.equipmentsRelocacao.toLocaleString('pt-BR')}</strong>
            </div>
          </div>
        </div>

      </div>

      {/* Charts Row 1: 3 Gráficos em Grid 3x1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Chart 1: Faixas por Contrato */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                  Faixas por Contrato
                </h3>
              </div>
            </div>
          </div>
          <div className="h-72 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contratoData} layout="vertical" margin={{ top: 15, right: 35, left: 20, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={90} />
                <Tooltip
                  formatter={(value: number) => [`${value} faixas`, 'Faixas']}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar
                  dataKey="SomaFaixas"
                  fill="#3b82f6"
                  radius={[0, 6, 6, 0]}
                  name="Faixas"
                  onClick={(entry: any) => entry && entry.name && handleContratoClick(String(entry.name))}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <LabelList dataKey="SomaFaixas" position="right" fill="#0f172a" fontSize={11} fontWeight={700} />
                  {contratoData.map((entry, index) => (
                    <Cell
                      key={`cell-contrato-faixas-${index}`}
                      fill={selectedChartContrato === entry.name ? '#1d4ed8' : '#3b82f6'}
                      stroke={selectedChartContrato === entry.name ? '#000' : 'none'}
                      strokeWidth={selectedChartContrato === entry.name ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Equipamentos por Contrato */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-purple-600" />
                  Equipamentos por Contrato
                </h3>
              </div>
            </div>
          </div>
          <div className="h-72 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contratoData} layout="vertical" margin={{ top: 15, right: 35, left: 20, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={90} />
                <Tooltip
                  formatter={(value: number) => [`${value} equipamentos`, 'Equipamentos']}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar
                  dataKey="Equipamentos"
                  fill="#8b5cf6"
                  radius={[0, 6, 6, 0]}
                  name="Equipamentos"
                  onClick={(entry: any) => entry && entry.name && handleContratoClick(String(entry.name))}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <LabelList dataKey="Equipamentos" position="right" fill="#0f172a" fontSize={11} fontWeight={700} />
                  {contratoData.map((entry, index) => (
                    <Cell
                      key={`cell-contrato-equip-${index}`}
                      fill={selectedChartContrato === entry.name ? '#6d28d9' : '#8b5cf6'}
                      stroke={selectedChartContrato === entry.name ? '#000' : 'none'}
                      strokeWidth={selectedChartContrato === entry.name ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Locais Fiscalizados por Contrato */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-orange-500" />
                  Locais Fiscalizados por Contrato
                </h3>
              </div>
            </div>
          </div>
          <div className="h-72 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contratoData} layout="vertical" margin={{ top: 15, right: 35, left: 20, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} width={90} />
                <Tooltip
                  formatter={(value: number) => [`${value} locais`, 'Locais Únicos']}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar
                  dataKey="LocaisUnicos"
                  fill="#f97316"
                  radius={[0, 6, 6, 0]}
                  name="Locais Únicos"
                  onClick={(entry: any) => entry && entry.name && handleContratoClick(String(entry.name))}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <LabelList dataKey="LocaisUnicos" position="right" fill="#0f172a" fontSize={11} fontWeight={700} />
                  {contratoData.map((entry, index) => (
                    <Cell
                      key={`cell-contrato-locais-${index}`}
                      fill={selectedChartContrato === entry.name ? '#c2410c' : '#f97316'}
                      stroke={selectedChartContrato === entry.name ? '#000' : 'none'}
                      strokeWidth={selectedChartContrato === entry.name ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Chart Row 2: Gráficos por Tipo em Grid 2x1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Chart 4: Faixas por Tipo de Equipamento (BAR CHART COM RÓTULO) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-600" />
                  Faixas por Tipo de Equipamento
                </h3>
              </div>
            </div>
          </div>

          <div className="h-72 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tipoData} margin={{ top: 25, right: 20, left: -10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-20} textAnchor="end" />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  formatter={(value: number) => [`${value} faixas`, 'Soma de Faixas']}
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                />
                <Bar
                  dataKey="SomaFaixas"
                  fill="#059669"
                  radius={[6, 6, 0, 0]}
                  name="Soma de Faixas"
                  onClick={(entry: any) => entry && entry.name && handleTipoClick(String(entry.name))}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <LabelList dataKey="SomaFaixas" position="top" fill="#0f172a" fontSize={11} fontWeight={700} />
                  {tipoData.map((entry, index) => (
                    <Cell
                      key={`cell-tipo-${index}`}
                      fill={selectedChartTipo === entry.name ? '#047857' : COLORS[index % COLORS.length]}
                      stroke={selectedChartTipo === entry.name ? '#000' : 'none'}
                      strokeWidth={selectedChartTipo === entry.name ? 2 : 0}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      {/* Chart Row 2: Locais Fiscalizados por Tipo */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-600" />
                Locais Fiscalizados por Tipo
              </h3>
            </div>
          </div>
        </div>

        <div className="h-72 w-full my-auto">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tipoLocaisData} margin={{ top: 25, right: 20, left: -10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-20} textAnchor="end" />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                formatter={(value: number) => [`${value} locais únicos`, 'Locais Únicos']}
                contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
              />
              <Bar
                dataKey="LocaisUnicos"
                fill="#7c3aed"
                radius={[6, 6, 0, 0]}
                name="Locais Únicos"
                onClick={(entry: any) => entry && entry.name && handleTipoClick(String(entry.name))}
                className="cursor-pointer hover:opacity-80 transition-opacity"
              >
                <LabelList dataKey="LocaisUnicos" position="top" fill="#0f172a" fontSize={11} fontWeight={700} />
                {tipoLocaisData.map((entry, index) => (
                  <Cell
                    key={`cell-locais-${index}`}
                    fill={selectedChartTipo === entry.name ? '#6d28d9' : '#8b5cf6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      </div>

      {/* MIRROR LIST BELOW EVERYTHING (LISTA DE EQUIPAMENTOS) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden pt-1 mt-8">
        
        {/* Header bar of mirror list */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <TableIcon className="w-5 h-5 text-blue-400" />
              Lista de Equipamentos
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Exibindo os {filteredByChartRecords.length} equipamentos filtrados
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportMirrorPDF}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-xs"
            >
              <FileDown className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Local Search and Controls Bar */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          
          <div className="relative max-w-sm w-full">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Pesquisar dentro desta lista..."
              value={mirrorSearch}
              onChange={(e) => {
                setMirrorSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-1 focus:ring-blue-500 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
            <span>
              Página <strong className="text-slate-900">{currentPage}</strong> de <strong className="text-slate-900">{totalPages}</strong> ({mirrorFilteredRecords.length} itens)
            </span>

            <label className="flex items-center gap-1.5 font-medium">
              <span>Por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:ring-1 focus:ring-blue-500"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('CÓDIGO')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Código</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('CONTRATO')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Contrato</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('TIPO')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Tipo</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('FAIXAS')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Situação')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-1">
                    <span>Situação</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('ENDEREÇO COMPLETO')}
                  className="py-3 px-3 min-w-[200px] cursor-pointer hover:bg-slate-200 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Endereço Completo</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('BAIRRO')}
                  className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Bairro</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {paginatedMirrorRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Nenhum equipamento encontrado na lista.
                  </td>
                </tr>
              ) : (
                paginatedMirrorRecords.map((r) => (
                  <tr
                    key={r.id}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                    onClick={() => onSelectRecord && onSelectRecord(r)}
                  >
                    <td className="py-2.5 px-3 font-bold text-slate-900 group-hover:text-blue-700 whitespace-nowrap text-center">
                      {r.CÓDIGO || '-'}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap text-center">
                      {r.CONTRATO || '-'}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="inline-block bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded text-[11px] border border-slate-200">
                        {r.TIPO || '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-blue-700 whitespace-nowrap">
                      {r.FAIXAS}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                          r.Situação?.includes('Em operação')
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.Situação?.includes('Desligado')
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {r.Situação?.replace('\n', ' ') || '-'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-normal text-slate-800 max-w-xs truncate">
                      {r['ENDEREÇO COMPLETO'] || '-'}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-center">{r.BAIRRO || '-'}</td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onSelectRecord && onSelectRecord(r)}
                          className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Ver Ficha Completa do Equipamento"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => exportSingleRecordPDF(r)}
                          className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                          title="Exportar PDF deste registro"
                        >
                          <FileDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            Página <strong className="text-slate-900">{currentPage}</strong> de {totalPages}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <span className="px-3 font-semibold text-slate-800">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};

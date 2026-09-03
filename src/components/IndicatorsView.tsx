import React, { useMemo, useState, useEffect } from 'react';
import { EquipmentRecord } from '../types';
import {
  exportFilteredRecordsPDF,
  exportSingleRecordPDF,
  exportCompleteIndicatorsPDF,
} from '../utils/pdfExport';
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
  Building2,
  ListFilter,
  Calendar,
  CalendarDays,
  Loader2,
  FileText,
} from 'lucide-react';

interface IndicatorsViewProps {
  records: EquipmentRecord[];
  onSelectRecord?: (record: EquipmentRecord) => void;
  resetSignal?: number;
  onClearAllFilters?: () => void;
}

type SummarySortField = 'label' | 'count' | 'faixas' | 'addresses' | 'pctEquip' | 'pctFaixas' | 'pctLocais';
type CorredorSortField = 'name' | 'count' | 'faixas' | 'tiposFormatted';
type AnoSortField = 'ano' | 'count' | 'faixas' | 'addresses' | 'pctFaixas' | 'pctEquip' | 'pctLocais';
type MesSortField = 'mes' | 'count' | 'faixas' | 'addresses' | 'pctFaixas' | 'pctEquip' | 'pctLocais';

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
  // Interactive Chart & Table Filter States
  const [selectedChartContrato, setSelectedChartContrato] = useState<string | null>(null);
  const [selectedChartTipo, setSelectedChartTipo] = useState<string | null>(null);
  const [selectedChartAno, setSelectedChartAno] = useState<string | null>(null);
  const [selectedChartMes, setSelectedChartMes] = useState<string | null>(null);
  const [selectedChartCorredor, setSelectedChartCorredor] = useState<string | null>(null);
  const [selectedChartSituacao, setSelectedChartSituacao] = useState<string | null>(null);

  // Mirror Table States
  const [mirrorSearch, setMirrorSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [sortField, setSortField] = useState<keyof EquipmentRecord>('CÓDIGO');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Summary Table Sort States
  const [contratoSortField, setContratoSortField] = useState<SummarySortField>('faixas');
  const [contratoSortOrder, setContratoSortOrder] = useState<'asc' | 'desc'>('desc');

  const [tipoTableSortField, setTipoTableSortField] = useState<SummarySortField>('faixas');
  const [tipoTableSortOrder, setTipoTableSortOrder] = useState<'asc' | 'desc'>('desc');

  const [corredorSortField, setCorredorSortField] = useState<CorredorSortField>('count');
  const [corredorSortOrder, setCorredorSortOrder] = useState<'asc' | 'desc'>('desc');

  const [anoSortField, setAnoSortField] = useState<AnoSortField>('ano');
  const [anoSortOrder, setAnoSortOrder] = useState<'asc' | 'desc'>('desc');

  const [mesSortField, setMesSortField] = useState<MesSortField>('mes');
  const [mesSortOrder, setMesSortOrder] = useState<'asc' | 'desc'>('asc');

  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [includeEquipmentListInPDF, setIncludeEquipmentListInPDF] = useState(false);

  // Reset chart & table filters when global reset signal changes
  useEffect(() => {
    if (resetSignal !== undefined && resetSignal > 0) {
      setSelectedChartContrato(null);
      setSelectedChartTipo(null);
      setSelectedChartAno(null);
      setSelectedChartMes(null);
      setSelectedChartCorredor(null);
      setSelectedChartSituacao(null);
      setMirrorSearch('');
      setCurrentPage(1);
    }
  }, [resetSignal]);

  // Helper function to match interactive filters (supporting own-dimension exclusion for responsive cross-filtering)
  const recordMatchesIndicatorsFilters = (
    r: EquipmentRecord,
    excludeKey?: 'contrato' | 'tipo' | 'ano' | 'mes' | 'corredor' | 'situacao'
  ) => {
    if (excludeKey !== 'contrato' && selectedChartContrato) {
      if (r.CONTRATO !== selectedChartContrato) return false;
    }
    if (excludeKey !== 'tipo' && selectedChartTipo) {
      if (r.TIPO !== selectedChartTipo) return false;
    }
    if (excludeKey !== 'ano' && selectedChartAno) {
      const rawAno = (r.ANO || '').toString().trim();
      const anoKey = rawAno && rawAno.toLowerCase() !== 'não informado' ? rawAno : 'Em implantação';
      if (anoKey !== selectedChartAno) return false;
    }
    if (excludeKey !== 'mes' && selectedChartMes) {
      const rawDate = (r['Data início operação'] || '').trim();
      let mesKey = 'Em implantação';
      if (rawDate && rawDate.toLowerCase() !== 'em implantação' && rawDate.toLowerCase() !== 'não informado') {
        const parts = rawDate.split('/');
        if (parts.length === 3) {
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12 && year >= 1900) {
            mesKey = `${month.toString().padStart(2, '0')}/${year}`;
          }
        } else if (parts.length === 2) {
          const month = parseInt(parts[0], 10);
          const year = parseInt(parts[1], 10);
          if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12 && year >= 1900) {
            mesKey = `${month.toString().padStart(2, '0')}/${year}`;
          }
        }
      }
      if (mesKey !== selectedChartMes) return false;
    }
    if (excludeKey !== 'corredor' && selectedChartCorredor) {
      const corredorRaw = (r.CORREDOR || '').trim() || 'Sem Corredor / Não Informado';
      if (corredorRaw !== selectedChartCorredor) return false;
    }
    if (excludeKey !== 'situacao' && selectedChartSituacao) {
      const sit = (r.Situação || '').trim().toUpperCase();
      if (selectedChartSituacao === 'OPERAÇÃO' && !(sit.includes('OPERAÇÃO') || sit.includes('OPERACAO'))) {
        return false;
      }
      if (selectedChartSituacao === 'RELOCAÇÃO' && !(sit.includes('RELOCAÇÃO') || sit.includes('RELOCACAO'))) {
        return false;
      }
      if (
        selectedChartSituacao === 'IMPLANTAÇÃO' &&
        (sit.includes('OPERAÇÃO') || sit.includes('OPERACAO') || sit.includes('RELOCAÇÃO') || sit.includes('RELOCACAO'))
      ) {
        return false;
      }
    }
    return true;
  };

  // Filter records based on ALL active interactive selections (used for KPIs, mirror table and final exports)
  const filteredByChartRecords = useMemo(() => {
    return records.filter((r) => recordMatchesIndicatorsFilters(r));
  }, [
    records,
    selectedChartContrato,
    selectedChartTipo,
    selectedChartAno,
    selectedChartMes,
    selectedChartCorredor,
    selectedChartSituacao,
  ]);

  // Handler toggles (Bi-directional click interactions)
  const handleContratoClick = (contratoName: string) => {
    setSelectedChartContrato((prev) => (prev === contratoName ? null : contratoName));
    setCurrentPage(1);
  };

  const handleTipoClick = (tipoName: string) => {
    setSelectedChartTipo((prev) => (prev === tipoName ? null : tipoName));
    setCurrentPage(1);
  };

  const handleAnoClick = (anoName: string) => {
    setSelectedChartAno((prev) => (prev === anoName ? null : anoName));
    setCurrentPage(1);
  };

  const handleMesClick = (mesName: string) => {
    setSelectedChartMes((prev) => (prev === mesName ? null : mesName));
    setCurrentPage(1);
  };

  const handleCorredorClick = (corredorName: string) => {
    setSelectedChartCorredor((prev) => (prev === corredorName ? null : corredorName));
    setCurrentPage(1);
  };

  const handleSituacaoClick = (situacaoName: string) => {
    setSelectedChartSituacao((prev) => (prev === situacaoName ? null : situacaoName));
    setCurrentPage(1);
  };

  const handleResetChartFilters = () => {
    setSelectedChartContrato(null);
    setSelectedChartTipo(null);
    setSelectedChartAno(null);
    setSelectedChartMes(null);
    setSelectedChartCorredor(null);
    setSelectedChartSituacao(null);
    setCurrentPage(1);
  };

  // Records subsets with cross-filtering (allows switching within the same dimension while respecting other dimensions)
  const contratoRecords = useMemo(() => {
    return records.filter((r) => recordMatchesIndicatorsFilters(r, 'contrato'));
  }, [
    records,
    selectedChartTipo,
    selectedChartAno,
    selectedChartMes,
    selectedChartCorredor,
    selectedChartSituacao,
  ]);

  const tipoRecords = useMemo(() => {
    return records.filter((r) => recordMatchesIndicatorsFilters(r, 'tipo'));
  }, [
    records,
    selectedChartContrato,
    selectedChartAno,
    selectedChartMes,
    selectedChartCorredor,
    selectedChartSituacao,
  ]);

  const anoRecords = useMemo(() => {
    return records.filter((r) => recordMatchesIndicatorsFilters(r, 'ano'));
  }, [
    records,
    selectedChartContrato,
    selectedChartTipo,
    selectedChartMes,
    selectedChartCorredor,
    selectedChartSituacao,
  ]);

  const mesRecords = useMemo(() => {
    return records.filter((r) => recordMatchesIndicatorsFilters(r, 'mes'));
  }, [
    records,
    selectedChartContrato,
    selectedChartTipo,
    selectedChartAno,
    selectedChartCorredor,
    selectedChartSituacao,
  ]);

  const corredorRecords = useMemo(() => {
    return records.filter((r) => recordMatchesIndicatorsFilters(r, 'corredor'));
  }, [
    records,
    selectedChartContrato,
    selectedChartTipo,
    selectedChartAno,
    selectedChartMes,
    selectedChartSituacao,
  ]);

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

  // Breakdown 1: CONTRATO Data (BAR CHART for SomaFaixas, Equipamentos e LocaisUnicos)
  const contratoData = useMemo(() => {
    const map = new Map<
      string,
      { contrato: string; faixas: number; addresses: Set<string>; count: number }
    >();

    const globalSeenAddresses = new Set<string>();

    contratoRecords.forEach((r) => {
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
  }, [contratoRecords]);

  // Breakdown 2: TIPO Data (BAR CHART for SomaFaixas & LocaisUnicos)
  const tipoData = useMemo(() => {
    const map = new Map<
      string,
      { tipo: string; faixas: number; addresses: Set<string>; count: number }
    >();

    tipoRecords.forEach((r) => {
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
  }, [tipoRecords]);

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

  // --- Summary Tables Calculations ---
  // 1. Group by CONTRATO
  const contratoTableTotals = useMemo(() => {
    const totalEquipments = contratoRecords.length;
    const totalFaixas = contratoRecords.reduce((acc, r) => acc + (r.FAIXAS || 0), 0);
    const uniqueAddressSet = new Set<string>();
    contratoRecords.forEach((r) => {
      const addr = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();
      if (addr) uniqueAddressSet.add(addr);
    });

    return {
      equipments: totalEquipments,
      faixas: totalFaixas,
      addresses: uniqueAddressSet.size,
    };
  }, [contratoRecords]);

  const contratoTableSummary = useMemo(() => {
    const map = new Map<
      string,
      { contrato: string; faixas: number; addresses: Set<string>; count: number }
    >();

    contratoRecords.forEach((r) => {
      const key = (r.CONTRATO || '').trim() || 'Não Informado';
      if (!map.has(key)) {
        map.set(key, { contrato: key, faixas: 0, addresses: new Set(), count: 0 });
      }
      const item = map.get(key)!;
      item.faixas += r.FAIXAS || 0;
      item.count += 1;
      const addr = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();
      if (addr) item.addresses.add(addr);
    });

    const list = Array.from(map.values());

    return list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (contratoSortField) {
        case 'label':
          valA = a.contrato;
          valB = b.contrato;
          break;
        case 'count':
        case 'pctEquip':
          valA = a.count;
          valB = b.count;
          break;
        case 'faixas':
        case 'pctFaixas':
          valA = a.faixas;
          valB = b.faixas;
          break;
        case 'addresses':
        case 'pctLocais':
          valA = a.addresses.size;
          valB = b.addresses.size;
          break;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return contratoSortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return contratoSortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [contratoRecords, contratoSortField, contratoSortOrder]);

  // 2. Group by TIPO
  const tipoTableTotals = useMemo(() => {
    const totalEquipments = tipoRecords.length;
    const totalFaixas = tipoRecords.reduce((acc, r) => acc + (r.FAIXAS || 0), 0);
    const uniqueAddressSet = new Set<string>();
    tipoRecords.forEach((r) => {
      const addr = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();
      if (addr) uniqueAddressSet.add(addr);
    });

    return {
      equipments: totalEquipments,
      faixas: totalFaixas,
      addresses: uniqueAddressSet.size,
    };
  }, [tipoRecords]);

  const tipoTableSummary = useMemo(() => {
    const map = new Map<
      string,
      { tipo: string; faixas: number; addresses: Set<string>; count: number }
    >();

    tipoRecords.forEach((r) => {
      const key = (r.TIPO || '').trim() || 'Não Informado';
      if (!map.has(key)) {
        map.set(key, { tipo: key, faixas: 0, addresses: new Set(), count: 0 });
      }
      const item = map.get(key)!;
      item.faixas += r.FAIXAS || 0;
      item.count += 1;
      const addr = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();
      if (addr) item.addresses.add(addr);
    });

    const list = Array.from(map.values());

    return list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (tipoTableSortField) {
        case 'label':
          valA = a.tipo;
          valB = b.tipo;
          break;
        case 'count':
        case 'pctEquip':
          valA = a.count;
          valB = b.count;
          break;
        case 'faixas':
        case 'pctFaixas':
          valA = a.faixas;
          valB = b.faixas;
          break;
        case 'addresses':
        case 'pctLocais':
          valA = a.addresses.size;
          valB = b.addresses.size;
          break;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return tipoTableSortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return tipoTableSortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [tipoRecords, tipoTableSortField, tipoTableSortOrder]);

  // 3. Group by ANO (Implantações por Ano)
  const anoTotals = useMemo(() => {
    const totalEquip = anoRecords.length;
    const totalFaixas = anoRecords.reduce((acc, r) => acc + (r.FAIXAS || 0), 0);
    const uniqueAddressSet = new Set<string>();
    anoRecords.forEach((r) => {
      const addr = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();
      if (addr) uniqueAddressSet.add(addr);
    });
    return { totalEquip, totalFaixas, totalAddresses: uniqueAddressSet.size };
  }, [anoRecords]);

  const anoSummary = useMemo(() => {
    const map = new Map<string, { ano: string; faixas: number; count: number; addresses: Set<string> }>();

    anoRecords.forEach((r) => {
      const rawAno = (r.ANO || '').toString().trim();
      const key = (rawAno && rawAno.toLowerCase() !== 'não informado') ? rawAno : 'Em implantação';
      if (!map.has(key)) {
        map.set(key, { ano: key, faixas: 0, count: 0, addresses: new Set() });
      }
      const item = map.get(key)!;
      item.faixas += r.FAIXAS || 0;
      item.count += 1;
      const addr = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();
      if (addr) item.addresses.add(addr);
    });

    const list = Array.from(map.values());

    return list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (anoSortField) {
        case 'ano': {
          const isNumA = /^\d+$/.test(a.ano);
          const isNumB = /^\d+$/.test(b.ano);
          if (isNumA && isNumB) {
            valA = parseInt(a.ano, 10);
            valB = parseInt(b.ano, 10);
          } else if (isNumA && !isNumB) {
            return anoSortOrder === 'asc' ? -1 : 1;
          } else if (!isNumA && isNumB) {
            return anoSortOrder === 'asc' ? 1 : -1;
          } else {
            valA = a.ano;
            valB = b.ano;
          }
          break;
        }
        case 'count':
        case 'pctEquip':
          valA = a.count;
          valB = b.count;
          break;
        case 'faixas':
        case 'pctFaixas':
          valA = a.faixas;
          valB = b.faixas;
          break;
        case 'addresses':
        case 'pctLocais':
          valA = a.addresses.size;
          valB = b.addresses.size;
          break;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return anoSortOrder === 'asc' ? valA - valB : valB - valA;
      }

      return anoSortOrder === 'asc'
        ? String(valA).localeCompare(String(valB), undefined, { numeric: true })
        : String(valB).localeCompare(String(valA), undefined, { numeric: true });
    });
  }, [anoRecords, anoSortField, anoSortOrder]);

  // 4. Group by MÊS/ANO (Implantações por Mês)
  const mesTotals = useMemo(() => {
    const totalEquip = mesRecords.length;
    const totalFaixas = mesRecords.reduce((acc, r) => acc + (r.FAIXAS || 0), 0);
    const uniqueAddressSet = new Set<string>();
    mesRecords.forEach((r) => {
      const addr = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();
      if (addr) uniqueAddressSet.add(addr);
    });
    return { totalEquip, totalFaixas, totalAddresses: uniqueAddressSet.size };
  }, [mesRecords]);

  const mesSummary = useMemo(() => {
    const map = new Map<
      string,
      { mes: string; sortKey: number; faixas: number; count: number; addresses: Set<string> }
    >();

    mesRecords.forEach((r) => {
      const rawDate = (r['Data início operação'] || '').trim();
      let key = 'Em implantação';
      let sortKey = 999999;

      if (rawDate && rawDate.toLowerCase() !== 'em implantação' && rawDate.toLowerCase() !== 'não informado') {
        const parts = rawDate.split('/');
        if (parts.length === 3) {
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12 && year >= 1900) {
            const mStr = month.toString().padStart(2, '0');
            key = `${mStr}/${year}`;
            sortKey = year * 100 + month;
          }
        } else if (parts.length === 2) {
          const month = parseInt(parts[0], 10);
          const year = parseInt(parts[1], 10);
          if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12 && year >= 1900) {
            const mStr = month.toString().padStart(2, '0');
            key = `${mStr}/${year}`;
            sortKey = year * 100 + month;
          }
        }
      }

      if (!map.has(key)) {
        map.set(key, { mes: key, sortKey, faixas: 0, count: 0, addresses: new Set() });
      }
      const item = map.get(key)!;
      item.faixas += r.FAIXAS || 0;
      item.count += 1;
      const addr = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();
      if (addr) item.addresses.add(addr);
    });

    const list = Array.from(map.values());

    return list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (mesSortField) {
        case 'mes':
          valA = a.sortKey;
          valB = b.sortKey;
          break;
        case 'count':
        case 'pctEquip':
          valA = a.count;
          valB = b.count;
          break;
        case 'faixas':
        case 'pctFaixas':
          valA = a.faixas;
          valB = b.faixas;
          break;
        case 'addresses':
        case 'pctLocais':
          valA = a.addresses.size;
          valB = b.addresses.size;
          break;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return mesSortOrder === 'asc' ? valA - valB : valB - valA;
      }

      return mesSortOrder === 'asc'
        ? String(valA).localeCompare(String(valB), undefined, { numeric: true })
        : String(valB).localeCompare(String(valA), undefined, { numeric: true });
    });
  }, [mesRecords, mesSortField, mesSortOrder]);

  // 5. Group by CORREDOR (Ranking TOP 20)
  const corredorSummary = useMemo(() => {
    const map = new Map<
      string,
      { corredor: string; count: number; faixas: number; tiposMap: Map<string, number> }
    >();

    corredorRecords.forEach((r) => {
      const corredorRaw = (r.CORREDOR || '').trim();
      const key = corredorRaw ? corredorRaw : 'Sem Corredor / Não Informado';

      if (!map.has(key)) {
        map.set(key, { corredor: key, count: 0, faixas: 0, tiposMap: new Map() });
      }
      const item = map.get(key)!;
      item.count += 1;
      item.faixas += r.FAIXAS || 0;

      const t = (r.TIPO || 'OUTROS').trim();
      item.tiposMap.set(t, (item.tiposMap.get(t) || 0) + 1);
    });

    const list = Array.from(map.values()).map((i) => {
      const tiposFormatted = Array.from(i.tiposMap.entries())
        .map(([t, count]) => `${t}: ${count}`)
        .join(' | ');

      return {
        name: i.corredor,
        count: i.count,
        faixas: i.faixas,
        tiposFormatted,
      };
    });

    list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (corredorSortField) {
        case 'name':
          valA = a.name;
          valB = b.name;
          break;
        case 'count':
          valA = a.count;
          valB = b.count;
          break;
        case 'faixas':
          valA = a.faixas;
          valB = b.faixas;
          break;
        case 'tiposFormatted':
          valA = a.tiposFormatted;
          valB = b.tiposFormatted;
          break;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return corredorSortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return corredorSortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    return list.slice(0, 20); // Top 20
  }, [corredorRecords, corredorSortField, corredorSortOrder]);

  const handleContratoTableSort = (field: SummarySortField) => {
    if (contratoSortField === field) {
      setContratoSortOrder(contratoSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setContratoSortField(field);
      setContratoSortOrder('desc');
    }
  };

  const handleTipoTableSort = (field: SummarySortField) => {
    if (tipoTableSortField === field) {
      setTipoTableSortOrder(tipoTableSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setTipoTableSortField(field);
      setTipoTableSortOrder('desc');
    }
  };

  const handleCorredorTableSort = (field: CorredorSortField) => {
    if (corredorSortField === field) {
      setCorredorSortOrder(corredorSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setCorredorSortField(field);
      setCorredorSortOrder('desc');
    }
  };

  const handleAnoTableSort = (field: AnoSortField) => {
    if (anoSortField === field) {
      setAnoSortOrder(anoSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setAnoSortField(field);
      setAnoSortOrder('desc');
    }
  };

  const handleMesTableSort = (field: MesSortField) => {
    if (mesSortField === field) {
      setMesSortOrder(mesSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setMesSortField(field);
      setMesSortOrder(field === 'mes' ? 'asc' : 'desc');
    }
  };

  const handleExportIndicatorsPDF = async () => {
    try {
      setIsExportingPDF(true);

      const contratoSummaryData = contratoTableSummary.map((c) => ({
        label: c.contrato,
        count: c.count,
        faixas: c.faixas,
        addresses: c.addresses.size,
        pctEquip: contratoTableTotals.equipments > 0 ? (c.count / contratoTableTotals.equipments) * 100 : 0,
        pctFaixas: contratoTableTotals.faixas > 0 ? (c.faixas / contratoTableTotals.faixas) * 100 : 0,
        pctLocais: contratoTableTotals.addresses > 0 ? (c.addresses.size / contratoTableTotals.addresses) * 100 : 0,
      }));

      const tipoSummaryData = tipoTableSummary.map((t) => ({
        label: t.tipo,
        count: t.count,
        faixas: t.faixas,
        addresses: t.addresses.size,
        pctEquip: tipoTableTotals.equipments > 0 ? (t.count / tipoTableTotals.equipments) * 100 : 0,
        pctFaixas: tipoTableTotals.faixas > 0 ? (t.faixas / tipoTableTotals.faixas) * 100 : 0,
        pctLocais: tipoTableTotals.addresses > 0 ? (t.addresses.size / tipoTableTotals.addresses) * 100 : 0,
      }));

      const anoSummaryData = anoSummary.map((a) => ({
        ano: a.ano,
        count: a.count,
        faixas: a.faixas,
        addresses: a.addresses.size,
        pctFaixas: anoTotals.totalFaixas > 0 ? (a.faixas / anoTotals.totalFaixas) * 100 : 0,
        pctEquip: anoTotals.totalEquip > 0 ? (a.count / anoTotals.totalEquip) * 100 : 0,
        pctLocais: anoTotals.totalAddresses > 0 ? (a.addresses.size / anoTotals.totalAddresses) * 100 : 0,
      }));

      const mesSummaryData = mesSummary.map((m) => ({
        mes: m.mes,
        count: m.count,
        faixas: m.faixas,
        addresses: m.addresses.size,
        pctFaixas: anoTotals.totalFaixas > 0 ? (m.faixas / anoTotals.totalFaixas) * 100 : 0,
        pctEquip: anoTotals.totalEquip > 0 ? (m.count / anoTotals.totalEquip) * 100 : 0,
        pctLocais: anoTotals.totalAddresses > 0 ? (m.addresses.size / anoTotals.totalAddresses) * 100 : 0,
      }));

      await exportCompleteIndicatorsPDF({
        records: filteredByChartRecords,
        metrics,
        contratoSummary: contratoSummaryData,
        tipoSummary: tipoSummaryData,
        anoSummary: anoSummaryData,
        mesSummary: mesSummaryData,
        corredorSummary,
        filterDescription: hasActiveChartFilter
          ? [
              selectedChartContrato ? `Contrato ${selectedChartContrato}` : '',
              selectedChartTipo ? `Tipo ${selectedChartTipo}` : '',
              selectedChartCorredor ? `Corredor ${selectedChartCorredor}` : '',
            ].filter(Boolean).join(' | ')
          : undefined,
        includeEquipmentList: includeEquipmentListInPDF,
      });
    } catch (err) {
      console.error('Erro ao exportar relatório completo de indicadores:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  const hasActiveChartFilter =
    selectedChartContrato !== null ||
    selectedChartTipo !== null ||
    selectedChartAno !== null ||
    selectedChartMes !== null ||
    selectedChartCorredor !== null ||
    selectedChartSituacao !== null;

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
    <div className="space-y-6 pb-8 min-w-0">
      
      {/* Top Banner with Full Report Export Option */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md border border-slate-800">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-400" />
            Painel Executivo de Indicadores
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Consolidação estatística, contratos, tipos, evolução cronológica e corredores ({filteredByChartRecords.length} equipamentos)
          </p>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
          <button
            id="btn-export-indicators-pdf"
            onClick={handleExportIndicatorsPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:opacity-75 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            title="Exportar toda a aba de indicadores em PDF oficial timbrado"
          >
            {isExportingPDF ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-blue-200" />
                <span>Gerando Relatório...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-blue-100" />
                <span>Exportar Relatório de Indicadores (PDF)</span>
              </>
            )}
          </button>

          <label
            id="label-include-equipment-list-pdf"
            className="flex items-center gap-1.5 text-[11px] text-slate-300 hover:text-white cursor-pointer select-none transition-colors"
          >
            <input
              id="checkbox-include-equipment-list-pdf"
              type="checkbox"
              checked={includeEquipmentListInPDF}
              onChange={(e) => setIncludeEquipmentListInPDF(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-blue-600 bg-slate-800 border-slate-700 focus:ring-blue-500 focus:ring-offset-slate-900 cursor-pointer"
            />
            <span>Incluir Lista de Equipamentos na exportação PDF (o arquivo poderá ficar com muitas páginas)</span>
          </label>
        </div>
      </div>
      
      {/* Interactive Chart Filter Banner */}
      {hasActiveChartFilter && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-blue-900 flex items-center gap-1.5">
              <Filter className="w-4 h-4 text-blue-600" />
              Filtro Interativo Ativo:
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
            {selectedChartAno && (
              <span className="inline-flex items-center gap-1 bg-purple-600 text-white font-medium px-2.5 py-1 rounded-full text-xs shadow-xs">
                Ano: {selectedChartAno}
                <button
                  onClick={() => setSelectedChartAno(null)}
                  className="hover:bg-purple-700 p-0.5 rounded-full ml-1"
                  title="Remover filtro de ano"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedChartMes && (
              <span className="inline-flex items-center gap-1 bg-indigo-600 text-white font-medium px-2.5 py-1 rounded-full text-xs shadow-xs">
                Mês: {selectedChartMes}
                <button
                  onClick={() => setSelectedChartMes(null)}
                  className="hover:bg-indigo-700 p-0.5 rounded-full ml-1"
                  title="Remover filtro de mês"
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
            {selectedChartSituacao && (
              <span className="inline-flex items-center gap-1 bg-slate-800 text-white font-medium px-2.5 py-1 rounded-full text-xs shadow-xs">
                Situação: {selectedChartSituacao}
                <button
                  onClick={() => setSelectedChartSituacao(null)}
                  className="hover:bg-slate-700 p-0.5 rounded-full ml-1"
                  title="Remover filtro de situação"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={handleResetChartFilters}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Filtros</span>
          </button>
        </div>
      )}

      {/* Metrics Summary Cards (3 Cards - Interativos com Clique na Situação) */}
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
            <button
              onClick={() => handleSituacaoClick('OPERAÇÃO')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedChartSituacao === 'OPERAÇÃO' ? 'bg-white/25 ring-1 ring-white font-bold' : 'hover:bg-white/10'
              }`}
              title="Filtrar por Em Operação"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0" />
              <span className="text-blue-100">Operação:</span>
              <strong className="text-white font-bold">{metrics.faixasOperacao.toLocaleString('pt-BR')}</strong>
            </button>
            <button
              onClick={() => handleSituacaoClick('IMPLANTAÇÃO')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedChartSituacao === 'IMPLANTAÇÃO' ? 'bg-white/25 ring-1 ring-white font-bold' : 'hover:bg-white/10'
              }`}
              title="Filtrar por Em Implantação"
            >
              <span className="w-2 h-2 rounded-full bg-amber-300 inline-block shrink-0" />
              <span className="text-blue-100">Implantação:</span>
              <strong className="text-white font-bold">{metrics.faixasImplantacao.toLocaleString('pt-BR')}</strong>
            </button>
            <button
              onClick={() => handleSituacaoClick('RELOCAÇÃO')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedChartSituacao === 'RELOCAÇÃO' ? 'bg-white/25 ring-1 ring-white font-bold' : 'hover:bg-white/10'
              }`}
              title="Filtrar por Em Relocação"
            >
              <span className="w-2 h-2 rounded-full bg-purple-300 inline-block shrink-0" />
              <span className="text-blue-100">Relocação:</span>
              <strong className="text-white font-bold">{metrics.faixasRelocacao.toLocaleString('pt-BR')}</strong>
            </button>
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
            <button
              onClick={() => handleSituacaoClick('OPERAÇÃO')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedChartSituacao === 'OPERAÇÃO' ? 'bg-white/25 ring-1 ring-white font-bold' : 'hover:bg-white/10'
              }`}
              title="Filtrar por Em Operação"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-300 inline-block shrink-0" />
              <span className="text-emerald-100">Operação:</span>
              <strong className="text-white font-bold">{metrics.uniqueLocationsOperacao.toLocaleString('pt-BR')}</strong>
            </button>
            <button
              onClick={() => handleSituacaoClick('IMPLANTAÇÃO')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedChartSituacao === 'IMPLANTAÇÃO' ? 'bg-white/25 ring-1 ring-white font-bold' : 'hover:bg-white/10'
              }`}
              title="Filtrar por Em Implantação"
            >
              <span className="w-2 h-2 rounded-full bg-amber-300 inline-block shrink-0" />
              <span className="text-emerald-100">Implantação:</span>
              <strong className="text-white font-bold">{metrics.uniqueLocationsImplantacao.toLocaleString('pt-BR')}</strong>
            </button>
            <button
              onClick={() => handleSituacaoClick('RELOCAÇÃO')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedChartSituacao === 'RELOCAÇÃO' ? 'bg-white/25 ring-1 ring-white font-bold' : 'hover:bg-white/10'
              }`}
              title="Filtrar por Em Relocação"
            >
              <span className="w-2 h-2 rounded-full bg-purple-300 inline-block shrink-0" />
              <span className="text-emerald-100">Relocação:</span>
              <strong className="text-white font-bold">{metrics.uniqueLocationsRelocacao.toLocaleString('pt-BR')}</strong>
            </button>
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
            <button
              onClick={() => handleSituacaoClick('OPERAÇÃO')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedChartSituacao === 'OPERAÇÃO' ? 'bg-slate-800 ring-1 ring-emerald-400 font-bold' : 'hover:bg-slate-800/80'
              }`}
              title="Filtrar por Em Operação"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shrink-0" />
              <span className="text-slate-300">Operação:</span>
              <strong className="text-white font-bold">{metrics.equipmentsOperacao.toLocaleString('pt-BR')}</strong>
            </button>
            <button
              onClick={() => handleSituacaoClick('IMPLANTAÇÃO')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedChartSituacao === 'IMPLANTAÇÃO' ? 'bg-slate-800 ring-1 ring-amber-400 font-bold' : 'hover:bg-slate-800/80'
              }`}
              title="Filtrar por Em Implantação"
            >
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shrink-0" />
              <span className="text-slate-300">Implantação:</span>
              <strong className="text-white font-bold">{metrics.equipmentsImplantacao.toLocaleString('pt-BR')}</strong>
            </button>
            <button
              onClick={() => handleSituacaoClick('RELOCAÇÃO')}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md transition-colors cursor-pointer ${
                selectedChartSituacao === 'RELOCAÇÃO' ? 'bg-slate-800 ring-1 ring-purple-400 font-bold' : 'hover:bg-slate-800/80'
              }`}
              title="Filtrar por Em Relocação"
            >
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block shrink-0" />
              <span className="text-slate-300">Relocação:</span>
              <strong className="text-white font-bold">{metrics.equipmentsRelocacao.toLocaleString('pt-BR')}</strong>
            </button>
          </div>
        </div>

      </div>

      {/* Charts Grid: Contrato e Tipo de Equipamento Lado a Lado no Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        
        {/* Chart 1: Gráfico Único Consolidado por Contrato (Faixas, Equipamentos e Locais) */}
        <div id="indicators-charts-contrato" className="w-full bg-white p-1.5 sm:p-2 rounded-2xl flex flex-col">
          <div id="chart-card-contrato-consolidado" className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="mb-2 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Consolidação por Contrato</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Faixas, equipamentos e locais por contrato. Clique para filtrar.
                </p>
              </div>
            </div>
            <div className="h-72 sm:h-80 w-full my-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contratoData} margin={{ top: 20, right: 16, left: -15, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }} />
                  <YAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toLocaleString('pt-BR')} ${name === 'Faixas' ? 'faixas' : name === 'Equipamentos' ? 'equipamentos' : 'locais'}`,
                      name,
                    ]}
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
                  />
                  <Bar
                    dataKey="SomaFaixas"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                    name="Faixas"
                    isAnimationActive={false}
                    onClick={(entry: any) => entry && entry.name && handleContratoClick(String(entry.name))}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <LabelList dataKey="SomaFaixas" position="top" fill="#1e3a8a" fontSize={10} fontWeight={700} />
                    {contratoData.map((entry, index) => (
                      <Cell
                        key={`cell-contrato-faixas-${index}`}
                        fill={selectedChartContrato === entry.name ? '#1d4ed8' : '#3b82f6'}
                        stroke={selectedChartContrato === entry.name ? '#000' : 'none'}
                        strokeWidth={selectedChartContrato === entry.name ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="Equipamentos"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                    name="Equipamentos"
                    isAnimationActive={false}
                    onClick={(entry: any) => entry && entry.name && handleContratoClick(String(entry.name))}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <LabelList dataKey="Equipamentos" position="top" fill="#4c1d95" fontSize={10} fontWeight={700} />
                    {contratoData.map((entry, index) => (
                      <Cell
                        key={`cell-contrato-equip-${index}`}
                        fill={selectedChartContrato === entry.name ? '#6d28d9' : '#8b5cf6'}
                        stroke={selectedChartContrato === entry.name ? '#000' : 'none'}
                        strokeWidth={selectedChartContrato === entry.name ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="LocaisUnicos"
                    fill="#f97316"
                    radius={[4, 4, 0, 0]}
                    name="Locais"
                    isAnimationActive={false}
                    onClick={(entry: any) => entry && entry.name && handleContratoClick(String(entry.name))}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <LabelList dataKey="LocaisUnicos" position="top" fill="#7c2d12" fontSize={10} fontWeight={700} />
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

        {/* Chart 2: Gráfico Único Consolidado por Tipo de Equipamento (Faixas e Locais Fiscalizados) */}
        <div id="indicators-charts-tipo" className="w-full bg-white p-1.5 sm:p-2 rounded-2xl flex flex-col">
          <div id="chart-card-tipo-consolidado" className="bg-white rounded-2xl border border-slate-200 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between h-full">
            <div>
              <div className="mb-2 pb-3 border-b border-slate-100">
                <h3 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Consolidação por Tipo de Equipamento</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Faixas monitoradas e locais por tecnologia. Clique para filtrar.
                </p>
              </div>
            </div>

            <div className="w-full overflow-x-auto my-auto pb-1">
              <div className="h-72 sm:h-80 w-full min-w-[380px] sm:min-w-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tipoData} margin={{ top: 20, right: 16, left: -15, bottom: 45 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 9.5, fill: '#64748b' }} interval={0} angle={-22} textAnchor="end" height={48} />
                    <YAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value.toLocaleString('pt-BR')} ${name === 'Faixas' ? 'faixas' : 'locais'}`,
                        name,
                      ]}
                      contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }} />
                    <Bar
                      dataKey="SomaFaixas"
                      fill="#059669"
                      radius={[4, 4, 0, 0]}
                      name="Faixas"
                      isAnimationActive={false}
                      onClick={(entry: any) => entry && entry.name && handleTipoClick(String(entry.name))}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <LabelList dataKey="SomaFaixas" position="top" fill="#047857" fontSize={10} fontWeight={700} />
                      {tipoData.map((entry, index) => (
                        <Cell
                          key={`cell-tipo-faixas-${index}`}
                          fill={selectedChartTipo === entry.name ? '#047857' : '#059669'}
                          stroke={selectedChartTipo === entry.name ? '#000' : 'none'}
                          strokeWidth={selectedChartTipo === entry.name ? 2 : 0}
                        />
                      ))}
                    </Bar>
                    <Bar
                      dataKey="LocaisUnicos"
                      fill="#7c3aed"
                      radius={[4, 4, 0, 0]}
                      name="Locais"
                      isAnimationActive={false}
                      onClick={(entry: any) => entry && entry.name && handleTipoClick(String(entry.name))}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <LabelList dataKey="LocaisUnicos" position="top" fill="#6d28d9" fontSize={10} fontWeight={700} />
                      {tipoData.map((entry, index) => (
                        <Cell
                          key={`cell-tipo-locais-${index}`}
                          fill={selectedChartTipo === entry.name ? '#6d28d9' : '#8b5cf6'}
                          stroke={selectedChartTipo === entry.name ? '#000' : 'none'}
                          strokeWidth={selectedChartTipo === entry.name ? 2 : 0}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Table 1: Resumo Por Contrato */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
              <Building2 className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Resumo por Contrato
              </h3>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            {contratoTableSummary.length} contratos
          </span>
        </div>

        <div className="block sm:hidden text-[10.5px] text-slate-500 font-medium px-4 py-1.5 bg-slate-100/90 border-b border-slate-200">
          ↔ Deslize para os lados para ver todas as colunas
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] sm:min-w-0 text-center text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  scope="col"
                  onClick={() => handleContratoTableSort('label')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Contrato</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleContratoTableSort('count')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Equipamentos</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleContratoTableSort('faixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleContratoTableSort('addresses')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Locais</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleContratoTableSort('pctEquip')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Equip.</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleContratoTableSort('pctFaixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleContratoTableSort('pctLocais')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Locais</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-slate-800">
              {contratoTableSummary.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                contratoTableSummary.map((item, idx) => {
                  const pctEquip = contratoTableTotals.equipments > 0 ? (item.count / contratoTableTotals.equipments) * 100 : 0;
                  const pctFaixas = contratoTableTotals.faixas > 0 ? (item.faixas / contratoTableTotals.faixas) * 100 : 0;
                  const pctLocais = contratoTableTotals.addresses > 0 ? (item.addresses.size / contratoTableTotals.addresses) * 100 : 0;
                  const isSelected = selectedChartContrato === item.contrato;

                  return (
                    <tr
                      key={item.contrato}
                      onClick={() => handleContratoClick(item.contrato)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-blue-100 font-bold shadow-xs'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-blue-50/60'
                          : 'bg-slate-50/40 hover:bg-blue-50/60'
                      }`}
                      title={`Clique para ${isSelected ? 'remover filtro de' : 'filtrar por'} Contrato ${item.contrato}`}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600 inline-block shrink-0" />}
                          <span>{item.contrato}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium text-slate-800">
                        {item.count.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-blue-700">
                        {item.faixas.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-700">
                        {item.addresses.size.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctEquip.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctFaixas.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctLocais.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {contratoTableSummary.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-xs">
                <tr>
                  <td className="px-4 py-3 uppercase text-center">Total Geral</td>
                  <td className="px-4 py-3 text-center font-mono">{contratoTableTotals.equipments.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono text-blue-800">{contratoTableTotals.faixas.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono">{contratoTableTotals.addresses.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Table 2: Resumo Por TIPO */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <ListFilter className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Resumo por Tipo de Equipamento
              </h3>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            {tipoTableSummary.length} tipos
          </span>
        </div>

        <div className="block sm:hidden text-[10.5px] text-slate-500 font-medium px-4 py-1.5 bg-slate-100/90 border-b border-slate-200">
          ↔ Deslize para os lados para ver todas as colunas
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] sm:min-w-0 text-center text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  scope="col"
                  onClick={() => handleTipoTableSort('label')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Tipo de Equipamento</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleTipoTableSort('count')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Equipamentos</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleTipoTableSort('faixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleTipoTableSort('addresses')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Locais</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleTipoTableSort('pctEquip')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Equip.</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleTipoTableSort('pctFaixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleTipoTableSort('pctLocais')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Locais</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-slate-800">
              {tipoTableSummary.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                tipoTableSummary.map((item, idx) => {
                  const pctEquip = tipoTableTotals.equipments > 0 ? (item.count / tipoTableTotals.equipments) * 100 : 0;
                  const pctFaixas = tipoTableTotals.faixas > 0 ? (item.faixas / tipoTableTotals.faixas) * 100 : 0;
                  const pctLocais = tipoTableTotals.addresses > 0 ? (item.addresses.size / tipoTableTotals.addresses) * 100 : 0;
                  const isSelected = selectedChartTipo === item.tipo;

                  return (
                    <tr
                      key={item.tipo}
                      onClick={() => handleTipoClick(item.tipo)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-emerald-100 font-bold shadow-xs'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-emerald-50/60'
                          : 'bg-slate-50/40 hover:bg-emerald-50/60'
                      }`}
                      title={`Clique para ${isSelected ? 'remover filtro de' : 'filtrar por'} Tipo ${item.tipo}`}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block shrink-0" />}
                          <span>{item.tipo}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium text-slate-800">
                        {item.count.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-emerald-700">
                        {item.faixas.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-700">
                        {item.addresses.size.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctEquip.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctFaixas.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctLocais.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {tipoTableSummary.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-xs">
                <tr>
                  <td className="px-4 py-3 uppercase text-center">Total Geral</td>
                  <td className="px-4 py-3 text-center font-mono">{tipoTableTotals.equipments.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono text-emerald-800">{tipoTableTotals.faixas.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono">{tipoTableTotals.addresses.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Table 3: Implantações por Ano */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Calendar className="w-5 h-5" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Implantações por Ano
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            {anoSummary.length} anos
          </span>
        </div>

        <div className="block sm:hidden text-[10.5px] text-slate-500 font-medium px-4 py-1.5 bg-slate-100/90 border-b border-slate-200">
          ↔ Deslize para os lados para ver todas as colunas
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] sm:min-w-0 text-center text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  scope="col"
                  onClick={() => handleAnoTableSort('ano')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Ano</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleAnoTableSort('count')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Equipamentos</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleAnoTableSort('faixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleAnoTableSort('addresses')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Locais</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleAnoTableSort('pctFaixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleAnoTableSort('pctEquip')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Equipamentos</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleAnoTableSort('pctLocais')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Locais</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-slate-800">
              {anoSummary.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                anoSummary.map((item, idx) => {
                  const pctFaixas = anoTotals.totalFaixas > 0 ? (item.faixas / anoTotals.totalFaixas) * 100 : 0;
                  const pctEquip = anoTotals.totalEquip > 0 ? (item.count / anoTotals.totalEquip) * 100 : 0;
                  const pctLocais = anoTotals.totalAddresses > 0 ? (item.addresses.size / anoTotals.totalAddresses) * 100 : 0;
                  const isSelected = selectedChartAno === item.ano;

                  return (
                    <tr
                      key={item.ano}
                      onClick={() => handleAnoClick(item.ano)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-purple-100 font-bold shadow-xs'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-purple-50/60'
                          : 'bg-slate-50/40 hover:bg-purple-50/60'
                      }`}
                      title={`Clique para ${isSelected ? 'remover filtro de' : 'filtrar por'} Ano ${item.ano}`}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-purple-600 inline-block shrink-0" />}
                          <span>{item.ano}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium text-slate-800">
                        {item.count.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-purple-700">
                        {item.faixas.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-700">
                        {item.addresses.size.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctFaixas.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctEquip.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctLocais.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {anoSummary.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-xs">
                <tr>
                  <td className="px-4 py-3 uppercase text-center">Total Geral</td>
                  <td className="px-4 py-3 text-center font-mono">{anoTotals.totalEquip.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono text-purple-800">{anoTotals.totalFaixas.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono">{anoTotals.totalAddresses.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Table 4: Implantações por Mês */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <CalendarDays className="w-5 h-5" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Implantações por Mês
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            {mesSummary.length} meses
          </span>
        </div>

        <div className="block sm:hidden text-[10.5px] text-slate-500 font-medium px-4 py-1.5 bg-slate-100/90 border-b border-slate-200">
          ↔ Deslize para os lados para ver todas as colunas
        </div>
        <div className="overflow-x-auto max-h-80 overflow-y-auto">
          <table className="w-full min-w-[620px] sm:min-w-0 text-center text-xs">
            <thead className="bg-slate-100/95 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px] sticky top-0 z-10 shadow-xs">
              <tr>
                <th
                  scope="col"
                  onClick={() => handleMesTableSort('mes')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Mês/Ano</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleMesTableSort('count')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Equipamentos</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleMesTableSort('faixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleMesTableSort('addresses')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Locais</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleMesTableSort('pctFaixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleMesTableSort('pctEquip')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Equipamentos</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleMesTableSort('pctLocais')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Locais</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-slate-800">
              {mesSummary.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 italic">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                mesSummary.map((item, idx) => {
                  const pctFaixas = anoTotals.totalFaixas > 0 ? (item.faixas / anoTotals.totalFaixas) * 100 : 0;
                  const pctEquip = anoTotals.totalEquip > 0 ? (item.count / anoTotals.totalEquip) * 100 : 0;
                  const pctLocais = anoTotals.totalAddresses > 0 ? (item.addresses.size / anoTotals.totalAddresses) * 100 : 0;
                  const isSelected = selectedChartMes === item.mes;

                  return (
                    <tr
                      key={item.mes}
                      onClick={() => handleMesClick(item.mes)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-indigo-100 font-bold shadow-xs'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-indigo-50/60'
                          : 'bg-slate-50/40 hover:bg-indigo-50/60'
                      }`}
                      title={`Clique para ${isSelected ? 'remover filtro de' : 'filtrar por'} Mês ${item.mes}`}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block shrink-0" />}
                          <span>{item.mes}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium text-slate-800">
                        {item.count.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-indigo-700">
                        {item.faixas.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-700">
                        {item.addresses.size.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctFaixas.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctEquip.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctLocais.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {mesSummary.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-xs sticky bottom-0 z-10 shadow-xs">
                <tr>
                  <td className="px-4 py-3 uppercase text-center">Total Geral</td>
                  <td className="px-4 py-3 text-center font-mono">{anoTotals.totalEquip.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono text-indigo-800">{anoTotals.totalFaixas.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono">{anoTotals.totalAddresses.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Table 4: Ranking TOP 20 Corredores */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-50 px-4 sm:px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider">
                Ranking TOP 20 Corredores
              </h3>
              <p className="text-[11px] text-slate-500 font-normal">
                Corredores viários com maior volume de fiscalização
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-200/60 px-2.5 py-1 rounded-full">
            {corredorSummary.length} Corredores
          </span>
        </div>

        <div className="block sm:hidden text-[10.5px] text-slate-500 font-medium px-4 py-1.5 bg-slate-100/90 border-b border-slate-200">
          ↔ Deslize para os lados para ver todas as colunas
        </div>
        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full min-w-[640px] sm:min-w-0 text-left text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px] sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-4 py-3 text-center w-12">#</th>
                <th
                  scope="col"
                  onClick={() => handleCorredorTableSort('name')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Corredor</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleCorredorTableSort('count')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Equipamentos</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleCorredorTableSort('faixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleCorredorTableSort('tiposFormatted')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>TIPOS DE FISCALIZAÇÃO PRESENTE</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-slate-800">
              {corredorSummary.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">
                    Nenhum corredor encontrado para a seleção atual.
                  </td>
                </tr>
              ) : (
                corredorSummary.map((item, idx) => {
                  const isSelected = selectedChartCorredor === item.name;

                  return (
                    <tr
                      key={item.name}
                      onClick={() => handleCorredorClick(item.name)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-100 font-bold shadow-xs'
                          : idx % 2 === 0
                          ? 'bg-white hover:bg-amber-50/60'
                          : 'bg-slate-50/40 hover:bg-amber-50/60'
                      }`}
                      title={`Clique para ${isSelected ? 'remover filtro de' : 'filtrar por'} Corredor ${item.name}`}
                    >
                      <td className="px-4 py-3 text-center font-bold">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          idx === 0 ? 'bg-amber-100 text-amber-800 border border-amber-300 font-extrabold' :
                          idx === 1 ? 'bg-slate-200 text-slate-700 border border-slate-300' :
                          idx === 2 ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          'text-slate-500'
                        }`}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-amber-600 inline-block shrink-0" />}
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium text-slate-800">
                        {item.count.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-amber-700">
                        {item.faixas.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-slate-600 text-xs">
                        {item.tiposFormatted}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
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
        <div className="block lg:hidden text-[10.5px] text-slate-500 font-medium px-4 py-1.5 bg-slate-100/90 border-b border-slate-200">
          ↔ Deslize para os lados para ver todas as colunas
        </div>
        <div className="w-full overflow-x-auto min-h-[300px]">
          <table className="w-full min-w-[850px] lg:min-w-0 lg:table-fixed text-[11px] sm:text-xs text-center">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px] sm:text-[11px]">
              <tr>
                <th
                  onClick={() => handleSort('CÓDIGO')}
                  className="w-[8%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span>Código</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('CONTRATO')}
                  className="w-[8%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span>Contrato</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('TIPO')}
                  className="w-[9%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span>Tipo</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('FAIXAS')}
                  className="w-[5%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span>Faixas</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('ENDEREÇO COMPLETO')}
                  className="w-[43%] py-2.5 px-1.5 cursor-pointer hover:bg-slate-200 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span>Endereço Completo</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('BAIRRO')}
                  className="w-[12%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span>Bairro</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('Situação')}
                  className="w-[10%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-0.5">
                    <span>Situação</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                  </div>
                </th>
                <th className="w-[6%] py-2.5 px-1 text-center">Ações</th>
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
                    <td className="py-2 px-1 font-bold text-slate-900 group-hover:text-blue-700 text-center truncate">
                      {r.CÓDIGO || '-'}
                    </td>
                    <td className="py-2 px-1 font-medium text-slate-700 text-center truncate">
                      {r.CONTRATO || '-'}
                    </td>
                    <td className="py-2 px-1 text-center truncate">
                      <span className="inline-block bg-slate-100 text-slate-800 font-semibold px-1.5 py-0.5 rounded text-[10px] border border-slate-200 truncate max-w-full">
                        {r.TIPO || '-'}
                      </span>
                    </td>
                    <td className="py-2 px-1 text-center font-bold text-blue-700">
                      {r.FAIXAS}
                    </td>
                    <td className="py-2 px-1.5 text-center font-normal text-slate-800 break-words whitespace-normal leading-snug">
                      {r['ENDEREÇO COMPLETO'] || '-'}
                    </td>
                    <td className="py-2 px-1 text-slate-600 text-center break-words whitespace-normal leading-snug">
                      {r.BAIRRO || '-'}
                    </td>
                    <td className="py-2 px-1 text-center text-[10px] truncate">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-full font-medium truncate max-w-full border ${
                          r.Situação?.toLowerCase().includes('relocação') || r.Situação?.toLowerCase().includes('relocacao')
                            ? 'bg-purple-100 text-purple-800 border-purple-200/80 font-semibold'
                            : r.Situação?.toLowerCase().includes('em operação') || r.Situação?.toLowerCase().includes('em operacao') || r.Situação?.toLowerCase().includes('operação') || r.Situação?.toLowerCase().includes('operacao')
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80'
                            : r.Situação?.toLowerCase().includes('desligado')
                            ? 'bg-rose-100 text-rose-800 border-rose-200/80'
                            : 'bg-amber-100 text-amber-800 border-amber-200/80'
                        }`}
                      >
                        {r.Situação?.replace('\n', ' ') || '-'}
                      </span>
                    </td>
                    <td className="py-2 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-0.5">
                        <button
                          onClick={() => onSelectRecord && onSelectRecord(r)}
                          className="p-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors"
                          title="Ver Ficha Completa do Equipamento"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => exportSingleRecordPDF(r)}
                          className="p-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded transition-colors"
                          title="Exportar PDF deste registro"
                        >
                          <FileDown className="w-3 h-3" />
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

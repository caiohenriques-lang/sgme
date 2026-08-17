import React, { useState, useMemo } from 'react';
import { EquipmentRecord } from '../types';
import {
  FileSpreadsheet,
  Layers,
  MapPin,
  FileText,
  FileDown,
  Building2,
  ListFilter,
  CheckCircle2,
  ArrowUpDown,
  Award,
  Calendar
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SummaryViewProps {
  records: EquipmentRecord[];
}

type SummarySortField = 'label' | 'count' | 'faixas' | 'addresses' | 'pctEquip' | 'pctFaixas';
type CorredorSortField = 'name' | 'count' | 'faixas' | 'tiposFormatted';
type AnoSortField = 'ano' | 'count' | 'faixas' | 'pctFaixas';

export const SummaryView: React.FC<SummaryViewProps> = ({ records }) => {
  // Sort States
  const [contratoSortField, setContratoSortField] = useState<SummarySortField>('faixas');
  const [contratoSortOrder, setContratoSortOrder] = useState<'asc' | 'desc'>('desc');

  const [tipoSortField, setTipoSortField] = useState<SummarySortField>('faixas');
  const [tipoSortOrder, setTipoSortOrder] = useState<'asc' | 'desc'>('desc');

  const [corredorSortField, setCorredorSortField] = useState<CorredorSortField>('count');
  const [corredorSortOrder, setCorredorSortOrder] = useState<'asc' | 'desc'>('desc');

  const [anoSortField, setAnoSortField] = useState<AnoSortField>('ano');
  const [anoSortOrder, setAnoSortOrder] = useState<'asc' | 'desc'>('desc');

  // Overall Totals calculation for percentages
  const totalsRaw = useMemo(() => {
    const totalEquipments = records.length;
    const totalFaixas = records.reduce((acc, r) => acc + (r.FAIXAS || 0), 0);
    const uniqueAddressSet = new Set<string>();
    records.forEach((r) => {
      const addr = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();
      if (addr) uniqueAddressSet.add(addr);
    });

    return {
      equipments: totalEquipments,
      faixas: totalFaixas,
      addresses: uniqueAddressSet.size,
    };
  }, [records]);

  // 1. Group by CONTRATO
  const contratoSummary = useMemo(() => {
    const map = new Map<
      string,
      { contrato: string; faixas: number; addresses: Set<string>; count: number }
    >();

    records.forEach((r) => {
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
  }, [records, contratoSortField, contratoSortOrder]);

  // 2. Group by TIPO
  const tipoSummary = useMemo(() => {
    const map = new Map<
      string,
      { tipo: string; faixas: number; addresses: Set<string>; count: number }
    >();

    records.forEach((r) => {
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

      switch (tipoSortField) {
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
          valA = a.addresses.size;
          valB = b.addresses.size;
          break;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return tipoSortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return tipoSortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [records, tipoSortField, tipoSortOrder]);

  // 3. Group by CORREDOR (Ranking TOP 20)
  const corredorSummary = useMemo(() => {
    const map = new Map<
      string,
      { corredor: string; count: number; faixas: number; tiposMap: Map<string, number> }
    >();

    records.forEach((r) => {
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
  }, [records, corredorSortField, corredorSortOrder]);

  // Filter for equipments in operation (for Faixas Implantadas por Ano)
  const inOperationRecords = useMemo(() => {
    return records.filter((r) => {
      const sit = (r.Situação || '').trim().toUpperCase();
      return sit === 'EM OPERAÇÃO' || sit.includes('OPERAÇÃO');
    });
  }, [records]);

  const anoTotals = useMemo(() => {
    const totalEquip = inOperationRecords.length;
    const totalFaixas = inOperationRecords.reduce((acc, r) => acc + (r.FAIXAS || 0), 0);
    return { totalEquip, totalFaixas };
  }, [inOperationRecords]);

  // 4. Group by ANO (Faixas Implantadas por Ano - Apenas Equipamentos em Operação)
  const anoSummary = useMemo(() => {
    const map = new Map<string, { ano: string; faixas: number; count: number }>();

    inOperationRecords.forEach((r) => {
      const rawAno = (r.ANO || '').toString().trim();
      const key = rawAno || 'Não Informado';
      if (!map.has(key)) {
        map.set(key, { ano: key, faixas: 0, count: 0 });
      }
      const item = map.get(key)!;
      item.faixas += r.FAIXAS || 0;
      item.count += 1;
    });

    const list = Array.from(map.values());

    return list.sort((a, b) => {
      let valA: number | string = 0;
      let valB: number | string = 0;

      switch (anoSortField) {
        case 'ano':
          valA = a.ano;
          valB = b.ano;
          break;
        case 'count':
          valA = a.count;
          valB = b.count;
          break;
        case 'faixas':
        case 'pctFaixas':
          valA = a.faixas;
          valB = b.faixas;
          break;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return anoSortOrder === 'asc' ? valA - valB : valB - valA;
      }

      return anoSortOrder === 'asc'
        ? String(valA).localeCompare(String(valB), undefined, { numeric: true })
        : String(valB).localeCompare(String(valA), undefined, { numeric: true });
    });
  }, [inOperationRecords, anoSortField, anoSortOrder]);

  const totals = useMemo(() => ({
    ...totalsRaw,
    contratosCount: contratoSummary.length,
    tiposCount: tipoSummary.length,
    anosCount: anoSummary.length,
  }), [totalsRaw, contratoSummary.length, tipoSummary.length, anoSummary.length]);

  const handleContratoSort = (field: SummarySortField) => {
    if (contratoSortField === field) {
      setContratoSortOrder(contratoSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setContratoSortField(field);
      setContratoSortOrder('desc');
    }
  };

  const handleTipoSort = (field: SummarySortField) => {
    if (tipoSortField === field) {
      setTipoSortOrder(tipoSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setTipoSortField(field);
      setTipoSortOrder('desc');
    }
  };

  const handleCorredorSort = (field: CorredorSortField) => {
    if (corredorSortField === field) {
      setCorredorSortOrder(corredorSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setCorredorSortField(field);
      setCorredorSortOrder('desc');
    }
  };

  const handleAnoSort = (field: AnoSortField) => {
    if (anoSortField === field) {
      setAnoSortOrder(anoSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setAnoSortField(field);
      setAnoSortOrder('desc');
    }
  };

  // PDF Export for Resumo
  const handleExportPDF = async () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();

    // Helper to load logo
    let logoDataUrl: string | null = null;
    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || 520;
            canvas.height = img.naturalHeight || 130;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              logoDataUrl = canvas.toDataURL('image/png');
            }
          } catch (e) {
            console.warn('Canvas conversion failed', e);
          }
          resolve();
        };
        img.onerror = () => resolve();
        img.src = '/logo_pbh_bhtrans.png';
      });
    } catch (e) {
      console.warn('Logo load error', e);
    }

    // Header Banner
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 28, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(10, 27, pageWidth - 10, 27);

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, 'PNG', pageWidth - 10 - 50, 7, 50, 12.5);
      } catch (e) {
        console.warn('Add image failed', e);
      }
    }

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('GERÊNCIA DE ANÁLISE E PROCESSAMENTO DE INFRAÇÕES - GEAPI', 10, 9);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text('Fiscalização Eletrônica — Relatório de Resumo Gerencial', 10, 15);

    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Total de equipamentos: ${totals.equipments} | Total de Faixas: ${totals.faixas} | Endereços Únicos: ${totals.addresses} | Gerado em: ${new Date().toLocaleString('pt-BR')}`, 10, 22);

    // Table 1: Por Contrato
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('1. RESUMO POR CONTRATO', 10, 33);

    const contratoHead = [['Contrato', 'Qtd. Equipamentos', 'Qtd. Faixas (Soma)', 'Endereços Únicos', '% Equip.', '% Faixas']];
    const contratoBody = contratoSummary.map((item) => [
      item.contrato,
      item.count.toLocaleString('pt-BR'),
      item.faixas.toLocaleString('pt-BR'),
      item.addresses.size.toLocaleString('pt-BR'),
      totals.equipments > 0 ? `${((item.count / totals.equipments) * 100).toFixed(1)}%` : '0%',
      totals.faixas > 0 ? `${((item.faixas / totals.faixas) * 100).toFixed(1)}%` : '0%',
    ]);
    contratoBody.push([
      'TOTAL GERAL',
      totals.equipments.toLocaleString('pt-BR'),
      totals.faixas.toLocaleString('pt-BR'),
      totals.addresses.toLocaleString('pt-BR'),
      '100%',
      '100%',
    ]);

    autoTable(doc, {
      startY: 36,
      head: contratoHead,
      body: contratoBody,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 10, right: 10 },
      didParseCell: (data) => {
        if (data.row.index === contratoBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [226, 232, 240];
          data.cell.styles.textColor = [15, 23, 42];
        }
      },
    });

    // Table 2: Por Tipo
    const finalY = (doc as any).lastAutoTable.finalY || 100;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('2. RESUMO POR TIPO DE EQUIPAMENTO', 10, finalY + 8);

    const tipoHead = [['Tipo de Equipamento', 'Qtd. Equipamentos', 'Qtd. Faixas (Soma)', 'Endereços Únicos', '% Equip.', '% Faixas']];
    const tipoBody = tipoSummary.map((item) => [
      item.tipo,
      item.count.toLocaleString('pt-BR'),
      item.faixas.toLocaleString('pt-BR'),
      item.addresses.size.toLocaleString('pt-BR'),
      totals.equipments > 0 ? `${((item.count / totals.equipments) * 100).toFixed(1)}%` : '0%',
      totals.faixas > 0 ? `${((item.faixas / totals.faixas) * 100).toFixed(1)}%` : '0%',
    ]);
    tipoBody.push([
      'TOTAL GERAL',
      totals.equipments.toLocaleString('pt-BR'),
      totals.faixas.toLocaleString('pt-BR'),
      totals.addresses.toLocaleString('pt-BR'),
      '100%',
      '100%',
    ]);

    autoTable(doc, {
      startY: finalY + 11,
      head: tipoHead,
      body: tipoBody,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 10, right: 10 },
      didParseCell: (data) => {
        if (data.row.index === tipoBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [226, 232, 240];
          data.cell.styles.textColor = [15, 23, 42];
        }
      },
    });

    // Table 3: Ranking TOP 20 Corredores
    const finalY2 = (doc as any).lastAutoTable.finalY || 180;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('3. RANKING TOP 20 CORREDORES', 10, finalY2 + 8);

    const corredorHead = [['#', 'Corredor', 'Qtd. de Equipamentos', 'Qtd. de Faixas', 'TIPOS DE FISCALIZAÇÃO PRESENTE']];
    const corredorBody = corredorSummary.map((item, index) => [
      String(index + 1),
      item.name,
      item.count.toLocaleString('pt-BR'),
      item.faixas.toLocaleString('pt-BR'),
      item.tiposFormatted,
    ]);

    autoTable(doc, {
      startY: finalY2 + 11,
      head: corredorHead,
      body: corredorBody,
      theme: 'striped',
      headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 10, right: 10 },
    });

    // Table 4: Faixas Implantadas por Ano (Apenas Equipamentos em Operação)
    const finalY3 = (doc as any).lastAutoTable.finalY || 220;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('4. FAIXAS IMPLANTADAS POR ANO (Apenas Equipamentos em Operação)', 10, finalY3 + 8);

    const anoHead = [['Ano de Implantação', 'Qtd. Equipamentos', 'Qtd. Faixas (Soma)', '% Faixas']];
    const anoBody = anoSummary.map((item) => [
      item.ano,
      item.count.toLocaleString('pt-BR'),
      item.faixas.toLocaleString('pt-BR'),
      anoTotals.totalFaixas > 0 ? `${((item.faixas / anoTotals.totalFaixas) * 100).toFixed(1)}%` : '0%',
    ]);
    anoBody.push([
      'TOTAL GERAL',
      anoTotals.totalEquip.toLocaleString('pt-BR'),
      anoTotals.totalFaixas.toLocaleString('pt-BR'),
      '100%',
    ]);

    autoTable(doc, {
      startY: finalY3 + 11,
      head: anoHead,
      body: anoBody,
      theme: 'striped',
      headStyles: { fillColor: [147, 51, 234], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 10, right: 10 },
      didParseCell: (data) => {
        if (data.row.index === anoBody.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [226, 232, 240];
          data.cell.styles.textColor = [15, 23, 42];
        }
      },
    });

    doc.save(`GEAPI-Resumo-Gerencial-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Bar with Export Action */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Resumo Gerencial e Consolidado
              </h2>
              <p className="text-xs text-slate-500">
                Visão consolidada por Contrato e por Tipo de Equipamento
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl transition-all shadow-xs hover:shadow cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Exportar Resumo em PDF</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Total Equipamentos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              QUANTIDADE DE EQUIPAMENTOS
            </span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {totals.equipments.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-slate-500 font-medium">equipamentos</span>
          </div>
        </div>

        {/* Card 2: Total Faixas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              FAIXAS FISCALIZADAS
            </span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
              <ListFilter className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {totals.faixas.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-slate-500 font-medium">faixas monitoradas</span>
          </div>
        </div>

        {/* Card 3: Endereços Únicos */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-shadow sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ENDEREÇOS FISCALIZADOS
            </span>
            <span className="p-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <MapPin className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
              {totals.addresses.toLocaleString('pt-BR')}
            </span>
            <span className="text-xs text-slate-500 font-medium">endereços completos</span>
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
            {contratoSummary.length} contratos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  scope="col"
                  onClick={() => handleContratoSort('label')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Contrato</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleContratoSort('count')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Qtd. Equipamentos (Código)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleContratoSort('faixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Qtd. Faixas (Soma)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleContratoSort('addresses')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Endereços Únicos</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleContratoSort('pctEquip')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Equip.</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleContratoSort('pctFaixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-slate-800">
              {contratoSummary.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                contratoSummary.map((item, idx) => {
                  const pctEquip = totals.equipments > 0 ? (item.count / totals.equipments) * 100 : 0;
                  const pctFaixas = totals.faixas > 0 ? (item.faixas / totals.faixas) * 100 : 0;

                  return (
                    <tr key={item.contrato} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 hover:bg-slate-50/90'}>
                      <td className="px-4 py-3 font-semibold text-slate-900 text-center">
                        {item.contrato}
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
                    </tr>
                  );
                })
              )}
            </tbody>
            {contratoSummary.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-xs">
                <tr>
                  <td className="px-4 py-3 uppercase text-center">Total Geral</td>
                  <td className="px-4 py-3 text-center font-mono">{totals.equipments.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono text-blue-800">{totals.faixas.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono">{totals.addresses.toLocaleString('pt-BR')}</td>
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
            {tipoSummary.length} tipos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  scope="col"
                  onClick={() => handleTipoSort('label')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Tipo de Equipamento</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleTipoSort('count')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Qtd. Equipamentos (Código)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleTipoSort('faixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Qtd. Faixas (Soma)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleTipoSort('addresses')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Endereços Únicos</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleTipoSort('pctEquip')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Equip.</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleTipoSort('pctFaixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-slate-800">
              {tipoSummary.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                tipoSummary.map((item, idx) => {
                  const pctEquip = totals.equipments > 0 ? (item.count / totals.equipments) * 100 : 0;
                  const pctFaixas = totals.faixas > 0 ? (item.faixas / totals.faixas) * 100 : 0;

                  return (
                    <tr key={item.tipo} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 hover:bg-slate-50/90'}>
                      <td className="px-4 py-3 font-semibold text-slate-900 text-center">
                        {item.tipo}
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
                    </tr>
                  );
                })
              )}
            </tbody>
            {tipoSummary.length > 0 && (
              <tfoot className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300 text-xs">
                <tr>
                  <td className="px-4 py-3 uppercase text-center">Total Geral</td>
                  <td className="px-4 py-3 text-center font-mono">{totals.equipments.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono text-emerald-800">{totals.faixas.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono">{totals.addresses.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Table 3: Faixas Implantadas por Ano */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
              <Calendar className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Faixas Implantadas por Ano
              </h3>
              <p className="text-xs text-slate-500">
                Exibindo quantitativos apenas para equipamentos em operação e considerando o ano de início de operação.
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200 self-start sm:self-auto">
            {anoSummary.length} anos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th
                  scope="col"
                  onClick={() => handleAnoSort('ano')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Ano</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleAnoSort('count')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Qtd. Equipamentos</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleAnoSort('faixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Qtd. Faixas (Somatório)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleAnoSort('pctFaixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>% Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-slate-800">
              {anoSummary.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 italic">
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                anoSummary.map((item, idx) => {
                  const pctFaixas = anoTotals.totalFaixas > 0 ? (item.faixas / anoTotals.totalFaixas) * 100 : 0;

                  return (
                    <tr key={item.ano} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 hover:bg-slate-50/90'}>
                      <td className="px-4 py-3 font-semibold text-slate-900 text-center">
                        {item.ano}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-medium text-slate-800">
                        {item.count.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono font-bold text-purple-700">
                        {item.faixas.toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-slate-600">
                        {pctFaixas.toFixed(1)}%
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
                  <td className="px-4 py-3 text-center font-mono">100.0%</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Table 3: Ranking TOP 20 Corredores */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
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

        <div className="overflow-x-auto max-h-96 overflow-y-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px] sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-4 py-3 text-center w-12">#</th>
                <th
                  scope="col"
                  onClick={() => handleCorredorSort('name')}
                  className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Corredor</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleCorredorSort('count')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Qtd. de Equipamentos</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleCorredorSort('faixas')}
                  className="px-4 py-3 text-center cursor-pointer hover:bg-slate-200/80 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Qtd. de Faixas</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  onClick={() => handleCorredorSort('tiposFormatted')}
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
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                corredorSummary.map((item, idx) => (
                  <tr key={item.name} className={idx % 2 === 0 ? 'bg-white hover:bg-slate-50/80' : 'bg-slate-50/40 hover:bg-slate-50/90'}>
                    <td className="px-4 py-3 text-center font-bold text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-amber-700">{item.count.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-blue-700">{item.faixas.toLocaleString('pt-BR')}</td>
                    <td className="px-4 py-3 text-slate-600 font-mono text-[11px] truncate max-w-md">{item.tiposFormatted}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

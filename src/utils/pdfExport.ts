import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { EquipmentRecord, FilterState } from '../types';
import { captureMap } from './mapExport';

let cachedLogoDataUrl: string | null = null;

async function captureChartCard(elementId: string): Promise<string | null> {
  const el = document.getElementById(elementId);
  if (!el) {
    console.warn(`Elemento #${elementId} não encontrado.`);
    return null;
  }

  try {
    const origSvg = el.querySelector('svg.recharts-surface') || el.querySelector('svg');
    const titleEl = el.querySelector('h3');
    const title = titleEl ? titleEl.textContent?.trim() || '' : '';

    if (origSvg) {
      const rect = origSvg.getBoundingClientRect();
      const svgWidth = origSvg.clientWidth || rect.width || 360;
      const svgHeight = origSvg.clientHeight || rect.height || 260;

      const clonedSvg = origSvg.cloneNode(true) as SVGSVGElement;
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('width', String(svgWidth));
      clonedSvg.setAttribute('height', String(svgHeight));

      // Inject standard typography style for texts in standalone SVG
      const styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      styleEl.textContent = `
        text {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
        }
      `;
      clonedSvg.insertBefore(styleEl, clonedSvg.firstChild);

      const svgXml = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      return new Promise<string | null>((resolve) => {
        const img = new Image();

        img.onload = () => {
          try {
            const scale = 2;
            const cardWidth = Math.max(svgWidth + 32, el.offsetWidth || 400);
            const cardHeight = Math.max(svgHeight + 60, el.offsetHeight || 320);

            const canvas = document.createElement('canvas');
            canvas.width = cardWidth * scale;
            canvas.height = cardHeight * scale;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
              URL.revokeObjectURL(url);
              resolve(null);
              return;
            }

            // White Card Background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Card Border
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1 * scale;
            ctx.strokeRect(0, 0, canvas.width, canvas.height);

            // Header Title
            if (title) {
              ctx.fillStyle = '#0f172a';
              ctx.font = `bold ${13 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`;
              ctx.fillText(title, 16 * scale, 24 * scale);

              // Title Divider Line
              ctx.strokeStyle = '#f1f5f9';
              ctx.lineWidth = 1 * scale;
              ctx.beginPath();
              ctx.moveTo(16 * scale, 34 * scale);
              ctx.lineTo((cardWidth - 16) * scale, 34 * scale);
              ctx.stroke();
            }

            // Draw SVG Chart Centered
            const drawX = Math.max(8 * scale, ((cardWidth - svgWidth) / 2) * scale);
            const drawY = title ? 40 * scale : 12 * scale;
            ctx.drawImage(img, drawX, drawY, svgWidth * scale, svgHeight * scale);

            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            URL.revokeObjectURL(url);
            resolve(dataUrl);
          } catch (e) {
            console.error(`Erro ao renderizar canvas para #${elementId}:`, e);
            URL.revokeObjectURL(url);
            resolve(null);
          }
        };

        img.onerror = (e) => {
          console.error(`Erro ao carregar imagem SVG para #${elementId}:`, e);
          URL.revokeObjectURL(url);
          resolve(null);
        };

        img.src = url;
      });
    }

    // Fallback: sanitized html2canvas if no SVG exists
    const canvas = await html2canvas(el, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      onclone: (clonedDoc) => {
        const styleTags = clonedDoc.querySelectorAll('style');
        styleTags.forEach((style) => {
          if (style.textContent && style.textContent.includes('oklch')) {
            style.textContent = style.textContent.replace(/oklch\([^)]+\)/g, '#64748b');
          }
        });
      },
    });

    return canvas.toDataURL('image/jpeg', 0.95);
  } catch (err) {
    console.error(`Erro ao capturar card #${elementId}:`, err);
    return null;
  }
}

export async function captureIndicatorsCharts(): Promise<{
  cardContratoFaixas: string | null;
  cardContratoEquip: string | null;
  cardContratoLocais: string | null;
  cardTipoFaixas: string | null;
  cardTipoLocais: string | null;
}> {
  try {
    // Aguarda a renderização e estabilização dos gráficos Recharts
    await new Promise((resolve) => setTimeout(resolve, 300));

    const [
      cardContratoFaixas,
      cardContratoEquip,
      cardContratoLocais,
      cardTipoFaixas,
      cardTipoLocais,
    ] = await Promise.all([
      captureChartCard('chart-card-contrato-faixas'),
      captureChartCard('chart-card-contrato-equip'),
      captureChartCard('chart-card-contrato-locais'),
      captureChartCard('chart-card-tipo-faixas'),
      captureChartCard('chart-card-tipo-locais'),
    ]);

    return {
      cardContratoFaixas,
      cardContratoEquip,
      cardContratoLocais,
      cardTipoFaixas,
      cardTipoLocais,
    };
  } catch (err) {
    console.error('Falha geral ao capturar gráficos dos indicadores:', err);
    return {
      cardContratoFaixas: null,
      cardContratoEquip: null,
      cardContratoLocais: null,
      cardTipoFaixas: null,
      cardTipoLocais: null,
    };
  }
}

async function getLogoDataUrl(): Promise<string | null> {
  if (cachedLogoDataUrl) return cachedLogoDataUrl;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || 520;
        canvas.height = img.naturalHeight || 130;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          // Standard PNG data URL generated by browser canvas
          cachedLogoDataUrl = canvas.toDataURL('image/png');
          resolve(cachedLogoDataUrl);
          return;
        }
      } catch (err) {
        console.warn('Erro ao converter logo no canvas:', err);
      }
      resolve(null);
    };
    img.onerror = () => resolve(null);
    img.src = '/logo_pbh_bhtrans.png';
  });
}

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch {
    return dateStr;
  }
};

const addCustomFooter = (doc: any, pageWidth: number, pageHeight: number, pageNumText?: string) => {
  const footerHeight = 16;
  doc.setFillColor(248, 250, 252);
  doc.rect(0, pageHeight - footerHeight, pageWidth, footerHeight, 'F');
  
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.setFont('helvetica', 'normal');
  
  doc.text('GEAPI — Gerência de Análise e Processamento de Infrações | Prefeitura de Belo Horizonte', 12, pageHeight - 10);
  doc.text('Desenvolvido por Caio Henriques de O. L. Cordeiro - caiohenriques@pbh.gov.br', 12, pageHeight - 6);
  doc.text('https://geapife.vercel.app/', 12, pageHeight - 2);

  if (pageNumText) {
    doc.text(pageNumText, pageWidth - 12, pageHeight - 6, { align: 'right' });
  }
};

export async function exportSingleRecordPDF(record: EquipmentRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const logoDataUrl = await getLogoDataUrl();

  // White Header Background
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 30, 'F');

  // Bottom border line for header
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(10, 29, pageWidth - 10, 29);

  // Top Right Logo Timbre (PNG)
  if (logoDataUrl) {
    try {
      const logoWidth = 48;
      const logoHeight = 12;
      const logoX = pageWidth - 12 - logoWidth;
      doc.addImage(logoDataUrl, 'PNG', logoX, 8, logoWidth, logoHeight);
    } catch (e) {
      console.warn('Não foi possível renderizar a logo no PDF:', e);
    }
  }

  // Header Text Width Calculation to avoid logo collision
  const maxTextWidth = logoDataUrl ? pageWidth - 12 - 48 - 16 : pageWidth - 24;

  // GEAPI Title
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GERÊNCIA DE ANÁLISE E PROCESSAMENTO DE INFRAÇÕES - GEAPI', 12, 10, { maxWidth: maxTextWidth });

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text('Fiscalização Eletrônica — Ficha Detalhada do Equipamento', 12, 17, { maxWidth: maxTextWidth });

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Código: ${record.CÓDIGO || 'N/A'} | Contrato: ${record.CONTRATO || 'N/A'} | Gerado em: ${new Date().toLocaleString('pt-BR')}`, 12, 24, { maxWidth: maxTextWidth });

  // Categorized Table Data - Filter out empty / null fields completely
  const rawCategories = [
    {
      title: 'Identificação & Contrato',
      fields: [
        ['CONTRATO', record.CONTRATO],
        ['CONTRATADA', record.CONTRATADA],
        ['CÓDIGO', record.CÓDIGO],
        ['Nº DE SÉRIE', record['Nº DE SÉRIE']],
      ]
    },
    {
      title: 'Localização & Georreferenciamento',
      fields: [
        ['CÓDIGO DO LOGRADOURO', record['COD LOG']],
        ['ENDEREÇO', record['ENDEREÇOS DOS EQUIPAMENTOS'] || record['ENDEREÇO COMPLETO']],
        ['SENTIDO', record.SENTIDO],
        ['BAIRRO', record.BAIRRO],
        ['REGIONAL', record.REGIONAL],
        ['COORDENADAS GEOGRÁFICAS', record.COORD_LAT_LONG],
      ]
    },
    {
      title: 'Especificações Técnicas e Operação',
      fields: [
        ['TIPO', record.TIPO],
        ['FAIXAS', record.FAIXAS ? String(record.FAIXAS) : ''],
        ['VELOCIDADE FISCALIZADA', record['Velocidade Fiscalizada']],
        ['SITUAÇÃO', record.Situação],
        ['CONDIÇÃO', record.CONDIÇÃO],
        ['DIF PAREADO', record['DIF Pareado']],
        ['OS', record.OS],
        ['REGISTRO DE OBJETO', (record.TIPO || '').toUpperCase().trim() === 'CEV' ? '' : (record['REG. OBJ'] || record.rawFields?.['REG. OBJ'] || record.rawFields?.['REG. OBJ.'] || '')],
      ]
    },
    {
      title: 'Datas Importantes',
      fields: [
        ['INÍCIO DE OPERAÇÃO', record['Data início operação']],
        ['ACEITE', record['Data de aceite']],
        ['AFERIÇÃO', record['Data da Aferição']],
        ['VENCIMENTO DA AFERIÇÃO', record['Data de Vencimento da Aferição']],
        ['OBSERVAÇÕES', record.Observações],
      ]
    }
  ];

  let startY = 34;

  rawCategories.forEach((cat) => {
    // Only keep non-empty fields
    const validFields = cat.fields.filter(([_, val]) => {
      if (val === undefined || val === null) return false;
      const str = String(val).trim();
      return str !== '' && str !== '-' && str !== '(Vazio)';
    });

    // Skip section if no valid data
    if (validFields.length === 0) return;

    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(12, startY, pageWidth - 24, 6.5, 'F');
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(cat.title.toUpperCase(), 14, startY + 4.5);

    startY += 7.5;

    autoTable(doc, {
      startY: startY,
      margin: { left: 12, right: 12 },
      head: [['Campo', 'Valor']],
      body: validFields.map(([label, val]) => [label, String(val).trim()]),
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        cellPadding: 2
      },
      bodyStyles: {
        fontSize: 8,
        textColor: 51,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 55, fontStyle: 'bold', fillColor: [248, 250, 252] },
        1: { cellWidth: 'auto' }
      }
    });

    startY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 5;
  });

  // Footer Legend
  const pageHeight = doc.internal.pageSize.getHeight();
  addCustomFooter(doc, pageWidth, pageHeight, 'Página 1 de 1');

  doc.save(`GEAPI-Equipamento-${record.CÓDIGO || record.id}.pdf`);
}

export async function exportFilteredRecordsPDF(records: EquipmentRecord[], filterSummary?: string) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const logoDataUrl = await getLogoDataUrl();

  // White Header Banner
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(10, 27, pageWidth - 10, 27);

  // Top Right Logo Timbre (PNG)
  if (logoDataUrl) {
    try {
      const logoWidth = 50;
      const logoHeight = 12.5;
      const logoX = pageWidth - 10 - logoWidth;
      doc.addImage(logoDataUrl, 'PNG', logoX, 7, logoWidth, logoHeight);
    } catch (e) {
      console.warn('Não foi possível renderizar a logo no PDF:', e);
    }
  }

  // Text width limit to avoid logo overlay
  const maxTextWidth = logoDataUrl ? pageWidth - 10 - 50 - 15 : pageWidth - 20;

  // GEAPI Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GERÊNCIA DE ANÁLISE E PROCESSAMENTO DE INFRAÇÕES - GEAPI', 10, 9, { maxWidth: maxTextWidth });

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('Fiscalização Eletrônica — Relatório Compilado de Equipamentos', 10, 15, { maxWidth: maxTextWidth });

  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`Total de registros: ${records.length} | Exportado em: ${new Date().toLocaleString('pt-BR')} ${filterSummary ? '| Filtros: ' + filterSummary : ''}`, 10, 22, { maxWidth: maxTextWidth });

  // Table columns
  const tableHead = [
    'CONTRATO',
    'CÓDIGO',
    'ENDEREÇO COMPLETO',
    'BAIRRO',
    'REGIONAL',
    'TIPO',
    'FAIXAS',
    'INÍCIO DE OPERAÇÃO',
    'OS',
    'CONDIÇÃO',
    'SITUAÇÃO'
  ];

  const tableBody = records.map((r) => [
    r.CONTRATO?.trim() || '-',
    r.CÓDIGO?.trim() || '-',
    r['ENDEREÇO COMPLETO']?.trim() || '-',
    r.BAIRRO?.trim() || '-',
    r.REGIONAL?.trim() || '-',
    r.TIPO?.trim() || '-',
    r.FAIXAS ? String(r.FAIXAS) : '-',
    r['Data início operação']?.trim() || '-',
    r.OS?.trim() || '-',
    r.CONDIÇÃO?.trim() || '-',
    r.Situação?.trim() || '-'
  ]);

  autoTable(doc, {
    startY: 30,
    margin: { left: 10, right: 10, top: 30, bottom: 18 },
    head: [tableHead],
    body: tableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59], // slate-800 header to complement white background
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      cellPadding: 2
    },
    bodyStyles: {
      fontSize: 7,
      textColor: 51,
      cellPadding: 1.5
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 18 }, // Contrato
      1: { halign: 'center', fontStyle: 'bold', cellWidth: 18 }, // Código
      2: { halign: 'left' }, // Endereço Completo (auto wrap)
      3: { halign: 'center', cellWidth: 26 }, // Bairro
      4: { halign: 'center', cellWidth: 20 }, // Regional
      5: { halign: 'center', cellWidth: 16 }, // Tipo
      6: { halign: 'center', fontStyle: 'bold', textColor: [37, 99, 235], cellWidth: 14 }, // Faixas
      7: { halign: 'center', cellWidth: 22 }, // Início de Operação
      8: { halign: 'center', cellWidth: 16 }, // OS
      9: { halign: 'center', cellWidth: 20 }, // Condição
      10: { halign: 'center', cellWidth: 22 }, // Situação
    },
    didDrawPage: (data) => {
      // Draw top header banner & logo timbre on page 2 and beyond
      if (data.pageNumber > 1) {
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, pageWidth, 28, 'F');

        doc.setDrawColor(226, 232, 240);
        doc.setLineWidth(0.5);
        doc.line(10, 27, pageWidth - 10, 27);

        if (logoDataUrl) {
          try {
            const logoWidth = 50;
            const logoHeight = 12.5;
            const logoX = pageWidth - 10 - logoWidth;
            doc.addImage(logoDataUrl, 'PNG', logoX, 7, logoWidth, logoHeight);
          } catch (e) {
            console.warn('Não foi possível renderizar a logo no PDF:', e);
          }
        }

        doc.setTextColor(15, 23, 42);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('GERÊNCIA DE ANÁLISE E PROCESSAMENTO DE INFRAÇÕES - GEAPI', 10, 9, { maxWidth: maxTextWidth });

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        doc.text('Fiscalização Eletrônica — Relatório Compilado de Equipamentos', 10, 15, { maxWidth: maxTextWidth });

        doc.setFontSize(7.5);
        doc.setTextColor(100, 116, 139);
        doc.text(`Página ${data.pageNumber} | Total de registros: ${records.length}`, 10, 22, { maxWidth: maxTextWidth });
      }

      addCustomFooter(doc, pageWidth, doc.internal.pageSize.getHeight(), `Página ${data.pageNumber}`);
    }
  });

  doc.save(`GEAPI-Relatorio-Equipamentos-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function exportCustomReportPDF(records: EquipmentRecord[], filtersApplied: any) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  
  let logoDataUrl = null;
  try {
    logoDataUrl = await getLogoDataUrl();
  } catch (e) {
    console.warn('Could not load logo for PDF', e);
  }

  // ----------- PAGE 1: RESUMO EXECUTIVO -----------
  // Bottom border line for header
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.5);
  doc.line(10, 29, pageWidth - 10, 29);

  // Top Right Logo Timbre (PNG)
  if (logoDataUrl) {
    try {
      const logoWidth = 48;
      const logoHeight = 12;
      const logoX = pageWidth - 12 - logoWidth;
      doc.addImage(logoDataUrl, 'PNG', logoX, 8, logoWidth, logoHeight);
    } catch (e) {}
  }

  const maxTextWidth = logoDataUrl ? pageWidth - 12 - 48 - 16 : pageWidth - 24;
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('GERÊNCIA DE ANÁLISE E PROCESSAMENTO DE INFRAÇÕES - GEAPI', 12, 10, { maxWidth: maxTextWidth });
  
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('RESUMO EXECUTIVO - INDICADORES', 12, 17, { maxWidth: maxTextWidth });
  
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')} | Total de Equipamentos: ${records.length}`, 12, 24, { maxWidth: maxTextWidth });

  // Filters Summary
  let cursorY = 36;
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('DISCLAIMER: Este relatório apresenta os dados consolidados das seleções feitas no filtro conforme a seguir.', 12, cursorY);
  cursorY += 8;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Filtros Aplicados', 12, cursorY);
  cursorY += 6;

  doc.setFontSize(9);
  const activeFilters: { label: string; value: string }[] = [];
  if (filtersApplied.codigo) activeFilters.push({ label: 'Códigos', value: filtersApplied.codigo });
  if (filtersApplied.corredores && filtersApplied.corredores.length > 0) activeFilters.push({ label: 'Corredores', value: filtersApplied.corredores.join(', ') });
  if (filtersApplied.contratos && filtersApplied.contratos.length > 0) activeFilters.push({ label: 'Contratos', value: filtersApplied.contratos.join(', ') });
  if (filtersApplied.situacoes && filtersApplied.situacoes.length > 0) activeFilters.push({ label: 'Status do equip.', value: filtersApplied.situacoes.join(', ') });
  if (filtersApplied.condicoes && filtersApplied.condicoes.length > 0) activeFilters.push({ label: 'Situações', value: filtersApplied.condicoes.join(', ') });
  if (filtersApplied.regionais && filtersApplied.regionais.length > 0) activeFilters.push({ label: 'Regionais', value: filtersApplied.regionais.join(', ') });
  if (filtersApplied.bairros && filtersApplied.bairros.length > 0) activeFilters.push({ label: 'Bairros', value: filtersApplied.bairros.join(', ') });
  if (filtersApplied.tipos && filtersApplied.tipos.length > 0) activeFilters.push({ label: 'Tipo de equip.', value: filtersApplied.tipos.join(', ') });
  if (filtersApplied.os && filtersApplied.os.length > 0) activeFilters.push({ label: 'Nº O.S.', value: filtersApplied.os.join(', ') });
  
  if (filtersApplied.inicioOp && (filtersApplied.inicioOp.de || filtersApplied.inicioOp.ate)) {
    activeFilters.push({ label: 'Início de Operação', value: `${filtersApplied.inicioOp.de || '---'} até ${filtersApplied.inicioOp.ate || '---'}` });
  }
  if (filtersApplied.aceite && (filtersApplied.aceite.de || filtersApplied.aceite.ate)) {
    activeFilters.push({ label: 'Aceite', value: `${filtersApplied.aceite.de || '---'} até ${filtersApplied.aceite.ate || '---'}` });
  }

  if (activeFilters.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Relatório Global (Nenhum filtro aplicado)', 12, cursorY);
    cursorY += 6;
  } else {
    let fCol = 0;
    activeFilters.forEach((f) => {
      let x = 12 + (fCol * 95);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(f.label + ':', x, cursorY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105);
      let val = doc.splitTextToSize(f.value, 95 - doc.getTextWidth(f.label + ': ') - 2);
      doc.text(val[0] || '', x + doc.getTextWidth(f.label + ': ') + 1, cursorY);
      
      fCol++;
      if (fCol > 1) {
        fCol = 0;
        cursorY += 5;
      }
    });
    if (fCol !== 0) cursorY += 5;
  }
  cursorY += 2;
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.5);
  doc.line(10, cursorY, pageWidth - 10, cursorY);
  cursorY += 6;

  // Calculando Indicadores (Igual à aba Indicadores)
  let totalFaixas = 0;
  const locaisUnicos = new Set<string>();
  
  let equipmentsOperacao = 0;
  let equipmentsImplantacao = 0;
  let equipmentsRelocacao = 0;

  const contratoStats = new Map<string, { count: number; faixas: number; locais: Set<string> }>();
  const tipoStats = new Map<string, { count: number; faixas: number; locais: Set<string> }>();

  records.forEach(r => {
    const fx = (r.FAIXAS || 0);
    totalFaixas += fx;
    
    const end = (r['ENDEREÇO COMPLETO'] || '').trim().toLowerCase();
    if (end) locaisUnicos.add(end);
    
    const sit = (r.Situação || '').toUpperCase();
    if (sit.includes('OPERAÇÃO') || sit.includes('OPERACAO')) equipmentsOperacao += 1;
    else if (sit.includes('RELOCAÇÃO') || sit.includes('RELOCACAO')) equipmentsRelocacao += 1;
    else equipmentsImplantacao += 1;
    
    const cont = r.CONTRATO || 'Sem Contrato';
    if (!contratoStats.has(cont)) contratoStats.set(cont, { count: 0, faixas: 0, locais: new Set() });
    const cStat = contratoStats.get(cont)!;
    cStat.count += 1;
    cStat.faixas += fx;
    if (end) cStat.locais.add(end);

    const tip = r.TIPO || 'Sem Tipo';
    if (!tipoStats.has(tip)) tipoStats.set(tip, { count: 0, faixas: 0, locais: new Set() });
    const tStat = tipoStats.get(tip)!;
    tStat.count += 1;
    tStat.faixas += fx;
    if (end) tStat.locais.add(end);
  });

  // KPI boxes (4 boxes like Indicadores)
  const boxWidth = 43;
  
  // 1. Total Equipamentos
  const cX1 = 12 + (boxWidth / 2);
  doc.setDrawColor(191, 219, 254);
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(12, cursorY, boxWidth, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text(String(records.length), cX1, cursorY + 7.5, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Equipamentos', cX1, cursorY + 12.5, { align: 'center' });

  // 2. Total Faixas
  const cX2 = 12 + boxWidth + 4 + (boxWidth / 2);
  doc.setDrawColor(167, 243, 208);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(12 + boxWidth + 4, cursorY, boxWidth, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text(String(totalFaixas), cX2, cursorY + 7.5, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Faixas Fiscalizadas', cX2, cursorY + 12.5, { align: 'center' });

  // 3. Locais Unicos
  const cX3 = 12 + (boxWidth * 2) + 8 + (boxWidth / 2);
  doc.setDrawColor(253, 230, 138);
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(12 + (boxWidth * 2) + 8, cursorY, boxWidth, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(217, 119, 6);
  doc.text(String(locaisUnicos.size), cX3, cursorY + 7.5, { align: 'center' });
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Locais Únicos', cX3, cursorY + 12.5, { align: 'center' });

  // 4. Indicadores Situacao
  const cX4 = 12 + (boxWidth * 3) + 12 + (boxWidth / 2);
  doc.setDrawColor(233, 213, 255);
  doc.setFillColor(250, 245, 255);
  doc.roundedRect(12 + (boxWidth * 3) + 12, cursorY, boxWidth, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text('Status Operacional', cX4, cursorY + 5.2, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Operação: ${equipmentsOperacao}`, cX4, cursorY + 9.5, { align: 'center' });
  doc.text(`Reloc.: ${equipmentsRelocacao} | Impl.: ${equipmentsImplantacao}`, cX4, cursorY + 13.5, { align: 'center' });

  cursorY += 24;

  // Gráficos de Indicadores
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Painel de Indicadores (Gráficos)', 12, cursorY);
  cursorY += 6;

  // Function to render a horizontal bar chart
  const renderHorizontalChart = (title: string, data: {label: string, val: number}[], xPos: number, yPos: number, cWidth: number, color: [number, number, number]) => {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(title, xPos, yPos);
    
    if (data.length === 0) return;
    const maxVal = Math.max(...data.map(d => d.val), 1);
    
    let cY = yPos + 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    data.forEach((item) => {
      doc.setTextColor(71, 85, 105);
      const label = item.label.substring(0, 18);
      doc.text(label, xPos, cY + 3);
      
      const barX = xPos + 22;
      const maxBarW = cWidth - 32;
      const barW = (item.val / maxVal) * maxBarW;
      
      doc.setFillColor(...color);
      doc.rect(barX, cY - 0.5, barW, 3.5, 'F');
      
      doc.setTextColor(15, 23, 42);
      doc.text(String(item.val), barX + barW + 1.5, cY + 3);
      cY += 6;
    });
  };

  // Prepare Data - Ordenado Alfabeticamente para Contrato!
  const contArray = Array.from(contratoStats.entries()).sort((a,b) => a[0].localeCompare(b[0]));
  const tipoArray = Array.from(tipoStats.entries()).sort((a,b) => b[1].faixas - a[1].faixas).slice(0, 5); // top 5 tipos para faixas
  const tipoLocaisArray = Array.from(tipoStats.entries()).sort((a,b) => b[1].locais.size - a[1].locais.size).slice(0, 5);

  const colW = (pageWidth - 24) / 3;
  
  // Row 1: Faixas, Equipamentos, Locais por Contrato
  renderHorizontalChart('Faixas por Contrato', contArray.map(c => ({label: c[0], val: c[1].faixas})), 12, cursorY, colW, [59, 130, 246]);
  renderHorizontalChart('Equip. por Contrato', contArray.map(c => ({label: c[0], val: c[1].count})), 12 + colW, cursorY, colW, [139, 92, 246]);
  renderHorizontalChart('Locais por Contrato', contArray.map(c => ({label: c[0], val: c[1].locais.size})), 12 + (colW * 2), cursorY, colW, [249, 115, 22]);

  cursorY += (contArray.length * 6) + 12;

  // Row 2: Tipos (Faixas e Locais)
  renderHorizontalChart('Faixas por Tipo', tipoArray.map(c => ({label: c[0], val: c[1].faixas})), 12, cursorY, colW * 1.5, [16, 185, 129]);
  renderHorizontalChart('Locais por Tipo', tipoLocaisArray.map(c => ({label: c[0], val: c[1].locais.size})), 12 + (colW * 1.5), cursorY, colW * 1.5, [139, 92, 246]);

  // Footer for Page 1
  addCustomFooter(doc, pageWidth, doc.internal.pageSize.getHeight(), 'Página 1');

  // ----------- DADOS DOS EQUIPAMENTOS -----------
  
  // We'll iterate through the records and print the fichas
  records.forEach((record, idx) => {
    doc.addPage();
    
    // Bottom border line for header
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(10, 29, pageWidth - 10, 29);

    // Top Right Logo Timbre (PNG)
    if (logoDataUrl) {
      try {
        const logoWidth = 48;
        const logoHeight = 12;
        const logoX = pageWidth - 12 - logoWidth;
        doc.addImage(logoDataUrl, 'PNG', logoX, 8, logoWidth, logoHeight);
      } catch (e) {}
    }

    // Header Text Width Calculation to avoid logo collision
    const maxTextWidth = logoDataUrl ? pageWidth - 12 - 48 - 16 : pageWidth - 24;

    // GEAPI Title
    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('GERÊNCIA DE ANÁLISE E PROCESSAMENTO DE INFRAÇÕES - GEAPI', 12, 10, { maxWidth: maxTextWidth });
    
    doc.setFontSize(9.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85); // slate-700
    doc.text('Ficha Detalhada do Equipamento (Relatório)', 12, 17, { maxWidth: maxTextWidth });
    
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Código: ${record.CÓDIGO || 'N/A'} | Contrato: ${record.CONTRATO || 'N/A'} | Gerado em: ${new Date().toLocaleString('pt-BR')}`, 12, 24, { maxWidth: maxTextWidth });

    // Categorized Table Data - Filter out empty / null fields completely
    const rawCategories = [
      {
        title: 'Identificação & Contrato',
        fields: [
          ['CONTRATO', record.CONTRATO],
          ['CONTRATADA', record.CONTRATADA],
          ['CÓDIGO', record.CÓDIGO],
          ['Nº DE SÉRIE', record['Nº DE SÉRIE']],
        ]
      },
      {
        title: 'Localização & Georreferenciamento',
        fields: [
          ['CÓDIGO DO LOGRADOURO', record['COD LOG']],
          ['ENDEREÇO', record['ENDEREÇOS DOS EQUIPAMENTOS'] || record['ENDEREÇO COMPLETO']],
          ['SENTIDO', record.SENTIDO],
          ['BAIRRO', record.BAIRRO],
          ['REGIONAL', record.REGIONAL],
          ['COORDENADAS GEOGRÁFICAS', record.COORD_LAT_LONG],
        ]
      },
      {
        title: 'Especificações Técnicas e Operação',
        fields: [
          ['TIPO', record.TIPO],
          ['FAIXAS', record.FAIXAS ? String(record.FAIXAS) : ''],
          ['VELOCIDADE FISCALIZADA', record['Velocidade Fiscalizada'] || record.rawFields?.['VELOCIDADE'] || record.rawFields?.['Velocidade Fiscalizada'] || ''],
          ['SITUAÇÃO', record.Situação],
          ['CONDIÇÃO', record.CONDIÇÃO],
          ['DIF PAREADO', record['DIF Pareado']],
          ['OS', record.OS],
          ['REGISTRO DE OBJETO', (record.TIPO || '').toUpperCase().trim() === 'CEV' ? '' : (record['REG. OBJ'] || record.rawFields?.['REG. OBJ'] || record.rawFields?.['REG. OBJ.'] || '')],
        ]
      },
      {
        title: 'Datas Importantes',
        fields: [
          ['INÍCIO DE OPERAÇÃO', formatDate(record['Data início operação'] || record.rawFields?.['INÍCIO OPERAÇÃO'] || record.rawFields?.['Data início operação'])],
          ['ACEITE', formatDate(record['Data de aceite'] || record.rawFields?.['DATA DO ACEITE'] || record.rawFields?.['Data de aceite'])],
          ['AFERIÇÃO', formatDate(record['Data da Aferição'] || record.rawFields?.['DATA DA AFERIÇÃO'] || record.rawFields?.['Data da Aferição'])],
          ['VENCIMENTO DA AFERIÇÃO', formatDate(record['Data de Vencimento da Aferição'] || record.rawFields?.['DATA DO VENCIMENTO DA AFERIÇÃO'] || record.rawFields?.['Data de Vencimento da Aferição'])],
          ['OBSERVAÇÕES', record.Observações || record.rawFields?.['OBSERVAÇÃO'] || record.rawFields?.['Observações']],
        ]
      }
    ];

    let startY = 34;

    rawCategories.forEach((cat) => {
      // Only keep non-empty fields
      const validFields = cat.fields.filter(([_, val]) => {
        if (val === undefined || val === null) return false;
        const str = String(val).trim();
        return str !== '' && str !== '-' && str !== '(Vazio)';
      });
      
      // Skip section if no valid data
      if (validFields.length === 0) return;

      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(12, startY, pageWidth - 24, 6.5, 'F');
      
      doc.setTextColor(30, 41, 59); // slate-800
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(cat.title, 14, startY + 4.5);
      
      autoTable(doc, {
        startY: startY + 8,
        body: validFields,
        theme: 'plain',
        styles: {
          fontSize: 8.5,
          cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 },
          font: 'helvetica'
        },
        columnStyles: {
          0: { cellWidth: 70, fontStyle: 'bold', textColor: [71, 85, 105] }, // Property name
          1: { cellWidth: 'auto', textColor: [15, 23, 42] } // Value
        },
        margin: { left: 12, right: 12 },
      });

      startY = (doc as any).lastAutoTable.finalY + 6;
    });

    // Add Footer with page numbers
    const pageCount = (doc.internal as any).getNumberOfPages();
    const str = `Equipamento ${idx + 1} de ${records.length} | Página ${pageCount}`;
    addCustomFooter(doc, pageWidth, doc.internal.pageSize.getHeight(), str);
  });

  doc.save(`Relatorio_Demanda_${Date.now()}.pdf`);
}

export interface IndicatorsReportData {
  records: EquipmentRecord[];
  metrics: {
    totalEquipments: number;
    totalFaixas: number;
    totalUniqueLocations: number;
    equipmentsOperacao: number;
    equipmentsImplantacao: number;
    equipmentsRelocacao: number;
    faixasOperacao: number;
    faixasImplantacao: number;
    faixasRelocacao: number;
    uniqueLocationsOperacao: number;
    uniqueLocationsImplantacao: number;
    uniqueLocationsRelocacao: number;
  };
  contratoSummary: { label: string; count: number; faixas: number; addresses: number; pctEquip: number; pctFaixas: number; pctLocais?: number }[];
  tipoSummary: { label: string; count: number; faixas: number; addresses: number; pctEquip: number; pctFaixas: number; pctLocais?: number }[];
  anoSummary: { ano: string; count: number; faixas: number; addresses?: number; pctFaixas?: number; pctEquip?: number; pctLocais?: number }[];
  mesSummary: { mes: string; count: number; faixas: number; addresses?: number; pctFaixas?: number; pctEquip?: number; pctLocais?: number }[];
  corredorSummary: { rank?: number; name: string; count: number; faixas: number; tiposFormatted?: string }[];
  filterDescription?: string;
  includeEquipmentList?: boolean;
}

export async function exportCompleteIndicatorsPDF(data: IndicatorsReportData) {
  const {
    records,
    metrics,
    contratoSummary,
    tipoSummary,
    anoSummary,
    mesSummary,
    corredorSummary,
    filterDescription,
    includeEquipmentList = false,
  } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoDataUrl = await getLogoDataUrl();

  const renderHeader = (pageTitle: string, subTitleText?: string) => {
    // White Header Background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(10, 27, pageWidth - 10, 27);

    // Top Right Logo Timbre (PNG)
    if (logoDataUrl) {
      try {
        const logoWidth = 48;
        const logoHeight = 12;
        const logoX = pageWidth - 10 - logoWidth;
        doc.addImage(logoDataUrl, 'PNG', logoX, 7, logoWidth, logoHeight);
      } catch (e) {
        console.warn('Não foi possível renderizar a logo no PDF:', e);
      }
    }

    const maxTextWidth = logoDataUrl ? pageWidth - 10 - 48 - 14 : pageWidth - 20;

    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('GERÊNCIA DE ANÁLISE E PROCESSAMENTO DE INFRAÇÕES - GEAPI', 10, 9, { maxWidth: maxTextWidth });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(pageTitle, 10, 15, { maxWidth: maxTextWidth });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    const metaText = subTitleText || `Emissão: ${new Date().toLocaleString('pt-BR')} | Filtro Ativo: ${filterDescription || 'Todos os Registros'} (${records.length} equipamentos)`;
    doc.text(metaText, 10, 22, { maxWidth: maxTextWidth });
  };

  // Render Page 1 Header
  renderHeader('Fiscalização Eletrônica — Relatório Completo de Indicadores');

  let currentY = 32;

  // 1. KPI Metric Summary Boxes
  const boxWidth = (pageWidth - 20 - 8) / 3;
  const boxHeight = 17;

  // Box 1: Faixas
  const indC1 = 10 + (boxWidth / 2);
  doc.setDrawColor(191, 219, 254);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(10, currentY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(37, 99, 235);
  doc.text('TOTAL DE FAIXAS FISCALIZADAS', indC1, currentY + 4.5, { align: 'center' });
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(metrics.totalFaixas.toLocaleString('pt-BR'), indC1, currentY + 10.2, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Operação: ${metrics.faixasOperacao} | Impl.: ${metrics.faixasImplantacao} | Reloc.: ${metrics.faixasRelocacao}`, indC1, currentY + 14.5, { align: 'center' });

  // Box 2: Locais Únicos
  const indC2 = 10 + boxWidth + 4 + (boxWidth / 2);
  doc.setDrawColor(167, 243, 208);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(10 + boxWidth + 4, currentY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text('LOCAIS ÚNICOS FISCALIZADOS', indC2, currentY + 4.5, { align: 'center' });
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(metrics.totalUniqueLocations.toLocaleString('pt-BR'), indC2, currentY + 10.2, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Operação: ${metrics.uniqueLocationsOperacao} | Impl.: ${metrics.uniqueLocationsImplantacao} | Reloc.: ${metrics.uniqueLocationsRelocacao}`, indC2, currentY + 14.5, { align: 'center' });

  // Box 3: Equipamentos
  const indC3 = 10 + (boxWidth * 2) + 8 + (boxWidth / 2);
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(10 + (boxWidth * 2) + 8, currentY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL DE EQUIPAMENTOS', indC3, currentY + 4.5, { align: 'center' });
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(metrics.totalEquipments.toLocaleString('pt-BR'), indC3, currentY + 10.2, { align: 'center' });
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Operação: ${metrics.equipmentsOperacao} | Impl.: ${metrics.equipmentsImplantacao} | Reloc.: ${metrics.equipmentsRelocacao}`, indC3, currentY + 14.5, { align: 'center' });

  currentY += boxHeight + 5;

  const sectionHeader = (title: string, yPos: number) => {
    doc.setFillColor(241, 245, 249);
    doc.rect(10, yPos, pageWidth - 20, 6, 'F');
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(title.toUpperCase(), 12, yPos + 4.2);
    return yPos + 7.5;
  };

  // Captura e Inserção dos Gráficos Exatamente como Exibidos no Portal
  const charts = await captureIndicatorsCharts();

  // 1. Gráficos de Contrato (3 cards lado a lado)
  const hasContratoCharts = !!(charts.cardContratoFaixas || charts.cardContratoEquip || charts.cardContratoLocais);
  if (hasContratoCharts) {
    currentY = sectionHeader('Gráficos Consolidados por Contrato (Faixas, Equipamentos e Locais)', currentY);
    const cardWidth = 60; // 60mm cada card
    const cardHeight = 45; // 45mm de altura
    const gap = 5; // 5mm entre cards

    if (charts.cardContratoFaixas) {
      doc.addImage(charts.cardContratoFaixas, 'JPEG', 10, currentY, cardWidth, cardHeight);
    }
    if (charts.cardContratoEquip) {
      doc.addImage(charts.cardContratoEquip, 'JPEG', 10 + cardWidth + gap, currentY, cardWidth, cardHeight);
    }
    if (charts.cardContratoLocais) {
      doc.addImage(charts.cardContratoLocais, 'JPEG', 10 + (cardWidth * 2) + (gap * 2), currentY, cardWidth, cardHeight);
    }
    currentY += cardHeight + 6;
  }

  // 2. Gráficos por Tipo de Equipamento (2 cards lado a lado)
  const hasTipoCharts = !!(charts.cardTipoFaixas || charts.cardTipoLocais);
  if (hasTipoCharts) {
    if (currentY > pageHeight - 65) {
      doc.addPage();
      renderHeader('Fiscalização Eletrônica — Relatório Completo de Indicadores');
      currentY = 32;
    }

    currentY = sectionHeader('Gráficos por Tipo de Equipamento (Faixas e Locais Fiscalizados)', currentY);
    const cardWidth = 92.5; // 92.5mm cada card
    const cardHeight = 46; // 46mm de altura
    const gap = 5;

    if (charts.cardTipoFaixas) {
      doc.addImage(charts.cardTipoFaixas, 'JPEG', 10, currentY, cardWidth, cardHeight);
    }
    if (charts.cardTipoLocais) {
      doc.addImage(charts.cardTipoLocais, 'JPEG', 10 + cardWidth + gap, currentY, cardWidth, cardHeight);
    }
    currentY += cardHeight + 6;
  }

  // Se o espaço restante for insuficiente para a Tabela 1, avança para nova página
  if (currentY > pageHeight - 55) {
    doc.addPage();
    renderHeader('Fiscalização Eletrônica — Relatório Completo de Indicadores');
    currentY = 32;
  }

  // 2. Tabela 1: Resumo por Contrato
  currentY = sectionHeader('1. Resumo por Contrato', currentY);

  const totalContratoEquip = contratoSummary.reduce((acc, c) => acc + c.count, 0);
  const totalContratoFaixas = contratoSummary.reduce((acc, c) => acc + c.faixas, 0);
  const totalContratoLocais = contratoSummary.reduce((acc, c) => acc + c.addresses, 0);

  const contratoBody = contratoSummary.map((c) => {
    const pctLoc = c.pctLocais !== undefined ? c.pctLocais : (totalContratoLocais > 0 ? (c.addresses / totalContratoLocais) * 100 : 0);
    return [
      c.label,
      c.count.toLocaleString('pt-BR'),
      c.faixas.toLocaleString('pt-BR'),
      c.addresses.toLocaleString('pt-BR'),
      `${c.pctEquip.toFixed(1)}%`,
      `${c.pctFaixas.toFixed(1)}%`,
      `${pctLoc.toFixed(1)}%`,
    ];
  });

  contratoBody.push([
    'TOTAL GERAL',
    totalContratoEquip.toLocaleString('pt-BR'),
    totalContratoFaixas.toLocaleString('pt-BR'),
    totalContratoLocais.toLocaleString('pt-BR'),
    '100.0%',
    '100.0%',
    '100.0%',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: 10, right: 10, top: 30, bottom: 18 },
    head: [['Contrato', 'Equipamentos', 'Faixas', 'Locais', '% Equip.', '% Faixas', '% Locais']],
    body: contratoBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1.8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: 51,
      cellPadding: 1.5,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      2: { textColor: [37, 99, 235], fontStyle: 'bold' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === contratoBody.length - 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [241, 245, 249];
        hookData.cell.styles.textColor = [15, 23, 42];
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 3. Tabela 2: Resumo por Tipo de Equipamento
  if (currentY > pageHeight - 65) {
    doc.addPage();
    renderHeader('Fiscalização Eletrônica — Relatório Completo de Indicadores');
    currentY = 32;
  }

  currentY = sectionHeader('2. Resumo por Tipo de Equipamento', currentY);

  const totalTipoEquip = tipoSummary.reduce((acc, t) => acc + t.count, 0);
  const totalTipoFaixas = tipoSummary.reduce((acc, t) => acc + t.faixas, 0);
  const totalTipoLocais = tipoSummary.reduce((acc, t) => acc + t.addresses, 0);

  const tipoBody = tipoSummary.map((t) => {
    const pctLoc = t.pctLocais !== undefined ? t.pctLocais : (totalTipoLocais > 0 ? (t.addresses / totalTipoLocais) * 100 : 0);
    return [
      t.label,
      t.count.toLocaleString('pt-BR'),
      t.faixas.toLocaleString('pt-BR'),
      t.addresses.toLocaleString('pt-BR'),
      `${t.pctEquip.toFixed(1)}%`,
      `${t.pctFaixas.toFixed(1)}%`,
      `${pctLoc.toFixed(1)}%`,
    ];
  });

  tipoBody.push([
    'TOTAL GERAL',
    totalTipoEquip.toLocaleString('pt-BR'),
    totalTipoFaixas.toLocaleString('pt-BR'),
    totalTipoLocais.toLocaleString('pt-BR'),
    '100.0%',
    '100.0%',
    '100.0%',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: 10, right: 10, top: 30, bottom: 18 },
    head: [['Tipo de Equipamento', 'Equipamentos', 'Faixas', 'Locais', '% Equip.', '% Faixas', '% Locais']],
    body: tipoBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1.8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: 51,
      cellPadding: 1.5,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      2: { textColor: [5, 150, 105], fontStyle: 'bold' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === tipoBody.length - 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [241, 245, 249];
        hookData.cell.styles.textColor = [15, 23, 42];
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 4. Tabela 3: Implantações por Ano
  if (currentY > pageHeight - 65) {
    doc.addPage();
    renderHeader('Fiscalização Eletrônica — Relatório Completo de Indicadores');
    currentY = 32;
  }

  currentY = sectionHeader('3. Implantações por Ano', currentY);

  const totalAnoEquip = anoSummary.reduce((acc, a) => acc + a.count, 0);
  const totalAnoFaixas = anoSummary.reduce((acc, a) => acc + a.faixas, 0);
  const totalAnoLocais = anoSummary.reduce((acc, a) => acc + (a.addresses || 0), 0);

  const anoBody = anoSummary.map((a) => {
    const pctFaixas = a.pctFaixas !== undefined ? a.pctFaixas : (totalAnoFaixas > 0 ? (a.faixas / totalAnoFaixas) * 100 : 0);
    const pctEquip = a.pctEquip !== undefined ? a.pctEquip : (totalAnoEquip > 0 ? (a.count / totalAnoEquip) * 100 : 0);
    const pctLocais = a.pctLocais !== undefined ? a.pctLocais : (totalAnoLocais > 0 ? ((a.addresses || 0) / totalAnoLocais) * 100 : 0);
    return [
      a.ano,
      a.count.toLocaleString('pt-BR'),
      a.faixas.toLocaleString('pt-BR'),
      (a.addresses || 0).toLocaleString('pt-BR'),
      `${pctFaixas.toFixed(1)}%`,
      `${pctEquip.toFixed(1)}%`,
      `${pctLocais.toFixed(1)}%`,
    ];
  });

  anoBody.push([
    'TOTAL GERAL',
    totalAnoEquip.toLocaleString('pt-BR'),
    totalAnoFaixas.toLocaleString('pt-BR'),
    totalAnoLocais.toLocaleString('pt-BR'),
    '100.0%',
    '100.0%',
    '100.0%',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: 10, right: 10, top: 30, bottom: 18 },
    head: [['Ano', 'Equipamentos', 'Faixas', 'Locais', '% Faixas', '% Equipamentos', '% Locais']],
    body: anoBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1.8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: 51,
      cellPadding: 1.5,
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { textColor: [124, 58, 237], fontStyle: 'bold' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === anoBody.length - 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [241, 245, 249];
        hookData.cell.styles.textColor = [15, 23, 42];
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 5. Tabela 4: Implantações por Mês (Histórico Completo)
  if (currentY > pageHeight - 65) {
    doc.addPage();
    renderHeader('Fiscalização Eletrônica — Relatório Completo de Indicadores');
    currentY = 32;
  }

  currentY = sectionHeader('4. Implantações por Mês (Histórico Completo)', currentY);

  const totalMesEquip = mesSummary.reduce((acc, m) => acc + m.count, 0);
  const totalMesFaixas = mesSummary.reduce((acc, m) => acc + m.faixas, 0);
  const totalMesLocais = mesSummary.reduce((acc, m) => acc + (m.addresses || 0), 0);

  const mesBody = mesSummary.map((m) => {
    const pctFaixas = m.pctFaixas !== undefined ? m.pctFaixas : (totalMesFaixas > 0 ? (m.faixas / totalMesFaixas) * 100 : 0);
    const pctEquip = m.pctEquip !== undefined ? m.pctEquip : (totalMesEquip > 0 ? (m.count / totalMesEquip) * 100 : 0);
    const pctLocais = m.pctLocais !== undefined ? m.pctLocais : (totalMesLocais > 0 ? ((m.addresses || 0) / totalMesLocais) * 100 : 0);
    return [
      m.mes,
      m.count.toLocaleString('pt-BR'),
      m.faixas.toLocaleString('pt-BR'),
      (m.addresses || 0).toLocaleString('pt-BR'),
      `${pctFaixas.toFixed(1)}%`,
      `${pctEquip.toFixed(1)}%`,
      `${pctLocais.toFixed(1)}%`,
    ];
  });

  mesBody.push([
    'TOTAL GERAL',
    totalMesEquip.toLocaleString('pt-BR'),
    totalMesFaixas.toLocaleString('pt-BR'),
    totalMesLocais.toLocaleString('pt-BR'),
    '100.0%',
    '100.0%',
    '100.0%',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: 10, right: 10, top: 30, bottom: 18 },
    head: [['Mês/Ano', 'Equipamentos', 'Faixas', 'Locais', '% Faixas', '% Equipamentos', '% Locais']],
    body: mesBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1.8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: 51,
      cellPadding: 1.3,
      halign: 'center',
    },
    columnStyles: {
      0: { fontStyle: 'bold' },
      2: { textColor: [79, 70, 229], fontStyle: 'bold' },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && hookData.row.index === mesBody.length - 1) {
        hookData.cell.styles.fontStyle = 'bold';
        hookData.cell.styles.fillColor = [241, 245, 249];
        hookData.cell.styles.textColor = [15, 23, 42];
      }
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 6. Tabela 5: Ranking TOP Corredores
  if (currentY > pageHeight - 65) {
    doc.addPage();
    renderHeader('Fiscalização Eletrônica — Relatório Completo de Indicadores');
    currentY = 32;
  }

  currentY = sectionHeader('5. Ranking de Corredores (Top 20)', currentY);

  const corredorBody = corredorSummary.map((c, idx) => [
    String(idx + 1),
    c.name,
    c.count.toLocaleString('pt-BR'),
    c.faixas.toLocaleString('pt-BR'),
    c.tiposFormatted || '-',
  ]);

  autoTable(doc, {
    startY: currentY,
    margin: { left: 10, right: 10, top: 30, bottom: 18 },
    head: [['Pos.', 'Corredor', 'Equipamentos', 'Faixas', 'Tipos Presentes']],
    body: corredorBody,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: 255,
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1.8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: 51,
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { halign: 'center', fontStyle: 'bold', cellWidth: 12 },
      1: { halign: 'left', fontStyle: 'bold' },
      2: { halign: 'center', cellWidth: 24 },
      3: { halign: 'center', textColor: [217, 119, 6], fontStyle: 'bold', cellWidth: 20 },
      4: { halign: 'left' },
    },
  });

  currentY = (doc as any).lastAutoTable.finalY + 6;

  // 7. Tabela 6: Relação Sintética de Equipamentos do Filtro Ativo (Opcional)
  if (includeEquipmentList) {
    if (currentY > pageHeight - 65) {
      doc.addPage();
      renderHeader('Fiscalização Eletrônica — Relatório Completo de Indicadores');
      currentY = 32;
    }

    currentY = sectionHeader('6. Lista Detalhada dos Equipamentos do Filtro Ativo', currentY);

    const equipBody = records.map((r) => [
      r.CONTRATO?.trim() || '-',
      r.CÓDIGO?.trim() || '-',
      r['ENDEREÇO COMPLETO']?.trim() || '-',
      r.BAIRRO?.trim() || '-',
      r.REGIONAL?.trim() || '-',
      r.TIPO?.trim() || '-',
      r.FAIXAS ? String(r.FAIXAS) : '-',
      r['Data início operação']?.trim() || '-',
      r.OS?.trim() || '-',
      r.CONDIÇÃO?.trim() || '-',
      r.Situação?.trim() || '-',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: 10, right: 10, top: 30, bottom: 18 },
      head: [['Contrato', 'Código', 'Endereço Completo', 'Bairro', 'Regional', 'Tipo', 'Faixas', 'Início Op.', 'OS', 'Condição', 'Situação']],
      body: equipBody,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 6.5,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 1.5,
      },
      bodyStyles: {
        fontSize: 6,
        textColor: 51,
        cellPadding: 1.2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 14 },
        1: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
        2: { halign: 'left' }, // Endereço takes remaining width with auto-wrap
        3: { halign: 'center', cellWidth: 18 },
        4: { halign: 'center', cellWidth: 15 },
        5: { halign: 'center', cellWidth: 14 },
        6: { halign: 'center', fontStyle: 'bold', textColor: [37, 99, 235], cellWidth: 11 },
        7: { halign: 'center', cellWidth: 16 },
        8: { halign: 'center', cellWidth: 12 },
        9: { halign: 'center', cellWidth: 15 },
        10: { halign: 'center', cellWidth: 16 },
      },
    });
  }

  // Apply Headers and Footers to all pages dynamically
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    // If not page 1, ensure the top header banner and logo are present
    if (i > 1) {
      renderHeader('Fiscalização Eletrônica — Relatório Completo de Indicadores');
    }
    addCustomFooter(doc, pageWidth, pageHeight, `Página ${i} de ${totalPages}`);
  }

  doc.save(`GEAPI-Relatorio-Indicadores-Completo-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export async function exportMapWithFiltersPdf(
  records: EquipmentRecord[],
  filters: FilterState
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const logoDataUrl = await getLogoDataUrl();

  const renderHeader = (subtitle: string) => {
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.5);
    doc.line(10, 26, pageWidth - 10, 26);

    if (logoDataUrl) {
      try {
        const logoWidth = 46;
        const logoHeight = 11.5;
        const logoX = pageWidth - 12 - logoWidth;
        doc.addImage(logoDataUrl, 'PNG', logoX, 7, logoWidth, logoHeight);
      } catch (e) {}
    }

    const maxTextWidth = logoDataUrl ? pageWidth - 12 - 46 - 14 : pageWidth - 24;

    doc.setTextColor(15, 23, 42); // slate-900
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('GERÊNCIA DE ANÁLISE E PROCESSAMENTO DE INFRAÇÕES - GEAPI', 12, 10, { maxWidth: maxTextWidth });

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(subtitle, 12, 16, { maxWidth: maxTextWidth });

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Emissão: ${new Date().toLocaleString('pt-BR')} | Total Exibido no Mapa: ${records.length} equipamentos`, 12, 22, { maxWidth: maxTextWidth });
  };

  // Render Page 1 Header
  renderHeader('MONITORAMENTO ESPACIAL — MAPA GEORREFERENCIADO & FILTROS');

  let currentY = 29;

  // 1. CAPTURE MAP
  try {
    const mapDataUrl = await captureMap(records);
    if (mapDataUrl) {
      const mapWidth = 186;
      const mapHeight = 98;
      doc.addImage(mapDataUrl, 'JPEG', 12, currentY, mapWidth, mapHeight);

      // Border around map
      doc.setDrawColor(30, 41, 59); // slate-800
      doc.setLineWidth(0.4);
      doc.rect(12, currentY, mapWidth, mapHeight);

      currentY += mapHeight + 4;
    }
  } catch (err) {
    console.error('Erro ao capturar mapa para o PDF de monitoramento:', err);
    doc.setDrawColor(203, 213, 225);
    doc.setFillColor(248, 250, 252);
    doc.rect(12, currentY, 186, 25, 'FD');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Não foi possível gerar a captura visual do mapa.', 105, currentY + 13, { align: 'center' });
    currentY += 30;
  }

  // 2. KPIS BAR (Total Equip, Total Faixas, Locais Únicos, Coordenadas)
  const totalFaixas = records.reduce((acc, r) => acc + (Number(r.FAIXAS) || 0), 0);
  const locaisUnicos = new Set(records.map(r => r['COD LOG'] || r['ENDEREÇO COMPLETO'] || r.CÓDIGO)).size;
  const comCoords = records.filter(r => r.hasValidCoord).length;

  const boxWidth = 44;
  const boxHeight = 13.5;
  const gap = 3.3;

  // Box 1: Equipamentos
  const kpiC1 = 12 + (boxWidth / 2);
  doc.setDrawColor(191, 219, 254);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12, currentY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(37, 99, 235);
  doc.text('TOTAL EQUIPAMENTOS', kpiC1, currentY + 4, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(String(records.length), kpiC1, currentY + 9, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${comCoords} com coordenadas no mapa`, kpiC1, currentY + 12, { align: 'center' });

  // Box 2: Faixas
  const kpiC2 = 12 + boxWidth + gap + (boxWidth / 2);
  doc.setDrawColor(167, 243, 208);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12 + boxWidth + gap, currentY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105);
  doc.text('FAIXAS FISCALIZADAS', kpiC2, currentY + 4, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(String(totalFaixas), kpiC2, currentY + 9, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Faixas ativas fiscalizadas', kpiC2, currentY + 12, { align: 'center' });

  // Box 3: Locais Fiscalizados
  const kpiC3 = 12 + (boxWidth + gap) * 2 + (boxWidth / 2);
  doc.setDrawColor(253, 230, 138);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12 + (boxWidth + gap) * 2, currentY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(217, 119, 6);
  doc.text('LOCAIS FISCALIZADOS', kpiC3, currentY + 4, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(String(locaisUnicos), kpiC3, currentY + 9, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Pontos/endereços distintos', kpiC3, currentY + 12, { align: 'center' });

  // Box 4: Tipos Ativos
  const distinctTipos = Array.from(new Set(records.map(r => (r.TIPO || '').trim()).filter(Boolean)));
  const kpiC4 = 12 + (boxWidth + gap) * 3 + (boxWidth / 2);
  doc.setDrawColor(233, 213, 255);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(12 + (boxWidth + gap) * 3, currentY, boxWidth, boxHeight, 1.5, 1.5, 'FD');
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(147, 51, 234);
  doc.text('TIPOLOGIAS', kpiC4, currentY + 4, { align: 'center' });
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(String(distinctTipos.length), kpiC4, currentY + 9, { align: 'center' });
  doc.setFontSize(5.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`${distinctTipos.slice(0, 3).join(', ')}${distinctTipos.length > 3 ? '...' : ''}`, kpiC4, currentY + 12, { align: 'center' });

  currentY += boxHeight + 4.5;

  // 3. PARÂMETROS E FILTROS APLICADOS
  doc.setFillColor(30, 41, 59); // slate-800
  doc.rect(12, currentY, 186, 5, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PARÂMETROS E FILTROS APLICADOS NA CONSULTA', 15, currentY + 3.6);

  currentY += 5.5;

  // Build filter label texts
  let contratoLabel = 'Todos os Contratos';
  if (filters.contrato === 'PRESET_NOVOS') contratoLabel = 'Novos Contratos (2740/24, 2741/24, 2742/24)';
  else if (filters.contrato === 'PRESET_ANTIGOS') contratoLabel = 'Antigos Contratos (2586/20, 2585/20, 2587/20)';
  else if (filters.contrato && filters.contrato !== 'ALL') contratoLabel = filters.contrato;

  const regionalLabel = filters.regional && filters.regional !== 'ALL' ? filters.regional : 'Todas as Regionais';
  const bairroLabel = filters.bairro && filters.bairro !== 'ALL' ? filters.bairro : 'Todos os Bairros';
  const tipoLabel = filters.tipo && filters.tipo !== 'ALL' ? filters.tipo : 'Todos os Tipos';
  const situacaoLabel = filters.situacao && filters.situacao !== 'ALL' ? filters.situacao : 'Todas as Situações';
  const condicaoLabel = filters.condicao && filters.condicao !== 'ALL' ? filters.condicao : 'Todas as Condições';
  const osLabel = filters.os && filters.os !== 'ALL' ? filters.os : 'Todas as OS';

  let codigosLabel = 'Todos do escopo';
  if (filters.codigos && filters.codigos.length > 0) {
    codigosLabel = `${filters.codigos.length} selecionado(s) (${filters.codigos.slice(0, 4).join(', ')}${filters.codigos.length > 4 ? '...' : ''})`;
  }

  let periodoLabel = 'Sem restrição de data';
  if (filters.dataInicioStart || filters.dataInicioEnd) {
    periodoLabel = `${formatDate(filters.dataInicioStart) || 'Início'} até ${formatDate(filters.dataInicioEnd) || 'Atual'}`;
  }

  const buscaLabel = filters.searchQuery ? `"${filters.searchQuery}"` : 'Nenhuma pesquisa digitada';

  const filterRows = [
    ['Contrato:', contratoLabel, 'Tipo:', tipoLabel],
    ['Regional:', regionalLabel, 'Situação:', situacaoLabel],
    ['Bairro:', bairroLabel, 'Condição:', condicaoLabel],
    ['Ordem de Serviço (OS):', osLabel, 'Seleção de Códigos:', codigosLabel],
    ['Período Início Op.:', periodoLabel, 'Pesquisa por Texto:', buscaLabel],
  ];

  autoTable(doc, {
    startY: currentY,
    body: filterRows,
    theme: 'plain',
    styles: {
      fontSize: 6.8,
      cellPadding: { top: 1, bottom: 1, left: 2, right: 2 },
      font: 'helvetica',
    },
    columnStyles: {
      0: { cellWidth: 32, fontStyle: 'bold', textColor: [71, 85, 105] },
      1: { cellWidth: 61, textColor: [15, 23, 42], fontStyle: 'normal' },
      2: { cellWidth: 32, fontStyle: 'bold', textColor: [71, 85, 105] },
      3: { cellWidth: 61, textColor: [15, 23, 42], fontStyle: 'normal' },
    },
    margin: { left: 12, right: 12 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 4;

  // 4. SUMMARY BREAKDOWN BY TIPO TABLE
  const tipoCounts: Record<string, { equip: number; faixas: number }> = {};
  records.forEach(r => {
    const t = (r.TIPO || 'NÃO DEFINIDO').trim();
    if (!tipoCounts[t]) tipoCounts[t] = { equip: 0, faixas: 0 };
    tipoCounts[t].equip += 1;
    tipoCounts[t].faixas += (Number(r.FAIXAS) || 0);
  });

  const tipoTableBody = Object.entries(tipoCounts)
    .sort((a, b) => b[1].equip - a[1].equip)
    .map(([tipo, data]) => [
      tipo,
      String(data.equip),
      String(data.faixas),
      `${records.length > 0 ? ((data.equip / records.length) * 100).toFixed(1) : '0.0'}%`,
      `${totalFaixas > 0 ? ((data.faixas / totalFaixas) * 100).toFixed(1) : '0.0'}%`
    ]);

  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(12, currentY, 186, 4.5, 'F');
  doc.setFontSize(6.8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('DISTRIBUIÇÃO DOS EQUIPAMENTOS POR TIPOLOGIA NO RECORTE ATUAL', 14, currentY + 3.2);

  currentY += 5;

  autoTable(doc, {
    startY: currentY,
    head: [['Tipo de Equipamento', 'Qtd. Equipamentos', 'Qtd. Faixas', '% Equipamentos', '% Faixas']],
    body: tipoTableBody,
    theme: 'striped',
    headStyles: {
      fillColor: [51, 65, 85],
      textColor: 255,
      fontSize: 6.2,
      fontStyle: 'bold',
      halign: 'center',
      cellPadding: 1,
    },
    bodyStyles: {
      fontSize: 6.2,
      textColor: 51,
      cellPadding: 0.8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      1: { halign: 'center', fontStyle: 'bold', textColor: [37, 99, 235] },
      2: { halign: 'center', fontStyle: 'bold', textColor: [5, 150, 105] },
      3: { halign: 'center' },
      4: { halign: 'center' },
    },
    margin: { left: 12, right: 12 },
  });

  // Page 1 Footer
  addCustomFooter(doc, pageWidth, pageHeight, 'Página 1');

  // Page 2: Relação Nominal dos Equipamentos
  if (records.length > 0) {
    doc.addPage();
    renderHeader('MONITORAMENTO ESPACIAL — RELAÇÃO NOMINAL DOS EQUIPAMENTOS');

    const equipRows = records.map(r => [
      r.CÓDIGO || '-',
      r.CONTRATO || '-',
      r['ENDEREÇO COMPLETO'] || r['ENDEREÇOS DOS EQUIPAMENTOS'] || '-',
      r.BAIRRO || '-',
      r.REGIONAL || '-',
      r.TIPO || '-',
      String(r.FAIXAS || '-'),
      r.Situação || '-',
      r.CONDIÇÃO || '-',
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Código', 'Contrato', 'Endereço Completo', 'Bairro', 'Regional', 'Tipo', 'Faixas', 'Situação', 'Condição']],
      body: equipRows,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 6.5,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 1.5,
      },
      bodyStyles: {
        fontSize: 6,
        textColor: 51,
        cellPadding: 1.2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', cellWidth: 14 },
        1: { halign: 'center', cellWidth: 16 },
        2: { halign: 'left' },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'center', cellWidth: 18 },
        5: { halign: 'center', cellWidth: 15 },
        6: { halign: 'center', fontStyle: 'bold', textColor: [37, 99, 235], cellWidth: 12 },
        7: { halign: 'center', cellWidth: 18 },
        8: { halign: 'center', cellWidth: 16 },
      },
      margin: { left: 10, right: 10, top: 30, bottom: 18 },
    });
  }

  // Update total page counts on all pages
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) {
      renderHeader('MONITORAMENTO ESPACIAL — RELAÇÃO NOMINAL DOS EQUIPAMENTOS');
    }
    addCustomFooter(doc, pageWidth, pageHeight, `Página ${i} de ${totalPages}`);
  }

  doc.save(`GEAPI-Monitoramento-Espacial-Mapa-${new Date().toISOString().slice(0, 10)}.pdf`);
}



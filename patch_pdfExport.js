const fs = require('fs');

const content = fs.readFileSync('src/utils/pdfExport.ts', 'utf8');

const regex = /\/\/ ----------- PAGE 1: RESUMO EXECUTIVO -----------[\s\S]*?(?=doc\.addPage\(\);)/;

const newPage1 = `// ----------- PAGE 1: RESUMO EXECUTIVO -----------
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
  doc.text(\`Gerado em: \${new Date().toLocaleString('pt-BR')} | Total de Equipamentos: \${records.length}\`, 12, 24, { maxWidth: maxTextWidth });

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
    activeFilters.push({ label: 'Início de Oper.', value: \`\${filtersApplied.inicioOp.de || '---'} até \${filtersApplied.inicioOp.ate || '---'}\` });
  }
  if (filtersApplied.aceite && (filtersApplied.aceite.de || filtersApplied.aceite.ate)) {
    activeFilters.push({ label: 'Data de Aceite', value: \`\${filtersApplied.aceite.de || '---'} até \${filtersApplied.aceite.ate || '---'}\` });
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
  doc.setDrawColor(191, 219, 254);
  doc.setFillColor(239, 246, 255);
  doc.roundedRect(12, cursorY, boxWidth, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(37, 99, 235);
  doc.text(String(records.length), 16, cursorY + 8);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Equipamentos', 16, cursorY + 13);

  // 2. Total Faixas
  doc.setDrawColor(167, 243, 208);
  doc.setFillColor(236, 253, 245);
  doc.roundedRect(12 + boxWidth + 4, cursorY, boxWidth, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(5, 150, 105);
  doc.text(String(totalFaixas), 16 + boxWidth + 4, cursorY + 8);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Faixas Fiscalizadas', 16 + boxWidth + 4, cursorY + 13);

  // 3. Locais Unicos
  doc.setDrawColor(253, 230, 138);
  doc.setFillColor(255, 251, 235);
  doc.roundedRect(12 + (boxWidth * 2) + 8, cursorY, boxWidth, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(217, 119, 6);
  doc.text(String(locaisUnicos.size), 16 + (boxWidth * 2) + 8, cursorY + 8);
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Locais Únicos', 16 + (boxWidth * 2) + 8, cursorY + 13);

  // 4. Indicadores Situacao
  doc.setDrawColor(233, 213, 255);
  doc.setFillColor(250, 245, 255);
  doc.roundedRect(12 + (boxWidth * 3) + 12, cursorY, boxWidth, 16, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('Indicadores', 16 + (boxWidth * 3) + 12, cursorY + 6);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(\`Operação: \${equipmentsOperacao}\`, 16 + (boxWidth * 3) + 12, cursorY + 10);
  doc.text(\`Reloc.: \${equipmentsRelocacao} | Impl.: \${equipmentsImplantacao}\`, 16 + (boxWidth * 3) + 12, cursorY + 14);

  cursorY += 22;

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

  cursorY += (contArray.length * 6) + 10;

  // Row 2: Tipos (Faixas e Locais)
  // Let's draw as vertical or just horizontal for simplicity, since it's a PDF. Horizontal is much more reliable in jsPDF
  renderHorizontalChart('Faixas por Tipo', tipoArray.map(c => ({label: c[0], val: c[1].faixas})), 12, cursorY, colW * 1.5, [16, 185, 129]);
  renderHorizontalChart('Locais por Tipo', tipoLocaisArray.map(c => ({label: c[0], val: c[1].locais.size})), 12 + (colW * 1.5), cursorY, colW * 1.5, [139, 92, 246]);

  // `;

if (!content.match(regex)) {
  console.log("Could not find regex match!");
} else {
  const newContent = content.replace(regex, newPage1);
  fs.writeFileSync('src/utils/pdfExport.ts', newContent);
  console.log("File patched!");
}


import { EquipmentRecord, FilterState } from '../types';
import { AIAction } from './aiService';

export interface LocalFallbackResponse {
  text: string;
  actions: AIAction[];
}

const MONTH_NAMES_MAP: Record<string, { num: string; name: string }> = {
  janeiro: { num: '01', name: 'Janeiro' },
  jan: { num: '01', name: 'Janeiro' },
  fevereiro: { num: '02', name: 'Fevereiro' },
  fev: { num: '02', name: 'Fevereiro' },
  março: { num: '03', name: 'Março' },
  marco: { num: '03', name: 'Março' },
  mar: { num: '03', name: 'Março' },
  abril: { num: '04', name: 'Abril' },
  abr: { num: '04', name: 'Abril' },
  maio: { num: '05', name: 'Maio' },
  mai: { num: '05', name: 'Maio' },
  junho: { num: '06', name: 'Junho' },
  jun: { num: '06', name: 'Junho' },
  julho: { num: '07', name: 'Julho' },
  jul: { num: '07', name: 'Julho' },
  agosto: { num: '08', name: 'Agosto' },
  ago: { num: '08', name: 'Agosto' },
  setembro: { num: '09', name: 'Setembro' },
  set: { num: '09', name: 'Setembro' },
  outubro: { num: '10', name: 'Outubro' },
  out: { num: '10', name: 'Outubro' },
  novembro: { num: '11', name: 'Novembro' },
  nov: { num: '11', name: 'Novembro' },
  dezembro: { num: '12', name: 'Dezembro' },
  dez: { num: '12', name: 'Dezembro' },
};

function normalizeDate(raw: string): { formatted: string; day: string; month: string; year: string; timestamp: number } | null {
  if (!raw || typeof raw !== 'string') return null;
  const parts = raw.trim().split(/[\/\-\.]/);
  if (parts.length === 3) {
    const d = parts[0].padStart(2, '0');
    const m = parts[1].padStart(2, '0');
    const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
    const dayNum = parseInt(d, 10);
    const monthNum = parseInt(m, 10);
    const yearNum = parseInt(y, 10);
    if (!isNaN(dayNum) && !isNaN(monthNum) && !isNaN(yearNum)) {
      return {
        formatted: `${d}/${m}/${y}`,
        day: d,
        month: m,
        year: y,
        timestamp: new Date(yearNum, monthNum - 1, dayNum).getTime(),
      };
    }
  }
  return null;
}

export function generateLocalFallbackResponse(
  message: string,
  records: EquipmentRecord[],
  filters?: FilterState
): LocalFallbackResponse {
  const lower = message.toLowerCase().trim();

  // Filtragem básica por contrato vigente
  const asksLegacy = lower.includes('2585') || lower.includes('2586') || lower.includes('2587') || lower.includes('antigo') || lower.includes('anterior');
  const targetRecords = asksLegacy
    ? records
    : records.filter((r) => {
        const ct = (r.CONTRATO || '').toString();
        return ct.includes('2740') || ct.includes('2741') || ct.includes('2742');
      });

  const baseRecords = targetRecords.length > 0 ? targetRecords : records;

  // Totais Gerais
  let totalEquip = baseRecords.length;
  let totalFaixas = 0;
  let opEquip = 0;
  let opFaixas = 0;
  let impEquip = 0;
  let impFaixas = 0;
  let relEquip = 0;
  let relFaixas = 0;
  let inopEquip = 0;
  let inopFaixas = 0;

  const porContrato: Record<string, { equip: number; faixas: number; opFaixas: number; impFaixas: number; opEquip: number; impEquip: number }> = {};
  const porTipo: Record<string, { equip: number; faixas: number; opFaixas: number; impFaixas: number; opEquip: number; impEquip: number }> = {};

  baseRecords.forEach((r) => {
    const f = typeof r.FAIXAS === 'number' && !isNaN(r.FAIXAS) ? r.FAIXAS : 1;
    totalFaixas += f;

    const sit = (r.Situação || '').toLowerCase();
    const isOp = sit.includes('operação') || sit.includes('operacao') || sit.includes('ativo');
    const isRel = sit.includes('relocação') || sit.includes('relocacao');
    const isInop = sit.includes('inoperante') || sit.includes('desativado');

    if (isOp) {
      opEquip++;
      opFaixas += f;
    } else if (isRel) {
      relEquip++;
      relFaixas += f;
    } else if (isInop) {
      inopEquip++;
      inopFaixas += f;
    } else {
      impEquip++;
      impFaixas += f;
    }

    const ct = r.CONTRATO || 'Outro';
    if (!porContrato[ct]) porContrato[ct] = { equip: 0, faixas: 0, opFaixas: 0, impFaixas: 0, opEquip: 0, impEquip: 0 };
    porContrato[ct].equip++;
    porContrato[ct].faixas += f;
    if (isOp) {
      porContrato[ct].opFaixas += f;
      porContrato[ct].opEquip++;
    } else {
      porContrato[ct].impFaixas += f;
      porContrato[ct].impEquip++;
    }

    const tp = (r.TIPO || 'Outro').toUpperCase().trim();
    if (!porTipo[tp]) porTipo[tp] = { equip: 0, faixas: 0, opFaixas: 0, impFaixas: 0, opEquip: 0, impEquip: 0 };
    porTipo[tp].equip++;
    porTipo[tp].faixas += f;
    if (isOp) {
      porTipo[tp].opFaixas += f;
      porTipo[tp].opEquip++;
    } else {
      porTipo[tp].impFaixas += f;
      porTipo[tp].impEquip++;
    }
  });

  // 1. Extração de Tipo específico mencionado (CEV, DAS, DIF, DTLP, DCP)
  const typeMatch = lower.match(/\b(CEV|DAS|DIF|DTLP|DCP)\b/i);
  const requestedType = typeMatch ? typeMatch[1].toUpperCase() : null;

  // 2. Extração de Contrato específico mencionado (2740, 2741, 2742)
  const contractMatch = lower.match(/\b(2740|2741|2742|2585|2586|2587)\b/);
  const requestedContract = contractMatch ? contractMatch[1] : null;

  // 3. Busca por código de radar específico (ex: KBH11081, CEV01, R101)
  const codeMatch = lower.match(/\b([A-Z]{2,4}[-\s]?\d{3,6}|\d{4,6})\b/i);
  if (codeMatch && !lower.includes('contrato') && !lower.includes('quantas') && !lower.includes('quantos') && !lower.includes('setembro') && !lower.includes('agosto')) {
    const rawCode = codeMatch[1].replace(/[-\s]/g, '').toUpperCase();
    const found = records.find((r) => {
      const c = (r.CÓDIGO || '').replace(/[-\s]/g, '').toUpperCase();
      return c === rawCode || c.includes(rawCode);
    });

    if (found) {
      return {
        text: `📍 **Equipamento Localizado:** **${found.CÓDIGO}** (${found.TIPO || 'Radar'})\n\n` +
          `• **Endereço:** ${found['ENDEREÇO COMPLETO'] || found['ENDEREÇOS DOS EQUIPAMENTOS'] || 'Não informado'}\n` +
          `• **Bairro / Regional:** ${found.BAIRRO || 'N/D'} / ${found.REGIONAL || 'N/D'}\n` +
          `• **Situação:** **${found.Situação || 'Em operação'}** (${found.FAIXAS || 1} faixa(s) fiscalizada(s))\n` +
          `• **Contrato / Empresa:** ${found.CONTRATO || '2740'} (${found.CONTRATADA || 'Consórcio'})\n` +
          `• **Início de Operação:** ${found['Data início operação'] || 'N/D'}\n` +
          `• **Coordenadas:** \`${found.lat || 'N/D'}, ${found.lng || 'N/D'}\`\n` +
          `• **Velocidade / Sentido:** ${found['Velocidade Fiscalizada'] ? found['Velocidade Fiscalizada'] + ' km/h' : 'N/D'} | ${found.SENTIDO || 'N/D'}`,
        actions: [
          { type: 'VIEW_EQUIPMENT', label: `Ver ${found.CÓDIGO}`, payload: { codigo: found.CÓDIGO } },
          { type: 'NAVIGATE_TAB', label: 'Abrir no Mapa', payload: { tab: 'mapa' } },
        ],
      };
    }
  }

  // 4. CONSULTAS TEMPORAIS DE ENTRADA EM OPERAÇÃO / ATIVAÇÕES
  const isActivationQuery =
    lower.includes('entraram em operação') ||
    lower.includes('entrou em operação') ||
    lower.includes('entraram em operacao') ||
    lower.includes('entrou em operacao') ||
    lower.includes('início de operação') ||
    lower.includes('inicio de operacao') ||
    lower.includes('início operação') ||
    lower.includes('inicio operacao') ||
    lower.includes('ativados') ||
    lower.includes('ativadas') ||
    lower.includes('ativação') ||
    lower.includes('ativacao') ||
    lower.includes('ligados') ||
    lower.includes('ligadas') ||
    lower.includes('começaram a operar') ||
    lower.includes('comecou a operar');

  // Identifica se há menção a mês
  let targetMonthNum: string | null = null;
  let targetMonthName: string | null = null;
  for (const [key, val] of Object.entries(MONTH_NAMES_MAP)) {
    const regex = new RegExp(`\\b(${key})\\b`, 'i');
    if (regex.test(lower)) {
      targetMonthNum = val.num;
      targetMonthName = val.name;
      break;
    }
  }

  // Identifica se há menção a ano específico (ex: 2026, 2025, 2024)
  const yearMatch = lower.match(/\b(202\d|201\d)\b/);
  const targetYear = yearMatch ? yearMatch[1] : null;

  // Identifica se há menção a data específica DD/MM/AAAA ou DD/MM
  const dateMatch = lower.match(/\b(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?\b/);
  let explicitTargetDate: string | null = null;
  if (dateMatch) {
    const d = dateMatch[1].padStart(2, '0');
    const m = dateMatch[2].padStart(2, '0');
    const y = dateMatch[3] ? (dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3]) : (targetYear || '2026');
    explicitTargetDate = `${d}/${m}/${y}`;
  }

  const isToday = lower.includes('hoje');
  const isOntem = lower.includes('ontem');
  const now = new Date();
  const todayStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

  // Se a consulta for sobre entrada em operação OU mencionar um mês/ano/data com contagem de faixas
  if (isActivationQuery || targetMonthNum || targetYear || explicitTargetDate || isToday || isOntem) {
    // Filtra registros com data de início de operação
    let matchedOpRecords = baseRecords.filter((r) => {
      const rawDate = r['Data início operação'];
      if (!rawDate || rawDate.trim().length === 0) return false;
      const parsed = normalizeDate(rawDate);
      if (!parsed) return false;

      // Filtro de tipo
      if (requestedType && (r.TIPO || '').toUpperCase() !== requestedType) {
        return false;
      }

      // Filtro de contrato
      if (requestedContract && !(r.CONTRATO || '').includes(requestedContract)) {
        return false;
      }

      // Filtro de data específica
      if (explicitTargetDate) {
        return parsed.formatted === explicitTargetDate || `${parsed.day}/${parsed.month}` === explicitTargetDate.slice(0, 5);
      }

      // Filtro de hoje
      if (isToday) {
        return parsed.formatted === todayStr;
      }

      // Filtro de ano estrito quando o usuário especificou o ano
      if (targetYear && parsed.year !== targetYear) {
        return false;
      }

      // Filtro de mês
      if (targetMonthNum) {
        return parsed.month === targetMonthNum;
      }

      return true;
    });

    const typeTag = requestedType ? ` **${requestedType}**` : '';
    const contractTag = requestedContract ? ` no Contrato **${requestedContract}**` : '';

    // Agrupa resultados encontrados por data
    const porDataMap: Record<string, { faixas: number; equip: number; codigos: string[] }> = {};
    let totalFaixasFiltradas = 0;
    let totalEquipFiltrados = matchedOpRecords.length;

    matchedOpRecords.forEach((r) => {
      const f = typeof r.FAIXAS === 'number' && !isNaN(r.FAIXAS) ? r.FAIXAS : 1;
      totalFaixasFiltradas += f;
      const parsed = normalizeDate(r['Data início operação'] || '');
      const dKey = parsed ? parsed.formatted : 'Data não informada';
      if (!porDataMap[dKey]) porDataMap[dKey] = { faixas: 0, equip: 0, codigos: [] };
      porDataMap[dKey].faixas += f;
      porDataMap[dKey].equip += 1;
      if (r.CÓDIGO) porDataMap[dKey].codigos.push(r.CÓDIGO);
    });

    const uniqueDates = Object.keys(porDataMap).sort((a, b) => {
      const pA = normalizeDate(a)?.timestamp || 0;
      const pB = normalizeDate(b)?.timestamp || 0;
      return pB - pA;
    });

    // Caso 1: Consulta de Mês específico (ex: "agosto de 2026", "mês de setembro", "em setembro")
    if (targetMonthNum && targetMonthName) {
      const periodoTitulo = targetYear ? `mês de **${targetMonthName} de ${targetYear}**` : `mês de **${targetMonthName}**`;

      if (totalFaixasFiltradas === 0) {
        return {
          text: `📍 **Nenhuma faixa${typeTag}${contractTag}** teve início de operação registrado no ${periodoTitulo} na base oficial até o momento.`,
          actions: [
            { type: 'NAVIGATE_TAB', label: 'Ver Tabela Geral', payload: { tab: 'tabela' } },
            { type: 'QUICK_PROMPT', label: 'Ver Faixas em Operação', payload: { prompt: 'Quantas faixas estão em operação?' } },
          ],
        };
      }

      // Monta o detalhamento cronológico de datas
      const breakdown = uniqueDates
        .map((d) => `• **${d}:** ${porDataMap[d].faixas} faixas (${porDataMap[d].equip} equipamentos)`)
        .join('\n');

      return {
        text: `📍 **${totalFaixasFiltradas} faixas${typeTag}** (${totalEquipFiltrados} equipamentos${contractTag}) entraram em operação no ${periodoTitulo}:\n\n` +
          `${breakdown}\n\n` +
          `• **Total do Mês:** **${totalFaixasFiltradas} faixas** em **${totalEquipFiltrados} locais**.`,
        actions: [
          { type: 'NAVIGATE_TAB', label: 'Ver na Tabela', payload: { tab: 'tabela' } },
          { type: 'NAVIGATE_TAB', label: 'Ver no Mapa', payload: { tab: 'mapa' } },
          { type: 'QUICK_PROMPT', label: 'Ver Total em Operação', payload: { prompt: 'Quantas faixas estão em operação?' } },
        ],
      };
    }

    // Caso 1.2: Consulta de Ano específico sem mês (ex: "em 2026", "no ano de 2026")
    if (targetYear && !targetMonthNum && !explicitTargetDate) {
      if (totalFaixasFiltradas === 0) {
        return {
          text: `📍 **Nenhuma faixa${typeTag}${contractTag}** teve início de operação registrado no ano de **${targetYear}** na base oficial até o momento.`,
          actions: [
            { type: 'NAVIGATE_TAB', label: 'Ver Tabela Geral', payload: { tab: 'tabela' } },
          ],
        };
      }

      const breakdown = uniqueDates
        .map((d) => `• **${d}:** ${porDataMap[d].faixas} faixas (${porDataMap[d].equip} equipamentos)`)
        .join('\n');

      return {
        text: `📍 **${totalFaixasFiltradas} faixas${typeTag}** (${totalEquipFiltrados} equipamentos${contractTag}) entraram em operação no ano de **${targetYear}**:\n\n` +
          `${breakdown}\n\n` +
          `• **Total do Ano:** **${totalFaixasFiltradas} faixas** em **${totalEquipFiltrados} locais**.`,
        actions: [
          { type: 'NAVIGATE_TAB', label: 'Ver na Tabela', payload: { tab: 'tabela' } },
          { type: 'NAVIGATE_TAB', label: 'Ver no Mapa', payload: { tab: 'mapa' } },
        ],
      };
    }

    // Caso 2: Consulta de Data específica (ex: "no dia 02/09/2026", "no dia 02/09")
    if (explicitTargetDate) {
      if (totalFaixasFiltradas === 0) {
        return {
          text: `📍 **Nenhuma faixa${typeTag}${contractTag}** com registro de entrada em operação no dia **${explicitTargetDate}**.`,
          actions: [
            { type: 'NAVIGATE_TAB', label: 'Ver Tabela Geral', payload: { tab: 'tabela' } },
          ],
        };
      }

      return {
        text: `📍 **${totalFaixasFiltradas} faixas${typeTag}** (em ${totalEquipFiltrados} equipamentos${contractTag}) no dia **${explicitTargetDate}**.\n\n` +
          `• **Equipamentos ativados:** ${matchedOpRecords.map((r) => `**${r.CÓDIGO}** (${r.FAIXAS || 1} f.)`).slice(0, 8).join(', ')}${matchedOpRecords.length > 8 ? ` e mais ${matchedOpRecords.length - 8}...` : ''}`,
        actions: [
          { type: 'NAVIGATE_TAB', label: 'Ver na Tabela', payload: { tab: 'tabela' } },
          { type: 'NAVIGATE_TAB', label: 'Ver no Mapa', payload: { tab: 'mapa' } },
        ],
      };
    }

    // Caso 3: Consulta sobre "hoje"
    if (isToday) {
      if (totalFaixasFiltradas > 0) {
        return {
          text: `📍 **${totalFaixasFiltradas} faixas${typeTag}** (em ${totalEquipFiltrados} equipamentos) entraram em operação hoje (**${todayStr}**).`,
          actions: [
            { type: 'NAVIGATE_TAB', label: 'Ver na Tabela', payload: { tab: 'tabela' } },
          ],
        };
      }

      // Busca a data mais recente com ativações
      const allWithDate = baseRecords
        .filter((r) => r['Data início operação'] && normalizeDate(r['Data início operação']))
        .sort((a, b) => (normalizeDate(b['Data início operação']!)?.timestamp || 0) - (normalizeDate(a['Data início operação']!)?.timestamp || 0));

      const mostRecentDate = allWithDate.length > 0 ? normalizeDate(allWithDate[0]['Data início operação']!)?.formatted : null;
      const recentCount = mostRecentDate ? allWithDate.filter((r) => normalizeDate(r['Data início operação']!)?.formatted === mostRecentDate).reduce((acc, curr) => acc + (typeof curr.FAIXAS === 'number' ? curr.FAIXAS : 1), 0) : 0;

      return {
        text: `📍 **Nenhuma nova faixa${typeTag}** teve início de operação registrado hoje (**${todayStr}**).\n\n` +
          (mostRecentDate ? `• **Última ativação registrada na base:** **${recentCount} faixas** no dia **${mostRecentDate}**.\n` : '') +
          `• **Total atual em operação plena:** **${opFaixas.toLocaleString('pt-BR')} faixas** (${opEquip.toLocaleString('pt-BR')} equipamentos).`,
        actions: [
          { type: 'NAVIGATE_TAB', label: 'Ver Tabela Geral', payload: { tab: 'tabela' } },
          { type: 'QUICK_PROMPT', label: 'Ver Total em Operação', payload: { prompt: 'Quantas faixas estão em operação?' } },
        ],
      };
    }
  }

  // 5. CONSULTA ESPECÍFICA POR TIPO (CEV, DAS, DIF, DTLP, DCP)
  if (requestedType && porTipo[requestedType]) {
    const tp = porTipo[requestedType];
    const isAskingOp = lower.includes('operação') || lower.includes('operacao') || lower.includes('ativas') || lower.includes('ativo');
    const isAskingImp = lower.includes('implantação') || lower.includes('implantacao') || lower.includes('projetado');

    if (isAskingOp) {
      return {
        text: `📍 **${tp.opFaixas.toLocaleString('pt-BR')} faixas ${requestedType}** (${tp.opEquip.toLocaleString('pt-BR')} equipamentos) estão atualmente **em operação** (de um total previsto de ${tp.faixas} faixas).`,
        actions: [
          { type: 'NAVIGATE_TAB', label: `Ver ${requestedType} na Tabela`, payload: { tab: 'tabela' } },
          { type: 'QUICK_PROMPT', label: `Ver ${requestedType} em Implantação`, payload: { prompt: `Quantas faixas ${requestedType} estão em implantação?` } },
        ],
      };
    }

    if (isAskingImp) {
      return {
        text: `📍 **${tp.impFaixas.toLocaleString('pt-BR')} faixas ${requestedType}** (${tp.impEquip.toLocaleString('pt-BR')} equipamentos) estão **em implantação / projetadas**.`,
        actions: [
          { type: 'NAVIGATE_TAB', label: `Ver ${requestedType} na Tabela`, payload: { tab: 'tabela' } },
          { type: 'QUICK_PROMPT', label: `Ver ${requestedType} em Operação`, payload: { prompt: `Quantas faixas ${requestedType} estão em operação?` } },
        ],
      };
    }

    return {
      text: `📊 **${requestedType}:** **${tp.faixas.toLocaleString('pt-BR')} faixas** (${tp.equip.toLocaleString('pt-BR')} equipamentos)\n\n` +
        `• **Em Operação:** **${tp.opFaixas.toLocaleString('pt-BR')} faixas** (${tp.opEquip} equipamentos)\n` +
        `• **Em Implantação:** **${tp.impFaixas.toLocaleString('pt-BR')} faixas** (${tp.impEquip} equipamentos)`,
      actions: [
        { type: 'NAVIGATE_TAB', label: `Filtrar ${requestedType} no Mapa`, payload: { tab: 'mapa' } },
        { type: 'QUICK_PROMPT', label: 'Ver Divisão de Todos os Tipos', payload: { prompt: 'Qual a divisão de faixas por tipo?' } },
      ],
    };
  }

  // 6. CONSULTA ESPECÍFICA POR CONTRATO (2740, 2741, 2742)
  if (requestedContract && porContrato[requestedContract]) {
    const ct = porContrato[requestedContract];
    return {
      text: `📍 **${ct.faixas.toLocaleString('pt-BR')} faixas** (${ct.equip} equipamentos) no **Contrato ${requestedContract}**:\n\n` +
        `• **Em Operação:** **${ct.opFaixas.toLocaleString('pt-BR')} faixas** (${ct.opEquip} equipamentos)\n` +
        `• **Em Implantação:** **${ct.impFaixas.toLocaleString('pt-BR')} faixas** (${ct.impEquip} equipamentos)`,
      actions: [
        { type: 'NAVIGATE_TAB', label: `Ver Contrato ${requestedContract}`, payload: { tab: 'gestao_contratual' } },
        { type: 'QUICK_PROMPT', label: 'Ver Todos os Contratos', payload: { prompt: 'Qual a distribuição por contrato?' } },
      ],
    };
  }

  // 7. CONSULTA DE OPERAÇÃO GERAL
  if (lower.includes('operação') || lower.includes('operacao') || lower.includes('ativo') || lower.includes('funcionando')) {
    return {
      text: `📍 **${opFaixas.toLocaleString('pt-BR')} faixas** (em ${opEquip.toLocaleString('pt-BR')} equipamentos) estão atualmente **em operação** nos contratos vigentes (2740, 2741 e 2742).\n\n` +
        `• **Percentual Operacional:** ${totalFaixas > 0 ? ((opFaixas / totalFaixas) * 100).toFixed(1) : 0}% da rede total (${totalFaixas.toLocaleString('pt-BR')} faixas previstas).\n\n` +
        `*Distribuição por Contrato:*\n` +
        Object.entries(porContrato)
          .map(([ct, v]) => `  - **Contrato ${ct}:** ${v.opFaixas.toLocaleString('pt-BR')} faixas ativas (${v.opEquip} locais)`)
          .join('\n'),
      actions: [
        { type: 'NAVIGATE_TAB', label: 'Ver Indicadores', payload: { tab: 'indicadores' } },
        { type: 'NAVIGATE_TAB', label: 'Ver no Mapa', payload: { tab: 'mapa' } },
        { type: 'QUICK_PROMPT', label: 'Ver por Tipo (CEV/DAS/DIF)', payload: { prompt: 'Quantas faixas por tipo de equipamento?' } },
      ],
    };
  }

  // 8. CONSULTA DE IMPLANTAÇÃO GERAL
  if (lower.includes('implantação') || lower.includes('implantacao') || lower.includes('projetado') || lower.includes('a implantar')) {
    return {
      text: `🚧 **${impFaixas.toLocaleString('pt-BR')} faixas** (${impEquip.toLocaleString('pt-BR')} equipamentos) estão atualmente **em implantação / projetadas**.\n\n` +
        `• **Em Relocação:** ${relFaixas.toLocaleString('pt-BR')} faixas (${relEquip} locais).\n\n` +
        `*Por Contrato:*\n` +
        Object.entries(porContrato)
          .map(([ct, v]) => `  - **Contrato ${ct}:** ${v.impFaixas.toLocaleString('pt-BR')} faixas a implantar (${v.impEquip} locais)`)
          .join('\n'),
      actions: [
        { type: 'NAVIGATE_TAB', label: 'Ver Tabela Completa', payload: { tab: 'tabela' } },
        { type: 'QUICK_PROMPT', label: 'Ver Faixas em Operação', payload: { prompt: 'Quantas faixas estão em operação?' } },
      ],
    };
  }

  // 9. CONSULTA GERAL DE TIPOS
  if (lower.includes('tipo') || lower.includes('tecnologia') || lower.includes('equipamentos por tipo')) {
    const tiposList = Object.entries(porTipo)
      .sort((a, b) => b[1].faixas - a[1].faixas)
      .map(([tp, v]) => `• **${tp}:** ${v.faixas.toLocaleString('pt-BR')} faixas (${v.equip} locais) — *${v.opFaixas} em operação / ${v.impFaixas} em implantação*`)
      .join('\n');

    return {
      text: `📊 **Distribuição de Faixas por Tecnologia / Tipo de Fiscalização:**\n\n${tiposList}`,
      actions: [
        { type: 'NAVIGATE_TAB', label: 'Ver Gráfico de Tipos', payload: { tab: 'indicadores' } },
        { type: 'QUICK_PROMPT', label: 'Ver por Contrato', payload: { prompt: 'Qual a distribuição por contrato?' } },
      ],
    };
  }

  // 10. CONSULTA GERAL DE CONTRATOS
  if (lower.includes('contrato') || lower.includes('contratos') || lower.includes('lote') || lower.includes('lotes')) {
    const contratosList = Object.entries(porContrato)
      .map(([ct, v]) => `• **Contrato ${ct}:** ${v.faixas.toLocaleString('pt-BR')} faixas (${v.equip} equipamentos) | *${v.opFaixas} em operação*`)
      .join('\n');

    return {
      text: `📑 **Consolidação Geral por Contrato Vigente:**\n\n${contratosList}\n\n• **Total Geral:** **${totalFaixas.toLocaleString('pt-BR')} faixas** em **${totalEquip.toLocaleString('pt-BR')} equipamentos**.`,
      actions: [
        { type: 'NAVIGATE_TAB', label: 'Aba Gestão Contratual', payload: { tab: 'gestao_contratual' } },
        { type: 'NAVIGATE_TAB', label: 'Ver Indicadores', payload: { tab: 'indicadores' } },
      ],
    };
  }

  // RESPOSTA PADRÃO EXECUTIVA GEAPINHO
  return {
    text: `🏛️ **Resumo Geral da Fiscalização Eletrônica GEAPI / BHTRANS / PBH:**\n\n` +
      `• **Total de Faixas Fiscalizadas:** **${totalFaixas.toLocaleString('pt-BR')} faixas**\n` +
      `• **Total de Postos/Equipamentos:** **${totalEquip.toLocaleString('pt-BR')} equipamentos**\n` +
      `• **Em Operação:** **${opFaixas.toLocaleString('pt-BR')} faixas** (${opEquip} equipamentos)\n` +
      `• **Em Implantação:** **${impFaixas.toLocaleString('pt-BR')} faixas** (${impEquip} equipamentos)\n` +
      `• **Em Relocação / Inoperantes:** ${relFaixas + inopFaixas} faixas\n\n` +
      `💡 *Você pode perguntar diretamente sobre meses/datas de ativação (ex: "quantas faixas CEV entraram em operação no mês de setembro?"), contratos (2740, 2741, 2742), tipos (CEV, DAS, DIF), endereços ou códigos de radar.*`,
    actions: [
      { type: 'QUICK_PROMPT', label: 'Faixas em Operação', payload: { prompt: 'Quantas faixas estão em operação?' } },
      { type: 'QUICK_PROMPT', label: 'Entradas em Setembro', payload: { prompt: 'Quantas faixas entraram em operação no mês de setembro?' } },
      { type: 'QUICK_PROMPT', label: 'Divisão por Tipo', payload: { prompt: 'Qual a divisão de faixas por tipo de equipamento?' } },
      { type: 'NAVIGATE_TAB', label: 'Ver Mapa Interativo', payload: { tab: 'mapa' } },
    ],
  };
}

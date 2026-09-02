import { EquipmentRecord, FilterState } from '../types';
import { AIAction } from './aiService';

export interface LocalFallbackResponse {
  text: string;
  actions: AIAction[];
}

export function generateLocalFallbackResponse(
  message: string,
  records: EquipmentRecord[],
  filters?: FilterState
): LocalFallbackResponse {
  const lower = message.toLowerCase().trim();

  // Filtragem básica por contrato vigente
  const asksLegacy = lower.includes('2585') || lower.includes('2586') || lower.includes('2587') || lower.includes('antigo');
  const targetRecords = asksLegacy
    ? records
    : records.filter((r) => {
        const ct = (r.CONTRATO || '').toString();
        return ct.includes('2740') || ct.includes('2741') || ct.includes('2742');
      });

  const baseRecords = targetRecords.length > 0 ? targetRecords : records;

  // Totais
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

  const porContrato: Record<string, { equip: number; faixas: number; opFaixas: number; impFaixas: number }> = {};
  const porTipo: Record<string, { equip: number; faixas: number; opFaixas: number; impFaixas: number }> = {};

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
    if (!porContrato[ct]) porContrato[ct] = { equip: 0, faixas: 0, opFaixas: 0, impFaixas: 0 };
    porContrato[ct].equip++;
    porContrato[ct].faixas += f;
    if (isOp) porContrato[ct].opFaixas += f;
    else porContrato[ct].impFaixas += f;

    const tp = r.TIPO || 'Outro';
    if (!porTipo[tp]) porTipo[tp] = { equip: 0, faixas: 0, opFaixas: 0, impFaixas: 0 };
    porTipo[tp].equip++;
    porTipo[tp].faixas += f;
    if (isOp) porTipo[tp].opFaixas += f;
    else porTipo[tp].impFaixas += f;
  });

  // 1. Busca por código específico (ex: CEV-01, GBR-02, R123)
  const codeMatch = lower.match(/\b([A-Z]{2,4}[-\s]?\d+|\d{3,6})\b/i);
  if (codeMatch) {
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
          `• **Situação:** **${found.Situação || 'Em operação'}** (${found.FAIXAS || 1} faixas fiscalizadas)\n` +
          `• **Contrato / Empresa:** ${found.CONTRATO || '2740'} (${found.CONTRATADA || 'Consórcio'})\n` +
          `• **Coordenadas:** \`${found.lat || 'N/D'}, ${found.lng || 'N/D'}\`\n` +
          `• **Velocidade / Sentido:** ${found['Velocidade Fiscalizada'] ? found['Velocidade Fiscalizada'] + ' km/h' : 'N/D'} | ${found.SENTIDO || 'N/D'}`,
        actions: [
          { type: 'VIEW_EQUIPMENT', label: `Ver ${found.CÓDIGO}`, payload: { codigo: found.CÓDIGO } },
          { type: 'NAVIGATE_TAB', label: 'Abrir no Mapa', payload: { tab: 'mapa' } },
        ],
      };
    }
  }

  // 2. Pergunta sobre operação
  if (lower.includes('operação') || lower.includes('operacao') || lower.includes('ativo') || lower.includes('funcionando')) {
    return {
      text: `📍 **Faixas e Equipamentos em Operação:**\n\n` +
        `• **Total de Faixas Ativas:** **${opFaixas.toLocaleString('pt-BR')} faixas** (em ${opEquip.toLocaleString('pt-BR')} equipamentos).\n` +
        `• **Percentual:** ${totalFaixas > 0 ? ((opFaixas / totalFaixas) * 100).toFixed(1) : 0}% da rede fiscalizada total.\n\n` +
        `*Detalhamento por Contrato Vigente:*\n` +
        Object.entries(porContrato)
          .map(([ct, v]) => `  - **Contrato ${ct}:** ${v.opFaixas.toLocaleString('pt-BR')} faixas ativas (${v.equip} postos)`)
          .join('\n'),
      actions: [
        { type: 'NAVIGATE_TAB', label: 'Ver Indicadores', payload: { tab: 'indicadores' } },
        { type: 'NAVIGATE_TAB', label: 'Ver no Mapa', payload: { tab: 'mapa' } },
        { type: 'QUICK_PROMPT', label: 'Ver por Tipo (CEV/DAS/DIF)', payload: { prompt: 'Quantas faixas por tipo de equipamento?' } },
      ],
    };
  }

  // 3. Pergunta sobre implantação / projetado
  if (lower.includes('implantação') || lower.includes('implantacao') || lower.includes('projetado')) {
    return {
      text: `🚧 **Equipamentos e Faixas em Implantação:**\n\n` +
        `• **Total de Faixas em Implantação:** **${impFaixas.toLocaleString('pt-BR')} faixas** (${impEquip.toLocaleString('pt-BR')} equipamentos).\n` +
        `• **Em Relocação:** ${relFaixas.toLocaleString('pt-BR')} faixas (${relEquip} postos).\n\n` +
        `*Por Contrato:*\n` +
        Object.entries(porContrato)
          .map(([ct, v]) => `  - **Contrato ${ct}:** ${v.impFaixas.toLocaleString('pt-BR')} faixas a implantar`)
          .join('\n'),
      actions: [
        { type: 'NAVIGATE_TAB', label: 'Ver Tabela Completa', payload: { tab: 'tabela' } },
        { type: 'QUICK_PROMPT', label: 'Ver Faixas em Operação', payload: { prompt: 'Quantas faixas estão em operação?' } },
      ],
    };
  }

  // 4. Pergunta sobre tipos (CEV, DAS, DIF, etc.)
  if (lower.includes('tipo') || lower.includes('cev') || lower.includes('das') || lower.includes('dif') || lower.includes('dtlp')) {
    const tiposList = Object.entries(porTipo)
      .sort((a, b) => b[1].faixas - a[1].faixas)
      .map(([tp, v]) => `• **${tp}:** ${v.faixas.toLocaleString('pt-BR')} faixas (${v.equip} equipamentos) — *${v.opFaixas} em operação / ${v.impFaixas} em implantação*`)
      .join('\n');

    return {
      text: `📊 **Distribuição de Faixas por Tecnologia / Tipo de Fiscalização:**\n\n${tiposList}`,
      actions: [
        { type: 'NAVIGATE_TAB', label: 'Ver Gráfico de Tipos', payload: { tab: 'indicadores' } },
        { type: 'QUICK_PROMPT', label: 'Ver por Contrato', payload: { prompt: 'Qual a distribuição por contrato?' } },
      ],
    };
  }

  // 5. Pergunta sobre contratos
  if (lower.includes('contrato') || lower.includes('2740') || lower.includes('2741') || lower.includes('2742')) {
    const contratosList = Object.entries(porContrato)
      .map(([ct, v]) => `• **Contrato ${ct}:** ${v.faixas.toLocaleString('pt-BR')} faixas (${v.equip} equipamentos) | *${v.opFaixas} ativas*`)
      .join('\n');

    return {
      text: `📑 **Consolidação Geral por Contrato:**\n\n${contratosList}\n\n• **Total Geral:** **${totalFaixas.toLocaleString('pt-BR')} faixas** em **${totalEquip.toLocaleString('pt-BR')} equipamentos**.`,
      actions: [
        { type: 'NAVIGATE_TAB', label: 'Aba Gestão Contratual', payload: { tab: 'gestao_contratual' } },
        { type: 'NAVIGATE_TAB', label: 'Ver Indicadores', payload: { tab: 'indicadores' } },
      ],
    };
  }

  // Resposta Padrão Executiva GEAPI
  return {
    text: `🏛️ **Resumo Geral da Fiscalização Eletrônica GEAPI / BHTRANS / PBH:**\n\n` +
      `• **Total de Faixas Fiscalizadas:** **${totalFaixas.toLocaleString('pt-BR')} faixas**\n` +
      `• **Total de Postos/Equipamentos:** **${totalEquip.toLocaleString('pt-BR')} equipamentos**\n` +
      `• **Em Operação:** **${opFaixas.toLocaleString('pt-BR')} faixas** (${opEquip} equipamentos)\n` +
      `• **Em Implantação:** **${impFaixas.toLocaleString('pt-BR')} faixas** (${impEquip} equipamentos)\n` +
      `• **Em Relocação / Inoperantes:** ${relFaixas + inopFaixas} faixas\n\n` +
      `💡 *Você pode perguntar sobre contratos específicos (2740, 2741, 2742), tipos (CEV, DAS, DIF), endereços, vias, bairros ou digitar o código de um radar (ex: R101).*`,
    actions: [
      { type: 'QUICK_PROMPT', label: 'Faixas em Operação', payload: { prompt: 'Quantas faixas estão em operação?' } },
      { type: 'QUICK_PROMPT', label: 'Divisão por Tipo', payload: { prompt: 'Qual a divisão de faixas por tipo de equipamento?' } },
      { type: 'QUICK_PROMPT', label: 'Divisão por Contrato', payload: { prompt: 'Qual a distribuição por contrato?' } },
      { type: 'NAVIGATE_TAB', label: 'Ver Mapa Interativo', payload: { tab: 'mapa' } },
    ],
  };
}

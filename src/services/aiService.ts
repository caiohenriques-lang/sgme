import { EquipmentRecord, FilterState } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  actions?: AIAction[];
}

export interface AIAction {
  type: 'NAVIGATE_TAB' | 'VIEW_EQUIPMENT' | 'APPLY_FILTERS' | 'DOWNLOAD_PDF' | 'OPEN_GOOGLE_MAPS' | 'QUICK_PROMPT';
  label: string;
  payload?: any;
}

export interface SendMessageParams {
  message: string;
  history: { role: 'user' | 'model'; parts: string }[];
  records: EquipmentRecord[];
  filters?: FilterState;
  activeTab?: string;
}

export async function sendChatMessage({
  message,
  history,
  records,
  filters,
  activeTab,
}: SendMessageParams): Promise<{ text: string; actions?: AIAction[] }> {
  const lowerMsg = message.toLowerCase();
  
  // Regra de priorização: Se o usuário NÃO pediu expressamente contratos antigos (ex: 2585, 2586, 2587, "contratos antigos", "histórico antigo", "todos os contratos"),
  // filtramos prioritariamente pelos contratos vigentes 2740, 2741 e 2742.
  const asksForLegacyOrAll = 
    lowerMsg.includes('2585') ||
    lowerMsg.includes('2586') ||
    lowerMsg.includes('2587') ||
    lowerMsg.includes('antigo') ||
    lowerMsg.includes('anteriores') ||
    lowerMsg.includes('todos os contratos') ||
    lowerMsg.includes('todas as épocas') ||
    lowerMsg.includes('histórico completo');

  const activeContractRecords = asksForLegacyOrAll
    ? records
    : records.filter(r => {
        const ct = (r.CONTRATO || '').toString().toLowerCase();
        return ct.includes('2740') || ct.includes('2741') || ct.includes('2742');
      });

  // Base de trabalho principal conforme a diretriz de prioridade
  const targetRecords = activeContractRecords.length > 0 ? activeContractRecords : records;

  // Prepara um resumo contextual compacto e rico dos dados do GEAPI
  const total = targetRecords.length;

  // Classificação padronizada conforme as regras do Portal GEAPI (IndicatorsView):
  // Situação: "Em operação" / "Operação" => OPERAÇÃO
  // Situação: "Em relocação" / "Relocação" => RELOCAÇÃO
  // Situação: "Em implantação" / "Implantação" / "Projetado" => IMPLANTAÇÃO
  // Situação: "Inoperante" / "Desativado" => INOPERANTE
  const ativos = targetRecords.filter(r => {
    const sit = (r.Situação || '').toLowerCase();
    return sit.includes('operação') || sit.includes('operacao') || sit.includes('ativo');
  }).length;

  const emRelocacao = targetRecords.filter(r => {
    const sit = (r.Situação || '').toLowerCase();
    return sit.includes('relocação') || sit.includes('relocacao');
  }).length;

  const inoperantes = targetRecords.filter(r => {
    const sit = (r.Situação || '').toLowerCase();
    return sit.includes('inoperante') || sit.includes('desativado');
  }).length;

  const emImplantacao = targetRecords.filter(r => {
    const sit = (r.Situação || '').toLowerCase();
    return sit.includes('implantação') || sit.includes('implantacao') || sit.includes('projetado');
  }).length;

  const comCoords = targetRecords.filter(r => r.hasValidCoord).length;

  // Agregações de Faixas no total
  let totalFaixasGeral = 0;
  let faixasOperacaoGeral = 0;
  let faixasImplantacaoGeral = 0;
  let faixasRelocacaoGeral = 0;
  let faixasInoperantesGeral = 0;

  // Contratos
  const porContrato: Record<string, { equipamentos: number; faixas: number; faixasOperacao: number; faixasImplantacao: number }> = {};
  // Regionais
  const porRegional: Record<string, { equipamentos: number; faixas: number; faixasOperacao: number }> = {};
  // Tipos detalhados (equipamentos e faixas em operação, implantação e relocação)
  const porTipo: Record<
    string,
    {
      equipamentos: number;
      faixas: number;
      faixasOperacao: number;
      faixasImplantacao: number;
      faixasRelocacao: number;
      faixasInoperantes: number;
      equipamentosOperacao: number;
      equipamentosImplantacao: number;
      equipamentosRelocacao: number;
    }
  > = {};
  // Corredores / Principais Logradouros
  const porCorredor: Record<
    string,
    {
      totalEquipamentos: number;
      totalFaixas: number;
      faixasOperacao: number;
      faixasImplantacao: number;
      faixasRelocacao: number;
      faixasInoperantes: number;
      codigos: string[];
      contratos: Set<string>;
    }
  > = {};

  targetRecords.forEach(r => {
    const numFaixas = typeof r.FAIXAS === 'number' && !isNaN(r.FAIXAS) ? r.FAIXAS : 1;
    totalFaixasGeral += numFaixas;

    const sit = (r.Situação || '').toLowerCase();
    const cond = (r.CONDIÇÃO || '').toLowerCase();
    
    const isOp = sit.includes('operação') || sit.includes('operacao') || sit.includes('ativo');
    const isRel = sit.includes('relocação') || sit.includes('relocacao');
    const isInop = sit.includes('inoperante') || sit.includes('desativado');
    const isImp = sit.includes('implantação') || sit.includes('implantacao') || cond.includes('projetado') || (!isOp && !isRel && !isInop);

    if (isOp) {
      faixasOperacaoGeral += numFaixas;
    } else if (isRel) {
      faixasRelocacaoGeral += numFaixas;
    } else if (isInop) {
      faixasInoperantesGeral += numFaixas;
    } else {
      faixasImplantacaoGeral += numFaixas;
    }

    const ct = r.CONTRATO || 'Outro';
    if (!porContrato[ct]) porContrato[ct] = { equipamentos: 0, faixas: 0, faixasOperacao: 0, faixasImplantacao: 0 };
    porContrato[ct].equipamentos += 1;
    porContrato[ct].faixas += numFaixas;
    if (isOp) porContrato[ct].faixasOperacao += numFaixas;
    if (isImp) porContrato[ct].faixasImplantacao += numFaixas;

    const reg = r.REGIONAL || 'N/D';
    if (!porRegional[reg]) porRegional[reg] = { equipamentos: 0, faixas: 0, faixasOperacao: 0 };
    porRegional[reg].equipamentos += 1;
    porRegional[reg].faixas += numFaixas;
    if (isOp) porRegional[reg].faixasOperacao += numFaixas;

    const tp = r.TIPO || 'N/D';
    if (!porTipo[tp]) {
      porTipo[tp] = {
        equipamentos: 0,
        faixas: 0,
        faixasOperacao: 0,
        faixasImplantacao: 0,
        faixasRelocacao: 0,
        faixasInoperantes: 0,
        equipamentosOperacao: 0,
        equipamentosImplantacao: 0,
        equipamentosRelocacao: 0,
      };
    }
    porTipo[tp].equipamentos += 1;
    porTipo[tp].faixas += numFaixas;
    if (isOp) {
      porTipo[tp].faixasOperacao += numFaixas;
      porTipo[tp].equipamentosOperacao += 1;
    } else if (isRel) {
      porTipo[tp].faixasRelocacao += numFaixas;
      porTipo[tp].equipamentosRelocacao += 1;
    } else if (isInop) {
      porTipo[tp].faixasInoperantes += numFaixas;
    } else {
      porTipo[tp].faixasImplantacao += numFaixas;
      porTipo[tp].equipamentosImplantacao += 1;
    }

    // Normaliza nome do Corredor ou Logradouro
    const corredorRaw = (r.CORREDOR || '').trim();
    const endRaw = (r['ENDEREÇOS DOS EQUIPAMENTOS'] || r['ENDEREÇO COMPLETO'] || '').trim();
    
    // Identifica via principal
    let corredorKey = corredorRaw;
    if (!corredorKey || corredorKey.length < 3) {
      const matchVia = endRaw.match(/^(AV\.|AVENIDA|RUA|RODOVIA|PRAÇA|ALAMEDA|VIADUTO|TRINCHEIRA)\s+([^,]+)/i);
      corredorKey = matchVia ? `${matchVia[1].toUpperCase()} ${matchVia[2].trim().toUpperCase()}` : endRaw.split(',')[0].toUpperCase().trim();
    }

    if (corredorKey) {
      if (!porCorredor[corredorKey]) {
        porCorredor[corredorKey] = {
          totalEquipamentos: 0,
          totalFaixas: 0,
          faixasOperacao: 0,
          faixasImplantacao: 0,
          faixasRelocacao: 0,
          faixasInoperantes: 0,
          codigos: [],
          contratos: new Set(),
        };
      }
      porCorredor[corredorKey].totalEquipamentos += 1;
      porCorredor[corredorKey].totalFaixas += numFaixas;
      if (r.CÓDIGO) porCorredor[corredorKey].codigos.push(r.CÓDIGO);
      if (r.CONTRATO) porCorredor[corredorKey].contratos.add(r.CONTRATO);

      if (isOp) {
        porCorredor[corredorKey].faixasOperacao += numFaixas;
      } else if (isRel) {
        porCorredor[corredorKey].faixasRelocacao += numFaixas;
      } else if (isInop) {
        porCorredor[corredorKey].faixasInoperantes += numFaixas;
      } else {
        porCorredor[corredorKey].faixasImplantacao += numFaixas;
      }
    }
  });

  // Agregações cronológicas de Entrada em Operação (por data, por mês/ano e por ano)
  const ativacoesPorData: Record<string, { totalFaixas: number; totalEquipamentos: number; porTipo: Record<string, { faixas: number; equipamentos: number }>; porContrato: Record<string, number> }> = {};
  const ativacoesPorMesAno: Record<string, { totalFaixas: number; totalEquipamentos: number; mes: string; ano: string; porTipo: Record<string, { faixas: number; equipamentos: number }>; datas: string[] }> = {};
  const ativacoesPorAno: Record<string, { totalFaixas: number; totalEquipamentos: number; porTipo: Record<string, { faixas: number; equipamentos: number }> }> = {};

  targetRecords.forEach(r => {
    const rawDate = (r['Data início operação'] || '').trim();
    if (!rawDate) return;
    const numFaixas = typeof r.FAIXAS === 'number' && !isNaN(r.FAIXAS) ? r.FAIXAS : 1;
    const tp = r.TIPO || 'N/D';
    const ct = r.CONTRATO || 'N/D';

    // Normaliza formato DD/MM/AAAA
    const parts = rawDate.split(/[\/\-\.]/);
    if (parts.length === 3) {
      const d = parts[0].padStart(2, '0');
      const m = parts[1].padStart(2, '0');
      const y = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
      const normDate = `${d}/${m}/${y}`;
      const mesAno = `${m}/${y}`;

      // Por data
      if (!ativacoesPorData[normDate]) {
        ativacoesPorData[normDate] = { totalFaixas: 0, totalEquipamentos: 0, porTipo: {}, porContrato: {} };
      }
      ativacoesPorData[normDate].totalFaixas += numFaixas;
      ativacoesPorData[normDate].totalEquipamentos += 1;
      if (!ativacoesPorData[normDate].porTipo[tp]) ativacoesPorData[normDate].porTipo[tp] = { faixas: 0, equipamentos: 0 };
      ativacoesPorData[normDate].porTipo[tp].faixas += numFaixas;
      ativacoesPorData[normDate].porTipo[tp].equipamentos += 1;
      ativacoesPorData[normDate].porContrato[ct] = (ativacoesPorData[normDate].porContrato[ct] || 0) + numFaixas;

      // Por mês/ano (ex: "08/2026", "08/2025")
      if (!ativacoesPorMesAno[mesAno]) {
        ativacoesPorMesAno[mesAno] = { totalFaixas: 0, totalEquipamentos: 0, mes: m, ano: y, porTipo: {}, datas: [] };
      }
      ativacoesPorMesAno[mesAno].totalFaixas += numFaixas;
      ativacoesPorMesAno[mesAno].totalEquipamentos += 1;
      if (!ativacoesPorMesAno[mesAno].porTipo[tp]) ativacoesPorMesAno[mesAno].porTipo[tp] = { faixas: 0, equipamentos: 0 };
      ativacoesPorMesAno[mesAno].porTipo[tp].faixas += numFaixas;
      ativacoesPorMesAno[mesAno].porTipo[tp].equipamentos += 1;
      if (!ativacoesPorMesAno[mesAno].datas.includes(normDate)) ativacoesPorMesAno[mesAno].datas.push(normDate);

      // Por ano (ex: "2026", "2025")
      if (!ativacoesPorAno[y]) {
        ativacoesPorAno[y] = { totalFaixas: 0, totalEquipamentos: 0, porTipo: {} };
      }
      ativacoesPorAno[y].totalFaixas += numFaixas;
      ativacoesPorAno[y].totalEquipamentos += 1;
      if (!ativacoesPorAno[y].porTipo[tp]) ativacoesPorAno[y].porTipo[tp] = { faixas: 0, equipamentos: 0 };
      ativacoesPorAno[y].porTipo[tp].faixas += numFaixas;
      ativacoesPorAno[y].porTipo[tp].equipamentos += 1;
    }
  });

  // Identifica se a pergunta busca um corredor específico
  const corredoresFormatados: any[] = [];
  Object.entries(porCorredor).forEach(([nome, dados]) => {
    const nomeLower = nome.toLowerCase();
    // Se a mensagem mencionar partes do nome do corredor ou for um dos principais
    const isMencionado = lowerMsg.split(' ').some(word => word.length > 3 && nomeLower.includes(word));
    if (isMencionado || dados.totalFaixas >= 10) {
      corredoresFormatados.push({
        corredor: nome,
        totalEquipamentos: dados.totalEquipamentos,
        totalFaixas: dados.totalFaixas,
        faixasEmOperacao: dados.faixasOperacao,
        faixasEmImplantacao: dados.faixasImplantacao,
        faixasEmRelocacao: dados.faixasRelocacao,
        faixasInoperantes: dados.faixasInoperantes,
        contratos: Array.from(dados.contratos),
        codigosAmostra: dados.codigos.slice(0, 8),
      });
    }
  });

  // Extração de termos-chave e normalização para busca de Locais, Vias, Bairros e Equipamentos
  const searchTokens = lowerMsg
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !['onde', 'qual', 'quais', 'quantos', 'quantas', 'faixa', 'faixas', 'radar', 'radares', 'equipamento', 'equipamentos', 'para', 'com', 'tem', 'estao', 'está'].includes(t));

  // Amostra rica de busca caso a mensagem cite um código específico, rua, bairro, regional ou corredor
  const matchedRecords = targetRecords.filter(r => {
    const cod = (r.CÓDIGO || '').toLowerCase();
    const end = (r['ENDEREÇO COMPLETO'] || r['ENDEREÇOS DOS EQUIPAMENTOS'] || '').toLowerCase();
    const cor = (r.CORREDOR || '').toLowerCase();
    const bai = (r.BAIRRO || '').toLowerCase();
    const reg = (r.REGIONAL || '').toLowerCase();

    if (cod && lowerMsg.includes(cod)) return true;
    if (cor && (lowerMsg.includes(cor) || searchTokens.some(tok => cor.includes(tok)))) return true;
    if (searchTokens.some(tok => end.includes(tok) || bai.includes(tok) || reg.includes(tok))) return true;
    return false;
  }).slice(0, 35);

  // Lista de equipamentos com aferição vencida ou próxima
  const contextPayload = {
    prioridadeContratosVigentes: !asksForLegacyOrAll,
    escopoContratos: asksForLegacyOrAll ? 'Todos os contratos (incluindo anteriores 2585, 2586, 2587)' : 'Contratos Atuais Vigentes: 2740/2024, 2741/2024 e 2742/2024',
    summary: {
      totalEquipamentos: total,
      totalFaixasFiscalizadas: totalFaixasGeral,
      faixasEmOperacao: faixasOperacaoGeral,
      faixasEmImplantacao: faixasImplantacaoGeral,
      faixasEmRelocacao: faixasRelocacaoGeral,
      faixasInoperantes: faixasInoperantesGeral,
      equipamentosEmOperacao: ativos,
      equipamentosEmRelocacao: emRelocacao,
      equipamentosInoperantes: inoperantes,
      equipamentosEmImplantacao: emImplantacao,
      comCoords,
      porContrato,
      porRegional,
      porTipo,
      filtroAtual: filters,
      abaAtual: activeTab,
    },
    historicoAtivacoes: {
      ativacoesPorMesAno,
      ativacoesPorAno,
      ativacoesPorData,
    },
    dadosAgregadosCorredores: corredoresFormatados.slice(0, 15),
    matchedRecords: matchedRecords.slice(0, 15).map(r => ({
      codigo: r.CÓDIGO,
      contrato: r.CONTRATO,
      corredor: r.CORREDOR,
      tipo: r.TIPO,
      faixas: r.FAIXAS,
      endereco: r['ENDEREÇO COMPLETO'],
      bairro: r.BAIRRO,
      regional: r.REGIONAL,
      situacao: r.Situação,
      condicao: r.CONDIÇÃO,
      dataInicio: r['Data início operação'],
      vencAfericao: r['Data de Vencimento da Aferição'],
      dataDesligamento: r['Data de Desligamento'],
      lat: r.lat,
      lng: r.lng,
      empresa: r.CONTRATADA,
    })),
    totalRegistrosDisponiveis: targetRecords.length,
  };

  let response: Response;
  const controller = new AbortController();
  // Limite estrito de 6 segundos para a API do Gemini responder; se demorar, aciona o motor local instantaneamente (<10ms)
  const timeoutId = setTimeout(() => controller.abort(), 6000);

  try {
    response = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        message,
        history,
        context: contextPayload,
      }),
    });
  } catch (networkErr: any) {
    clearTimeout(timeoutId);
    console.warn('Backend de IA indisponível ou demorado, acionando motor analítico ultrarrápido:', networkErr);
    const { generateLocalFallbackResponse } = await import('./localAiFallback');
    return generateLocalFallbackResponse(message, records, filters);
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errString = (errorData.error || '').toString();
    
    // Se a chave Gemini não estiver configurada no ambiente ou houver erro 500/timeout, responde imediatamente com o motor local embutido
    if (errString.includes('GEMINI_API_KEY') || response.status === 500 || response.status === 504) {
      console.warn('GEMINI_API_KEY não configurada ou instabilidade no servidor. Utilizando motor analítico local GEAPI.');
      const { generateLocalFallbackResponse } = await import('./localAiFallback');
      return generateLocalFallbackResponse(message, records, filters);
    }

    throw new Error(errorData.error || `Erro ${response.status}: Falha ao comunicar com o Assistente de IA`);
  }

  const data = await response.json();
  return {
    text: data.text || 'Desculpe, não consegui processar a resposta.',
    actions: data.actions || [],
  };
}

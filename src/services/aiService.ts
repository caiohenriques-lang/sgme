import { EquipmentRecord, FilterState } from '../types';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: Date;
  actions?: AIAction[];
}

export interface AIAction {
  type: 'NAVIGATE_TAB' | 'VIEW_EQUIPMENT' | 'APPLY_FILTERS' | 'DOWNLOAD_PDF' | 'OPEN_GOOGLE_MAPS';
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
  // Prepara um resumo contextual compacto e rico dos dados do GEAPI
  const total = records.length;
  const ativos = records.filter(r => r.Situação?.toLowerCase().includes('ativo')).length;
  const inoperantes = records.filter(r => r.Situação?.toLowerCase().includes('inoperante')).length;
  const emImplantacao = records.filter(r => r.Situação?.toLowerCase().includes('implantação')).length;
  const comCoords = records.filter(r => r.hasValidCoord).length;

  // Contratos
  const porContrato: Record<string, number> = {};
  // Regionais
  const porRegional: Record<string, number> = {};
  // Tipos
  const porTipo: Record<string, number> = {};

  records.forEach(r => {
    const ct = r.CONTRATO || 'Outro';
    porContrato[ct] = (porContrato[ct] || 0) + 1;
    const reg = r.REGIONAL || 'N/D';
    porRegional[reg] = (porRegional[reg] || 0) + 1;
    const tp = r.TIPO || 'N/D';
    porTipo[tp] = (porTipo[tp] || 0) + 1;
  });

  // Amostra de busca caso a mensagem cite um código específico ou rua
  const lowerMsg = message.toLowerCase();
  const matchedRecords = records.filter(r => {
    if (r.CÓDIGO && lowerMsg.includes(r.CÓDIGO.toLowerCase())) return true;
    if (r['ENDEREÇO COMPLETO'] && lowerMsg.includes(r['ENDEREÇO COMPLETO'].toLowerCase().slice(0, 15))) return true;
    return false;
  }).slice(0, 10);

  // Lista de equipamentos com aferição vencida ou próxima
  const contextPayload = {
    summary: {
      total,
      ativos,
      inoperantes,
      emImplantacao,
      comCoords,
      porContrato,
      porRegional,
      porTipo,
      filtroAtual: filters,
      abaAtual: activeTab,
    },
    matchedRecords: matchedRecords.map(r => ({
      codigo: r.CÓDIGO,
      contrato: r.CONTRATO,
      tipo: r.TIPO,
      faixas: r.FAIXAS,
      endereco: r['ENDEREÇO COMPLETO'],
      bairro: r.BAIRRO,
      regional: r.REGIONAL,
      situacao: r.Situação,
      condicao: r.CONDIÇÃO,
      dataInicio: r['Data início operação'],
      dataAceite: r['Data de aceite'],
      vencAfericao: r['Data de Vencimento da Aferição'],
      lat: r.lat,
      lng: r.lng,
      coordStr: r.COORD_LAT_LONG,
      os: r.OS,
      serie: r['Nº DE SÉRIE'],
      empresa: r.CONTRATADA,
    })),
    // Amostra geral de até 80 registros se necessário para queries específicas
    sampleRecordsCount: records.length,
  };

  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      history,
      context: contextPayload,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro ${response.status}: Falha ao comunicar com o Assistente de IA`);
  }

  const data = await response.json();
  return {
    text: data.text || 'Desculpe, não consegui processar a resposta.',
    actions: data.actions || [],
  };
}

import Papa from 'papaparse';

export interface BHDigitalRecord {
  id: string;
  bhdigital: string;
  tempoAtendimento: number;
  fase: string;
  logradouro: string;
  numero: string;
  bairro: string;
  regional: string;
  dataCriacao: string;
  dataEncerramento: string;
  tipo: string;
  atendido: string;
  responsavel: string;
  digitador: string;
  observacoes: string;
  ano: string;
}

export interface BHDigitalFilters {
  regional?: string | null;
  fase?: string | null;
  tipo?: string | null;
  ano?: string | null;
  atendido?: string | null;
}

export interface RegionalSummaryItem {
  regional: string;
  quantidade: number;
}

export interface SituacaoSummaryItem {
  fase: string;
  quantidade: number;
  percentual: number;
  percentualFormatted: string;
  color: string;
}

export interface TipoEquipamentoSummaryItem {
  tipo: string;
  quantidade: number;
  percentual: number;
  percentualFormatted: string;
  color: string;
}

export interface AnualSummaryItem {
  ano: string;
  quantidade: number;
}

export interface QualificadoSummaryItem {
  qualificado: string;
  quantidade: number;
  percentual: number;
  percentualFormatted: string;
  color: string;
}

export interface LogradouroMatrixRow {
  logradouro: string;
  das: number;
  naoSeAplica: number;
  cev: number;
  dif: number;
  dasDcp: number;
  dtlp: number;
  totalGeral: number;
}

export const BHDIGITAL_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyAnXMKd3aDXjNRt8QzsRLww2Gt5XJ9sN9HjXrv4TsBVKGArPVAFaj5Inb3-_t4x4z1Cy2TzEscbgb/pub?gid=1117241896&single=true&output=csv';

// Normaliza string para chave uniforme
function normalizeKey(str: string): string {
  return (str || '').trim().toUpperCase();
}

export async function fetchBHDigitalData(): Promise<BHDigitalRecord[]> {
  const urls = [
    `${BHDIGITAL_CSV_URL}&_cb=${Date.now()}`,
    `https://corsproxy.io/?${encodeURIComponent(`${BHDIGITAL_CSV_URL}&_cb=${Date.now()}`)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(`${BHDIGITAL_CSV_URL}&_cb=${Date.now()}`)}`
  ];

  let csvText = '';

  for (const url of urls) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) {
        const text = await response.text();
        if (text && (text.includes('BHDIGITAL') || text.includes('BH DIGITAL') || text.includes('LOGRADOURO'))) {
          csvText = text;
          break;
        }
      }
    } catch (err) {
      console.warn(`Tentativa de carregar BHDigital falhou para ${url}:`, err);
    }
  }

  // Se o fetch falhar, tenta recuperar do cache local
  if (!csvText) {
    const cached = localStorage.getItem('geapi_bhdigital_cache');
    if (cached) {
      try {
        const parsedCached = JSON.parse(cached);
        if (Array.isArray(parsedCached) && parsedCached.length > 0) {
          return parsedCached;
        }
      } catch (e) {
        console.error('Erro ao ler cache do BHDigital:', e);
      }
    }
    return [];
  }

  try {
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (!parsed.data || parsed.data.length === 0) {
      return [];
    }

    const records: BHDigitalRecord[] = [];

    parsed.data.forEach((row, index) => {
      const bhdigital = (row['BHDIGITAL'] || row['BH DIGITAL'] || '').trim();
      const logradouro = (row['LOGRADOURO'] || '').trim();
      
      // Linha vazia ou cabeçalho redundante
      if (!bhdigital && !logradouro) return;

      const tempoStr = (row['TEMPO DE ATENDIMENTO'] || '').trim().replace(',', '.');
      const tempoAtendimento = parseFloat(tempoStr) || 0;
      const fase = (row['FASE DE ATENDIMENTO'] || row['FASE'] || 'Encerrado').trim();
      const numero = (row['Nº'] || row['NUMERO'] || '').trim();
      const bairro = (row['BAIRRO'] || '').trim();
      const regional = (row['REGIONAL'] || '').trim();
      const dataCriacao = (row['DATA DA CRIAÇÃO'] || row['DATA DE CRIACAO'] || '').trim();
      const dataEncerramento = (row['DATA DO ENCERRAMENTO'] || '').trim();
      const tipoRaw = (row['TIPO DE EQUIPAMENTO'] || row['TIPO'] || 'NÃO SE APLICA').trim();
      const atendidoRaw = (row['ATENDIDO?'] || row['ATENDIDO'] || 'NÃO').trim();
      const responsavel = (row['RESPONSÁVEL'] || row['RESPONSAVEL'] || '').trim();
      const digitador = (row['DIGITADOR'] || '').trim();
      const observacoes = (row['OBSERVAÇÕES'] || row['OBSERVACOES'] || '').trim();

      // Normaliza Tipo de Equipamento
      let tipo = tipoRaw;
      const tipoUpper = normalizeKey(tipoRaw);
      if (tipoUpper.includes('NÃO SE APLICA') || tipoUpper.includes('NAO SE APLICA') || !tipoRaw) {
        tipo = 'NÃO SE APLICA';
      } else if (tipoUpper === 'DAS+DCP' || tipoUpper === 'DAS + DCP') {
        tipo = 'DAS+DCP';
      } else if (tipoUpper === 'DAS') {
        tipo = 'DAS';
      } else if (tipoUpper === 'CEV') {
        tipo = 'CEV';
      } else if (tipoUpper === 'DIF') {
        tipo = 'DIF';
      } else if (tipoUpper === 'DTLP') {
        tipo = 'DTLP';
      }

      // Normaliza Atendido
      let atendido = atendidoRaw;
      const atendidoUpper = normalizeKey(atendidoRaw);
      if (atendidoUpper === 'SIM' || atendidoUpper === 'S') {
        atendido = 'SIM';
      } else if (atendidoUpper === 'NÃO' || atendidoUpper === 'NAO' || atendidoUpper === 'N') {
        atendido = 'NÃO';
      } else {
        atendido = 'Não se aplica';
      }

      // Extrai ano
      let ano = '';
      if (dataCriacao) {
        const parts = dataCriacao.split('/');
        if (parts.length === 3) {
          ano = parts[2].trim();
        }
      }
      if (!ano && bhdigital) {
        // Tenta extrair do número do processo ex: 31.00206194/2021-35 -> 2021
        const match = bhdigital.match(/\/(\d{4})/);
        if (match) {
          ano = match[1];
        }
      }

      records.push({
        id: `bhd-${index}-${bhdigital || logradouro}`,
        bhdigital,
        tempoAtendimento,
        fase: fase || 'Encerrado',
        logradouro: logradouro.toUpperCase(),
        numero,
        bairro,
        regional: regional || 'N/A',
        dataCriacao,
        dataEncerramento,
        tipo,
        atendido,
        responsavel,
        digitador,
        observacoes,
        ano: ano || 'Outros',
      });
    });

    if (records.length > 0) {
      try {
        localStorage.setItem('geapi_bhdigital_cache', JSON.stringify(records));
      } catch (e) {
        console.warn('Não foi possível salvar cache local de BHDigital:', e);
      }
    }

    return records;
  } catch (error) {
    console.error('Erro ao processar dados BHDIGITAL:', error);
    return [];
  }
}

/**
 * Calcula os indicadores e agregações a partir dos registros filtrados
 */
export function calculateBHDigitalStats(records: BHDigitalRecord[]) {
  // 1. Tempo Médio de Resposta
  const recordsWithTempo = records.filter((r) => r.tempoAtendimento > 0);
  const tempoMedio = recordsWithTempo.length > 0
    ? Math.round(recordsWithTempo.reduce((sum, r) => sum + r.tempoAtendimento, 0) / recordsWithTempo.length)
    : 0;

  // 2. Pedidos por Regional
  const regionalCounts: Record<string, number> = {};
  records.forEach((r) => {
    if (r.regional && r.regional !== 'N/A') {
      regionalCounts[r.regional] = (regionalCounts[r.regional] || 0) + 1;
    }
  });

  const regionalSummary: RegionalSummaryItem[] = Object.entries(regionalCounts)
    .map(([regional, quantidade]) => ({ regional, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  // 3. Situação (Fase)
  const faseCounts: Record<string, number> = {};
  records.forEach((r) => {
    const f = r.fase.toLowerCase().includes('andamento') ? 'Em andamento' : 'Encerrado';
    faseCounts[f] = (faseCounts[f] || 0) + 1;
  });

  const totalFase = records.length || 1;
  const situacaoSummary: SituacaoSummaryItem[] = [
    {
      fase: 'Encerrado',
      quantidade: faseCounts['Encerrado'] || 0,
      percentual: ((faseCounts['Encerrado'] || 0) / totalFase) * 100,
      percentualFormatted: `${(((faseCounts['Encerrado'] || 0) / totalFase) * 100).toFixed(0).replace('.', ',')}%`,
      color: '#10b981', // Verde
    },
    {
      fase: 'Em andamento',
      quantidade: faseCounts['Em andamento'] || 0,
      percentual: ((faseCounts['Em andamento'] || 0) / totalFase) * 100,
      percentualFormatted: `${(((faseCounts['Em andamento'] || 0) / totalFase) * 100).toFixed(0).replace('.', ',')}%`,
      color: '#ef4444', // Vermelho
    },
  ].filter((s) => s.quantidade > 0);

  // 4. Tipo de Equipamento
  const tipoCounts: Record<string, number> = {};
  records.forEach((r) => {
    tipoCounts[r.tipo] = (tipoCounts[r.tipo] || 0) + 1;
  });

  const tipoColors: Record<string, string> = {
    'DAS': '#10b981', // Verde
    'NÃO SE APLICA': '#f59e0b', // Laranja / Âmbar
    'CEV': '#2563eb', // Azul
    'DIF': '#ef4444', // Vermelho
    'DAS+DCP': '#06b6d4', // Ciano
    'DTLP': '#8b5cf6', // Roxo
  };

  const totalTipo = records.length || 1;
  const tipoSummary: TipoEquipamentoSummaryItem[] = Object.entries(tipoCounts)
    .map(([tipo, quantidade]) => ({
      tipo,
      quantidade,
      percentual: (quantidade / totalTipo) * 100,
      percentualFormatted: `${((quantidade / totalTipo) * 100).toFixed(1).replace('.', ',')}%`,
      color: tipoColors[tipo] || '#64748b',
    }))
    .sort((a, b) => b.quantidade - a.quantidade);

  // 5. Solicitações por Ano
  const anoCounts: Record<string, number> = {};
  records.forEach((r) => {
    if (r.ano && r.ano !== 'Outros') {
      anoCounts[r.ano] = (anoCounts[r.ano] || 0) + 1;
    }
  });

  const anosOrder = ['2021', '2022', '2023', '2024', '2025', '2026'];
  const anoSummary: AnualSummaryItem[] = anosOrder
    .map((ano) => ({
      ano,
      quantidade: anoCounts[ano] || 0,
    }))
    .filter((a) => a.quantidade > 0 || anoCounts[a.ano] !== undefined);

  // 6. Pedidos Qualificados para Implantação (Atendido?)
  const atendidoCounts: Record<string, number> = {};
  records.forEach((r) => {
    atendidoCounts[r.atendido] = (atendidoCounts[r.atendido] || 0) + 1;
  });

  const totalAtendido = records.length || 1;
  const qualificadoColors: Record<string, string> = {
    'SIM': '#10b981', // Verde
    'NÃO': '#ef4444', // Vermelho
    'Não se aplica': '#64748b', // Cinza
  };

  const qualificadoSummary: QualificadoSummaryItem[] = ['SIM', 'NÃO', 'Não se aplica']
    .map((qualificado) => {
      const quantidade = atendidoCounts[qualificado] || 0;
      return {
        qualificado,
        quantidade,
        percentual: (quantidade / totalAtendido) * 100,
        percentualFormatted: `${((quantidade / totalAtendido) * 100).toFixed(1).replace('.', ',')}%`,
        color: qualificadoColors[qualificado] || '#64748b',
      };
    })
    .filter((q) => q.quantidade > 0);

  // 7. Matriz de Logradouros com Mais Solicitações
  const logradouroMap: Record<string, LogradouroMatrixRow> = {};

  records.forEach((r) => {
    const logra = r.logradouro.trim();
    if (!logra) return;

    if (!logradouroMap[logra]) {
      logradouroMap[logra] = {
        logradouro: logra,
        das: 0,
        naoSeAplica: 0,
        cev: 0,
        dif: 0,
        dasDcp: 0,
        dtlp: 0,
        totalGeral: 0,
      };
    }

    const item = logradouroMap[logra];
    item.totalGeral += 1;

    switch (r.tipo) {
      case 'DAS':
        item.das += 1;
        break;
      case 'NÃO SE APLICA':
        item.naoSeAplica += 1;
        break;
      case 'CEV':
        item.cev += 1;
        break;
      case 'DIF':
        item.dif += 1;
        break;
      case 'DAS+DCP':
        item.dasDcp += 1;
        break;
      case 'DTLP':
        item.dtlp += 1;
        break;
      default:
        item.naoSeAplica += 1;
        break;
    }
  });

  const logradouroRows = Object.values(logradouroMap).sort(
    (a, b) => b.totalGeral - a.totalGeral || a.logradouro.localeCompare(b.logradouro)
  );

  const colTotals = {
    das: 0,
    naoSeAplica: 0,
    cev: 0,
    dif: 0,
    dasDcp: 0,
    dtlp: 0,
    totalGeral: 0,
  };

  logradouroRows.forEach((r) => {
    colTotals.das += r.das;
    colTotals.naoSeAplica += r.naoSeAplica;
    colTotals.cev += r.cev;
    colTotals.dif += r.dif;
    colTotals.dasDcp += r.dasDcp;
    colTotals.dtlp += r.dtlp;
    colTotals.totalGeral += r.totalGeral;
  });

  return {
    tempoMedio,
    regionalSummary,
    situacaoSummary,
    tipoSummary,
    anoSummary,
    qualificadoSummary,
    logradouroRows,
    colTotals,
  };
}

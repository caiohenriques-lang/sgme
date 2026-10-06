import Papa from 'papaparse';

export interface InterrupcaoRecord {
  id: string;
  codigo: string;
  faixa: string;
  ct: string;
  oficioInicial: string;
  informadoInicial: string;
  dataParada: string;
  diasEntreInformadoEParado: string;
  motivo: string;
  oficioRetorno: string;
  informadoFinal: string;
  dataRetorno: string;
  diasInformadoERetornado: string;
  horarioVandalismo: string;
  medicao: string;
  tratadoReuniao: string;
  empresa: string;
  enderecoCompleto: string;
  tipo: string;
  isInoperante: boolean;
  mesAnoParada: string;
  anoParada: string;
}

export interface ContratoSummaryItem {
  contrato: string;
  quantidade: number;
  percentual: number;
  percentualFormatted: string;
  color: string;
}

export interface EquipamentoMensalRow {
  contrato: string;
  codigo: string;
  tipo: string;
  enderecoCompleto?: string;
  ano2025: number;
  jan2026: number;
  fev2026: number;
  mar2026: number;
  abr2026: number;
  mai2026: number;
  jun2026: number;
  jul2026: number;
  ago2026: number;
  totalGeral: number;
}

export interface TipoSummaryItem {
  tipo: string;
  quantidade: number;
}

export const EQUIPAMENTOS_OFF_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyAnXMKd3aDXjNRt8QzsRLww2Gt5XJ9sN9HjXrv4TsBVKGArPVAFaj5Inb3-_t4x4z1Cy2TzEscbgb/pub?gid=0&single=true&output=csv';

export const CONTRATOS_ATIVOS = ['2740/24', '2742/24', '2741/24'];

export async function fetchInterrupcoesData(): Promise<InterrupcaoRecord[]> {
  try {
    const urlWithCacheBust = `${EQUIPAMENTOS_OFF_CSV_URL}&_cb=${Date.now()}`;
    const response = await fetch(urlWithCacheBust, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    const csvText = await response.text();
    const parsed = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (!parsed.data || parsed.data.length === 0) {
      return [];
    }

    const records: InterrupcaoRecord[] = [];

    parsed.data.forEach((row, index) => {
      const codigo = (row['CÓDIGO'] || row['CODIGO'] || '').trim();
      if (!codigo) return;

      const ct = (row['CT'] || row['CONTRATO'] || '').trim();
      const faixa = (row['FAIXA'] || '').trim();
      const oficioInicial = (row['OF'] || row['OFÍCIO'] || '').trim();
      const informadoInicial = (row['INFORMADO I'] || '').trim();
      const dataParada = (row['DATA PARADA I'] || row['DATA PARADA'] || '').trim();
      const diasEntreInformadoEParado = (row['DIAS ENTRE INFOMRADO E PARADO'] || '').trim();
      const motivo = (row['MOTIVO'] || '').trim();
      const oficioRetorno = (row['OFÍCIO DE RETORNO'] || '').trim();
      const informadoFinal = (row['INFORMADO F'] || '').trim();
      const dataRetorno = (row['RETORNO F'] || row['DATA RETORNO'] || '').trim();
      const diasInformadoERetornado = (row['DIAS INFORMADO E RETORNADO'] || '').trim();
      const horarioVandalismo = (row['HORÁRIO VANDALISMO'] || '').trim();
      const medicao = (row['MEDIÇÃO'] || '').trim();
      const tratadoReuniao = (row['TRATADO EM REUNIÃO SEMANAL?'] || '').trim();
      const empresa = (row['EMPRESA'] || '').trim();
      const enderecoCompleto = (row['ENDEREÇO COMPLETO'] || '').trim();
      const tipo = (row['TIPO'] || '').trim();

      const isInoperante = !dataRetorno || dataRetorno.trim() === '';

      let mesAnoParada = '';
      let anoParada = '';
      if (dataParada) {
        const parts = dataParada.split('/');
        if (parts.length === 3) {
          mesAnoParada = `${parts[1]}/${parts[2]}`;
          anoParada = parts[2];
        }
      }

      records.push({
        id: `interrupcao-${index}-${codigo}`,
        codigo,
        faixa,
        ct,
        oficioInicial,
        informadoInicial,
        dataParada,
        diasEntreInformadoEParado,
        motivo,
        oficioRetorno,
        informadoFinal,
        dataRetorno,
        diasInformadoERetornado,
        horarioVandalismo,
        medicao,
        tratadoReuniao,
        empresa,
        enderecoCompleto,
        tipo,
        isInoperante,
        mesAnoParada,
        anoParada,
      });
    });

    return records;
  } catch (err) {
    console.warn('Erro ao carregar dados de interrupções:', err);
    return [];
  }
}

/**
 * Calcula o resumo de interrupções por contrato (ex: 2740/24, 2742/24, 2741/24)
 */
export function calculateContratoSummary(records: InterrupcaoRecord[]): {
  items: ContratoSummaryItem[];
  totalGeral: number;
} {
  const activeRecords = records.filter((r) => CONTRATOS_ATIVOS.includes(r.ct));
  const counts: Record<string, number> = {
    '2740/24': 0,
    '2742/24': 0,
    '2741/24': 0,
  };

  activeRecords.forEach((r) => {
    if (counts[r.ct] !== undefined) {
      counts[r.ct] += 1;
    }
  });

  const totalGeral = counts['2740/24'] + counts['2742/24'] + counts['2741/24'];

  const colors: Record<string, string> = {
    '2740/24': '#2563eb', // Azul oficial Portal (KOPP)
    '2742/24': '#059669', // Verde Esmeralda oficial Portal (Consórcio)
    '2741/24': '#d97706', // Âmbar oficial Portal (Splice)
  };

  const order = ['2740/24', '2742/24', '2741/24'];

  const items: ContratoSummaryItem[] = order.map((ct) => {
    const q = counts[ct] || 0;
    const pct = totalGeral > 0 ? (q / totalGeral) * 100 : 0;
    const formatted = pct % 1 === 0 ? `${pct.toFixed(0)}%` : `${pct.toFixed(1).replace('.', ',')}%`;
    return {
      contrato: ct,
      quantidade: q,
      percentual: pct,
      percentualFormatted: formatted,
      color: colors[ct] || '#64748b',
    };
  });

  return { items, totalGeral };
}

/**
 * Calcula a matriz mensal acumulada de interrupções por equipamento
 */
export function calculateMensalMatrix(records: InterrupcaoRecord[]): {
  rows: EquipamentoMensalRow[];
  colTotals: {
    ano2025: number;
    jan2026: number;
    fev2026: number;
    mar2026: number;
    abr2026: number;
    mai2026: number;
    jun2026: number;
    jul2026: number;
    ago2026: number;
    totalGeral: number;
  };
} {
  const activeRecords = records.filter((r) => CONTRATOS_ATIVOS.includes(r.ct));
  const map: Record<string, EquipamentoMensalRow> = {};

  activeRecords.forEach((r) => {
    if (!map[r.codigo]) {
      map[r.codigo] = {
        contrato: r.ct,
        codigo: r.codigo,
        tipo: r.tipo,
        enderecoCompleto: r.enderecoCompleto || '',
        ano2025: 0,
        jan2026: 0,
        fev2026: 0,
        mar2026: 0,
        abr2026: 0,
        mai2026: 0,
        jun2026: 0,
        jul2026: 0,
        ago2026: 0,
        totalGeral: 0,
      };
    } else if (!map[r.codigo].enderecoCompleto && r.enderecoCompleto) {
      map[r.codigo].enderecoCompleto = r.enderecoCompleto;
    }

    const row = map[r.codigo];
    row.totalGeral += 1;

    if (r.anoParada === '2025') {
      row.ano2025 += 1;
    } else if (r.mesAnoParada === '01/2026') {
      row.jan2026 += 1;
    } else if (r.mesAnoParada === '02/2026') {
      row.fev2026 += 1;
    } else if (r.mesAnoParada === '03/2026') {
      row.mar2026 += 1;
    } else if (r.mesAnoParada === '04/2026') {
      row.abr2026 += 1;
    } else if (r.mesAnoParada === '05/2026') {
      row.mai2026 += 1;
    } else if (r.mesAnoParada === '06/2026') {
      row.jun2026 += 1;
    } else if (r.mesAnoParada === '07/2026') {
      row.jul2026 += 1;
    } else if (r.mesAnoParada === '08/2026') {
      row.ago2026 += 1;
    }
  });

  const rows = Object.values(map).sort((a, b) => b.totalGeral - a.totalGeral || a.codigo.localeCompare(b.codigo));

  const colTotals = {
    ano2025: 0,
    jan2026: 0,
    fev2026: 0,
    mar2026: 0,
    abr2026: 0,
    mai2026: 0,
    jun2026: 0,
    jul2026: 0,
    ago2026: 0,
    totalGeral: 0,
  };

  rows.forEach((r) => {
    colTotals.ano2025 += r.ano2025;
    colTotals.jan2026 += r.jan2026;
    colTotals.fev2026 += r.fev2026;
    colTotals.mar2026 += r.mar2026;
    colTotals.abr2026 += r.abr2026;
    colTotals.mai2026 += r.mai2026;
    colTotals.jun2026 += r.jun2026;
    colTotals.jul2026 += r.jul2026;
    colTotals.ago2026 += r.ago2026;
    colTotals.totalGeral += r.totalGeral;
  });

  return { rows, colTotals };
}

/**
 * Calcula o gráfico de interrupções por tipo de equipamento
 */
export function calculateTipoSummary(records: InterrupcaoRecord[]): TipoSummaryItem[] {
  const activeRecords = records.filter((r) => CONTRATOS_ATIVOS.includes(r.ct));
  const counts: Record<string, number> = {};

  activeRecords.forEach((r) => {
    const t = r.tipo || 'Outros';
    counts[t] = (counts[t] || 0) + 1;
  });

  // Expected order as seen in screenshot: CEV, DAS, DAS+DCP, DAS+DIF, DAS+DCP+DIF
  const preferredOrder = ['CEV', 'DAS', 'DAS+DCP', 'DAS+DIF', 'DAS+DCP+DIF'];
  const result: TipoSummaryItem[] = [];

  preferredOrder.forEach((t) => {
    if (counts[t] !== undefined) {
      result.push({ tipo: t, quantidade: counts[t] });
      delete counts[t];
    }
  });

  // Append any others sorted desc
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([tipo, quantidade]) => {
      result.push({ tipo, quantidade });
    });

  return result;
}

/**
 * Calcula a quantidade de dias corridos entre dataParada e dataRetorno (Data Retorno - Data Parada).
 * Retorna null se alguma das datas for ausente, vazia ou inválida, ou se a diferença for negativa.
 * Utiliza Date.UTC para cálculo civil exato e imune a distorções de timezone.
 */
export function calculateDiasInterrupcao(dataParada?: string | null, dataRetorno?: string | null): number | null {
  if (!dataParada || !dataRetorno) return null;
  const p1 = dataParada.trim().split('/');
  const p2 = dataRetorno.trim().split('/');
  if (p1.length !== 3 || p2.length !== 3) return null;

  const dia1 = parseInt(p1[0], 10);
  const mes1 = parseInt(p1[1], 10);
  const ano1 = parseInt(p1[2], 10);

  const dia2 = parseInt(p2[0], 10);
  const mes2 = parseInt(p2[1], 10);
  const ano2 = parseInt(p2[2], 10);

  if (
    isNaN(dia1) || isNaN(mes1) || isNaN(ano1) ||
    isNaN(dia2) || isNaN(mes2) || isNaN(ano2) ||
    mes1 < 1 || mes1 > 12 || dia1 < 1 || dia1 > 31 || ano1 < 1900 ||
    mes2 < 1 || mes2 > 12 || dia2 < 1 || dia2 > 31 || ano2 < 1900
  ) {
    return null;
  }

  const utc1 = Date.UTC(ano1, mes1 - 1, dia1);
  const utc2 = Date.UTC(ano2, mes2 - 1, dia2);

  const diffMs = utc2 - utc1;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0 || isNaN(diffDays)) return null;

  return diffDays;
}

/**
 * Formata o número de dias para exibição na UI / PDF:
 * 0 -> "0 dias"
 * 1 -> "1 dia"
 * 5 -> "5 dias"
 * null -> "-"
 */
export function formatDiasInterrupcao(dias: number | null | undefined): string {
  if (dias === null || dias === undefined || isNaN(dias)) return '-';
  if (dias === 1) return '1 dia';
  return `${dias} dias`;
}

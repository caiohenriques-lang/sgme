import Papa from 'papaparse';

export interface MonthlyRecord {
  mes: string;
  mesAbreviado: string;
  registrosOperacao: number | null;
  registrosHomologacao: number | null;
  totalRegistros: number | null;
  faixasOperacao: number | null;
}

export const ETRANSITO_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyAnXMKd3aDXjNRt8QzsRLww2Gt5XJ9sN9HjXrv4TsBVKGArPVAFaj5Inb3-_t4x4z1Cy2TzEscbgb/pub?gid=113942564&single=true&output=csv';

export const INITIAL_MONTHLY_RECORDS: MonthlyRecord[] = [
  {
    mes: 'janeiro/2026',
    mesAbreviado: 'jan. 2026',
    registrosHomologacao: 2382,
    registrosOperacao: 3424,
    totalRegistros: 5806,
    faixasOperacao: 400,
  },
  {
    mes: 'fevereiro/2026',
    mesAbreviado: 'fev. 2026',
    registrosHomologacao: 4940,
    registrosOperacao: 5402,
    totalRegistros: 9804,
    faixasOperacao: 465,
  },
  {
    mes: 'março/2026',
    mesAbreviado: 'mar. 2026',
    registrosHomologacao: 3144,
    registrosOperacao: 8562,
    totalRegistros: 11706,
    faixasOperacao: 559,
  },
  {
    mes: 'abril/2026',
    mesAbreviado: 'abr. 2026',
    registrosHomologacao: 4398,
    registrosOperacao: 8420,
    totalRegistros: 13241,
    faixasOperacao: 614,
  },
  {
    mes: 'maio/2026',
    mesAbreviado: 'mai. 2026',
    registrosHomologacao: 4179,
    registrosOperacao: 12519,
    totalRegistros: 16679,
    faixasOperacao: 699,
  },
  {
    mes: 'junho/2026',
    mesAbreviado: 'jun. 2026',
    registrosHomologacao: 4741,
    registrosOperacao: 13308,
    totalRegistros: 17229,
    faixasOperacao: 699,
  },
  {
    mes: 'julho/2026',
    mesAbreviado: 'jul. 2026',
    registrosHomologacao: 3020,
    registrosOperacao: 14501,
    totalRegistros: 17521,
    faixasOperacao: 699,
  },
  {
    mes: 'agosto/2026',
    mesAbreviado: 'ago. 2026',
    registrosHomologacao: null,
    registrosOperacao: null,
    totalRegistros: null,
    faixasOperacao: null,
  },
  {
    mes: 'setembro/2026',
    mesAbreviado: 'set. 2026',
    registrosHomologacao: null,
    registrosOperacao: null,
    totalRegistros: null,
    faixasOperacao: null,
  },
  {
    mes: 'outubro/2026',
    mesAbreviado: 'out. 2026',
    registrosHomologacao: null,
    registrosOperacao: null,
    totalRegistros: null,
    faixasOperacao: null,
  },
  {
    mes: 'novembro/2026',
    mesAbreviado: 'nov. 2026',
    registrosHomologacao: null,
    registrosOperacao: null,
    totalRegistros: null,
    faixasOperacao: null,
  },
  {
    mes: 'dezembro/2026',
    mesAbreviado: 'dez. 2026',
    registrosHomologacao: null,
    registrosOperacao: null,
    totalRegistros: null,
    faixasOperacao: null,
  },
];

function parsePtBrNumber(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  const str = String(val).replace(/\./g, '').replace(',', '.').trim();
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

function formatMesAbreviado(mesStr: string): string {
  const clean = mesStr.toLowerCase().trim();
  if (clean.startsWith('jan')) return 'jan. 2026';
  if (clean.startsWith('fev')) return 'fev. 2026';
  if (clean.startsWith('mar')) return 'mar. 2026';
  if (clean.startsWith('abr')) return 'abr. 2026';
  if (clean.startsWith('mai')) return 'mai. 2026';
  if (clean.startsWith('jun')) return 'jun. 2026';
  if (clean.startsWith('jul')) return 'jul. 2026';
  if (clean.startsWith('ago')) return 'ago. 2026';
  if (clean.startsWith('set')) return 'set. 2026';
  if (clean.startsWith('out')) return 'out. 2026';
  if (clean.startsWith('nov')) return 'nov. 2026';
  if (clean.startsWith('dez')) return 'dez. 2026';
  return mesStr;
}

export async function fetchETransitoMonthlyData(): Promise<MonthlyRecord[]> {
  try {
    const urlWithCacheBust = `${ETRANSITO_CSV_URL}&_cb=${Date.now()}`;
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
      return INITIAL_MONTHLY_RECORDS;
    }

    const result: MonthlyRecord[] = parsed.data.map((row) => {
      const mes = row['Mês'] || row['Mes'] || row['MÊS'] || '';
      
      // Suporte aos novos cabeçalhos e compatibilidade com formatos anteriores
      const regOp = parsePtBrNumber(
        row['Registros Gerados em Operação'] ||
        row['Registros Gerados em Operacao'] ||
        row['Registros Operação'] ||
        row['Registros Operacao']
      );

      const regHom = parsePtBrNumber(
        row['Registros Gerados em Homologação'] ||
        row['Registros Gerados em Homologacao'] ||
        row['Registros Homologação'] ||
        row['Registros Homologacao']
      );

      const totReg = parsePtBrNumber(
        row['Total de Registros Recebidos'] ||
        row['Total registros recebidos'] ||
        row['Total Registros Recebidos']
      );

      const faixasOp = parsePtBrNumber(
        row['QTD. de Faixas em Operação'] ||
        row['QTD. de Faixas em Operacao'] ||
        row['Qtd. de Faixas em Operação'] ||
        row['Faixas em operação'] ||
        row['Faixas em operacao']
      );

      return {
        mes,
        mesAbreviado: formatMesAbreviado(mes),
        registrosOperacao: regOp,
        registrosHomologacao: regHom,
        totalRegistros: totReg,
        faixasOperacao: faixasOp,
      };
    });

    return result.length > 0 ? result : INITIAL_MONTHLY_RECORDS;
  } catch (err) {
    console.warn('Usando dados em cache para eTransito Registros por Mês:', err);
    return INITIAL_MONTHLY_RECORDS;
  }
}

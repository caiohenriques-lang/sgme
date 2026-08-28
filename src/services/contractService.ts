import { EquipmentRecord } from '../types';

export interface OSDetail {
  faixas?: number | string;
  data?: string;
  dataOperacaoMatriz?: string;
}

export interface FaixaPorOSRow {
  contrato: string;
  empresa: string;
  tipoEquipamento: string;
  faixasContratadas: number;
  osList: {
    label: string;
    faixas?: number | string;
    data?: string;
    dataOperacaoMatriz?: string;
  }[];
  percentualImplantacaoOperacao: string;
  faixasRestantes: number;
  // Matriz real-time breakdowns
  faixasEmOperacaoMatriz?: number;
  faixasEmImplantacaoMatriz?: number;
  faixasRelocacaoMatriz?: number;
  totalFaixasMatriz?: number;
}

export interface RelocacaoRow {
  contrato: string;
  empresa: string;
  tipoEquipamento: string;
  faixasRelocacao: number;
  primeiroUso: OSDetail;
  segundoUso: OSDetail;
  restante: number;
}

export interface CustoFaixaRow {
  contrato: string;
  empresa: string;
  valorContratado: string;
  bdi: string;
  primeiraTA: string;
  segundaTA: string;
  valorAtualBDI: string;
}

export interface CustoRelocacaoRow {
  contrato: string;
  empresa: string;
  valorContratado: string;
  bdi: string;
  primeiraTA: string;
  segundaTA: string;
  valorAtual: string;
}

export interface Contrato2020Row {
  contrato: string;
  empresa: string;
  tipoEquipamento: string;
  faixasContratadas: number;
  os1: string;
  os2: string;
  os3: string;
  percentual: string;
  faixasMatriz?: number;
  situacaoMatriz?: string;
}

export interface ComparativoCustosRow {
  contrato: string;
  licitacao2020Contratado: string;
  licitacao2020Atual: string;
  licitacao2023Contratado: string;
  licitacao2023Atual: string;
}

export interface MatrizEquipmentRow {
  id: string;
  contrato: string;
  contratada: string;
  numSerie: string;
  codigo: string;
  codLog: string;
  corredor: string;
  endereco: string;
  sentido: string;
  bairro: string;
  regional: string;
  enderecoCompleto: string;
  faixas: number;
  tipo: string;
  velocidade: string;
  os: string;
  situacao: string;
  ano: string;
  dataOperacao: string;
  dataAceite: string;
  dataAfericao: string;
  dataVencimentoAfericao: string;
  condicao: string;
  difPareado: string;
  observacoes: string;
  coordenadas: string;
}

export interface ControleGeralCTsData {
  tabelaFaixasPorOS: FaixaPorOSRow[];
  osColumns: string[];
  tabelaRelocacoes: RelocacaoRow[];
  tabelaContratos2020: Contrato2020Row[];
  tabelaCustos: CustoFaixaRow[];
  tabelaCustosRelocacao: CustoRelocacaoRow[];
  tabelaComparativoCustos: ComparativoCustosRow[];
  matrizRecords: MatrizEquipmentRow[];
  totalFaixasContratadas: number;
  totalFaixasMatriz: number;
  totalFaixasOperacaoMatriz: number;
  totalFaixasImplantacaoMatriz: number;
  totalFaixasRelocacaoMatriz: number;
  totalFaixasRestantes: number;
  vigencia: string;
  vigencia2020: string;
  legendas2020: string;
  dataAtualizacaoComparativo?: string;
  legendas: { sigla: string; descricao: string }[];
}

export const CONTROLE_GERAL_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMqNFwW7A6_F2X16VVXddLQgovMI5sEAbUq1cgT0vF3CDGL1dGjYn5nciuxPpZCiF-_hyXHi8k-Bgt/pub?gid=1407949931&single=true&output=csv';

export const MATRIZ_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vQyAnXMKd3aDXjNRt8QzsRLww2Gt5XJ9sN9HjXrv4TsBVKGArPVAFaj5Inb3-_t4x4z1Cy2TzEscbgb/pub?gid=795843024&single=true&output=csv';

export const INITIAL_CONTROLE_GERAL_DATA: ControleGeralCTsData = {
  osColumns: ['1ª OS', '2ª OS', '3ª OS', '4ª OS', '5ª OS', '6ª OS'],
  totalFaixasContratadas: 1363,
  totalFaixasMatriz: 1063,
  totalFaixasOperacaoMatriz: 700,
  totalFaixasImplantacaoMatriz: 355,
  totalFaixasRelocacaoMatriz: 8,
  totalFaixasRestantes: 229,
  vigencia: '19/07/2024 à 18/07/2029',
  vigencia2020: '19/10/2020 à 18/10/2025',
  legendas2020:
    'CEV - Controlador Eletrônico de Velocidade, DIF - Invasão de faixa exclusiva; DAS - Avanço semáforo vermelho; DPFP - parada sobre a faixa de pedestres; DTLP - trafegar em local/horário proibido (caminhão); DCP - conversão proibida.',
  dataAtualizacaoComparativo: '09/07/2024',
  legendas: [
    { sigla: 'DIF', descricao: 'detector de invasão de faixa exclusiva de ônibus' },
    { sigla: 'DAS', descricao: 'detector de avanço de semáforo vermelho' },
    { sigla: 'DTLP', descricao: 'detector de tráfego em local/horário proibido (caminhão)' },
    { sigla: 'DCP', descricao: 'detector de conversão em local proibido' },
    { sigla: 'CEV', descricao: 'controlador eletrônico de velocidade' },
  ],
  tabelaFaixasPorOS: [
    {
      contrato: '2740/2024',
      empresa: 'ELISEU KOPP & CIA LTDA.',
      tipoEquipamento: 'EFE 01 CEV',
      faixasContratadas: 476,
      osList: [
        { label: '1ª OS', faixas: 34, data: '02/09/2024', dataOperacaoMatriz: '20/05/2025' },
        { label: '2ª OS', faixas: 56, data: '12/12/2024', dataOperacaoMatriz: '25/09/2025' },
        { label: '3ª OS', faixas: 48, data: '16/05/2025', dataOperacaoMatriz: '19/11/2025' },
        { label: '4ª OS', faixas: 65, data: '14/08/2025', dataOperacaoMatriz: '20/02/2026' },
        { label: '5ª OS', faixas: 141, data: '28/11/2025', dataOperacaoMatriz: '20/08/2026' },
        { label: '6ª OS', faixas: 71, data: 'AGUARDANDO' },
      ],
      percentualImplantacaoOperacao: '87,18%',
      faixasRestantes: 61,
      faixasEmOperacaoMatriz: 195,
      faixasEmImplantacaoMatriz: 141,
      faixasRelocacaoMatriz: 8,
      totalFaixasMatriz: 344,
    },
    {
      contrato: '2741/2024',
      empresa: 'SPLICE INDÚSTRIA, COMÉRCIO E SERVIÇOS LTDA.',
      tipoEquipamento: 'EFE 02 DAS',
      faixasContratadas: 442,
      osList: [
        { label: '1ª OS', faixas: 32, data: '09/09/2024', dataOperacaoMatriz: '13/03/2025' },
        { label: '2ª OS', faixas: 65, data: '10/01/2025', dataOperacaoMatriz: '07/10/2025' },
        { label: '3ª OS', faixas: 55, data: '03/10/2025', dataOperacaoMatriz: '30/04/2026' },
        { label: '4ª OS', faixas: 139, data: '18/05/2026', dataOperacaoMatriz: '-' },
        { label: '5ª OS', faixas: '', data: '' },
        { label: '6ª OS', faixas: '', data: '' },
      ],
      percentualImplantacaoOperacao: '65,84%',
      faixasRestantes: 151,
      faixasEmOperacaoMatriz: 152,
      faixasEmImplantacaoMatriz: 139,
      faixasRelocacaoMatriz: 0,
      totalFaixasMatriz: 291,
    },
    {
      contrato: '2742/2024',
      empresa: 'CONSÓRCIO TRÂNSITO SEGURO',
      tipoEquipamento: 'EFE 03 DAS/DTLP/DCP/DIF',
      faixasContratadas: 445,
      osList: [
        { label: '1ª OS', faixas: 34, data: '09/09/2024', dataOperacaoMatriz: '13/03/2025' },
        { label: '2ª OS', faixas: 53, data: '28/03/2025', dataOperacaoMatriz: '25/08/2025' },
        { label: '3ª OS', faixas: 262, data: '01/10/2025', dataOperacaoMatriz: '27/01/2026' },
        { label: '4ª OS', faixas: 4, data: '09/01/2026', dataOperacaoMatriz: '07/08/2026' },
        { label: '5ª OS', faixas: 75, data: '07/08/2026', dataOperacaoMatriz: '-' },
        { label: '6ª OS', faixas: '', data: '' },
      ],
      percentualImplantacaoOperacao: '96,18%',
      faixasRestantes: 17,
      faixasEmOperacaoMatriz: 353,
      faixasEmImplantacaoMatriz: 75,
      faixasRelocacaoMatriz: 0,
      totalFaixasMatriz: 428,
    },
  ],
  tabelaRelocacoes: [
    {
      contrato: '2740/2024',
      empresa: 'ELISEU KOPP & CIA LTDA.',
      tipoEquipamento: 'EFE 01 CEV',
      faixasRelocacao: 71,
      primeiroUso: { faixas: 5, data: '28/11/2025' },
      segundoUso: { faixas: 3, data: 'AGUARDANDO' },
      restante: 63,
    },
    {
      contrato: '2741/2024',
      empresa: 'SPLICE INDÚSTRIA, COMÉRCIO E SERVIÇOS LTDA.',
      tipoEquipamento: 'EFE 02 DAS',
      faixasRelocacao: 66,
      primeiroUso: {},
      segundoUso: {},
      restante: 66,
    },
    {
      contrato: '2742/2024',
      empresa: 'CONSÓRCIO TRÂNSITO SEGURO',
      tipoEquipamento: 'EFE 03 DAS/DTLP/DCP/DIF',
      faixasRelocacao: 66,
      primeiroUso: {},
      segundoUso: {},
      restante: 66,
    },
  ],
  tabelaContratos2020: [
    {
      contrato: '2585/2020',
      empresa: 'CONSÓRCIO BH VIASEGURA',
      tipoEquipamento: 'EFE 01 CEV/DIF',
      faixasContratadas: 235,
      os1: '15/12/2020 - 79 faixas',
      os2: '02/08/2021 - 91 faixas',
      os3: '13/01/2023 - 04 faixas\n27/02/2024 - 61 faixas',
      percentual: '99,58%',
      faixasMatriz: 236,
      situacaoMatriz: 'Desligado (Fim do CT 18/10/2025)',
    },
    {
      contrato: '2586/2020',
      empresa: 'CONSÓRCIO BH VIASEGURA',
      tipoEquipamento: 'EFE 02 DAS/DCP/DPFP/DTLP',
      faixasContratadas: 378,
      os1: '09/12/2020 - 122 faixas',
      os2: '04/08/2021 - 126 faixas',
      os3: '05/02/2024 - 130 faixas',
      percentual: '100,00%',
      faixasMatriz: 383,
      situacaoMatriz: 'Desligado (Fim do CT 18/10/2025)',
    },
    {
      contrato: '2587/2020',
      empresa: 'ELISEU KOPP & CIA LTDA.',
      tipoEquipamento: 'EFE 03 DAS/DTLP',
      faixasContratadas: 103,
      os1: '01/12/2020 - 35 faixas',
      os2: '18/08/2021 - 32 faixas',
      os3: '07/11/2022 - 36 faixas',
      percentual: '100,00%',
      faixasMatriz: 103,
      situacaoMatriz: 'Desligado (Fim do CT 18/10/2025)',
    },
  ],
  tabelaCustos: [
    {
      contrato: '2740/2024',
      empresa: 'ELISEU KOPP & CIA LTDA.',
      valorContratado: 'R$ 1.052,43',
      bdi: '23,80%',
      primeiraTA: '4,87%',
      segundaTA: '4,46%',
      valorAtualBDI: 'R$ 1.427,29',
    },
    {
      contrato: '2741/2024',
      empresa: 'SPLICE INDÚSTRIA, COMÉRCIO E SERVIÇOS LTDA.',
      valorContratado: 'R$ 945,70',
      bdi: '25,04%',
      primeiraTA: '4,75%',
      segundaTA: '-',
      valorAtualBDI: 'R$ 1.238,67',
    },
    {
      contrato: '2742/2024',
      empresa: 'CONSÓRCIO TRÂNSITO SEGURO',
      valorContratado: 'R$ 1.083,00',
      bdi: '21,51%',
      primeiraTA: '4,87%',
      segundaTA: '4,46%',
      valorAtualBDI: 'R$ 1.441,58',
    },
    {
      contrato: '2743/2024',
      empresa: 'TIVIC',
      valorContratado: 'R$ 249.916,67',
      bdi: '-',
      primeiraTA: '4,75%',
      segundaTA: '4,75%',
      valorAtualBDI: 'R$ 261.787,70',
    },
  ],
  tabelaCustosRelocacao: [
    {
      contrato: '2740/2024',
      empresa: 'ELISEU KOPP & CIA LTDA.',
      valorContratado: 'R$ 3.085,52',
      bdi: '23,80%',
      primeiraTA: '4,87%',
      segundaTA: '4,46%',
      valorAtual: 'R$ 3.380,10',
    },
    {
      contrato: '2741/2024',
      empresa: 'SPLICE INDÚSTRIA, COMÉRCIO E SERVIÇOS LTDA.',
      valorContratado: '-',
      bdi: '25,04%',
      primeiraTA: '4,75%',
      segundaTA: '-',
      valorAtual: '-',
    },
    {
      contrato: '2742/2024',
      empresa: 'CONSÓRCIO TRÂNSITO SEGURO',
      valorContratado: 'R$ 5.662,76',
      bdi: '21,51%',
      primeiraTA: '4,87%',
      segundaTA: '4,46%',
      valorAtual: 'R$ 6.203,40',
    },
  ],
  tabelaComparativoCustos: [
    {
      contrato: '2585/2020',
      licitacao2020Contratado: 'R$ 1.689,01',
      licitacao2020Atual: 'R$ 2.020,62',
      licitacao2023Contratado: '1302,91 (bdi 23,8%)',
      licitacao2023Atual: '1366,36',
    },
    {
      contrato: '2586/2020',
      licitacao2020Contratado: 'R$ 1.640,55',
      licitacao2020Atual: 'R$ 2.014,22',
      licitacao2023Contratado: '1182,5 (bdi 25,04%)',
      licitacao2023Atual: '-',
    },
    {
      contrato: '2587/2020',
      licitacao2020Contratado: 'R$ 1.125,95',
      licitacao2020Atual: 'R$ 1.382,40',
      licitacao2023Contratado: '1315,95 (bdi 21,51%)',
      licitacao2023Atual: '-',
    },
    {
      contrato: 'CETAI',
      licitacao2020Contratado: 'R$ 71.666,67',
      licitacao2020Atual: 'R$ 104.560,94',
      licitacao2023Contratado: 'R$ 249.916,67',
      licitacao2023Atual: '-',
    },
  ],
  matrizRecords: [],
};

function parseCSVMatrix(text: string): string[][] {
  const lines: string[][] = [];
  let row: string[] = [];
  let inQuotes = false;
  let currentToken = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentToken += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(currentToken.trim());
      currentToken = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      row.push(currentToken.trim());
      if (row.some((c) => c !== '')) {
        lines.push(row);
      }
      row = [];
      currentToken = '';
    } else {
      currentToken += char;
    }
  }
  if (currentToken || row.length > 0) {
    row.push(currentToken.trim());
    if (row.some((c) => c !== '')) lines.push(row);
  }
  return lines;
}

async function fetchCsvWithFallback(url: string): Promise<string> {
  const timestamp = Date.now();
  const urlWithBust = url.includes('?') ? `${url}&_t=${timestamp}` : `${url}?_t=${timestamp}`;
  const attempts = [
    urlWithBust,
    `https://corsproxy.io/?${encodeURIComponent(urlWithBust)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(urlWithBust)}`,
  ];

  for (const targetUrl of attempts) {
    try {
      const res = await fetch(targetUrl, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        if (
          text &&
          (text.includes('CONTRATO') ||
            text.includes('ORDEM DE SERVIÇO') ||
            text.includes('CUSTO') ||
            text.includes('FAIXAS'))
        ) {
          return text;
        }
      }
    } catch {
      // Continue to next fallback proxy
    }
  }
  return '';
}

/**
 * Parses the raw MATRIZ spreadsheet tab (GID: 795843024)
 */
export function parseMatrizCSV(csvText: string): {
  records: MatrizEquipmentRow[];
  statsByContract: Record<
    string,
    {
      totalFaixas: number;
      byOS: Record<string, number>;
      bySituacao: Record<string, number>;
      datesByOS: Record<string, string>;
    }
  >;
} {
  const rows = parseCSVMatrix(csvText);
  if (rows.length < 2) {
    return { records: [], statsByContract: {} };
  }

  const header = rows[0];
  const contratoIdx = header.indexOf('CONTRATO');
  const contratadaIdx = header.indexOf('CONTRATADA');
  const numSerieIdx = header.indexOf('Nº DE SÉRIE');
  const codigoIdx = header.indexOf('CÓDIGO');
  const codLogIdx = header.indexOf('COD LOG');
  const corredorIdx = header.indexOf('CORREDOR');
  const enderecoIdx = header.indexOf('ENDEREÇOS DOS EQUIPAMENTOS');
  const sentidoIdx = header.indexOf('SENTIDO');
  const bairroIdx = header.indexOf('BAIRRO');
  const regionalIdx = header.indexOf('REGIONAL');
  const enderecoCompIdx = header.indexOf('ENDEREÇO COMPLETO');
  const faixasIdx = header.indexOf('FAIXAS');
  const tipoIdx = header.indexOf('TIPO');
  const velIdx = header.indexOf('Velocidade Fiscalizada');
  const osIdx = header.indexOf('OS');
  const situacaoIdx = header.indexOf('Situação');
  const anoIdx = header.indexOf('ANO');
  const dtOpIdx = header.indexOf('Data de Início  da Operação');
  const dtAceiteIdx = header.indexOf('Data de Aceite');
  const dtAfericaoIdx = header.indexOf('Data da Aferição');
  const dtVencIdx = header.indexOf('Data de Vencimento da Aferição');
  const condicaoIdx = header.indexOf('CONDIÇÃO');
  const difPareadoIdx = header.indexOf('DIF Pareado');
  const obsIdx = header.indexOf('Observações');
  const coordIdx = header.indexOf('COORD_LAT_LONG');

  const records: MatrizEquipmentRow[] = [];
  const statsByContract: Record<
    string,
    {
      totalFaixas: number;
      byOS: Record<string, number>;
      bySituacao: Record<string, number>;
      datesByOS: Record<string, string>;
    }
  > = {};

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    let ct = (r[contratoIdx] || '').trim();
    if (!ct) continue;

    // Normalize contract string
    let ctKey = ct;
    if (ct.includes('/24')) ctKey = ct.replace('/24', '/2024');
    if (ct.includes('/20') && !ct.includes('/2020')) ctKey = ct.replace('/20', '/2020');

    const faixas = parseInt(r[faixasIdx], 10) || 1;
    const os = (r[osIdx] || '').trim();
    const situacao = (r[situacaoIdx] || '').replace(/\r?\n/g, ' ').trim();
    const dtOp = (r[dtOpIdx] || '').trim();

    if (!statsByContract[ctKey]) {
      statsByContract[ctKey] = {
        totalFaixas: 0,
        byOS: {},
        bySituacao: {},
        datesByOS: {},
      };
    }

    statsByContract[ctKey].totalFaixas += faixas;
    if (os) {
      statsByContract[ctKey].byOS[os] = (statsByContract[ctKey].byOS[os] || 0) + faixas;
    }
    if (situacao) {
      statsByContract[ctKey].bySituacao[situacao] = (statsByContract[ctKey].bySituacao[situacao] || 0) + faixas;
    }
    if (dtOp && os && !statsByContract[ctKey].datesByOS[os]) {
      statsByContract[ctKey].datesByOS[os] = dtOp;
    }

    records.push({
      id: `matriz-${i}-${r[codigoIdx] || i}`,
      contrato: ctKey,
      contratada: (r[contratadaIdx] || '').trim(),
      numSerie: (r[numSerieIdx] || '').trim(),
      codigo: (r[codigoIdx] || '').trim(),
      codLog: (r[codLogIdx] || '').trim(),
      corredor: (r[corredorIdx] || '').trim(),
      endereco: (r[enderecoIdx] || '').trim(),
      sentido: (r[sentidoIdx] || '').trim(),
      bairro: (r[bairroIdx] || '').trim(),
      regional: (r[regionalIdx] || '').trim(),
      enderecoCompleto: (r[enderecoCompIdx] || '').trim(),
      faixas,
      tipo: (r[tipoIdx] || '').trim(),
      velocidade: (r[velIdx] || '').trim(),
      os,
      situacao,
      ano: (r[anoIdx] || '').trim(),
      dataOperacao: dtOp,
      dataAceite: (r[dtAceiteIdx] || '').trim(),
      dataAfericao: (r[dtAfericaoIdx] || '').trim(),
      dataVencimentoAfericao: (r[dtVencIdx] || '').trim(),
      condicao: (r[condicaoIdx] || '').trim(),
      difPareado: (r[difPareadoIdx] || '').trim(),
      observacoes: (r[obsIdx] || '').trim(),
      coordenadas: (r[coordIdx] || '').trim(),
    });
  }

  return { records, statsByContract };
}

/**
 * Downloads and parses both CONTROLE GERAL CTs and MATRIZ to provide a
 * 100% unified, live, mathematically coherent contract state.
 */
export async function fetchControleGeralCTs(): Promise<ControleGeralCTsData> {
  try {
    const [controleCsv, matrizCsv] = await Promise.all([
      fetchCsvWithFallback(CONTROLE_GERAL_CSV_URL),
      fetchCsvWithFallback(MATRIZ_CSV_URL),
    ]);

    let parsedMatrizData = { records: [] as MatrizEquipmentRow[], statsByContract: {} as any };
    if (matrizCsv) {
      parsedMatrizData = parseMatrizCSV(matrizCsv);
    }

    if (!controleCsv) {
      return {
        ...INITIAL_CONTROLE_GERAL_DATA,
        matrizRecords: parsedMatrizData.records,
      };
    }

    const rows = parseCSVMatrix(controleCsv);
    if (!rows || rows.length < 5) {
      return {
        ...INITIAL_CONTROLE_GERAL_DATA,
        matrizRecords: parsedMatrizData.records,
      };
    }

    const parsedControle = parseControleGeralRows(rows);

    // Merge real Matriz counts into the rows for maximum fidelity
    const updatedFaixasPorOS = parsedControle.tabelaFaixasPorOS.map((row) => {
      const ctKey = row.contrato;
      const stats = parsedMatrizData.statsByContract[ctKey];
      if (!stats) return row;

      const emOperacao = stats.bySituacao['Em operação'] || 0;
      const emImplantacao = stats.bySituacao['Em implantação'] || 0;
      const relocacao = stats.bySituacao['Relocação'] || 0;

      // Update date of operation in OS list if available in Matriz
      const updatedOSList = row.osList.map((osItem, idx) => {
        const osNum = String(idx + 1);
        const dtMatriz = stats.datesByOS[osNum];
        return {
          ...osItem,
          dataOperacaoMatriz: dtMatriz || osItem.dataOperacaoMatriz,
        };
      });

      return {
        ...row,
        osList: updatedOSList,
        faixasEmOperacaoMatriz: emOperacao,
        faixasEmImplantacaoMatriz: emImplantacao,
        faixasRelocacaoMatriz: relocacao,
        totalFaixasMatriz: stats.totalFaixas,
      };
    });

    // Compute live global metrics
    let totalOpMatriz = 0;
    let totalImpMatriz = 0;
    let totalRelMatriz = 0;
    let totalMatrizFaixas = 0;

    Object.entries(parsedMatrizData.statsByContract).forEach(([ct, s]: [string, any]) => {
      if (ct.startsWith('274')) {
        totalOpMatriz += s.bySituacao['Em operação'] || 0;
        totalImpMatriz += s.bySituacao['Em implantação'] || 0;
        totalRelMatriz += s.bySituacao['Relocação'] || 0;
        totalMatrizFaixas += s.totalFaixas || 0;
      }
    });

    const totalRestantes = updatedFaixasPorOS.reduce((acc, curr) => {
      const r = typeof curr.faixasRestantes === 'number' ? curr.faixasRestantes : parseInt(String(curr.faixasRestantes), 10) || 0;
      return acc + r;
    }, 0);

    return {
      ...parsedControle,
      tabelaFaixasPorOS: updatedFaixasPorOS,
      matrizRecords: parsedMatrizData.records,
      totalFaixasMatriz: totalMatrizFaixas > 0 ? totalMatrizFaixas : parsedControle.totalFaixasMatriz,
      totalFaixasOperacaoMatriz: totalOpMatriz > 0 ? totalOpMatriz : parsedControle.totalFaixasOperacaoMatriz,
      totalFaixasImplantacaoMatriz: totalImpMatriz > 0 ? totalImpMatriz : parsedControle.totalFaixasImplantacaoMatriz,
      totalFaixasRelocacaoMatriz: totalRelMatriz > 0 ? totalRelMatriz : parsedControle.totalFaixasRelocacaoMatriz,
      totalFaixasRestantes: totalRestantes > 0 ? totalRestantes : parsedControle.totalFaixasRestantes,
    };
  } catch (error) {
    console.error('Falha ao processar CONTROLE GERAL e MATRIZ:', error);
    return INITIAL_CONTROLE_GERAL_DATA;
  }
}

export function parseControleGeralRows(rows: string[][]): ControleGeralCTsData {
  let tabelaFaixasPorOS: FaixaPorOSRow[] = [];
  let osColumns: string[] = ['1ª OS', '2ª OS', '3ª OS', '4ª OS', '5ª OS', '6ª OS'];
  let tabelaRelocacoes: RelocacaoRow[] = [];
  let tabelaContratos2020: Contrato2020Row[] = [];
  let tabelaCustos: CustoFaixaRow[] = [];
  let tabelaCustosRelocacao: CustoRelocacaoRow[] = [];
  let tabelaComparativoCustos: ComparativoCustosRow[] = [];
  let vigencia = '19/07/2024 à 18/07/2029';
  let vigencia2020 = '19/10/2020 à 18/10/2025';
  let legendas2020 = INITIAL_CONTROLE_GERAL_DATA.legendas2020;
  let dataAtualizacaoComparativo = '09/07/2024';

  let currentSection = '';
  let faixasHeaders: {
    ctIdx: number;
    empresaIdx: number;
    tipoIdx: number;
    faixasContrIdx: number;
    osCols: { label: string; colIdx: number }[];
    percentIdx: number;
    restantesIdx: number;
  } | null = null;

  let relocHeaders: {
    ctIdx: number;
    empresaIdx: number;
    tipoIdx: number;
    faixasRelocIdx: number;
    pUsoIdx: number;
    sUsoIdx: number;
    restanteIdx: number;
  } | null = null;

  let custosHeaders: {
    ctIdx: number;
    empresaIdx: number;
    valorContrIdx: number;
    bdiIdx: number;
    ta1Idx: number;
    ta2Idx: number;
    valorAtualIdx: number;
  } | null = null;

  let custosRelocHeaders: {
    ctIdx: number;
    empresaIdx: number;
    valorContrIdx: number;
    bdiIdx: number;
    ta1Idx: number;
    ta2Idx: number;
    valorAtualIdx: number;
  } | null = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const joined = row.join(' ').toUpperCase();

    // Section detection
    if (joined.includes('QUANTIDADE DE FAIXAS POR ORDEM DE SERVIÇO') && !joined.includes('2585/2020')) {
      currentSection = 'FAIXAS_2024';
      faixasHeaders = null;
      continue;
    } else if (joined.includes('QUANTIDADE DE RELOCAÇÕES')) {
      currentSection = 'RELOCACOES';
      relocHeaders = null;
      continue;
    } else if (joined.includes('2585/2020') && currentSection !== 'COMPARATIVO_CUSTOS') {
      currentSection = 'CONTRATOS_2020';
    } else if (joined.includes('CUSTO POR RELOCAÇÃO E POR CONTRATO') || (joined.includes('CUSTO POR RELOCA') && joined.includes('CONTRATO'))) {
      currentSection = 'CUSTOS_RELOCACAO';
      custosRelocHeaders = null;
      continue;
    } else if (joined.includes('CUSTO POR FAIXA E POR CONTRATO')) {
      if (tabelaCustos.length === 0) {
        currentSection = 'CUSTOS_2024';
        custosHeaders = null;
      } else {
        currentSection = 'COMPARATIVO_CUSTOS';
      }
      continue;
    }

    // 1. FAIXAS POR OS (2024)
    if (currentSection === 'FAIXAS_2024') {
      const ctHeaderIdx = row.findIndex((c) => c.trim().toUpperCase() === 'CONTRATO');
      if (ctHeaderIdx !== -1) {
        // Detect all columns dynamically from header
        const empresaIdx = row.findIndex((c) => c.trim().toUpperCase() === 'EMPRESA');
        const tipoIdx = row.findIndex((c) => c.trim().toUpperCase().includes('TIPO'));
        const faixasContrIdx = row.findIndex((c) => c.trim().toUpperCase().includes('CONTRATADA'));

        const detectedOSCols: { label: string; colIdx: number }[] = [];
        row.forEach((c, idx) => {
          const trimmed = c.trim();
          if (/\b\d+ª\s*OS\b/i.test(trimmed) || /\bOS\s*\d+\b/i.test(trimmed)) {
            detectedOSCols.push({ label: trimmed, colIdx: idx });
          }
        });

        if (detectedOSCols.length > 0) {
          osColumns = detectedOSCols.map((o) => o.label);
        }

        const percentIdx = row.findIndex((c) => c.includes('%'));
        const restantesIdx = row.findIndex((c) => c.toLowerCase().includes('restante'));

        faixasHeaders = {
          ctIdx: ctHeaderIdx,
          empresaIdx: empresaIdx !== -1 ? empresaIdx : ctHeaderIdx + 1,
          tipoIdx: tipoIdx !== -1 ? tipoIdx : ctHeaderIdx + 2,
          faixasContrIdx: faixasContrIdx !== -1 ? faixasContrIdx : ctHeaderIdx + 3,
          osCols: detectedOSCols,
          percentIdx:
            percentIdx !== -1
              ? percentIdx
              : detectedOSCols.length
              ? detectedOSCols[detectedOSCols.length - 1].colIdx + 1
              : 11,
          restantesIdx:
            restantesIdx !== -1
              ? restantesIdx
              : detectedOSCols.length
              ? detectedOSCols[detectedOSCols.length - 1].colIdx + 2
              : 12,
        };
        continue;
      }

      // Check if data row contains a contract
      const candidateCtIdx = faixasHeaders ? faixasHeaders.ctIdx : row.findIndex((c) => /274\d|\d{4}\/\d{4}/.test(c.trim()));
      if (candidateCtIdx !== -1) {
        const contratoVal = (row[candidateCtIdx] || '').trim();
        if (contratoVal.startsWith('274') || /^\d{4}\/\d{4}$/.test(contratoVal)) {
          const headers = faixasHeaders || {
            ctIdx: candidateCtIdx,
            empresaIdx: candidateCtIdx + 1,
            tipoIdx: candidateCtIdx + 2,
            faixasContrIdx: candidateCtIdx + 3,
            osCols: osColumns.map((label, oIdx) => ({ label, colIdx: candidateCtIdx + 4 + oIdx })),
            percentIdx: candidateCtIdx + 4 + osColumns.length,
            restantesIdx: candidateCtIdx + 5 + osColumns.length,
          };

          const nextRow = rows[i + 1] || [];
          const isNextRowDate = nextRow.some(
            (c) => /\d{2}\/\d{2}\/\d{4}/.test(c) || c.toUpperCase().includes('AGUARDANDO')
          );

          const osList = headers.osCols.map((os) => {
            const faixasVal = (row[os.colIdx] || '').trim();
            let dateVal = '';
            if (isNextRowDate) {
              dateVal = (nextRow[os.colIdx] || '').trim();
            }
            return {
              label: os.label,
              faixas: faixasVal !== '' ? Number(faixasVal) || faixasVal : '',
              data: dateVal,
            };
          });

          const percentual = (row[headers.percentIdx] || row[row.length - 2] || '').trim();
          const restantes = Number((row[headers.restantesIdx] || row[row.length - 1] || '').replace(/\D/g, '')) || 0;

          tabelaFaixasPorOS.push({
            contrato: contratoVal,
            empresa: (row[headers.empresaIdx] || '').trim(),
            tipoEquipamento: (row[headers.tipoIdx] || '').replace(/\r?\n/g, ' ').trim(),
            faixasContratadas: Number((row[headers.faixasContrIdx] || '').replace(/\D/g, '')) || 0,
            osList,
            percentualImplantacaoOperacao: percentual || '0%',
            faixasRestantes: restantes,
          });

          if (isNextRowDate) {
            i++;
          }
        }
      }

      if (joined.includes('VIGÊNCIA DOS CONTRATOS:')) {
        const match = joined.match(/VIGÊNCIA DOS CONTRATOS:\s*([0-9/ à-]+)/i);
        if (match) vigencia = match[1].trim();
      }
    }

    // 2. RELOCAÇÕES
    else if (currentSection === 'RELOCACOES') {
      const ctHeaderIdx = row.findIndex((c) => c.trim().toUpperCase() === 'CONTRATO');
      if (ctHeaderIdx !== -1) {
        const empresaIdx = row.findIndex((c) => c.trim().toUpperCase() === 'EMPRESA');
        const tipoIdx = row.findIndex((c) => c.trim().toUpperCase().includes('TIPO'));
        const faixasRelocIdx = row.findIndex((c) => c.trim().toUpperCase().includes('RELOCAÇÃO'));
        const pUsoIdx = row.findIndex((c) => c.toUpperCase().includes('1º USO') || c.toUpperCase().includes('1° USO'));
        const sUsoIdx = row.findIndex((c) => c.toUpperCase().includes('2º USO') || c.toUpperCase().includes('2° USO'));
        const restanteIdx = row.findIndex((c) => c.trim().toUpperCase().includes('RESTANTE'));

        relocHeaders = {
          ctIdx: ctHeaderIdx,
          empresaIdx: empresaIdx !== -1 ? empresaIdx : ctHeaderIdx + 1,
          tipoIdx: tipoIdx !== -1 ? tipoIdx : ctHeaderIdx + 2,
          faixasRelocIdx: faixasRelocIdx !== -1 ? faixasRelocIdx : ctHeaderIdx + 3,
          pUsoIdx: pUsoIdx !== -1 ? pUsoIdx : ctHeaderIdx + 4,
          sUsoIdx: sUsoIdx !== -1 ? sUsoIdx : ctHeaderIdx + 5,
          restanteIdx: restanteIdx !== -1 ? restanteIdx : ctHeaderIdx + 6,
        };
        continue;
      }

      const candidateCtIdx = relocHeaders ? relocHeaders.ctIdx : row.findIndex((c) => /274\d|\d{4}\/\d{4}/.test(c.trim()));
      if (candidateCtIdx !== -1) {
        const contratoVal = (row[candidateCtIdx] || '').trim();
        if (contratoVal.startsWith('274') || /^\d{4}\/\d{4}$/.test(contratoVal)) {
          const headers = relocHeaders || {
            ctIdx: candidateCtIdx,
            empresaIdx: candidateCtIdx + 1,
            tipoIdx: candidateCtIdx + 2,
            faixasRelocIdx: candidateCtIdx + 3,
            pUsoIdx: candidateCtIdx + 4,
            sUsoIdx: candidateCtIdx + 5,
            restanteIdx: candidateCtIdx + 6,
          };

          const pUsoFaixas = (row[headers.pUsoIdx] || '').trim();
          const sUsoFaixas = (row[headers.sUsoIdx] || '').trim();
          const restante = Number((row[headers.restanteIdx] || '').replace(/\D/g, '')) || 0;

          const nextRow = rows[i + 1] || [];
          const isNextRowDate = nextRow.some(
            (c) => /\d{2}\/\d{2}\/\d{4}/.test(c) || c.toUpperCase().includes('AGUARDANDO')
          );

          let pUsoData = '';
          let sUsoData = '';
          if (isNextRowDate) {
            pUsoData = (nextRow[headers.pUsoIdx] || '').trim();
            sUsoData = (nextRow[headers.sUsoIdx] || '').trim();
          }

          tabelaRelocacoes.push({
            contrato: contratoVal,
            empresa: (row[headers.empresaIdx] || '').trim(),
            tipoEquipamento: (row[headers.tipoIdx] || '').replace(/\r?\n/g, ' ').trim(),
            faixasRelocacao: Number((row[headers.faixasRelocIdx] || '').replace(/\D/g, '')) || 0,
            primeiroUso: {
              faixas: pUsoFaixas !== '' ? Number(pUsoFaixas) || pUsoFaixas : undefined,
              data: pUsoData,
            },
            segundoUso: {
              faixas: sUsoFaixas !== '' ? Number(sUsoFaixas) || sUsoFaixas : undefined,
              data: sUsoData,
            },
            restante,
          });

          if (isNextRowDate) {
            i++;
          }
        }
      }
    }

    // 3. CONTRATOS 2020
    else if (currentSection === 'CONTRATOS_2020') {
      const candidateCtIdx = row.findIndex((c) => /258\d|\b2020\b/.test(c.trim()) && !c.includes('VIGÊNCIA'));
      if (candidateCtIdx !== -1) {
        const contrato = (row[candidateCtIdx] || '').trim();
        if (contrato.startsWith('258') || contrato.includes('2020')) {
          const empresa = (row[candidateCtIdx + 1] || '').trim();
          const tipoEquipamento = (row[candidateCtIdx + 2] || '').replace(/\r?\n/g, ' ').trim();
          const faixasContratadas = Number((row[candidateCtIdx + 3] || '').replace(/\D/g, '')) || 0;

          const os1 = (row[candidateCtIdx + 4] || '').replace(/(\d{2}\/\d{2}\/\d{4})/g, '$1 - ').trim();
          const os2 = (row[candidateCtIdx + 6] || row[candidateCtIdx + 5] || '').replace(/(\d{2}\/\d{2}\/\d{4})/g, '$1 - ').trim();
          const os3 = (row[candidateCtIdx + 7] || row[candidateCtIdx + 6] || '').replace(/(\d{2}\/\d{2}\/\d{4})/g, '$1 - ').trim();
          const percentual = (row[candidateCtIdx + 8] || row[candidateCtIdx + 7] || '').trim();

          tabelaContratos2020.push({
            contrato,
            empresa,
            tipoEquipamento,
            faixasContratadas,
            os1: os1 || '-',
            os2: os2 || '-',
            os3: os3 || '-',
            percentual: percentual || '100,00%',
          });
        }
      }

      if (joined.includes('VIGÊNCIA DOS CONTRATOS:')) {
        const match = joined.match(/VIGÊNCIA DOS CONTRATOS:\s*([0-9/ à-]+)/i);
        if (match) vigencia2020 = match[1].trim();
        const legMatch = joined.match(/LEGENDA\.\s*:\s*(.*)/i);
        if (legMatch) legendas2020 = legMatch[1].trim();
      }
    }

    // 4. CUSTOS 2024
    else if (currentSection === 'CUSTOS_2024') {
      const ctHeaderIdx = row.findIndex((c) => c.trim().toUpperCase() === 'CONTRATO');
      if (ctHeaderIdx !== -1) {
        const empresaIdx = row.findIndex((c) => c.trim().toUpperCase() === 'EMPRESA');
        const valorContrIdx = row.findIndex((c) => c.toUpperCase().includes('VALOR') && c.toUpperCase().includes('CONTRATADO'));
        const bdiIdx = row.findIndex((c) => c.trim().toUpperCase() === 'BDI');
        const ta1Idx = row.findIndex((c) => c.toUpperCase().includes('1ª TA') || c.toUpperCase().includes('1° TA'));
        const ta2Idx = row.findIndex((c) => c.toUpperCase().includes('2ª TA') || c.toUpperCase().includes('2° TA'));
        const valorAtualIdx = row.findIndex((c) => c.toUpperCase().includes('ATUAL'));

        custosHeaders = {
          ctIdx: ctHeaderIdx,
          empresaIdx: empresaIdx !== -1 ? empresaIdx : ctHeaderIdx + 1,
          valorContrIdx: valorContrIdx !== -1 ? valorContrIdx : ctHeaderIdx + 2,
          bdiIdx: bdiIdx !== -1 ? bdiIdx : ctHeaderIdx + 3,
          ta1Idx: ta1Idx !== -1 ? ta1Idx : ctHeaderIdx + 4,
          ta2Idx: ta2Idx !== -1 ? ta2Idx : ctHeaderIdx + 5,
          valorAtualIdx: valorAtualIdx !== -1 ? valorAtualIdx : ctHeaderIdx + 6,
        };
        continue;
      }

      const candidateCtIdx = custosHeaders ? custosHeaders.ctIdx : row.findIndex((c) => /274\d|\d{4}\/\d{4}/.test(c.trim()));
      if (candidateCtIdx !== -1) {
        const contrato = (row[candidateCtIdx] || '').trim();
        if (contrato.startsWith('274') || /^\d{4}\/\d{4}$/.test(contrato)) {
          const headers = custosHeaders || {
            ctIdx: candidateCtIdx,
            empresaIdx: candidateCtIdx + 1,
            valorContrIdx: candidateCtIdx + 2,
            bdiIdx: candidateCtIdx + 3,
            ta1Idx: candidateCtIdx + 4,
            ta2Idx: candidateCtIdx + 5,
            valorAtualIdx: candidateCtIdx + 6,
          };

          const empresa = (row[headers.empresaIdx] || '').trim();
          const valorContratado = (row[headers.valorContrIdx] || '').trim();
          const bdi = (row[headers.bdiIdx] || '').trim();
          const primeiraTA = (row[headers.ta1Idx] || '').trim();
          const segundaTA = (row[headers.ta2Idx] || '').trim();
          const valorAtualBDI = (row[headers.valorAtualIdx] || '').trim();

          tabelaCustos.push({
            contrato,
            empresa,
            valorContratado,
            bdi: bdi || '-',
            primeiraTA: primeiraTA || '-',
            segundaTA: segundaTA || '-',
            valorAtualBDI: valorAtualBDI || valorContratado,
          });
        }
      }
    }

    // 4.1. CUSTOS POR RELOCAÇÃO
    else if (currentSection === 'CUSTOS_RELOCACAO') {
      const ctHeaderIdx = row.findIndex((c) => c.trim().toUpperCase() === 'CONTRATO');
      if (ctHeaderIdx !== -1) {
        const empresaIdx = row.findIndex((c) => c.trim().toUpperCase() === 'EMPRESA');
        const valorContrIdx = row.findIndex(
          (c) => c.toUpperCase().includes('VALOR') && (c.toUpperCase().includes('RELOCA') || c.toUpperCase().includes('CONTRATADO'))
        );
        const bdiIdx = row.findIndex((c) => c.trim().toUpperCase() === 'BDI');
        const ta1Idx = row.findIndex((c) => c.toUpperCase().includes('1ª TA') || c.toUpperCase().includes('1° TA'));
        const ta2Idx = row.findIndex((c) => c.toUpperCase().includes('2ª TA') || c.toUpperCase().includes('2° TA'));
        const valorAtualIdx = row.findIndex((c) => c.toUpperCase().includes('ATUAL'));

        custosRelocHeaders = {
          ctIdx: ctHeaderIdx,
          empresaIdx: empresaIdx !== -1 ? empresaIdx : ctHeaderIdx + 1,
          valorContrIdx: valorContrIdx !== -1 ? valorContrIdx : ctHeaderIdx + 2,
          bdiIdx: bdiIdx !== -1 ? bdiIdx : ctHeaderIdx + 3,
          ta1Idx: ta1Idx !== -1 ? ta1Idx : ctHeaderIdx + 4,
          ta2Idx: ta2Idx !== -1 ? ta2Idx : ctHeaderIdx + 5,
          valorAtualIdx: valorAtualIdx !== -1 ? valorAtualIdx : ctHeaderIdx + 6,
        };
        continue;
      }

      const candidateCtIdx = custosRelocHeaders ? custosRelocHeaders.ctIdx : row.findIndex((c) => /274\d|\d{4}\/\d{4}/.test(c.trim()));
      if (candidateCtIdx !== -1) {
        const contrato = (row[candidateCtIdx] || '').trim();
        if (contrato.startsWith('274') || /^\d{4}\/\d{4}$/.test(contrato)) {
          const headers = custosRelocHeaders || {
            ctIdx: candidateCtIdx,
            empresaIdx: candidateCtIdx + 1,
            valorContrIdx: candidateCtIdx + 2,
            bdiIdx: candidateCtIdx + 3,
            ta1Idx: candidateCtIdx + 4,
            ta2Idx: candidateCtIdx + 5,
            valorAtualIdx: candidateCtIdx + 6,
          };

          const empresa = (row[headers.empresaIdx] || '').trim();
          const valorContratado = (row[headers.valorContrIdx] || '').trim();
          const bdi = (row[headers.bdiIdx] || '').trim();
          const primeiraTA = (row[headers.ta1Idx] || '').trim();
          const segundaTA = (row[headers.ta2Idx] || '').trim();
          const valorAtual = (row[headers.valorAtualIdx] || '').trim();

          tabelaCustosRelocacao.push({
            contrato,
            empresa,
            valorContratado: valorContratado || '-',
            bdi: bdi || '-',
            primeiraTA: primeiraTA || '-',
            segundaTA: segundaTA || '-',
            valorAtual: valorAtual || (valorContratado && valorContratado !== '-' ? valorContratado : '-'),
          });
        }
      }
    }

    // 5. COMPARATIVO CUSTOS
    else if (currentSection === 'COMPARATIVO_CUSTOS') {
      const candidateCtIdx = row.findIndex(
        (c) =>
          c.trim().startsWith('258') ||
          c.trim().includes('CETAI') ||
          (/2\d{3}\/\d{4}/.test(c.trim()) && !c.includes('VIGÊNCIA'))
      );
      if (candidateCtIdx !== -1) {
        const contrato = (row[candidateCtIdx] || '').trim();
        if (contrato !== 'CONTRATO' && contrato !== '' && !contrato.includes('LICITAÇÃO') && !contrato.includes('ATUALIZADO')) {
          const licit2020Contratado = (row[candidateCtIdx + 1] || '').trim();
          const licit2020Atual = (row[candidateCtIdx + 2] || '').trim();
          const licit2023Contratado = (row[candidateCtIdx + 3] || '').trim();
          const licit2023Atual = (row[candidateCtIdx + 4] || row[candidateCtIdx + 5] || '').trim();

          tabelaComparativoCustos.push({
            contrato,
            licitacao2020Contratado: licit2020Contratado || '-',
            licitacao2020Atual: licit2020Atual || '-',
            licitacao2023Contratado: licit2023Contratado || '-',
            licitacao2023Atual: licit2023Atual || '-',
          });
        }
      }

      if (joined.includes('ATUALIZADO:')) {
        const match = joined.match(/ATUALIZADO:\s*([0-9/]+)/i);
        if (match) dataAtualizacaoComparativo = match[1].trim();
      }
    }
  }

  // Fallbacks if section parsing found partial data
  if (tabelaFaixasPorOS.length === 0) tabelaFaixasPorOS = INITIAL_CONTROLE_GERAL_DATA.tabelaFaixasPorOS;
  if (tabelaRelocacoes.length === 0) tabelaRelocacoes = INITIAL_CONTROLE_GERAL_DATA.tabelaRelocacoes;
  if (tabelaContratos2020.length === 0) tabelaContratos2020 = INITIAL_CONTROLE_GERAL_DATA.tabelaContratos2020;
  if (tabelaCustos.length === 0) tabelaCustos = INITIAL_CONTROLE_GERAL_DATA.tabelaCustos;
  if (tabelaCustosRelocacao.length === 0) tabelaCustosRelocacao = INITIAL_CONTROLE_GERAL_DATA.tabelaCustosRelocacao;
  if (tabelaComparativoCustos.length === 0) tabelaComparativoCustos = INITIAL_CONTROLE_GERAL_DATA.tabelaComparativoCustos;

  const totalFaixasContratadas = tabelaFaixasPorOS.reduce((acc, curr) => {
    const val = typeof curr.faixasContratadas === 'number' ? curr.faixasContratadas : parseInt(String(curr.faixasContratadas), 10) || 0;
    return acc + val;
  }, 0);

  return {
    tabelaFaixasPorOS,
    osColumns,
    tabelaRelocacoes,
    tabelaContratos2020,
    tabelaCustos,
    tabelaCustosRelocacao,
    tabelaComparativoCustos,
    matrizRecords: [],
    totalFaixasContratadas: totalFaixasContratadas || 1363,
    totalFaixasMatriz: 1063,
    totalFaixasOperacaoMatriz: 700,
    totalFaixasImplantacaoMatriz: 355,
    totalFaixasRelocacaoMatriz: 8,
    totalFaixasRestantes: 229,
    vigencia,
    vigencia2020,
    legendas2020,
    dataAtualizacaoComparativo,
    legendas: INITIAL_CONTROLE_GERAL_DATA.legendas,
  };
}

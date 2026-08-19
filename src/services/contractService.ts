export interface FaixaPorOSRow {
  contrato: string;
  empresa: string;
  tipoEquipamento: string;
  faixasContratadas: number;
  os1: { faixas?: number; data?: string };
  os2: { faixas?: number; data?: string };
  os3: { faixas?: number; data?: string };
  os4: { faixas?: number; data?: string };
  os5: { faixas?: number; data?: string };
  os6: { faixas?: number; data?: string };
  percentualImplantacaoOperacao: string;
  faixasRestantes: number;
}

export interface RelocacaoRow {
  contrato: string;
  empresa: string;
  tipoEquipamento: string;
  faixasRelocacao: number;
  primeiroUso: { faixas?: number; data?: string };
  restante: number;
}

export interface CustoFaixaRow {
  contrato: string;
  empresa: string;
  valorContratado: string;
  bdi: string;
  primeiraTA: string;
  valorAtualBDI: string;
}

export interface ControleGeralCTsData {
  tabelaFaixasPorOS: FaixaPorOSRow[];
  tabelaRelocacoes: RelocacaoRow[];
  tabelaCustos: CustoFaixaRow[];
  totalFaixasContratadas: number;
  vigencia: string;
  legendas: { sigla: string; descricao: string }[];
}

export const INITIAL_CONTROLE_GERAL_DATA: ControleGeralCTsData = {
  tabelaFaixasPorOS: [
    {
      contrato: '2740/2024',
      empresa: 'ELISEU KOPP & CIA LTDA.',
      tipoEquipamento: 'EFE 01 CEV',
      faixasContratadas: 476,
      os1: { faixas: 34, data: '02/09/2024' },
      os2: { faixas: 56, data: '12/12/2024' },
      os3: { faixas: 48, data: '16/05/2025' },
      os4: { faixas: 65, data: '14/08/2025' },
      os5: { faixas: 141, data: '28/11/2025' },
      os6: { faixas: 71, data: 'AGUARDANDO' },
      percentualImplantacaoOperacao: '87,18%',
      faixasRestantes: 61,
    },
    {
      contrato: '2741/2024',
      empresa: 'SPLICE INDÚSTRIA, COMÉRCIO E SERVIÇOS LTDA.',
      tipoEquipamento: 'EFE 02 DAS',
      faixasContratadas: 442,
      os1: { faixas: 32, data: '09/09/2024' },
      os2: { faixas: 65, data: '10/01/2025' },
      os3: { faixas: 55, data: '03/10/2025' },
      os4: { faixas: 139, data: '18/05/2026' },
      os5: {},
      os6: {},
      percentualImplantacaoOperacao: '65,84%',
      faixasRestantes: 151,
    },
    {
      contrato: '2742/2024',
      empresa: 'CONSÓRCIO TRÂNSITO SEGURO',
      tipoEquipamento: 'EFE 03 DAS/DTLP/DCP/DIF',
      faixasContratadas: 445,
      os1: { faixas: 34, data: '09/09/2024' },
      os2: { faixas: 53, data: '28/03/2025' },
      os3: { faixas: 262, data: '01/10/2025' },
      os4: { faixas: 4, data: '09/01/2026' },
      os5: { faixas: 75, data: '07/08/2026' },
      os6: {},
      percentualImplantacaoOperacao: '96,18%',
      faixasRestantes: 17,
    },
  ],
  tabelaRelocacoes: [
    {
      contrato: '2740/2024',
      empresa: 'ELISEU KOPP & CIA LTDA.',
      tipoEquipamento: 'EFE 01 CEV',
      faixasRelocacao: 71,
      primeiroUso: { faixas: 5, data: '28/11/2025' },
      restante: 66,
    },
    {
      contrato: '2741/2024',
      empresa: 'SPLICE INDÚSTRIA, COMÉRCIO E SERVIÇOS LTDA.',
      tipoEquipamento: 'EFE 02 DAS',
      faixasRelocacao: 66,
      primeiroUso: {},
      restante: 66,
    },
    {
      contrato: '2742/2024',
      empresa: 'CONSÓRCIO TRÂNSITO SEGURO',
      tipoEquipamento: 'EFE 03 DAS/DTLP/DCP/DIF',
      faixasRelocacao: 66,
      primeiroUso: {},
      restante: 66,
    },
  ],
  tabelaCustos: [
    {
      contrato: '2740/2024',
      empresa: 'ELISEU KOPP & CIA LTDA.',
      valorContratado: 'R$ 1.052,43',
      bdi: '23,80%',
      primeiraTA: '4,87%',
      valorAtualBDI: 'R$ 1.366,36',
    },
    {
      contrato: '2741/2024',
      empresa: 'SPLICE INDÚSTRIA, COMÉRCIO E SERVIÇOS LTDA.',
      valorContratado: 'R$ 945,70',
      bdi: '25,04%',
      primeiraTA: '4,75%',
      valorAtualBDI: 'R$ 1.238,67',
    },
    {
      contrato: '2742/2024',
      empresa: 'CONSÓRCIO TRÂNSITO SEGURO',
      valorContratado: 'R$ 1.083,00',
      bdi: '21,51%',
      primeiraTA: '4,87%',
      valorAtualBDI: 'R$ 1.380,04',
    },
    {
      contrato: '2743/2024',
      empresa: 'TIVIC',
      valorContratado: 'R$ 249.916,67',
      bdi: '-',
      primeiraTA: '4,75%',
      valorAtualBDI: 'R$ 261.787,70',
    },
  ],
  totalFaixasContratadas: 1363,
  vigencia: '19/07/2024 à 18/07/2029',
  legendas: [
    { sigla: 'DIF', descricao: 'detector de invasão de faixa exclusiva de ônibus' },
    { sigla: 'DAS', descricao: 'detector de avanço de semáforo vermelho' },
    { sigla: 'DTLP', descricao: 'detector de tráfego em local/horário proibido (caminhão)' },
    { sigla: 'DCP', descricao: 'detector de conversão em local proibido' },
    { sigla: 'CEV', descricao: 'controlador eletrônico de velocidade' },
  ],
};

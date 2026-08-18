export interface EquipmentRecord {
  CONTRATO: string;
  CONTRATADA: string;
  'Nº DE SÉRIE': string;
  CÓDIGO: string;
  'COD LOG': string;
  CORREDOR: string;
  'ENDEREÇOS DOS EQUIPAMENTOS': string;
  SENTIDO: string;
  BAIRRO: string;
  REGIONAL: string;
  'ENDEREÇO COMPLETO': string;
  FAIXAS: number;
  FAIXAS_RAW: string;
  TIPO: string;
  'Velocidade Fiscalizada': string;
  OS: string;
  Situação: string;
  ANO: string;
  'Data início operação': string;
  'Data de aceite': string;
  'Data da Aferição': string;
  'Data de Vencimento da Aferição': string;
  CONDIÇÃO: string;
  'DIF Pareado': string;
  Observações: string;
  COORD_LAT_LONG: string;
  'Código Sem Faixa (kopp)': string;
  'REG. OBJ'?: string;
  
  // Parsed coordinates if valid
  lat?: number;
  lng?: number;
  hasValidCoord: boolean;
  
  // Internal index for unique key
  id: string;
  
  // All original raw key-value mapping
  rawFields: Record<string, string>;
}

export interface FilterState {
  contrato: string;
  regional: string;
  bairro: string;
  tipo: string;
  situacao: string;
  condicao: string;
  os: string;
  codigos: string[];
  dataInicioStart: string;
  dataInicioEnd: string;
  dataAceiteStart: string;
  dataAceiteEnd: string;
  searchQuery: string;
  onlyWithCoords: boolean;
}

export type ActiveTab = 'mapa' | 'indicadores' | 'tabela' | 'relatorios';

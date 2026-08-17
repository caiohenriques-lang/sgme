import Papa from 'papaparse';
import { EquipmentRecord } from '../types';

export const SHEET_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTMqNFwW7A6_F2X16VVXddLQgovMI5sEAbUq1cgT0vF3CDGL1dGjYn5nciuxPpZCiF-_hyXHi8k-Bgt/pub?gid=226357776&single=true&output=csv';

export const ALL_SHEET_HEADERS = [
  'CONTRATO',
  'CONTRATADA',
  'Nº DE SÉRIE',
  'CÓDIGO',
  'COD LOG',
  'CORREDOR',
  'ENDEREÇOS DOS EQUIPAMENTOS',
  'SENTIDO',
  'BAIRRO',
  'REGIONAL',
  'ENDEREÇO COMPLETO',
  'FAIXAS',
  'TIPO',
  'Velocidade Fiscalizada',
  'OS',
  'Situação',
  'ANO',
  'Data início operação',
  'Data de aceite',
  'Data da Aferição',
  'Data de Vencimento da Aferição',
  'CONDIÇÃO',
  'DIF Pareado',
  'Observações',
  'COORD_LAT_LONG',
  'Código Sem Faixa (kopp)'
];

export async function fetchEquipmentData(): Promise<{
  records: EquipmentRecord[];
  lastUpdated: Date;
}> {
  let csvText = '';
  const urls = [
    SHEET_CSV_URL,
    `https://corsproxy.io/?${encodeURIComponent(SHEET_CSV_URL)}`,
    `https://api.allorigins.win/raw?url=${encodeURIComponent(SHEET_CSV_URL)}`
  ];

  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const text = await response.text();
        if (text && text.includes('CONTRATO')) {
          csvText = text;
          break;
        }
      }
    } catch (err) {
      console.warn(`Attempt failed for ${url}:`, err);
    }
  }

  if (!csvText) {
    // Attempt to load from localStorage cache if fetch failed
    const cachedData = localStorage.getItem('geapi_equipment_data_cache');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        if (parsed && Array.isArray(parsed.records) && parsed.records.length > 0) {
          return {
            records: parsed.records,
            lastUpdated: new Date(parsed.lastUpdated || Date.now()),
          };
        }
      } catch (cacheErr) {
        console.error('Failed to parse cache:', cacheErr);
      }
    }
    throw new Error('Não foi possível carregar a planilha do Google Sheets. Verifique a conexão com a internet ou permissões de acesso.');
  }

  return new Promise((resolve, reject) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        const records: EquipmentRecord[] = (results.data as Record<string, string>[]).map(
          (row, index) => {
            const coordStr = (row['COORD_LAT_LONG'] || '').trim();
            let lat: number | undefined;
            let lng: number | undefined;
            let hasValidCoord = false;

            if (coordStr) {
              const parts = coordStr.split(',');
              if (parts.length === 2) {
                const pLat = parseFloat(parts[0].trim());
                const pLng = parseFloat(parts[1].trim());
                if (!isNaN(pLat) && !isNaN(pLng) && Math.abs(pLat) <= 90 && Math.abs(pLng) <= 180) {
                  lat = pLat;
                  lng = pLng;
                  hasValidCoord = true;
                }
              }
            }

            const faixasRaw = row['FAIXAS'] || '0';
            const faixas = parseInt(faixasRaw, 10) || 0;

            const rawFields: Record<string, string> = {};
            ALL_SHEET_HEADERS.forEach((header) => {
              let csvColName = header;
              if (header === 'Data início operação') {
                csvColName = row['Data de Início  da Operação'] !== undefined ? 'Data de Início  da Operação' : 
                             (row['Data de Início da Operação'] !== undefined ? 'Data de Início da Operação' : 'Data início operação');
              } else if (header === 'Data de aceite') {
                csvColName = row['Data de Aceite'] !== undefined ? 'Data de Aceite' : 'Data de aceite';
              }

              let val = row[csvColName] !== undefined ? String(row[csvColName]).trim() : '';
              if (val.toUpperCase().includes('#VALUE')) {
                val = 'Em implantação';
              }
              rawFields[header] = val;
            });

            let anoStr = (row['ANO'] || '').trim();
            if (anoStr.toUpperCase().includes('#VALUE')) {
              anoStr = 'Em implantação';
            }

            return {
              CONTRATO: (row['CONTRATO'] || '').trim(),
              CONTRATADA: (row['CONTRATADA'] || '').trim(),
              'Nº DE SÉRIE': (row['Nº DE SÉRIE'] || '').trim(),
              CÓDIGO: (row['CÓDIGO'] || '').trim(),
              'COD LOG': (row['COD LOG'] || '').trim(),
              CORREDOR: (row['CORREDOR'] || '').trim(),
              'ENDEREÇOS DOS EQUIPAMENTOS': (row['ENDEREÇOS DOS EQUIPAMENTOS'] || '').trim(),
              SENTIDO: (row['SENTIDO'] || '').trim(),
              BAIRRO: (row['BAIRRO'] || '').trim(),
              REGIONAL: (row['REGIONAL'] || '').trim(),
              'ENDEREÇO COMPLETO': (row['ENDEREÇO COMPLETO'] || '').trim(),
              FAIXAS: faixas,
              FAIXAS_RAW: faixasRaw,
              TIPO: (row['TIPO'] || '').trim(),
              'Velocidade Fiscalizada': (row['Velocidade Fiscalizada'] || '').trim(),
              OS: (row['OS'] || '').trim(),
              Situação: (row['Situação'] || '').trim(),
              ANO: anoStr,
              'Data início operação': (row['Data de Início  da Operação'] || row['Data de Início da Operação'] || row['Data início operação'] || '').trim(),
              'Data de aceite': (row['Data de Aceite'] || row['Data de aceite'] || '').trim(),
              'Data da Aferição': (row['Data da Aferição'] || '').trim(),
              'Data de Vencimento da Aferição': (row['Data de Vencimento da Aferição'] || '').trim(),
              CONDIÇÃO: (row['CONDIÇÃO'] || '').trim(),
              'DIF Pareado': (row['DIF Pareado'] || '').trim(),
              Observações: (row['Observações'] || '').trim(),
              COORD_LAT_LONG: coordStr,
              'Código Sem Faixa (kopp)': (row['Código Sem Faixa (kopp)'] || '').trim(),
              
              lat,
              lng,
              hasValidCoord,
              id: `eq-${index}-${row['CÓDIGO'] || index}`,
              rawFields
            };
          }
        );

        // Cache successful records in localStorage
        try {
          localStorage.setItem(
            'geapi_equipment_data_cache',
            JSON.stringify({ records, lastUpdated: new Date().toISOString() })
          );
        } catch (e) {
          console.warn('Could not save data to localStorage cache:', e);
        }

        resolve({
          records,
          lastUpdated: new Date()
        });
      },
      error: (error: Error) => {
        reject(error);
      }
    });
  });
}

/**
 * Helper to parse BR date strings (DD/MM/YYYY) into Date objects for comparisons
 */
export function parseBRDate(dateStr: string): Date | null {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.trim().split('/');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      return new Date(year, month, day);
    }
  }
  return null;
}

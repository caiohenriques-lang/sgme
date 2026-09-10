import React, { useState, useEffect, useMemo } from 'react';
import { EquipmentRecord } from '../types';
import { ALL_SHEET_HEADERS } from '../services/dataService';
import { exportSingleRecordPDF } from '../utils/pdfExport';
import { X, FileDown, MapPin, Building, Calendar, Layers, Tag, ExternalLink, Copy, Check, ChevronLeft, ChevronRight } from 'lucide-react';

interface EquipmentDetailModalProps {
  record: EquipmentRecord | null;
  onClose: () => void;
  allRecords?: EquipmentRecord[];
  onSelectRecord?: (record: EquipmentRecord) => void;
}

export function getCoLocatedRecords(
  target: EquipmentRecord | null,
  allList: EquipmentRecord[] = []
): EquipmentRecord[] {
  if (!target) return [];

  // Check if target has valid parsed numerical coordinates
  const targetHasCoords =
    target.hasValidCoord &&
    typeof target.lat === 'number' &&
    typeof target.lng === 'number' &&
    !isNaN(target.lat) &&
    !isNaN(target.lng);

  const cleanTargetRaw = (target.COORD_LAT_LONG || '')
    .trim()
    .replace(/\s+/g, '')
    .toLowerCase();

  const isRawValid =
    cleanTargetRaw &&
    cleanTargetRaw !== '-' &&
    cleanTargetRaw !== '0,0' &&
    cleanTargetRaw !== '0.0,0.0';

  if (!targetHasCoords && !isRawValid) {
    return [target];
  }

  const results = allList.filter((r) => {
    if (r.id === target.id) return true;

    // Numerical coordinate match within 0.00002 degrees (~2 meters)
    if (
      targetHasCoords &&
      r.hasValidCoord &&
      typeof r.lat === 'number' &&
      typeof r.lng === 'number'
    ) {
      const latDiff = Math.abs(r.lat - target.lat!);
      const lngDiff = Math.abs(r.lng - target.lng!);
      if (latDiff < 0.00002 && lngDiff < 0.00002) {
        return true;
      }
    }

    // Exact string match on raw coordinates
    if (isRawValid && r.COORD_LAT_LONG) {
      const rRaw = r.COORD_LAT_LONG.trim().replace(/\s+/g, '').toLowerCase();
      if (rRaw === cleanTargetRaw) {
        return true;
      }
    }

    return false;
  });

  if (!results.some((m) => m.id === target.id)) {
    results.unshift(target);
  }

  // Sort by CÓDIGO in ascending order (natural alphanumeric)
  results.sort((a, b) =>
    (a.CÓDIGO || '').trim().localeCompare((b.CÓDIGO || '').trim(), undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  );

  return results;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  record,
  onClose,
  allRecords = [],
  onSelectRecord,
}) => {
  const [currentRecord, setCurrentRecord] = useState<EquipmentRecord | null>(record);
  const [copiedCoord, setCopiedCoord] = useState(false);
  const [copiedSerial, setCopiedSerial] = useState(false);

  // Sync internal currentRecord when prop record changes (e.g. opened from map/table)
  useEffect(() => {
    setCurrentRecord(record);
  }, [record]);

  // Find all records that share the EXACT same coordinate
  const coLocatedRecords = useMemo(() => {
    return getCoLocatedRecords(currentRecord, allRecords);
  }, [currentRecord, allRecords]);

  if (!currentRecord) return null;

  const currentIndex = coLocatedRecords.findIndex((r) => r.id === currentRecord.id);

  const handleSelectCoLocated = (item: EquipmentRecord) => {
    setCurrentRecord(item);
    onSelectRecord?.(item);
  };

  const handlePrevRecord = () => {
    if (currentIndex > 0) {
      handleSelectCoLocated(coLocatedRecords[currentIndex - 1]);
    }
  };

  const handleNextRecord = () => {
    if (currentIndex < coLocatedRecords.length - 1) {
      handleSelectCoLocated(coLocatedRecords[currentIndex + 1]);
    }
  };

  const handleExportPDF = () => {
    exportSingleRecordPDF(currentRecord);
  };

  const handleCopyCoordinates = (coordText: string) => {
    if (!coordText) return;
    const cleanCoord = coordText.trim().replace(/\s+/g, '');
    const mapsLink = `https://www.google.com/maps/place/${cleanCoord}`;
    navigator.clipboard.writeText(mapsLink).then(() => {
      setCopiedCoord(true);
      setTimeout(() => setCopiedCoord(false), 2000);
    }).catch((err) => {
      console.error('Erro ao copiar link do Google Maps:', err);
    });
  };

  const handleCopySerial = (serialText: string) => {
    if (!serialText) return;
    navigator.clipboard.writeText(serialText.trim()).then(() => {
      setCopiedSerial(true);
      setTimeout(() => setCopiedSerial(false), 2000);
    }).catch((err) => {
      console.error('Erro ao copiar número de série:', err);
    });
  };

  // Group headers into clean sections
  const sections = [
    {
      title: 'Identificação & Contrato',
      icon: Building,
      fields: [
        'CONTRATO',
        'CONTRATADA',
        'CÓDIGO',
        'Nº DE SÉRIE',
        'REG. OBJ',
      ],
    },
    {
      title: 'Localização & Georreferenciamento',
      icon: MapPin,
      fields: [
        'COD LOG',
        'ENDEREÇOS DOS EQUIPAMENTOS',
        'SENTIDO',
        'BAIRRO',
        'REGIONAL',
        'COORD_LAT_LONG',
      ],
    },
    {
      title: 'Especificações Técnicas e Operação',
      icon: Layers,
      fields: [
        'TIPO',
        'FAIXAS',
        'Velocidade Fiscalizada',
        'Situação',
        'CONDIÇÃO',
        'DIF Pareado',
        'Plano de Operação',
        'OS',
        'Observações',
      ],
    },
    {
      title: 'Datas Importantes',
      icon: Calendar,
      fields: [
        'Data início operação',
        'Data de aceite',
        'Data da Aferição',
        'Data de Vencimento da Aferição',
        'Data de Desligamento',
      ],
    },
  ];

  const isCEV = (currentRecord.TIPO || '').toUpperCase().trim() === 'CEV';
  const cevLevantamentoUrl =
    'https://prefeitura.pbh.gov.br/bhtrans/informacoes/transportes/veiculos/fiscalizacao-eletronica/controladores-eletronicos-de-velocidade/levantamentos-tecnicos';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-6 sm:my-8 max-h-[90vh] flex flex-col">
        
        {/* Modal Header - Consistent with Portal Design System */}
        <div className="bg-white text-slate-900 px-5 sm:px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl shrink-0 border border-slate-200/90 bg-white p-1 flex items-center justify-center shadow-2xs">
              <img
                src="/icon.svg"
                alt="GEAPI FE"
                className="w-full h-full object-contain rounded-lg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-base sm:text-lg text-slate-900 flex items-center gap-1.5 leading-tight">
                  <span>Equipamento:</span>
                  <span className="text-slate-900 font-bold">{currentRecord.CÓDIGO || 'Sem Código'}</span>
                </h3>
                <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                  {currentRecord.TIPO || 'N/A'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                Contrato {currentRecord.CONTRATO || 'N/A'} • {currentRecord.CONTRATADA || 'Empresa N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors shadow-2xs cursor-pointer"
              title="Gerar PDF detalhado deste registro"
            >
              <FileDown className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Co-located Equipments Navigation Bar (same exact coordinate) */}
        {coLocatedRecords.length > 1 && (
          <div className="bg-slate-50/90 border-b border-slate-200 px-5 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0 select-none">
            <div className="flex items-center gap-2 text-slate-700 font-semibold">
              <Layers className="w-4 h-4 text-blue-600 shrink-0" />
              <span>
                {coLocatedRecords.length} equipamentos neste ponto ({currentIndex + 1} de {coLocatedRecords.length})
              </span>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-0.5">
              <button
                type="button"
                onClick={handlePrevRecord}
                disabled={currentIndex <= 0}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs shrink-0 cursor-pointer"
                title="Equipamento anterior no mesmo ponto"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Anterior</span>
              </button>

              <div className="flex items-center gap-1.5 overflow-x-auto shrink-0 max-w-[280px] sm:max-w-[420px] py-0.5">
                {coLocatedRecords.map((item, idx) => {
                  const isActive = item.id === currentRecord.id;
                  const label = `${item.CÓDIGO || 'Sem Cód.'} (${item.TIPO || 'N/A'})`;
                  return (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => handleSelectCoLocated(item)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all shadow-2xs shrink-0 cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white border border-blue-600 shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                      title={`Alternar para ${label}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={handleNextRecord}
                disabled={currentIndex >= coLocatedRecords.length - 1}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all shadow-2xs shrink-0 cursor-pointer"
                title="Próximo equipamento no mesmo ponto"
              >
                <span>Próximo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Modal Body - Scrollable */}
        <div key={currentRecord.id} className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm animate-in fade-in-50 duration-150">
          
          {/* Grouped Fields - Only non-empty fields rendered */}
          {(() => {
            const getFieldValue = (header: string) => {
              if (header === 'REG. OBJ' || header === 'Registro do Objeto') {
                const reg =
                  currentRecord['REG. OBJ'] ||
                  currentRecord.rawFields?.['REG. OBJ'] ||
                  currentRecord.rawFields?.['REG. OBJ.'] ||
                  (currentRecord as any)['REG. OBJ.'] ||
                  (currentRecord as any)['REG. OBJ'] ||
                  '';
                return String(reg).trim();
              }
              if (header === 'Plano de Operação') {
                const po =
                  currentRecord['Plano de Operação'] ||
                  currentRecord.rawFields?.['Plano de Operação'] ||
                  currentRecord.rawFields?.['Plano de Operacao'] ||
                  currentRecord.rawFields?.['PLANO DE OPERAÇÃO'] ||
                  currentRecord.rawFields?.['PLANO DE OPERACAO'] ||
                  (currentRecord as any)['Plano de Operação'] ||
                  '';
                return String(po).trim();
              }
              const raw = currentRecord.rawFields ? currentRecord.rawFields[header] : undefined;
              const direct = (currentRecord as any)[header];
              let val = raw !== undefined && raw !== null ? String(raw).trim() : (direct !== undefined && direct !== null ? String(direct).trim() : '');
              if (val.toUpperCase().includes('#VALUE')) {
                val = 'Em implantação';
              }
              return val;
            };

            const renderedSections = sections.map((sec, idx) => {
              const Icon = sec.icon;
              const validFields = sec.fields.filter((header) => {
                if (header === 'REG. OBJ' && (currentRecord.TIPO || '').toUpperCase().trim() === 'CEV') {
                  return false;
                }
                const val = getFieldValue(header);
                return val !== '' && val !== '-';
              });

              if (validFields.length === 0) return null;

              return (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span>{sec.title}</span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {validFields.map((header) => {
                      const value = getFieldValue(header);

                      let labelText = header.toUpperCase();
                      if (header === 'COD LOG') labelText = 'CÓDIGO DO LOGRADOURO';
                      else if (header === 'ENDEREÇOS DOS EQUIPAMENTOS') labelText = 'ENDEREÇO';
                      else if (header === 'COORD_LAT_LONG') labelText = 'COORDENADAS GEOGRÁFICAS';
                      else if (header === 'Situação') labelText = 'SITUAÇÃO';
                      else if (header === 'Velocidade Fiscalizada') labelText = 'VELOCIDADE FISCALIZADA';
                      else if (header === 'DIF Pareado') labelText = 'DIF PAREADO';
                      else if (header === 'Plano de Operação') labelText = 'PLANO DE OPERAÇÃO';
                      else if (header === 'OS') labelText = 'ORDEM DE SERVIÇO';
                      else if (header === 'REG. OBJ') labelText = 'REGISTRO DE OBJETO';
                      else if (header === 'Data início operação') labelText = 'INÍCIO DE OPERAÇÃO';
                      else if (header === 'Data de aceite') labelText = 'ACEITE';
                      else if (header === 'Data da Aferição') labelText = 'AFERIÇÃO';
                      else if (header === 'Data de Vencimento da Aferição') labelText = 'VENCIMENTO DA AFERIÇÃO';
                      else if (header === 'Data de Desligamento') labelText = 'DATA DE DESLIGAMENTO';
                      else if (header === 'Observações') labelText = 'OBSERVAÇÕES';

                      const isRegObj = header === 'REG. OBJ' || header === 'Registro do Objeto' || labelText === 'REGISTRO DE OBJETO';
                      const inmetroUrl = isRegObj && value ? `https://registro.inmetro.gov.br/consulta/detalhe.aspx?pag=1&NumeroRegistro=${encodeURIComponent(value.trim())}` : null;

                      const isCEV = (currentRecord.TIPO || '').toUpperCase().trim() === 'CEV';
                      const isCodigo = header === 'CÓDIGO' || header === 'Código' || labelText === 'CÓDIGO';
                      const cevCodigoUrl = isCEV && isCodigo && value && value !== '-' ? cevLevantamentoUrl : null;

                      const isNumSerie = header === 'Nº DE SÉRIE' || header === 'Nº de Série' || labelText === 'Nº DE SÉRIE';
                      const rbmlqUrl = isCEV && isNumSerie && value && value !== '-' ? 'https://servicos.rbmlq.gov.br/Instrumento' : null;

                      const isCoord = header === 'COORD_LAT_LONG' || labelText === 'COORDENADAS GEOGRÁFICAS';
                      const isSituacao = header === 'Situação' || labelText === 'SITUAÇÃO';
                      const isCondicao = header === 'CONDIÇÃO' || labelText === 'CONDIÇÃO';

                      return (
                        <div key={header} className="grid grid-cols-1 sm:grid-cols-3 px-4 py-2.5 hover:bg-slate-50/80 transition-colors">
                          <span className="font-semibold text-slate-600 text-xs flex items-center gap-1">
                            <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                            {labelText}
                          </span>
                          <span className="sm:col-span-2 text-slate-900 font-normal break-words flex items-center gap-2 flex-wrap">
                            {inmetroUrl ? (
                              <a
                                href={inmetroUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800 hover:underline bg-blue-50/80 hover:bg-blue-100/80 px-2.5 py-0.5 rounded-md border border-blue-200/80 transition-colors shadow-2xs"
                                title={`Consultar registro ${value} no portal do Inmetro`}
                              >
                                <span>{value}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              </a>
                            ) : cevCodigoUrl ? (
                              <a
                                href={cevCodigoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800 hover:underline bg-blue-50/80 hover:bg-blue-100/80 px-2.5 py-0.5 rounded-md border border-blue-200/80 transition-colors shadow-2xs font-mono"
                                title="Consultar Levantamentos Técnicos de Controladores Eletrônicos de Velocidade (PBH / BHTRANS)"
                              >
                                <span>{value}</span>
                                <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                              </a>
                            ) : rbmlqUrl ? (
                              <div className="flex items-center gap-2 flex-wrap">
                                <a
                                  href={rbmlqUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 font-medium text-blue-600 hover:text-blue-800 hover:underline bg-blue-50/80 hover:bg-blue-100/80 px-2.5 py-0.5 rounded-md border border-blue-200/80 transition-colors shadow-2xs"
                                  title={`Consultar instrumento nº ${value} no portal de serviços RBMLQ`}
                                >
                                  <span>{value}</span>
                                  <ExternalLink className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                </a>
                                <button
                                  onClick={() => handleCopySerial(value)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                                    copiedSerial
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                      : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-300'
                                  }`}
                                  title="Copiar número de série para a área de transferência"
                                >
                                  {copiedSerial ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                      <span className="text-[11px] font-semibold text-emerald-700">Copiado!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3 text-slate-500 shrink-0" />
                                      <span className="text-[11px]">Copiar</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : isCoord ? (
                              value && value !== '-' ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                  <a
                                    href={`https://www.google.com/maps/place/${value.trim().replace(/\s+/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono bg-blue-50/70 hover:bg-blue-100 text-blue-700 hover:text-blue-900 px-2 py-0.5 rounded border border-blue-200 hover:border-blue-300 transition-colors inline-flex items-center gap-1.5 group font-medium"
                                    title="Abrir localização no Google Maps"
                                  >
                                    <span>{value}</span>
                                    <ExternalLink className="w-3.5 h-3.5 text-blue-500 group-hover:text-blue-700 shrink-0" />
                                  </a>
                                  <button
                                    onClick={() => handleCopyCoordinates(value)}
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                                      copiedCoord
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                        : 'bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-300'
                                    }`}
                                    title="Copiar link do Google Maps para a área de transferência"
                                  >
                                    {copiedCoord ? (
                                      <>
                                        <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                        <span className="text-[11px] font-semibold text-emerald-700">Link Copiado!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3 h-3 text-slate-500 shrink-0" />
                                        <span className="text-[11px]">Copiar Link</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              ) : (
                                '-'
                              )
                            ) : isSituacao && value && value !== '-' ? (
                              <span
                                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                                  value.toLowerCase().includes('relocação') || value.toLowerCase().includes('relocacao')
                                    ? 'bg-purple-100 text-purple-800 border-purple-200/80'
                                    : value.toLowerCase().includes('em operação') || value.toLowerCase().includes('em operacao') || value.toLowerCase().includes('operação') || value.toLowerCase().includes('operacao')
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80'
                                    : value.toLowerCase().includes('desligado')
                                    ? 'bg-rose-100 text-rose-800 border-rose-200/80'
                                    : 'bg-amber-100 text-amber-800 border-amber-200/80'
                                }`}
                              >
                                {value}
                              </span>
                            ) : isCondicao && value && (value.toLowerCase().includes('relocação') || value.toLowerCase().includes('relocacao')) ? (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200/80">
                                {value}
                              </span>
                            ) : (
                              value
                            )}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }).filter(Boolean);

            if (renderedSections.length === 0) {
              return (
                <div className="text-center py-8 text-slate-500 text-xs italic">
                  Nenhuma informação preenchida para este equipamento.
                </div>
              );
            }

            return renderedSections;
          })()}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-5 sm:px-6 py-3.5 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="font-medium text-slate-500">GEAPI — Gerência de Análise e Processamento de Infrações</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-semibold border border-slate-200 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};


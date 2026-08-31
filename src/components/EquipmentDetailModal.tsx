import React, { useState } from 'react';
import { EquipmentRecord } from '../types';
import { ALL_SHEET_HEADERS } from '../services/dataService';
import { exportSingleRecordPDF } from '../utils/pdfExport';
import { X, FileDown, MapPin, Building, Calendar, Layers, Tag, ExternalLink, Copy, Check } from 'lucide-react';
import { SpeedRadarIcon } from './SpeedRadarIcon';

interface EquipmentDetailModalProps {
  record: EquipmentRecord | null;
  onClose: () => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({ record, onClose }) => {
  const [copiedCoord, setCopiedCoord] = useState(false);
  const [copiedSerial, setCopiedSerial] = useState(false);

  if (!record) return null;

  const handleExportPDF = () => {
    exportSingleRecordPDF(record);
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
        'OS',
        'REG. OBJ',
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
        'Observações',
      ],
    },
  ];

  const isCEV = (record.TIPO || '').toUpperCase().trim() === 'CEV';
  const cevLevantamentoUrl =
    'https://prefeitura.pbh.gov.br/bhtrans/informacoes/transportes/veiculos/fiscalizacao-eletronica/controladores-eletronicos-de-velocidade/levantamentos-tecnicos';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-0.5 shrink-0">
              <SpeedRadarIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg text-white flex items-center gap-1.5">
                  <span>Equipamento:</span>
                  {isCEV && record.CÓDIGO ? (
                    <a
                      href={cevLevantamentoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                      title="Consultar Levantamentos Técnicos de Controladores Eletrônicos de Velocidade (PBH / BHTRANS)"
                    >
                      <span>{record.CÓDIGO}</span>
                      <ExternalLink className="w-4 h-4 text-blue-400 shrink-0" />
                    </a>
                  ) : (
                    <span>{record.CÓDIGO || 'Sem Código'}</span>
                  )}
                </h3>
                <span className="text-xs bg-blue-500/20 text-blue-300 font-semibold px-2.5 py-0.5 rounded-full border border-blue-400/30">
                  {record.TIPO || 'N/A'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Contrato {record.CONTRATO || 'N/A'} • {record.CONTRATADA || 'Empresa N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
              title="Gerar PDF detalhado deste registro"
            >
              <FileDown className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 text-xs sm:text-sm">
          
          {/* Quick Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between text-xs text-slate-600">
            <span>Exibindo dados do equipamento obtidos da planilha de origem.</span>
            <span className="text-slate-500 font-mono text-[10px]">ID: {record.id}</span>
          </div>

          {/* Grouped Fields - Only non-empty fields rendered */}
          {(() => {
            const getFieldValue = (header: string) => {
              if (header === 'REG. OBJ' || header === 'Registro do Objeto') {
                const reg =
                  record['REG. OBJ'] ||
                  record.rawFields?.['REG. OBJ'] ||
                  record.rawFields?.['REG. OBJ.'] ||
                  (record as any)['REG. OBJ.'] ||
                  (record as any)['REG. OBJ'] ||
                  '';
                return String(reg).trim();
              }
              const raw = record.rawFields ? record.rawFields[header] : undefined;
              const direct = (record as any)[header];
              let val = raw !== undefined && raw !== null ? String(raw).trim() : (direct !== undefined && direct !== null ? String(direct).trim() : '');
              if (val.toUpperCase().includes('#VALUE')) {
                val = 'Em implantação';
              }
              return val;
            };

            const renderedSections = sections.map((sec, idx) => {
              const Icon = sec.icon;
              const validFields = sec.fields.filter((header) => {
                if (header === 'REG. OBJ' && (record.TIPO || '').toUpperCase().trim() === 'CEV') {
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
                      else if (header === 'REG. OBJ') labelText = 'REGISTRO DE OBJETO';
                      else if (header === 'Data início operação') labelText = 'INÍCIO DE OPERAÇÃO';
                      else if (header === 'Data de aceite') labelText = 'ACEITE';
                      else if (header === 'Data da Aferição') labelText = 'AFERIÇÃO';
                      else if (header === 'Data de Vencimento da Aferição') labelText = 'VENCIMENTO DA AFERIÇÃO';
                      else if (header === 'Data de Desligamento') labelText = 'DATA DE DESLIGAMENTO';
                      else if (header === 'Observações') labelText = 'OBSERVAÇÕES';

                      const isRegObj = header === 'REG. OBJ' || header === 'Registro do Objeto' || labelText === 'REGISTRO DE OBJETO';
                      const inmetroUrl = isRegObj && value ? `https://registro.inmetro.gov.br/consulta/detalhe.aspx?pag=1&NumeroRegistro=${encodeURIComponent(value.trim())}` : null;

                      const isCEV = (record.TIPO || '').toUpperCase().trim() === 'CEV';
                      const isCodigo = header === 'CÓDIGO' || header === 'Código' || labelText === 'CÓDIGO';
                      const cevCodigoUrl = isCEV && isCodigo && value && value !== '-' ? cevLevantamentoUrl : null;

                      const isNumSerie = header === 'Nº DE SÉRIE' || header === 'Nº de Série' || labelText === 'Nº DE SÉRIE';
                      const rbmlqUrl = isCEV && isNumSerie && value && value !== '-' ? 'https://servicos.rbmlq.gov.br/Instrumento' : null;

                      const isCoord = header === 'COORD_LAT_LONG' || labelText === 'COORDENADAS GEOGRÁFICAS';

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
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>GEAPI — Gerência de Análise e Processamento de Infrações</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-medium rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

import React from 'react';
import { EquipmentRecord } from '../types';
import { ALL_SHEET_HEADERS } from '../services/dataService';
import { exportSingleRecordPDF } from '../utils/pdfExport';
import { X, FileDown, MapPin, Building, Calendar, Layers, Tag } from 'lucide-react';
import { SpeedLimit50Icon } from './SpeedLimit50Icon';

interface EquipmentDetailModalProps {
  record: EquipmentRecord | null;
  onClose: () => void;
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const handleExportPDF = () => {
    exportSingleRecordPDF(record);
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
        'COD LOG',
      ],
    },
    {
      title: 'Localização & Georreferenciamento',
      icon: MapPin,
      fields: [
        'ENDEREÇO COMPLETO',
        'ENDEREÇOS DOS EQUIPAMENTOS',
        'CORREDOR',
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
        'ANO',
      ],
    },
    {
      title: 'Aferição & Datas Importantes',
      icon: Calendar,
      fields: [
        'Data início operação',
        'Data de aceite',
        'Data da Aferição',
        'Data de Vencimento da Aferição',
        'Observações',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1 shrink-0">
              <SpeedLimit50Icon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-white">
                  Equipamento: {record.CÓDIGO || 'Sem Código'}
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

                      return (
                        <div key={header} className="grid grid-cols-1 sm:grid-cols-3 px-4 py-2.5 hover:bg-slate-50/80 transition-colors">
                          <span className="font-semibold text-slate-600 text-xs flex items-center gap-1">
                            <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                            {header === 'Data início operação' ? 'Data de Início de Operação' : header === 'Data de aceite' ? 'Data de Aceite' : header}
                          </span>
                          <span className="sm:col-span-2 text-slate-900 font-normal break-words">
                            {value}
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

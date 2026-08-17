import React, { useState } from 'react';
import { EquipmentRecord } from '../types';
import { exportFilteredRecordsPDF, exportSingleRecordPDF } from '../utils/pdfExport';
import {
  Table as TableIcon,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowUpDown,
  Search,
  MapPin
} from 'lucide-react';

interface TableViewProps {
  records: EquipmentRecord[];
  onSelectRecord: (record: EquipmentRecord) => void;
}

export const TableView: React.FC<TableViewProps> = ({ records, onSelectRecord }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<keyof EquipmentRecord>('CÓDIGO');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sorting
  const sortedRecords = React.useMemo(() => {
    return [...records].sort((a, b) => {
      let valA = a[sortField] ?? '';
      let valB = b[sortField] ?? '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }

      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [records, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = sortedRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: keyof EquipmentRecord) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleExportAllPDF = () => {
    exportFilteredRecordsPDF(records, `Tabela Compilada - ${records.length} registros`);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden pb-4">
      
      {/* Table Header Bar */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <TableIcon className="w-5 h-5 text-blue-400" />
            Lista Completa de Equipamentos
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compilado detalhado de todos os registros da planilha com filtros aplicados ({records.length} itens)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportAllPDF}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm"
          >
            <FileDown className="w-4 h-4" />
            <span>Exportar Lista em PDF</span>
          </button>
        </div>
      </div>

      {/* Table Controls */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
        <div>
          Página <strong className="text-slate-900">{currentPage}</strong> de <strong className="text-slate-900">{totalPages}</strong> (Exibindo {paginatedRecords.length} de {records.length} registros)
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 font-medium">
            <span>Itens por página:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:ring-1 focus:ring-blue-500"
            >
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        </div>
      </div>

      {/* Main Data Table */}
      <div className="overflow-x-auto min-h-[400px]">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th
                onClick={() => handleSort('CONTRATO')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Contrato</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('CÓDIGO')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Código</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('TIPO')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Tipo</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('FAIXAS')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Faixas</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('Situação')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap"
              >
                <div className="flex items-center gap-1">
                  <span>Situação</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('ENDEREÇO COMPLETO')}
                className="py-3 px-3 min-w-[200px] cursor-pointer hover:bg-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Endereço Completo</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('BAIRRO')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Bairro</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('Data início operação')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Data de Início de Operação</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('Data de aceite')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Data de Aceite</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th
                onClick={() => handleSort('CONDIÇÃO')}
                className="py-3 px-3 cursor-pointer hover:bg-slate-200 transition-colors whitespace-nowrap text-center"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>Condição</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>
              <th className="py-3 px-3 text-center whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-12 text-center text-slate-400">
                  Nenhum equipamento encontrado com os filtros selecionados.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((r) => (
                <tr
                  key={r.id}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer group"
                  onClick={() => onSelectRecord(r)}
                >
                  <td className="py-2.5 px-3 font-medium text-slate-700 whitespace-nowrap text-center">
                    {r.CONTRATO || '-'}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 group-hover:text-blue-700 whitespace-nowrap text-center">
                    {r.CÓDIGO || '-'}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="inline-block bg-slate-100 text-slate-800 font-semibold px-2 py-0.5 rounded text-[11px] border border-slate-200">
                      {r.TIPO || '-'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-blue-700 whitespace-nowrap">
                    {r.FAIXAS}
                  </td>
                  <td className="py-2.5 px-3 text-[11px] whitespace-nowrap">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full font-medium ${
                        r.Situação?.includes('Em operação')
                          ? 'bg-emerald-100 text-emerald-800'
                          : r.Situação?.includes('Desligado')
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {r.Situação?.replace('\n', ' ') || '-'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-normal text-slate-800 min-w-[200px] break-words whitespace-normal">
                    {r['ENDEREÇO COMPLETO'] || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-center">{r.BAIRRO || '-'}</td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-center">
                    {r['Data início operação'] || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-center">
                    {r['Data de aceite'] || '-'}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap text-center">{r.CONDIÇÃO || '-'}</td>
                  <td className="py-2.5 px-3 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onSelectRecord(r)}
                        className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Ver Ficha Completa (26 campos)"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => exportSingleRecordPDF(r)}
                        className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                        title="Exportar PDF deste registro"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
        <div>
          Página <strong className="text-slate-900">{currentPage}</strong> de {totalPages}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3 font-semibold text-slate-800">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

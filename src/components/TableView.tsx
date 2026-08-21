import React, { useState } from 'react';
import { EquipmentRecord } from '../types';
import { exportFilteredRecordsPDF, exportSingleRecordPDF } from '../utils/pdfExport';
import {
  Table as TableIcon,
  FileDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  ArrowUpDown
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
    <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden pb-4 w-full max-w-full">
      
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
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors shadow-sm cursor-pointer"
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

      {/* Mobile Scroll Indicator */}
      <div className="block lg:hidden text-[10.5px] text-slate-500 font-medium px-4 py-1.5 bg-slate-100/90 border-b border-slate-200">
        ↔ Deslize para os lados para visualizar todas as colunas
      </div>

      {/* Main Data Table */}
      <div className="w-full overflow-x-auto min-h-[400px]">
        <table className="w-full min-w-[1020px] lg:min-w-0 lg:table-fixed text-[11px] text-left">
          <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
            <tr>
              <th
                onClick={() => handleSort('CONTRATO')}
                className="w-[7%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>Contrato</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
              </th>
              <th
                onClick={() => handleSort('CÓDIGO')}
                className="w-[7%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>Código</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
              </th>
              <th
                onClick={() => handleSort('ENDEREÇO COMPLETO')}
                className="w-[26%] py-2.5 px-1.5 cursor-pointer hover:bg-slate-200 transition-colors text-left"
              >
                <div className="flex items-center gap-0.5">
                  <span>Endereço Completo</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
              </th>
              <th
                onClick={() => handleSort('BAIRRO')}
                className="w-[9%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>Bairro</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
              </th>
              <th
                onClick={() => handleSort('REGIONAL')}
                className="w-[7%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>Regional</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
              </th>
              <th
                onClick={() => handleSort('TIPO')}
                className="w-[6%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>Tipo</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
              </th>
              <th
                onClick={() => handleSort('FAIXAS')}
                className="w-[4%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>Faixas</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
              </th>
              <th
                onClick={() => handleSort('Data início operação')}
                className="w-[8%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center leading-tight"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>Início Op.</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
              </th>
              <th
                onClick={() => handleSort('OS')}
                className="w-[6%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>OS</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
              </th>
              <th
                onClick={() => handleSort('CONDIÇÃO')}
                className="w-[6%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>Condição</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
              </th>
              <th
                onClick={() => handleSort('Situação')}
                className="w-[9%] py-2.5 px-1 cursor-pointer hover:bg-slate-200 transition-colors text-center"
              >
                <div className="flex items-center justify-center gap-0.5">
                  <span>Situação</span>
                  <ArrowUpDown className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                </div>
              </th>
              <th className="w-[5%] py-2.5 px-1 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-12 text-center text-slate-400">
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
                  {/* CONTRATO */}
                  <td className="py-1.5 px-1 font-medium text-slate-700 text-center truncate">
                    {r.CONTRATO || '-'}
                  </td>

                  {/* CÓDIGO */}
                  <td className="py-1.5 px-1 font-bold text-slate-900 group-hover:text-blue-700 text-center truncate">
                    {r.CÓDIGO || '-'}
                  </td>

                  {/* ENDEREÇO COMPLETO */}
                  <td className="py-1.5 px-1.5 font-normal text-slate-800 break-words whitespace-normal leading-tight text-[10.5px]">
                    {r['ENDEREÇO COMPLETO'] || '-'}
                  </td>

                  {/* BAIRRO */}
                  <td className="py-1.5 px-1 text-slate-600 text-center break-words whitespace-normal leading-tight text-[10px]">
                    {r.BAIRRO || '-'}
                  </td>

                  {/* REGIONAL */}
                  <td className="py-1.5 px-1 text-slate-600 text-center truncate text-[10px]">
                    {r.REGIONAL || '-'}
                  </td>

                  {/* TIPO */}
                  <td className="py-1.5 px-1 text-center truncate">
                    <span className="inline-block bg-slate-100 text-slate-800 font-semibold px-1 py-0.5 rounded text-[9.5px] border border-slate-200 truncate max-w-full">
                      {r.TIPO || '-'}
                    </span>
                  </td>

                  {/* FAIXAS */}
                  <td className="py-1.5 px-1 text-center font-bold text-blue-700">
                    {r.FAIXAS ?? '-'}
                  </td>

                  {/* INÍCIO DA OPERAÇÃO */}
                  <td className="py-1.5 px-1 text-slate-600 text-center text-[10px] break-words whitespace-normal leading-tight">
                    {r['Data início operação'] || '-'}
                  </td>

                  {/* OS */}
                  <td className="py-1.5 px-1 text-slate-600 text-center truncate text-[10px]">
                    {r.OS || '-'}
                  </td>

                  {/* CONDIÇÃO */}
                  <td className="py-1.5 px-1 text-slate-600 text-center truncate text-[10px]">
                    {r.CONDIÇÃO || '-'}
                  </td>

                  {/* SITUAÇÃO */}
                  <td className="py-1.5 px-1 text-center text-[9.5px]">
                    <span
                      className={`inline-block px-1 py-0.5 rounded-full font-medium truncate max-w-full ${
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

                  {/* AÇÕES */}
                  <td className="py-1.5 px-1 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-0.5">
                      <button
                        onClick={() => onSelectRecord(r)}
                        className="p-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded transition-colors cursor-pointer"
                        title="Ver Ficha Completa"
                      >
                        <Eye className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => exportSingleRecordPDF(r)}
                        className="p-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded transition-colors cursor-pointer"
                        title="Exportar PDF deste registro"
                      >
                        <FileDown className="w-3 h-3" />
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
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="px-3 font-semibold text-slate-800">
            {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-white text-slate-700 font-medium cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

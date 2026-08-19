import React, { useEffect, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from 'recharts';
import {
  MonthlyRecord,
  INITIAL_MONTHLY_RECORDS,
  fetchETransitoMonthlyData,
} from '../services/eTransitoService';

// Custom Label for Bars that only renders for non-null numbers and formats with dots
const renderBarLabel = (props: any) => {
  const { x, y, width, value } = props;
  if (value === null || value === undefined || value === 0 || isNaN(value)) {
    return null;
  }
  const formatted = Number(value).toLocaleString('pt-BR');
  return (
    <text
      x={x + width / 2}
      y={y - 6}
      fill="#0f172a"
      textAnchor="middle"
      fontSize={10}
      fontWeight={700}
    >
      {formatted}
    </text>
  );
};

// Custom Label for the Line that only renders for non-null numbers
const renderLineLabel = (props: any) => {
  const { x, y, value } = props;
  if (value === null || value === undefined || isNaN(value)) {
    return null;
  }
  return (
    <text
      x={x}
      y={y - 12}
      fill="#0f172a"
      textAnchor="middle"
      fontSize={11}
      fontWeight={700}
    >
      {value}
    </text>
  );
};

// Custom Dot for the Line
const renderCustomDot = (props: any) => {
  const { cx, cy, value } = props;
  if (value === null || value === undefined || isNaN(value)) {
    return null;
  }
  return <circle cx={cx} cy={cy} r={4.5} fill="#0f172a" stroke="#0f172a" />;
};

export const ETransitoChartCard: React.FC = () => {
  const [data, setData] = useState<MonthlyRecord[]>(INITIAL_MONTHLY_RECORDS);

  useEffect(() => {
    fetchETransitoMonthlyData().then((res) => {
      if (res && res.length > 0) {
        setData(res);
      }
    });
  }, []);

  return (
    <div
      id="chart-card-etransito-mensal"
      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between"
    >
      {/* Title */}
      <div className="text-center mb-4">
        <h3 className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
          Sistema eTransito - Número médio de registros/mês recebidos em 2026
        </h3>
      </div>

      {/* Main Chart Canvas */}
      <div className="w-full h-80 sm:h-96 min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={data}
            margin={{ top: 35, right: 30, left: 10, bottom: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            {/* X-Axis */}
            <XAxis
              dataKey="mesAbreviado"
              tick={{ fontSize: 11, fill: '#334155' }}
              interval={0}
              axisLine={{ stroke: '#cbd5e1' }}
              tickLine={false}
            />

            {/* Left Y-Axis: 0 to 25 mil */}
            <YAxis
              yAxisId="left"
              orientation="left"
              domain={[0, 25000]}
              ticks={[0, 5000, 10000, 15000, 20000, 25000]}
              tickFormatter={(v) => (v === 0 ? '0' : `${v / 1000} mil`)}
              tick={{ fontSize: 11, fill: '#334155' }}
              axisLine={false}
              tickLine={false}
              width={50}
            />

            {/* Right Y-Axis: 0 to 800 */}
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 800]}
              ticks={[0, 200, 400, 600, 800]}
              tick={{ fontSize: 11, fill: '#334155' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />

            {/* Custom Tooltip */}
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-lg text-xs space-y-1.5 border border-slate-800">
                      <div className="font-bold border-b border-slate-700 pb-1 text-slate-200">
                        {label}
                      </div>
                      {payload.map((entry: any, index: number) => {
                        if (entry.value === null || entry.value === undefined) return null;
                        const isFaixas = entry.dataKey === 'faixasOperacao';
                        const formattedValue = isFaixas
                          ? `${entry.value} faixas`
                          : `${Number(entry.value).toLocaleString('pt-BR')} registros`;
                        return (
                          <div key={`tooltip-item-${index}`} className="flex items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-slate-300">
                              <span
                                className="w-2.5 h-2.5 rounded-xs"
                                style={{ backgroundColor: entry.color || entry.fill }}
                              />
                              {entry.name}:
                            </span>
                            <span className="font-bold text-white">{formattedValue}</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Bars: 1. Registros Gerados em Homologação (Portal Amber #d97706) */}
            <Bar
              yAxisId="left"
              dataKey="registrosHomologacao"
              name="Registros Gerados em Homologação"
              fill="#d97706"
              radius={[3, 3, 0, 0]}
              barSize={22}
            >
              <LabelList dataKey="registrosHomologacao" content={renderBarLabel} />
            </Bar>

            {/* Bars: 2. Registros Gerados em Operação (Portal Emerald #059669) */}
            <Bar
              yAxisId="left"
              dataKey="registrosOperacao"
              name="Registros Gerados em Operação"
              fill="#059669"
              radius={[3, 3, 0, 0]}
              barSize={22}
            >
              <LabelList dataKey="registrosOperacao" content={renderBarLabel} />
            </Bar>

            {/* Bars: 3. Total de Registros Recebidos (Portal Blue #2563eb) */}
            <Bar
              yAxisId="left"
              dataKey="totalRegistros"
              name="Total de Registros Recebidos"
              fill="#2563eb"
              radius={[3, 3, 0, 0]}
              barSize={22}
            >
              <LabelList dataKey="totalRegistros" content={renderBarLabel} />
            </Bar>

            {/* Line: QTD. de Faixas em Operação (Portal Dark Slate #0f172a) */}
            <Line
              yAxisId="right"
              type="linear"
              dataKey="faixasOperacao"
              name="QTD. de Faixas em Operação"
              stroke="#0f172a"
              strokeWidth={1.75}
              strokeDasharray="4 4"
              dot={renderCustomDot}
              activeDot={{ r: 6, fill: '#0f172a' }}
              connectNulls={false}
            >
              <LabelList dataKey="faixasOperacao" content={renderLineLabel} />
            </Line>
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend at Bottom (Matching the reference layout and portal palette) */}
      <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-7 pt-4 border-t border-slate-100 mt-2 text-xs sm:text-sm font-medium text-slate-700">
        <div className="flex items-center gap-2">
          <span className="w-4 h-3.5 bg-[#d97706] rounded-xs inline-block shadow-2xs"></span>
          <span>Registros Gerados em Homologação</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-3.5 bg-[#059669] rounded-xs inline-block shadow-2xs"></span>
          <span>Registros Gerados em Operação</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-4 h-3.5 bg-[#2563eb] rounded-xs inline-block shadow-2xs"></span>
          <span>Total de Registros Recebidos</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center text-slate-900 font-mono text-base font-bold">
            <span className="text-xs">··</span>●<span className="text-xs">··</span>
          </span>
          <span>QTD. de Faixas em Operação</span>
        </div>
      </div>

      {/* Footnote text below the chart */}
      <div className="pt-3 mt-3 border-t border-slate-100/80 text-center sm:text-left">
        <p className="text-[11px] sm:text-xs text-slate-500 italic font-medium">
          Inicio de operação dos CEV do Anel Rodoviário: Fevereiro/2026; Iníco de operação de 31 faixas de DIF: Maio/2026
        </p>
      </div>
    </div>
  );
};

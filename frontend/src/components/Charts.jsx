import React from "react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend, ReferenceLine,
} from "recharts";
import { inrCompact } from "../lib/format";

const AXIS = { stroke: "#475569", fontSize: 11, fontFamily: "JetBrains Mono" };
const GRID = "rgba(255,255,255,0.06)";
export const CHART_COLORS = ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#6366F1", "#F97316", "#14B8A6"];

const TooltipBox = ({ active, payload, label, fmt }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="card-surface p-3 !bg-[#0D1B2A] shadow-2xl border-white/15">
      {label !== undefined && <div className="text-[11px] font-mono text-slate-400 mb-1.5">{label}</div>}
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: p.color || p.fill }} />
          <span className="text-slate-400">{p.name}:</span>
          <span className="num font-semibold text-slate-100">{fmt ? fmt(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

export const AreaChartCard = ({ data, xKey, series, height = 280, fmt = inrCompact }) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
      <defs>
        {series.map((s, i) => (
          <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={s.color || CHART_COLORS[i]} stopOpacity={0.35} />
            <stop offset="100%" stopColor={s.color || CHART_COLORS[i]} stopOpacity={0.02} />
          </linearGradient>
        ))}
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
      <XAxis dataKey={xKey} {...AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
      <YAxis {...AXIS} tickLine={false} axisLine={false} tickFormatter={fmt} width={54} />
      <Tooltip content={<TooltipBox fmt={fmt} />} />
      {series.map((s, i) => (
        <Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || CHART_COLORS[i]}
          strokeWidth={2} fill={`url(#grad-${s.key})`} />
      ))}
    </AreaChart>
  </ResponsiveContainer>
);

export const BarChartCard = ({ data, xKey, series, height = 280, fmt = inrCompact, stacked = false }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
      <XAxis dataKey={xKey} {...AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
      <YAxis {...AXIS} tickLine={false} axisLine={false} tickFormatter={fmt} width={54} />
      <Tooltip content={<TooltipBox fmt={fmt} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
      {series.map((s, i) => (
        <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.color || CHART_COLORS[i]}
          radius={stacked ? 0 : [4, 4, 0, 0]} stackId={stacked ? "a" : undefined} maxBarSize={48} />
      ))}
    </BarChart>
  </ResponsiveContainer>
);

export const LineChartCard = ({ data, xKey, series, height = 280, fmt = inrCompact, refLine }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
      <XAxis dataKey={xKey} {...AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
      <YAxis {...AXIS} tickLine={false} axisLine={false} tickFormatter={fmt} width={54} />
      <Tooltip content={<TooltipBox fmt={fmt} />} />
      {refLine !== undefined && <ReferenceLine y={0} stroke="#EF4444" strokeDasharray="4 4" />}
      {series.map((s, i) => (
        <Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={s.color || CHART_COLORS[i]}
          strokeWidth={2.4} dot={false} />
      ))}
    </LineChart>
  </ResponsiveContainer>
);

export const ComposedCashflowCard = ({ data, height = 300, fmt = inrCompact }) => (
  <ResponsiveContainer width="100%" height={height}>
    <ComposedChart data={data} margin={{ top: 8, right: 8, left: 4, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
      <XAxis dataKey="year" {...AXIS} tickLine={false} axisLine={{ stroke: GRID }} />
      <YAxis {...AXIS} tickLine={false} axisLine={false} tickFormatter={fmt} width={54} />
      <Tooltip content={<TooltipBox fmt={fmt} />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
      <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "#94A3B8" }} />
      <Bar dataKey="saving" name="Annual Savings" fill="#10B981" radius={[3, 3, 0, 0]} maxBarSize={26} />
      <Bar dataKey="debtService" name="Debt Service (EMI)" fill="#F59E0B" radius={[3, 3, 0, 0]} maxBarSize={26} />
      <Line type="monotone" dataKey="net" name="Net Benefit" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
    </ComposedChart>
  </ResponsiveContainer>
);

export const CostPieCard = ({ data, height = 280, fmt = inrCompact }) => (
  <ResponsiveContainer width="100%" height={height}>
    <PieChart>
      <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={58} outerRadius={100} paddingAngle={2}>
        {data.map((d, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="#0D1B2A" strokeWidth={2} />)}
      </Pie>
      <Tooltip content={<TooltipBox fmt={fmt} />} />
    </PieChart>
  </ResponsiveContainer>
);

// Horizontal tornado bars (sensitivity)
export const TornadoChart = ({ data, base, fmt = (v) => `${v?.toFixed(1)} yr` }) => {
  const maxRange = Math.max(...data.map((d) => Math.max(Math.abs(d.high - base), Math.abs(d.low - base)))) || 1;
  return (
    <div className="space-y-3">
      {data.map((d) => {
        const lowW = Math.abs(d.low - base) / maxRange * 50;
        const highW = Math.abs(d.high - base) / maxRange * 50;
        return (
          <div key={d.label} className="flex items-center gap-3 text-xs">
            <div className="w-40 text-right text-slate-400 shrink-0 truncate">{d.label}</div>
            <div className="flex-1 flex items-center">
              <div className="w-1/2 flex justify-end">
                <div className="h-6 rounded-l bg-emerald-500/70 flex items-center justify-start pl-2" style={{ width: `${lowW}%` }}>
                  {lowW > 12 && <span className="num text-[10px] text-slate-950 font-semibold">{fmt(d.low)}</span>}
                </div>
              </div>
              <div className="w-px h-8 bg-white/30" />
              <div className="w-1/2 flex justify-start">
                <div className="h-6 rounded-r bg-amber-500/80 flex items-center justify-end pr-2" style={{ width: `${highW}%` }}>
                  {highW > 12 && <span className="num text-[10px] text-slate-950 font-semibold">{fmt(d.high)}</span>}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div className="flex justify-center gap-6 text-[10px] text-slate-500 pt-2 font-mono">
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/70" /> Favourable</span>
        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80" /> Adverse</span>
        <span>Base: {fmt(base)}</span>
      </div>
    </div>
  );
};

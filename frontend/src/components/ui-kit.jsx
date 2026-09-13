import React from "react";
import { Info } from "lucide-react";

export const Section = ({ children, className = "", id }) => (
  <section id={id} className={`max-w-[1400px] mx-auto px-4 lg:px-8 ${className}`}>{children}</section>
);

export const Eyebrow = ({ children, className = "" }) => (
  <div className={`inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-500 ${className}`}>
    <span className="w-6 h-px bg-amber-500/60" />{children}
  </div>
);

export const PageHeader = ({ eyebrow, title, subtitle, children }) => (
  <div className="border-b border-white/10 bg-[#0D1B2A] hero-radial">
    <Section className="py-12 lg:py-16">
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h1 className="font-head text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-50 max-w-3xl">{title}</h1>
      {subtitle && <p className="mt-4 text-base lg:text-lg text-slate-400 max-w-2xl leading-relaxed">{subtitle}</p>}
      {children && <div className="mt-6">{children}</div>}
    </Section>
  </div>
);

export const Card = ({ children, className = "", hover = false, ...rest }) => (
  <div className={`card-surface p-6 ${hover ? "hover:border-amber-500/40 transition-colors" : ""} ${className}`} {...rest}>
    {children}
  </div>
);

export const Metric = ({ label, value, sub, tone = "default", icon: Icon, testId }) => {
  const toneColor = { default: "text-slate-50", amber: "text-amber-400", emerald: "text-emerald-400", blue: "text-blue-400", danger: "text-red-400" }[tone];
  return (
    <div className="card-surface p-5" data-testid={testId}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wider text-slate-500 font-mono">{label}</div>
        {Icon && <Icon className={`w-4 h-4 ${toneColor} opacity-70`} />}
      </div>
      <div className={`num text-2xl lg:text-[26px] font-bold ${toneColor} leading-none`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1.5">{sub}</div>}
    </div>
  );
};

export const SourceTag = ({ source, effective, verified, className = "" }) => (
  <div className={`flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono text-slate-500 ${className}`}>
    {source && <span>Source: {source}</span>}
    {effective && <span>Effective: {effective}</span>}
    {verified && <span>Last verified: {verified}</span>}
  </div>
);

export const Disclaimer = ({ children, className = "" }) => (
  <div className={`flex gap-2.5 items-start text-xs text-slate-400 bg-white/[0.03] border border-white/10 rounded-lg p-3.5 ${className}`}>
    <Info className="w-4 h-4 text-amber-500/70 shrink-0 mt-0.5" />
    <p className="leading-relaxed">{children}</p>
  </div>
);

export const Pill = ({ children, tone = "slate" }) => {
  const map = {
    slate: "bg-slate-500/10 text-slate-300 border-slate-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    danger: "bg-red-500/10 text-red-400 border-red-500/20",
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${map[tone]}`}>{children}</span>;
};

export const Btn = ({ children, variant = "primary", as: As = "button", className = "", ...rest }) => {
  const styles = {
    primary: "bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20",
    secondary: "bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-100 font-semibold",
    outline: "border border-amber-500/40 hover:bg-amber-500/10 text-amber-400 font-medium",
    ghost: "text-slate-300 hover:text-amber-400 hover:bg-white/5 font-medium",
  }[variant];
  return <As className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg transition-all active:scale-[0.98] text-sm ${styles} ${className}`} {...rest}>{children}</As>;
};

// Score gauge (SVG)
export const ScoreGauge = ({ score = 0, size = 180, tone = "amber" }) => {
  const color = { amber: "#F59E0B", emerald: "#10B981", blue: "#3B82F6", danger: "#EF4444" }[tone] || "#F59E0B";
  const r = size / 2 - 14;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c * 0.75;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12"
        strokeDasharray={`${c * 0.75} ${c}`} strokeLinecap="round" transform={`rotate(135 ${size / 2} ${size / 2})`} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth="12"
        strokeDasharray={`${dash} ${c}`} strokeLinecap="round" transform={`rotate(135 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)" }} />
      <text x="50%" y="47%" textAnchor="middle" className="num" fontSize="42" fontWeight="800" fill="#F8FAFC">{score}</text>
      <text x="50%" y="62%" textAnchor="middle" fontSize="11" fill="#64748B" fontFamily="monospace">/ 100</text>
    </svg>
  );
};

// Formatting helpers for Indian numbering (lakh / crore) and currency.

export const inr = (v, opts = {}) => {
  if (v === null || v === undefined || isNaN(v)) return "—";
  const { decimals = 0 } = opts;
  return "₹" + Number(v).toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

// Compact Indian currency: ₹1.2 Cr, ₹45.0 L, ₹8,000
export const inrCompact = (v) => {
  if (v === null || v === undefined || isNaN(v)) return "—";
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} Cr`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} L`;
  if (abs >= 1e3) return `${sign}₹${(abs / 1e3).toFixed(1)}K`;
  return `${sign}₹${Math.round(abs)}`;
};

export const num = (v, decimals = 0) => {
  if (v === null || v === undefined || isNaN(v)) return "—";
  return Number(v).toLocaleString("en-IN", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  });
};

export const kw = (v) => {
  if (v === null || v === undefined || isNaN(v)) return "—";
  if (v >= 1000) return `${(v / 1000).toFixed(2)} MW`;
  return `${num(v, v < 10 ? 1 : 0)} kW`;
};

export const kwh = (v) => {
  if (v === null || v === undefined || isNaN(v)) return "—";
  if (v >= 1e6) return `${(v / 1e6).toFixed(2)} GWh`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)} MWh`;
  return `${num(v)} kWh`;
};

export const pct = (v, d = 1) => {
  if (v === null || v === undefined || isNaN(v) || !isFinite(v)) return "—";
  return `${Number(v).toFixed(d)}%`;
};

export const yrs = (v) => {
  if (v === null || v === undefined || isNaN(v) || !isFinite(v)) return "—";
  return `${Number(v).toFixed(1)} yrs`;
};

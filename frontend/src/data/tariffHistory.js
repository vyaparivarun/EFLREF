/*
 * Historical C&I tariff trend — indicative CAGR of HT industrial/commercial
 * tariffs over the last 5 & 10 years, derived from historical SERC tariff
 * orders and CEA electricity price trends. INDICATIVE — verify against the
 * specific DISCOM's tariff-order history before relying on it.
 */

export const TARIFF_TREND_META = {
  source: "Indicative — derived from historical SERC tariff orders & CEA electricity price trends",
  lastVerified: "2026-06",
  note: "Historical tariff CAGR is indicative and varies by consumer category, voltage and DISCOM. Past increases do not guarantee future changes. Verify each DISCOM's tariff-order history.",
};

// c10 = 10-year CAGR (%), c5 = 5-year CAGR (%)
export const TARIFF_CAGR = {
  MH: { c10: 5.2, c5: 5.6 }, TN: { c10: 4.6, c5: 4.9 }, KA: { c10: 4.2, c5: 4.6 },
  MP: { c10: 4.8, c5: 5.1 }, UP: { c10: 4.5, c5: 4.9 }, RJ: { c10: 3.8, c5: 4.2 },
  GJ: { c10: 3.0, c5: 3.3 }, HR: { c10: 4.0, c5: 4.4 }, PB: { c10: 4.2, c5: 4.5 },
  DL: { c10: 3.1, c5: 2.7 }, TS: { c10: 4.4, c5: 4.8 }, AP: { c10: 4.3, c5: 4.7 },
  WB: { c10: 4.7, c5: 5.0 }, KL: { c10: 4.0, c5: 4.3 }, BR: { c10: 4.6, c5: 5.0 },
  OD: { c10: 3.9, c5: 4.1 }, CG: { c10: 3.5, c5: 3.8 }, JH: { c10: 4.2, c5: 4.5 },
  UK: { c10: 3.6, c5: 3.9 }, HP: { c10: 3.4, c5: 3.7 }, GA: { c10: 3.2, c5: 3.5 },
  AS: { c10: 4.1, c5: 4.4 }, TR: { c10: 3.6, c5: 3.9 }, MN: { c10: 3.5, c5: 3.8 },
  ML: { c10: 3.7, c5: 4.0 }, MZ: { c10: 3.5, c5: 3.8 }, NL: { c10: 3.4, c5: 3.7 },
  AR: { c10: 3.3, c5: 3.6 }, SK: { c10: 3.2, c5: 3.5 }, JK: { c10: 3.4, c5: 3.7 },
  LA: { c10: 3.0, c5: 3.2 }, CH: { c10: 3.3, c5: 3.6 }, PY: { c10: 3.8, c5: 4.1 },
  DN: { c10: 2.5, c5: 2.8 }, AN: { c10: 3.5, c5: 3.8 },
};

const DEFAULT_CAGR = { c10: 4.0, c5: 4.3 };

export const getTariffTrend = (code) => TARIFF_CAGR[code] || DEFAULT_CAGR;

// Back-calculate a 10-year history ending at the current tariff using c10 CAGR.
export function buildTariffHistory(currentTariff, cagrPct, years = 10) {
  const t = Number(currentTariff) || 8;
  const g = (Number(cagrPct) || 4) / 100;
  const nowYear = new Date().getFullYear();
  const out = [];
  for (let y = years; y >= 0; y--) {
    const tariff = t / Math.pow(1 + g, y);
    out.push({ year: String(nowYear - y), tariff: +tariff.toFixed(2) });
  }
  return out;
}

// Top rising states by 10-year CAGR (needs the STATES list for names).
export function topTariffRisers(states, n = 6) {
  return states
    .map((s) => ({ code: s.code, name: s.name, ...getTariffTrend(s.code) }))
    .sort((a, b) => b.c10 - a.c10)
    .slice(0, n);
}

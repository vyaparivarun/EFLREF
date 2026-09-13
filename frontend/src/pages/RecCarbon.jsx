import React, { useState } from "react";
import { PageHeader, Section, Card, Disclaimer, SourceTag, Metric, Eyebrow, Pill } from "@/components/ui-kit";
import { NumberInput, Segmented } from "@/components/Form";
import { LineChartCard } from "@/components/Charts";
import { REC_PRICE_SCHEDULE } from "@/data/config";
import { calculateRECEstimate } from "@/lib/engine";
import { inr, inrCompact, num } from "@/lib/format";
import { Leaf, Award, TrendingUp } from "lucide-react";

export default function RecCarbon() {
  const [genMwh, setGenMwh] = useState(1500);
  const [fy, setFy] = useState("2026-27");
  const price = REC_PRICE_SCHEDULE.schedule.find((x) => x.fy === fy)?.pricePerMwh || 347;
  const rec = calculateRECEstimate({ year1Generation: genMwh * 1000, recValuePerMwh: price });
  const carbon = { tonnes: genMwh * 0.71, indicativePricePerTonne: 900 };

  const priceChart = REC_PRICE_SCHEDULE.schedule.map((x) => ({ fy: x.fy, price: x.pricePerMwh }));

  return (
    <div>
      <PageHeader eyebrow="Environmental Attributes" title="RECs & Carbon Credits"
        subtitle="Renewable Energy Certificates and carbon credits are distinct environmental attributes — not automatically interchangeable. Understand both, and estimate potential value." />

      {/* REC explainer */}
      <Section className="py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-amber-400" /><h2 className="font-head font-semibold text-xl text-slate-100">What is a Renewable Energy Certificate (REC)?</h2></div>
            <p className="text-sm text-slate-400 leading-relaxed">A REC represents the environmental attribute of 1 MWh of renewable generation, separated from the electricity itself. Obligated entities (DISCOMs, open-access & captive consumers) use RECs to meet Renewable Consumption Obligations (RCO). Certificates are issued through the national registry, traded on power exchanges, and priced by the market.</p>
            <div className="grid sm:grid-cols-2 gap-4 mt-5 text-sm">
              {[
                ["Who can generate", "Eligible renewable generators that do NOT avail other concessional/preferential tariffs or subsidies (eligibility rules apply)."],
                ["Who can buy", "Obligated entities meeting RCO, and voluntary buyers seeking green attributes."],
                ["How issued", "Registration → metering & verification → issuance of certificates via the registry."],
                ["Where traded", "Power exchanges (IEX, PXIL, HPX) and bilateral trades by licensed entities."],
              ].map(([t, d]) => (
                <div key={t} className="bg-white/[0.03] border border-white/8 rounded-lg p-4"><div className="font-semibold text-slate-200 text-sm mb-1">{t}</div><p className="text-xs text-slate-400 leading-relaxed">{d}</p></div>
              ))}
            </div>
            <Disclaimer className="mt-5">REC eligibility, registration, issuance and monetization are not guaranteed and depend on project structure and applicable CERC / state rules. Captive/open-access projects have specific eligibility considerations.</Disclaimer>
          </Card>

          <Card>
            <h3 className="font-head font-semibold text-lg text-slate-100 mb-3">CERC RCO Buyout Price</h3>
            <p className="text-xs text-slate-500 mb-4">Since the 2022 REC Regulations there is no separate solar floor/forbearance price — market prices are discovered on exchanges. The buyout price provides a reference band.</p>
            <LineChartCard data={priceChart} xKey="fy" height={180} fmt={(v) => `₹${v}`} series={[{ key: "price", name: "₹/MWh", color: "#F59E0B" }]} />
            <SourceTag className="mt-3" source={REC_PRICE_SCHEDULE.source} verified={REC_PRICE_SCHEDULE.lastVerified} />
          </Card>
        </div>
      </Section>

      {/* REC Calculator */}
      <Section id="calculator" className="py-6">
        <Eyebrow>REC Calculator</Eyebrow>
        <h2 className="font-head text-2xl font-bold text-slate-50 mt-3 mb-6">Estimate potential environmental-attribute value</h2>
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <div className="space-y-5">
              <div><label className="block text-xs text-slate-400 mb-1.5">Annual renewable generation (MWh)</label><NumberInput value={genMwh} onChange={(e) => setGenMwh(Number(e.target.value) || 0)} suffix="MWh" data-testid="rec-gen-input" /></div>
              <div><label className="block text-xs text-slate-400 mb-2">Financial year (buyout price)</label><Segmented options={REC_PRICE_SCHEDULE.schedule.map((x) => x.fy)} value={fy} onChange={setFy} testId="rec-fy" /></div>
            </div>
          </Card>
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            <Metric label="Potential Certificates / yr" value={`${num(rec.potentialCertsPerYear)} RECs`} icon={Award} tone="amber" sub="1 REC = 1 MWh" />
            <Metric label="Indicative Value / REC" value={inr(price)} icon={TrendingUp} tone="blue" sub={`FY ${fy}`} />
            <Metric label="Potential Annual Value" value={inrCompact(rec.indicativeAnnualValue)} icon={Leaf} tone="emerald" sub="Not guaranteed" />
            <Metric label="Over 10 years (flat)" value={inrCompact(rec.indicativeAnnualValue * 10)} tone="emerald" sub="Illustrative only" />
          </div>
        </div>
        <Disclaimer className="mt-6">{rec.note}</Disclaimer>
      </Section>

      {/* Carbon credits */}
      <Section id="carbon" className="py-14">
        <Card>
          <div className="flex items-center gap-2 mb-4"><Leaf className="w-5 h-5 text-emerald-400" /><h2 className="font-head font-semibold text-2xl text-slate-100">Carbon Credits & Environmental Attributes</h2><Pill tone="emerald">Distinct from RECs</Pill></div>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              {[
                ["Carbon credits", "Represent verified emission reductions (typically 1 tCO₂e per credit) under a carbon standard/programme. Different framework, eligibility and market from RECs."],
                ["Scope 2 emissions", "Indirect emissions from purchased electricity. Solar self-consumption reduces Scope 2 and supports renewable electricity claims."],
              ].map(([t, d]) => <div key={t}><div className="font-semibold text-slate-100 mb-1">{t}</div><p className="text-slate-400 leading-relaxed">{d}</p></div>)}
            </div>
            <div className="space-y-4">
              {[
                ["Renewable electricity claims", "Ownership of the environmental attribute matters — you generally cannot both sell RECs and claim the same green attribute for Scope 2 reduction (avoid double counting)."],
                ["Green certificates", "Various instruments (RECs, I-RECs, carbon credits) exist. Eligibility, ownership and monetization depend on the project structure and the applicable programme rules."],
              ].map(([t, d]) => <div key={t}><div className="font-semibold text-slate-100 mb-1">{t}</div><p className="text-slate-400 leading-relaxed">{d}</p></div>)}
            </div>
          </div>
          <div className="mt-5 p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/15">
            <div className="text-xs uppercase tracking-wider text-emerald-500/80 font-mono mb-1">Indicative avoided emissions</div>
            <div className="num text-xl font-bold text-emerald-400">{num(carbon.tonnes)} tCO₂ / yr</div>
            <p className="text-xs text-slate-500 mt-1">At {genMwh} MWh generation × 0.71 tCO₂/MWh grid factor. Monetization via carbon markets is not assumed.</p>
          </div>
          <Disclaimer className="mt-5">Do not treat carbon credits and RECs as automatically interchangeable. Eligibility, ownership and monetization depend on project structure and applicable rules. REC/carbon-credit eligibility and monetization are not guaranteed.</Disclaimer>
        </Card>
      </Section>
    </div>
  );
}

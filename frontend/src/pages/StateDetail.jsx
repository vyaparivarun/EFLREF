import React from "react";
import { useParams, Link } from "react-router-dom";
import { PageHeader, Section, Card, Pill, Disclaimer, SourceTag, Btn, Metric } from "@/components/ui-kit";
import { getState } from "@/data/states";
import { getDiscomsByState } from "@/data/discoms";
import { num } from "@/lib/format";
import { Sun, Zap, IndianRupee, MapPin, ArrowRight, Building2 } from "lucide-react";

export default function StateDetail() {
  const { code } = useParams();
  const s = getState(code);
  if (!s) return <Section className="py-24 text-center"><h1 className="font-head text-2xl text-slate-100">State not found</h1><Btn as={Link} to="/states" className="mt-4">Back</Btn></Section>;
  const discoms = getDiscomsByState(s.name);
  return (
    <div>
      <PageHeader eyebrow="State Solar Profile" title={s.name} subtitle={`${s.policy} · Solar irradiation ${s.irradiation} kWh/m²/day`}>
        <Btn as={Link} to="/calculator"><Sun className="w-4 h-4" /> Run a {s.name} solar analysis</Btn>
      </PageHeader>
      <Section className="py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Metric label="Installed Solar Capacity" value={`${num(s.installedMw)} MW`} icon={Zap} tone="amber" />
          <Metric label="Solar Irradiation" value={`${s.irradiation}`} sub="kWh/m²/day" icon={Sun} tone="blue" />
          <Metric label="Indicative C&I Tariff" value={`₹${s.ciTariffLow}–${s.ciTariffHigh}`} sub="per kWh (HT)" icon={IndianRupee} tone="emerald" />
          <Metric label="Major DISCOMs" value={s.discoms.length} icon={Building2} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-head font-semibold text-xl text-slate-100 mb-4">Regulatory snapshot</h3>
            <dl className="space-y-3 text-sm">
              {[["Net Metering", s.netMetering], ["Open Access", s.openAccess], ["Solar Policy", s.policy], ["DISCOMs", s.discoms.join(", ")]].map(([k, v]) => (
                <div key={k} className="border-b border-white/5 pb-2"><dt className="text-slate-500 text-xs uppercase tracking-wider font-mono mb-0.5">{k}</dt><dd className="text-slate-200">{v}</dd></div>
              ))}
            </dl>
            <SourceTag className="mt-4" source={s.source} verified="2026-06" />
          </Card>
          <Card>
            <h3 className="font-head font-semibold text-xl text-slate-100 mb-4">Industrial clusters & EPC activity</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {s.clusters.map((c) => <Pill key={c} tone="amber">{c}</Pill>)}
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              {s.name} has {s.installedMw >= 5000 ? "a mature" : s.installedMw >= 1000 ? "a growing" : "an emerging"} solar market with {s.installedMw >= 5000 ? "strong" : "developing"} C&I adoption. With indicative HT tariffs of ₹{s.ciTariffLow}–{s.ciTariffHigh}/kWh and {s.irradiation} kWh/m²/day irradiation, {s.irradiation >= 5.3 ? "solar economics are attractive for daytime-heavy operations." : "solar remains viable for high-tariff daytime loads."}
            </p>
          </Card>
        </div>

        {discoms.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-head font-semibold text-xl text-slate-100">DISCOMs in {s.name}</h3>
              <Btn as={Link} to="/discoms" variant="outline">Full directory <ArrowRight className="w-4 h-4" /></Btn>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discoms.map((d) => (
                <div key={d.id} className="card-surface p-5">
                  <div className="font-semibold text-slate-100 text-sm mb-2">{d.name}</div>
                  <div className="text-xs text-slate-500 mb-3">{d.coverage}</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>HT Energy: <span className="num text-emerald-400">₹{d.energyChargeHT}</span></div>
                    <div>Demand: <span className="num text-amber-400">₹{d.demandCharge}/kVA</span></div>
                  </div>
                  <SourceTag className="mt-3" source={d.source} effective={d.effectiveFrom} />
                </div>
              ))}
            </div>
          </div>
        )}
        <Disclaimer className="mt-8">All tariffs, capacity and policy figures are indicative and subject to change by the relevant DISCOM / SERC. Verify against the latest tariff order.</Disclaimer>
      </Section>
    </div>
  );
}

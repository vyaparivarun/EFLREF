import React from "react";
import { Link } from "react-router-dom";
import { PageHeader, Section, Card, Btn, Disclaimer, Eyebrow } from "@/components/ui-kit";
import { INDUSTRIES } from "@/data/industries";
import { ArrowRight, Sun, TrendingUp, Building2, Factory } from "lucide-react";

export default function SolarForBusiness() {
  return (
    <div>
      <PageHeader eyebrow="Solar for Business" title="Why commercial & industrial solar makes financial sense"
        subtitle="A data-driven view of when solar works for Indian businesses — and how financing changes the economics.">
        <Btn as={Link} to="/calculator"><Sun className="w-4 h-4" /> Calculate your opportunity</Btn>
      </PageHeader>

      <Section className="py-14">
        <div className="grid lg:grid-cols-3 gap-6">
          {[
            { t: "Why solar works", d: "For high-tariff C&I consumers, every solar unit displaces grid power at ₹7–11/kWh. With daytime operations, self-consumption is high and payback is often 3–6 years — after which power is effectively free for 20+ years." },
            { t: "What makes a project attractive", d: "High and rising tariff, strong daytime load, adequate shadow-free area, long operating hours and good irradiation. CAPEX ownership adds a 40% accelerated-depreciation tax shield in year one." },
            { t: "How financing changes it", d: "Financing removes the upfront capital barrier. If monthly savings exceed the EMI, the project is cash-flow positive from day one — you pay the loan from money you were already spending on electricity." },
          ].map((x) => (
            <Card key={x.t}><h3 className="font-head font-semibold text-xl text-slate-100 mb-3">{x.t}</h3><p className="text-sm text-slate-400 leading-relaxed">{x.d}</p></Card>
          ))}
        </div>
      </Section>

      <Section className="py-6">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div><Eyebrow>By Sector</Eyebrow><h2 className="font-head text-3xl font-bold text-slate-50 mt-3">Solar opportunity by industry</h2></div>
          <Btn as={Link} to="/industries" variant="outline">All industry profiles <ArrowRight className="w-4 h-4" /></Btn>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {INDUSTRIES.slice(0, 12).map((i) => (
            <Link key={i.slug} to={`/solar/${i.slug}`} className="card-surface p-5 hover:border-amber-500/40 transition-all group">
              <Factory className="w-5 h-5 text-amber-400/70 mb-3" />
              <div className="text-sm font-semibold text-slate-100 group-hover:text-amber-400">{i.name}</div>
              <div className="text-[11px] text-slate-500 mt-1">Suitability {i.suitability}/100</div>
              <div className="mt-3 h-1.5 rounded-full bg-slate-700 overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${i.suitability}%` }} /></div>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="py-14">
        <Disclaimer>Suitability scores are indicative and derived from typical sector load profiles. Actual economics depend on your tariff, consumption, site and financing — run the calculator for a specific estimate.</Disclaimer>
      </Section>
    </div>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { PageHeader, Section, Card, Pill, Disclaimer, Eyebrow, Btn } from "@/components/ui-kit";
import { INDUSTRIES } from "@/data/industries";
import { Factory, ArrowRight } from "lucide-react";

const toneFor = (s) => (s >= 85 ? "emerald" : s >= 75 ? "amber" : "blue");

export default function Industries() {
  return (
    <div>
      <PageHeader eyebrow="Industry Solar Opportunity Database" title="Solar suitability across 25+ C&I sectors"
        subtitle="Typical electricity intensity, operating hours, roof suitability, recommended financing model and a 0–100 solar suitability score for each sector." />
      <Section className="py-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {INDUSTRIES.map((i) => (
            <Link key={i.slug} to={`/solar/${i.slug}`} className="card-surface p-6 hover:border-amber-500/40 transition-all group" data-testid={`industry-card-${i.slug}`}>
              <div className="flex items-start justify-between mb-3">
                <Factory className="w-6 h-6 text-amber-400/70" />
                <div className="text-right">
                  <div className="num text-2xl font-bold text-slate-100">{i.suitability}</div>
                  <Pill tone={toneFor(i.suitability)}>score</Pill>
                </div>
              </div>
              <h3 className="font-head font-semibold text-lg text-slate-100 group-hover:text-amber-400">{i.name}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed line-clamp-3">{i.desc}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                <div>Intensity: <span className="text-slate-300">{i.intensity}</span></div>
                <div>Hours/day: <span className="text-slate-300">{i.operatingHours}</span></div>
                <div>Daytime: <span className="text-slate-300">{Math.round(i.daytimeLoad * 100)}%</span></div>
                <div>Model: <span className="text-slate-300">{i.financing}</span></div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-500/80 font-medium">View profile <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></div>
            </Link>
          ))}
        </div>
        <Disclaimer className="mt-8">Sector profiles are indicative. Run the calculator with your actual bill and site for a specific estimate.</Disclaimer>
      </Section>
    </div>
  );
}

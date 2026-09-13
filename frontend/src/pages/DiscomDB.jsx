import React, { useState } from "react";
import { PageHeader, Section, Card, Pill, Disclaimer, SourceTag } from "@/components/ui-kit";
import { TextInput, Select } from "@/components/Form";
import { DISCOMS } from "@/data/discoms";
import { STATES } from "@/data/states";
import { Search } from "lucide-react";

export default function DiscomDB() {
  const [q, setQ] = useState("");
  const [state, setState] = useState("");
  const filtered = DISCOMS.filter((d) =>
    (!q || d.name.toLowerCase().includes(q.toLowerCase()) || d.coverage.toLowerCase().includes(q.toLowerCase())) &&
    (!state || d.state === state));
  return (
    <div>
      <PageHeader eyebrow="DISCOM Directory" title="Distribution utility database"
        subtitle="Indicative C&I tariff structure, net/gross metering, open access, banking and surcharge notes for major Indian DISCOMs — with source and effective date." />
      <Section className="py-10">
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
            <TextInput placeholder="Search DISCOM or coverage area" value={q} onChange={(e) => setQ(e.target.value)} className="pl-10" data-testid="discom-search" />
          </div>
          <div className="w-56">
            <Select value={state} onChange={(e) => setState(e.target.value)} placeholder="All states"
              options={[{ value: "", label: "All states" }, ...STATES.map((s) => s.name)]} data-testid="discom-state-filter" />
          </div>
        </div>

        <div className="space-y-4">
          {filtered.map((d) => (
            <Card key={d.id} className="!p-0 overflow-hidden" data-testid={`discom-row-${d.id}`}>
              <div className="p-5 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="font-head font-semibold text-lg text-slate-100">{d.name}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">{d.state} · {d.coverage}</div>
                  </div>
                  <div className="flex gap-2">
                    <Pill tone="emerald">HT ₹{d.energyChargeHT}/kWh</Pill>
                    <Pill tone="amber">Demand ₹{d.demandCharge}/kVA</Pill>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  {[["Net Metering", d.netMetering], ["Gross Metering", d.grossMetering], ["Open Access", d.openAccess], ["Banking", d.banking], ["Wheeling", d.wheeling], ["Cross Subsidy Surcharge", d.css], ["Fixed Charge", d.fixedCharge]].map(([k, v]) => (
                    <div key={k}><div className="text-[10px] uppercase tracking-wider text-slate-600 font-mono mb-0.5">{k}</div><div className="text-slate-300">{v}</div></div>
                  ))}
                </div>
                <SourceTag className="mt-4 pt-3 border-t border-white/5" source={d.source} effective={d.effectiveFrom} verified={d.lastVerified} />
              </div>
            </Card>
          ))}
          {filtered.length === 0 && <div className="text-center text-slate-500 py-12">No DISCOMs match your filters.</div>}
        </div>
        <Disclaimer className="mt-8">Tariff and charge values are indicative and simplified. Actual bills involve category-specific slabs, ToD, duty and surcharges per the applicable SERC tariff order. Verify current values before financial decisions.</Disclaimer>
      </Section>
    </div>
  );
}

import React, { useState, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Section, Card, Btn, Disclaimer, Metric, Pill, ScoreGauge, SourceTag } from "@/components/ui-kit";
import { Field, TextInput, NumberInput, Select, SliderInput, Segmented } from "@/components/Form";
import { AreaChartCard, BarChartCard, LineChartCard, ComposedCashflowCard, CostPieCard, TornadoChart } from "@/components/Charts";
import { STATES, getStateByName } from "@/data/states";
import { getDiscomsByState, getDiscomByName, DISCOMS } from "@/data/discoms";
import { BUSINESS_TYPES } from "@/data/industries";
import { DEMO_CUSTOMER } from "@/data/content";
import { DEFAULTS, rateForCapacity } from "@/data/config";
import { evaluateEligibility } from "@/data/incentives";
import {
  runProjectModel, runSensitivity, runTornado, recommendSystemSize, calculateSuitabilityScore,
} from "@/lib/engine";
import { createLead } from "@/lib/api";
import { inr, inrCompact, kw, kwh, num, pct, yrs } from "@/lib/format";
import {
  MapPin, Building2, Receipt, Sun, Cpu, Wallet, ArrowRight, ArrowLeft, Sparkles,
  TrendingUp, Leaf, Award, IndianRupee, CheckCircle2, Printer, Gauge, BarChart3, Zap,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Location", icon: MapPin },
  { id: 2, label: "Business", icon: Building2 },
  { id: 3, label: "Electricity Bill", icon: Receipt },
  { id: 4, label: "Solar Site", icon: Sun },
  { id: 5, label: "System", icon: Cpu },
  { id: 6, label: "Project Cost", icon: Wallet },
];

const initialState = {
  state: "", stateCode: "", city: "", pincode: "", discom: "",
  businessType: "", operatingDays: 26, operatingHours: 12, daytimePct: 65,
  billMethod: "bill", monthlyBill: "", monthlyUnits: "", tariff: 8,
  fixedCharges: "", demandCharges: "", otherCharges: "",
  installationType: "Rooftop", roofAreaSqft: "", landAreaAcres: "", roofType: "RCC", shading: "Low",
  panelTech: "TOPCon", inverterType: "String", systemType: "Grid-connected", autoSize: true, capacityKw: "",
  ratePerWatt: "", tariffEscalation: 5, financingPct: 80, interestRate: DEFAULTS.interestRate, tenureYears: DEFAULTS.tenureYears,
};

export default function Calculator() {
  const [step, setStep] = useState(1);
  const [f, setF] = useState(initialState);
  const [showResults, setShowResults] = useState(false);
  const [stepError, setStepError] = useState("");
  const upd = (patch) => setF((s) => ({ ...s, ...patch }));
  const reportRef = useRef(null);

  const stateObj = getStateByName(f.state);
  const irradiation = stateObj?.irradiation || 5.2;
  const stateDiscoms = f.state ? getDiscomsByState(f.state) : [];
  const selectedDiscom = f.discom ? getDiscomByName(f.discom) : null;

  // Derived electricity figures
  const monthlyUnits = f.billMethod === "units"
    ? Number(f.monthlyUnits) || 0
    : (Number(f.monthlyBill) || 0) / (Number(f.tariff) || 8);
  const monthlyBill = f.billMethod === "bill"
    ? Number(f.monthlyBill) || 0
    : (Number(f.monthlyUnits) || 0) * (Number(f.tariff) || 8);
  const annualUnits = monthlyUnits * 12;
  const effectiveTariff = Number(f.tariff) || (monthlyUnits > 0 ? monthlyBill / monthlyUnits : 8);

  // Recommended size
  const rec = useMemo(() => recommendSystemSize({
    annualUnits, daytimePct: f.daytimePct / 100,
    specificYield: irradiation * 365 * DEFAULTS.performanceRatio,
    roofAreaSqft: Number(f.roofAreaSqft) || 0, landAreaAcres: Number(f.landAreaAcres) || 0,
  }), [annualUnits, f.daytimePct, irradiation, f.roofAreaSqft, f.landAreaAcres]);

  const capacityKw = f.autoSize ? rec.recommendedKw : (Number(f.capacityKw) || rec.recommendedKw);
  const ratePerWatt = Number(f.ratePerWatt) || rateForCapacity(capacityKw);

  const model = useMemo(() => {
    if (!capacityKw || !annualUnits) return null;
    return runProjectModel({
      capacityKw, irradiation, performanceRatio: DEFAULTS.performanceRatio, shading: f.shading,
      ratePerWatt, annualUnits, effectiveTariff, daytimePct: f.daytimePct / 100,
      tariffEscalation: (Number(f.tariffEscalation) || 5) / 100, financingPct: (Number(f.financingPct) || 80) / 100,
      interestRate: Number(f.interestRate) || 11, tenureYears: Number(f.tenureYears) || 7,
    });
  }, [capacityKw, irradiation, f.shading, ratePerWatt, annualUnits, effectiveTariff, f.daytimePct, f.tariffEscalation, f.financingPct, f.interestRate, f.tenureYears]);

  const loadDemo = () => {
    upd({
      state: DEMO_CUSTOMER.state, stateCode: DEMO_CUSTOMER.stateCode, city: DEMO_CUSTOMER.city, discom: DEMO_CUSTOMER.discom,
      businessType: DEMO_CUSTOMER.businessType, operatingDays: DEMO_CUSTOMER.operatingDays, operatingHours: DEMO_CUSTOMER.operatingHours,
      daytimePct: DEMO_CUSTOMER.daytimePct, billMethod: "bill", monthlyBill: String(DEMO_CUSTOMER.monthlyBill),
      monthlyUnits: String(DEMO_CUSTOMER.monthlyUnits), tariff: DEMO_CUSTOMER.tariff, roofAreaSqft: String(DEMO_CUSTOMER.roofAreaSqft),
      installationType: DEMO_CUSTOMER.installationType, roofType: DEMO_CUSTOMER.roofType, shading: DEMO_CUSTOMER.shading, panelTech: DEMO_CUSTOMER.panelTech,
    });
    toast.success("Demo data loaded (illustrative)");
  };

  const canProceed = () => {
    if (step === 1) return f.state && f.city;
    if (step === 3) return (f.billMethod === "bill" ? f.monthlyBill : f.monthlyUnits) && f.tariff;
    return true;
  };

  const next = () => {
    const msg = step === 1 ? "Please select a State and enter a City to continue."
      : step === 3 ? "Please enter your monthly bill/units and average tariff to continue."
      : "";
    if (!canProceed()) { setStepError(msg || "Please complete the required fields."); toast.error(msg || "Please complete the required fields"); return; }
    setStepError("");
    if (step < 6) setStep(step + 1);
    else {
      if (!model) { setStepError("Enter bill details to calculate."); toast.error("Enter bill details to calculate"); return; }
      setShowResults(true);
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0D1B2A] hero-radial">
        <Section className="py-8 lg:py-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-500 mb-2"><span className="w-6 h-px bg-amber-500/60" />Solar Savings Calculator</div>
              <h1 className="font-head text-2xl lg:text-3xl font-extrabold text-slate-50">Your Solar Opportunity, end to end</h1>
            </div>
            <Btn variant="outline" onClick={loadDemo} data-testid="load-demo-btn"><Sparkles className="w-4 h-4" /> Load demo data</Btn>
          </div>
        </Section>
      </div>

      {/* Wizard */}
      {!showResults && (
        <Section className="py-8">
          {/* Progress */}
          <div className="flex items-center gap-1 mb-8 overflow-x-auto nav-scroll pb-2">
            {STEPS.map((s, i) => (
              <React.Fragment key={s.id}>
                <button onClick={() => s.id <= step && setStep(s.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg shrink-0 transition-colors ${step === s.id ? "bg-amber-500/10 border border-amber-500/30" : step > s.id ? "opacity-80" : "opacity-40"}`} data-testid={`step-tab-${s.id}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${step >= s.id ? "bg-amber-500 text-slate-950" : "bg-slate-800 text-slate-500"}`}>
                    {step > s.id ? <CheckCircle2 className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-xs font-medium ${step === s.id ? "text-amber-400" : "text-slate-400"}`}>{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <div className="w-4 h-px bg-slate-700 shrink-0" />}
              </React.Fragment>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="min-h-[420px]">
                {/* STEP 1 */}
                {step === 1 && (
                  <div className="space-y-5">
                    <h2 className="font-head font-semibold text-xl text-slate-100">Where is your facility?</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Country"><TextInput value="India" disabled /></Field>
                      <Field label="State / UT *"><Select value={f.state} onChange={(e) => { const st = getStateByName(e.target.value); upd({ state: e.target.value, stateCode: st?.code || "", discom: "" }); }} options={STATES.map((s) => s.name)} placeholder="Select state" data-testid="calc-state" /></Field>
                      <Field label="City *"><TextInput value={f.city} onChange={(e) => upd({ city: e.target.value })} placeholder="e.g. Faridabad" data-testid="calc-city" /></Field>
                      <Field label="PIN code (optional)"><TextInput value={f.pincode} onChange={(e) => upd({ pincode: e.target.value })} placeholder="121001" /></Field>
                      <Field label="DISCOM" className="sm:col-span-2" hint={selectedDiscom ? `Tariff auto-filled: ₹${selectedDiscom.ciTariff}/kWh (HT energy ₹${selectedDiscom.energyChargeHT}, demand ₹${selectedDiscom.demandCharge}/kVA) · ${selectedDiscom.source}` : (stateObj ? `Irradiation at ${f.state}: ${irradiation} kWh/m²/day · Pick your DISCOM to auto-fill the correct tariff` : "")}>
                        <Select value={f.discom} onChange={(e) => { const d = getDiscomByName(e.target.value); upd({ discom: e.target.value, ...(d ? { tariff: d.ciTariff, demandCharges: String(d.demandCharge) } : {}) }); }} options={(stateDiscoms.length ? stateDiscoms : DISCOMS).map((d) => d.name)} placeholder="Select DISCOM" data-testid="calc-discom" />
                      </Field>
                      {selectedDiscom && <div className="sm:col-span-2 -mt-1 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/15 rounded-lg px-3 py-2"><CheckCircle2 className="w-3.5 h-3.5" /> Using {selectedDiscom.name}'s FY25-26 tariff of <span className="num font-semibold">₹{selectedDiscom.ciTariff}/kWh</span> — you can still adjust it in the next steps.</div>}
                    </div>
                  </div>
                )}
                {/* STEP 2 */}
                {step === 2 && (
                  <div className="space-y-5">
                    <h2 className="font-head font-semibold text-xl text-slate-100">Tell us about your business</h2>
                    <Field label="Business type"><Select value={f.businessType} onChange={(e) => upd({ businessType: e.target.value })} options={BUSINESS_TYPES} placeholder="Select" data-testid="calc-business" /></Field>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <SliderInput label="Operating days / week" value={Math.min(f.operatingDays / 4.33, 7)} onChange={(v) => upd({ operatingDays: Math.round(v * 4.33) })} min={1} max={7} step={1} format={(v) => `${Math.round(v)} days`} testId="calc-opdays" />
                      <SliderInput label="Operating hours / day" value={f.operatingHours} onChange={(v) => upd({ operatingHours: v })} min={4} max={24} step={1} format={(v) => `${v} hrs`} testId="calc-ophours" />
                    </div>
                    <div>
                      <SliderInput label="Daytime consumption share" value={f.daytimePct} onChange={(v) => upd({ daytimePct: v })} min={20} max={100} step={5} format={(v) => `${v}%`} testId="calc-daytime" />
                      <div className="text-xs text-slate-500 mt-2">Night-time share: {100 - f.daytimePct}%. Higher daytime share improves solar self-consumption.</div>
                    </div>
                  </div>
                )}
                {/* STEP 3 */}
                {step === 3 && (
                  <div className="space-y-5">
                    <h2 className="font-head font-semibold text-xl text-slate-100">Your electricity bill</h2>
                    <Segmented options={[{ value: "bill", label: "By monthly bill" }, { value: "units", label: "By monthly units" }]} value={f.billMethod} onChange={(v) => upd({ billMethod: v })} testId="calc-billmethod" />
                    <div className="grid sm:grid-cols-2 gap-4">
                      {f.billMethod === "bill"
                        ? <Field label="Average monthly bill (₹) *"><NumberInput prefix="₹" value={f.monthlyBill} onChange={(e) => upd({ monthlyBill: e.target.value })} placeholder="1000000" data-testid="calc-bill" /></Field>
                        : <Field label="Average monthly units (kWh) *"><NumberInput value={f.monthlyUnits} onChange={(e) => upd({ monthlyUnits: e.target.value })} suffix="kWh" placeholder="100000" data-testid="calc-units" /></Field>}
                      <Field label="Average tariff (₹/kWh) *" hint={selectedDiscom ? `Auto-filled from ${f.discom} (₹${selectedDiscom.ciTariff}/kWh, FY25-26). Adjust if your actual rate differs.` : (stateObj ? `${f.state} C&I range: ₹${stateObj.ciTariffLow}–${stateObj.ciTariffHigh}` : "")}><NumberInput prefix="₹" value={f.tariff} onChange={(e) => upd({ tariff: e.target.value })} suffix="/kWh" data-testid="calc-tariff" /></Field>
                      <Field label="Fixed charges (₹/month)"><NumberInput prefix="₹" value={f.fixedCharges} onChange={(e) => upd({ fixedCharges: e.target.value })} /></Field>
                      <Field label="Demand charges (₹/month)"><NumberInput prefix="₹" value={f.demandCharges} onChange={(e) => upd({ demandCharges: e.target.value })} /></Field>
                    </div>
                    {monthlyUnits > 0 && <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/15 text-xs text-slate-300">Estimated consumption: <span className="num text-blue-400 font-semibold">{num(monthlyUnits)} kWh/month</span> · Annual: <span className="num text-blue-400 font-semibold">{kwh(annualUnits)}</span></div>}
                    <Disclaimer>Electricity bill OCR upload is planned — the architecture already captures consumer number, sanctioned load, tariff category, demand and charges for future auto-extraction.</Disclaimer>
                  </div>
                )}
                {/* STEP 4 */}
                {step === 4 && (
                  <div className="space-y-5">
                    <h2 className="font-head font-semibold text-xl text-slate-100">Your solar site</h2>
                    <Field label="Installation type"><Segmented options={["Rooftop", "Ground-mounted", "Carport", "Mixed"]} value={f.installationType} onChange={(v) => upd({ installationType: v })} testId="calc-install" /></Field>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Available rooftop area (sq ft)"><NumberInput value={f.roofAreaSqft} onChange={(e) => upd({ roofAreaSqft: e.target.value })} suffix="sqft" placeholder="80000" data-testid="calc-roof" /></Field>
                      <Field label="Available land (acres)"><NumberInput value={f.landAreaAcres} onChange={(e) => upd({ landAreaAcres: e.target.value })} suffix="acres" /></Field>
                      <Field label="Roof type"><Select value={f.roofType} onChange={(e) => upd({ roofType: e.target.value })} options={["RCC", "Metal", "PEB", "Sheet", "Other"]} /></Field>
                      <Field label="Shading"><Segmented options={["Low", "Medium", "High"]} value={f.shading} onChange={(v) => upd({ shading: v })} testId="calc-shading" /></Field>
                    </div>
                    {rec.recommendedKw > 0 && <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/15 text-xs text-slate-300">Based on your load and area, we suggest ~<span className="num text-amber-400 font-semibold">{kw(rec.recommendedKw)}</span>{rec.areaLimited && <span className="text-amber-400"> (area-limited from {kw(rec.unconstrainedKw)})</span>}</div>}
                  </div>
                )}
                {/* STEP 5 */}
                {step === 5 && (
                  <div className="space-y-5">
                    <h2 className="font-head font-semibold text-xl text-slate-100">Solar system configuration</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Panel technology"><Select value={f.panelTech} onChange={(e) => upd({ panelTech: e.target.value })} options={["Mono PERC", "TOPCon", "HJT", "Other"]} /></Field>
                      <Field label="Inverter type"><Select value={f.inverterType} onChange={(e) => upd({ inverterType: e.target.value })} options={["String", "Central", "Micro inverter"]} /></Field>
                      <Field label="System type"><Select value={f.systemType} onChange={(e) => upd({ systemType: e.target.value })} options={["Grid-connected", "Hybrid", "Battery-backed"]} /></Field>
                    </div>
                    <Field label="Plant capacity">
                      <div className="flex items-center gap-3">
                        <Segmented options={[{ value: true, label: "Auto recommended" }, { value: false, label: "Custom" }]} value={f.autoSize} onChange={(v) => upd({ autoSize: v })} testId="calc-autosize" />
                      </div>
                    </Field>
                    {f.autoSize
                      ? <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/15"><div className="text-xs text-slate-500 uppercase tracking-wider font-mono mb-1">Recommended capacity</div><div className="num text-2xl font-bold text-amber-400">{kw(rec.recommendedKw)}</div><div className="text-xs text-slate-500 mt-1">Sized to offset ~90% of daytime-available load, capped by your area.</div></div>
                      : <Field label="Custom capacity (kW)"><NumberInput value={f.capacityKw} onChange={(e) => upd({ capacityKw: e.target.value })} suffix="kW" placeholder={String(rec.recommendedKw)} data-testid="calc-capacity" /></Field>}
                  </div>
                )}
                {/* STEP 6 */}
                {step === 6 && (
                  <div className="space-y-5">
                    <h2 className="font-head font-semibold text-xl text-slate-100">Project cost & financing</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="EPC cost (₹/W)" hint={`Benchmark for ${kw(capacityKw)}: ₹${rateForCapacity(capacityKw)}/W`}><NumberInput prefix="₹" value={f.ratePerWatt} onChange={(e) => upd({ ratePerWatt: e.target.value })} suffix="/W" placeholder={String(rateForCapacity(capacityKw))} data-testid="calc-rate" /></Field>
                      <Field label="Capacity (kW)"><NumberInput value={capacityKw} disabled /></Field>
                    </div>
                    <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/15 flex items-center justify-between">
                      <div><div className="text-xs text-slate-500 uppercase tracking-wider font-mono">Estimated project cost</div><div className="num text-2xl font-bold text-emerald-400">{inrCompact(capacityKw * 1000 * ratePerWatt)}</div></div>
                      <Wallet className="w-8 h-8 text-emerald-400/50" />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4 pt-2">
                      <SliderInput label="Financing share" value={f.financingPct} onChange={(v) => upd({ financingPct: v })} min={50} max={100} step={5} format={(v) => `${v}%`} testId="calc-finpct" />
                      <SliderInput label="Interest rate" value={f.interestRate} onChange={(v) => upd({ interestRate: v })} min={8} max={16} step={0.25} format={(v) => `${v}%`} testId="calc-rate-slider" />
                      <SliderInput label="Tenure" value={f.tenureYears} onChange={(v) => upd({ tenureYears: v })} min={3} max={10} step={1} format={(v) => `${v}y`} testId="calc-tenure" />
                    </div>
                    <SliderInput label="Tariff escalation (annual)" value={f.tariffEscalation} onChange={(v) => upd({ tariffEscalation: v })} min={0} max={10} step={1} format={(v) => `${v}%`} testId="calc-escalation" />
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-white/10">
                  <Btn variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}><ArrowLeft className="w-4 h-4" /> Back</Btn>
                  <Btn onClick={next} data-testid="calc-next-btn">{step === 6 ? "Calculate Opportunity" : "Continue"} <ArrowRight className="w-4 h-4" /></Btn>
                </div>
                {stepError && <div className="mt-3 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3.5 py-2.5" data-testid="calc-step-error">{stepError}</div>}
              </Card>
            </div>

            {/* Live summary */}
            <div className="lg:sticky lg:top-20 h-fit">
              <Card>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-mono mb-4">Live Estimate</div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Recommended size</span><span className="num font-semibold text-amber-400">{capacityKw ? kw(capacityKw) : "—"}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Project cost</span><span className="num font-semibold text-slate-200">{capacityKw ? inrCompact(capacityKw * 1000 * ratePerWatt) : "—"}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Annual generation</span><span className="num font-semibold text-blue-400">{model ? kwh(model.generation.year1Generation) : "—"}</span></div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center"><span className="text-sm text-slate-300 font-medium">Est. annual savings</span><span className="num font-bold text-emerald-400 text-lg">{model ? inrCompact(model.metrics.annualSavingsY1) : "—"}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Monthly EMI</span><span className="num font-semibold text-amber-400">{model ? inr(model.metrics.monthlyEMI) : "—"}</span></div>
                  <div className="flex justify-between items-center"><span className="text-sm text-slate-400">Payback</span><span className="num font-semibold text-slate-200">{model?.metrics.simplePayback ? yrs(model.metrics.simplePayback) : "—"}</span></div>
                </div>
              </Card>
            </div>
          </div>
        </Section>
      )}

      {/* Mobile sticky savings */}
      {!showResults && model && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-white/10 p-3 flex items-center justify-between no-print">
          <div><div className="text-[10px] text-slate-500 font-mono uppercase">Est. Annual Savings</div><div className="num text-lg font-bold text-emerald-400">{inrCompact(model.metrics.annualSavingsY1)}</div></div>
          <Btn onClick={next} className="!py-2">{step === 6 ? "Calculate" : "Next"} <ArrowRight className="w-4 h-4" /></Btn>
        </div>
      )}

      {showResults && model && <Results f={f} model={model} capacityKw={capacityKw} irradiation={irradiation} ratePerWatt={ratePerWatt} annualUnits={annualUnits} effectiveTariff={effectiveTariff} monthlyBill={monthlyBill} rec={rec} reportRef={reportRef} onEdit={() => setShowResults(false)} />}
    </div>
  );
}

// ============================ RESULTS ============================
function Results({ f, model, capacityKw, irradiation, ratePerWatt, annualUnits, effectiveTariff, monthlyBill, rec, reportRef, onEdit }) {
  const [horizon, setHorizon] = useState(25);
  const m = model.metrics;

  const baseInputs = {
    capacityKw, irradiation, performanceRatio: DEFAULTS.performanceRatio, shading: f.shading, ratePerWatt,
    annualUnits, effectiveTariff, daytimePct: f.daytimePct / 100, tariffEscalation: (Number(f.tariffEscalation) || 5) / 100,
    financingPct: (Number(f.financingPct) || 80) / 100, interestRate: Number(f.interestRate) || 11, tenureYears: Number(f.tenureYears) || 7,
  };

  const sensitivity = useMemo(() => runSensitivity(baseInputs), [capacityKw, ratePerWatt, effectiveTariff]);
  const tornado = useMemo(() => runTornado(baseInputs), [capacityKw, ratePerWatt, effectiveTariff]);

  const suitability = calculateSuitabilityScore({
    monthlyBill, effectiveTariff, daytimePct: f.daytimePct / 100, irradiation,
    roofAreaSqft: Number(f.roofAreaSqft) || 0, recommendedKw: capacityKw,
    operatingHours: f.operatingHours, shading: f.shading, interestRate: Number(f.interestRate) || 11,
  });

  const eligibility = evaluateEligibility({ consumerType: "Industrial", projectType: "CAPEX", capacityKw, installationType: f.installationType });

  // Scenario builder
  const scenarios = [
    { name: "No Solar", fin: null },
    { name: "Solar — No Financing", fin: 0 },
    { name: "Solar — 70% Financing", fin: 70 },
    { name: "Solar — 80% Financing", fin: 80 },
    { name: "Solar — 100% Financing", fin: 100 },
  ].map((s) => {
    if (s.fin === null) return { ...s, payback: null, irr: null, lifetime: 0, interest: 0, monthlyOut: monthlyBill };
    const mm = runProjectModel({ ...baseInputs, financingPct: s.fin / 100 });
    return { ...s, payback: mm.metrics.simplePayback, irr: mm.metrics.projectIRR, lifetime: mm.metrics.lifetimeNetBenefit, interest: mm.loan.totalInterest, monthlyOut: mm.metrics.monthlyOutflowWithSolar };
  });

  // Charts data
  const genChart = model.generation.schedule.slice(0, horizon).map((r) => ({ year: `Y${r.year}`, generation: r.generation }));
  const savingsChart = model.savings.rows.slice(0, horizon).map((r) => ({ year: `Y${r.year}`, cumulative: r.cumulative, annual: r.annualSaving }));
  const cashflowChart = model.cashflow.rows.slice(0, horizon).map((r) => ({ year: r.year, saving: r.saving, debtService: r.debtService, net: r.net }));
  const billChart = model.savings.rows.slice(0, horizon).map((r) => ({ year: `Y${r.year}`, "Without Solar": r.gridBillBefore, "With Solar": r.gridBillAfter }));

  // Lead form
  const [lead, setLead] = useState({ name: "", company: "", mobile: "", email: "" });
  const [leadDone, setLeadDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const submitLead = async (e) => {
    e.preventDefault();
    if (!lead.name || !lead.mobile) return toast.error("Name and mobile required");
    setBusy(true);
    try {
      const r = await createLead({
        ...lead, city: f.city, state: f.state, discom: f.discom, industry: f.businessType,
        monthlyBill, projectSizeKw: capacityKw, loanRequirement: model.loan.loanAmount, source: "calculator",
        result: { recommendedCapacityKw: capacityKw, projectCost: model.cost.totalCost, loanAmount: model.loan.loanAmount, emi: m.monthlyEMI, annualSavings: m.annualSavingsY1, netMonthlyBenefit: m.netMonthlyBenefit, paybackYears: m.simplePayback, projectIrr: m.projectIRR, lifetimeSavings: m.lifetimeSavings, co2AvoidedTonnes: model.environmental.lifetimeCo2Tonnes, suitabilityScore: suitability.score },
        inputs: { state: f.state, city: f.city, businessType: f.businessType, tariff: effectiveTariff, daytimePct: f.daytimePct },
      });
      setLeadDone(r); toast.success(`Assessment requested — ${r.leadId}`);
    } catch { toast.error("Submission failed"); } setBusy(false);
  };

  const emiGtSaving = m.netMonthlyBenefit > 0;

  return (
    <div ref={reportRef}>
      {/* Summary dashboard */}
      <Section className="py-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 no-print">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.18em] text-amber-500 mb-2"><span className="w-6 h-px bg-amber-500/60" />Your Solar Opportunity</div>
            <h2 className="font-head text-2xl lg:text-3xl font-extrabold text-slate-50">Solar Opportunity Report</h2>
            <p className="text-sm text-slate-500 mt-1">{f.businessType || "Business"} · {f.city}, {f.state} · {f.discom || "DISCOM"}</p>
          </div>
          <div className="flex gap-2">
            <Btn variant="secondary" onClick={onEdit}><ArrowLeft className="w-4 h-4" /> Edit inputs</Btn>
            <Btn variant="outline" onClick={() => window.print()} data-testid="print-report-btn"><Printer className="w-4 h-4" /> Print / PDF</Btn>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Metric label="Recommended Capacity" value={kw(capacityKw)} tone="amber" icon={Sun} testId="res-capacity" />
          <Metric label="Project Cost" value={inrCompact(model.cost.totalCost)} tone="blue" icon={Wallet} testId="res-cost" />
          <Metric label="Loan Requirement" value={inrCompact(model.loan.loanAmount)} tone="amber" icon={IndianRupee} />
          <Metric label="Monthly EMI" value={inr(m.monthlyEMI)} tone="amber" icon={IndianRupee} testId="res-emi" />
          <Metric label="Annual Savings (Yr1)" value={inrCompact(m.annualSavingsY1)} tone="emerald" icon={TrendingUp} testId="res-savings" />
          <Metric label="Simple Payback" value={m.simplePayback ? yrs(m.simplePayback) : "—"} tone="emerald" icon={Gauge} testId="res-payback" />
          <Metric label="Current Monthly Bill" value={inr(m.currentMonthlyBill)} icon={Receipt} />
          <Metric label="Post-Solar Bill" value={inr(m.residualMonthlyBill)} tone="blue" icon={Receipt} />
          <Metric label="Net Monthly Benefit" value={inr(m.netMonthlyBenefit)} tone={emiGtSaving ? "emerald" : "danger"} icon={TrendingUp} testId="res-net-benefit" />
          <Metric label="Project IRR" value={m.projectIRR != null ? pct(m.projectIRR * 100) : "—"} tone="emerald" icon={BarChart3} />
          <Metric label="25-Yr Lifetime Savings" value={inrCompact(m.lifetimeSavings)} tone="emerald" icon={IndianRupee} />
          <Metric label="CO₂ Avoided (25yr)" value={`${num(model.environmental.lifetimeCo2Tonnes)} t`} tone="emerald" icon={Leaf} />
        </div>
      </Section>

      {/* Solar vs EMI */}
      <Section className="py-6">
        <Card>
          <h3 className="font-head font-semibold text-xl text-slate-100 mb-1">Solar vs EMI — Monthly Cash Flow (Year 1)</h3>
          <p className="text-sm text-slate-500 mb-6">Does your solar saving beat your loan EMI? {emiGtSaving ? <span className="text-emerald-400 font-medium">Yes — net positive from day one.</span> : <span className="text-amber-400 font-medium">Not immediately — but savings grow with tariff escalation.</span>}</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-lg bg-slate-800/40 border border-slate-700">
              <div className="text-xs uppercase tracking-wider text-slate-500 font-mono mb-2">Without Solar</div>
              <div className="num text-2xl font-bold text-slate-100">{inr(m.currentMonthlyBill)}</div>
              <div className="text-xs text-slate-500 mt-1">Current electricity bill / month</div>
            </div>
            <div className="p-5 rounded-lg bg-amber-500/5 border border-amber-500/20">
              <div className="text-xs uppercase tracking-wider text-amber-500/80 font-mono mb-2">With Solar (outflow)</div>
              <div className="num text-2xl font-bold text-amber-400">{inr(m.monthlyOutflowWithSolar)}</div>
              <div className="text-xs text-slate-500 mt-1">EMI {inr(m.monthlyEMI)} + residual bill {inr(m.residualMonthlyBill)}</div>
            </div>
            <div className={`p-5 rounded-lg ${emiGtSaving ? "bg-emerald-500/5 border-emerald-500/20" : "bg-red-500/5 border-red-500/20"} border`}>
              <div className={`text-xs uppercase tracking-wider font-mono mb-2 ${emiGtSaving ? "text-emerald-500/80" : "text-red-400/80"}`}>Net Monthly Benefit</div>
              <div className={`num text-2xl font-bold ${emiGtSaving ? "text-emerald-400" : "text-red-400"}`}>{inr(m.netMonthlyBenefit)}</div>
              <div className="text-xs text-slate-500 mt-1">Bill − (EMI + residual bill + O&M)</div>
            </div>
          </div>
        </Card>
      </Section>

      {/* Charts */}
      <Section className="py-6">
        <div className="flex items-center justify-between mb-4 no-print">
          <h3 className="font-head font-semibold text-xl text-slate-100">Financial projections</h3>
          <Segmented options={[{ value: 10, label: "10 yr" }, { value: 15, label: "15 yr" }, { value: 25, label: "25 yr" }]} value={horizon} onChange={setHorizon} testId="horizon-toggle" />
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Card><h4 className="font-medium text-slate-200 mb-4 text-sm">Electricity bill — Without vs With Solar</h4><BarChartCard data={billChart} xKey="year" series={[{ key: "Without Solar", color: "#EF4444" }, { key: "With Solar", color: "#10B981" }]} height={260} /></Card>
          <Card><h4 className="font-medium text-slate-200 mb-4 text-sm">Cumulative savings</h4><AreaChartCard data={savingsChart} xKey="year" series={[{ key: "cumulative", name: "Cumulative Savings", color: "#10B981" }]} height={260} /></Card>
          <Card><h4 className="font-medium text-slate-200 mb-4 text-sm">Annual cash flow (savings vs EMI vs net)</h4><ComposedCashflowCard data={cashflowChart} height={260} /></Card>
          <Card><h4 className="font-medium text-slate-200 mb-4 text-sm">Solar generation (with degradation)</h4><LineChartCard data={genChart} xKey="year" fmt={(v) => `${(v / 1000).toFixed(0)}k`} series={[{ key: "generation", name: "kWh", color: "#3B82F6" }]} height={260} /></Card>
          <Card><h4 className="font-medium text-slate-200 mb-4 text-sm">Project cost breakdown</h4><div className="grid grid-cols-2 gap-4 items-center"><CostPieCard data={model.cost.components} height={220} /><div className="space-y-1.5 text-xs">{model.cost.components.slice(0, 7).map((c, i) => <div key={c.name} className="flex items-center justify-between gap-2"><span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-sm" style={{ background: ["#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#6366F1", "#F97316"][i] }} />{c.name}</span><span className="num text-slate-300">{pct(c.share * 100, 0)}</span></div>)}</div></div></Card>
          <Card><h4 className="font-medium text-slate-200 mb-4 text-sm">Loan outstanding</h4><AreaChartCard data={model.cashflow.rows.slice(0, horizon).map((r) => ({ year: `Y${r.year}`, balance: r.loanOutstanding }))} xKey="year" series={[{ key: "balance", name: "Outstanding", color: "#F59E0B" }]} height={260} /></Card>
        </div>
      </Section>

      {/* Scenario builder */}
      <Section className="py-6">
        <Card>
          <h3 className="font-head font-semibold text-xl text-slate-100 mb-4">Scenario Builder</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-slate-500 text-xs uppercase tracking-wider font-mono border-b border-white/10">
                <tr>{["Scenario", "Monthly Outflow", "Payback", "Project IRR", "Total Interest", "25-Yr Net"].map((h) => <th key={h} className="px-3 py-3 text-left font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.name} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-3 font-medium text-slate-200">{s.name}</td>
                    <td className="px-3 py-3 num text-slate-300">{inr(s.monthlyOut)}</td>
                    <td className="px-3 py-3 num text-slate-300">{s.payback ? yrs(s.payback) : "—"}</td>
                    <td className="px-3 py-3 num text-emerald-400">{s.irr != null ? pct(s.irr * 100) : "—"}</td>
                    <td className="px-3 py-3 num text-amber-400">{s.fin === null ? "—" : inrCompact(s.interest)}</td>
                    <td className="px-3 py-3 num text-emerald-400">{s.fin === null ? "—" : inrCompact(s.lifetime)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Section>

      {/* Sensitivity + Suitability */}
      <Section className="py-6">
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-head font-semibold text-xl text-slate-100 mb-1">Sensitivity — Payback (yrs)</h3>
            <p className="text-sm text-slate-500 mb-5">Which variables move your payback the most?</p>
            <TornadoChart data={tornado} base={m.simplePayback || 0} />
            <div className="grid grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/10">
              {[["Best", "emerald", sensitivity.best], ["Base", "amber", sensitivity.base], ["Worst", "danger", sensitivity.worst]].map(([lbl, tone, sc]) => (
                <div key={lbl} className="text-center">
                  <Pill tone={tone === "danger" ? "danger" : tone}>{lbl} case</Pill>
                  <div className="num text-lg font-bold text-slate-100 mt-2">{sc.payback ? yrs(sc.payback) : "—"}</div>
                  <div className="text-[10px] text-slate-500">IRR {sc.projectIRR != null ? pct(sc.projectIRR * 100) : "—"}</div>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="font-head font-semibold text-xl text-slate-100 mb-1">Solar Suitability Score</h3>
            <p className="text-sm text-slate-500 mb-2">{suitability.verdict}</p>
            <ScoreGauge score={suitability.score} tone={suitability.tone} />
            <div className="space-y-2 mt-2">
              {suitability.factors.map((fac) => (
                <div key={fac.label} className="flex items-center gap-3 text-xs">
                  <div className="w-32 text-slate-400 shrink-0">{fac.label}</div>
                  <div className="flex-1 h-1.5 rounded-full bg-slate-700 overflow-hidden"><div className="h-full bg-amber-500" style={{ width: `${(fac.points / fac.max) * 100}%` }} /></div>
                  <div className="num text-slate-500 w-10 text-right">{fac.points}/{fac.max}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* Incentives + Environmental + REC */}
      <Section className="py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center gap-2 mb-4"><Award className="w-5 h-5 text-amber-400" /><h3 className="font-head font-semibold text-lg text-slate-100">Potential Incentives</h3></div>
            <div className="space-y-2">
              {eligibility.eligible.slice(0, 4).map((i) => <div key={i.id} className="text-xs text-slate-300 flex gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />{i.name}</div>)}
              {eligibility.verify.slice(0, 2).map((i) => <div key={i.id} className="text-xs text-slate-400 flex gap-2"><span className="text-amber-400 shrink-0">?</span>{i.name} <span className="text-slate-600">(verify)</span></div>)}
            </div>
            <Btn as={Link} to="/government" variant="ghost" className="mt-4 !px-0">Check full eligibility <ArrowRight className="w-3.5 h-3.5" /></Btn>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-4"><Leaf className="w-5 h-5 text-emerald-400" /><h3 className="font-head font-semibold text-lg text-slate-100">Environmental Impact</h3></div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Annual CO₂ avoided</span><span className="num text-emerald-400 font-semibold">{num(model.environmental.annualCo2Tonnes)} t</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">25-year CO₂ avoided</span><span className="num text-emerald-400 font-semibold">{num(model.environmental.lifetimeCo2Tonnes)} t</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Equivalent trees</span><span className="num text-emerald-400 font-semibold">{num(model.environmental.equivalentTrees)}</span></div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2 mb-4"><Zap className="w-5 h-5 text-blue-400" /><h3 className="font-head font-semibold text-lg text-slate-100">Potential RECs</h3></div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Potential RECs / yr</span><span className="num text-blue-400 font-semibold">{num(model.rec.potentialCertsPerYear)}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Indicative value / yr</span><span className="num text-blue-400 font-semibold">{inrCompact(model.rec.indicativeAnnualValue)}</span></div>
            </div>
            <Btn as={Link} to="/rec-carbon" variant="ghost" className="mt-4 !px-0">Explore RECs <ArrowRight className="w-3.5 h-3.5" /></Btn>
          </Card>
        </div>
      </Section>

      {/* Lead form */}
      <Section className="py-10">
        <Card className="hero-radial" id="lead-form">
          {leadDone ? (
            <div className="text-center py-8" data-testid="lead-success">
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
              <h3 className="font-head text-2xl font-bold text-slate-100">Financing assessment requested!</h3>
              <p className="text-slate-400 mt-2">Our EFL Renewable Energy Funding team will reach out.</p>
              <div className="num text-lg text-amber-400 mt-4">Reference: {leadDone.leadId}</div>
              <div className="flex justify-center gap-3 mt-4"><Pill tone={leadDone.intent === "HIGH" ? "emerald" : "amber"}>{leadDone.intent} intent</Pill><Pill tone="blue">Score {leadDone.score}/100</Pill></div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-head text-2xl lg:text-3xl font-bold text-slate-50">Get a Financing Assessment</h3>
                <p className="text-slate-400 mt-3">Turn this estimate into a real financing conversation. Share your details and EFL's REF team will assess your project.</p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="bg-white/[0.03] border border-white/8 rounded-lg p-3"><div className="text-[10px] text-slate-500 font-mono uppercase">Est. Loan</div><div className="num text-amber-400 font-bold">{inrCompact(model.loan.loanAmount)}</div></div>
                  <div className="bg-white/[0.03] border border-white/8 rounded-lg p-3"><div className="text-[10px] text-slate-500 font-mono uppercase">Est. EMI</div><div className="num text-emerald-400 font-bold">{inr(m.monthlyEMI)}</div></div>
                </div>
              </div>
              <form onSubmit={submitLead} className="grid sm:grid-cols-2 gap-4" data-testid="lead-form">
                <Field label="Name *"><TextInput value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} data-testid="lead-name" /></Field>
                <Field label="Company"><TextInput value={lead.company} onChange={(e) => setLead({ ...lead, company: e.target.value })} /></Field>
                <Field label="Mobile *"><TextInput value={lead.mobile} onChange={(e) => setLead({ ...lead, mobile: e.target.value })} data-testid="lead-mobile" /></Field>
                <Field label="Email"><TextInput value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} data-testid="lead-email" /></Field>
                <div className="sm:col-span-2"><Btn type="submit" disabled={busy} className="w-full py-3" data-testid="lead-submit">{busy ? "Submitting..." : "Get Financing Assessment"}</Btn></div>
              </form>
            </div>
          )}
        </Card>
      </Section>

      {/* Assumptions & disclaimers */}
      <Section className="py-6">
        <Card className="print-white">
          <h3 className="font-head font-semibold text-lg text-slate-100 mb-4">Assumptions & Sources</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-slate-400">
            {[
              ["Irradiation", `${irradiation} kWh/m²/day (${f.state})`],
              ["Performance ratio", `${DEFAULTS.performanceRatio} (incl. ${f.shading} shading)`],
              ["Degradation", `~${(DEFAULTS.degradationYr * 100).toFixed(1)}% / yr`],
              ["EPC cost", `₹${ratePerWatt}/W (benchmark)`],
              ["Effective tariff", `₹${effectiveTariff.toFixed(2)}/kWh`],
              ["Tariff escalation", `${f.tariffEscalation}% / yr`],
              ["Financing", `${f.financingPct}% @ ${f.interestRate}% / ${f.tenureYears} yr`],
              ["Grid emission factor", `${DEFAULTS.gridEmissionFactor} tCO₂/MWh`],
            ].map(([k, v]) => <div key={k}><div className="text-slate-600 font-mono uppercase tracking-wider text-[10px]">{k}</div><div className="text-slate-300 mt-0.5">{v}</div></div>)}
          </div>
          <SourceTag className="mt-4 pt-4 border-t border-white/10" source="SERC tariff orders / NIWE irradiation / CEA emission factor / CERC REC price" verified="2026-06" />
          <div className="mt-4 space-y-2 text-[11px] text-slate-500 leading-relaxed">
            <p>• Solar generation is an <b>estimate</b> and depends on location, irradiation, system design, shading, equipment and operating conditions.</p>
            <p>• Government incentive eligibility is subject to applicable rules and approval by the relevant authority.</p>
            <p>• Financing figures are indicative and subject to EFL's credit assessment, applicable terms and approval.</p>
            <p>• REC / carbon-credit eligibility and monetization are not guaranteed. Tax treatment should be confirmed with a qualified tax professional.</p>
          </div>
        </Card>
      </Section>
    </div>
  );
}

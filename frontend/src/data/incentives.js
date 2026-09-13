/*
 * Government benefits & incentives — source-backed, versioned.
 * IMPORTANT: For C&I (commercial/industrial) there is NO direct central capital
 * subsidy. PM Surya Ghar CFA is residential-only. C&I benefits are tax-based
 * (Accelerated Depreciation) + state incentives + GEOA framework.
 * Each record carries category, eligibility logic, source, dates, status.
 */

export const INCENTIVES = [
  {
    id: "accelerated-depreciation",
    name: "Accelerated Depreciation (Section 32)",
    category: "TAX",
    authority: "Income Tax Department (GoI)",
    state: "All India",
    consumerType: ["Commercial", "Industrial", "Business"],
    projectType: ["CAPEX", "Captive"],
    benefit: "Write off 40% of asset cost in Year 1 (plus normal depreciation), reducing taxable income. An additional 20% may apply if commissioned & used >180 days in the financial year.",
    formula: "Tax shield ≈ Eligible asset cost × depreciation rate × applicable tax rate",
    eligibility: "Business must OWN the solar plant (CAPEX/Captive). Not available under OPEX/RESCO where a third party owns the asset.",
    process: "Claimed in the business income tax return. Consult a tax professional.",
    documents: ["Invoice / capitalization proof", "Commissioning certificate", "Depreciation schedule"],
    effectiveFrom: "AY 2018-19 (40% cap)",
    expiry: "Until amended",
    source: "Income Tax Act, 1961 — Section 32 / Appendix I depreciation rates",
    sourceUrl: "https://incometaxindia.gov.in",
    lastVerified: "2026-06",
    status: "Active",
    note: "Indicative information only. Confirm treatment with a qualified tax professional.",
  },
  {
    id: "geoa",
    name: "Green Energy Open Access (GEOA)",
    category: "REGULATORY",
    authority: "MoP / MNRE + State ERCs",
    state: "All India",
    consumerType: ["Commercial", "Industrial"],
    projectType: ["Open Access", "Group Captive", "PPA"],
    benefit: "Consumers with contract demand ≥100 kW can procure renewable power via open access, often below retail C&I tariff. Enables offsite solar/ wind procurement.",
    eligibility: "Contract demand / sanctioned load ≥ 100 kW (aggregation permitted per rules).",
    process: "Apply through state OA portal / nodal agency; pay applicable wheeling, CSS, additional surcharge, banking charges.",
    documents: ["OA application", "PPA / power procurement agreement", "Metering compliance"],
    effectiveFrom: "GEOA Rules 2022 (as amended)",
    expiry: "Until amended",
    source: "Electricity (Promoting Renewable Energy through GEOA) Rules, 2022",
    sourceUrl: "https://powermin.gov.in",
    lastVerified: "2026-06",
    status: "Active",
    note: "Charges (CSS, AS, wheeling, banking) vary by state and materially affect economics.",
  },
  {
    id: "gst-solar",
    name: "GST on Solar Power Generating Systems",
    category: "TAX",
    authority: "CBIC / GST Council",
    state: "All India",
    consumerType: ["Commercial", "Industrial", "Residential"],
    projectType: ["CAPEX", "OPEX", "Captive"],
    benefit: "Concessional GST on solar equipment. Composite EPC contracts follow the 70:30 goods:service valuation split notified by the GST Council.",
    eligibility: "Applies to solar PV modules, inverters, and specified components / EPC contracts.",
    process: "GST charged by supplier; registered businesses may claim Input Tax Credit subject to conditions.",
    documents: ["Tax invoices", "EPC contract", "ITC records"],
    effectiveFrom: "Per latest GST Council notifications",
    expiry: "Until amended",
    source: "CBIC GST Notifications / GST Council decisions",
    sourceUrl: "https://cbic-gst.gov.in",
    lastVerified: "2026-06",
    status: "Active — rate subject to change",
    note: "Indicative only. GST rate and ITC eligibility change periodically — confirm current rate before quotation.",
  },
  {
    id: "electricity-duty-exemption",
    name: "Electricity Duty Exemption (Captive Solar)",
    category: "STATE",
    authority: "State Governments (varies)",
    state: "State-specific (e.g., Maharashtra, Gujarat, Rajasthan, MP)",
    consumerType: ["Industrial", "Commercial"],
    projectType: ["Captive", "CAPEX"],
    benefit: "Exemption / waiver of electricity duty on solar power consumed captively, for a defined period, in several states.",
    eligibility: "Captive / self-consumption projects registered under the applicable state solar / industrial policy.",
    process: "Apply to the state nodal agency / electrical inspectorate.",
    documents: ["State policy registration", "Captive status proof", "Commissioning certificate"],
    effectiveFrom: "Per applicable state policy",
    expiry: "Policy-dependent",
    source: "Respective State Solar / Industrial Policy notifications",
    sourceUrl: "",
    lastVerified: "2026-06",
    status: "Varies by state",
    note: "Availability, quantum and duration vary by state and policy vintage. Verify current state notification.",
  },
  {
    id: "net-metering",
    name: "Net Metering / Net Billing",
    category: "DISCOM",
    authority: "State ERCs / DISCOMs",
    state: "All India (rules vary)",
    consumerType: ["Commercial", "Industrial"],
    projectType: ["Rooftop", "CAPEX"],
    benefit: "Surplus solar exported to the grid is adjusted against import (net metering) or compensated at a feed-in rate (net billing).",
    eligibility: "Rooftop systems within sanctioned/connected load; capacity caps vary by state (typically up to 500 kW–2 MW).",
    process: "Apply to DISCOM; feasibility approval; bidirectional meter installation.",
    documents: ["DISCOM application", "Electrical drawings", "Meter test report"],
    effectiveFrom: "Per state net metering regulations",
    expiry: "Until amended",
    source: "State ERC Net Metering Regulations",
    sourceUrl: "",
    lastVerified: "2026-06",
    status: "Active — caps & compensation vary",
    note: "Many states have moved large C&I consumers to net billing / gross metering. Verify local rule.",
  },
  {
    id: "pm-surya-ghar",
    name: "PM Surya Ghar: Muft Bijli Yojana (Residential only)",
    category: "CENTRAL",
    authority: "MNRE (GoI)",
    state: "All India",
    consumerType: ["Residential"],
    projectType: ["Rooftop"],
    benefit: "Central Financial Assistance up to ₹78,000 per household (₹30,000/kW first 2 kW, ₹18,000 for 3rd kW).",
    eligibility: "RESIDENTIAL premises only. Explicitly NOT available for commercial or industrial premises.",
    process: "Apply on the national portal, use empanelled vendor, DBT after DISCOM verification.",
    documents: ["Electricity bill", "Aadhaar / KYC", "Bank account for DBT"],
    effectiveFrom: "2024",
    expiry: "Ongoing",
    source: "MNRE — PM Surya Ghar",
    sourceUrl: "https://pmsuryaghar.gov.in",
    lastVerified: "2026-06",
    status: "Active (Residential)",
    note: "Listed for completeness. NOT applicable to the C&I customers this platform serves.",
  },
  {
    id: "almm-mandate",
    name: "ALMM Compliance Requirement",
    category: "REGULATORY",
    authority: "MNRE (GoI)",
    state: "All India",
    consumerType: ["Commercial", "Industrial", "Residential"],
    projectType: ["Rooftop", "Ground Mounted", "Open Access", "Net Metering"],
    benefit: "Not a benefit — a compliance requirement affecting eligibility for grid connection / net metering.",
    eligibility: "From 1 June 2026, grid-connected projects (incl. net-metering & open access) must use modules from ALMM List-I and cells from ALMM List-II.",
    process: "Verify vendor & product ALMM listing before procurement.",
    documents: ["ALMM listing proof for modules & cells"],
    effectiveFrom: "2026-06-01",
    expiry: "Until amended",
    source: "MNRE ALMM Orders",
    sourceUrl: "https://mnre.gov.in",
    lastVerified: "2026-06",
    status: "Active",
    note: "Affects equipment selection and project bankability. Non-compliant equipment may be ineligible for net metering.",
  },
];

// Simple eligibility engine — returns categorized results for a customer context.
export function evaluateEligibility({ consumerType = "Industrial", projectType = "CAPEX", capacityKw = 0, installationType = "Rooftop" }) {
  const result = { eligible: [], verify: [], notEligible: [] };
  for (const inc of INCENTIVES) {
    const consumerMatch = inc.consumerType.includes(consumerType) ||
      (consumerType !== "Residential" && inc.consumerType.some((c) => ["Commercial", "Industrial", "Business"].includes(c)));

    if (inc.id === "pm-surya-ghar") {
      result.notEligible.push({ ...inc, reason: "Residential-only scheme; not applicable to commercial/industrial." });
      continue;
    }
    if (inc.id === "accelerated-depreciation") {
      if (["CAPEX", "Captive"].includes(projectType)) result.eligible.push({ ...inc, reason: "Owner of asset can claim depreciation." });
      else result.notEligible.push({ ...inc, reason: "Under OPEX/RESCO the third-party owner claims depreciation, not the consumer." });
      continue;
    }
    if (inc.id === "geoa") {
      if (capacityKw >= 100) result.eligible.push({ ...inc, reason: "Load ≥100 kW qualifies for Green Open Access." });
      else result.verify.push({ ...inc, reason: "Contract demand appears <100 kW; verify aggregation options." });
      continue;
    }
    if (inc.id === "net-metering") {
      if (installationType === "Rooftop") result.eligible.push({ ...inc, reason: "Rooftop qualifies; check state cap & net-billing rules." });
      else result.verify.push({ ...inc, reason: "Non-rooftop — verify applicable metering arrangement." });
      continue;
    }
    if (inc.id === "electricity-duty-exemption") {
      result.verify.push({ ...inc, reason: "State-dependent; verify current state policy notification." });
      continue;
    }
    // default
    if (consumerMatch) result.eligible.push({ ...inc, reason: "Generally applicable to C&I solar." });
    else result.verify.push({ ...inc, reason: "Verify applicability for your context." });
  }
  return result;
}

# EFL Renewable Energy Funding (REF) — Solar Intelligence Platform

## Original Problem Statement
Production-quality, responsive B2B web app for the Indian C&I solar market. EFL is an NBFC with a Renewable Energy Funding vertical financing solar for industrial/commercial customers; EPCs are a channel. The platform spans the full journey: bill → solar potential → project size → cost → govt benefits → financing → EMI → savings → payback → cash flow → ROI → environmental → REC → financing lead. Must look like a sophisticated B2B fintech/energy platform, not a solar installer site.

## User Choices
- Scope: full depth across calculator+financing, data portal, and EPC portal.
- Design: Dark premium fintech (navy/charcoal + amber/emerald accents).
- Auth: none (public calculator + lead capture).
- Integrations: none (self-contained).
- Content: full navigation tree built immediately.
- Data must be real/source-tagged (no fabricated live govt data).

## Architecture
- Frontend: React 19 + Tailwind (shadcn), recharts, framer-motion, react-router. Design tokens in index.css.
- Calculation engine: `/app/frontend/src/lib/engine.js` — pure UI-independent functions (generation, savings, EMI, amortization, NPV, IRR, DSCR, payback, suitability, environmental, REC, sensitivity, tornado).
- Data layer (versioned, source-tagged): `/app/frontend/src/data/` — states.js (36 states/UTs), discoms.js (20 DISCOMs), incentives.js (+ eligibility engine), industries.js (25 sectors), config.js (defaults, REC price schedule, EFL product), content.js (tech, models, glossary, FAQ, docs, demo customer).
- Backend: FastAPI + MongoDB (`/app/backend/server.py`) — leads, EPC partners, EPC projects, stats; lead scoring/intent. Routes under /api.

## Data Integrity (real, sourced, 2026-06 verified)
- No central C&I capital subsidy; PM Surya Ghar is residential-only.
- Accelerated Depreciation (Sec 32, 40%), GEOA (≥100 kW), GST, state incentives, ALMM mandate (Jun 1 2026).
- CERC RCO Buyout Price schedule (₹347→₹421/MWh FY24-25→FY29-30).
- All tariffs/irradiation clearly labeled indicative with source + last-verified; disclaimers throughout.

## Implemented (2026-06)
- Homepage with live-style illustrative metrics from engine.
- 6-step Solar Calculator (Location, Business, Bill, Site, System, Cost) with auto system sizing, live sticky summary, mobile sticky savings, demo-data loader, inline validation.
- Results dashboard: 12 metrics, Solar-vs-EMI cash flow, 6 charts (bill w/wo solar, cumulative savings, annual cashflow, generation, cost breakdown, loan outstanding), scenario builder (No solar / 70/80/100% financing), sensitivity tornado + best/base/worst, suitability score gauge, incentives/environmental/REC panels, financing lead form, print-to-PDF report, assumptions & sources.
- Financing page: EMI calculator + amortization charts + scenarios + journey + documents.
- State DB + state detail; DISCOM directory; Government incentives + eligibility engine + GST/tax; REC & Carbon centre + REC calculator; Industries + industry detail (25); Technology knowledge centre; Project models comparison; Solar for Business; EPC portal (register/submit/track pipeline); Resources (glossary/FAQ/docs); Contact.
- Backend lead & EPC persistence with intent scoring. Tested 14/14 backend, 100% frontend flows.

## Backlog / Future (P1/P2)
- P1: Electricity bill OCR extraction (architecture ready), real PDF export (currently print), email/WhatsApp report sharing.
- P1: Admin dashboard to edit states/DISCOMs/tariffs/incentives/rates (data currently in versioned JS modules).
- P2: Auth (EPC/customer/admin logins), AI Solar Advisor (LLM using engine), CRM/EFL loan-application integration, interactive India SVG map.

## Next Tasks
- Consider admin CRUD for regulatory data; OCR bill upload; AI advisor.

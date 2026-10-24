"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + Math.round(n).toLocaleString("en-US"); }

type LawyerRule = "yes" | "no" | "partial";

interface StateInfo {
  name: string;
  limit: number;
  limitBiz?: number;
  courtName: string;
  feeMin: number;
  feeMax: number;
  lawyers: LawyerRule;
  lawyerNote?: string;
  appealRule: string;
  solWritten: number; solOral: number; solPropDmg: number; solPI: number;
  notes?: string;
}

const STATES: Record<string, StateInfo> = {
  AL: { name:"Alabama", limit:6000, courtName:"Small Claims, District Court", feeMin:50, feeMax:150, lawyers:"yes", appealRule:"Either party; de novo to Circuit Court", solWritten:6, solOral:6, solPropDmg:6, solPI:2 },
  AK: { name:"Alaska", limit:10000, courtName:"Small Claims, District Court", feeMin:50, feeMax:100, lawyers:"yes", appealRule:"Either party; on record", solWritten:3, solOral:3, solPropDmg:3, solPI:2 },
  AZ: { name:"Arizona", limit:3500, courtName:"Justice Court, Small Claims", feeMin:30, feeMax:75, lawyers:"no", lawyerNote:"No attorneys unless all parties agree in writing", appealRule:"No appeals from small claims division", solWritten:6, solOral:3, solPropDmg:2, solPI:2, notes:"Lowest limit among western states. Can transfer to civil docket for attorney representation." },
  AR: { name:"Arkansas", limit:5000, courtName:"Small Claims, District Court", feeMin:30, feeMax:65, lawyers:"yes", appealRule:"Either party; de novo to Circuit Court", solWritten:5, solOral:3, solPropDmg:3, solPI:3 },
  CA: { name:"California", limit:12500, limitBiz:6250, courtName:"Small Claims, Superior Court", feeMin:30, feeMax:75, lawyers:"no", lawyerNote:"No attorneys at hearing. Allowed on appeal.", appealRule:"Defendant only; de novo", solWritten:4, solOral:2, solPropDmg:3, solPI:2, notes:"$12,500 for individuals, $6,250 for businesses. Max 2 claims over $2,500/year. Recently raised from $10,000." },
  CO: { name:"Colorado", limit:7500, courtName:"Small Claims, County Court", feeMin:31, feeMax:55, lawyers:"no", lawyerNote:"Attorneys generally not permitted", appealRule:"Either party; 14 days; $163 fee", solWritten:6, solOral:6, solPropDmg:2, solPI:2 },
  CT: { name:"Connecticut", limit:5000, courtName:"Small Claims, Superior Court", feeMin:35, feeMax:100, lawyers:"yes", appealRule:"Very limited; generally not permitted", solWritten:6, solOral:3, solPropDmg:2, solPI:2 },
  DE: { name:"Delaware", limit:25000, courtName:"Justice of the Peace Court", feeMin:35, feeMax:50, lawyers:"yes", appealRule:"Either party; de novo to Court of Common Pleas", solWritten:3, solOral:3, solPropDmg:2, solPI:2, notes:"Tied with Tennessee for highest small claims limit in the US ($25,000)." },
  DC: { name:"District of Columbia", limit:10000, courtName:"Small Claims, DC Superior Court", feeMin:5, feeMax:15, lawyers:"yes", appealRule:"Either party", solWritten:3, solOral:3, solPropDmg:3, solPI:3, notes:"Lowest filing fees in the nation ($5-$15)." },
  FL: { name:"Florida", limit:8000, courtName:"Small Claims, County Court", feeMin:55, feeMax:300, lawyers:"yes", appealRule:"Either party; review on record", solWritten:5, solOral:4, solPropDmg:4, solPI:4 },
  GA: { name:"Georgia", limit:15000, courtName:"Magistrate Court", feeMin:45, feeMax:102, lawyers:"yes", appealRule:"Either party; 30 days", solWritten:6, solOral:4, solPropDmg:4, solPI:2 },
  HI: { name:"Hawaii", limit:5000, courtName:"Small Claims, District Court", feeMin:35, feeMax:35, lawyers:"no", lawyerNote:"No attorneys at trial", appealRule:"No appeals generally", solWritten:6, solOral:6, solPropDmg:2, solPI:2, notes:"No limit for security deposit claims." },
  ID: { name:"Idaho", limit:5000, courtName:"Small Claims, Magistrate Division", feeMin:65, feeMax:90, lawyers:"yes", appealRule:"Either party; de novo to District Court", solWritten:5, solOral:4, solPropDmg:3, solPI:2 },
  IL: { name:"Illinois", limit:10000, courtName:"Small Claims, Circuit Court", feeMin:100, feeMax:381, lawyers:"partial", lawyerNote:"Cook County Pro Se: no attorneys for plaintiffs. Elsewhere: yes.", appealRule:"Either party", solWritten:10, solOral:5, solPropDmg:5, solPI:2, notes:"Cook County has highest filing fees ($307-$381). Cook County Pro Se branch limits self-represented to $3,000." },
  IN: { name:"Indiana", limit:10000, courtName:"Small Claims, Circuit/Superior Court", feeMin:35, feeMax:97, lawyers:"yes", appealRule:"Either party; on record", solWritten:10, solOral:6, solPropDmg:2, solPI:2, notes:"$8,000 limit in Marion County." },
  IA: { name:"Iowa", limit:6500, courtName:"Small Claims, District Court", feeMin:20, feeMax:95, lawyers:"yes", appealRule:"No appeals generally", solWritten:10, solOral:5, solPropDmg:5, solPI:2 },
  KS: { name:"Kansas", limit:4000, courtName:"Small Claims, District Court", feeMin:30, feeMax:55, lawyers:"no", lawyerNote:"No attorneys permitted", appealRule:"Either party; de novo", solWritten:5, solOral:3, solPropDmg:2, solPI:2 },
  KY: { name:"Kentucky", limit:2500, courtName:"Small Claims, District Court", feeMin:25, feeMax:50, lawyers:"yes", appealRule:"Either party; de novo to Circuit Court", solWritten:15, solOral:5, solPropDmg:2, solPI:1, notes:"Lowest small claims limit in the US ($2,500). Shortest PI statute of limitations (1 year). Longest written contract SOL (15 years)." },
  LA: { name:"Louisiana", limit:5000, courtName:"Small Claims, City Court/Justice of Peace", feeMin:35, feeMax:75, lawyers:"yes", appealRule:"Varies by court; limited", solWritten:10, solOral:10, solPropDmg:1, solPI:1, notes:"1-year statute of limitations for property damage and personal injury (prescriptive period)." },
  ME: { name:"Maine", limit:6000, courtName:"Small Claims, District Court", feeMin:50, feeMax:90, lawyers:"yes", appealRule:"Either party; de novo to Superior Court", solWritten:6, solOral:6, solPropDmg:6, solPI:6 },
  MD: { name:"Maryland", limit:5000, courtName:"Small Claims, District Court", feeMin:34, feeMax:44, lawyers:"yes", appealRule:"Either party; de novo to Circuit Court; 30 days", solWritten:3, solOral:3, solPropDmg:3, solPI:3 },
  MA: { name:"Massachusetts", limit:7000, courtName:"Small Claims, District/Boston Municipal Court", feeMin:40, feeMax:150, lawyers:"yes", appealRule:"Defendant only; new trial", solWritten:6, solOral:6, solPropDmg:3, solPI:3, notes:"No limit for motor vehicle property damage claims." },
  MI: { name:"Michigan", limit:6500, courtName:"Small Claims, District Court", feeMin:30, feeMax:70, lawyers:"no", lawyerNote:"No attorneys permitted", appealRule:"Limited; only if decided by magistrate", solWritten:6, solOral:6, solPropDmg:3, solPI:3 },
  MN: { name:"Minnesota", limit:15000, courtName:"Conciliation Court", feeMin:50, feeMax:75, lawyers:"no", lawyerNote:"No attorneys at trial; allowed on appeal", appealRule:"Either party; de novo to District Court", solWritten:6, solOral:6, solPropDmg:6, solPI:6, notes:"$4,000 limit for consumer credit transactions." },
  MS: { name:"Mississippi", limit:3500, courtName:"Justice Court", feeMin:30, feeMax:75, lawyers:"yes", appealRule:"Either party; de novo to County/Circuit Court", solWritten:3, solOral:3, solPropDmg:3, solPI:3 },
  MO: { name:"Missouri", limit:5000, courtName:"Small Claims, Circuit Court", feeMin:25, feeMax:50, lawyers:"yes", appealRule:"Either party; de novo to Circuit Court", solWritten:10, solOral:5, solPropDmg:5, solPI:5 },
  MT: { name:"Montana", limit:7000, courtName:"Small Claims, Justice/District Court", feeMin:30, feeMax:50, lawyers:"no", lawyerNote:"No attorneys permitted", appealRule:"Either party; de novo", solWritten:8, solOral:5, solPropDmg:2, solPI:3 },
  NE: { name:"Nebraska", limit:3900, courtName:"Small Claims, County Court", feeMin:26, feeMax:52, lawyers:"no", lawyerNote:"No attorneys permitted", appealRule:"Either party; de novo to District Court", solWritten:5, solOral:4, solPropDmg:4, solPI:4 },
  NV: { name:"Nevada", limit:10000, courtName:"Small Claims, Justice Court", feeMin:50, feeMax:95, lawyers:"yes", appealRule:"Either party; de novo to District Court", solWritten:6, solOral:4, solPropDmg:3, solPI:2 },
  NH: { name:"New Hampshire", limit:10000, courtName:"Small Claims, District Court", feeMin:50, feeMax:100, lawyers:"yes", appealRule:"Either party; on record", solWritten:3, solOral:3, solPropDmg:3, solPI:3 },
  NJ: { name:"New Jersey", limit:5000, courtName:"Special Civil Part, Small Claims", feeMin:35, feeMax:35, lawyers:"yes", lawyerNote:"Corporations must have an attorney", appealRule:"Either party; 45 days", solWritten:6, solOral:6, solPropDmg:6, solPI:2 },
  NM: { name:"New Mexico", limit:10000, courtName:"Metropolitan/Magistrate Court", feeMin:25, feeMax:90, lawyers:"yes", appealRule:"Either party; de novo to District Court", solWritten:6, solOral:4, solPropDmg:4, solPI:3 },
  NY: { name:"New York", limit:10000, courtName:"Small Claims Part, Civil Court", feeMin:15, feeMax:25, lawyers:"yes", appealRule:"Either party (rare/expensive); on record", solWritten:6, solOral:6, solPropDmg:3, solPI:3, notes:"$10,000 in NYC; $5,000 in upstate City Courts; $3,000 in Town/Village Courts." },
  NC: { name:"North Carolina", limit:10000, courtName:"Small Claims, District Court (Magistrate)", feeMin:96, feeMax:96, lawyers:"yes", appealRule:"Either party; de novo to District Court; 10 days", solWritten:3, solOral:3, solPropDmg:3, solPI:3 },
  ND: { name:"North Dakota", limit:15000, courtName:"Small Claims, District Court", feeMin:10, feeMax:50, lawyers:"no", lawyerNote:"No attorneys permitted", appealRule:"Either party; de novo", solWritten:6, solOral:6, solPropDmg:6, solPI:6 },
  OH: { name:"Ohio", limit:6000, courtName:"Small Claims, Municipal/County Court", feeMin:35, feeMax:50, lawyers:"yes", appealRule:"Either party; 30 days", solWritten:8, solOral:6, solPropDmg:2, solPI:2 },
  OK: { name:"Oklahoma", limit:10000, courtName:"Small Claims, District Court", feeMin:55, feeMax:80, lawyers:"yes", appealRule:"Either party; on record", solWritten:5, solOral:3, solPropDmg:2, solPI:2 },
  OR: { name:"Oregon", limit:10000, courtName:"Small Claims, Circuit/Justice Court", feeMin:50, feeMax:90, lawyers:"no", lawyerNote:"No attorneys without judge's permission", appealRule:"Defendant only (Justice Court); limited", solWritten:6, solOral:6, solPropDmg:6, solPI:2 },
  PA: { name:"Pennsylvania", limit:12000, courtName:"Magisterial District Court", feeMin:50, feeMax:150, lawyers:"yes", appealRule:"Either party; de novo to Court of Common Pleas", solWritten:4, solOral:4, solPropDmg:2, solPI:2 },
  RI: { name:"Rhode Island", limit:5000, courtName:"Small Claims, District Court", feeMin:30, feeMax:50, lawyers:"yes", appealRule:"Either party; de novo to Superior Court", solWritten:10, solOral:10, solPropDmg:10, solPI:3 },
  SC: { name:"South Carolina", limit:7500, courtName:"Magistrate Court", feeMin:40, feeMax:80, lawyers:"yes", appealRule:"Either party; de novo", solWritten:3, solOral:3, solPropDmg:3, solPI:3 },
  SD: { name:"South Dakota", limit:12000, courtName:"Small Claims, Magistrate Court", feeMin:40, feeMax:55, lawyers:"yes", appealRule:"Either party; de novo to Circuit Court", solWritten:6, solOral:6, solPropDmg:6, solPI:3 },
  TN: { name:"Tennessee", limit:25000, courtName:"General Sessions Court", feeMin:45, feeMax:100, lawyers:"yes", appealRule:"Either party; de novo to Circuit Court", solWritten:6, solOral:6, solPropDmg:3, solPI:1, notes:"Tied with Delaware for highest small claims limit ($25,000). 1-year PI statute of limitations." },
  TX: { name:"Texas", limit:20000, courtName:"Justice Court", feeMin:54, feeMax:100, lawyers:"yes", appealRule:"Either party; de novo to County Court; 21 days", solWritten:4, solOral:4, solPropDmg:2, solPI:2 },
  UT: { name:"Utah", limit:20000, courtName:"Small Claims, Justice Court", feeMin:60, feeMax:185, lawyers:"yes", appealRule:"Either party; de novo to District Court", solWritten:6, solOral:4, solPropDmg:3, solPI:4, notes:"Limit increases to $25,000 on January 1, 2030." },
  VT: { name:"Vermont", limit:5000, courtName:"Small Claims, Superior Court", feeMin:50, feeMax:90, lawyers:"yes", appealRule:"Either party; de novo", solWritten:6, solOral:6, solPropDmg:3, solPI:3 },
  VA: { name:"Virginia", limit:5000, courtName:"Small Claims, General District Court", feeMin:50, feeMax:65, lawyers:"no", lawyerNote:"No attorneys for plaintiffs. Defendant can request transfer.", appealRule:"Either party; de novo to Circuit Court; 10 days", solWritten:5, solOral:3, solPropDmg:5, solPI:2 },
  WA: { name:"Washington", limit:10000, limitBiz:5000, courtName:"Small Claims, District Court", feeMin:35, feeMax:50, lawyers:"no", lawyerNote:"No attorneys unless judge grants permission", appealRule:"Limited (see rules)", solWritten:6, solOral:3, solPropDmg:3, solPI:3, notes:"$10,000 for individuals; $5,000 for businesses." },
  WV: { name:"West Virginia", limit:10000, courtName:"Magistrate Court", feeMin:30, feeMax:75, lawyers:"yes", appealRule:"Either party; de novo to Circuit Court", solWritten:10, solOral:5, solPropDmg:2, solPI:2 },
  WI: { name:"Wisconsin", limit:10000, courtName:"Small Claims, Circuit Court", feeMin:50, feeMax:95, lawyers:"yes", appealRule:"Either party; on record", solWritten:6, solOral:6, solPropDmg:6, solPI:3, notes:"$5,000 limit for personal injury/tort claims." },
  WY: { name:"Wyoming", limit:6000, courtName:"Small Claims, Circuit Court", feeMin:20, feeMax:50, lawyers:"yes", appealRule:"Either party; de novo to District Court", solWritten:10, solOral:8, solPropDmg:4, solPI:4 },
};

type ClaimType = "written_contract" | "oral_contract" | "property_damage" | "personal_injury";
const CLAIM_LABELS: Record<ClaimType, string> = {
  written_contract: "Written Contract", oral_contract: "Oral Contract",
  property_damage: "Property Damage", personal_injury: "Personal Injury",
};

const COMPARE_STATES = ["CA", "TX", "NY", "FL", "IL", "GA", "PA", "OH", "TN", "DE", "KY", "AZ"];

export default function Page() {
  const [state, setState] = useState("CA");
  const [claimAmount, setClaimAmount] = useState(5000);
  const [claimType, setClaimType] = useState<ClaimType>("written_contract");
  const [isBusiness, setIsBusiness] = useState(false);

  const si = STATES[state];

  const result = useMemo(() => {
    const effectiveLimit = isBusiness && si.limitBiz ? si.limitBiz : si.limit;
    const fitsSmallClaims = claimAmount <= effectiveLimit;
    const sol = claimType === "written_contract" ? si.solWritten :
      claimType === "oral_contract" ? si.solOral :
      claimType === "property_damage" ? si.solPropDmg : si.solPI;

    // Estimate filing fee based on claim amount relative to fee range
    const feeEstimate = claimAmount <= 1500 ? si.feeMin : claimAmount > effectiveLimit * 0.5 ? si.feeMax : Math.round((si.feeMin + si.feeMax) / 2);

    const comparisons = COMPARE_STATES
      .filter(s => s !== state)
      .slice(0, 7)
      .map(s => {
        const csi = STATES[s];
        const cLimit = isBusiness && csi.limitBiz ? csi.limitBiz : csi.limit;
        const cFits = claimAmount <= cLimit;
        const cSol = claimType === "written_contract" ? csi.solWritten :
          claimType === "oral_contract" ? csi.solOral :
          claimType === "property_damage" ? csi.solPropDmg : csi.solPI;
        return { state: s, name: csi.name, limit: cLimit, fits: cFits, sol: cSol, lawyers: csi.lawyers, feeRange: `$${csi.feeMin}-$${csi.feeMax}` };
      });

    return { effectiveLimit, fitsSmallClaims, sol, feeEstimate, comparisons };
  }, [state, claimAmount, claimType, isBusiness, si]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-900 border border-zinc-800 rounded-xl p-4";

  return (
    <ToolLayout
      title="Small Claims Court Calculator"
      description="Check if your case fits in small claims court for all 50 states. Dollar limits, filing fees, statute of limitations, attorney rules, and appeal procedures by state."
      slug="small-claims-calculator"
      category="Legal"
      keywords={["small claims court calculator", "small claims limit by state", "small claims court filing fee", "small claims court rules", "how to file small claims", "small claims statute of limitations"]}
      faqs={[
        { question: "What is small claims court?", answer: "Small claims court is a simplified legal process for resolving disputes involving relatively small amounts of money. The rules are designed for people without lawyers — hearings are informal, there's no jury, and cases are usually decided the same day. Dollar limits range from $2,500 (Kentucky) to $25,000 (Tennessee, Delaware). Filing fees are typically $25-$150." },
        { question: "Do I need a lawyer for small claims court?", answer: "In most cases, no — and in 13 states (including California, Arizona, Colorado, Michigan, and Washington), attorneys are actually prohibited from representing parties in small claims. The court is designed for self-representation. However, in states that allow lawyers, having one party represented can put the other at a disadvantage." },
        { question: "What is the statute of limitations?", answer: "The statute of limitations is the deadline for filing your claim after the incident occurred. It varies by state and claim type. For example, Kentucky has only 1 year for personal injury claims, while Maine allows 6 years. Written contracts typically have longer deadlines (3-15 years) than personal injury claims (1-6 years). Missing this deadline means your case is dismissed." },
        { question: "What happens if my claim exceeds the small claims limit?", answer: "You have three options: (1) reduce your claim to the small claims limit and forfeit the rest, (2) file in regular civil court (more expensive and complex), or (3) in some states, split the claim into multiple cases (though many states prohibit this). Option 1 is often the best choice if the excess is small relative to the cost of civil court." },
        { question: "Can I appeal a small claims decision?", answer: "It depends on your state. Most states allow either party to appeal, typically within 10-30 days. California and Massachusetts only allow defendants to appeal. Arizona does not allow appeals from small claims at all. Appeals are often 'de novo' (a completely new trial) in a higher court." },
        { question: "Where do I file a small claims case?", answer: "Almost always in the county or district where the defendant lives or does business, or where the incident occurred (contract was signed, property was damaged, etc.). Filing in the wrong location can result in dismissal." },
        { question: "Which states have the highest and lowest limits?", answer: "Highest: Tennessee and Delaware ($25,000), Texas and Utah ($20,000), Georgia, Minnesota, and North Dakota ($15,000). Lowest: Kentucky ($2,500), Arizona and Mississippi ($3,500), Nebraska ($3,900), Kansas ($4,000). California allows $12,500 for individuals but only $6,250 for businesses." },
        { question: "How long does small claims court take?", answer: "From filing to hearing is typically 30-75 days. The hearing itself usually takes 15-60 minutes and you get a decision the same day or within a few days. If you win, collecting the judgment can take longer — the court doesn't collect for you." },
      ]}
      relatedTools={[
        { name: "Personal Injury Calculator", href: "/tools/personal-injury-calculator" },
        { name: "DUI Cost Calculator", href: "/tools/dui-cost-calculator" },
        { name: "Invoice Generator", href: "/tools/invoice-generator" },
      ]}
    >
      {/* Disclaimer */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <p className="text-sm text-yellow-400 font-medium mb-1">Important Disclaimer</p>
        <p className="text-sm text-zinc-400">
          Rules and fees vary by county/jurisdiction within each state. Always verify with your local court clerk before filing.
        </p>
      </div>

      {/* Inputs */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div>
          <label className={labelCls}>State</label>
          <select value={state} onChange={e => setState(e.target.value)} className={inputCls}>
            {Object.entries(STATES).sort((a, b) => a[1].name.localeCompare(b[1].name)).map(([code, s]) => (
              <option key={code} value={code}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Claim Amount ($)</label>
          <input type="number" value={claimAmount} onChange={e => setClaimAmount(Math.max(0, +e.target.value))} className={inputCls} min={0} step={100} />
        </div>
        <div>
          <label className={labelCls}>Claim Type</label>
          <select value={claimType} onChange={e => setClaimType(e.target.value as ClaimType)} className={inputCls}>
            {Object.entries(CLAIM_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="flex items-end pb-1">
          <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
            <input type="checkbox" checked={isBusiness} onChange={e => setIsBusiness(e.target.checked)} className="accent-blue-500" />
            Filing as a business
          </label>
        </div>
      </div>

      {/* Primary result */}
      <div className={`rounded-xl border p-5 text-center mb-6 ${result.fitsSmallClaims ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"}`}>
        <p className="text-sm text-zinc-400 mb-2">Does Your Claim Fit in Small Claims Court?</p>
        <p className={`text-4xl font-bold mb-2 ${result.fitsSmallClaims ? "text-green-400" : "text-red-400"}`}>
          {result.fitsSmallClaims ? "YES" : "NO — Exceeds Limit"}
        </p>
        <p className="text-sm text-zinc-300">
          {result.fitsSmallClaims
            ? `${fmtC(claimAmount)} is within ${si.name}'s ${fmtC(result.effectiveLimit)} small claims limit`
            : `${fmtC(claimAmount)} exceeds ${si.name}'s ${fmtC(result.effectiveLimit)} limit by ${fmtC(claimAmount - result.effectiveLimit)}`}
        </p>
        {!result.fitsSmallClaims && (
          <p className="text-xs text-zinc-500 mt-2">Options: reduce claim to {fmtC(result.effectiveLimit)} and forfeit the rest, or file in regular civil court.</p>
        )}
      </div>

      {/* Key details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Dollar Limit</p>
          <p className="text-lg font-bold text-zinc-100">{fmtC(result.effectiveLimit)}</p>
          {isBusiness && si.limitBiz && <p className="text-xs text-zinc-500">(business limit)</p>}
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Filing Fee</p>
          <p className="text-lg font-bold text-zinc-100">${si.feeMin}-${si.feeMax}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Statute of Limitations</p>
          <p className="text-lg font-bold text-zinc-100">{result.sol} year{result.sol !== 1 ? "s" : ""}</p>
          <p className="text-xs text-zinc-500">{CLAIM_LABELS[claimType]}</p>
        </div>
        <div className={cardCls + " text-center"}>
          <p className="text-xs text-zinc-500">Lawyers Allowed?</p>
          <p className={`text-lg font-bold ${si.lawyers === "yes" ? "text-green-400" : si.lawyers === "no" ? "text-red-400" : "text-yellow-400"}`}>
            {si.lawyers === "yes" ? "Yes" : si.lawyers === "no" ? "No" : "Partial"}
          </p>
        </div>
      </div>

      {/* State details */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">{si.name} Small Claims Details</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-zinc-400">Court</span><span className="text-zinc-200">{si.courtName}</span></div>
          <div className="flex justify-between"><span className="text-zinc-400">Appeals</span><span className="text-zinc-200 text-right max-w-[60%]">{si.appealRule}</span></div>
          {si.lawyerNote && <div className="flex justify-between"><span className="text-zinc-400">Attorney Rule</span><span className="text-zinc-200 text-right max-w-[60%]">{si.lawyerNote}</span></div>}
          <div className="border-t border-zinc-800 pt-2 mt-2">
            <p className="text-zinc-400 text-xs mb-1">Statute of Limitations:</p>
            <div className="grid grid-cols-2 gap-1 text-xs">
              <span className="text-zinc-500">Written Contract: {si.solWritten} yrs</span>
              <span className="text-zinc-500">Oral Contract: {si.solOral} yrs</span>
              <span className="text-zinc-500">Property Damage: {si.solPropDmg} yrs</span>
              <span className="text-zinc-500">Personal Injury: {si.solPI} yrs</span>
            </div>
          </div>
        </div>
      </div>

      {si.notes && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
          <p className="text-sm text-zinc-400">{si.notes}</p>
        </div>
      )}

      {/* State comparison */}
      <div className={cardCls + " mb-6"}>
        <h3 className="text-sm font-semibold text-zinc-200 mb-4">State Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                <th className="text-left px-3 py-2 font-medium">State</th>
                <th className="text-right px-3 py-2 font-medium">Limit</th>
                <th className="text-center px-3 py-2 font-medium">Fits?</th>
                <th className="text-right px-3 py-2 font-medium">SOL</th>
                <th className="text-center px-3 py-2 font-medium">Lawyers</th>
                <th className="text-right px-3 py-2 font-medium">Fees</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-zinc-800 bg-blue-500/10">
                <td className="px-3 py-2 text-blue-400 font-medium">{si.name}</td>
                <td className="px-3 py-2 text-right text-blue-400">{fmtC(result.effectiveLimit)}</td>
                <td className="px-3 py-2 text-center">{result.fitsSmallClaims ? <span className="text-green-400">Yes</span> : <span className="text-red-400">No</span>}</td>
                <td className="px-3 py-2 text-right text-blue-400">{result.sol} yrs</td>
                <td className="px-3 py-2 text-center text-blue-400">{si.lawyers === "yes" ? "Yes" : si.lawyers === "no" ? "No" : "Partial"}</td>
                <td className="px-3 py-2 text-right text-blue-400">${si.feeMin}-${si.feeMax}</td>
              </tr>
              {result.comparisons.map(c => (
                <tr key={c.state} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                  <td className="px-3 py-2 text-zinc-300">{c.name}</td>
                  <td className="px-3 py-2 text-right text-zinc-300">{fmtC(c.limit)}</td>
                  <td className="px-3 py-2 text-center">{c.fits ? <span className="text-green-400">Yes</span> : <span className="text-red-400">No</span>}</td>
                  <td className="px-3 py-2 text-right text-zinc-400">{c.sol} yrs</td>
                  <td className="px-3 py-2 text-center text-zinc-400">{c.lawyers === "yes" ? "Yes" : c.lawyers === "no" ? "No" : "Partial"}</td>
                  <td className="px-3 py-2 text-right text-zinc-500">{c.feeRange}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
        <p className="text-xs text-zinc-500 leading-relaxed">
          Dollar limits, filing fees, and rules vary by county within each state. Filing fees shown are typical ranges — check with your local court clerk for exact amounts. This is informational only, not legal advice.
        </p>
      </div>
    </ToolLayout>
  );
}

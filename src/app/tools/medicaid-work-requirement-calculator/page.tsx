"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";
import Link from "next/link";

/* ── 2026 FPL data (48 states + DC) ── */
const fpl2026: Record<number, number> = {
  1: 15960, 2: 21640, 3: 27320, 4: 33000, 5: 38680, 6: 44360, 7: 50040, 8: 55720,
};
const fplIncrement = 5680;
const fplAlaska: Record<number, number> = {
  1: 19950, 2: 27050, 3: 34150, 4: 41250, 5: 48350, 6: 55450, 7: 62550, 8: 69650,
};
const fplAlaskaIncrement = 7100;
const fplHawaii: Record<number, number> = {
  1: 18360, 2: 24890, 3: 31420, 4: 37950, 5: 44480, 6: 51010, 7: 57540, 8: 64070,
};
const fplHawaiiIncrement = 6530;

function getFPL(householdSize: number, state: string): number {
  const size = Math.max(1, householdSize);
  let table: Record<number, number>;
  let increment: number;
  if (state === "AK") { table = fplAlaska; increment = fplAlaskaIncrement; }
  else if (state === "HI") { table = fplHawaii; increment = fplHawaiiIncrement; }
  else { table = fpl2026; increment = fplIncrement; }

  if (size <= 8) return table[size];
  return table[8] + (size - 8) * increment;
}

/* ── State data ── */
const expansionStates: Record<string, string> = {
  AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", DC: "District of Columbia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana",
  IA: "Iowa", KY: "Kentucky", LA: "Louisiana", ME: "Maine",
  MD: "Maryland", MA: "Massachusetts", MI: "Michigan", MN: "Minnesota",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SD: "South Dakota", UT: "Utah", VA: "Virginia",
  VT: "Vermont", WA: "Washington", WV: "West Virginia",
};

const nonExpansionStates: Record<string, string> = {
  AL: "Alabama", FL: "Florida", GA: "Georgia", KS: "Kansas",
  MS: "Mississippi", SC: "South Carolina", TN: "Tennessee", TX: "Texas",
  WI: "Wisconsin", WY: "Wyoming",
};

const allStates = { ...expansionStates, ...nonExpansionStates };

/* ── Types ── */
interface Activity {
  id: number;
  type: string;
  hoursPerWeek: number;
}

let nextId = 1;

const activityTypes = [
  { value: "employment", label: "Employment (paid work, part-time or full-time)" },
  { value: "job-training", label: "Job training or workforce development program" },
  { value: "education", label: "Higher education or career/technical education (at least half-time)" },
  { value: "community-service", label: "Community service or volunteering" },
  { value: "work-program", label: "Other work program" },
];

function fmt$(n: number) {
  return "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function Page() {
  /* personal info */
  const [age, setAge] = useState<number | "">(35);
  const [stateCode, setStateCode] = useState("OH");
  const [householdSize, setHouseholdSize] = useState(1);
  const [annualIncome, setAnnualIncome] = useState<number | "">(18000);

  /* exemption checks */
  const [isPregnant, setIsPregnant] = useState(false);
  const [isPostpartum, setIsPostpartum] = useState(false);
  const [hasYoungChild, setHasYoungChild] = useState(false);
  const [caresForDisabled, setCaresForDisabled] = useState(false);
  const [hasDisability, setHasDisability] = useState(false);
  const [hasSUD, setHasSUD] = useState(false);
  const [hasMentalHealth, setHasMentalHealth] = useState(false);
  const [hasSeriousMedical, setHasSeriousMedical] = useState(false);
  const [isVeteranDisabled, setIsVeteranDisabled] = useState(false);
  const [isNativeAmerican, setIsNativeAmerican] = useState(false);
  const [isFormerFoster, setIsFormerFoster] = useState(false);
  const [inSUDTreatment, setInSUDTreatment] = useState(false);
  const [meetsTANForSNAP, setMeetsTANForSNAP] = useState(false);
  const [recentlyIncarcerated, setRecentlyIncarcerated] = useState(false);
  const [currentlyIncarcerated, setCurrentlyIncarcerated] = useState(false);
  const [hasMedicare, setHasMedicare] = useState(false);
  const [earns580, setEarns580] = useState(false);

  /* activities */
  const [activities, setActivities] = useState<Activity[]>([]);

  const [showResults, setShowResults] = useState(false);

  const addActivity = () => {
    setActivities(prev => [...prev, { id: nextId++, type: "employment", hoursPerWeek: 20 }]);
  };
  const removeActivity = (id: number) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  };
  const updateActivity = (id: number, field: keyof Activity, value: string | number) => {
    setActivities(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  };

  /* ── Results ── */
  const result = useMemo(() => {
    const ageNum = typeof age === "number" ? age : 0;
    const incomeNum = typeof annualIncome === "number" ? annualIncome : 0;

    /* Step 1: Is this person in the affected population? */
    const isNonExpansion = stateCode in nonExpansionStates;
    if (isNonExpansion) {
      return { status: "not-applicable" as const, reason: `${allStates[stateCode]} has not expanded Medicaid. The work requirement applies to Medicaid expansion enrollees. You may still be eligible for other Medicaid categories — check with your state Medicaid office.` };
    }

    if (ageNum < 19) {
      return { status: "not-applicable" as const, reason: "The work requirement applies to adults ages 19-64. Children under 19 are not subject to this requirement." };
    }
    if (ageNum > 64) {
      return { status: "not-applicable" as const, reason: "The work requirement applies to adults ages 19-64. Adults 65 and older are not subject to this requirement and may qualify for Medicare or other programs." };
    }

    /* Step 2: Income eligibility for Medicaid expansion */
    const fplThreshold = getFPL(householdSize, stateCode);
    const medicaidLimit = Math.round(fplThreshold * 1.38);
    const incomeEligible = incomeNum <= medicaidLimit;

    if (!incomeEligible) {
      return { status: "over-income" as const, reason: `Your annual income of ${fmt$(incomeNum)} exceeds the Medicaid expansion income limit of ${fmt$(medicaidLimit)} (138% FPL) for a household of ${householdSize} in ${allStates[stateCode]}. You may qualify for subsidized ACA Marketplace coverage instead at Healthcare.gov.`, limit: medicaidLimit };
    }

    /* Step 3: Check exemptions */
    const exemptions: string[] = [];
    if (isPregnant) exemptions.push("Pregnant individuals are exempt from the work requirement.");
    if (isPostpartum) exemptions.push("Individuals receiving postpartum Medicaid coverage (up to 12 months after delivery) are exempt.");
    if (hasYoungChild) exemptions.push("Parents, guardians, or caretaker relatives of a dependent child age 13 or younger are exempt.");
    if (caresForDisabled) exemptions.push("Family caregivers of a disabled individual are exempt.");
    if (hasDisability) exemptions.push("Individuals who are blind, disabled, or have a physical, intellectual, or developmental disability are exempt.");
    if (hasSUD) exemptions.push("Individuals with a substance use disorder are exempt as medically frail.");
    if (hasMentalHealth) exemptions.push("Individuals with a disabling mental disorder or serious mental illness are exempt as medically frail.");
    if (hasSeriousMedical) exemptions.push("Individuals with a serious or complex medical condition are exempt as medically frail.");
    if (isVeteranDisabled) exemptions.push("Disabled veterans with a total disability rating are exempt.");
    if (isNativeAmerican) exemptions.push("American Indians and Alaska Natives recognized by Indian Health Service are exempt.");
    if (isFormerFoster && ageNum < 26) exemptions.push("Former foster care youth under age 26 are exempt.");
    if (inSUDTreatment) exemptions.push("Individuals participating in a qualifying substance abuse treatment program are exempt.");
    if (meetsTANForSNAP) exemptions.push("Individuals already meeting TANF or SNAP work requirements are exempt (cross-program recognition).");
    if (recentlyIncarcerated) exemptions.push("Individuals released from incarceration within the past 90 days are exempt.");
    if (currentlyIncarcerated) exemptions.push("Currently incarcerated individuals are exempt.");
    if (hasMedicare) exemptions.push("Individuals entitled to Medicare Part A or enrolled in Medicare Part B may be exempt. Note: this exemption may be limited in scope — contact your state Medicaid office to confirm.");
    if (earns580) exemptions.push("Individuals earning at least $580/month (equivalent to 80 hours at the federal minimum wage of $7.25/hr) satisfy the requirement through the income-based alternative, regardless of hours worked.");

    if (exemptions.length > 0) {
      return { status: "exempt" as const, exemptions, medicaidLimit };
    }

    /* Step 4: Calculate hours */
    const totalWeekly = activities.reduce((s, a) => s + a.hoursPerWeek, 0);
    const totalMonthly = Math.round(totalWeekly * 4.33);
    const meetsRequirement = totalMonthly >= 80;
    const hoursNeeded = meetsRequirement ? 0 : 80 - totalMonthly;
    const weeklyNeeded = hoursNeeded > 0 ? Math.ceil(hoursNeeded / 4.33) : 0;

    return {
      status: meetsRequirement ? "compliant" as const : "not-compliant" as const,
      totalWeekly,
      totalMonthly,
      hoursNeeded,
      weeklyNeeded,
      medicaidLimit,
    };
  }, [age, stateCode, householdSize, annualIncome, isPregnant, isPostpartum, hasYoungChild, caresForDisabled, hasDisability, hasSUD, hasMentalHealth, hasSeriousMedical, isVeteranDisabled, isNativeAmerican, isFormerFoster, inSUDTreatment, meetsTANForSNAP, recentlyIncarcerated, currentlyIncarcerated, hasMedicare, earns580, activities]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-blue-500 text-base";
  const labelCls = "block text-base text-zinc-200 mb-1.5 font-medium";
  const helpCls = "text-sm text-zinc-400 mt-1";

  return (
    <ToolLayout
      title="Medicaid Work Requirement Calculator"
      description="Check if you are subject to the new Medicaid work requirements under the OBBBA, whether you qualify for an exemption, and how many hours you need. Free, private, no signup."
      slug="medicaid-work-requirement-calculator"
      category="Health"
      keywords={[
        "Medicaid work requirement calculator",
        "Medicaid work requirement checker",
        "Medicaid 80 hours calculator",
        "am I exempt from Medicaid work requirements",
        "Medicaid work requirement exemptions",
        "OBBBA Medicaid work requirement",
        "Medicaid community engagement requirement",
        "Medicaid work requirement hours tracker",
        "do I have to work for Medicaid",
        "Medicaid eligibility work requirement 2026",
        "Medicaid work requirement by state",
      ]}
      faqs={[
        { question: "What is the Medicaid work requirement?", answer: "Under the One Big Beautiful Bill Act (OBBBA), adults ages 19-64 enrolled in Medicaid through the ACA expansion must complete 80 hours per month of qualifying activities such as employment, job training, education, or community service. This takes effect January 1, 2027 for most states, though some states (like Nebraska) are implementing it earlier. Failure to comply can result in loss of Medicaid coverage." },
        { question: "Who is exempt from the Medicaid work requirement?", answer: "Mandatory exemptions include: pregnant individuals, parents/caregivers of children age 13 or younger, caregivers of a disabled person, individuals who are blind, disabled, or medically frail (including those with substance use disorder, serious mental illness, or complex medical conditions), disabled veterans, American Indians/Alaska Natives, former foster youth under 26, those in substance abuse treatment programs, individuals already meeting TANF or SNAP work requirements, those currently incarcerated or released within 90 days, and certain Medicare beneficiaries. Additionally, earning at least $580/month from employment satisfies the requirement through an income-based alternative." },
        { question: "What activities count toward the 80 hours?", answer: "Qualifying activities include: paid employment (part-time or full-time), job training or workforce development programs, enrollment in higher education or career/technical education (at least half-time), community service or volunteering, and participation in a work program. There is also an income-based alternative: earning at least $580/month satisfies the requirement regardless of hours. Caregiving for a child under 13 or a disabled family member qualifies you for an exemption instead. The 80 hours per month works out to about 20 hours per week." },
        { question: "What happens if I do not meet the 80 hours?", answer: "If your state cannot verify your compliance, you receive a notice and have a 30-day cure period to demonstrate compliance or claim an exemption. If you do not respond within 30 days, you will be disenrolled from Medicaid. To regain coverage, you must reapply from scratch. Critically, individuals who lose Medicaid due to work requirement noncompliance are also ineligible for ACA Marketplace premium tax credits, meaning you cannot get subsidized health insurance through Healthcare.gov either." },
        { question: "When does this take effect?", answer: "The federal mandate takes effect January 1, 2027. However, states can implement the requirement earlier. Nebraska began enforcement on May 1, 2026. States were required to begin outreach to notify beneficiaries between June 30 and August 31, 2026. HHS must publish the full interim final rule by June 1, 2026." },
        { question: "Does this apply in every state?", answer: "It applies in all states that have expanded Medicaid (40 states plus DC). The 10 states that have not expanded Medicaid (Alabama, Florida, Georgia, Kansas, Mississippi, South Carolina, Tennessee, Texas, Wisconsin, Wyoming) are not directly affected because they have no Medicaid expansion population. States cannot waive this requirement after January 1, 2027." },
        { question: "Can I lose my healthcare coverage permanently?", answer: "You can lose Medicaid and must reapply. There is no automatic reinstatement. Additionally, the law bars individuals disenrolled for noncompliance from receiving ACA Marketplace premium tax credits, which means you may not be able to get affordable health insurance through any subsidized program until you regain Medicaid eligibility. This makes compliance or claiming an exemption extremely important." },
        { question: "How do I report my hours?", answer: "States must first attempt to verify your compliance through automatic data matching (payroll records, TANF/SNAP records, educational enrollment). If your hours cannot be verified automatically, you may need to self-report. Your state Medicaid office will provide specific reporting instructions. States verify compliance at least every 6 months." },
        { question: "Does part-time work count?", answer: "Yes. Any paid employment counts toward the 80 hours per month, including part-time work. If you work 20 hours per week, you meet the requirement. There is no minimum wage or earnings threshold — only the hours matter." },
        { question: "What if I am in between jobs?", answer: "If you are temporarily unemployed, you can meet the requirement through job training, education (at least half-time), community service, or volunteering. You can combine different qualifying activities to reach 80 hours. If you were recently released from incarceration (within 90 days), you are temporarily exempt." },
      ]}
      relatedTools={[
        { name: "OBBBA Tax Calculator", href: "/tools/obbba-tax-calculator" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
        { name: "Income Tax Calculator", href: "/tools/income-tax-calculator" },
      ]}
      guide={<>
        <h2>Understanding the Medicaid Work Requirement</h2>

        <h3>What Changed</h3>
        <p>The One Big Beautiful Bill Act (OBBBA), signed into law in 2025, added a new work requirement for adults enrolled in Medicaid through the ACA expansion. Starting January 1, 2027, you must complete 80 hours per month of qualifying activities to keep your Medicaid coverage. Some states are implementing this earlier — Nebraska began enforcement in May 2026.</p>

        <h3>Who Is Affected</h3>
        <p>This requirement applies to adults ages 19-64 enrolled in Medicaid through the expansion program (generally those with income up to 138% of the Federal Poverty Level). Approximately 18.5 million people are enrolled in expansion Medicaid nationwide. The Congressional Budget Office estimated that 5.2 million adults could lose coverage by 2034 under the House-passed version of the bill. The enacted law includes larger Medicaid cuts ($911 billion over 10 years), so the actual impact may be higher.</p>

        <h3>What Counts as a Qualifying Activity</h3>
        <p>You can meet the 80-hour requirement through any combination of:</p>
        <ul>
          <li><strong>Paid employment</strong> — Any job, part-time or full-time. There is no minimum wage requirement.</li>
          <li><strong>Job training</strong> — Workforce development programs, apprenticeships, or vocational training.</li>
          <li><strong>Higher education or career/technical education</strong> — Must be enrolled at least half-time.</li>
          <li><strong>Community service</strong> — Volunteering at a nonprofit, faith-based organization, or government program.</li>
        </ul>
        <p>You can mix activities. For example, 10 hours of part-time work per week plus 10 hours of volunteering equals the 80 hours per month. There is also an income-based alternative: earning at least $580 per month (80 hours at the federal minimum wage of $7.25/hr) satisfies the requirement regardless of hours worked.</p>

        <h3>Who Is Exempt</h3>
        <p>Many people are exempt and do not need to meet the 80-hour requirement. Exemptions include:</p>
        <ul>
          <li>Pregnant individuals or those within 12 months postpartum</li>
          <li>Parents or caregivers of a child age 13 or younger</li>
          <li>Caregivers of a disabled family member</li>
          <li>People with disabilities (physical, intellectual, or developmental)</li>
          <li>People with substance use disorder, serious mental illness, or complex medical conditions</li>
          <li>Disabled veterans</li>
          <li>American Indians and Alaska Natives</li>
          <li>Former foster care youth under age 26</li>
          <li>People in substance abuse treatment programs</li>
          <li>People already meeting TANF or SNAP work requirements</li>
          <li>People currently incarcerated or released from incarceration within the past 90 days</li>
          <li>Certain Medicare beneficiaries (scope may be limited — check with your state)</li>
        </ul>

        <h3>What Happens If You Do Not Comply</h3>
        <p>If your state cannot verify that you meet the 80-hour requirement, you will receive a notice. You then have 30 days to prove compliance or claim an exemption. If you do not respond, you will be disenrolled from Medicaid and must reapply from scratch to regain coverage.</p>
        <p><strong>Important:</strong> If you lose Medicaid due to noncompliance with the work requirement, you are also barred from receiving premium tax credits for ACA Marketplace insurance (Healthcare.gov). This means you could be left without any affordable health insurance option.</p>

        <h3>Key Dates</h3>
        <ul>
          <li><strong>June 1, 2026</strong> — HHS publishes full implementation rules</li>
          <li><strong>June 30 - August 31, 2026</strong> — States must conduct outreach to notify you</li>
          <li><strong>January 1, 2027</strong> — Federal work requirement takes effect in all expansion states</li>
          <li><strong>December 31, 2028</strong> — Latest deadline for states granted extensions</li>
        </ul>

        <h3>How to Use This Calculator</h3>
        <ol>
          <li><strong>Enter your basic information</strong> — Your age, state, household size, and annual income. This tells us whether you are in the affected group.</li>
          <li><strong>Check for exemptions</strong> — Go through the exemption checklist. If any apply to you, you do not need to meet the 80-hour requirement. Check every box that applies.</li>
          <li><strong>Add your activities</strong> — If you are not exempt, add your current work, education, training, or volunteering hours. The calculator will tell you if you meet the 80-hour monthly requirement.</li>
          <li><strong>Review your results</strong> — The calculator will show your status: exempt, compliant, or how many more hours you need.</li>
        </ol>
        <p>This tool is for informational purposes only. For official guidance, contact your state Medicaid office or visit <a href="https://www.medicaid.gov" target="_blank" rel="noopener noreferrer">Medicaid.gov</a>.</p>
      </>}
    >
      {/* Important notice */}
      <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl px-5 py-4">
        <p className="text-blue-400 text-base font-medium mb-1">How to Use This Tool</p>
        <p className="text-sm text-zinc-300">Answer the questions below step by step. This calculator will tell you (1) if you are subject to the work requirement, (2) if you qualify for an exemption, and (3) whether your current activities meet the 80-hour monthly requirement. Your information stays on your device — nothing is sent to any server.</p>
      </div>

      {/* ── Step 1: Basic Info ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-1">Step 1: Your Basic Information</h3>
        <p className="text-sm text-zinc-400 mb-4">Enter your age, state, household size, and approximate annual income.</p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Your Age</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value ? +e.target.value : "")}
              className={inputCls}
              min={0}
              max={120}
              placeholder="Enter your age"
            />
          </div>
          <div>
            <label className={labelCls}>Your State</label>
            <select value={stateCode} onChange={e => setStateCode(e.target.value)} className={inputCls}>
              {Object.entries(allStates)
                .sort((a, b) => a[1].localeCompare(b[1]))
                .map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Household Size</label>
            <input
              type="number"
              value={householdSize}
              onChange={e => setHouseholdSize(Math.max(1, +e.target.value))}
              className={inputCls}
              min={1}
              max={20}
            />
            <p className={helpCls}>Include yourself, spouse, and dependents.</p>
          </div>
          <div>
            <label className={labelCls}>Annual Household Income</label>
            <input
              type="number"
              value={annualIncome}
              onChange={e => setAnnualIncome(e.target.value ? +e.target.value : "")}
              className={inputCls}
              min={0}
              placeholder="Enter annual income"
            />
            <p className={helpCls}>Before taxes. Include all household members.</p>
          </div>
        </div>
      </div>

      {/* ── Step 2: Exemptions ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-1">Step 2: Check for Exemptions</h3>
        <p className="text-sm text-zinc-400 mb-4">Check every box that applies to you. If any of these are true, you may be exempt from the work requirement and do not need to complete 80 hours per month.</p>

        <div className="space-y-3">
          {[
            { state: isPregnant, setter: setIsPregnant, label: "I am currently pregnant" },
            { state: isPostpartum, setter: setIsPostpartum, label: "I gave birth within the last 12 months" },
            { state: hasYoungChild, setter: setHasYoungChild, label: "I am a parent, guardian, or caretaker of a child age 13 or younger" },
            { state: caresForDisabled, setter: setCaresForDisabled, label: "I am a family caregiver for a person with a disability" },
            { state: hasDisability, setter: setHasDisability, label: "I am blind, disabled, or have a physical, intellectual, or developmental disability" },
            { state: hasSUD, setter: setHasSUD, label: "I have a substance use disorder" },
            { state: hasMentalHealth, setter: setHasMentalHealth, label: "I have a serious mental illness or disabling mental health condition" },
            { state: hasSeriousMedical, setter: setHasSeriousMedical, label: "I have a serious or complex medical condition" },
            { state: isVeteranDisabled, setter: setIsVeteranDisabled, label: "I am a disabled veteran with a total disability rating" },
            { state: isNativeAmerican, setter: setIsNativeAmerican, label: "I am American Indian or Alaska Native recognized by Indian Health Service" },
            { state: isFormerFoster, setter: setIsFormerFoster, label: "I was in foster care and am under age 26" },
            { state: inSUDTreatment, setter: setInSUDTreatment, label: "I am currently in a substance abuse treatment and rehabilitation program" },
            { state: meetsTANForSNAP, setter: setMeetsTANForSNAP, label: "I already meet TANF or SNAP work requirements" },
            { state: recentlyIncarcerated, setter: setRecentlyIncarcerated, label: "I was released from incarceration within the past 90 days" },
            { state: currentlyIncarcerated, setter: setCurrentlyIncarcerated, label: "I am currently incarcerated" },
            { state: hasMedicare, setter: setHasMedicare, label: "I am enrolled in Medicare Part A or Part B" },
            { state: earns580, setter: setEarns580, label: "I earn at least $580 per month from employment (income-based alternative)" },
          ].map(({ state, setter, label }) => (
            <label key={label} className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={state}
                onChange={e => setter(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500 flex-shrink-0"
              />
              <span className="text-base text-zinc-300 group-hover:text-zinc-100 transition-colors">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* ── Step 3: Activities ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-1">Step 3: Your Activities</h3>
        <p className="text-sm text-zinc-400 mb-4">If no exemptions apply, add your qualifying activities below. You need at least 80 hours per month (about 20 hours per week) of work, education, job training, or community service.</p>

        {activities.length > 0 && (
          <div className="space-y-3 mb-4">
            {activities.map(a => (
              <div key={a.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm text-zinc-400 mb-1 block">Activity Type</label>
                  <select
                    value={a.type}
                    onChange={e => updateActivity(a.id, "type", e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100"
                  >
                    {activityTypes.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="w-32">
                  <label className="text-sm text-zinc-400 mb-1 block">Hours / Week</label>
                  <input
                    type="number"
                    value={a.hoursPerWeek}
                    onChange={e => updateActivity(a.id, "hoursPerWeek", Math.max(0, Math.min(80, +e.target.value)))}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-base text-zinc-100 text-center"
                    min={0}
                    max={80}
                  />
                </div>
                <button
                  onClick={() => removeActivity(a.id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors text-xl mt-5"
                  aria-label="Remove activity"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={addActivity}
          className="bg-blue-600 hover:bg-blue-500 text-white text-base font-medium rounded-lg px-5 py-2.5 transition-colors"
        >
          + Add Activity
        </button>
      </div>

      {/* ── Check My Status button ── */}
      <button
        onClick={() => setShowResults(true)}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white text-lg font-semibold rounded-xl px-6 py-4 transition-colors mb-6"
      >
        Check My Status
      </button>

      {/* ── Results ── */}
      {showResults && (
        <div className="space-y-4">
          {result.status === "not-applicable" && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">&#9898;</span>
                <div>
                  <h3 className="text-xl font-semibold text-zinc-100 mb-2">Not Applicable to You</h3>
                  <p className="text-base text-zinc-300">{result.reason}</p>
                </div>
              </div>
            </div>
          )}

          {result.status === "over-income" && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">&#128309;</span>
                <div>
                  <h3 className="text-xl font-semibold text-zinc-100 mb-2">Over Income Limit for Medicaid Expansion</h3>
                  <p className="text-base text-zinc-300">{result.reason}</p>
                </div>
              </div>
            </div>
          )}

          {result.status === "exempt" && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">&#9989;</span>
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-2">You Appear to Be Exempt</h3>
                  <p className="text-base text-zinc-300 mb-3">Based on your answers, you qualify for one or more exemptions from the Medicaid work requirement. You do not need to complete 80 hours per month.</p>
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-zinc-200">Your exemption(s):</p>
                    {result.exemptions.map((e, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">&#10003;</span>
                        <p className="text-sm text-zinc-300">{e}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-500/20">
                <p className="text-sm text-zinc-400"><strong>Important:</strong> Keep documentation of your exempt status. When your state contacts you about the work requirement (expected between June 30 - August 31, 2026), respond promptly and claim your exemption. Failing to respond — even if you are exempt — could result in disenrollment.</p>
              </div>
            </div>
          )}

          {result.status === "compliant" && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">&#9989;</span>
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-2">You Meet the Requirement</h3>
                  <p className="text-base text-zinc-300 mb-3">
                    Your qualifying activities total approximately <strong>{result.totalWeekly} hours per week</strong> ({result.totalMonthly} hours per month). The requirement is 80 hours per month. You are compliant.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-green-500/20">
                <p className="text-sm text-zinc-400"><strong>Important:</strong> Your state will verify your hours through data matching (payroll records) or may ask you to self-report. Keep records of your work hours, volunteer logs, or enrollment verification. Respond to all notices from your state Medicaid office promptly.</p>
              </div>
            </div>
          )}

          {result.status === "not-compliant" && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">&#9888;&#65039;</span>
                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-2">You Do Not Currently Meet the Requirement</h3>
                  <p className="text-base text-zinc-300 mb-3">
                    Your qualifying activities total approximately <strong>{result.totalWeekly} hours per week</strong> ({result.totalMonthly} hours per month). You need <strong>{result.hoursNeeded} more hours per month</strong> (about {result.weeklyNeeded} more hours per week) to meet the 80-hour requirement.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-red-500/20 space-y-3">
                <p className="text-base font-semibold text-zinc-200">What You Can Do:</p>
                <ul className="space-y-2 text-sm text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">1.</span>
                    <span><strong>Review exemptions above carefully.</strong> Many people qualify for an exemption without realizing it. If you have any physical or mental health condition, care for a child under 13, or care for a disabled family member, you may be exempt.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">2.</span>
                    <span><strong>Add community service hours.</strong> Volunteering at a nonprofit, food bank, church, or community organization counts toward the 80 hours. You need about {result.weeklyNeeded} additional hours per week.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">3.</span>
                    <span><strong>Enroll in education or job training.</strong> Half-time enrollment in a degree or certificate program counts. Many community colleges and workforce programs are free for Medicaid enrollees.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">4.</span>
                    <span><strong>Respond to every notice from your state.</strong> If you receive a noncompliance notice, you have 30 days to demonstrate compliance or claim an exemption. Do not ignore it — ignoring it results in disenrollment.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-0.5 flex-shrink-0">5.</span>
                    <span><strong>Contact your state Medicaid office</strong> or visit Medicaid.gov or contact your state Medicaid office for help understanding your options. Many states have navigators who can help you find qualifying activities or claim exemptions.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 pt-4 border-t border-red-500/20">
                <p className="text-sm text-zinc-400"><strong>Warning:</strong> If you are disenrolled from Medicaid for not meeting the work requirement, you will also be ineligible for premium tax credits on the ACA Marketplace (Healthcare.gov). This means you could be left without affordable health insurance. Take action before the requirement takes effect in your state.</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-zinc-100 mb-3">Key Dates to Know</h3>
            <div className="space-y-3">
              {[
                { date: "June 1, 2026", event: "HHS publishes full implementation rules and guidance", past: false },
                { date: "June 30 – Aug 31, 2026", event: "Your state must notify you about the work requirement", past: false },
                { date: "January 1, 2027", event: "Work requirement takes effect in all expansion states", past: false },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-zinc-200">{item.date}</p>
                    <p className="text-sm text-zinc-400">{item.event}</p>
                  </div>
                </div>
              ))}
              {stateCode === "NE" && (
                <div className="flex gap-3 items-start">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-orange-400">May 1, 2026 — Nebraska</p>
                    <p className="text-sm text-zinc-400">Nebraska is enforcing the work requirement early, starting May 1, 2026.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <p className="text-sm text-zinc-400">
              <strong className="text-zinc-300">Disclaimer:</strong> This tool provides general guidance based on the OBBBA as enacted. HHS has not yet published the full interim final rule (due June 1, 2026), which may clarify definitions and add detail to exemptions. State implementation may vary. This is not legal or medical advice. For official guidance, contact your state Medicaid office, visit Medicaid.gov or contact your state Medicaid office, or visit <a href="https://www.medicaid.gov" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">Medicaid.gov</a>.
            </p>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

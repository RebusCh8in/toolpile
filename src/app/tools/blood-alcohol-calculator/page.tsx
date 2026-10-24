"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

type Sex = "male" | "female";
type WeightUnit = "lb" | "kg";
type DrinkType = "beer" | "wine" | "spirits" | "custom";

interface DrinkPreset {
  label: string;
  oz: number;
  abv: number;
  description: string;
}

const DRINK_PRESETS: Record<DrinkType, DrinkPreset> = {
  beer: { label: "Beer", oz: 12, abv: 0.05, description: "12 oz, 5% ABV" },
  wine: { label: "Wine", oz: 5, abv: 0.12, description: "5 oz, 12% ABV" },
  spirits: { label: "Spirits", oz: 1.5, abv: 0.40, description: "1.5 oz, 40% ABV" },
  custom: { label: "Custom", oz: 12, abv: 0.05, description: "Set your own" },
};

const IMPAIRMENT_LEVELS = [
  { max: 0.02, label: "Sober / Minimal Effect", color: "text-green-400", bg: "bg-green-500", description: "Little to no impairment. You may feel slightly relaxed." },
  { max: 0.04, label: "Mildly Relaxed", color: "text-green-300", bg: "bg-green-400", description: "Slight sense of well-being and relaxation. Minimal impairment of reasoning and memory." },
  { max: 0.06, label: "Buzzed", color: "text-yellow-400", bg: "bg-yellow-500", description: "Feelings of warmth and relaxation. Minor impairment of reasoning, lowered inhibitions." },
  { max: 0.08, label: "Impaired", color: "text-yellow-500", bg: "bg-yellow-600", description: "Reduced coordination, impaired judgment and reasoning. At or near the legal driving limit in most states." },
  { max: 0.10, label: "Legally Intoxicated", color: "text-orange-400", bg: "bg-orange-500", description: "Clear deterioration of reaction time and control. Slurred speech likely. Illegal to drive in all US states." },
  { max: 0.15, label: "Very Intoxicated", color: "text-orange-500", bg: "bg-orange-600", description: "Significant impairment of motor control. Blurred vision, major loss of balance, and vomiting may occur." },
  { max: 0.20, label: "Severely Impaired", color: "text-red-400", bg: "bg-red-500", description: "Disorientation and confusion. Difficulty standing or walking. Nausea is common." },
  { max: 0.30, label: "Dangerous", color: "text-red-500", bg: "bg-red-600", description: "Potential for blackout. Severely impaired motor and mental functions. Risk of loss of consciousness." },
  { max: Infinity, label: "Life-Threatening", color: "text-red-600", bg: "bg-red-700", description: "Risk of alcohol poisoning, coma, respiratory failure, and death. Seek emergency medical help immediately." },
];

const LEGAL_LIMITS = [
  { label: "Standard driving limit (most US states)", limit: 0.08, color: "text-orange-400" },
  { label: "Commercial drivers (CDL)", limit: 0.04, color: "text-yellow-400" },
  { label: "Under 21 / Zero tolerance states", limit: 0.02, color: "text-green-400" },
  { label: "USDOT safety-sensitive employees", limit: 0.04, color: "text-yellow-400" },
];

function getImpairmentLevel(bac: number) {
  return IMPAIRMENT_LEVELS.find((l) => bac < l.max) ?? IMPAIRMENT_LEVELS[IMPAIRMENT_LEVELS.length - 1];
}

function bacToPercent(bac: number): number {
  return Math.min(100, Math.max(0, (bac / 0.40) * 100));
}

function getGaugeColor(bac: number): string {
  if (bac < 0.02) return "from-green-500 to-green-600";
  if (bac < 0.06) return "from-green-500 to-yellow-500";
  if (bac < 0.08) return "from-yellow-500 to-yellow-600";
  if (bac < 0.10) return "from-orange-500 to-orange-600";
  if (bac < 0.15) return "from-orange-600 to-red-500";
  return "from-red-500 to-red-700";
}

export default function Page() {
  const [sex, setSex] = useState<Sex>("male");
  const [weightUnit, setWeightUnit] = useState<WeightUnit>("lb");
  const [weight, setWeight] = useState(180);
  const [drinkCount, setDrinkCount] = useState(3);
  const [drinkType, setDrinkType] = useState<DrinkType>("beer");
  const [customOz, setCustomOz] = useState(12);
  const [customAbv, setCustomAbv] = useState(5);
  const [drinkingHours, setDrinkingHours] = useState(2);
  const [hoursSinceLast, setHoursSinceLast] = useState(0);

  const result = useMemo(() => {
    const preset = DRINK_PRESETS[drinkType];
    const oz = drinkType === "custom" ? customOz : preset.oz;
    const abv = drinkType === "custom" ? customAbv / 100 : preset.abv;

    // Alcohol in grams: volume (oz) * ABV * 29.5735 (ml/oz) * 0.789 (g/ml ethanol)
    const alcoholGramsPerDrink = oz * abv * 29.5735 * 0.789;
    const totalAlcoholGrams = alcoholGramsPerDrink * drinkCount;

    // Body weight in grams
    const weightGrams = (weightUnit === "lb" ? weight * 453.592 : weight * 1000);

    // Widmark ratio
    const r = sex === "male" ? 0.68 : 0.55;

    // Total hours = drinking period + hours since last drink
    const totalHours = drinkingHours + hoursSinceLast;

    // BAC = (alcohol g / (body weight g * r)) - (0.015 * hours)
    const rawBac = (totalAlcoholGrams / (weightGrams * r)) - (0.015 * totalHours);
    const bac = Math.max(0, rawBac);

    // Time until sober: BAC / 0.015 (average elimination rate per hour)
    const hoursUntilSober = bac > 0 ? bac / 0.015 : 0;

    const impairment = getImpairmentLevel(bac);

    // Standard drinks equivalent
    const standardDrinks = totalAlcoholGrams / 14; // 14g = 1 US standard drink

    return {
      bac,
      hoursUntilSober,
      impairment,
      totalAlcoholGrams,
      standardDrinks,
      alcoholGramsPerDrink,
    };
  }, [sex, weightUnit, weight, drinkCount, drinkType, customOz, customAbv, drinkingHours, hoursSinceLast]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const btnActive = "bg-blue-600 text-white";
  const btnInactive = "bg-zinc-800 text-zinc-400 hover:bg-zinc-700";

  return (
    <ToolLayout
      title="Blood Alcohol Calculator"
      description="Estimate your Blood Alcohol Content (BAC) using the Widmark formula. Enter your weight, sex, drink details, and time to get an approximate BAC level with impairment descriptions."
      slug="blood-alcohol-calculator"
      category="Health"
      keywords={[
        "blood alcohol calculator",
        "bac calculator",
        "blood alcohol content calculator",
        "alcohol calculator",
        "drink calculator",
        "bac estimator",
        "widmark formula calculator",
        "how many drinks to reach 0.08",
        "alcohol impairment calculator",
        "time until sober calculator",
      ]}
      faqs={[
        {
          question: "How does the Widmark formula calculate BAC?",
          answer: "The Widmark formula estimates BAC as: BAC = (alcohol consumed in grams / (body weight in grams x Widmark r factor)) - (0.015 x hours since drinking). The Widmark r factor accounts for body water distribution differences between sexes (0.68 for men, 0.55 for women). The 0.015 rate represents the average hourly alcohol elimination rate.",
        },
        {
          question: "What is a 'standard drink' in the US?",
          answer: "A US standard drink contains approximately 14 grams (0.6 fluid ounces) of pure alcohol. This equals about 12 oz of regular beer (5% ABV), 5 oz of wine (12% ABV), or 1.5 oz of distilled spirits (40% ABV / 80 proof). Many cocktails and craft beers contain more alcohol than one standard drink.",
        },
        {
          question: "How accurate is this BAC calculator?",
          answer: "This calculator provides a rough estimate only. Actual BAC varies based on many factors not accounted for here, including food consumption, medications, liver health, hydration, individual metabolism, genetics, and body composition. Two people of the same weight and sex can have very different BACs after the same number of drinks. Never rely on a calculator to determine if you are safe to drive.",
        },
        {
          question: "What BAC level is considered legally drunk for driving?",
          answer: "In the United States, the legal limit for driving is 0.08% BAC for drivers aged 21 and over in all 50 states. Commercial drivers (CDL holders) have a lower limit of 0.04%. Drivers under age 21 face zero-tolerance laws, typically 0.00-0.02% depending on the state. Many countries have lower limits, such as 0.05% in Australia and most of Europe.",
        },
        {
          question: "How long does it take for alcohol to leave your system?",
          answer: "On average, the body eliminates alcohol at a rate of about 0.015% BAC per hour, which is roughly equivalent to one standard drink per hour. However, this rate varies between individuals. A person with a BAC of 0.08% would take approximately 5.3 hours to reach 0.00%. There is no way to speed up this process; coffee, cold showers, and exercise do not reduce BAC faster.",
        },
        {
          question: "Why does body weight affect BAC?",
          answer: "Alcohol distributes through body water. Larger people generally have more body water to dilute the alcohol, resulting in a lower BAC from the same amount of alcohol. This is also why the Widmark factor differs by sex: men typically have a higher percentage of body water (68%) compared to women (55%), meaning women generally reach a higher BAC from the same amount of alcohol at the same body weight.",
        },
        {
          question: "Can I use this calculator to know if I am safe to drive?",
          answer: "No. This calculator is for educational and informational purposes only. It provides rough estimates that can be significantly different from your actual BAC. Impairment can occur well below the legal limit. The only safe amount of alcohol before driving is zero. If you have consumed any alcohol, use a designated driver, rideshare, or taxi.",
        },
      ]}
      relatedTools={[
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
        { name: "BMR Calculator", href: "/tools/bmr-calculator" },
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "Body Fat Calculator", href: "/tools/body-fat-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">How to Use the Blood Alcohol Calculator</h2>
            <p className="text-zinc-400 leading-relaxed">
              Select your biological sex, enter your body weight (toggle between pounds and kilograms), choose the type and number of drinks you have consumed, and specify how long you were drinking and how much time has passed since your last drink. The calculator instantly estimates your BAC using the Widmark formula and shows your impairment level, legal standing, and estimated time until sober.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Understanding the Widmark Formula</h2>
            <p className="text-zinc-400 leading-relaxed">
              Developed by Swedish professor Erik Widmark in the 1930s, the Widmark formula remains the standard for estimating BAC. It accounts for the total grams of alcohol consumed, body weight, a sex-based distribution ratio (the &quot;r&quot; factor), and the time-based elimination rate. While more sophisticated pharmacokinetic models exist, the Widmark formula provides a practical approximation used in both clinical and forensic settings.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Important Limitations</h2>
            <p className="text-zinc-400 leading-relaxed">
              BAC estimation has inherent limitations. This tool does not account for food in the stomach (which slows absorption), medications (which can amplify impairment), individual metabolic differences, liver health, or tolerance. The elimination rate of 0.015% per hour is an average and can range from 0.010% to 0.020% across individuals. Always err on the side of caution.
            </p>
          </section>
        </div>
      }
    >
      {/* Disclaimer banner */}
      <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-yellow-500 text-lg mt-0.5">&#9888;</span>
          <div>
            <p className="text-sm font-semibold text-yellow-400 mb-1">Educational Purposes Only</p>
            <p className="text-xs text-yellow-400/80 leading-relaxed">
              This calculator provides rough BAC estimates and must not be used to determine if you are fit to drive or operate machinery. Actual BAC depends on many individual factors not captured here. Impairment can occur at any BAC level. <strong className="text-yellow-400">Never drink and drive.</strong> If you have consumed any alcohol, use a designated driver, rideshare, or taxi.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column: inputs */}
        <div className="space-y-4">
          {/* Sex */}
          <div>
            <label className={labelCls}>Biological Sex</label>
            <div className="flex gap-2">
              {(["male", "female"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSex(s)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${sex === s ? btnActive : btnInactive}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Weight */}
          <div>
            <label className={labelCls}>Body Weight</label>
            <div className="flex gap-2 mb-2">
              {(["lb", "kg"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => {
                    if (u !== weightUnit) {
                      setWeight(u === "kg" ? Math.round(weight * 0.453592) : Math.round(weight / 0.453592));
                      setWeightUnit(u);
                    }
                  }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${weightUnit === u ? btnActive : btnInactive}`}
                >
                  {u}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(Math.max(0, +e.target.value))}
              className={inputCls}
              min={1}
              max={weightUnit === "lb" ? 600 : 300}
              step={1}
            />
          </div>

          {/* Drink type */}
          <div>
            <label className={labelCls}>Type of Drink</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(DRINK_PRESETS) as DrinkType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setDrinkType(t)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${drinkType === t ? btnActive : btnInactive}`}
                >
                  <span className="block">{DRINK_PRESETS[t].label}</span>
                  <span className="block text-xs opacity-70">{DRINK_PRESETS[t].description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom drink fields */}
          {drinkType === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Drink Size (oz)</label>
                <input
                  type="number"
                  value={customOz}
                  onChange={(e) => setCustomOz(Math.max(0, +e.target.value))}
                  className={inputCls}
                  min={0.5}
                  max={64}
                  step={0.5}
                />
              </div>
              <div>
                <label className={labelCls}>ABV (%)</label>
                <input
                  type="number"
                  value={customAbv}
                  onChange={(e) => setCustomAbv(Math.max(0, Math.min(100, +e.target.value)))}
                  className={inputCls}
                  min={0.1}
                  max={100}
                  step={0.1}
                />
              </div>
            </div>
          )}

          {/* Number of drinks */}
          <div>
            <label className={labelCls}>Number of Drinks</label>
            <input
              type="number"
              value={drinkCount}
              onChange={(e) => setDrinkCount(Math.max(0, +e.target.value))}
              className={inputCls}
              min={0}
              max={30}
              step={0.5}
            />
          </div>

          {/* Time inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Hours Spent Drinking</label>
              <input
                type="number"
                value={drinkingHours}
                onChange={(e) => setDrinkingHours(Math.max(0, +e.target.value))}
                className={inputCls}
                min={0}
                max={24}
                step={0.25}
              />
            </div>
            <div>
              <label className={labelCls}>Hours Since Last Drink</label>
              <input
                type="number"
                value={hoursSinceLast}
                onChange={(e) => setHoursSinceLast(Math.max(0, +e.target.value))}
                className={inputCls}
                min={0}
                max={48}
                step={0.25}
              />
            </div>
          </div>
        </div>

        {/* Right column: results */}
        <div className="space-y-4">
          {/* BAC display */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Estimated BAC</p>
            <p className={`text-5xl font-bold tabular-nums ${result.impairment.color}`}>
              {result.bac.toFixed(3)}%
            </p>
            <p className={`text-lg font-medium mt-1 ${result.impairment.color}`}>
              {result.impairment.label}
            </p>
            <p className="text-xs text-zinc-500 mt-2">{result.impairment.description}</p>
          </div>

          {/* BAC gauge */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-3">BAC Level Gauge</p>

            {/* Multi-color bar */}
            <div className="relative">
              <div className="flex rounded-full overflow-hidden h-5 mb-1">
                <div className="bg-green-500 w-[10%]" title="0.00-0.04" />
                <div className="bg-green-400 w-[10%]" title="0.04-0.06" />
                <div className="bg-yellow-500 w-[10%]" title="0.06-0.08" />
                <div className="bg-orange-500 w-[10%]" title="0.08-0.10" />
                <div className="bg-orange-600 w-[15%]" title="0.10-0.15" />
                <div className="bg-red-500 w-[15%]" title="0.15-0.20" />
                <div className="bg-red-600 w-[15%]" title="0.20-0.30" />
                <div className="bg-red-700 w-[15%]" title="0.30+" />
              </div>

              {/* Indicator arrow */}
              <div className="relative h-4">
                <div
                  className="absolute top-0 transform -translate-x-1/2 transition-all duration-300"
                  style={{ left: `${Math.min(97, Math.max(3, bacToPercent(result.bac)))}%` }}
                >
                  <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[7px] border-l-transparent border-r-transparent border-t-white" />
                </div>
              </div>

              {/* Scale labels */}
              <div className="flex justify-between text-[10px] text-zinc-600 px-0.5">
                <span>0.00</span>
                <span>0.08</span>
                <span>0.15</span>
                <span>0.30+</span>
              </div>
            </div>
          </div>

          {/* Time until sober */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500">Estimated Time Until Sober</p>
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">
                  {result.bac <= 0 ? (
                    "Sober"
                  ) : (
                    <>
                      {Math.floor(result.hoursUntilSober)}h {Math.round((result.hoursUntilSober % 1) * 60)}m
                    </>
                  )}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Standard Drinks</p>
                <p className="text-2xl font-bold text-zinc-100 tabular-nums">
                  {result.standardDrinks.toFixed(1)}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-zinc-600 mt-2">Based on avg. elimination rate of 0.015% BAC/hour</p>
          </div>

          {/* Legal limits */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-3">Legal Limits Comparison</p>
            <div className="space-y-2">
              {LEGAL_LIMITS.map((l) => {
                const over = result.bac >= l.limit;
                return (
                  <div key={l.label} className="flex items-center justify-between text-sm gap-2">
                    <span className="text-zinc-400 text-xs leading-tight">{l.label}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-mono text-xs ${l.color}`}>{l.limit.toFixed(2)}%</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${over ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>
                        {over ? "OVER" : "UNDER"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Drink comparison table */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Standard Drink Reference</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400 text-left">
                <th className="px-3 py-2">Drink Type</th>
                <th className="px-3 py-2">Serving Size</th>
                <th className="px-3 py-2">ABV</th>
                <th className="px-3 py-2">Pure Alcohol</th>
                <th className="px-3 py-2">Standard Drinks</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: "Regular Beer", oz: "12 oz (355 ml)", abv: "5%", grams: "14g", std: "1.0" },
                { name: "Light Beer", oz: "12 oz (355 ml)", abv: "4.2%", grams: "11.8g", std: "0.8" },
                { name: "Craft / IPA", oz: "12 oz (355 ml)", abv: "7-9%", grams: "20-25g", std: "1.4-1.8" },
                { name: "Wine", oz: "5 oz (148 ml)", abv: "12%", grams: "14g", std: "1.0" },
                { name: "Fortified Wine", oz: "3.5 oz (103 ml)", abv: "17%", grams: "14g", std: "1.0" },
                { name: "Spirits (shot)", oz: "1.5 oz (44 ml)", abv: "40%", grams: "14g", std: "1.0" },
                { name: "Cocktail (mixed)", oz: "varies", abv: "varies", grams: "14-28g", std: "1-2+" },
              ].map((d) => (
                <tr key={d.name} className="border-t border-zinc-800 text-zinc-300">
                  <td className="px-3 py-1.5 font-medium">{d.name}</td>
                  <td className="px-3 py-1.5">{d.oz}</td>
                  <td className="px-3 py-1.5">{d.abv}</td>
                  <td className="px-3 py-1.5">{d.grams}</td>
                  <td className="px-3 py-1.5">{d.std}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impairment levels reference */}
      <div className="mt-4 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">BAC Impairment Levels</h3>
        <div className="space-y-2">
          {IMPAIRMENT_LEVELS.filter((l) => l.max !== Infinity).map((l, i) => {
            const prev = i === 0 ? 0 : IMPAIRMENT_LEVELS[i - 1].max;
            const isActive = result.bac >= prev && result.bac < l.max;
            return (
              <div
                key={l.label}
                className={`flex items-start gap-3 rounded-lg p-2.5 transition-colors ${isActive ? "bg-zinc-700/50 ring-1 ring-zinc-600" : ""}`}
              >
                <span className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${l.bg}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-sm font-medium ${isActive ? l.color : "text-zinc-300"}`}>
                      {l.label}
                    </span>
                    <span className="text-xs text-zinc-600">
                      {prev.toFixed(2)}% &ndash; {l.max < Infinity ? l.max.toFixed(2) + "%" : "+"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{l.description}</p>
                </div>
              </div>
            );
          })}
          {/* Life-threatening */}
          <div
            className={`flex items-start gap-3 rounded-lg p-2.5 transition-colors ${result.bac >= 0.30 ? "bg-zinc-700/50 ring-1 ring-zinc-600" : ""}`}
          >
            <span className="w-3 h-3 rounded-full mt-0.5 shrink-0 bg-red-700" />
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-medium ${result.bac >= 0.30 ? "text-red-600" : "text-zinc-300"}`}>
                  Life-Threatening
                </span>
                <span className="text-xs text-zinc-600">0.30%+</span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                Risk of alcohol poisoning, coma, respiratory failure, and death. Seek emergency medical help immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="mt-6 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <p className="text-xs text-zinc-500 leading-relaxed">
          <strong className="text-zinc-400">Disclaimer:</strong> This Blood Alcohol Content (BAC) calculator is provided for educational and informational purposes only. Results are approximate estimates based on the Widmark formula and do not account for individual variations in metabolism, food intake, medications, tolerance, liver function, or other factors. This tool should never be used to determine whether you are safe to drive, operate machinery, or engage in any activity that could be impaired by alcohol. The only guaranteed safe level of alcohol consumption before driving is zero. Always designate a sober driver, use rideshare services, or call a taxi if you have consumed any amount of alcohol.
        </p>
      </div>
    </ToolLayout>
  );
}

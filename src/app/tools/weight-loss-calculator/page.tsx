"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ── helpers ───────────────────────────────────────────────── */
function fmt(n: number) {
  return Math.round(n).toLocaleString();
}
function fmtDec(n: number, d = 1) {
  return n.toFixed(d);
}

/* ── constants ─────────────────────────────────────────────── */
const activityLevels = [
  { label: "Sedentary", desc: "Little or no exercise, desk job", factor: 1.2 },
  { label: "Lightly Active", desc: "Light exercise 1-3 days/week", factor: 1.375 },
  { label: "Moderately Active", desc: "Moderate exercise 3-5 days/week", factor: 1.55 },
  { label: "Very Active", desc: "Hard exercise 6-7 days/week", factor: 1.725 },
  { label: "Extremely Active", desc: "Athlete / physical labor + exercise", factor: 1.9 },
];

const deficitRates = [
  { label: "0.5 lb/week", lbPerWeek: 0.5, deficitPerDay: 250 },
  { label: "1 lb/week", lbPerWeek: 1.0, deficitPerDay: 500 },
  { label: "1.5 lb/week", lbPerWeek: 1.5, deficitPerDay: 750 },
  { label: "2 lb/week", lbPerWeek: 2.0, deficitPerDay: 1000 },
];

/* ── component ─────────────────────────────────────────────── */
export default function Page() {
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [sex, setSex] = useState<"male" | "female">("male");
  const [age, setAge] = useState(30);

  // Imperial inputs
  const [weightLb, setWeightLb] = useState(200);
  const [goalLb, setGoalLb] = useState(170);
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(10);

  // Metric inputs
  const [weightKg, setWeightKg] = useState(91);
  const [goalKg, setGoalKg] = useState(77);
  const [heightCm, setHeightCm] = useState(178);

  const [activity, setActivity] = useState(2);

  /* ── calculations ──────────────────────────────────────── */
  const result = useMemo(() => {
    let wKg: number, hCm: number, currentLb: number, goalLbVal: number;

    if (unit === "imperial") {
      wKg = weightLb * 0.453592;
      hCm = (feet * 12 + inches) * 2.54;
      currentLb = weightLb;
      goalLbVal = goalLb;
    } else {
      wKg = weightKg;
      hCm = heightCm;
      currentLb = weightKg * 2.20462;
      goalLbVal = goalKg * 2.20462;
    }

    // Mifflin-St Jeor BMR
    const bmr =
      sex === "male"
        ? 10 * wKg + 6.25 * hCm - 5 * age + 5
        : 10 * wKg + 6.25 * hCm - 5 * age - 161;

    const tdee = bmr * activityLevels[activity].factor;
    const weightToLose = currentLb - goalLbVal;
    const needsLoss = weightToLose > 0;

    // Minimum safe calorie floors
    const minCalories = sex === "male" ? 1500 : 1200;

    // Calculate plans for each deficit rate
    const plans = deficitRates.map((rate) => {
      const dailyCals = Math.round(tdee - rate.deficitPerDay);
      const weeks = needsLoss ? Math.ceil(weightToLose / rate.lbPerWeek) : 0;
      const isBelowMin = dailyCals < minCalories;
      const safeCals = Math.max(dailyCals, minCalories);

      // Macro suggestions at the safe calorie level (30% protein, 35% carbs, 35% fat)
      const proteinCals = safeCals * 0.3;
      const carbsCals = safeCals * 0.35;
      const fatCals = safeCals * 0.35;

      return {
        ...rate,
        dailyCals,
        safeCals,
        weeks,
        months: +(weeks / 4.33).toFixed(1),
        isBelowMin,
        protein: Math.round(proteinCals / 4),
        carbs: Math.round(carbsCals / 4),
        fat: Math.round(fatCals / 9),
      };
    });

    // Timeline data points (weight at each week) for the visual chart
    // Use the 1 lb/week rate as primary timeline
    const primaryPlan = plans[1]; // 1 lb/week
    const timelineWeeks = primaryPlan.weeks;
    const timelinePoints: { week: number; weight: number }[] = [];
    const step = Math.max(1, Math.floor(timelineWeeks / 12));
    for (let w = 0; w <= timelineWeeks; w += step) {
      timelinePoints.push({
        week: w,
        weight: currentLb - w * primaryPlan.lbPerWeek,
      });
    }
    // Ensure last point is goal
    if (timelinePoints.length > 0 && timelinePoints[timelinePoints.length - 1].week !== timelineWeeks) {
      timelinePoints.push({ week: timelineWeeks, weight: goalLbVal });
    }

    return {
      bmr,
      tdee,
      weightToLose,
      needsLoss,
      currentLb,
      goalLbVal,
      minCalories,
      plans,
      timelinePoints,
      timelineWeeks,
    };
  }, [unit, sex, age, weightLb, goalLb, feet, inches, weightKg, goalKg, heightCm, activity]);

  /* ── styles ────────────────────────────────────────────── */
  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  /* ── chart helpers ─────────────────────────────────────── */
  const chartH = 200;
  const chartW = 500;
  const padL = 50;
  const padR = 16;
  const padT = 16;
  const padB = 32;
  const innerW = chartW - padL - padR;
  const innerH = chartH - padT - padB;

  const pts = result.timelinePoints;
  const maxWeek = pts.length > 1 ? pts[pts.length - 1].week : 1;
  const minWeight = result.goalLbVal - 5;
  const maxWeight = result.currentLb + 5;
  const weightRange = maxWeight - minWeight || 1;

  function toX(week: number) {
    return padL + (week / maxWeek) * innerW;
  }
  function toY(w: number) {
    return padT + ((maxWeight - w) / weightRange) * innerH;
  }

  const polyline = pts.map((p) => `${toX(p.week)},${toY(p.weight)}`).join(" ");
  const areaPath =
    pts.length > 1
      ? `M${toX(pts[0].week)},${toY(pts[0].weight)} ` +
        pts.slice(1).map((p) => `L${toX(p.week)},${toY(p.weight)}`).join(" ") +
        ` L${toX(pts[pts.length - 1].week)},${padT + innerH} L${toX(pts[0].week)},${padT + innerH} Z`
      : "";

  // Y-axis labels (5 ticks)
  const yTicks: number[] = [];
  for (let i = 0; i <= 4; i++) {
    yTicks.push(Math.round(minWeight + (weightRange * i) / 4));
  }

  // X-axis labels (up to 6 ticks)
  const xTickCount = Math.min(6, maxWeek);
  const xTicks: number[] = [];
  for (let i = 0; i <= xTickCount; i++) {
    xTicks.push(Math.round((maxWeek * i) / xTickCount));
  }

  /* ── any warnings? ─────────────────────────────────────── */
  const hasWarning = result.plans.some((p) => p.isBelowMin);

  return (
    <ToolLayout
      title="Weight Loss Calculator"
      description="Calculate how long it will take to reach your goal weight. Get personalized calorie targets, macro breakdowns, and a visual timeline based on your BMR, TDEE, and activity level."
      slug="weight-loss-calculator"
      category="Health"
      keywords={[
        "weight loss calculator",
        "how long to lose weight",
        "weight loss timeline",
        "calorie calculator for weight loss",
        "weight loss planner",
        "weight loss calorie deficit",
        "goal weight calculator",
        "how many calories to lose weight",
        "weight loss projection",
        "safe weight loss rate",
      ]}
      faqs={[
        {
          question: "How does this weight loss calculator work?",
          answer:
            "This calculator uses the Mifflin-St Jeor equation to estimate your Basal Metabolic Rate (BMR), then multiplies by an activity factor to find your Total Daily Energy Expenditure (TDEE). It then subtracts calorie deficits of 250, 500, 750, and 1,000 calories per day to show you how quickly you can reach your goal weight at each rate. One pound of body fat equals roughly 3,500 calories, so a 500-calorie daily deficit leads to about 1 pound lost per week.",
        },
        {
          question: "What is a safe rate of weight loss?",
          answer:
            "Most health professionals recommend losing 1 to 2 pounds per week for sustainable, healthy weight loss. Losing more than 2 pounds per week over a long period can lead to muscle loss, nutritional deficiencies, gallstones, and metabolic slowdown. The calculator warns you if a deficit would put your daily intake below 1,200 calories (women) or 1,500 calories (men), which is generally considered the minimum safe intake without medical supervision.",
        },
        {
          question: "What is the Mifflin-St Jeor equation?",
          answer:
            "The Mifflin-St Jeor equation is the most widely recommended formula for estimating Basal Metabolic Rate (BMR). For men: BMR = 10 x weight(kg) + 6.25 x height(cm) - 5 x age - 5. For women: BMR = 10 x weight(kg) + 6.25 x height(cm) - 5 x age - 161. Studies show it predicts actual resting metabolic rate within 10% for most people, making it more accurate than the older Harris-Benedict equation.",
        },
        {
          question: "Why does my weight loss slow down over time?",
          answer:
            "As you lose weight your body requires fewer calories to maintain itself, which means your TDEE decreases. This is called metabolic adaptation. A calorie deficit that initially caused 2 lb/week of loss may only produce 1 lb/week after significant weight loss. To continue losing at the same rate you would need to either reduce calories further or increase physical activity. This calculator uses your current weight for the estimate, so recalculate periodically as you progress.",
        },
        {
          question: "How should I split my macros for weight loss?",
          answer:
            "For weight loss, higher protein intake helps preserve muscle mass and keeps you feeling full. A common recommendation is 30% of calories from protein, 35% from carbohydrates, and 35% from fat. This calculator provides macro targets in grams for each deficit level. Protein and carbs each provide 4 calories per gram, while fat provides 9 calories per gram. Adjust the ratio based on your preferences and how your body responds.",
        },
        {
          question: "Is it safe to eat below 1,200 or 1,500 calories?",
          answer:
            "Going below 1,200 calories per day (women) or 1,500 calories per day (men) for extended periods is generally not recommended without medical supervision. Very low calorie diets can cause nutrient deficiencies, muscle loss, fatigue, hair loss, and metabolic adaptation that makes future weight loss harder. If the calculator shows your target falls below these thresholds, consider a more moderate deficit combined with increased physical activity.",
        },
      ]}
      relatedTools={[
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "TDEE Calculator", href: "/tools/tdee-calculator" },
        { name: "Calorie Deficit Calculator", href: "/tools/calorie-deficit-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
        { name: "Macro Calculator", href: "/tools/macro-calculator" },
        { name: "Body Fat Calculator", href: "/tools/body-fat-calculator" },
        { name: "Ideal Weight Calculator", href: "/tools/ideal-weight-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">How to Use the Weight Loss Calculator</h2>
            <p className="text-zinc-400 leading-relaxed">
              Enter your current weight, goal weight, height, age, sex, and activity level. The calculator instantly
              shows your BMR, TDEE, and personalized calorie targets for four different weight loss rates. The timeline
              chart visualizes your projected weight over time so you can set realistic expectations and choose a pace
              that fits your lifestyle.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">Understanding Your Results</h2>
            <p className="text-zinc-400 leading-relaxed">
              <strong className="text-zinc-200">BMR</strong> is the number of calories your body burns at complete rest.{" "}
              <strong className="text-zinc-200">TDEE</strong> adds your activity calories on top of BMR and represents
              your maintenance intake. To lose weight, you eat below your TDEE. Each plan card shows the daily calorie
              target, estimated timeline in weeks, and a macro breakdown. Plans flagged with a warning would put you
              below the recommended minimum daily intake.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">Tips for Sustainable Weight Loss</h2>
            <ul className="list-disc list-inside text-zinc-400 space-y-1.5 leading-relaxed">
              <li>Track your food intake consistently for the most accurate results.</li>
              <li>Weigh yourself at the same time each day and use weekly averages to track trends.</li>
              <li>Prioritize protein to preserve lean muscle mass during a deficit.</li>
              <li>Combine diet changes with resistance training for body composition improvements.</li>
              <li>Recalculate every 10-15 pounds lost, since your calorie needs decrease as you lose weight.</li>
              <li>Aim for 1 lb/week if you have under 30 lbs to lose, or up to 2 lb/week if you have significantly more.</li>
            </ul>
          </section>
        </div>
      }
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── LEFT: Inputs ──────────────────────────────── */}
        <div className="space-y-4">
          {/* Unit toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setUnit("imperial")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unit === "imperial" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
            >
              Imperial (lb / ft)
            </button>
            <button
              onClick={() => setUnit("metric")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unit === "metric" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
            >
              Metric (kg / cm)
            </button>
          </div>

          {/* Sex toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setSex("male")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${sex === "male" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
            >
              Male
            </button>
            <button
              onClick={() => setSex("female")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${sex === "female" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}
            >
              Female
            </button>
          </div>

          {/* Age */}
          <div>
            <label className={labelCls}>Age</label>
            <input type="number" value={age} onChange={(e) => setAge(+e.target.value)} className={inputCls} min={15} max={100} />
          </div>

          {/* Weight / Goal / Height */}
          {unit === "imperial" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Current Weight (lbs)</label>
                  <input type="number" value={weightLb} onChange={(e) => setWeightLb(+e.target.value)} className={inputCls} min={50} max={1000} />
                </div>
                <div>
                  <label className={labelCls}>Goal Weight (lbs)</label>
                  <input type="number" value={goalLb} onChange={(e) => setGoalLb(+e.target.value)} className={inputCls} min={50} max={1000} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Feet</label>
                  <input type="number" value={feet} onChange={(e) => setFeet(+e.target.value)} className={inputCls} min={3} max={8} />
                </div>
                <div>
                  <label className={labelCls}>Inches</label>
                  <input type="number" value={inches} onChange={(e) => setInches(+e.target.value)} className={inputCls} min={0} max={11} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Current Weight (kg)</label>
                  <input type="number" value={weightKg} onChange={(e) => setWeightKg(+e.target.value)} className={inputCls} min={20} max={500} />
                </div>
                <div>
                  <label className={labelCls}>Goal Weight (kg)</label>
                  <input type="number" value={goalKg} onChange={(e) => setGoalKg(+e.target.value)} className={inputCls} min={20} max={500} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Height (cm)</label>
                <input type="number" value={heightCm} onChange={(e) => setHeightCm(+e.target.value)} className={inputCls} min={100} max={250} />
              </div>
            </>
          )}

          {/* Activity level */}
          <div>
            <label className={labelCls}>Activity Level</label>
            <div className="space-y-2">
              {activityLevels.map((al, i) => (
                <button
                  key={i}
                  onClick={() => setActivity(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    activity === i
                      ? "bg-blue-600/20 border border-blue-500/30 text-blue-300"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  <span className="font-medium">{al.label}</span>
                  <span className="text-xs text-zinc-500 ml-2">{al.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Results ─────────────────────────────── */}
        <div className="space-y-4">
          {/* Hero stat: TDEE */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Maintenance Calories (TDEE)</p>
            <p className="text-5xl font-bold text-blue-400">{fmt(result.tdee)}</p>
            <p className="text-xs text-zinc-500 mt-1">BMR: {fmt(result.bmr)} cal/day</p>
          </div>

          {/* Weight to lose summary */}
          {result.needsLoss ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Weight to Lose</p>
                <p className="text-lg font-semibold text-zinc-100">
                  {unit === "imperial"
                    ? `${fmt(result.weightToLose)} lbs`
                    : `${fmtDec(result.weightToLose / 2.20462)} kg`}
                </p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Fastest Safe Rate</p>
                <p className="text-lg font-semibold text-green-400">
                  ~{fmt(result.plans[1].weeks)} weeks
                </p>
                <p className="text-xs text-zinc-500">at 1 lb/week</p>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-900/30 border border-emerald-700 rounded-lg p-4 text-sm text-emerald-300">
              Your goal weight is at or above your current weight. Adjust your goal to see weight loss projections.
            </div>
          )}

          {/* Safety warning */}
          {hasWarning && result.needsLoss && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 flex gap-3">
              <span className="text-red-400 text-lg shrink-0">!</span>
              <div className="text-sm text-red-300 leading-relaxed">
                <p className="font-medium mb-1">Safety Warning</p>
                <p>
                  One or more deficit levels would put your daily intake below{" "}
                  <strong>{fmt(result.minCalories)} calories</strong> (the recommended minimum for{" "}
                  {sex === "male" ? "men" : "women"}). Plans below this threshold are flagged. Do not follow a very low
                  calorie diet without medical supervision.
                </p>
              </div>
            </div>
          )}

          {/* Plan cards */}
          {result.needsLoss && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-zinc-800 text-sm font-semibold text-zinc-300">
                Weight Loss Plans
              </div>
              <div className="divide-y divide-zinc-800">
                {result.plans.map((plan) => (
                  <div
                    key={plan.label}
                    className={`px-4 py-3 ${plan.isBelowMin ? "bg-red-950/20" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-200">{plan.label}</span>
                        {plan.isBelowMin && (
                          <span className="text-[10px] font-medium bg-red-900/60 text-red-300 px-1.5 py-0.5 rounded">
                            BELOW MIN
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-zinc-500">
                        {plan.weeks} weeks ({plan.months} mo)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <span className={`text-lg font-bold ${plan.isBelowMin ? "text-red-400" : "text-blue-400"}`}>
                          {fmt(plan.safeCals)}
                        </span>
                        <span className="text-xs text-zinc-500 ml-1">cal/day</span>
                        {plan.isBelowMin && (
                          <span className="text-xs text-red-400 ml-2">(capped from {fmt(plan.dailyCals)})</span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 text-right">
                        <span className="text-zinc-400">P:</span> {plan.protein}g{" "}
                        <span className="text-zinc-400">C:</span> {plan.carbs}g{" "}
                        <span className="text-zinc-400">F:</span> {plan.fat}g
                      </div>
                    </div>
                    {/* Mini progress bar showing deficit proportion */}
                    <div className="mt-2 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${plan.isBelowMin ? "bg-red-500" : "bg-blue-500"}`}
                        style={{ width: `${Math.max(5, (plan.safeCals / result.tdee) * 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1 text-[10px] text-zinc-600">
                      <span>0</span>
                      <span>TDEE: {fmt(result.tdee)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Macro breakdown detail */}
          {result.needsLoss && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
              <div className="px-4 py-3 bg-zinc-800 text-sm font-semibold text-zinc-300">
                Macro Breakdown (at 1 lb/week)
              </div>
              <div className="p-4">
                {(() => {
                  const plan = result.plans[1]; // 1 lb/week
                  const totalG = plan.protein + plan.carbs + plan.fat;
                  const pPct = Math.round((plan.protein / totalG) * 100);
                  const cPct = Math.round((plan.carbs / totalG) * 100);
                  const fPct = 100 - pPct - cPct;
                  return (
                    <>
                      {/* Stacked bar */}
                      <div className="flex h-6 rounded-lg overflow-hidden mb-4">
                        <div className="bg-blue-500 flex items-center justify-center text-[10px] font-medium text-white" style={{ width: `${pPct}%` }}>
                          {pPct}%
                        </div>
                        <div className="bg-emerald-500 flex items-center justify-center text-[10px] font-medium text-white" style={{ width: `${cPct}%` }}>
                          {cPct}%
                        </div>
                        <div className="bg-amber-500 flex items-center justify-center text-[10px] font-medium text-white" style={{ width: `${fPct}%` }}>
                          {fPct}%
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="w-3 h-3 rounded-full bg-blue-500 mx-auto mb-1" />
                          <p className="text-lg font-bold text-zinc-100">{plan.protein}g</p>
                          <p className="text-xs text-zinc-500">Protein</p>
                          <p className="text-xs text-zinc-600">{plan.protein * 4} cal</p>
                        </div>
                        <div>
                          <div className="w-3 h-3 rounded-full bg-emerald-500 mx-auto mb-1" />
                          <p className="text-lg font-bold text-zinc-100">{plan.carbs}g</p>
                          <p className="text-xs text-zinc-500">Carbs</p>
                          <p className="text-xs text-zinc-600">{plan.carbs * 4} cal</p>
                        </div>
                        <div>
                          <div className="w-3 h-3 rounded-full bg-amber-500 mx-auto mb-1" />
                          <p className="text-lg font-bold text-zinc-100">{plan.fat}g</p>
                          <p className="text-xs text-zinc-500">Fat</p>
                          <p className="text-xs text-zinc-600">{plan.fat * 9} cal</p>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── FULL-WIDTH: Timeline Chart ──────────────────── */}
      {result.needsLoss && pts.length > 1 && (
        <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">
            Projected Weight Loss Timeline (at 1 lb/week)
          </h3>
          <div className="w-full overflow-x-auto">
            <svg viewBox={`0 0 ${chartW} ${chartH}`} className="w-full h-auto min-w-[320px]" preserveAspectRatio="xMidYMid meet">
              {/* Grid lines */}
              {yTicks.map((t) => (
                <g key={t}>
                  <line x1={padL} y1={toY(t)} x2={chartW - padR} y2={toY(t)} stroke="#3f3f46" strokeWidth={0.5} />
                  <text x={padL - 6} y={toY(t) + 4} textAnchor="end" fill="#71717a" fontSize={10}>
                    {t}
                  </text>
                </g>
              ))}
              {xTicks.map((t) => (
                <g key={t}>
                  <line x1={toX(t)} y1={padT} x2={toX(t)} y2={padT + innerH} stroke="#3f3f46" strokeWidth={0.5} />
                  <text x={toX(t)} y={chartH - 6} textAnchor="middle" fill="#71717a" fontSize={10}>
                    W{t}
                  </text>
                </g>
              ))}

              {/* Goal line */}
              <line
                x1={padL}
                y1={toY(result.goalLbVal)}
                x2={chartW - padR}
                y2={toY(result.goalLbVal)}
                stroke="#22c55e"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <text x={chartW - padR + 2} y={toY(result.goalLbVal) + 3} fill="#22c55e" fontSize={9}>
                Goal
              </text>

              {/* Area fill */}
              <path d={areaPath} fill="url(#areaGradient)" />
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.02} />
                </linearGradient>
              </defs>

              {/* Line */}
              <polyline points={polyline} fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

              {/* Dots */}
              {pts.map((p, i) => (
                <circle key={i} cx={toX(p.week)} cy={toY(p.weight)} r={3} fill="#3b82f6" stroke="#1e293b" strokeWidth={1.5} />
              ))}

              {/* Start & end labels */}
              <text x={toX(pts[0].week)} y={toY(pts[0].weight) - 10} textAnchor="start" fill="#e4e4e7" fontSize={10} fontWeight="bold">
                {Math.round(pts[0].weight)} {unit === "imperial" ? "lb" : "kg"}
              </text>
              {pts.length > 1 && (
                <text
                  x={toX(pts[pts.length - 1].week)}
                  y={toY(pts[pts.length - 1].weight) - 10}
                  textAnchor="end"
                  fill="#22c55e"
                  fontSize={10}
                  fontWeight="bold"
                >
                  {Math.round(pts[pts.length - 1].weight)} {unit === "imperial" ? "lb" : "kg"}
                </text>
              )}

              {/* Axis labels */}
              <text x={padL - 6} y={8} textAnchor="end" fill="#a1a1aa" fontSize={9}>
                {unit === "imperial" ? "lbs" : "kg"}
              </text>
              <text x={chartW - padR} y={chartH - 2} textAnchor="end" fill="#a1a1aa" fontSize={9}>
                Weeks
              </text>
            </svg>
          </div>

          {/* Summary row below chart */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            {result.plans.map((plan) => (
              <div key={plan.label} className="bg-zinc-800 rounded-lg p-2.5">
                <p className="text-xs text-zinc-500 mb-0.5">{plan.label}</p>
                <p className="text-sm font-semibold text-zinc-100">{plan.weeks} weeks</p>
                <p className="text-[10px] text-zinc-500">{plan.months} months</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Comparison table ────────────────────────────── */}
      {result.needsLoss && (
        <div className="mt-6 bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-zinc-800 text-sm font-semibold text-zinc-300">
            Plan Comparison
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-400 text-left border-b border-zinc-700">
                  <th className="px-4 py-2.5 font-medium">Rate</th>
                  <th className="px-4 py-2.5 font-medium">Calories/Day</th>
                  <th className="px-4 py-2.5 font-medium">Deficit</th>
                  <th className="px-4 py-2.5 font-medium">Timeline</th>
                  <th className="px-4 py-2.5 font-medium">Protein</th>
                  <th className="px-4 py-2.5 font-medium">Carbs</th>
                  <th className="px-4 py-2.5 font-medium">Fat</th>
                </tr>
              </thead>
              <tbody>
                {result.plans.map((plan) => (
                  <tr
                    key={plan.label}
                    className={`border-b border-zinc-800 ${plan.isBelowMin ? "text-red-300" : "text-zinc-300"} ${plan.lbPerWeek === 1 ? "bg-blue-600/5" : ""}`}
                  >
                    <td className="px-4 py-2.5 font-medium whitespace-nowrap">
                      {plan.label}
                      {plan.lbPerWeek === 1 && (
                        <span className="ml-1.5 text-[10px] bg-blue-600/30 text-blue-300 px-1.5 py-0.5 rounded">
                          RECOMMENDED
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 font-semibold">{fmt(plan.safeCals)}</td>
                    <td className="px-4 py-2.5 text-zinc-500">-{fmt(plan.deficitPerDay)}/day</td>
                    <td className="px-4 py-2.5">{plan.weeks} wk ({plan.months} mo)</td>
                    <td className="px-4 py-2.5">{plan.protein}g</td>
                    <td className="px-4 py-2.5">{plan.carbs}g</td>
                    <td className="px-4 py-2.5">{plan.fat}g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}

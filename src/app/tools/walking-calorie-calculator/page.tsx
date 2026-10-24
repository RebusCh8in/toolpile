"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmt(n: number, decimals = 0) {
  return decimals > 0 ? n.toFixed(decimals) : Math.round(n).toLocaleString();
}

const speedPresets = [
  { label: "Slow", mph: 2.0, met: 2.8 },
  { label: "Moderate", mph: 3.0, met: 3.5 },
  { label: "Brisk", mph: 3.5, met: 4.3 },
  { label: "Fast", mph: 4.0, met: 5.0 },
  { label: "Power Walking", mph: 4.5, met: 7.0 },
];

// MET adjustments per % incline (approximate additive increase)
function getInclineMET(baseMET: number, grade: number): number {
  // Each 1% grade adds roughly 0.2 MET for walking speeds
  return baseMET + grade * 0.2;
}

// Interpolate MET for arbitrary speed
function getMETForSpeed(mph: number): number {
  if (mph <= speedPresets[0].mph) return speedPresets[0].met;
  if (mph >= speedPresets[speedPresets.length - 1].mph) return speedPresets[speedPresets.length - 1].met;
  for (let i = 0; i < speedPresets.length - 1; i++) {
    if (mph >= speedPresets[i].mph && mph <= speedPresets[i + 1].mph) {
      const ratio = (mph - speedPresets[i].mph) / (speedPresets[i + 1].mph - speedPresets[i].mph);
      return speedPresets[i].met + ratio * (speedPresets[i + 1].met - speedPresets[i].met);
    }
  }
  return 3.5;
}

// Steps per mile based on height/stride. Average ~2,000 steps/mile at moderate pace.
function stepsPerMile(mph: number): number {
  // Faster pace = longer stride = fewer steps per mile
  if (mph <= 2.0) return 2400;
  if (mph <= 3.0) return 2100;
  if (mph <= 3.5) return 2000;
  if (mph <= 4.0) return 1900;
  return 1800;
}

const comparisonSpeeds = [2.0, 2.5, 3.0, 3.5, 4.0, 4.5];
const comparisonDurations = [15, 30, 45, 60, 90];

export default function Page() {
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [weightLbs, setWeightLbs] = useState(170);
  const [weightKgInput, setWeightKgInput] = useState(77);
  const [inputMode, setInputMode] = useState<"duration" | "distance">("duration");
  const [duration, setDuration] = useState(30);
  const [distance, setDistance] = useState(1.5);
  const [speedPreset, setSpeedPreset] = useState(2); // brisk
  const [customSpeed, setCustomSpeed] = useState(3.5);
  const [useCustomSpeed, setUseCustomSpeed] = useState(false);
  const [incline, setIncline] = useState(0);

  const result = useMemo(() => {
    const weightKg = unit === "imperial" ? weightLbs * 0.453592 : weightKgInput;
    const speedMph = useCustomSpeed ? customSpeed : speedPresets[speedPreset].mph;
    const speedKmh = speedMph * 1.60934;

    // Get base MET then adjust for incline
    const baseMET = useCustomSpeed ? getMETForSpeed(speedMph) : speedPresets[speedPreset].met;
    const met = getInclineMET(baseMET, incline);

    // Calculate duration in hours
    let timeHours: number;
    if (inputMode === "duration") {
      timeHours = duration / 60;
    } else {
      const distMiles = unit === "imperial" ? distance : distance / 1.60934;
      timeHours = distMiles / speedMph;
    }
    const timeMinutes = timeHours * 60;

    // Calories = MET x weight(kg) x time(hours)
    const totalCalories = met * weightKg * timeHours;
    const caloriesPerMinute = totalCalories / timeMinutes;

    const distanceMiles = speedMph * timeHours;
    const distanceKm = distanceMiles * 1.60934;
    const caloriesPerMile = totalCalories / distanceMiles;
    const caloriesPerKm = totalCalories / distanceKm;

    // Steps
    const spm = stepsPerMile(speedMph);
    const totalSteps = spm * distanceMiles;

    // Weekly/monthly projection
    const weeklyCalories = totalCalories * 7;
    const monthlyCalories = totalCalories * 30;
    const weeklyLbs = weeklyCalories / 3500; // 3500 cal = 1 lb

    return {
      totalCalories,
      caloriesPerMinute,
      caloriesPerMile,
      caloriesPerKm,
      totalSteps,
      distanceMiles,
      distanceKm,
      timeMinutes,
      met,
      speedMph,
      speedKmh,
      weightKg,
      weeklyCalories,
      monthlyCalories,
      weeklyLbs,
    };
  }, [unit, weightLbs, weightKgInput, inputMode, duration, distance, speedPreset, customSpeed, useCustomSpeed, incline]);

  // Comparison table data
  const comparisonData = useMemo(() => {
    const weightKg = unit === "imperial" ? weightLbs * 0.453592 : weightKgInput;
    return comparisonSpeeds.map((mph) => {
      const met = getInclineMET(getMETForSpeed(mph), incline);
      return {
        mph,
        kmh: mph * 1.60934,
        durations: comparisonDurations.map((mins) => {
          return Math.round(met * weightKg * (mins / 60));
        }),
      };
    });
  }, [unit, weightLbs, weightKgInput, incline]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const toggleCls = (active: boolean) =>
    `flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${active ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`;

  return (
    <ToolLayout
      title="Walking Calorie Calculator"
      description="Calculate how many calories you burn walking based on your weight, speed, duration, distance, and incline. Uses MET-based formulas for accurate estimates."
      slug="walking-calorie-calculator"
      category="Health"
      keywords={[
        "walking calorie calculator",
        "calories burned walking",
        "walking calories per mile",
        "walking exercise calculator",
        "how many calories does walking burn",
        "walking weight loss calculator",
        "steps calorie calculator",
      ]}
      faqs={[
        {
          question: "How many calories does walking 1 mile burn?",
          answer:
            "A general estimate is that walking 1 mile burns about 80-100 calories for a 150-170 lb person at a moderate pace (3 mph). However, the exact number depends on your weight, speed, and terrain. Heavier individuals burn more calories per mile, and walking uphill significantly increases calorie expenditure. Use this calculator with your specific details for a personalized estimate.",
        },
        {
          question: "How does walking speed affect calories burned?",
          answer:
            "Walking faster burns more calories per minute because it requires more energy. A brisk walk at 3.5 mph has a MET value of about 4.3, while a slow stroll at 2 mph has a MET of 2.8 — meaning brisk walking burns roughly 50% more calories per minute. Power walking at 4.5 mph can burn more than double the calories of a slow walk in the same time.",
        },
        {
          question: "Does walking uphill burn more calories?",
          answer:
            "Yes, walking on an incline significantly increases calorie burn. Walking up a 5% grade can burn 30-40% more calories than walking on flat ground at the same speed. A steep 10-15% incline can nearly double your calorie expenditure. This calculator adjusts the MET value based on your selected incline grade.",
        },
        {
          question: "How accurate is the MET formula for walking calories?",
          answer:
            "The MET (Metabolic Equivalent of Task) formula — Calories = MET x weight(kg) x time(hours) — is the standard method used by exercise physiologists and is reasonably accurate for most people. Individual variation of 10-20% is normal due to differences in fitness level, walking efficiency, and body composition. It provides a reliable estimate for tracking and planning purposes.",
        },
        {
          question: "How many steps are in a mile of walking?",
          answer:
            "The average person takes about 2,000 steps per mile at a moderate walking pace. This varies by stride length, which depends on height, leg length, and walking speed. At a slow pace you may take 2,400 steps per mile, while power walking may require only 1,800 steps. This calculator estimates steps based on your walking speed.",
        },
        {
          question: "Can walking help with weight loss?",
          answer:
            "Walking is one of the most effective and sustainable forms of exercise for weight loss. A 170 lb person walking briskly for 30 minutes daily burns about 175 calories per session, totaling roughly 1,225 calories per week — equivalent to about 0.35 lbs of fat. Combined with a moderate calorie deficit from diet, daily walking can support steady, healthy weight loss of 1-2 lbs per week.",
        },
      ]}
      relatedTools={[
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
        { name: "TDEE Calculator", href: "/tools/tdee-calculator" },
        { name: "Body Fat Calculator", href: "/tools/body-fat-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-zinc-100">How the Walking Calorie Calculator Works</h2>
          <p className="text-zinc-400">
            This calculator uses MET (Metabolic Equivalent of Task) values to estimate calorie burn during walking.
            The formula is: <strong className="text-zinc-200">Calories = MET x body weight (kg) x time (hours)</strong>.
            MET values represent the energy cost of an activity relative to resting. Sitting quietly has a MET of 1.0,
            while brisk walking at 3.5 mph has a MET of about 4.3 — meaning it burns 4.3 times more energy than resting.
          </p>
          <p className="text-zinc-400">
            Incline walking increases the MET value because your muscles work harder to propel you uphill.
            Even a modest 3-5% grade makes a noticeable difference in calorie expenditure, which is why
            treadmill incline walking and hill walking are popular for fitness and weight management.
          </p>
          <p className="text-zinc-400">
            The step estimates are based on average stride lengths at different speeds. At a moderate pace,
            most adults take approximately 2,000 steps per mile. Tracking steps alongside calories gives you
            a more complete picture of your walking activity.
          </p>
        </div>
      }
    >
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Unit toggle */}
          <div className="flex gap-2">
            <button onClick={() => setUnit("imperial")} className={toggleCls(unit === "imperial")}>Imperial (lb/mi)</button>
            <button onClick={() => setUnit("metric")} className={toggleCls(unit === "metric")}>Metric (kg/km)</button>
          </div>

          {/* Weight */}
          <div>
            <label className={labelCls}>{unit === "imperial" ? "Body Weight (lbs)" : "Body Weight (kg)"}</label>
            {unit === "imperial" ? (
              <input type="number" value={weightLbs} onChange={(e) => setWeightLbs(+e.target.value)} className={inputCls} min={50} max={500} />
            ) : (
              <input type="number" value={weightKgInput} onChange={(e) => setWeightKgInput(+e.target.value)} className={inputCls} min={20} max={250} />
            )}
          </div>

          {/* Duration vs Distance toggle */}
          <div>
            <label className={labelCls}>Input By</label>
            <div className="flex gap-2">
              <button onClick={() => setInputMode("duration")} className={toggleCls(inputMode === "duration")}>Duration</button>
              <button onClick={() => setInputMode("distance")} className={toggleCls(inputMode === "distance")}>Distance</button>
            </div>
          </div>

          {inputMode === "duration" ? (
            <div>
              <label className={labelCls}>Walking Duration (minutes)</label>
              <input type="number" value={duration} onChange={(e) => setDuration(+e.target.value)} className={inputCls} min={1} max={600} />
            </div>
          ) : (
            <div>
              <label className={labelCls}>{unit === "imperial" ? "Distance (miles)" : "Distance (km)"}</label>
              <input type="number" value={distance} onChange={(e) => setDistance(+e.target.value)} className={inputCls} min={0.1} max={100} step={0.1} />
            </div>
          )}

          {/* Speed */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm text-zinc-400">Walking Speed</label>
              <button
                onClick={() => setUseCustomSpeed(!useCustomSpeed)}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                {useCustomSpeed ? "Use presets" : "Custom speed"}
              </button>
            </div>
            {useCustomSpeed ? (
              <div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={customSpeed}
                    onChange={(e) => setCustomSpeed(+e.target.value)}
                    className={inputCls}
                    min={1}
                    max={6}
                    step={0.1}
                  />
                  <span className="text-sm text-zinc-500 whitespace-nowrap">{unit === "imperial" ? "mph" : `mph (${fmt(customSpeed * 1.60934, 1)} km/h)`}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {speedPresets.map((sp, i) => (
                  <button
                    key={i}
                    onClick={() => setSpeedPreset(i)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      speedPreset === i
                        ? "bg-blue-600/20 border border-blue-500/30 text-blue-300"
                        : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                    }`}
                  >
                    <span className="font-medium">{sp.label}</span>
                    <span className="text-xs text-zinc-500 ml-2">
                      {sp.mph} mph / {fmt(sp.mph * 1.60934, 1)} km/h
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Incline */}
          <div>
            <label className={labelCls}>Incline / Grade: {incline}%</label>
            <input
              type="range"
              min={0}
              max={15}
              value={incline}
              onChange={(e) => setIncline(+e.target.value)}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-zinc-600 mt-1">
              <span>Flat (0%)</span>
              <span>Steep (15%)</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Main result */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Total Calories Burned</p>
            <p className="text-5xl font-bold text-blue-400">{fmt(result.totalCalories)}</p>
            <p className="text-xs text-zinc-500 mt-2">
              {fmt(result.timeMinutes)} min &middot; {fmt(result.distanceMiles, 2)} mi ({fmt(result.distanceKm, 2)} km)
              {incline > 0 && ` \u00b7 ${incline}% grade`}
            </p>
          </div>

          {/* Detailed breakdown */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 text-sm font-semibold text-zinc-300">Breakdown</div>
            <div className="divide-y divide-zinc-800">
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-zinc-400">Calories per minute</span>
                <span className="text-zinc-200 font-medium">{fmt(result.caloriesPerMinute, 1)}</span>
              </div>
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-zinc-400">Calories per mile</span>
                <span className="text-zinc-200 font-medium">{fmt(result.caloriesPerMile)}</span>
              </div>
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-zinc-400">Calories per km</span>
                <span className="text-zinc-200 font-medium">{fmt(result.caloriesPerKm)}</span>
              </div>
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-zinc-400">MET value</span>
                <span className="text-zinc-200 font-medium">{fmt(result.met, 1)}</span>
              </div>
            </div>
          </div>

          {/* Steps estimate */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 text-sm font-semibold text-zinc-300">Steps Estimate</div>
            <div className="px-4 py-3 text-center">
              <p className="text-3xl font-bold text-green-400">{fmt(result.totalSteps)}</p>
              <p className="text-xs text-zinc-500 mt-1">estimated steps</p>
            </div>
          </div>

          {/* Weekly projection */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 text-sm font-semibold text-zinc-300">
              Daily Walking Projection
            </div>
            <div className="divide-y divide-zinc-800">
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-zinc-400">Per week (7 days)</span>
                <span className="text-yellow-400 font-medium">{fmt(result.weeklyCalories)} cal</span>
              </div>
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-zinc-400">Per month (30 days)</span>
                <span className="text-yellow-400 font-medium">{fmt(result.monthlyCalories)} cal</span>
              </div>
              <div className="flex justify-between px-4 py-2 text-sm">
                <span className="text-zinc-400">Equiv. fat loss / week</span>
                <span className="text-green-400 font-medium">{fmt(result.weeklyLbs, 2)} lbs</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-zinc-200 mb-3">Calories Burned by Speed and Duration</h3>
        <p className="text-sm text-zinc-500 mb-4">
          Based on your weight ({unit === "imperial" ? `${weightLbs} lbs` : `${weightKgInput} kg`})
          {incline > 0 && ` at ${incline}% incline`}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-800">
                <th className="text-left px-3 py-2 text-zinc-400 font-medium border border-zinc-700">Speed</th>
                {comparisonDurations.map((d) => (
                  <th key={d} className="text-center px-3 py-2 text-zinc-400 font-medium border border-zinc-700">
                    {d} min
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((row) => (
                <tr key={row.mph} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-3 py-2 text-zinc-300 font-medium border border-zinc-700 whitespace-nowrap">
                    {row.mph} mph
                    <span className="text-zinc-600 text-xs ml-1">({fmt(row.kmh, 1)} km/h)</span>
                  </td>
                  {row.durations.map((cal, i) => (
                    <td key={i} className="text-center px-3 py-2 text-zinc-200 border border-zinc-700">
                      {cal}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  );
}

"use client";
import { useState, useMemo, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ── Activity data with MET values ──────────────────────────── */

interface Activity {
  name: string;
  met: number;
}

interface Category {
  label: string;
  activities: Activity[];
}

const categories: Category[] = [
  {
    label: "Running",
    activities: [
      { name: "Running — 5 mph (12 min/mi)", met: 8.3 },
      { name: "Running — 6 mph (10 min/mi)", met: 9.8 },
      { name: "Running — 7 mph (8.5 min/mi)", met: 11.0 },
      { name: "Running — 8 mph (7.5 min/mi)", met: 11.8 },
      { name: "Running — 9 mph (6.7 min/mi)", met: 12.8 },
      { name: "Running — 10 mph (6 min/mi)", met: 14.5 },
    ],
  },
  {
    label: "Walking",
    activities: [
      { name: "Walking — 2 mph (slow)", met: 2.8 },
      { name: "Walking — 3 mph (moderate)", met: 3.5 },
      { name: "Walking — 3.5 mph (brisk)", met: 4.3 },
      { name: "Walking — 4 mph (very brisk)", met: 5.0 },
      { name: "Walking — uphill", met: 6.0 },
    ],
  },
  {
    label: "Cycling",
    activities: [
      { name: "Cycling — 10 mph (leisure)", met: 6.8 },
      { name: "Cycling — 12 mph (moderate)", met: 8.0 },
      { name: "Cycling — 14 mph (vigorous)", met: 10.0 },
      { name: "Cycling — 16 mph (fast)", met: 12.0 },
      { name: "Cycling — 20 mph (racing)", met: 15.8 },
    ],
  },
  {
    label: "Swimming",
    activities: [
      { name: "Swimming — leisurely", met: 6.0 },
      { name: "Swimming — moderate", met: 8.3 },
      { name: "Swimming — vigorous", met: 9.8 },
    ],
  },
  {
    label: "Sports",
    activities: [
      { name: "Basketball", met: 6.5 },
      { name: "Soccer", met: 7.0 },
      { name: "Tennis", met: 7.3 },
      { name: "Volleyball", met: 4.0 },
    ],
  },
  {
    label: "Gym",
    activities: [
      { name: "Weight training", met: 3.5 },
      { name: "HIIT", met: 8.0 },
      { name: "Yoga", met: 3.0 },
      { name: "Elliptical", met: 5.0 },
      { name: "Rowing machine", met: 7.0 },
      { name: "Jump rope", met: 12.3 },
    ],
  },
  {
    label: "Daily Activities",
    activities: [
      { name: "Housework", met: 3.5 },
      { name: "Gardening", met: 5.0 },
      { name: "Cooking", met: 2.5 },
      { name: "Standing desk", met: 1.8 },
    ],
  },
];

const allActivities: (Activity & { category: string })[] = categories.flatMap(
  (cat) => cat.activities.map((a) => ({ ...a, category: cat.label }))
);

/* ── Food equivalents ───────────────────────────────────────── */

const foodEquivalents = [
  { name: "slices of pizza", cal: 285 },
  { name: "bananas", cal: 105 },
  { name: "glazed donuts", cal: 253 },
  { name: "cans of soda", cal: 140 },
  { name: "chocolate chip cookies", cal: 78 },
  { name: "eggs", cal: 78 },
  { name: "apples", cal: 95 },
  { name: "tablespoons of peanut butter", cal: 94 },
];

/* ── Comparison activities (for "minutes to burn the same") ── */

const comparisonActivities = [
  { name: "Walking (3 mph)", met: 3.5 },
  { name: "Running (6 mph)", met: 9.8 },
  { name: "Cycling (12 mph)", met: 8.0 },
  { name: "Swimming (moderate)", met: 8.3 },
  { name: "Yoga", met: 3.0 },
  { name: "Jump rope", met: 12.3 },
];

/* ── Helpers ─────────────────────────────────────────────────── */

function fmt(n: number) {
  return Math.round(n).toLocaleString();
}

interface LogEntry {
  id: number;
  activityName: string;
  met: number;
  durationMin: number;
  calories: number;
}

/* ── Component ───────────────────────────────────────────────── */

export default function Page() {
  const [unit, setUnit] = useState<"lb" | "kg">("lb");
  const [weightLb, setWeightLb] = useState(170);
  const [weightKgInput, setWeightKgInput] = useState(77);
  const [durationMin, setDurationMin] = useState(30);
  const [search, setSearch] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [nextId, setNextId] = useState(1);

  const weightKg = unit === "lb" ? weightLb * 0.453592 : weightKgInput;

  /* Filter activities by search */
  const filtered = useMemo(() => {
    if (!search.trim()) return allActivities;
    const q = search.toLowerCase();
    return allActivities.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
    );
  }, [search]);

  const selected = filtered[selectedIdx] ?? filtered[0];

  /* Single-activity calorie result */
  const calories = useMemo(() => {
    if (!selected) return 0;
    return selected.met * weightKg * (durationMin / 60);
  }, [selected, weightKg, durationMin]);

  /* Food equivalents for current burn */
  const foods = useMemo(
    () =>
      foodEquivalents.map((f) => ({
        name: f.name,
        amount: calories / f.cal,
      })),
    [calories]
  );

  /* Comparison: minutes of other activities to burn the same */
  const comparisons = useMemo(
    () =>
      comparisonActivities.map((c) => ({
        name: c.name,
        minutes: calories / (c.met * weightKg) * 60,
      })),
    [calories, weightKg]
  );

  /* Multi-activity log */
  const addToLog = useCallback(() => {
    if (!selected) return;
    setLog((prev) => [
      ...prev,
      {
        id: nextId,
        activityName: selected.name,
        met: selected.met,
        durationMin,
        calories,
      },
    ]);
    setNextId((n) => n + 1);
  }, [selected, durationMin, calories, nextId]);

  const removeFromLog = useCallback((id: number) => {
    setLog((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const totalLogCalories = useMemo(
    () => log.reduce((sum, e) => sum + e.calories, 0),
    [log]
  );

  const totalLogMinutes = useMemo(
    () => log.reduce((sum, e) => sum + e.durationMin, 0),
    [log]
  );

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Calorie Burn Calculator"
      description="Calculate how many calories you burn during exercise and daily activities. Select from 30+ activities with MET-based calculations, compare food equivalents, and track multiple activities."
      slug="calorie-burn-calculator"
      category="Health"
      keywords={[
        "calorie burn calculator",
        "exercise calorie calculator",
        "calories burned calculator",
        "activity calorie calculator",
        "MET calculator",
        "workout calorie counter",
        "calories burned running",
        "calories burned walking",
      ]}
      faqs={[
        {
          question: "How does the calorie burn calculator work?",
          answer:
            "This calculator uses MET (Metabolic Equivalent of Task) values to estimate calories burned. The formula is: Calories = MET x body weight in kg x duration in hours. MET values represent the energy cost of an activity relative to sitting at rest (1 MET). For example, running at 6 mph has a MET of 9.8, meaning it burns roughly 9.8 times more energy than sitting still.",
        },
        {
          question: "What are MET values and how accurate are they?",
          answer:
            "MET (Metabolic Equivalent of Task) values are standardized measures of exercise intensity published in the Compendium of Physical Activities. They represent the ratio of working metabolic rate to resting metabolic rate. While they provide reliable estimates for most adults, actual calorie burn varies based on factors like fitness level, body composition, age, and environmental conditions. MET-based estimates are generally accurate within 10-20% for most people.",
        },
        {
          question:
            "Why does body weight affect how many calories I burn?",
          answer:
            "Heavier bodies require more energy to move and maintain, so a person weighing 200 lbs will burn significantly more calories performing the same activity at the same duration as someone weighing 130 lbs. This is why the formula multiplies MET value by body weight. It takes more energy to move a larger mass through the same exercise.",
        },
        {
          question:
            "How many calories does running burn compared to walking?",
          answer:
            "Running burns roughly 2-3 times more calories per minute than walking. For example, running at 6 mph (MET 9.8) burns about 2.8 times more calories than walking at 3.5 mph (MET 4.3) for the same duration. However, because walking is sustainable for longer periods, a 60-minute walk can still provide excellent total calorie burn and health benefits.",
        },
        {
          question:
            "Can I use this calculator to plan my weight loss?",
          answer:
            "Yes. One pound of body fat is approximately 3,500 calories. By tracking your exercise calories burned alongside your calorie intake, you can estimate your weekly calorie deficit. For safe, sustainable weight loss, aim for a deficit of 500-1,000 calories per day through a combination of diet and exercise. Use the multi-activity tracker to log all your daily activities for a complete picture.",
        },
        {
          question:
            "What is the best exercise for burning the most calories?",
          answer:
            "High-intensity activities like jump rope (MET 12.3), running at 10 mph (MET 14.5), and cycling at 20 mph (MET 15.8) burn the most calories per minute. However, the best exercise is one you can sustain consistently. A moderate 45-minute brisk walk done daily will burn more total calories over time than an intense 10-minute sprint you only do once a week.",
        },
      ]}
      relatedTools={[
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
        { name: "TDEE Calculator", href: "/tools/tdee-calculator" },
        { name: "Macro Calculator", href: "/tools/macro-calculator" },
      ]}
      guide={
        <div>
          <h2>How to Use the Calorie Burn Calculator</h2>
          <p>
            This tool estimates calories burned during physical activities using
            MET (Metabolic Equivalent of Task) values from the Compendium of
            Physical Activities. Enter your weight, pick an activity, set the
            duration, and get an instant estimate.
          </p>

          <h3>Understanding the Results</h3>
          <p>
            The calculator shows your estimated calorie burn along with food
            equivalents so you can visualize the energy expenditure. It also
            shows how many minutes of other activities would burn the same
            amount, helping you compare different workout options.
          </p>

          <h3>Multi-Activity Tracking</h3>
          <p>
            Use the &quot;Add to Log&quot; button to build a list of multiple
            activities for a full daily workout summary. The running total
            updates automatically so you can see your total daily exercise
            calorie burn at a glance.
          </p>

          <h3>The MET Formula</h3>
          <p>
            Calories burned = MET value x body weight (kg) x duration (hours).
            A MET of 1.0 represents the energy cost of sitting quietly. An
            activity with a MET of 8.0 burns eight times more energy than rest.
          </p>
        </div>
      }
    >
      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Left Column: Inputs ────────────────────────────── */}
        <div className="space-y-5">
          {/* Weight input with unit toggle */}
          <div>
            <label className={labelCls}>Body Weight</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={unit === "lb" ? weightLb : weightKgInput}
                onChange={(e) =>
                  unit === "lb"
                    ? setWeightLb(+e.target.value)
                    : setWeightKgInput(+e.target.value)
                }
                className={inputCls + " flex-1"}
                min={1}
                max={999}
              />
              <div className="flex rounded-lg overflow-hidden border border-zinc-700">
                <button
                  onClick={() => setUnit("lb")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    unit === "lb"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  lb
                </button>
                <button
                  onClick={() => setUnit("kg")}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    unit === "kg"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  kg
                </button>
              </div>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className={labelCls}>Duration (minutes)</label>
            <input
              type="number"
              value={durationMin}
              onChange={(e) => setDurationMin(Math.max(1, +e.target.value))}
              className={inputCls}
              min={1}
              max={600}
            />
          </div>

          {/* Search / filter */}
          <div>
            <label className={labelCls}>Search Activities</label>
            <input
              type="text"
              placeholder="Type to filter (e.g. running, yoga, cycling...)"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedIdx(0);
              }}
              className={inputCls}
            />
          </div>

          {/* Activity list */}
          <div>
            <label className={labelCls}>
              Select Activity ({filtered.length} result
              {filtered.length !== 1 ? "s" : ""})
            </label>
            <div className="max-h-72 overflow-y-auto space-y-1 rounded-lg border border-zinc-700 bg-zinc-900 p-2">
              {filtered.length === 0 && (
                <p className="text-sm text-zinc-500 p-2">
                  No activities match your search.
                </p>
              )}
              {filtered.map((a, i) => (
                <button
                  key={a.name}
                  onClick={() => setSelectedIdx(i)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    selectedIdx === i
                      ? "bg-blue-600/20 border border-blue-500/30 text-blue-300"
                      : "text-zinc-300 hover:bg-zinc-800"
                  }`}
                >
                  <span className="font-medium">{a.name}</span>
                  <span className="float-right text-xs text-zinc-500">
                    MET {a.met}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Add to log */}
          <button
            onClick={addToLog}
            disabled={!selected}
            className="w-full py-2.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            + Add to Daily Log
          </button>
        </div>

        {/* ── Right Column: Results ──────────────────────────── */}
        <div className="space-y-5">
          {/* Primary result */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-6 text-center">
            <p className="text-sm text-zinc-400 mb-1">Estimated Calories Burned</p>
            <p className="text-5xl font-bold text-blue-400">{fmt(calories)}</p>
            <p className="text-xs text-zinc-500 mt-2">
              {selected?.name ?? "—"} for {durationMin} min
              {weightKg > 0 && (
                <span> &middot; {Math.round(weightKg)} kg body weight</span>
              )}
            </p>
          </div>

          {/* Food equivalents */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 text-sm font-semibold text-zinc-300">
              Food Equivalents
            </div>
            <div className="divide-y divide-zinc-800">
              {foods.map((f) => (
                <div
                  key={f.name}
                  className="flex justify-between px-4 py-2 text-sm"
                >
                  <span className="text-zinc-400 capitalize">{f.name}</span>
                  <span className="text-yellow-400 font-medium">
                    {f.amount < 0.1 ? "<0.1" : f.amount.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Equivalent minutes of other activities */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 text-sm font-semibold text-zinc-300">
              Minutes of Other Activities to Burn {fmt(calories)} cal
            </div>
            <div className="divide-y divide-zinc-800">
              {comparisons.map((c) => (
                <div
                  key={c.name}
                  className="flex justify-between px-4 py-2 text-sm"
                >
                  <span className="text-zinc-400">{c.name}</span>
                  <span className="text-green-400 font-medium">
                    {c.minutes < 1 ? "<1" : fmt(c.minutes)} min
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Multi-activity log */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <div className="px-4 py-2 bg-zinc-800 text-sm font-semibold text-zinc-300 flex items-center justify-between">
              <span>Daily Activity Log</span>
              {log.length > 0 && (
                <span className="text-xs text-zinc-500">
                  {log.length} activit{log.length === 1 ? "y" : "ies"}
                </span>
              )}
            </div>
            {log.length === 0 ? (
              <p className="text-sm text-zinc-500 px-4 py-4 text-center">
                Add activities above to build your daily log.
              </p>
            ) : (
              <>
                <div className="divide-y divide-zinc-800 max-h-48 overflow-y-auto">
                  {log.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between px-4 py-2 text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-zinc-300 truncate block">
                          {entry.activityName}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {entry.durationMin} min
                        </span>
                      </div>
                      <span className="text-blue-400 font-medium mx-3 shrink-0">
                        {fmt(entry.calories)} cal
                      </span>
                      <button
                        onClick={() => removeFromLog(entry.id)}
                        className="text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none shrink-0"
                        title="Remove"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-zinc-800 flex justify-between text-sm">
                  <span className="text-zinc-300 font-semibold">
                    Total: {totalLogMinutes} min
                  </span>
                  <span className="text-blue-400 font-bold text-base">
                    {fmt(totalLogCalories)} cal
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

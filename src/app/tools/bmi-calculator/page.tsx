"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [weight, setWeight] = useState(170);
  const [feet, setFeet] = useState(5);
  const [inches, setInches] = useState(10);
  const [cm, setCm] = useState(178);
  const [kg, setKg] = useState(77);

  const bmi = useMemo(() => {
    if (unit === "imperial") {
      const totalInches = feet * 12 + inches;
      if (totalInches <= 0 || weight <= 0) return null;
      return (weight / (totalInches * totalInches)) * 703;
    } else {
      const m = cm / 100;
      if (m <= 0 || kg <= 0) return null;
      return kg / (m * m);
    }
  }, [unit, weight, feet, inches, cm, kg]);

  const category = bmi === null ? "" : bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
  const color = bmi === null ? "text-zinc-400" : bmi < 18.5 ? "text-yellow-400" : bmi < 25 ? "text-green-400" : bmi < 30 ? "text-orange-400" : "text-red-400";

  const ranges = [
    { label: "Underweight", range: "< 18.5", color: "bg-yellow-500" },
    { label: "Normal", range: "18.5 – 24.9", color: "bg-green-500" },
    { label: "Overweight", range: "25.0 – 29.9", color: "bg-orange-500" },
    { label: "Obese", range: "≥ 30.0", color: "bg-red-500" },
  ];

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="BMI Calculator"
      description="Calculate your Body Mass Index (BMI) using height and weight. Supports imperial and metric units with BMI category classification."
      slug="bmi-calculator"
      category="Health"
      keywords={["bmi calculator", "body mass index calculator", "bmi chart", "bmi calculator metric", "calculate bmi"]}
      faqs={[
        { question: "What is BMI?", answer: "Body Mass Index (BMI) is a measure of body fat based on height and weight. It's calculated as weight (kg) divided by height (m) squared. BMI is a screening tool, not a diagnostic measure of body fatness or health." },
        { question: "What are the BMI categories?", answer: "Underweight: below 18.5. Normal weight: 18.5–24.9. Overweight: 25.0–29.9. Obese: 30.0 and above. These categories are based on WHO guidelines for adults." },
        { question: "Is BMI accurate?", answer: "BMI has limitations. It doesn't distinguish between muscle and fat mass, so muscular people may have a 'high' BMI without excess fat. It also doesn't account for age, sex, bone density, or fat distribution. Use it as one data point, not a complete health picture." },
        { question: "Does BMI apply to children?", answer: "BMI for children uses age- and sex-specific percentiles rather than the fixed adult categories. A pediatric BMI calculator accounts for normal growth patterns. This calculator is designed for adults (20+)." },
      ]}
      relatedTools={[
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "TDEE Calculator", href: "/tools/tdee-calculator" },
        { name: "Body Fat Calculator", href: "/tools/body-fat-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setUnit("imperial")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unit === "imperial" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Imperial (lbs/ft)</button>
            <button onClick={() => setUnit("metric")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unit === "metric" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Metric (kg/cm)</button>
          </div>

          {unit === "imperial" ? (
            <>
              <div>
                <label className={labelCls}>Weight (lbs)</label>
                <input type="number" value={weight} onChange={e => setWeight(+e.target.value)} className={inputCls} min={1} max={1000} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Feet</label>
                  <input type="number" value={feet} onChange={e => setFeet(+e.target.value)} className={inputCls} min={1} max={8} />
                </div>
                <div>
                  <label className={labelCls}>Inches</label>
                  <input type="number" value={inches} onChange={e => setInches(+e.target.value)} className={inputCls} min={0} max={11} />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelCls}>Weight (kg)</label>
                <input type="number" value={kg} onChange={e => setKg(+e.target.value)} className={inputCls} min={1} max={500} />
              </div>
              <div>
                <label className={labelCls}>Height (cm)</label>
                <input type="number" value={cm} onChange={e => setCm(+e.target.value)} className={inputCls} min={50} max={300} />
              </div>
            </>
          )}
        </div>

        <div className="space-y-4">
          {bmi !== null && (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
                <p className="text-sm text-zinc-400 mb-1">Your BMI</p>
                <p className={`text-5xl font-bold ${color}`}>{bmi.toFixed(1)}</p>
                <p className={`text-lg font-medium mt-1 ${color}`}>{category}</p>
              </div>

              {/* BMI scale visual */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <div className="flex rounded-full overflow-hidden h-4 mb-3">
                  <div className="bg-yellow-500 w-[18.5%]" />
                  <div className="bg-green-500 w-[16.4%]" />
                  <div className="bg-orange-500 w-[12.5%]" />
                  <div className="bg-red-500 flex-1" />
                </div>
                <div className="relative h-4 mb-4">
                  <div className="absolute top-0 transform -translate-x-1/2" style={{ left: `${Math.min(95, Math.max(5, (bmi / 40) * 100))}%` }}>
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-6 border-l-transparent border-r-transparent border-t-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  {ranges.map(r => (
                    <div key={r.label} className={`flex items-center gap-2 text-sm ${category === r.label ? "text-zinc-100 font-medium" : "text-zinc-500"}`}>
                      <span className={`w-3 h-3 rounded-full ${r.color}`} />
                      <span>{r.label}</span>
                      <span className="text-zinc-600 ml-auto">{r.range}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* BMI Table */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Healthy Weight Ranges by Height</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400 text-left">
                <th className="px-3 py-2">Height</th>
                <th className="px-3 py-2">Normal BMI Range (lbs)</th>
              </tr>
            </thead>
            <tbody>
              {[[60, "97–128"], [62, "104–136"], [64, "110–145"], [66, "118–155"], [68, "125–163"], [70, "132–174"], [72, "140–184"], [74, "148–193"], [76, "156–205"]].map(([h, range]) => {
                const f = Math.floor((h as number) / 12);
                const i = (h as number) % 12;
                const isActive = unit === "imperial" && feet * 12 + inches === h;
                return (
                  <tr key={h as number} className={`border-t border-zinc-800 ${isActive ? "bg-blue-600/10 text-blue-300" : "text-zinc-300"}`}>
                    <td className="px-3 py-1.5">{f}&apos;{i}&quot;</td>
                    <td className="px-3 py-1.5">{range as string}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  );
}

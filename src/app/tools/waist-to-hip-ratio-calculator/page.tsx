"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [sex, setSex] = useState<"male" | "female">("male");
  const [waist, setWaist] = useState(34);
  const [hip, setHip] = useState(40);
  const [unit, setUnit] = useState<"in" | "cm">("in");

  const result = useMemo(() => {
    if (hip <= 0) return null;
    const ratio = waist / hip;

    let category: string;
    let risk: string;
    if (sex === "male") {
      if (ratio < 0.90) { category = "Low Risk"; risk = "low"; }
      else if (ratio < 0.95) { category = "Moderate Risk"; risk = "moderate"; }
      else if (ratio < 1.0) { category = "High Risk"; risk = "high"; }
      else { category = "Very High Risk"; risk = "very-high"; }
    } else {
      if (ratio < 0.80) { category = "Low Risk"; risk = "low"; }
      else if (ratio < 0.85) { category = "Moderate Risk"; risk = "moderate"; }
      else if (ratio < 0.90) { category = "High Risk"; risk = "high"; }
      else { category = "Very High Risk"; risk = "very-high"; }
    }

    return { ratio, category, risk };
  }, [waist, hip, sex]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const riskColors: Record<string, string> = { low: "text-green-400", moderate: "text-yellow-400", high: "text-orange-400", "very-high": "text-red-400" };

  return (
    <ToolLayout
      title="Waist-to-Hip Ratio Calculator"
      description="Calculate your waist-to-hip ratio (WHR) to assess health risk. Based on WHO guidelines for men and women."
      slug="waist-to-hip-ratio-calculator"
      category="Health"
      keywords={["waist to hip ratio calculator", "whr calculator", "waist hip ratio", "body shape calculator"]}
      faqs={[
        { question: "What is waist-to-hip ratio?", answer: "WHR = Waist circumference ÷ Hip circumference. It measures fat distribution. Higher ratios (more belly fat) are associated with increased health risks for heart disease, diabetes, and stroke." },
        { question: "What is a healthy WHR?", answer: "WHO guidelines: Men should aim for below 0.90, women below 0.80. Ratios above 1.0 (men) or 0.85 (women) indicate significantly elevated health risks." },
        { question: "How do I measure correctly?", answer: "Waist: measure at the narrowest point between ribs and hip bones (usually at the belly button). Hip: measure at the widest point around the buttocks. Keep the tape level and snug but not tight." },
      ]}
      relatedTools={[
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
        { name: "Body Fat Calculator", href: "/tools/body-fat-calculator" },
        { name: "TDEE Calculator", href: "/tools/tdee-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(["male", "female"] as const).map(s => (
              <button key={s} onClick={() => setSex(s)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${sex === s ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{s}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["in", "cm"] as const).map(u => (
              <button key={u} onClick={() => setUnit(u)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unit === u ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{u === "in" ? "Inches" : "Centimeters"}</button>
            ))}
          </div>
          <div><label className={labelCls}>Waist ({unit})</label><input type="number" value={waist} onChange={e => setWaist(+e.target.value)} className={inputCls} min={0} step={0.5} /></div>
          <div><label className={labelCls}>Hip ({unit})</label><input type="number" value={hip} onChange={e => setHip(+e.target.value)} className={inputCls} min={0} step={0.5} /></div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-1">Waist-to-Hip Ratio</p>
              <p className="text-5xl font-bold text-blue-400">{result.ratio.toFixed(2)}</p>
              <p className={`text-sm font-semibold mt-1 ${riskColors[result.risk]}`}>{result.category}</p>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">WHO Risk Classification ({sex === "male" ? "Male" : "Female"})</p>
              <div className="space-y-1">
                {(sex === "male" ? [
                  ["< 0.90", "Low Risk", "low"],
                  ["0.90 - 0.95", "Moderate Risk", "moderate"],
                  ["0.95 - 1.00", "High Risk", "high"],
                  ["> 1.00", "Very High Risk", "very-high"],
                ] : [
                  ["< 0.80", "Low Risk", "low"],
                  ["0.80 - 0.85", "Moderate Risk", "moderate"],
                  ["0.85 - 0.90", "High Risk", "high"],
                  ["> 0.90", "Very High Risk", "very-high"],
                ]).map(([range, label, risk]) => (
                  <div key={label} className={`flex justify-between text-sm px-2 py-1 rounded ${result.risk === risk ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                    <span>{range}</span>
                    <span className={riskColors[risk as string]}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

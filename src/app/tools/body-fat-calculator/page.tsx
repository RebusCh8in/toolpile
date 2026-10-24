"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [sex, setSex] = useState<"male" | "female">("male");
  // Imperial
  const [waist, setWaist] = useState(34);
  const [neck, setNeck] = useState(15);
  const [hip, setHip] = useState(38);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(10);
  const [weightLbs, setWeightLbs] = useState(175);
  // Metric
  const [waistCm, setWaistCm] = useState(86);
  const [neckCm, setNeckCm] = useState(38);
  const [hipCm, setHipCm] = useState(97);
  const [heightCm, setHeightCm] = useState(178);
  const [weightKg, setWeightKg] = useState(79);

  const result = useMemo(() => {
    let wCm: number, nCm: number, hpCm: number, htCm: number, wKg: number;
    if (unit === "imperial") {
      wCm = waist * 2.54;
      nCm = neck * 2.54;
      hpCm = hip * 2.54;
      htCm = (heightFt * 12 + heightIn) * 2.54;
      wKg = weightLbs * 0.453592;
    } else {
      wCm = waistCm;
      nCm = neckCm;
      hpCm = hipCm;
      htCm = heightCm;
      wKg = weightKg;
    }

    if (wCm <= nCm || htCm <= 0 || wKg <= 0) return null;

    // US Navy method
    let bf: number;
    if (sex === "male") {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(wCm - nCm) + 0.15456 * Math.log10(htCm)) - 450;
    } else {
      bf = 495 / (1.29579 - 0.35004 * Math.log10(wCm + hpCm - nCm) + 0.22100 * Math.log10(htCm)) - 450;
    }
    bf = Math.max(2, Math.min(60, bf));

    const fatMass = wKg * (bf / 100);
    const leanMass = wKg - fatMass;

    // Category
    let category: string, color: string;
    if (sex === "male") {
      if (bf < 6) { category = "Essential Fat"; color = "text-yellow-400"; }
      else if (bf < 14) { category = "Athletic"; color = "text-green-400"; }
      else if (bf < 18) { category = "Fitness"; color = "text-green-400"; }
      else if (bf < 25) { category = "Average"; color = "text-blue-400"; }
      else { category = "Above Average"; color = "text-orange-400"; }
    } else {
      if (bf < 14) { category = "Essential Fat"; color = "text-yellow-400"; }
      else if (bf < 21) { category = "Athletic"; color = "text-green-400"; }
      else if (bf < 25) { category = "Fitness"; color = "text-green-400"; }
      else if (bf < 32) { category = "Average"; color = "text-blue-400"; }
      else { category = "Above Average"; color = "text-orange-400"; }
    }

    return { bf, fatMass, leanMass, category, color };
  }, [unit, sex, waist, neck, hip, heightFt, heightIn, weightLbs, waistCm, neckCm, hipCm, heightCm, weightKg]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const maleRanges = [
    { label: "Essential Fat", range: "2-5%", color: "bg-yellow-500" },
    { label: "Athletic", range: "6-13%", color: "bg-green-500" },
    { label: "Fitness", range: "14-17%", color: "bg-green-400" },
    { label: "Average", range: "18-24%", color: "bg-blue-500" },
    { label: "Above Average", range: "25%+", color: "bg-orange-500" },
  ];
  const femaleRanges = [
    { label: "Essential Fat", range: "10-13%", color: "bg-yellow-500" },
    { label: "Athletic", range: "14-20%", color: "bg-green-500" },
    { label: "Fitness", range: "21-24%", color: "bg-green-400" },
    { label: "Average", range: "25-31%", color: "bg-blue-500" },
    { label: "Above Average", range: "32%+", color: "bg-orange-500" },
  ];
  const ranges = sex === "male" ? maleRanges : femaleRanges;

  return (
    <ToolLayout
      title="Body Fat Calculator"
      description="Estimate your body fat percentage using the US Navy method. Enter measurements to see fat mass, lean mass, and fitness category."
      slug="body-fat-calculator"
      category="Health"
      keywords={["body fat calculator", "body fat percentage calculator", "navy body fat calculator", "body composition calculator"]}
      faqs={[
        { question: "How does the US Navy method work?", answer: "The US Navy body fat formula uses circumference measurements (waist, neck, and hip for women) combined with height to estimate body fat percentage. It's reasonably accurate for most people and doesn't require specialized equipment." },
        { question: "How do I measure correctly?", answer: "Waist: measure at the narrowest point (belly button level for men). Neck: measure just below the Adam's apple. Hip (women only): measure at the widest point. Use a soft measuring tape, keep it snug but not compressed, and measure in the morning." },
        { question: "What is a healthy body fat percentage?", answer: "For men: 10-20% is considered fit, with athletes at 6-13%. For women: 18-28% is fit, with athletes at 14-20%. Essential fat minimums are ~2-5% for men and ~10-13% for women." },
      ]}
      relatedTools={[
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
        { name: "TDEE Calculator", href: "/tools/tdee-calculator" },
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={() => setUnit("imperial")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unit === "imperial" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Imperial (in)</button>
            <button onClick={() => setUnit("metric")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${unit === "metric" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Metric (cm)</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setSex("male")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${sex === "male" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Male</button>
            <button onClick={() => setSex("female")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${sex === "female" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Female</button>
          </div>
          {unit === "imperial" ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div><label className={labelCls}>Height (ft)</label><input type="number" value={heightFt} onChange={e => setHeightFt(+e.target.value)} className={inputCls} min={3} max={8} /></div>
                <div><label className={labelCls}>Height (in)</label><input type="number" value={heightIn} onChange={e => setHeightIn(+e.target.value)} className={inputCls} min={0} max={11} /></div>
              </div>
              <div><label className={labelCls}>Weight (lbs)</label><input type="number" value={weightLbs} onChange={e => setWeightLbs(+e.target.value)} className={inputCls} min={50} /></div>
              <div><label className={labelCls}>Waist (inches)</label><input type="number" value={waist} onChange={e => setWaist(+e.target.value)} className={inputCls} min={15} max={60} step={0.5} /></div>
              <div><label className={labelCls}>Neck (inches)</label><input type="number" value={neck} onChange={e => setNeck(+e.target.value)} className={inputCls} min={8} max={30} step={0.5} /></div>
              {sex === "female" && <div><label className={labelCls}>Hip (inches)</label><input type="number" value={hip} onChange={e => setHip(+e.target.value)} className={inputCls} min={20} max={70} step={0.5} /></div>}
            </>
          ) : (
            <>
              <div><label className={labelCls}>Height (cm)</label><input type="number" value={heightCm} onChange={e => setHeightCm(+e.target.value)} className={inputCls} min={100} max={250} /></div>
              <div><label className={labelCls}>Weight (kg)</label><input type="number" value={weightKg} onChange={e => setWeightKg(+e.target.value)} className={inputCls} min={30} /></div>
              <div><label className={labelCls}>Waist (cm)</label><input type="number" value={waistCm} onChange={e => setWaistCm(+e.target.value)} className={inputCls} min={40} max={150} step={0.5} /></div>
              <div><label className={labelCls}>Neck (cm)</label><input type="number" value={neckCm} onChange={e => setNeckCm(+e.target.value)} className={inputCls} min={20} max={80} step={0.5} /></div>
              {sex === "female" && <div><label className={labelCls}>Hip (cm)</label><input type="number" value={hipCm} onChange={e => setHipCm(+e.target.value)} className={inputCls} min={50} max={180} step={0.5} /></div>}
            </>
          )}
        </div>

        <div className="space-y-4">
          {result && (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
                <p className="text-sm text-zinc-400 mb-1">Body Fat</p>
                <p className={`text-5xl font-bold ${result.color}`}>{result.bf.toFixed(1)}%</p>
                <p className={`text-lg font-medium mt-1 ${result.color}`}>{result.category}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Fat Mass</p>
                  <p className="text-lg font-semibold text-orange-400">{(unit === "imperial" ? result.fatMass * 2.20462 : result.fatMass).toFixed(1)} {unit === "imperial" ? "lbs" : "kg"}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Lean Mass</p>
                  <p className="text-lg font-semibold text-green-400">{(unit === "imperial" ? result.leanMass * 2.20462 : result.leanMass).toFixed(1)} {unit === "imperial" ? "lbs" : "kg"}</p>
                </div>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-500 mb-2">Body Fat Categories ({sex === "male" ? "Men" : "Women"})</p>
                <div className="space-y-1.5">
                  {ranges.map(r => (
                    <div key={r.label} className={`flex items-center gap-2 text-sm ${result.category === r.label ? "text-zinc-100 font-medium" : "text-zinc-500"}`}>
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
    </ToolLayout>
  );
}

"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [sex, setSex] = useState<"male" | "female">("male");
  const [height, setHeight] = useState(70);
  const [unit, setUnit] = useState<"imperial" | "metric">("imperial");
  const [frame, setFrame] = useState<"small" | "medium" | "large">("medium");

  const result = useMemo(() => {
    const heightIn = unit === "imperial" ? height : height / 2.54;
    const heightCm = unit === "imperial" ? height * 2.54 : height;

    // Devine formula
    const devine = sex === "male"
      ? 50 + 2.3 * (heightIn - 60)
      : 45.5 + 2.3 * (heightIn - 60);

    // Robinson formula
    const robinson = sex === "male"
      ? 52 + 1.9 * (heightIn - 60)
      : 49 + 1.7 * (heightIn - 60);

    // Miller formula
    const miller = sex === "male"
      ? 56.2 + 1.41 * (heightIn - 60)
      : 53.1 + 1.36 * (heightIn - 60);

    // Hamwi formula
    const hamwi = sex === "male"
      ? 48 + 2.7 * (heightIn - 60)
      : 45.5 + 2.2 * (heightIn - 60);

    // BMI range (18.5-24.9)
    const heightM = heightCm / 100;
    const bmiLow = Math.round(18.5 * heightM * heightM * 2.205);
    const bmiHigh = Math.round(24.9 * heightM * heightM * 2.205);

    // Frame adjustment
    const frameMult: Record<string, number> = { small: 0.9, medium: 1.0, large: 1.1 };
    const mult = frameMult[frame];

    const formulas = [
      { name: "Devine", kg: Math.round(devine * mult), lbs: Math.round(devine * mult * 2.205) },
      { name: "Robinson", kg: Math.round(robinson * mult), lbs: Math.round(robinson * mult * 2.205) },
      { name: "Miller", kg: Math.round(miller * mult), lbs: Math.round(miller * mult * 2.205) },
      { name: "Hamwi", kg: Math.round(hamwi * mult), lbs: Math.round(hamwi * mult * 2.205) },
    ];

    const avgKg = Math.round(formulas.reduce((s, f) => s + f.kg, 0) / formulas.length);
    const avgLbs = Math.round(formulas.reduce((s, f) => s + f.lbs, 0) / formulas.length);

    return { formulas, avgKg, avgLbs, bmiLow, bmiHigh };
  }, [sex, height, unit, frame]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Ideal Weight Calculator"
      description="Calculate your ideal body weight using four scientific formulas. Adjusted for frame size."
      slug="ideal-weight-calculator"
      category="Health"
      keywords={["ideal weight calculator", "ideal body weight calculator", "how much should I weigh", "healthy weight calculator"]}
      faqs={[
        { question: "What is ideal body weight?", answer: "Ideal body weight is an estimated healthy weight range based on height and sex. Four commonly used formulas (Devine, Robinson, Miller, Hamwi) give slightly different results. Use the average as a general guide." },
        { question: "How accurate are ideal weight formulas?", answer: "These formulas are rough estimates that don't account for muscle mass, bone density, or body composition. A muscular person may weigh more than their 'ideal' weight and still be very healthy. Use BMI range as a complementary measure." },
        { question: "How do I know my frame size?", answer: "Wrap your thumb and index finger around your wrist. If they overlap: small frame. Touch: medium frame. Don't touch: large frame. You can also measure wrist circumference — under 6.5 inches (women) or 6.5 inches (men) is small." },
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
            {(["imperial", "metric"] as const).map(u => (
              <button key={u} onClick={() => setUnit(u)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${unit === u ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{u}</button>
            ))}
          </div>
          <div className="flex gap-2">
            {(["male", "female"] as const).map(s => (
              <button key={s} onClick={() => setSex(s)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${sex === s ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{s}</button>
            ))}
          </div>
          <div><label className={labelCls}>Height ({unit === "imperial" ? "inches" : "cm"})</label><input type="number" value={height} onChange={e => setHeight(+e.target.value)} className={inputCls} min={48} max={230} /></div>
          <div>
            <label className={labelCls}>Frame Size</label>
            <div className="flex gap-2">
              {(["small", "medium", "large"] as const).map(f => (
                <button key={f} onClick={() => setFrame(f)} className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${frame === f ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Ideal Weight (Average)</p>
            <p className="text-5xl font-bold text-blue-400">{result.avgLbs} lbs</p>
            <p className="text-sm text-zinc-500 mt-1">{result.avgKg} kg</p>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">By Formula ({frame} frame)</p>
            <div className="space-y-1">
              {result.formulas.map(f => (
                <div key={f.name} className="flex justify-between text-sm">
                  <span className="text-zinc-400">{f.name}</span>
                  <span className="text-zinc-100 font-semibold">{f.lbs} lbs ({f.kg} kg)</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-1">Healthy BMI Weight Range</p>
            <p className="text-lg font-semibold text-zinc-100">{result.bmiLow} - {result.bmiHigh} lbs</p>
            <p className="text-xs text-zinc-500">BMI 18.5 - 24.9</p>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

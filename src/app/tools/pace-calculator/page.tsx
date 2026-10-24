"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [mode, setMode] = useState<"pace" | "time" | "distance">("pace");
  const [distanceMi, setDistanceMi] = useState(3.1);
  const [timeMin, setTimeMin] = useState(25);
  const [timeSec, setTimeSec] = useState(0);
  const [paceMin, setPaceMin] = useState(8);
  const [paceSec, setPaceSec] = useState(4);

  const presets = [
    { label: "5K", mi: 3.107 }, { label: "10K", mi: 6.214 },
    { label: "Half Marathon", mi: 13.109 }, { label: "Marathon", mi: 26.219 },
    { label: "1 Mile", mi: 1 }, { label: "400m", mi: 0.2485 },
  ];

  const result = useMemo(() => {
    if (mode === "pace") {
      const totalSec = timeMin * 60 + timeSec;
      if (distanceMi <= 0 || totalSec <= 0) return null;
      const pacePerMile = totalSec / distanceMi;
      const pacePerKm = totalSec / (distanceMi * 1.60934);
      const mph = distanceMi / (totalSec / 3600);
      const kph = mph * 1.60934;
      return { pacePerMile, pacePerKm, mph, kph, totalSec, distance: distanceMi };
    } else if (mode === "time") {
      const paceTotalSec = paceMin * 60 + paceSec;
      if (distanceMi <= 0 || paceTotalSec <= 0) return null;
      const totalSec = paceTotalSec * distanceMi;
      const mph = distanceMi / (totalSec / 3600);
      return { pacePerMile: paceTotalSec, pacePerKm: paceTotalSec / 1.60934, mph, kph: mph * 1.60934, totalSec, distance: distanceMi };
    } else {
      const totalSec = timeMin * 60 + timeSec;
      const paceTotalSec = paceMin * 60 + paceSec;
      if (totalSec <= 0 || paceTotalSec <= 0) return null;
      const dist = totalSec / paceTotalSec;
      const mph = dist / (totalSec / 3600);
      return { pacePerMile: paceTotalSec, pacePerKm: paceTotalSec / 1.60934, mph, kph: mph * 1.60934, totalSec, distance: dist };
    }
  }, [mode, distanceMi, timeMin, timeSec, paceMin, paceSec]);

  const fmtPace = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;
  const fmtTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.round(sec % 60);
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
  };

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Pace Calculator"
      description="Calculate running pace, finish time, or distance. Supports miles and kilometers with race distance presets."
      slug="pace-calculator"
      category="Health"
      keywords={["pace calculator", "running pace calculator", "run time calculator", "pace per mile calculator", "marathon pace calculator"]}
      faqs={[
        { question: "How do I calculate my pace?", answer: "Pace = Time ÷ Distance. If you run 3.1 miles in 25 minutes: 25 ÷ 3.1 = 8:04/mile pace. For kilometers, divide by the km distance instead." },
        { question: "What is a good running pace?", answer: "It varies hugely. Beginner: 10-13 min/mile. Intermediate: 8-10 min/mile. Advanced: 6-8 min/mile. Elite: under 5 min/mile. Focus on your personal improvement, not comparison." },
        { question: "How do I convert pace to speed?", answer: "Speed (mph) = 60 ÷ pace (min/mile). An 8:00/mile pace = 60÷8 = 7.5 mph. An 8:00/km pace = 7.5 kph." },
      ]}
      relatedTools={[
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
        { name: "Unit Converter", href: "/tools/unit-converter" },
      ]}
    >
      <div className="flex gap-2 mb-6">
        {([["pace", "Find Pace"], ["time", "Find Time"], ["distance", "Find Distance"]] as const).map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{label}</button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {mode !== "distance" && (
            <div>
              <label className={labelCls}>Distance (miles)</label>
              <input type="number" value={distanceMi} onChange={e => setDistanceMi(+e.target.value)} className={inputCls} min={0.01} step={0.1} />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {presets.map(p => (
                  <button key={p.label} onClick={() => setDistanceMi(p.mi)} className={`px-2 py-1 rounded text-xs transition-colors ${Math.abs(distanceMi - p.mi) < 0.01 ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{p.label}</button>
                ))}
              </div>
            </div>
          )}
          {(mode === "pace" || mode === "distance") && (
            <div>
              <label className={labelCls}>Time</label>
              <div className="grid grid-cols-2 gap-2">
                <div><input type="number" value={timeMin} onChange={e => setTimeMin(+e.target.value)} className={inputCls} min={0} placeholder="Minutes" /><p className="text-xs text-zinc-500 mt-0.5">Minutes</p></div>
                <div><input type="number" value={timeSec} onChange={e => setTimeSec(+e.target.value)} className={inputCls} min={0} max={59} placeholder="Seconds" /><p className="text-xs text-zinc-500 mt-0.5">Seconds</p></div>
              </div>
            </div>
          )}
          {(mode === "time" || mode === "distance") && (
            <div>
              <label className={labelCls}>Pace (per mile)</label>
              <div className="grid grid-cols-2 gap-2">
                <div><input type="number" value={paceMin} onChange={e => setPaceMin(+e.target.value)} className={inputCls} min={0} /><p className="text-xs text-zinc-500 mt-0.5">Minutes</p></div>
                <div><input type="number" value={paceSec} onChange={e => setPaceSec(+e.target.value)} className={inputCls} min={0} max={59} /><p className="text-xs text-zinc-500 mt-0.5">Seconds</p></div>
              </div>
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-1">{mode === "pace" ? "Pace" : mode === "time" ? "Finish Time" : "Distance"}</p>
              <p className="text-4xl font-bold text-blue-400">
                {mode === "pace" ? `${fmtPace(result.pacePerMile)}/mi` : mode === "time" ? fmtTime(result.totalSec) : `${result.distance.toFixed(2)} mi`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Pace /mi</p><p className="text-lg font-semibold text-zinc-100">{fmtPace(result.pacePerMile)}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Pace /km</p><p className="text-lg font-semibold text-zinc-100">{fmtPace(result.pacePerKm)}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Speed</p><p className="text-lg font-semibold text-zinc-100">{result.mph.toFixed(1)} mph</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Speed</p><p className="text-lg font-semibold text-zinc-100">{result.kph.toFixed(1)} kph</p></div>
            </div>

            {/* Race predictions */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">Race Time Predictions (at this pace)</p>
              <div className="space-y-1">
                {presets.filter(p => p.mi > 0.5).map(p => {
                  const time = result.pacePerMile * p.mi;
                  return (
                    <div key={p.label} className={`flex justify-between text-sm px-2 py-1 rounded ${Math.abs(p.mi - result.distance) < 0.01 ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                      <span>{p.label}</span>
                      <span>{fmtTime(time)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [mode, setMode] = useState<"wake" | "sleep" | "now">("wake");
  const [wakeHour, setWakeHour] = useState(7);
  const [wakeMin, setWakeMin] = useState(0);
  const [sleepHour, setSleepHour] = useState(22);
  const [sleepMin, setSleepMin] = useState(30);

  const CYCLE = 90; // minutes
  const FALL_ASLEEP = 15; // minutes to fall asleep

  const result = useMemo(() => {
    if (mode === "wake") {
      // Given wake time, find ideal bedtimes
      const wakeTotal = wakeHour * 60 + wakeMin;
      const cycles = [6, 5, 4, 3];
      return cycles.map(c => {
        let bedMin = wakeTotal - (c * CYCLE + FALL_ASLEEP);
        if (bedMin < 0) bedMin += 1440;
        const h = Math.floor(bedMin / 60) % 24;
        const m = bedMin % 60;
        const hours = (c * CYCLE) / 60;
        return { cycles: c, hour: h, min: m, hours, label: `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}` };
      });
    } else if (mode === "sleep") {
      // Given sleep time, find ideal wake times
      const sleepTotal = sleepHour * 60 + sleepMin + FALL_ASLEEP;
      const cycles = [3, 4, 5, 6];
      return cycles.map(c => {
        let wakeMinTotal = (sleepTotal + c * CYCLE) % 1440;
        const h = Math.floor(wakeMinTotal / 60) % 24;
        const m = wakeMinTotal % 60;
        const hours = (c * CYCLE) / 60;
        return { cycles: c, hour: h, min: m, hours, label: `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}` };
      });
    } else {
      // Go to sleep now
      const now = new Date();
      const sleepTotal = now.getHours() * 60 + now.getMinutes() + FALL_ASLEEP;
      const cycles = [3, 4, 5, 6];
      return cycles.map(c => {
        let wakeMinTotal = (sleepTotal + c * CYCLE) % 1440;
        const h = Math.floor(wakeMinTotal / 60) % 24;
        const m = wakeMinTotal % 60;
        const hours = (c * CYCLE) / 60;
        return { cycles: c, hour: h, min: m, hours, label: `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}` };
      });
    }
  }, [mode, wakeHour, wakeMin, sleepHour, sleepMin]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const cycleQuality = (c: number) => {
    if (c >= 6) return { label: "Optimal", color: "text-green-400" };
    if (c >= 5) return { label: "Good", color: "text-blue-400" };
    if (c >= 4) return { label: "Okay", color: "text-yellow-400" };
    return { label: "Minimum", color: "text-orange-400" };
  };

  return (
    <ToolLayout
      title="Sleep Calculator"
      description="Calculate the best times to sleep and wake up based on 90-minute sleep cycles. Wake up refreshed, not groggy."
      slug="sleep-calculator"
      category="Health"
      keywords={["sleep calculator", "sleep cycle calculator", "when should I wake up", "when should I go to sleep", "bedtime calculator"]}
      faqs={[
        { question: "What is a sleep cycle?", answer: "A sleep cycle lasts about 90 minutes and moves through light sleep, deep sleep, and REM sleep. Waking between cycles (not during deep sleep) helps you feel more refreshed. Most adults need 5-6 complete cycles (7.5-9 hours)." },
        { question: "Why do I feel groggy even after 8 hours?", answer: "You likely woke during a deep sleep phase. Try adjusting your alarm by 15-30 minutes. The goal is to complete full 90-minute cycles, so 7.5 hours (5 cycles) may feel better than 8 hours." },
        { question: "How long does it take to fall asleep?", answer: "The average person takes about 10-20 minutes to fall asleep. This calculator uses 15 minutes. If you fall asleep faster or slower, adjust your bedtime accordingly." },
      ]}
      relatedTools={[
        { name: "Age Calculator", href: "/tools/age-calculator" },
        { name: "Countdown Timer", href: "/tools/countdown-timer" },
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex gap-2">
            {([["wake", "I wake up at..."], ["sleep", "I go to bed at..."], ["now", "Sleep now"]] as const).map(([m, label]) => (
              <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === m ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{label}</button>
            ))}
          </div>

          {mode === "wake" && (
            <div>
              <label className={labelCls}>Wake Up Time</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select value={wakeHour} onChange={e => setWakeHour(+e.target.value)} className={inputCls}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i % 12 || 12} {i < 12 ? "AM" : "PM"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select value={wakeMin} onChange={e => setWakeMin(+e.target.value)} className={inputCls}>
                    {[0, 15, 30, 45].map(m => (
                      <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {mode === "sleep" && (
            <div>
              <label className={labelCls}>Bedtime</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <select value={sleepHour} onChange={e => setSleepHour(+e.target.value)} className={inputCls}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{i % 12 || 12} {i < 12 ? "AM" : "PM"}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <select value={sleepMin} onChange={e => setSleepMin(+e.target.value)} className={inputCls}>
                    {[0, 15, 30, 45].map(m => (
                      <option key={m} value={m}>{String(m).padStart(2, "0")}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {mode === "now" && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 text-center">
              <p className="text-sm text-zinc-400">If you go to sleep right now, you should set your alarm for one of the times shown.</p>
              <p className="text-xs text-zinc-500 mt-1">Assumes ~15 min to fall asleep</p>
            </div>
          )}

          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Recommended Sleep by Age</p>
            <div className="space-y-1 text-sm">
              {[
                ["Teens (14-17)", "8-10 hrs"],
                ["Adults (18-64)", "7-9 hrs"],
                ["Older Adults (65+)", "7-8 hrs"],
              ].map(([age, hrs]) => (
                <div key={age} className="flex justify-between">
                  <span className="text-zinc-400">{age}</span>
                  <span className="text-zinc-100">{hrs}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-zinc-400">{mode === "wake" ? "Go to bed at:" : "Set your alarm for:"}</p>
          {result.map(r => {
            const q = cycleQuality(r.cycles);
            return (
              <div key={r.cycles} className={`bg-zinc-800/50 border rounded-xl p-4 flex items-center justify-between ${r.cycles >= 5 ? "border-blue-600/50" : "border-zinc-700"}`}>
                <div>
                  <p className="text-2xl font-bold text-zinc-100">{r.label}</p>
                  <p className="text-xs text-zinc-500">{r.hours} hours of sleep</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-zinc-100">{r.cycles} cycles</p>
                  <p className={`text-xs font-medium ${q.color}`}>{q.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ToolLayout>
  );
}

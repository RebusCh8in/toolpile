"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef(0);

  const totalSet = hours * 3600 + minutes * 60 + seconds;

  const start = useCallback(() => {
    const total = running ? remaining : totalSet;
    if (total <= 0) return;
    endTimeRef.current = Date.now() + total * 1000;
    setRemaining(total);
    setRunning(true);
    setFinished(false);
  }, [running, remaining, totalSet]);

  const pause = () => { setRunning(false); };
  const reset = () => { setRunning(false); setRemaining(0); setFinished(false); };

  useEffect(() => {
    if (!running) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      const left = Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        setRunning(false);
        setFinished(true);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 100);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const h = Math.floor(remaining / 3600);
  const m = Math.floor((remaining % 3600) / 60);
  const s = remaining % 60;
  const progress = totalSet > 0 ? ((totalSet - remaining) / totalSet) * 100 : 0;

  const presets = [
    { label: "1m", h: 0, m: 1, s: 0 }, { label: "5m", h: 0, m: 5, s: 0 },
    { label: "10m", h: 0, m: 10, s: 0 }, { label: "15m", h: 0, m: 15, s: 0 },
    { label: "25m", h: 0, m: 25, s: 0 }, { label: "30m", h: 0, m: 30, s: 0 },
    { label: "45m", h: 0, m: 45, s: 0 }, { label: "1h", h: 1, m: 0, s: 0 },
  ];

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-center text-2xl";
  const labelCls = "block text-sm text-zinc-400 mb-1 text-center";

  return (
    <ToolLayout
      title="Countdown Timer"
      description="Free online countdown timer with preset durations. Set hours, minutes, seconds and start counting down."
      slug="countdown-timer"
      category="Utility"
      keywords={["countdown timer", "online timer", "timer", "countdown clock", "set timer"]}
      faqs={[
        { question: "Does this timer work in the background?", answer: "Yes. The timer uses absolute timestamps so it remains accurate even if the browser tab is in the background. However, audio alerts may not play if the tab is backgrounded." },
        { question: "What is the Pomodoro technique?", answer: "A time management method: work for 25 minutes, take a 5-minute break. After 4 cycles, take a 15-30 minute break. Use the 25m preset for Pomodoro work sessions." },
      ]}
      relatedTools={[
        { name: "Age Calculator", href: "/tools/age-calculator" },
        { name: "Unix Timestamp Converter", href: "/tools/timestamp-converter" },
      ]}
    >
      <div className="max-w-lg mx-auto space-y-6">
        {/* Timer display */}
        <div className={`rounded-2xl p-8 text-center border ${finished ? "bg-green-500/10 border-green-500/30" : "bg-zinc-800/50 border-zinc-700"}`}>
          {finished ? (
            <p className="text-4xl font-bold text-green-400 animate-pulse">Time&apos;s Up!</p>
          ) : remaining > 0 || running ? (
            <>
              <p className="text-7xl font-mono font-bold text-blue-400">
                {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
              </p>
              <div className="w-full bg-zinc-700 rounded-full h-2 mt-4">
                <div className="bg-blue-500 rounded-full h-2 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelCls}>Hours</label><input type="number" value={hours} onChange={e => setHours(Math.max(0, +e.target.value))} className={inputCls} min={0} max={99} /></div>
              <div><label className={labelCls}>Minutes</label><input type="number" value={minutes} onChange={e => setMinutes(Math.max(0, Math.min(59, +e.target.value)))} className={inputCls} min={0} max={59} /></div>
              <div><label className={labelCls}>Seconds</label><input type="number" value={seconds} onChange={e => setSeconds(Math.max(0, Math.min(59, +e.target.value)))} className={inputCls} min={0} max={59} /></div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3">
          {!running && !finished && remaining === 0 && (
            <button onClick={start} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-3 font-semibold transition-colors">Start</button>
          )}
          {running && (
            <button onClick={pause} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg py-3 font-semibold transition-colors">Pause</button>
          )}
          {!running && remaining > 0 && !finished && (
            <button onClick={start} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-3 font-semibold transition-colors">Resume</button>
          )}
          {(remaining > 0 || finished) && (
            <button onClick={reset} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg py-3 font-semibold transition-colors">Reset</button>
          )}
        </div>

        {/* Presets */}
        <div>
          <p className="text-xs text-zinc-500 mb-2 text-center">Quick Presets</p>
          <div className="flex flex-wrap justify-center gap-2">
            {presets.map(p => (
              <button key={p.label} onClick={() => { setHours(p.h); setMinutes(p.m); setSeconds(p.s); reset(); }} className="px-4 py-2 rounded-lg text-sm bg-zinc-800 text-zinc-400 hover:bg-zinc-700 transition-colors">{p.label}</button>
            ))}
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [laps, setLaps] = useState<number[]>([]);
  const startTimeRef = useRef(0);
  const offsetRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    startTimeRef.current = Date.now();
    offsetRef.current = elapsed;
    setRunning(true);
  }, [elapsed]);

  const stop = () => setRunning(false);
  const reset = () => { setRunning(false); setElapsed(0); setLaps([]); offsetRef.current = 0; };
  const lap = () => setLaps(prev => [elapsed, ...prev]);

  useEffect(() => {
    if (!running) { if (intervalRef.current) clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setElapsed(offsetRef.current + (Date.now() - startTimeRef.current));
    }, 10);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const formatTime = (ms: number) => {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  };

  return (
    <ToolLayout
      title="Stopwatch"
      description="Free online stopwatch with lap times. Accurate to centiseconds with start, stop, lap, and reset controls."
      slug="stopwatch"
      category="Utility"
      keywords={["stopwatch", "online stopwatch", "stopwatch timer", "lap timer", "split timer"]}
      faqs={[
        { question: "How accurate is this stopwatch?", answer: "It uses high-resolution timestamps (Date.now()) for accuracy to about 1ms. Display updates every 10ms. For casual timing, this is more than sufficient." },
        { question: "Does it work in the background?", answer: "Yes. The stopwatch uses absolute timestamps, not interval counting, so it remains accurate even when the tab is backgrounded." },
      ]}
      relatedTools={[
        { name: "Countdown Timer", href: "/tools/countdown-timer" },
        { name: "Unix Timestamp Converter", href: "/tools/timestamp-converter" },
      ]}
    >
      <div className="max-w-lg mx-auto space-y-6">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8 text-center">
          <p className="text-7xl font-mono font-bold text-blue-400 tabular-nums">{formatTime(elapsed)}</p>
        </div>

        <div className="flex gap-3">
          {!running ? (
            <button onClick={start} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg py-3 font-semibold transition-colors">{elapsed > 0 ? "Resume" : "Start"}</button>
          ) : (
            <>
              <button onClick={stop} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg py-3 font-semibold transition-colors">Stop</button>
              <button onClick={lap} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg py-3 font-semibold transition-colors">Lap</button>
            </>
          )}
          {elapsed > 0 && !running && (
            <button onClick={reset} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg py-3 font-semibold transition-colors">Reset</button>
          )}
        </div>

        {laps.length > 0 && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-2">Laps</p>
            <div className="space-y-1 max-h-48 overflow-auto">
              {laps.map((l, i) => {
                const diff = i < laps.length - 1 ? l - laps[i + 1] : l;
                return (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-zinc-400">Lap {laps.length - i}</span>
                    <span className="text-zinc-300 font-mono">{formatTime(l)}</span>
                    <span className="text-zinc-500 font-mono">+{formatTime(diff)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

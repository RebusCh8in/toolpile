"use client";
import { useState, useMemo, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface CycleEntry {
  id: number;
  lmpDate: string;
  cycleLength: number;
}

interface CycleResult {
  lmp: Date;
  ovulationDate: Date;
  fertileStart: Date;
  fertileEnd: Date;
  nextPeriod: Date;
  cycleLength: number;
  phases: Phase[];
}

interface Phase {
  start: Date;
  end: Date;
  type: "menstruation" | "follicular" | "fertile" | "ovulation" | "luteal";
  label: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const fmt = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmtShort = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};

const daysBetween = (a: Date, b: Date) =>
  Math.round((b.getTime() - a.getTime()) / 86_400_000);

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const isInRange = (d: Date, start: Date, end: Date) =>
  d.getTime() >= start.getTime() && d.getTime() <= end.getTime();

let nextId = 1;

/* ------------------------------------------------------------------ */
/*  Compute one cycle                                                  */
/* ------------------------------------------------------------------ */
function computeCycle(lmpStr: string, cycleLength: number): CycleResult | null {
  const lmp = new Date(lmpStr + "T00:00:00");
  if (isNaN(lmp.getTime())) return null;

  const lutealPhase = 14; // constant across women
  const ovulationDay = cycleLength - lutealPhase;
  const ovulationDate = addDays(lmp, ovulationDay);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = ovulationDate; // ovulation day itself is last fertile day
  const nextPeriod = addDays(lmp, cycleLength);

  // Build phases
  const menstruationEnd = addDays(lmp, 4); // typical 5-day period
  const phases: Phase[] = [
    {
      start: lmp,
      end: menstruationEnd,
      type: "menstruation",
      label: "Menstruation",
    },
    {
      start: addDays(menstruationEnd, 1),
      end: addDays(fertileStart, -1),
      type: "follicular",
      label: "Follicular Phase",
    },
    {
      start: fertileStart,
      end: addDays(ovulationDate, -1),
      type: "fertile",
      label: "Fertile Window",
    },
    {
      start: ovulationDate,
      end: ovulationDate,
      type: "ovulation",
      label: "Ovulation Day",
    },
    {
      start: addDays(ovulationDate, 1),
      end: addDays(nextPeriod, -1),
      type: "luteal",
      label: "Luteal Phase",
    },
  ];

  return { lmp, ovulationDate, fertileStart, fertileEnd, nextPeriod, cycleLength, phases };
}

/* ------------------------------------------------------------------ */
/*  Phase colours                                                      */
/* ------------------------------------------------------------------ */
const phaseColor: Record<string, { bg: string; text: string; ring: string; dot: string }> = {
  menstruation: { bg: "bg-red-500/20", text: "text-red-400", ring: "ring-red-500/40", dot: "bg-red-500" },
  follicular:   { bg: "bg-zinc-700/30", text: "text-zinc-400", ring: "ring-zinc-600/40", dot: "bg-zinc-500" },
  fertile:      { bg: "bg-green-500/20", text: "text-green-400", ring: "ring-green-500/40", dot: "bg-green-500" },
  ovulation:    { bg: "bg-purple-500/25", text: "text-purple-400", ring: "ring-purple-500/50", dot: "bg-purple-500" },
  luteal:       { bg: "bg-amber-500/15", text: "text-amber-400", ring: "ring-amber-500/40", dot: "bg-amber-500" },
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function Page() {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  /* -- primary inputs -- */
  const [lmpDate, setLmpDate] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 5);
    return d.toISOString().split("T")[0];
  });
  const [cycleLength, setCycleLength] = useState(28);

  /* -- tracked cycles -- */
  const [cycles, setCycles] = useState<CycleEntry[]>([]);
  const [showTracker, setShowTracker] = useState(false);

  /* -- primary result -- */
  const result = useMemo(() => computeCycle(lmpDate, cycleLength), [lmpDate, cycleLength]);

  /* -- tracked cycle results -- */
  const trackedResults = useMemo(
    () =>
      cycles
        .map((c) => ({ entry: c, result: computeCycle(c.lmpDate, c.cycleLength) }))
        .filter((r): r is { entry: CycleEntry; result: CycleResult } => r.result !== null),
    [cycles]
  );

  const addCycle = useCallback(() => {
    setCycles((prev) => [
      ...prev,
      { id: nextId++, lmpDate: todayStr, cycleLength: 28 },
    ]);
  }, [todayStr]);

  const updateCycle = useCallback((id: number, field: "lmpDate" | "cycleLength", value: string | number) => {
    setCycles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  }, []);

  const removeCycle = useCallback((id: number) => {
    setCycles((prev) => prev.filter((c) => c.id !== id));
  }, []);

  /* -- calendar view for cycle timeline -- */
  const calendarDays = useMemo(() => {
    if (!result) return [];
    const days: { date: Date; phase: string; label: string }[] = [];
    for (let i = 0; i < result.cycleLength; i++) {
      const d = addDays(result.lmp, i);
      let phase = "follicular";
      let label = "Follicular";
      for (const p of result.phases) {
        if (isInRange(d, p.start, p.end)) {
          phase = p.type;
          label = p.label;
          break;
        }
      }
      days.push({ date: d, phase, label });
    }
    return days;
  }, [result]);

  /* -- styles -- */
  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const cardCls = "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5";
  const btnCls =
    "px-4 py-2 rounded-lg text-sm font-medium transition-colors";

  return (
    <ToolLayout
      title="Ovulation Calculator"
      description="Calculate your estimated ovulation date, fertile window, and next period based on your menstrual cycle. Visualize cycle phases with a color-coded calendar timeline."
      slug="ovulation-calculator"
      category="Health"
      keywords={[
        "ovulation calculator",
        "fertility calculator",
        "ovulation calendar",
        "fertile window calculator",
        "when do I ovulate",
        "ovulation predictor",
        "menstrual cycle calculator",
        "period calculator",
        "conception calculator",
        "fertility tracker",
      ]}
      faqs={[
        {
          question: "How is the ovulation date calculated?",
          answer:
            "Ovulation is estimated by subtracting 14 days (the typical luteal phase length) from your total cycle length, then counting that many days forward from the first day of your last menstrual period. For a 28-day cycle, ovulation typically occurs around day 14. For a 30-day cycle, it would be around day 16.",
        },
        {
          question: "What is the fertile window and how long does it last?",
          answer:
            "The fertile window spans approximately 6 days: the 5 days before ovulation plus ovulation day itself. Sperm can survive in the reproductive tract for up to 5 days, while the egg is viable for about 12-24 hours after release. The highest chance of conception occurs in the 1-2 days before ovulation.",
        },
        {
          question: "How accurate is an ovulation calculator?",
          answer:
            "An ovulation calculator provides an estimate based on average cycle data. Actual ovulation can vary by several days even in regular cycles due to stress, illness, travel, or hormonal fluctuations. For more precise tracking, combine this calculator with ovulation predictor kits (OPKs), basal body temperature charting, or cervical mucus monitoring.",
        },
        {
          question: "What is the luteal phase and why is it always 14 days?",
          answer:
            "The luteal phase is the second half of your menstrual cycle, from ovulation to the start of your next period. While 14 days is the most common length, individual luteal phases can range from 10-16 days. A consistently short luteal phase (under 10 days) is called luteal phase deficiency and may affect fertility.",
        },
        {
          question: "Can I use this calculator for birth control?",
          answer:
            "No. This calculator should not be used as a method of birth control. Ovulation timing can vary significantly from cycle to cycle, and sperm can survive for up to 5 days. The calendar method alone has a high failure rate. Consult a healthcare provider for reliable contraception options.",
        },
        {
          question: "How does cycle length affect ovulation timing?",
          answer:
            "Cycle length directly affects when you ovulate. With shorter cycles (e.g., 21 days), ovulation occurs earlier (around day 7). With longer cycles (e.g., 35 days), ovulation occurs later (around day 21). The luteal phase (post-ovulation) remains relatively constant at about 14 days, so the variation occurs in the follicular phase before ovulation.",
        },
        {
          question: "What are the signs of ovulation?",
          answer:
            "Common ovulation signs include a slight rise in basal body temperature (0.4-1.0 degrees F), changes in cervical mucus (clear, stretchy, egg-white consistency), mild pelvic pain or cramping on one side (mittelschmerz), increased libido, breast tenderness, and a positive ovulation predictor kit (OPK) result detecting the LH surge.",
        },
      ]}
      relatedTools={[
        { name: "Pregnancy Due Date Calculator", href: "/tools/pregnancy-calculator" },
        { name: "Age Calculator", href: "/tools/age-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
        { name: "TDEE Calculator", href: "/tools/tdee-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">How to Use the Ovulation Calculator</h2>
            <p className="text-zinc-400 leading-relaxed">
              Enter the first day of your last menstrual period and your average cycle length to see your estimated ovulation date,
              fertile window, and next expected period. The visual timeline below the results shows every day of your cycle color-coded
              by phase -- red for menstruation, green for your fertile window, purple for ovulation day, and amber for the luteal phase.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">Understanding Your Menstrual Cycle Phases</h2>
            <p className="text-zinc-400 leading-relaxed mb-2">
              A typical menstrual cycle has four main phases:
            </p>
            <ul className="list-disc list-inside text-zinc-400 space-y-1">
              <li><strong className="text-zinc-300">Menstruation (Days 1-5):</strong> The uterine lining sheds, resulting in your period.</li>
              <li><strong className="text-zinc-300">Follicular Phase (Days 1 to ovulation):</strong> Follicle-stimulating hormone (FSH) prompts egg development in the ovary.</li>
              <li><strong className="text-zinc-300">Ovulation (Mid-cycle):</strong> A surge in luteinizing hormone (LH) triggers egg release.</li>
              <li><strong className="text-zinc-300">Luteal Phase (Ovulation to next period):</strong> The corpus luteum produces progesterone to prepare for possible implantation.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">Tips for Maximizing Fertility</h2>
            <p className="text-zinc-400 leading-relaxed">
              If you are trying to conceive, focus on the 2-3 days leading up to and including ovulation day. Track your cycles over
              several months to identify your personal pattern. Combine calendar tracking with basal body temperature (BBT) charting
              and ovulation predictor kits for a more complete picture. Maintain a healthy lifestyle, manage stress, and consult your
              healthcare provider if you have been trying to conceive for over 12 months (or 6 months if over 35).
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-3">Multi-Cycle Tracking</h2>
            <p className="text-zinc-400 leading-relaxed">
              Use the cycle tracker feature to log multiple past cycles. This helps you identify patterns and variations in your
              cycle length and ovulation timing. The more cycles you track, the better you can predict your future fertile windows.
              Note that some variation between cycles is completely normal.
            </p>
          </section>
        </div>
      }
    >
      {/* ============================================================ */}
      {/*  INPUT + RESULTS                                              */}
      {/* ============================================================ */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* -- Inputs -- */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>First Day of Last Period</label>
            <input
              type="date"
              value={lmpDate}
              onChange={(e) => setLmpDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Average Cycle Length (days)</label>
            <input
              type="number"
              value={cycleLength}
              onChange={(e) => {
                const v = Math.max(20, Math.min(45, +e.target.value));
                setCycleLength(v);
              }}
              className={inputCls}
              min={20}
              max={45}
            />
            <p className="text-xs text-zinc-500 mt-1">Typical range: 20 - 45 days</p>
          </div>

          {/* Legend */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">Cycle Phase Legend</p>
            <div className="grid grid-cols-2 gap-2">
              {(["menstruation", "follicular", "fertile", "ovulation", "luteal"] as const).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${phaseColor[k].dot}`} />
                  <span className="text-xs text-zinc-300 capitalize">{k === "fertile" ? "Fertile Window" : k}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <p className="text-xs text-amber-400 font-medium mb-1">Medical Disclaimer</p>
            <p className="text-xs text-amber-400/80 leading-relaxed">
              This calculator is for educational and informational purposes only. It is not intended as medical advice and
              should not be used as a substitute for professional medical guidance. Ovulation timing varies between individuals
              and cycles. Consult a healthcare provider for fertility planning or any health concerns.
            </p>
          </div>
        </div>

        {/* -- Results -- */}
        {result && (
          <div className="space-y-4">
            {/* Ovulation Date */}
            <div className={`${cardCls} text-center`}>
              <p className="text-sm text-zinc-400 mb-1">Estimated Ovulation Date</p>
              <p className="text-3xl font-bold text-purple-400">{fmt(result.ovulationDate)}</p>
              <p className="text-sm text-zinc-500 mt-1">
                Day {cycleLength - 14} of your cycle
              </p>
            </div>

            {/* Key dates */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Fertile Window Start</p>
                <p className="text-sm font-semibold text-green-400">{fmt(result.fertileStart)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Fertile Window End</p>
                <p className="text-sm font-semibold text-green-400">{fmt(result.fertileEnd)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Next Period</p>
                <p className="text-sm font-semibold text-red-400">{fmt(result.nextPeriod)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Cycle Length</p>
                <p className="text-sm font-semibold text-zinc-100">{cycleLength} days</p>
              </div>
            </div>

            {/* Days until ovulation / status */}
            {(() => {
              const daysToOv = daysBetween(today, result.ovulationDate);
              const inFertile = isInRange(today, result.fertileStart, result.fertileEnd);
              const isOvDay = isSameDay(today, result.ovulationDate);
              return (
                <div className={`${cardCls} text-center ${isOvDay ? "border-purple-500/50" : inFertile ? "border-green-500/50" : ""}`}>
                  {isOvDay ? (
                    <p className="text-sm font-semibold text-purple-400">Today is your estimated ovulation day</p>
                  ) : inFertile ? (
                    <p className="text-sm font-semibold text-green-400">You are currently in your fertile window</p>
                  ) : daysToOv > 0 ? (
                    <p className="text-sm text-zinc-400">
                      <span className="text-2xl font-bold text-blue-400">{daysToOv}</span> days until estimated ovulation
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-400">
                      Ovulation was approximately <span className="font-bold text-zinc-300">{Math.abs(daysToOv)}</span> days ago
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Phase breakdown bar */}
            <div className={cardCls}>
              <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">Cycle Phase Breakdown</p>
              <div className="flex rounded-full overflow-hidden h-4">
                {result.phases.map((p) => {
                  const days = daysBetween(p.start, p.end) + 1;
                  const pct = (days / result.cycleLength) * 100;
                  const colors = phaseColor[p.type];
                  return (
                    <div
                      key={p.type}
                      className={`${colors.dot} opacity-80 relative group`}
                      style={{ width: `${pct}%` }}
                      title={`${p.label}: ${days} days`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between mt-2">
                {result.phases.map((p) => {
                  const days = daysBetween(p.start, p.end) + 1;
                  return (
                    <div key={p.type} className="text-center" style={{ flex: days }}>
                      <p className={`text-[10px] ${phaseColor[p.type].text} truncate`}>{p.label}</p>
                      <p className="text-[10px] text-zinc-500">{days}d</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/*  CYCLE CALENDAR TIMELINE                                      */}
      {/* ============================================================ */}
      {result && calendarDays.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">Cycle Calendar Timeline</h3>
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 overflow-x-auto">
            {/* Week headers */}
            <div className="min-w-[640px]">
              {/* Day of week header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <div key={d} className="text-center text-xs text-zinc-500 font-medium py-1">
                    {d}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              {(() => {
                // Get the day of week of the first day (0=Sun)
                const firstDow = calendarDays[0].date.getDay();
                // Build rows
                const cells: (typeof calendarDays[0] | null)[] = [];
                // Pad beginning
                for (let i = 0; i < firstDow; i++) cells.push(null);
                cells.push(...calendarDays);
                // Pad end
                while (cells.length % 7 !== 0) cells.push(null);

                const rows: (typeof cells)[] = [];
                for (let i = 0; i < cells.length; i += 7) {
                  rows.push(cells.slice(i, i + 7));
                }

                return rows.map((row, ri) => (
                  <div key={ri} className="grid grid-cols-7 gap-1">
                    {row.map((cell, ci) => {
                      if (!cell)
                        return <div key={ci} className="h-14 rounded-lg" />;

                      const colors = phaseColor[cell.phase];
                      const isToday = isSameDay(cell.date, today);
                      const dayNum = daysBetween(result.lmp, cell.date) + 1;

                      return (
                        <div
                          key={ci}
                          className={`h-14 rounded-lg ${colors.bg} ${isToday ? `ring-2 ${colors.ring}` : ""} flex flex-col items-center justify-center relative transition-colors`}
                          title={`Day ${dayNum}: ${cell.label} - ${fmt(cell.date)}`}
                        >
                          <span className="text-xs font-medium text-zinc-200">
                            {cell.date.getDate()}
                          </span>
                          <span className={`text-[9px] ${colors.text} mt-0.5`}>
                            {cell.phase === "ovulation" ? "OV" : cell.phase === "fertile" ? "F" : cell.phase === "menstruation" ? "M" : cell.phase === "luteal" ? "L" : ""}
                          </span>
                          {isToday && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ));
              })()}

              {/* Calendar legend */}
              <div className="flex flex-wrap gap-4 mt-4 pt-3 border-t border-zinc-700">
                {(["menstruation", "fertile", "ovulation", "luteal", "follicular"] as const).map((k) => (
                  <div key={k} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${phaseColor[k].dot}`} />
                    <span className="text-xs text-zinc-400 capitalize">
                      {k === "fertile" ? "Fertile Window" : k}
                    </span>
                  </div>
                ))}
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span className="text-xs text-zinc-400">Today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/*  MULTI-CYCLE TRACKER                                          */}
      {/* ============================================================ */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-100">Cycle Tracker</h3>
          <button
            onClick={() => setShowTracker((v) => !v)}
            className={`${btnCls} ${showTracker ? "bg-zinc-700 text-zinc-300" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            {showTracker ? "Hide Tracker" : "Track Multiple Cycles"}
          </button>
        </div>

        {showTracker && (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
            <p className="text-sm text-zinc-400">
              Log past cycles to identify patterns in your ovulation timing and cycle regularity.
            </p>

            {/* Existing tracked cycles */}
            {cycles.map((c, idx) => {
              const cr = trackedResults.find((r) => r.entry.id === c.id);
              return (
                <div key={c.id} className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-zinc-300">Cycle {idx + 1}</span>
                    <button
                      onClick={() => removeCycle(c.id)}
                      className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelCls}>LMP Date</label>
                      <input
                        type="date"
                        value={c.lmpDate}
                        onChange={(e) => updateCycle(c.id, "lmpDate", e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label className={labelCls}>Cycle Length</label>
                      <input
                        type="number"
                        value={c.cycleLength}
                        onChange={(e) =>
                          updateCycle(c.id, "cycleLength", Math.max(20, Math.min(45, +e.target.value)))
                        }
                        className={inputCls}
                        min={20}
                        max={45}
                      />
                    </div>
                  </div>
                  {cr && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="bg-zinc-800 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-zinc-500">Ovulation</p>
                        <p className="text-xs font-medium text-purple-400">{fmtShort(cr.result.ovulationDate)}</p>
                      </div>
                      <div className="bg-zinc-800 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-zinc-500">Fertile Window</p>
                        <p className="text-xs font-medium text-green-400">
                          {fmtShort(cr.result.fertileStart)} - {fmtShort(cr.result.fertileEnd)}
                        </p>
                      </div>
                      <div className="bg-zinc-800 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-zinc-500">Next Period</p>
                        <p className="text-xs font-medium text-red-400">{fmtShort(cr.result.nextPeriod)}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Add cycle button */}
            <button
              onClick={addCycle}
              className={`${btnCls} w-full bg-zinc-700 text-zinc-300 hover:bg-zinc-600 border border-zinc-600`}
            >
              + Add Cycle
            </button>

            {/* Summary stats */}
            {trackedResults.length >= 2 && (
              <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4">
                <p className="text-xs text-zinc-500 mb-3 font-medium uppercase tracking-wide">Cycle Statistics</p>
                {(() => {
                  const lengths = trackedResults.map((r) => r.result.cycleLength);
                  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
                  const min = Math.min(...lengths);
                  const max = Math.max(...lengths);
                  const ovDays = trackedResults.map((r) => r.result.cycleLength - 14);
                  const avgOv = ovDays.reduce((a, b) => a + b, 0) / ovDays.length;
                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <p className="text-xs text-zinc-500">Avg Cycle</p>
                        <p className="text-lg font-semibold text-zinc-100">{avg.toFixed(1)}d</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Range</p>
                        <p className="text-lg font-semibold text-zinc-100">{min}-{max}d</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Avg Ovulation Day</p>
                        <p className="text-lg font-semibold text-purple-400">Day {avgOv.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Cycles Tracked</p>
                        <p className="text-lg font-semibold text-zinc-100">{trackedResults.length}</p>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

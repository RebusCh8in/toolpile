"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

interface CycleData {
  cycleNumber: number;
  periodStart: Date;
  periodEnd: Date;
  fertileStart: Date;
  fertileEnd: Date;
  ovulationDate: Date;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateShort(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isInRange(date: Date, start: Date, end: Date): boolean {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
  return d >= s && d <= e;
}

export default function Page() {
  const today = new Date();
  const [lmpDate, setLmpDate] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 14);
    return d.toISOString().split("T")[0];
  });
  const [cycleLength, setCycleLength] = useState(28);
  const [periodDuration, setPeriodDuration] = useState(5);
  const [selectedCycle, setSelectedCycle] = useState(0);

  const cycles = useMemo((): CycleData[] => {
    const lmp = new Date(lmpDate + "T00:00:00");
    if (isNaN(lmp.getTime())) return [];

    const results: CycleData[] = [];
    for (let i = 0; i < 6; i++) {
      const periodStart = addDays(lmp, i * cycleLength);
      const periodEnd = addDays(periodStart, periodDuration - 1);
      // Ovulation occurs ~14 days before next period
      const ovulationDate = addDays(periodStart, cycleLength - 14);
      // Fertile window: 5 days before ovulation + ovulation day
      const fertileStart = addDays(ovulationDate, -5);
      const fertileEnd = ovulationDate;

      results.push({
        cycleNumber: i + 1,
        periodStart,
        periodEnd,
        fertileStart,
        fertileEnd,
        ovulationDate,
      });
    }
    return results;
  }, [lmpDate, cycleLength, periodDuration]);

  // Calendar data: generate months to display (current month + next 5)
  const calendarMonths = useMemo(() => {
    if (cycles.length === 0) return [];
    const firstDate = cycles[0].periodStart;
    const lastDate = cycles[cycles.length - 1].periodEnd;
    const months: { year: number; month: number }[] = [];
    const startMonth = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
    const endMonth = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
    const cur = new Date(startMonth);
    while (cur <= endMonth) {
      months.push({ year: cur.getFullYear(), month: cur.getMonth() });
      cur.setMonth(cur.getMonth() + 1);
    }
    return months;
  }, [cycles]);

  const getDayType = (date: Date): string => {
    for (const c of cycles) {
      if (isSameDay(date, c.ovulationDate)) return "ovulation";
      if (isInRange(date, c.periodStart, c.periodEnd)) return "period";
      if (isInRange(date, c.fertileStart, c.fertileEnd)) return "fertile";
    }
    if (isSameDay(date, today)) return "today";
    return "";
  };

  const dayColorClass = (type: string): string => {
    switch (type) {
      case "period": return "bg-red-500/80 text-white";
      case "fertile": return "bg-purple-500/50 text-purple-100";
      case "ovulation": return "bg-pink-500 text-white font-bold";
      case "today": return "ring-2 ring-blue-500 text-blue-300";
      default: return "text-zinc-500";
    }
  };

  // Cycle regularity insight
  const regularityNote = useMemo(() => {
    if (cycleLength >= 26 && cycleLength <= 30) return { label: "Regular", color: "text-green-400", desc: "Your cycle length is within the typical regular range (26-30 days)." };
    if (cycleLength >= 24 && cycleLength <= 35) return { label: "Normal", color: "text-blue-400", desc: "Your cycle length is within the normal range (24-35 days), though slightly variable." };
    if (cycleLength < 24) return { label: "Short", color: "text-yellow-400", desc: "Cycles shorter than 24 days may indicate hormonal variations. Consider consulting a healthcare provider." };
    return { label: "Long", color: "text-orange-400", desc: "Cycles longer than 35 days may indicate irregular ovulation. Consider consulting a healthcare provider." };
  }, [cycleLength]);

  const nextPeriod = cycles.length > 1 ? cycles[1] : null;
  const daysUntilNext = nextPeriod ? Math.ceil((nextPeriod.periodStart.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <ToolLayout
      title="Period Calculator"
      description="Track and predict your menstrual cycle with our free period calculator. View upcoming periods, fertile windows, and ovulation dates on a visual calendar."
      slug="period-calculator"
      category="Health"
      keywords={[
        "period calculator",
        "menstrual cycle calculator",
        "period tracker",
        "ovulation calculator",
        "fertile window calculator",
        "next period predictor",
        "menstrual calendar",
        "cycle length calculator",
      ]}
      faqs={[
        {
          question: "How does the period calculator predict my next period?",
          answer: "The calculator uses your last menstrual period (LMP) date and average cycle length to predict future periods. It adds your cycle length to the start of each period to estimate when the next one begins. For example, with a 28-day cycle, your next period is predicted 28 days after the start of your last one. This is based on the assumption that your cycles are relatively consistent in length.",
        },
        {
          question: "How is the fertile window calculated?",
          answer: "The fertile window is estimated based on ovulation timing. Ovulation typically occurs about 14 days before the start of your next period. Since sperm can survive up to 5 days in the reproductive tract, the fertile window spans from 5 days before ovulation through the day of ovulation itself -- a total of 6 days. This is the time frame when conception is most likely.",
        },
        {
          question: "What is a normal menstrual cycle length?",
          answer: "A normal menstrual cycle ranges from 21 to 35 days, with 28 days being the commonly cited average. However, most women do not have a perfect 28-day cycle. Cycles between 24 and 35 days are considered normal. Cycle lengths can also vary from month to month due to stress, diet, exercise, illness, or hormonal changes. Consistently irregular cycles may warrant a visit to your healthcare provider.",
        },
        {
          question: "Can I use this calculator for birth control or to get pregnant?",
          answer: "This calculator provides estimates based on averages and should not be used as a sole method of birth control. Ovulation can vary by several days from cycle to cycle, even in women with regular periods. If you are trying to conceive, this calculator can help identify your most fertile days, but consider using ovulation predictor kits or basal body temperature tracking for more accuracy. Always consult your healthcare provider for personalized advice.",
        },
        {
          question: "Why is my period irregular?",
          answer: "Irregular periods can be caused by many factors including stress, significant weight changes, excessive exercise, polycystic ovary syndrome (PCOS), thyroid disorders, perimenopause, or certain medications. Occasional irregularity is common and usually not a concern. However, if your cycles are consistently shorter than 21 days, longer than 35 days, or if you frequently skip periods, consult a healthcare provider for evaluation.",
        },
        {
          question: "How accurate is ovulation prediction?",
          answer: "Calendar-based ovulation prediction assumes ovulation occurs 14 days before your next period. While this is a reasonable average, actual ovulation can vary by several days. Factors like stress, sleep, travel, and illness can shift ovulation timing. For more precise ovulation tracking, consider combining this calculator with basal body temperature charting, cervical mucus observation, or over-the-counter ovulation predictor kits.",
        },
      ]}
      relatedTools={[
        { name: "Pregnancy Calculator", href: "/tools/pregnancy-calculator" },
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
        { name: "Sleep Calculator", href: "/tools/sleep-calculator" },
        { name: "Water Intake Calculator", href: "/tools/water-intake-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">How to Use the Period Calculator</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Enter the first day of your most recent period, your average cycle length (the number of days from the start of one period to the start of the next), and your average period duration. The calculator will project your next 6 cycles, including predicted period dates, fertile windows, and estimated ovulation days. Use the visual calendar below the results to see all your cycle phases color-coded across upcoming months.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Understanding Your Cycle Phases</h2>
            <p className="text-zinc-400 text-sm leading-relaxed">
              A menstrual cycle has four main phases. The <strong className="text-zinc-200">menstrual phase</strong> (your period) is when the uterine lining sheds, typically lasting 3-7 days. The <strong className="text-zinc-200">follicular phase</strong> begins on day 1 of your period and ends at ovulation, during which follicles in the ovaries mature. <strong className="text-zinc-200">Ovulation</strong> occurs mid-cycle when a mature egg is released. The <strong className="text-zinc-200">luteal phase</strong> follows ovulation and lasts until your next period, typically about 14 days.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Tips for Tracking Your Cycle</h2>
            <ul className="text-zinc-400 text-sm leading-relaxed list-disc pl-5 space-y-1">
              <li>Track your period start date each month to calculate your true average cycle length over time.</li>
              <li>Note any symptoms like cramps, mood changes, or spotting to identify your personal patterns.</li>
              <li>Cycle lengths can fluctuate -- track at least 3-6 months for a more accurate average.</li>
              <li>Factors like stress, travel, diet changes, and exercise can temporarily shift your cycle.</li>
              <li>See a healthcare provider if your cycles are consistently outside the 21-35 day range.</li>
            </ul>
          </section>
        </div>
      }
    >
      {/* Inputs and Summary */}
      <div className="grid md:grid-cols-2 gap-6">
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
              onChange={(e) => setCycleLength(Math.max(20, Math.min(45, +e.target.value)))}
              className={inputCls}
              min={20}
              max={45}
            />
            <p className="text-xs text-zinc-500 mt-1">Typical range: 21-35 days</p>
          </div>
          <div>
            <label className={labelCls}>Average Period Duration (days)</label>
            <input
              type="number"
              value={periodDuration}
              onChange={(e) => setPeriodDuration(Math.max(2, Math.min(10, +e.target.value)))}
              className={inputCls}
              min={2}
              max={10}
            />
            <p className="text-xs text-zinc-500 mt-1">Typical range: 3-7 days</p>
          </div>

          {/* Cycle Regularity */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs text-zinc-500">Cycle Regularity</span>
              <span className={`text-xs font-semibold ${regularityNote.color}`}>{regularityNote.label}</span>
            </div>
            <p className="text-xs text-zinc-400">{regularityNote.desc}</p>
          </div>

          {/* Legend */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <p className="text-xs text-zinc-500 mb-2">Calendar Legend</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="text-xs text-zinc-400">Period</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500/50" />
                <span className="text-xs text-zinc-400">Fertile Window</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-xs text-zinc-400">Ovulation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full ring-2 ring-blue-500" />
                <span className="text-xs text-zinc-400">Today</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary + Next Period */}
        <div className="space-y-4">
          {nextPeriod && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-1">Next Period Starts</p>
              <p className="text-3xl font-bold text-red-400">{formatDate(nextPeriod.periodStart)}</p>
              <p className="text-sm text-zinc-500 mt-1">
                {daysUntilNext !== null && daysUntilNext > 0
                  ? `${daysUntilNext} day${daysUntilNext === 1 ? "" : "s"} from now`
                  : daysUntilNext === 0
                  ? "Today"
                  : "Already started"}
              </p>
            </div>
          )}

          {cycles.length > 1 && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Next Ovulation</p>
                <p className="text-sm font-semibold text-pink-400">{formatDate(cycles[1].ovulationDate)}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Fertile Window</p>
                <p className="text-sm font-semibold text-purple-400">
                  {formatDateShort(cycles[1].fertileStart)} - {formatDateShort(cycles[1].fertileEnd)}
                </p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Cycle Length</p>
                <p className="text-sm font-semibold text-zinc-100">{cycleLength} days</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Period Duration</p>
                <p className="text-sm font-semibold text-zinc-100">{periodDuration} days</p>
              </div>
            </div>
          )}

          {/* Upcoming 6 Cycles Table */}
          {cycles.length > 0 && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
              <p className="text-sm font-semibold text-zinc-200 mb-3">Predicted Cycles</p>
              <div className="space-y-2">
                {cycles.map((c, i) => {
                  const isPast = c.periodEnd.getTime() < today.getTime();
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedCycle(i)}
                      className={`w-full text-left rounded-lg p-3 transition-colors ${
                        selectedCycle === i
                          ? "bg-blue-600/20 border border-blue-600/50"
                          : "bg-zinc-900/50 border border-zinc-700 hover:border-zinc-600"
                      } ${isPast ? "opacity-60" : ""}`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-zinc-100">
                            Cycle {c.cycleNumber}
                            {isPast && <span className="text-xs text-zinc-500 ml-2">(past)</span>}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {formatDateShort(c.periodStart)} - {formatDateShort(c.periodEnd)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-pink-400">Ovulation: {formatDateShort(c.ovulationDate)}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Cycle Detail */}
      {cycles[selectedCycle] && (
        <div className="mt-6 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Cycle {cycles[selectedCycle].cycleNumber} Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1">Period</p>
              <p className="text-sm text-red-400 font-medium">
                {formatDateShort(cycles[selectedCycle].periodStart)} - {formatDateShort(cycles[selectedCycle].periodEnd)}
              </p>
              <p className="text-xs text-zinc-600">{periodDuration} days</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Fertile Window</p>
              <p className="text-sm text-purple-400 font-medium">
                {formatDateShort(cycles[selectedCycle].fertileStart)} - {formatDateShort(cycles[selectedCycle].fertileEnd)}
              </p>
              <p className="text-xs text-zinc-600">6 days</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Ovulation</p>
              <p className="text-sm text-pink-400 font-medium">{formatDate(cycles[selectedCycle].ovulationDate)}</p>
              <p className="text-xs text-zinc-600">Day {cycleLength - 14} of cycle</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1">Next Cycle Starts</p>
              <p className="text-sm text-zinc-200 font-medium">
                {selectedCycle < 5 ? formatDate(cycles[selectedCycle + 1].periodStart) : formatDate(addDays(cycles[selectedCycle].periodStart, cycleLength))}
              </p>
              <p className="text-xs text-zinc-600">Day {cycleLength}</p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Calendar */}
      {calendarMonths.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Cycle Calendar</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calendarMonths.map(({ year, month }) => {
              const firstDay = new Date(year, month, 1).getDay();
              const daysInMonth = new Date(year, month + 1, 0).getDate();
              const cells: (number | null)[] = [];
              for (let i = 0; i < firstDay; i++) cells.push(null);
              for (let d = 1; d <= daysInMonth; d++) cells.push(d);

              return (
                <div key={`${year}-${month}`} className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-3">
                  <p className="text-sm font-medium text-zinc-200 mb-2 text-center">
                    {monthNames[month]} {year}
                  </p>
                  <div className="grid grid-cols-7 gap-0.5 text-center">
                    {dayNames.map((d) => (
                      <div key={d} className="text-[10px] text-zinc-600 py-0.5">{d}</div>
                    ))}
                    {cells.map((day, idx) => {
                      if (day === null) return <div key={`e-${idx}`} />;
                      const date = new Date(year, month, day);
                      const type = getDayType(date);
                      const isToday = isSameDay(date, today);
                      return (
                        <div
                          key={day}
                          className={`text-[11px] w-7 h-7 flex items-center justify-center rounded-full mx-auto ${dayColorClass(type)} ${isToday && type !== "today" ? "ring-1 ring-blue-500" : ""}`}
                          title={
                            type === "period" ? "Period" : type === "fertile" ? "Fertile window" : type === "ovulation" ? "Ovulation day" : undefined
                          }
                        >
                          {day}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="mt-8 bg-yellow-500/5 border border-yellow-600/20 rounded-xl p-4">
        <p className="text-xs font-semibold text-yellow-500/80 mb-1">Medical Disclaimer</p>
        <p className="text-xs text-zinc-500 leading-relaxed">
          This period calculator provides estimates based on averages and should not be used as medical advice, for birth control, or as a substitute for professional healthcare guidance. Menstrual cycles can vary significantly between individuals and from cycle to cycle. Factors such as stress, medication, health conditions, and lifestyle changes can affect cycle regularity. If you have concerns about your menstrual health or reproductive planning, please consult a qualified healthcare provider.
        </p>
      </div>
    </ToolLayout>
  );
}

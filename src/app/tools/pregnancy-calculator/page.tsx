"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const today = new Date();
  const [lmpDate, setLmpDate] = useState(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 84); // ~12 weeks ago
    return d.toISOString().split("T")[0];
  });
  const [cycleLength, setCycleLength] = useState(28);

  const result = useMemo(() => {
    const lmp = new Date(lmpDate + "T00:00:00");
    if (isNaN(lmp.getTime())) return null;

    // Naegele's rule: LMP + 280 days (adjusted for cycle length)
    const adjustment = cycleLength - 28;
    const dueDate = new Date(lmp);
    dueDate.setDate(dueDate.getDate() + 280 + adjustment);

    const now = new Date();
    const daysSinceLMP = Math.floor((now.getTime() - lmp.getTime()) / (1000 * 60 * 60 * 24));
    const weeksPregnant = Math.floor(daysSinceLMP / 7);
    const daysExtra = daysSinceLMP % 7;
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Trimester
    let trimester = "";
    if (weeksPregnant < 13) trimester = "First Trimester (Weeks 1-12)";
    else if (weeksPregnant < 27) trimester = "Second Trimester (Weeks 13-26)";
    else trimester = "Third Trimester (Weeks 27-40)";

    // Conception estimate (~2 weeks after LMP)
    const conception = new Date(lmp);
    conception.setDate(conception.getDate() + 14 + adjustment);

    // Key milestones
    const milestones = [
      { week: 6, label: "Heartbeat detectable" },
      { week: 8, label: "All major organs forming" },
      { week: 12, label: "End of first trimester" },
      { week: 16, label: "May feel first movements" },
      { week: 20, label: "Anatomy scan / halfway point" },
      { week: 24, label: "Viability milestone" },
      { week: 28, label: "Third trimester begins" },
      { week: 36, label: "Baby is considered early term" },
      { week: 37, label: "Full term begins" },
      { week: 40, label: "Due date" },
    ];

    const formatDate = (d: Date) => d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    return { dueDate: formatDate(dueDate), weeksPregnant, daysExtra, daysUntilDue, trimester, conception: formatDate(conception), daysSinceLMP, milestones };
  }, [lmpDate, cycleLength]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Pregnancy Due Date Calculator"
      description="Calculate your estimated due date based on your last menstrual period. See trimester, milestones, and conception date."
      slug="pregnancy-calculator"
      category="Health"
      keywords={["pregnancy calculator", "due date calculator", "pregnancy due date calculator", "when is my baby due", "conception date calculator"]}
      faqs={[
        { question: "How is the due date calculated?", answer: "Using Naegele's rule: add 280 days (40 weeks) to the first day of your last menstrual period (LMP). This assumes a 28-day cycle — the calculator adjusts for different cycle lengths." },
        { question: "How accurate is a due date calculator?", answer: "Only about 4% of babies are born on their exact due date. Most arrive within 2 weeks before or after. The due date is an estimate — your healthcare provider may adjust it based on ultrasound measurements." },
        { question: "What is the conception date?", answer: "Conception typically occurs about 14 days after the first day of your last period (at ovulation). This is adjusted for cycle length — longer cycles mean later ovulation." },
      ]}
      relatedTools={[
        { name: "Age Calculator", href: "/tools/age-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>First Day of Last Period</label><input type="date" value={lmpDate} onChange={e => setLmpDate(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Average Cycle Length (days)</label><input type="number" value={cycleLength} onChange={e => setCycleLength(+e.target.value)} className={inputCls} min={20} max={45} /></div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-1">Estimated Due Date</p>
              <p className="text-3xl font-bold text-blue-400">{result.dueDate}</p>
              <p className="text-sm text-zinc-500 mt-1">{result.daysUntilDue > 0 ? `${result.daysUntilDue} days to go` : "Due date has passed"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Current Week</p><p className="text-lg font-semibold text-zinc-100">{result.weeksPregnant}w {result.daysExtra}d</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3"><p className="text-xs text-zinc-500">Trimester</p><p className="text-sm font-semibold text-zinc-100">{result.trimester.split(" (")[0]}</p></div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 col-span-2"><p className="text-xs text-zinc-500">Estimated Conception</p><p className="text-sm font-semibold text-zinc-100">{result.conception}</p></div>
            </div>

            {/* Progress bar */}
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1"><span>Week 0</span><span>Week 40</span></div>
              <div className="w-full bg-zinc-700 rounded-full h-3">
                <div className="bg-blue-500 rounded-full h-3 transition-all" style={{ width: `${Math.min(100, (result.weeksPregnant / 40) * 100)}%` }} />
              </div>
            </div>

            {/* Milestones */}
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
              <p className="text-xs text-zinc-500 mb-2">Key Milestones</p>
              <div className="space-y-1">
                {result.milestones.map(m => {
                  const past = result.weeksPregnant >= m.week;
                  return (
                    <div key={m.week} className={`flex justify-between text-sm px-2 py-1 rounded ${past ? "text-green-400" : result.weeksPregnant >= m.week - 1 ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                      <span>{past ? "\u2713" : "\u25CB"} Week {m.week}</span>
                      <span>{m.label}</span>
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

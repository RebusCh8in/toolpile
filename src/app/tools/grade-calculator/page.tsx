"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

interface Assignment { name: string; score: number; maxScore: number; weight: number }

export default function Page() {
  const [mode, setMode] = useState<"weighted" | "points">("weighted");
  const [assignments, setAssignments] = useState<Assignment[]>([
    { name: "Midterm Exam", score: 85, maxScore: 100, weight: 30 },
    { name: "Final Exam", score: 78, maxScore: 100, weight: 30 },
    { name: "Homework", score: 92, maxScore: 100, weight: 20 },
    { name: "Quizzes", score: 88, maxScore: 100, weight: 10 },
    { name: "Participation", score: 95, maxScore: 100, weight: 10 },
  ]);

  const result = useMemo(() => {
    if (mode === "weighted") {
      const totalWeight = assignments.reduce((s, a) => s + a.weight, 0);
      if (totalWeight === 0) return { grade: 0, letterGrade: "N/A", totalWeight: 0 };
      const weightedSum = assignments.reduce((s, a) => {
        const pct = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
        return s + pct * (a.weight / totalWeight);
      }, 0);
      return { grade: weightedSum, letterGrade: getLetterGrade(weightedSum), totalWeight };
    } else {
      const totalScore = assignments.reduce((s, a) => s + a.score, 0);
      const totalMax = assignments.reduce((s, a) => s + a.maxScore, 0);
      const pct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;
      return { grade: pct, letterGrade: getLetterGrade(pct), totalWeight: 0, totalScore, totalMax };
    }
  }, [assignments, mode]);

  function getLetterGrade(pct: number) {
    if (pct >= 97) return "A+";
    if (pct >= 93) return "A";
    if (pct >= 90) return "A-";
    if (pct >= 87) return "B+";
    if (pct >= 83) return "B";
    if (pct >= 80) return "B-";
    if (pct >= 77) return "C+";
    if (pct >= 73) return "C";
    if (pct >= 70) return "C-";
    if (pct >= 67) return "D+";
    if (pct >= 63) return "D";
    if (pct >= 60) return "D-";
    return "F";
  }

  const updateAssignment = (i: number, field: keyof Assignment, value: string | number) => {
    setAssignments(prev => prev.map((a, idx) => idx === i ? { ...a, [field]: value } : a));
  };

  const addAssignment = () => setAssignments(prev => [...prev, { name: `Assignment ${prev.length + 1}`, score: 0, maxScore: 100, weight: 10 }]);
  const removeAssignment = (i: number) => setAssignments(prev => prev.filter((_, idx) => idx !== i));

  const inputCls = "bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500";

  return (
    <ToolLayout
      title="Grade Calculator"
      description="Calculate your class grade with weighted or points-based grading. Add assignments with scores and weights."
      slug="grade-calculator"
      category="Utility"
      keywords={["grade calculator", "final grade calculator", "weighted grade calculator", "class grade calculator", "grade average calculator"]}
      faqs={[
        { question: "How do weighted grades work?", answer: "Each category has a percentage weight. A midterm worth 30% with a score of 85% contributes 85 × 0.30 = 25.5 to your grade. All weighted contributions sum to your final percentage." },
        { question: "What grade do I need on the final?", answer: "Use the formula: Needed = (Target Grade - Current Weighted Sum) ÷ Final Weight. If you have 72% weighted so far and the final is worth 30%, to get a 80%: (80 - 72) ÷ 0.30 = 26.67 more points needed, so 26.67/30 × 100 = ~89% on the final." },
        { question: "What is the standard grading scale?", answer: "A: 90-100%, B: 80-89%, C: 70-79%, D: 60-69%, F: below 60%. With +/- grades: A+ 97+, A 93-96, A- 90-92, B+ 87-89, etc." },
      ]}
      relatedTools={[
        { name: "GPA Calculator", href: "/tools/gpa-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
      ]}
    >
      <div className="flex gap-2 mb-6">
        <button onClick={() => setMode("weighted")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "weighted" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Weighted</button>
        <button onClick={() => setMode("points")} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${mode === "points" ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>Points</button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="flex gap-2 text-xs text-zinc-500 px-1">
            <span className="w-28">Name</span><span className="w-14">Score</span><span className="w-14">Max</span>
            {mode === "weighted" && <span className="w-14">Weight%</span>}
            <span className="w-6" />
          </div>
          {assignments.map((a, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input type="text" value={a.name} onChange={e => updateAssignment(i, "name", e.target.value)} className={`${inputCls} w-28`} />
              <input type="number" value={a.score} onChange={e => updateAssignment(i, "score", +e.target.value)} className={`${inputCls} w-14`} min={0} />
              <input type="number" value={a.maxScore} onChange={e => updateAssignment(i, "maxScore", +e.target.value)} className={`${inputCls} w-14`} min={1} />
              {mode === "weighted" && <input type="number" value={a.weight} onChange={e => updateAssignment(i, "weight", +e.target.value)} className={`${inputCls} w-14`} min={0} max={100} />}
              <button onClick={() => removeAssignment(i)} className="text-zinc-500 hover:text-red-400 text-sm w-6">×</button>
            </div>
          ))}
          <button onClick={addAssignment} className="text-sm text-blue-400 hover:text-blue-300">+ Add Assignment</button>
          {mode === "weighted" && result.totalWeight !== 100 && result.totalWeight > 0 && (
            <p className="text-xs text-yellow-400">Weights total {result.totalWeight}% (should be 100%)</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Your Grade</p>
            <p className="text-5xl font-bold text-blue-400">{result.grade.toFixed(1)}%</p>
            <p className="text-2xl font-semibold text-zinc-300 mt-1">{result.letterGrade}</p>
          </div>

          {/* Per-assignment breakdown */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Breakdown</p>
            <div className="space-y-1">
              {assignments.map((a, i) => {
                const pct = a.maxScore > 0 ? (a.score / a.maxScore) * 100 : 0;
                return (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-zinc-400 truncate w-32">{a.name}</span>
                    <span className="text-zinc-300">{a.score}/{a.maxScore}</span>
                    <span className={`${pct >= 70 ? "text-green-400" : pct >= 60 ? "text-yellow-400" : "text-red-400"}`}>{pct.toFixed(0)}%</span>
                    {mode === "weighted" && <span className="text-zinc-500 w-12 text-right">{a.weight}%w</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Letter grade scale */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">Grading Scale</p>
            <div className="grid grid-cols-4 gap-1 text-xs">
              {[["A+", "97-100"], ["A", "93-96"], ["A-", "90-92"], ["B+", "87-89"], ["B", "83-86"], ["B-", "80-82"], ["C+", "77-79"], ["C", "73-76"], ["C-", "70-72"], ["D+", "67-69"], ["D", "63-66"], ["F", "<60"]].map(([g, r]) => (
                <div key={g} className={`flex justify-between px-1 rounded ${result.letterGrade === g ? "bg-blue-600/20 text-blue-300" : "text-zinc-400"}`}>
                  <span>{g}</span><span>{r}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

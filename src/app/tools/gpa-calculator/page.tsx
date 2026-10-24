"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

const gradePoints: Record<string, number> = {
  "A+": 4.0, "A": 4.0, "A-": 3.7,
  "B+": 3.3, "B": 3.0, "B-": 2.7,
  "C+": 2.3, "C": 2.0, "C-": 1.7,
  "D+": 1.3, "D": 1.0, "D-": 0.7,
  "F": 0.0,
};

const gradeOptions = Object.keys(gradePoints);

interface Course { name: string; grade: string; credits: number }

export default function Page() {
  const [courses, setCourses] = useState<Course[]>([
    { name: "Math 101", grade: "A", credits: 3 },
    { name: "English 102", grade: "B+", credits: 3 },
    { name: "Science 201", grade: "A-", credits: 4 },
    { name: "History 101", grade: "B", credits: 3 },
    { name: "Art 100", grade: "A", credits: 2 },
  ]);
  const [cumulativeGPA, setCumulativeGPA] = useState(0);
  const [cumulativeCredits, setCumulativeCredits] = useState(0);

  const result = useMemo(() => {
    const validCourses = courses.filter(c => c.credits > 0);
    const totalCredits = validCourses.reduce((s, c) => s + c.credits, 0);
    const totalPoints = validCourses.reduce((s, c) => s + gradePoints[c.grade] * c.credits, 0);
    const semesterGPA = totalCredits > 0 ? totalPoints / totalCredits : 0;

    let overallGPA = semesterGPA;
    if (cumulativeCredits > 0) {
      const prevPoints = cumulativeGPA * cumulativeCredits;
      overallGPA = (prevPoints + totalPoints) / (cumulativeCredits + totalCredits);
    }

    return { semesterGPA, totalCredits, totalPoints, overallGPA };
  }, [courses, cumulativeGPA, cumulativeCredits]);

  const updateCourse = (index: number, field: keyof Course, value: string | number) => {
    setCourses(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  const addCourse = () => setCourses(prev => [...prev, { name: `Course ${prev.length + 1}`, grade: "A", credits: 3 }]);
  const removeCourse = (index: number) => setCourses(prev => prev.filter((_, i) => i !== index));

  const inputCls = "bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="GPA Calculator"
      description="Calculate your semester and cumulative GPA. Add courses with grades and credit hours for instant results."
      slug="gpa-calculator"
      category="Utility"
      keywords={["gpa calculator", "grade point average calculator", "college gpa calculator", "cumulative gpa calculator", "semester gpa calculator"]}
      faqs={[
        { question: "How is GPA calculated?", answer: "GPA = Total Quality Points ÷ Total Credit Hours. Quality points = Grade Points × Credits. An A (4.0) in a 3-credit course = 12 quality points. Sum all quality points and divide by total credits." },
        { question: "What GPA scale is used?", answer: "The standard 4.0 scale: A/A+ = 4.0, A- = 3.7, B+ = 3.3, B = 3.0, B- = 2.7, C+ = 2.3, C = 2.0, C- = 1.7, D+ = 1.3, D = 1.0, F = 0.0." },
        { question: "What is a good GPA?", answer: "3.5+ is excellent (dean's list at most schools). 3.0-3.49 is good. 2.5-2.99 is average. Below 2.0 may trigger academic probation. For grad school, aim for 3.3+; for top programs, 3.7+." },
      ]}
      relatedTools={[
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Grade Calculator", href: "/tools/grade-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex gap-2 text-xs text-zinc-500 px-1">
              <span className="w-28">Course</span><span className="w-20">Grade</span><span className="w-16">Credits</span><span className="w-8" />
            </div>
            {courses.map((c, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" value={c.name} onChange={e => updateCourse(i, "name", e.target.value)} className={`${inputCls} w-28`} />
                <select value={c.grade} onChange={e => updateCourse(i, "grade", e.target.value)} className={`${inputCls} w-20`}>
                  {gradeOptions.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <input type="number" value={c.credits} onChange={e => updateCourse(i, "credits", +e.target.value)} className={`${inputCls} w-16`} min={0} max={10} />
                <button onClick={() => removeCourse(i)} className="text-zinc-500 hover:text-red-400 text-sm">×</button>
              </div>
            ))}
            <button onClick={addCourse} className="text-sm text-blue-400 hover:text-blue-300">+ Add Course</button>
          </div>

          <div className="border-t border-zinc-700 pt-4">
            <p className="text-sm text-zinc-400 mb-2">Previous Cumulative GPA (optional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Current GPA</label><input type="number" value={cumulativeGPA} onChange={e => setCumulativeGPA(+e.target.value)} className={`${inputCls} w-full`} min={0} max={4} step={0.01} /></div>
              <div><label className={labelCls}>Total Credits</label><input type="number" value={cumulativeCredits} onChange={e => setCumulativeCredits(+e.target.value)} className={`${inputCls} w-full`} min={0} /></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Semester GPA</p>
            <p className="text-5xl font-bold text-blue-400">{result.semesterGPA.toFixed(2)}</p>
            <p className="text-xs text-zinc-500 mt-1">{result.totalCredits} credit hours</p>
          </div>
          {cumulativeCredits > 0 && (
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 text-center">
              <p className="text-sm text-zinc-400 mb-1">Cumulative GPA</p>
              <p className="text-3xl font-bold text-green-400">{result.overallGPA.toFixed(2)}</p>
              <p className="text-xs text-zinc-500 mt-1">{cumulativeCredits + result.totalCredits} total credits</p>
            </div>
          )}

          {/* GPA scale reference */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
            <p className="text-xs text-zinc-500 mb-2">GPA Scale</p>
            <div className="grid grid-cols-4 gap-1 text-sm">
              {gradeOptions.map(g => (
                <div key={g} className="flex justify-between px-1">
                  <span className="text-zinc-400">{g}</span>
                  <span className="text-zinc-100">{gradePoints[g].toFixed(1)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

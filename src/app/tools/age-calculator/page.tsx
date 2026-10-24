"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const today = new Date();
  const [birthDate, setBirthDate] = useState(`${today.getFullYear() - 25}-06-15`);
  const [targetDate, setTargetDate] = useState(today.toISOString().split("T")[0]);

  const result = useMemo(() => {
    const birth = new Date(birthDate + "T00:00:00");
    const target = new Date(targetDate + "T00:00:00");
    if (isNaN(birth.getTime()) || isNaN(target.getTime())) return null;

    const diff = target.getTime() - birth.getTime();
    if (diff < 0) return null;

    // Calculate years, months, days
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();
    if (days < 0) {
      months--;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;

    // Next birthday
    let nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday <= target) nextBday = new Date(target.getFullYear() + 1, birth.getMonth(), birth.getDate());
    const daysUntilBday = Math.ceil((nextBday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));

    // Day of week born
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const bornDay = dayNames[birth.getDay()];

    // Zodiac
    const m = birth.getMonth() + 1;
    const d = birth.getDate();
    let zodiac = "";
    if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) zodiac = "Aquarius";
    else if ((m === 2 && d >= 19) || (m === 3 && d <= 20)) zodiac = "Pisces";
    else if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) zodiac = "Aries";
    else if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) zodiac = "Taurus";
    else if ((m === 5 && d >= 21) || (m === 6 && d <= 20)) zodiac = "Gemini";
    else if ((m === 6 && d >= 21) || (m === 7 && d <= 22)) zodiac = "Cancer";
    else if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) zodiac = "Leo";
    else if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) zodiac = "Virgo";
    else if ((m === 9 && d >= 23) || (m === 10 && d <= 22)) zodiac = "Libra";
    else if ((m === 10 && d >= 23) || (m === 11 && d <= 21)) zodiac = "Scorpio";
    else if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) zodiac = "Sagittarius";
    else zodiac = "Capricorn";

    return { years, months, days, totalDays, totalWeeks, totalMonths, totalHours, totalMinutes, daysUntilBday, bornDay, zodiac };
  }, [birthDate, targetDate]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  return (
    <ToolLayout
      title="Age Calculator"
      description="Calculate your exact age in years, months, days, hours, and minutes. See your zodiac sign, birth day, and days until next birthday."
      slug="age-calculator"
      category="Utility"
      keywords={["age calculator", "how old am I", "calculate age", "age in days calculator", "birthday calculator"]}
      faqs={[
        { question: "How is age calculated?", answer: "Age is calculated as the number of complete years between the birth date and the target date. The months and days represent the remaining partial year. This is the standard way age is counted worldwide." },
        { question: "Does this account for leap years?", answer: "Yes. The calculation uses actual calendar dates, so leap years (February 29) are handled correctly. If you were born on Feb 29, your birthday falls on March 1 in non-leap years." },
      ]}
      relatedTools={[
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
      ]}
    >
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div><label className={labelCls}>Date of Birth</label><input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} className={inputCls} /></div>
          <div><label className={labelCls}>Target Date</label><input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className={inputCls} /></div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-1">Your Age</p>
              <p className="text-4xl font-bold text-blue-400">{result.years} <span className="text-lg text-zinc-400">years</span> {result.months} <span className="text-lg text-zinc-400">months</span> {result.days} <span className="text-lg text-zinc-400">days</span></p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ["Total Months", result.totalMonths.toLocaleString()],
                ["Total Weeks", result.totalWeeks.toLocaleString()],
                ["Total Days", result.totalDays.toLocaleString()],
                ["Total Hours", result.totalHours.toLocaleString()],
                ["Total Minutes", result.totalMinutes.toLocaleString()],
                ["Next Birthday", `${result.daysUntilBday} days`],
              ].map(([label, val]) => (
                <div key={label} className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">{label}</p>
                  <p className="text-sm font-semibold text-zinc-100">{val}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Born on</p>
                <p className="text-sm font-semibold text-zinc-100">{result.bornDay}</p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                <p className="text-xs text-zinc-500">Zodiac Sign</p>
                <p className="text-sm font-semibold text-zinc-100">{result.zodiac}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

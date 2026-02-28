"use client";

import { useState, useMemo } from "react";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";

type Category = "Length" | "Weight" | "Temperature" | "Data" | "Time";

interface UnitDef {
  name: string;
  abbr: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const units: Record<Category, UnitDef[]> = {
  Length: [
    { name: "Millimeters", abbr: "mm", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { name: "Centimeters", abbr: "cm", toBase: (v) => v / 100, fromBase: (v) => v * 100 },
    { name: "Meters", abbr: "m", toBase: (v) => v, fromBase: (v) => v },
    { name: "Kilometers", abbr: "km", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
    { name: "Inches", abbr: "in", toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
    { name: "Feet", abbr: "ft", toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
    { name: "Yards", abbr: "yd", toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
    { name: "Miles", abbr: "mi", toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
  ],
  Weight: [
    { name: "Milligrams", abbr: "mg", toBase: (v) => v / 1e6, fromBase: (v) => v * 1e6 },
    { name: "Grams", abbr: "g", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { name: "Kilograms", abbr: "kg", toBase: (v) => v, fromBase: (v) => v },
    { name: "Ounces", abbr: "oz", toBase: (v) => v * 0.0283495, fromBase: (v) => v / 0.0283495 },
    { name: "Pounds", abbr: "lb", toBase: (v) => v * 0.453592, fromBase: (v) => v / 0.453592 },
    { name: "Metric Tons", abbr: "ton", toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
  ],
  Temperature: [
    { name: "Celsius", abbr: "\u00B0C", toBase: (v) => v, fromBase: (v) => v },
    { name: "Fahrenheit", abbr: "\u00B0F", toBase: (v) => (v - 32) * (5 / 9), fromBase: (v) => v * (9 / 5) + 32 },
    { name: "Kelvin", abbr: "K", toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
  ],
  Data: [
    { name: "Bytes", abbr: "B", toBase: (v) => v, fromBase: (v) => v },
    { name: "Kilobytes", abbr: "KB", toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
    { name: "Megabytes", abbr: "MB", toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
    { name: "Gigabytes", abbr: "GB", toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
    { name: "Terabytes", abbr: "TB", toBase: (v) => v * 1.0995e12, fromBase: (v) => v / 1.0995e12 },
    { name: "Petabytes", abbr: "PB", toBase: (v) => v * 1.1259e15, fromBase: (v) => v / 1.1259e15 },
  ],
  Time: [
    { name: "Milliseconds", abbr: "ms", toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
    { name: "Seconds", abbr: "s", toBase: (v) => v, fromBase: (v) => v },
    { name: "Minutes", abbr: "min", toBase: (v) => v * 60, fromBase: (v) => v / 60 },
    { name: "Hours", abbr: "hr", toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
    { name: "Days", abbr: "day", toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
    { name: "Weeks", abbr: "week", toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
    { name: "Months", abbr: "month", toBase: (v) => v * 2629800, fromBase: (v) => v / 2629800 },
    { name: "Years", abbr: "year", toBase: (v) => v * 31557600, fromBase: (v) => v / 31557600 },
  ],
};

const categories: Category[] = ["Length", "Weight", "Temperature", "Data", "Time"];

export default function UnitConverterPage() {
  const [category, setCategory] = useState<Category>("Length");
  const [inputVal, setInputVal] = useState("1");
  const [fromUnit, setFromUnit] = useState(0);
  const [toUnit, setToUnit] = useState(1);

  const currentUnits = units[category];

  const result = useMemo(() => {
    const num = parseFloat(inputVal);
    if (isNaN(num)) return "";
    const baseVal = currentUnits[fromUnit].toBase(num);
    const converted = currentUnits[toUnit].fromBase(baseVal);
    // Format smartly
    if (Math.abs(converted) < 0.001 && converted !== 0) {
      return converted.toExponential(6);
    }
    return parseFloat(converted.toPrecision(10)).toString();
  }, [inputVal, fromUnit, toUnit, currentUnits]);

  const swap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result) setInputVal(result);
  };

  const handleCategoryChange = (cat: Category) => {
    setCategory(cat);
    setFromUnit(0);
    setToUnit(1);
    setInputVal("1");
  };

  // Common conversions reference
  const commonConversions = useMemo(() => {
    const num = parseFloat(inputVal);
    if (isNaN(num)) return [];
    const baseVal = currentUnits[fromUnit].toBase(num);
    return currentUnits
      .map((u, i) => ({
        name: u.name,
        abbr: u.abbr,
        value: parseFloat(u.fromBase(baseVal).toPrecision(8)),
        idx: i,
      }))
      .filter((u) => u.idx !== fromUnit);
  }, [inputVal, fromUnit, currentUnits]);

  return (
    <ToolLayout
      title="Unit Converter"
      description="Convert between length, weight, temperature, data, and time units instantly."
      category="Utility"
      slug="unit-converter"
      keywords={[
        "unit converter",
        "convert units online",
        "length converter",
        "weight converter",
        "temperature converter",
        "data size converter",
        "km to miles",
        "kg to lbs",
      ]}
      guide={
        <>
          <h2>What Is the Unit Converter?</h2>
          <p>
            The Unit Converter is a free online tool that lets you convert between common measurement units across five categories: length, weight, temperature, data storage, and time. Enter a value, pick your source and target units, and get an instant result with no page reloads.
          </p>
          <p>
            All conversions happen in your browser in real time as you type. The tool also shows a complete reference table so you can see your value expressed in every available unit at once.
          </p>

          <h3>How to Use the Unit Converter</h3>
          <ul>
            <li>Select a category tab: Length, Weight, Temperature, Data, or Time.</li>
            <li>Choose your source unit in the From dropdown and your target unit in the To dropdown.</li>
            <li>Type a number in the input field. The converted result updates instantly.</li>
            <li>Click the swap button between the two columns to reverse the conversion direction. The current result becomes the new input value.</li>
            <li>Scroll down to the reference table to see your value converted to all units in the selected category.</li>
          </ul>

          <h3>Supported Unit Categories</h3>
          <p>
            Length conversions include millimeters, centimeters, meters, kilometers, inches, feet, yards, and miles. Weight covers milligrams, grams, kilograms, ounces, pounds, and metric tons. Temperature handles Celsius, Fahrenheit, and Kelvin. Data storage converts between bytes, kilobytes, megabytes, gigabytes, terabytes, and petabytes. Time includes milliseconds, seconds, minutes, hours, days, weeks, months, and years.
          </p>

          <h3>Tips for Accurate Conversions</h3>
          <p>
            The converter uses precise conversion factors and displays results with up to 10 significant digits. Very small values are shown in scientific notation for clarity. Temperature conversions use the standard formulas relating Celsius, Fahrenheit, and Kelvin, not simple multiplication.
          </p>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Converting between metric and imperial measurements for recipes, travel, or science</li>
            <li>Calculating file and storage sizes across different data units</li>
            <li>Converting time durations for project planning or scheduling</li>
            <li>Quick reference when working with international standards or documentation</li>
            <li>Homework and study aid for unit conversion problems</li>
          </ul>
        </>
      }
      faqs={[
        {
          question: "How do I convert kilometers to miles?",
          answer: "Select the Length category, choose Kilometers as the From unit and Miles as the To unit, then enter your value. One kilometer equals approximately 0.6214 miles."
        },
        {
          question: "How do I convert Celsius to Fahrenheit?",
          answer: "Select the Temperature category, choose Celsius as the From unit and Fahrenheit as the To unit. The formula used is F = C x 9/5 + 32. For example, 100 degrees Celsius equals 212 degrees Fahrenheit."
        },
        {
          question: "What is the difference between MB and GB?",
          answer: "One gigabyte (GB) equals 1024 megabytes (MB). Select the Data category to convert between any data storage units from bytes up to petabytes."
        },
        {
          question: "Can I convert between metric and imperial units?",
          answer: "Yes. The Length and Weight categories both include metric units (meters, kilograms) and imperial units (feet, pounds). Select any combination and the converter handles the math automatically."
        },
        {
          question: "How many seconds are in a year?",
          answer: "There are approximately 31,557,600 seconds in a year. Enter 1 in the Time category with Years as the source and Seconds as the target to see this calculated instantly."
        },
        {
          question: "Does this unit converter work offline?",
          answer: "Once the page has loaded, all conversions run entirely in your browser with no server requests. You can use it without an active internet connection after the initial page load."
        },
      ] as FAQ[]}
      relatedTools={[
        { name: "Aspect Ratio Calculator", href: "/tools/aspect-ratio-calculator" },
        { name: "JSON Formatter", href: "/tools/json-formatter" },
        { name: "Word Counter", href: "/tools/word-counter" },
        { name: "Base64 Encoder", href: "/tools/base64-encoder" },
      ] as RelatedTool[]}
    >
      <div className="space-y-6">
        {/* Category tabs */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Converter */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="grid grid-cols-[1fr,auto,1fr] items-end gap-4">
            {/* From */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">From</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500"
              >
                {currentUnits.map((u, i) => (
                  <option key={i} value={i}>{u.name} ({u.abbr})</option>
                ))}
              </select>
              <input
                type="number"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-3 text-lg text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            {/* Swap */}
            <button
              onClick={swap}
              className="mb-2 rounded-lg bg-zinc-800 p-3 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors"
              title="Swap units"
            >
              &#8644;
            </button>

            {/* To */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">To</label>
              <select
                value={toUnit}
                onChange={(e) => setToUnit(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500"
              >
                {currentUnits.map((u, i) => (
                  <option key={i} value={i}>{u.name} ({u.abbr})</option>
                ))}
              </select>
              <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-3 text-lg font-medium text-blue-400">
                {result || "0"}
              </div>
            </div>
          </div>
        </div>

        {/* Reference table */}
        {commonConversions.length > 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <h3 className="mb-3 text-sm font-semibold text-zinc-300">
              {inputVal} {currentUnits[fromUnit].abbr} in other units
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {commonConversions.map((c) => (
                <div key={c.idx} className="flex items-center justify-between rounded bg-zinc-800 px-3 py-2">
                  <span className="text-sm text-zinc-400">{c.name}</span>
                  <span className="font-mono text-sm text-zinc-200">
                    {typeof c.value === "number" && Math.abs(c.value) < 0.001 && c.value !== 0
                      ? c.value.toExponential(4)
                      : c.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  );
}

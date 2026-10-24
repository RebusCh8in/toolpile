"use client";
import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ─── types ─── */
type Shape = "slab" | "cylinder" | "wall" | "stairs";
type UnitSystem = "imperial" | "metric";

interface Section {
  id: number;
  name: string;
  shape: Shape;
  // slab / wall
  length: string;
  width: string;
  depth: string;
  // cylinder
  diameter: string;
  height: string;
  // stairs
  steps: string;
  rise: string;
  run: string;
  stairWidth: string;
}

const EMPTY_SECTION = (id: number): Section => ({
  id,
  name: `Section ${id}`,
  shape: "slab",
  length: "",
  width: "",
  depth: "",
  diameter: "",
  height: "",
  steps: "",
  rise: "",
  run: "",
  stairWidth: "",
});

/* ─── bag coverage in cubic feet ─── */
const BAG_COVERAGE_CF: Record<string, number> = {
  "40": 0.30,
  "60": 0.45,
  "80": 0.60,
};

/* ─── reference depths ─── */
const COMMON_DEPTHS = [
  { use: "Sidewalk", depth: '4"', cm: "10 cm" },
  { use: "Patio", depth: '4"', cm: "10 cm" },
  { use: "Driveway", depth: '6"', cm: "15 cm" },
  { use: "Garage Floor", depth: '6"', cm: "15 cm" },
  { use: "Foundation Wall", depth: '8"', cm: "20 cm" },
  { use: "Footer / Footing", depth: '12"', cm: "30 cm" },
  { use: "Structural Column", depth: '12"', cm: "30 cm" },
  { use: "Retaining Wall", depth: '8-12"', cm: "20-30 cm" },
];

/* ─── helpers ─── */
function n(v: string): number {
  const x = parseFloat(v);
  return isNaN(x) || x < 0 ? 0 : x;
}

function fmt(v: number, decimals = 2): string {
  if (isNaN(v) || !isFinite(v)) return "0";
  return v.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Convert a dimension value to feet based on the unit system */
function toFeet(value: number, units: UnitSystem): number {
  return units === "imperial" ? value : value * 3.28084;
}

/** Compute cubic feet for one section */
function sectionCubicFeet(s: Section, units: UnitSystem): number {
  switch (s.shape) {
    case "slab": {
      const l = toFeet(n(s.length), units);
      const w = toFeet(n(s.width), units);
      // depth is in inches (imperial) or cm (metric) for usability
      const d =
        units === "imperial"
          ? n(s.depth) / 12
          : (n(s.depth) / 100) * 3.28084;
      return l * w * d;
    }
    case "cylinder": {
      const r = toFeet(n(s.diameter), units) / 2;
      const h = toFeet(n(s.height), units);
      return Math.PI * r * r * h;
    }
    case "wall": {
      const l = toFeet(n(s.length), units);
      const h = toFeet(n(s.height), units);
      // width in inches / cm
      const w =
        units === "imperial"
          ? n(s.width) / 12
          : (n(s.width) / 100) * 3.28084;
      return l * h * w;
    }
    case "stairs": {
      const count = Math.floor(n(s.steps));
      const riseIn = n(s.rise);
      const runIn = n(s.run);
      const widthVal = n(s.stairWidth);
      if (count === 0 || riseIn === 0 || runIn === 0 || widthVal === 0) return 0;
      const widthFt = toFeet(widthVal, units);
      // Each step is a rectangular prism: run x rise x width
      // Step i (1-indexed) has a rise of i * rise (the fill below all steps above)
      // Standard concrete stair fill: sum of i * rise * run * width for i=1..n
      let totalCf = 0;
      for (let i = 1; i <= count; i++) {
        const riseFt =
          units === "imperial"
            ? (i * riseIn) / 12
            : (i * riseIn / 100) * 3.28084;
        const runFt =
          units === "imperial"
            ? runIn / 12
            : (runIn / 100) * 3.28084;
        totalCf += riseFt * runFt * widthFt;
      }
      return totalCf;
    }
    default:
      return 0;
  }
}

/* ─── component ─── */
export default function Page() {
  const [sections, setSections] = useState<Section[]>([EMPTY_SECTION(1)]);
  const [units, setUnits] = useState<UnitSystem>("imperial");
  const [wastePct, setWastePct] = useState("10");
  const [pricePerYard, setPricePerYard] = useState("150");
  const [nextId, setNextId] = useState(2);

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-xs text-zinc-400 mb-1";
  const btnCls =
    "px-4 py-2 rounded-lg text-sm font-medium transition-colors";

  /* section CRUD */
  const addSection = useCallback(() => {
    setSections((p) => [...p, EMPTY_SECTION(nextId)]);
    setNextId((i) => i + 1);
  }, [nextId]);

  const removeSection = useCallback((id: number) => {
    setSections((p) => (p.length === 1 ? p : p.filter((s) => s.id !== id)));
  }, []);

  const updateSection = useCallback(
    (id: number, patch: Partial<Section>) => {
      setSections((p) =>
        p.map((s) => (s.id === id ? { ...s, ...patch } : s))
      );
    },
    []
  );

  /* ─── totals ─── */
  const waste = Math.max(0, Math.min(50, n(wastePct))) / 100;
  const sectionVolumes = sections.map((s) => sectionCubicFeet(s, units));
  const rawCf = sectionVolumes.reduce((a, b) => a + b, 0);
  const totalCf = rawCf * (1 + waste);
  const totalCy = totalCf / 27;
  const totalCm = totalCf * 0.0283168;
  const cost = totalCy * n(pricePerYard);

  const bags = (size: string) =>
    totalCf > 0 ? Math.ceil(totalCf / BAG_COVERAGE_CF[size]) : 0;

  /* ─── shape labels & icons ─── */
  const shapeOptions: { value: Shape; label: string }[] = [
    { value: "slab", label: "Slab / Square" },
    { value: "cylinder", label: "Cylinder / Column" },
    { value: "wall", label: "Wall / Footer" },
    { value: "stairs", label: "Stairs" },
  ];

  const dimLabel = (imperial: string, metric: string) =>
    units === "imperial" ? imperial : metric;

  /* ─── render section fields ─── */
  function renderFields(s: Section) {
    switch (s.shape) {
      case "slab":
        return (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>
                Length ({dimLabel("ft", "m")})
              </label>
              <input
                type="number"
                min="0"
                value={s.length}
                onChange={(e) =>
                  updateSection(s.id, { length: e.target.value })
                }
                className={inputCls}
                placeholder="10"
              />
            </div>
            <div>
              <label className={labelCls}>
                Width ({dimLabel("ft", "m")})
              </label>
              <input
                type="number"
                min="0"
                value={s.width}
                onChange={(e) =>
                  updateSection(s.id, { width: e.target.value })
                }
                className={inputCls}
                placeholder="10"
              />
            </div>
            <div>
              <label className={labelCls}>
                Depth ({dimLabel("in", "cm")})
              </label>
              <input
                type="number"
                min="0"
                value={s.depth}
                onChange={(e) =>
                  updateSection(s.id, { depth: e.target.value })
                }
                className={inputCls}
                placeholder="4"
              />
            </div>
          </div>
        );
      case "cylinder":
        return (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>
                Diameter ({dimLabel("ft", "m")})
              </label>
              <input
                type="number"
                min="0"
                value={s.diameter}
                onChange={(e) =>
                  updateSection(s.id, { diameter: e.target.value })
                }
                className={inputCls}
                placeholder="2"
              />
            </div>
            <div>
              <label className={labelCls}>
                Height ({dimLabel("ft", "m")})
              </label>
              <input
                type="number"
                min="0"
                value={s.height}
                onChange={(e) =>
                  updateSection(s.id, { height: e.target.value })
                }
                className={inputCls}
                placeholder="3"
              />
            </div>
          </div>
        );
      case "wall":
        return (
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>
                Length ({dimLabel("ft", "m")})
              </label>
              <input
                type="number"
                min="0"
                value={s.length}
                onChange={(e) =>
                  updateSection(s.id, { length: e.target.value })
                }
                className={inputCls}
                placeholder="20"
              />
            </div>
            <div>
              <label className={labelCls}>
                Height ({dimLabel("ft", "m")})
              </label>
              <input
                type="number"
                min="0"
                value={s.height}
                onChange={(e) =>
                  updateSection(s.id, { height: e.target.value })
                }
                className={inputCls}
                placeholder="4"
              />
            </div>
            <div>
              <label className={labelCls}>
                Width ({dimLabel("in", "cm")})
              </label>
              <input
                type="number"
                min="0"
                value={s.width}
                onChange={(e) =>
                  updateSection(s.id, { width: e.target.value })
                }
                className={inputCls}
                placeholder="8"
              />
            </div>
          </div>
        );
      case "stairs":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Number of Steps</label>
              <input
                type="number"
                min="1"
                step="1"
                value={s.steps}
                onChange={(e) =>
                  updateSection(s.id, { steps: e.target.value })
                }
                className={inputCls}
                placeholder="5"
              />
            </div>
            <div>
              <label className={labelCls}>
                Rise ({dimLabel("in", "cm")})
              </label>
              <input
                type="number"
                min="0"
                value={s.rise}
                onChange={(e) =>
                  updateSection(s.id, { rise: e.target.value })
                }
                className={inputCls}
                placeholder="7"
              />
            </div>
            <div>
              <label className={labelCls}>
                Run ({dimLabel("in", "cm")})
              </label>
              <input
                type="number"
                min="0"
                value={s.run}
                onChange={(e) =>
                  updateSection(s.id, { run: e.target.value })
                }
                className={inputCls}
                placeholder="11"
              />
            </div>
            <div>
              <label className={labelCls}>
                Width ({dimLabel("ft", "m")})
              </label>
              <input
                type="number"
                min="0"
                value={s.stairWidth}
                onChange={(e) =>
                  updateSection(s.id, { stairWidth: e.target.value })
                }
                className={inputCls}
                placeholder="3"
              />
            </div>
          </div>
        );
    }
  }

  return (
    <ToolLayout
      title="Concrete Calculator"
      description="Calculate how much concrete you need for slabs, columns, walls, and stairs. Get cubic yards, bags needed, waste factors, and cost estimates for any project."
      slug="concrete-calculator"
      category="Utility"
      keywords={[
        "concrete calculator",
        "concrete yard calculator",
        "concrete slab calculator",
        "how much concrete do I need",
        "concrete bag calculator",
        "cubic yard calculator",
        "concrete cost estimator",
        "concrete stair calculator",
        "concrete column calculator",
        "concrete footer calculator",
      ]}
      faqs={[
        {
          question: "How do I calculate how much concrete I need?",
          answer:
            "Measure the length, width, and depth (thickness) of your project area. Multiply these three dimensions together to get the volume. For rectangular slabs, use length x width x depth. For cylinders, use pi x radius squared x height. Always add 5-10% extra for waste, spillage, and uneven subgrade.",
        },
        {
          question: "How many bags of concrete do I need?",
          answer:
            "First calculate total cubic feet needed. Then divide by the bag yield: a 40 lb bag covers 0.30 cu ft, a 60 lb bag covers 0.45 cu ft, and an 80 lb bag covers 0.60 cu ft. For example, a 4-inch thick 10x10 ft slab requires about 33.3 cu ft, which is approximately 56 bags of 80 lb concrete mix.",
        },
        {
          question: "How thick should my concrete slab be?",
          answer:
            "Sidewalks and patios typically require 4 inches of concrete. Driveways and garage floors should be 6 inches thick. Foundation walls are usually 8 inches, and footings or footers are typically 12 inches thick. Heavier loads and vehicular traffic require thicker slabs.",
        },
        {
          question:
            "What is the difference between cubic yards and cubic feet of concrete?",
          answer:
            "One cubic yard equals 27 cubic feet. Ready-mix concrete from a truck is typically sold by the cubic yard, while bagged concrete is measured in cubic feet. To convert cubic feet to cubic yards, divide by 27. For example, 81 cubic feet equals 3 cubic yards.",
        },
        {
          question: "How much does a yard of concrete cost?",
          answer:
            "Ready-mix concrete typically costs between $120 and $200 per cubic yard delivered, depending on your location, the type of mix, and delivery distance. Short-load fees may apply for orders under 5-10 yards. Specialty mixes, fiber reinforcement, or accelerated curing can add $10-30 per yard.",
        },
        {
          question: "Should I add extra concrete for waste?",
          answer:
            "Yes, always add a waste factor of 5-10% to your calculated volume. This accounts for spillage, uneven subgrade, form irregularities, and over-excavation. For complex shapes like stairs or irregular forms, consider adding 10-15% extra. It is always better to have slightly more concrete than to run short during a pour.",
        },
        {
          question: "When should I use bags vs. ready-mix concrete?",
          answer:
            "Bagged concrete is best for small projects under 1 cubic yard, such as setting fence posts, small pads, or repairs. For projects over 1-2 cubic yards, ready-mix delivery is more cost-effective and practical. Mixing more than 40-50 bags by hand is extremely labor-intensive.",
        },
      ]}
      relatedTools={[
        { name: "Unit Converter", href: "/tools/convert" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Square Footage Calculator", href: "/tools/square-footage-calculator" },
      ]}
      guide={
        <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-xl font-semibold text-zinc-100">
            How to Use the Concrete Calculator
          </h2>
          <p>
            This calculator helps you estimate the amount of concrete needed for
            any project. Select the shape of your pour, enter the dimensions,
            and get instant results in cubic yards, cubic feet, and cubic
            meters. You can add multiple sections to calculate combined totals
            for complex projects.
          </p>
          <h3 className="text-lg font-semibold text-zinc-100">
            Supported Shapes
          </h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Slab / Square:</strong> For patios, sidewalks, driveways,
              and garage floors. Enter length, width, and depth.
            </li>
            <li>
              <strong>Cylinder / Column:</strong> For round columns, piers,
              sono tubes, and post holes. Enter diameter and height.
            </li>
            <li>
              <strong>Wall / Footer:</strong> For foundation walls, retaining
              walls, and footings. Enter length, height, and wall thickness.
            </li>
            <li>
              <strong>Stairs:</strong> For concrete steps. Enter the number of
              steps, rise, run, and total stair width.
            </li>
          </ul>
          <h3 className="text-lg font-semibold text-zinc-100">Tips</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Always order 5-10% more concrete than calculated to account for
              waste and uneven ground.
            </li>
            <li>
              For ready-mix delivery, most companies have a minimum order of 1
              cubic yard and may charge short-load fees for small orders.
            </li>
            <li>
              One 80 lb bag of pre-mixed concrete yields approximately 0.6
              cubic feet of cured concrete.
            </li>
          </ul>
        </div>
      }
    >
      {/* ── Unit toggle & global settings ── */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex rounded-lg overflow-hidden border border-zinc-700">
          <button
            onClick={() => setUnits("imperial")}
            className={`${btnCls} rounded-none ${
              units === "imperial"
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Feet / Inches
          </button>
          <button
            onClick={() => setUnits("metric")}
            className={`${btnCls} rounded-none ${
              units === "metric"
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            }`}
          >
            Meters
          </button>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 whitespace-nowrap">
            Waste Factor (%)
          </label>
          <input
            type="number"
            min="0"
            max="50"
            value={wastePct}
            onChange={(e) => setWastePct(e.target.value)}
            className={inputCls + " !w-20"}
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 whitespace-nowrap">
            Price per Yard ($)
          </label>
          <input
            type="number"
            min="0"
            value={pricePerYard}
            onChange={(e) => setPricePerYard(e.target.value)}
            className={inputCls + " !w-24"}
          />
        </div>
      </div>

      {/* ── Sections ── */}
      <div className="space-y-4 mb-6">
        {sections.map((s, idx) => (
          <div
            key={s.id}
            className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4"
          >
            {/* Section header */}
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={s.name}
                onChange={(e) =>
                  updateSection(s.id, { name: e.target.value })
                }
                className="bg-transparent text-zinc-100 font-semibold text-lg focus:outline-none border-b border-transparent focus:border-blue-500 w-full max-w-xs"
              />
              {sections.length > 1 && (
                <button
                  onClick={() => removeSection(s.id)}
                  className="text-zinc-500 hover:text-red-400 text-sm transition-colors"
                  aria-label="Remove section"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Shape tabs */}
            <div className="flex flex-wrap gap-2">
              {shapeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() =>
                    updateSection(s.id, { shape: opt.value })
                  }
                  className={`${btnCls} ${
                    s.shape === opt.value
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-900 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Dimension inputs */}
            {renderFields(s)}

            {/* Section subtotal */}
            {sectionVolumes[idx] > 0 && (
              <div className="text-xs text-zinc-500">
                Section volume:{" "}
                <span className="text-zinc-300">
                  {fmt(sectionVolumes[idx])} cu ft
                </span>
                {" / "}
                <span className="text-zinc-300">
                  {fmt(sectionVolumes[idx] / 27)} cu yd
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add section button */}
      <button
        onClick={addSection}
        className={`${btnCls} bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-blue-500/40 hover:text-blue-400 mb-8`}
      >
        + Add Section
      </button>

      {/* ── Results ── */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">
            Cubic Yards
          </p>
          <p className="text-3xl font-bold text-blue-400">{fmt(totalCy)}</p>
          <p className="text-xs text-zinc-500 mt-1">
            ({fmt(rawCf / 27)} + {n(wastePct)}% waste)
          </p>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">
            Cubic Feet
          </p>
          <p className="text-3xl font-bold text-zinc-100">{fmt(totalCf)}</p>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">
            Cubic Meters
          </p>
          <p className="text-3xl font-bold text-zinc-100">{fmt(totalCm)}</p>
        </div>
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
          <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">
            Estimated Cost
          </p>
          <p className="text-3xl font-bold text-green-400">
            ${fmt(cost)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            @ ${fmt(n(pricePerYard), 0)}/yd&sup3;
          </p>
        </div>
      </div>

      {/* ── Bags calculator ── */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 mb-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">
          Bags Needed (Pre-Mixed Concrete)
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {(["40", "60", "80"] as const).map((size) => (
            <div
              key={size}
              className="bg-zinc-900 rounded-lg p-4 text-center"
            >
              <p className="text-sm text-zinc-400 mb-1">{size} lb bags</p>
              <p className="text-2xl font-bold text-zinc-100">
                {bags(size).toLocaleString()}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {fmt(BAG_COVERAGE_CF[size])} cu ft each
              </p>
            </div>
          ))}
        </div>
        {totalCy > 1 && (
          <p className="text-xs text-zinc-500 mt-3">
            For projects over 1 cubic yard, ready-mix delivery is usually more
            economical and practical than mixing individual bags.
          </p>
        )}
      </div>

      {/* ── Reference table ── */}
      <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">
          Recommended Concrete Thickness
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-700 text-zinc-400">
                <th className="text-left py-2 pr-4 font-medium">Application</th>
                <th className="text-center py-2 px-4 font-medium">
                  Imperial
                </th>
                <th className="text-center py-2 pl-4 font-medium">Metric</th>
              </tr>
            </thead>
            <tbody>
              {COMMON_DEPTHS.map((row) => (
                <tr
                  key={row.use}
                  className="border-b border-zinc-800 last:border-0"
                >
                  <td className="py-2 pr-4 text-zinc-300">{row.use}</td>
                  <td className="py-2 px-4 text-center text-zinc-400">
                    {row.depth}
                  </td>
                  <td className="py-2 pl-4 text-center text-zinc-400">
                    {row.cm}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ToolLayout>
  );
}

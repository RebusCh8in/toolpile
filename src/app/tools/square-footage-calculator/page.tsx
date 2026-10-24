"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

type Shape = "rectangle" | "circle" | "triangle" | "trapezoid" | "lshape";
type Unit = "imperial" | "metric";

interface Room {
  id: string;
  name: string;
  sqft: number;
}

const SHAPES: { key: Shape; label: string }[] = [
  { key: "rectangle", label: "Rectangle" },
  { key: "circle", label: "Circle" },
  { key: "triangle", label: "Triangle" },
  { key: "trapezoid", label: "Trapezoid" },
  { key: "lshape", label: "L-Shape" },
];

const SQFT_TO_SQM = 0.09290304;
const SQFT_TO_SQYD = 1 / 9;
const SQFT_TO_ACRES = 1 / 43560;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function fmt(n: number, decimals = 2): string {
  if (isNaN(n) || !isFinite(n) || n === 0) return "\u2014";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function fmtCurrency(n: number): string {
  if (isNaN(n) || !isFinite(n) || n === 0) return "\u2014";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Convert a feet+inches pair OR a meters value into feet */
function toFeet(val: string, inches: string, unit: Unit): number {
  const v = parseFloat(val) || 0;
  if (unit === "metric") return v * 3.28084;
  const i = parseFloat(inches) || 0;
  return v + i / 12;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9);
}

/* ------------------------------------------------------------------ */
/*  Shape area calculators (all return sq ft)                          */
/* ------------------------------------------------------------------ */

function calcRectangle(w: number, h: number): number {
  return w * h;
}

function calcCircle(r: number): number {
  return Math.PI * r * r;
}

function calcTriangle(base: number, height: number): number {
  return 0.5 * base * height;
}

function calcTrapezoid(a: number, b: number, height: number): number {
  return 0.5 * (a + b) * height;
}

function calcLShape(w1: number, h1: number, w2: number, h2: number): number {
  return w1 * h1 + w2 * h2;
}

/* ------------------------------------------------------------------ */
/*  SVG shape previews                                                 */
/* ------------------------------------------------------------------ */

function ShapePreview({
  shape,
  dims,
  unit,
}: {
  shape: Shape;
  dims: Record<string, string>;
  unit: Unit;
}) {
  const suffix = unit === "imperial" ? "ft" : "m";
  const w = 240;
  const h = 180;
  const pad = 36;

  const labelCls = "fill-zinc-400 text-[11px]";
  const dimCls = "fill-blue-400 text-[12px] font-semibold";

  function d(key: string): string {
    const v = parseFloat(dims[key] || "0");
    const i = parseFloat(dims[key + "In"] || "0");
    if (unit === "imperial" && i > 0) return `${v}' ${i}"`;
    return `${v} ${suffix}`;
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full max-w-[280px] mx-auto" aria-hidden="true">
      {shape === "rectangle" && (
        <>
          <rect x={pad} y={pad} width={w - pad * 2} height={h - pad * 2} rx={4} className="fill-blue-500/10 stroke-blue-500" strokeWidth={2} />
          {/* width label */}
          <text x={w / 2} y={pad - 10} textAnchor="middle" className={dimCls}>{d("width")}</text>
          {/* height label */}
          <text x={w - pad + 14} y={h / 2} textAnchor="start" className={dimCls} transform={`rotate(90, ${w - pad + 14}, ${h / 2})`}>{d("height")}</text>
          <text x={pad - 6} y={h / 2} textAnchor="end" className={labelCls}>H</text>
          <text x={w / 2} y={h - pad + 18} textAnchor="middle" className={labelCls}>W</text>
        </>
      )}

      {shape === "circle" && (() => {
        const cx = w / 2;
        const cy = h / 2;
        const r = Math.min(w, h) / 2 - pad;
        return (
          <>
            <circle cx={cx} cy={cy} r={r} className="fill-blue-500/10 stroke-blue-500" strokeWidth={2} />
            <line x1={cx} y1={cy} x2={cx + r} y2={cy} className="stroke-blue-400" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={cx + r / 2} y={cy - 8} textAnchor="middle" className={dimCls}>{d("radius")}</text>
            <text x={cx + r / 2} y={cy + 16} textAnchor="middle" className={labelCls}>r</text>
          </>
        );
      })()}

      {shape === "triangle" && (() => {
        const bx1 = pad;
        const bx2 = w - pad;
        const by = h - pad;
        const tx = w / 2;
        const ty = pad;
        return (
          <>
            <polygon points={`${bx1},${by} ${bx2},${by} ${tx},${ty}`} className="fill-blue-500/10 stroke-blue-500" strokeWidth={2} />
            <text x={w / 2} y={h - pad + 18} textAnchor="middle" className={dimCls}>{d("base")}</text>
            <line x1={tx} y1={ty} x2={tx} y2={by} className="stroke-blue-400" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={tx + 14} y={h / 2} textAnchor="start" className={dimCls}>{d("triHeight")}</text>
            <text x={w / 2} y={h - pad + 28} textAnchor="middle" className={labelCls}>base</text>
          </>
        );
      })()}

      {shape === "trapezoid" && (() => {
        const by = h - pad;
        const ty = pad;
        const bw = w - pad * 2;
        const tw = bw * 0.6;
        const offset = (bw - tw) / 2;
        return (
          <>
            <polygon points={`${pad},${by} ${w - pad},${by} ${pad + offset + tw},${ty} ${pad + offset},${ty}`} className="fill-blue-500/10 stroke-blue-500" strokeWidth={2} />
            <text x={w / 2} y={h - pad + 18} textAnchor="middle" className={dimCls}>{d("base1")}</text>
            <text x={w / 2} y={pad - 10} textAnchor="middle" className={dimCls}>{d("base2")}</text>
            <line x1={pad + offset} y1={ty} x2={pad + offset} y2={by} className="stroke-blue-400" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={pad + offset - 8} y={h / 2} textAnchor="end" className={dimCls}>{d("trapHeight")}</text>
            <text x={w / 2} y={h - pad + 28} textAnchor="middle" className={labelCls}>Base 1</text>
            <text x={w / 2} y={pad - 20} textAnchor="middle" className={labelCls}>Base 2</text>
          </>
        );
      })()}

      {shape === "lshape" && (() => {
        const x0 = pad;
        const y0 = pad;
        const totalW = w - pad * 2;
        const totalH = h - pad * 2;
        const cutW = totalW * 0.45;
        const cutH = totalH * 0.45;
        return (
          <>
            <polygon
              points={`${x0},${y0} ${x0 + totalW},${y0} ${x0 + totalW},${y0 + totalH - cutH} ${x0 + totalW - cutW},${y0 + totalH - cutH} ${x0 + totalW - cutW},${y0 + totalH} ${x0},${y0 + totalH}`}
              className="fill-blue-500/10 stroke-blue-500"
              strokeWidth={2}
            />
            <text x={w / 2} y={y0 - 8} textAnchor="middle" className={dimCls}>{d("w1")}</text>
            <text x={x0 - 8} y={h / 2} textAnchor="end" className={dimCls}>{d("h1")}</text>
            <text x={x0 + totalW - cutW / 2} y={y0 + totalH + 16} textAnchor="middle" className={dimCls}>{d("w2")}</text>
            <text x={x0 + totalW + 10} y={y0 + (totalH - cutH) / 2} textAnchor="start" className={dimCls}>{d("h2")}</text>
            <text x={w / 2} y={y0 - 18} textAnchor="middle" className={labelCls}>W1</text>
          </>
        );
      })()}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function Page() {
  const [shape, setShape] = useState<Shape>("rectangle");
  const [unit, setUnit] = useState<Unit>("imperial");

  // Dimension inputs (string for controlled inputs)
  const [dims, setDims] = useState<Record<string, string>>({
    width: "12",
    widthIn: "0",
    height: "10",
    heightIn: "0",
    radius: "5",
    radiusIn: "0",
    base: "10",
    baseIn: "0",
    triHeight: "8",
    triHeightIn: "0",
    base1: "12",
    base1In: "0",
    base2: "8",
    base2In: "0",
    trapHeight: "6",
    trapHeightIn: "0",
    w1: "20",
    w1In: "0",
    h1: "15",
    h1In: "0",
    w2: "10",
    w2In: "0",
    h2: "8",
    h2In: "0",
  });

  // Room calculator
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("Living Room");

  // Cost estimator
  const [pricePerSqft, setPricePerSqft] = useState("3.50");

  const setDim = (key: string, val: string) =>
    setDims((prev) => ({ ...prev, [key]: val }));

  /* ---- compute sq ft from current shape ---- */
  const sqft = useMemo(() => {
    const f = (key: string) => toFeet(dims[key], dims[key + "In"], unit);
    switch (shape) {
      case "rectangle":
        return calcRectangle(f("width"), f("height"));
      case "circle":
        return calcCircle(f("radius"));
      case "triangle":
        return calcTriangle(f("base"), f("triHeight"));
      case "trapezoid":
        return calcTrapezoid(f("base1"), f("base2"), f("trapHeight"));
      case "lshape":
        return calcLShape(f("w1"), f("h1"), f("w2"), f("h2"));
      default:
        return 0;
    }
  }, [shape, dims, unit]);

  const sqm = sqft * SQFT_TO_SQM;
  const sqyd = sqft * SQFT_TO_SQYD;
  const acres = sqft * SQFT_TO_ACRES;

  const totalRoomSqft = rooms.reduce((s, r) => s + r.sqft, 0);
  const costPerSqft = parseFloat(pricePerSqft) || 0;

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "text-sm text-zinc-400 block mb-1";
  const smallInputCls =
    "bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";

  /* ---- dimension input helper ---- */
  function DimInput({ label, dimKey }: { label: string; dimKey: string }) {
    return (
      <div className="flex-1 min-w-0">
        <label className={labelCls}>{label}</label>
        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            step="any"
            value={dims[dimKey]}
            onChange={(e) => setDim(dimKey, e.target.value)}
            className={smallInputCls + " flex-1 min-w-0"}
            placeholder={unit === "imperial" ? "feet" : "meters"}
          />
          {unit === "imperial" && (
            <input
              type="number"
              min="0"
              max="11"
              step="1"
              value={dims[dimKey + "In"]}
              onChange={(e) => setDim(dimKey + "In", e.target.value)}
              className={smallInputCls + " w-20"}
              placeholder="in"
            />
          )}
        </div>
        {unit === "imperial" ? (
          <span className="text-xs text-zinc-500 mt-0.5 block">ft / in</span>
        ) : (
          <span className="text-xs text-zinc-500 mt-0.5 block">meters</span>
        )}
      </div>
    );
  }

  /* ---- add current area as a room ---- */
  function addRoom() {
    if (sqft <= 0) return;
    setRooms((prev) => [...prev, { id: uid(), name: roomName || "Room", sqft }]);
  }

  function removeRoom(id: string) {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <ToolLayout
      title="Square Footage Calculator"
      description="Calculate square footage for any shape. Supports rectangles, circles, triangles, trapezoids, and L-shapes. Add multiple rooms, convert between units, and estimate project costs."
      slug="square-footage-calculator"
      category="Utility"
      keywords={[
        "square footage calculator",
        "sq ft calculator",
        "area calculator",
        "square feet calculator",
        "room size calculator",
        "floor area calculator",
        "square meter to square feet",
        "flooring calculator",
        "square footage of a room",
        "land area calculator",
      ]}
      faqs={[
        {
          question: "How do I calculate the square footage of a room?",
          answer:
            "Measure the length and width of the room in feet, then multiply them together. For example, a 12 ft by 10 ft room is 120 square feet. If the room is not a simple rectangle, break it into smaller rectangles, calculate each area, and add them together.",
        },
        {
          question: "How many square feet are in an acre?",
          answer:
            "There are exactly 43,560 square feet in one acre. To convert square feet to acres, divide the square footage by 43,560. For example, 10,000 sq ft equals approximately 0.23 acres.",
        },
        {
          question: "How do I convert square feet to square meters?",
          answer:
            "Multiply the square footage by 0.0929 to get square meters. For example, 500 square feet equals approximately 46.45 square meters. To convert from square meters to square feet, multiply by 10.764.",
        },
        {
          question: "How do I calculate the square footage of an irregularly shaped room?",
          answer:
            "Break the irregular shape into standard geometric shapes such as rectangles, triangles, or circles. Calculate the area of each shape separately, then add them all together. This calculator's L-Shape mode and room calculator make this easy for common layouts.",
        },
        {
          question: "How much flooring do I need? Should I buy extra?",
          answer:
            "Calculate the total square footage of all rooms you want to floor. It is standard practice to add 10% extra for waste from cuts, mistakes, and future repairs. For diagonal or pattern installations, add 15-20% extra material.",
        },
        {
          question: "What is the difference between square feet and linear feet?",
          answer:
            "Linear feet measures length in a straight line (one dimension), while square feet measures area (two dimensions). For example, a board that is 1 foot wide and 8 feet long is 8 linear feet but also 8 square feet. Knowing the difference is important when purchasing materials.",
        },
      ]}
      relatedTools={[
        { name: "Unit Converter", href: "/tools/unit-converter" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Aspect Ratio Calculator", href: "/tools/aspect-ratio-calculator" },
      ]}
      guide={
        <div className="space-y-6 text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">How to Use the Square Footage Calculator</h2>
            <p>
              Select a shape that matches the area you want to measure: rectangle for standard rooms, circle for round spaces, triangle for
              angled areas, trapezoid for tapered spaces, or L-shape for rooms with alcoves. Enter your dimensions in feet and inches or switch
              to metric mode for meters. The calculator instantly shows results in square feet, square meters, square yards, and acres.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Room Calculator</h2>
            <p>
              Use the room calculator to measure entire homes or multi-room projects. Calculate each room individually, give it a name, and add
              it to your list. The calculator keeps a running total so you can see the combined square footage of all rooms at a glance.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">Cost Estimator</h2>
            <p>
              Enter a price per square foot to estimate material and project costs. This works for flooring, painting, tiling, carpet, and
              other projects priced by area. The estimator uses either the current shape calculation or the total from your room list.
            </p>
          </section>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ============================================================ */}
        {/* UNIT TOGGLE + SHAPE SELECTOR                                 */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Unit toggle */}
          <div className="flex rounded-lg overflow-hidden border border-zinc-700 self-start">
            <button
              onClick={() => setUnit("imperial")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                unit === "imperial"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Feet / Inches
            </button>
            <button
              onClick={() => setUnit("metric")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                unit === "metric"
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              Meters
            </button>
          </div>

          {/* Shape selector */}
          <div className="flex flex-wrap gap-2">
            {SHAPES.map((s) => (
              <button
                key={s.key}
                onClick={() => setShape(s.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  shape === s.key
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* DIMENSIONS + PREVIEW                                         */}
        {/* ============================================================ */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Inputs */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
            <h3 className="text-lg font-semibold text-zinc-100">Dimensions</h3>

            {shape === "rectangle" && (
              <div className="flex gap-4">
                <DimInput label="Width" dimKey="width" />
                <DimInput label="Height" dimKey="height" />
              </div>
            )}

            {shape === "circle" && (
              <div className="max-w-[200px]">
                <DimInput label="Radius" dimKey="radius" />
              </div>
            )}

            {shape === "triangle" && (
              <div className="flex gap-4">
                <DimInput label="Base" dimKey="base" />
                <DimInput label="Height" dimKey="triHeight" />
              </div>
            )}

            {shape === "trapezoid" && (
              <div className="space-y-4">
                <div className="flex gap-4">
                  <DimInput label="Base 1 (bottom)" dimKey="base1" />
                  <DimInput label="Base 2 (top)" dimKey="base2" />
                </div>
                <div className="max-w-[200px]">
                  <DimInput label="Height" dimKey="trapHeight" />
                </div>
              </div>
            )}

            {shape === "lshape" && (
              <div className="space-y-4">
                <p className="text-xs text-zinc-500">Define two rectangles that form the L-shape.</p>
                <div className="flex gap-4">
                  <DimInput label="Rect 1 Width" dimKey="w1" />
                  <DimInput label="Rect 1 Height" dimKey="h1" />
                </div>
                <div className="flex gap-4">
                  <DimInput label="Rect 2 Width" dimKey="w2" />
                  <DimInput label="Rect 2 Height" dimKey="h2" />
                </div>
              </div>
            )}
          </div>

          {/* Shape preview */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 flex flex-col items-center justify-center">
            <h3 className="text-lg font-semibold text-zinc-100 mb-3 self-start">Preview</h3>
            <ShapePreview shape={shape} dims={dims} unit={unit} />
          </div>
        </div>

        {/* ============================================================ */}
        {/* RESULTS                                                      */}
        {/* ============================================================ */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">Area Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900 rounded-lg p-4 text-center">
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">Square Feet</p>
              <p className="text-2xl font-bold text-blue-400">{fmt(sqft)}</p>
              <p className="text-xs text-zinc-600">ft&sup2;</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4 text-center">
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">Square Meters</p>
              <p className="text-2xl font-bold text-blue-400">{fmt(sqm)}</p>
              <p className="text-xs text-zinc-600">m&sup2;</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4 text-center">
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">Square Yards</p>
              <p className="text-2xl font-bold text-blue-400">{fmt(sqyd)}</p>
              <p className="text-xs text-zinc-600">yd&sup2;</p>
            </div>
            <div className="bg-zinc-900 rounded-lg p-4 text-center">
              <p className="text-xs text-zinc-500 mb-1 uppercase tracking-wide">Acres</p>
              <p className="text-2xl font-bold text-blue-400">{fmt(acres, 6)}</p>
              <p className="text-xs text-zinc-600">ac</p>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* ROOM CALCULATOR                                              */}
        {/* ============================================================ */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-100">Room Calculator</h3>
          <p className="text-sm text-zinc-400">Calculate each room above, name it, and add it to your list. Get a combined total for your entire project.</p>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Room name"
              className={inputCls + " sm:max-w-[200px]"}
            />
            <div className="text-sm text-zinc-400 flex items-center gap-2 whitespace-nowrap">
              Current area: <span className="text-blue-400 font-semibold">{fmt(sqft)} sq ft</span>
            </div>
            <button
              onClick={addRoom}
              disabled={sqft <= 0}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            >
              + Add Room
            </button>
          </div>

          {rooms.length > 0 && (
            <div className="space-y-2">
              <div className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs text-zinc-500 uppercase tracking-wide px-1">
                <span>Room</span>
                <span className="text-right">Sq Ft</span>
                <span></span>
              </div>
              {rooms.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-[1fr_auto_auto] gap-2 items-center bg-zinc-900 rounded-lg px-4 py-2.5"
                >
                  <span className="text-zinc-200 text-sm truncate">{r.name}</span>
                  <span className="text-blue-400 font-medium text-sm text-right tabular-nums">{fmt(r.sqft)}</span>
                  <button
                    onClick={() => removeRoom(r.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors ml-2 text-lg leading-none"
                    aria-label={`Remove ${r.name}`}
                  >
                    &times;
                  </button>
                </div>
              ))}
              <div className="flex justify-between items-center bg-blue-600/10 border border-blue-500/20 rounded-lg px-4 py-3 mt-2">
                <span className="text-sm font-medium text-zinc-200">Total ({rooms.length} room{rooms.length !== 1 ? "s" : ""})</span>
                <span className="text-xl font-bold text-blue-400">{fmt(totalRoomSqft)} sq ft</span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm mt-1">
                <div className="bg-zinc-900 rounded-lg px-3 py-2">
                  <p className="text-zinc-500 text-xs">Sq Meters</p>
                  <p className="text-zinc-200 font-medium">{fmt(totalRoomSqft * SQFT_TO_SQM)}</p>
                </div>
                <div className="bg-zinc-900 rounded-lg px-3 py-2">
                  <p className="text-zinc-500 text-xs">Sq Yards</p>
                  <p className="text-zinc-200 font-medium">{fmt(totalRoomSqft * SQFT_TO_SQYD)}</p>
                </div>
                <div className="bg-zinc-900 rounded-lg px-3 py-2">
                  <p className="text-zinc-500 text-xs">Acres</p>
                  <p className="text-zinc-200 font-medium">{fmt(totalRoomSqft * SQFT_TO_ACRES, 6)}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* COST ESTIMATOR                                               */}
        {/* ============================================================ */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-100">Cost Estimator</h3>
          <p className="text-sm text-zinc-400">Enter a price per square foot to estimate your total project cost for flooring, painting, tiling, or other materials.</p>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-48">
              <label className={labelCls}>Price per sq ft ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={pricePerSqft}
                onChange={(e) => setPricePerSqft(e.target.value)}
                className={inputCls}
              />
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
              <div className="bg-zinc-900 rounded-lg p-4">
                <p className="text-xs text-zinc-500 mb-1">Current Shape Cost</p>
                <p className="text-xl font-bold text-blue-400">{fmtCurrency(sqft * costPerSqft)}</p>
                <p className="text-xs text-zinc-600">{fmt(sqft)} sq ft &times; ${pricePerSqft || "0"}</p>
              </div>
              {rooms.length > 0 && (
                <div className="bg-zinc-900 rounded-lg p-4">
                  <p className="text-xs text-zinc-500 mb-1">All Rooms Cost</p>
                  <p className="text-xl font-bold text-green-400">{fmtCurrency(totalRoomSqft * costPerSqft)}</p>
                  <p className="text-xs text-zinc-600">{fmt(totalRoomSqft)} sq ft &times; ${pricePerSqft || "0"}</p>
                </div>
              )}
            </div>
          </div>

          {/* Common material cost reference */}
          <div className="mt-3">
            <p className="text-xs text-zinc-500 mb-2">Common material costs (approximate):</p>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { label: "Laminate", price: "2.50" },
                { label: "Hardwood", price: "6.00" },
                { label: "Carpet", price: "3.50" },
                { label: "Tile", price: "5.00" },
                { label: "Vinyl", price: "2.00" },
                { label: "Epoxy", price: "4.00" },
                { label: "Interior Paint", price: "1.50" },
              ].map((m) => (
                <button
                  key={m.label}
                  onClick={() => setPricePerSqft(m.price)}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-400 hover:border-blue-500/40 hover:text-blue-400 transition-colors"
                >
                  {m.label}: ${m.price}/ft&sup2;
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CONVERSIONS REFERENCE TABLE                                   */}
        {/* ============================================================ */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">Common Area Conversions</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-400">
                  <th className="pb-2 pr-4 font-medium">From</th>
                  <th className="pb-2 pr-4 font-medium">To</th>
                  <th className="pb-2 font-medium">Multiply by</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                {[
                  ["1 sq ft", "sq meters", "0.0929"],
                  ["1 sq meter", "sq feet", "10.7639"],
                  ["1 sq ft", "sq inches", "144"],
                  ["1 sq yard", "sq feet", "9"],
                  ["1 sq ft", "sq yards", "0.1111"],
                  ["1 acre", "sq feet", "43,560"],
                  ["1 sq ft", "acres", "0.0000229568"],
                  ["1 hectare", "sq feet", "107,639"],
                  ["1 sq meter", "sq yards", "1.19599"],
                  ["1 acre", "sq meters", "4,046.86"],
                ].map(([from, to, factor], i) => (
                  <tr key={i} className="border-b border-zinc-800/50 last:border-0">
                    <td className="py-2 pr-4 text-zinc-200">{from}</td>
                    <td className="py-2 pr-4">{to}</td>
                    <td className="py-2 font-mono text-blue-400">{factor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

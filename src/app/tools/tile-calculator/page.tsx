"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ── helpers ─────────────────────────────────────────────────── */

function fmt(n: number, decimals = 2) {
  if (isNaN(n) || !isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function fmtCurrency(n: number) {
  if (isNaN(n) || !isFinite(n)) return "—";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type Unit = "imperial" | "metric";
type Pattern = "straight" | "diagonal" | "herringbone" | "brick";
type PriceMode = "per_tile" | "per_sqft";

interface TilePreset {
  label: string;
  wIn: number;
  hIn: number;
}

const TILE_PRESETS: TilePreset[] = [
  { label: '4" x 4"', wIn: 4, hIn: 4 },
  { label: '6" x 6"', wIn: 6, hIn: 6 },
  { label: '12" x 12"', wIn: 12, hIn: 12 },
  { label: '12" x 24"', wIn: 12, hIn: 24 },
  { label: '18" x 18"', wIn: 18, hIn: 18 },
  { label: '24" x 24"', wIn: 24, hIn: 24 },
];

const PATTERN_WASTE: Record<Pattern, number> = {
  straight: 10,
  diagonal: 15,
  herringbone: 20,
  brick: 12,
};

const PATTERN_LABELS: Record<Pattern, string> = {
  straight: "Straight / Grid",
  diagonal: "Diagonal (45°)",
  herringbone: "Herringbone",
  brick: "Brick / Offset",
};

/* ── visual tile preview ─────────────────────────────────────── */

function TilePreview({ pattern, tileW, tileH }: { pattern: Pattern; tileW: number; tileH: number }) {
  const canvasW = 280;
  const canvasH = 200;
  const aspect = tileW / tileH;
  const baseTileH = 32;
  const baseTileW = Math.round(baseTileH * aspect);
  const gap = 2;

  const tiles: { x: number; y: number; w: number; h: number; rotate?: number }[] = [];

  if (pattern === "straight") {
    for (let row = -1; row * (baseTileH + gap) < canvasH + baseTileH; row++) {
      for (let col = -1; col * (baseTileW + gap) < canvasW + baseTileW; col++) {
        tiles.push({ x: col * (baseTileW + gap), y: row * (baseTileH + gap), w: baseTileW, h: baseTileH });
      }
    }
  } else if (pattern === "brick") {
    for (let row = -1; row * (baseTileH + gap) < canvasH + baseTileH; row++) {
      const offset = row % 2 === 0 ? 0 : (baseTileW + gap) / 2;
      for (let col = -2; col * (baseTileW + gap) < canvasW + baseTileW; col++) {
        tiles.push({ x: col * (baseTileW + gap) + offset, y: row * (baseTileH + gap), w: baseTileW, h: baseTileH });
      }
    }
  } else if (pattern === "diagonal") {
    const step = baseTileW + gap;
    for (let row = -8; row < 16; row++) {
      for (let col = -8; col < 16; col++) {
        const cx = col * step * 0.707 - row * step * 0.707 + canvasW / 2;
        const cy = col * step * 0.707 + row * step * 0.707;
        if (cx > -baseTileW * 2 && cx < canvasW + baseTileW * 2 && cy > -baseTileH * 2 && cy < canvasH + baseTileH * 2) {
          tiles.push({ x: cx, y: cy, w: baseTileW, h: baseTileH, rotate: 45 });
        }
      }
    }
  } else if (pattern === "herringbone") {
    const tw = Math.max(baseTileW, baseTileH);
    const th = Math.min(baseTileW, baseTileH);
    for (let row = -4; row < 14; row++) {
      for (let col = -4; col < 14; col++) {
        const bx = col * (tw + gap);
        const by = row * (th + gap);
        if (row % 2 === 0) {
          tiles.push({ x: bx, y: by + col * (th + gap) * 0.5, w: tw, h: th });
        } else {
          tiles.push({ x: bx + th * 0.5, y: by + col * (th + gap) * 0.5, w: th, h: tw });
        }
      }
    }
  }

  const colors = ["#3b82f6", "#2563eb", "#1d4ed8", "#3b82f6"];

  return (
    <div className="w-full flex justify-center">
      <svg
        width={canvasW}
        height={canvasH}
        viewBox={`0 0 ${canvasW} ${canvasH}`}
        className="rounded-lg border border-zinc-700 bg-zinc-950 overflow-hidden"
      >
        <defs>
          <clipPath id="tile-clip">
            <rect x="0" y="0" width={canvasW} height={canvasH} />
          </clipPath>
        </defs>
        <g clipPath="url(#tile-clip)">
          {tiles.map((t, i) => (
            <rect
              key={i}
              x={t.x}
              y={t.y}
              width={t.w}
              height={t.h}
              rx={1}
              fill={colors[i % colors.length]}
              fillOpacity={0.35}
              stroke="#60a5fa"
              strokeWidth={0.5}
              strokeOpacity={0.5}
              transform={t.rotate ? `rotate(${t.rotate} ${t.x + t.w / 2} ${t.y + t.h / 2})` : undefined}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

/* ── main page ───────────────────────────────────────────────── */

export default function Page() {
  // Room / area dimensions
  const [unit, setUnit] = useState<Unit>("imperial");
  const [lengthFt, setLengthFt] = useState("12");
  const [lengthIn, setLengthIn] = useState("0");
  const [widthFt, setWidthFt] = useState("10");
  const [widthIn, setWidthIn] = useState("0");
  const [lengthM, setLengthM] = useState("3.66");
  const [widthM, setWidthM] = useState("3.05");

  // Tile size
  const [presetIdx, setPresetIdx] = useState(2); // 12x12 default
  const [customTileW, setCustomTileW] = useState("12");
  const [customTileH, setCustomTileH] = useState("12");
  const isCustom = presetIdx === -1;

  // Grout gap
  const [groutGap, setGroutGap] = useState("0.125"); // 1/8 inch

  // Pattern
  const [pattern, setPattern] = useState<Pattern>("straight");

  // Waste
  const [wasteOverride, setWasteOverride] = useState<string>("");
  const effectiveWaste = wasteOverride !== "" ? Math.min(20, Math.max(5, +wasteOverride)) : PATTERN_WASTE[pattern];

  // Boxes
  const [tilesPerBox, setTilesPerBox] = useState("12");

  // Cost
  const [priceMode, setPriceMode] = useState<PriceMode>("per_sqft");
  const [price, setPrice] = useState("3.50");

  /* ── derived calculations ──────────────────────────────────── */

  const calc = useMemo(() => {
    // Area in sq inches
    let areaSqIn: number;
    if (unit === "imperial") {
      const totalLengthIn = (+lengthFt * 12) + +lengthIn;
      const totalWidthIn = (+widthFt * 12) + +widthIn;
      areaSqIn = totalLengthIn * totalWidthIn;
    } else {
      // meters to inches
      areaSqIn = (+lengthM * 39.3701) * (+widthM * 39.3701);
    }
    const areaSqFt = areaSqIn / 144;
    const areaSqM = areaSqFt * 0.092903;

    // Tile dimensions in inches
    const tileWIn = isCustom ? +customTileW : TILE_PRESETS[presetIdx].wIn;
    const tileHIn = isCustom ? +customTileH : TILE_PRESETS[presetIdx].hIn;
    const gapIn = +groutGap;

    // Effective tile footprint with grout
    const effectiveTileW = tileWIn + gapIn;
    const effectiveTileH = tileHIn + gapIn;

    // Tile area (just the tile, for display)
    const tileSqIn = tileWIn * tileHIn;
    const tileSqFt = tileSqIn / 144;

    // How many tiles fit by area (using effective size)
    const effectiveTileArea = effectiveTileW * effectiveTileH;
    const tilesExact = areaSqIn / effectiveTileArea;
    const tilesNoWaste = Math.ceil(tilesExact);

    // With waste
    const wasteFraction = effectiveWaste / 100;
    const tilesWithWaste = Math.ceil(tilesExact * (1 + wasteFraction));

    // Boxes
    const tpb = Math.max(1, Math.round(+tilesPerBox));
    const boxesNeeded = Math.ceil(tilesWithWaste / tpb);

    // Cost
    const priceNum = +price;
    let totalCost: number;
    if (priceMode === "per_tile") {
      totalCost = tilesWithWaste * priceNum;
    } else {
      totalCost = areaSqFt * (1 + wasteFraction) * priceNum;
    }

    const costPerSqFt = priceMode === "per_tile" ? (priceNum / tileSqFt) : priceNum;
    const costPerTile = priceMode === "per_tile" ? priceNum : (tileSqFt * priceNum);

    return {
      areaSqFt,
      areaSqM,
      tileWIn,
      tileHIn,
      tileSqFt,
      tilesExact,
      tilesNoWaste,
      tilesWithWaste,
      boxesNeeded,
      tpb,
      totalCost,
      costPerSqFt,
      costPerTile,
      wasteFraction,
    };
  }, [unit, lengthFt, lengthIn, widthFt, widthIn, lengthM, widthM, presetIdx, customTileW, customTileH, groutGap, pattern, effectiveWaste, tilesPerBox, priceMode, price, isCustom]);

  /* ── styles ────────────────────────────────────────────────── */

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const sectionCls = "bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4";
  const btnActive = "bg-blue-600 text-white";
  const btnInactive = "bg-zinc-800 text-zinc-400 hover:bg-zinc-700";
  const btnCls = "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors";

  return (
    <ToolLayout
      title="Tile Calculator"
      description="Calculate how many tiles you need for your floor, wall, or backsplash project. Includes grout spacing, waste percentage, layout patterns, cost estimates, and a visual pattern preview."
      slug="tile-calculator"
      category="Utility"
      keywords={[
        "tile calculator",
        "floor tile calculator",
        "tile quantity calculator",
        "tile cost calculator",
        "tile area calculator",
        "tile coverage calculator",
        "ceramic tile calculator",
        "tile layout calculator",
        "tile estimator",
        "tiles per square foot",
      ]}
      faqs={[
        {
          question: "How do I calculate how many tiles I need?",
          answer:
            "Measure the length and width of the area to get the total square footage. Divide that by the area of a single tile (in square feet) to get the base number of tiles. Then add 10-20% extra for waste, cuts, and breakage depending on your chosen layout pattern.",
        },
        {
          question: "How much extra tile should I buy for waste?",
          answer:
            "For a standard straight/grid layout, plan for 10% extra. Diagonal layouts typically require 15% waste, brick/offset patterns about 12%, and herringbone patterns around 20%. Complex room shapes with many cuts may need even more. It is always better to have leftover tiles than to run short mid-project.",
        },
        {
          question: "Does grout gap size affect how many tiles I need?",
          answer:
            "Yes. Wider grout gaps slightly reduce the number of tiles needed because each tile effectively covers a larger footprint (tile + half the grout gap on each side). A standard 1/8-inch grout line has minimal impact, but larger 1/4-inch or 3/8-inch gaps can noticeably reduce tile count on large areas.",
        },
        {
          question: "How do I convert tile size from inches to square feet?",
          answer:
            "Multiply the tile width by height in inches to get square inches, then divide by 144 (since 1 sq ft = 144 sq in). For example, a 12x24 inch tile is 288 sq in / 144 = 2 square feet per tile.",
        },
        {
          question: "What is the most cost-effective tile layout pattern?",
          answer:
            "A straight or grid pattern is the most cost-effective because it produces the least waste (around 10%). Brick/offset adds about 12%, diagonal about 15%, and herringbone around 20%. The extra cost comes from more cuts and unusable offcuts. Straight layouts are also faster to install, reducing labor costs.",
        },
        {
          question: "How do I calculate tile for walls or backsplashes?",
          answer:
            "Use the same method as floors: measure the wall height and width to get the area, then subtract any windows, doors, or outlets. Enter these dimensions into the calculator and it will compute the tiles needed. For backsplashes, measure from the countertop to the bottom of the upper cabinets.",
        },
        {
          question: "Should I round up the number of tiles or boxes?",
          answer:
            "Always round up. You cannot buy partial tiles or partial boxes. This calculator automatically rounds up both the tile count and box count. It is better to have a few extra tiles for future repairs than to be one tile short during installation.",
        },
      ]}
      relatedTools={[
        { name: "Square Footage Calculator", href: "/tools/square-footage-calculator" },
        { name: "Unit Converter", href: "/tools/unit-converter" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Concrete Calculator", href: "/tools/concrete-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-zinc-100">How to Use the Tile Calculator</h2>
          <p className="text-zinc-400 leading-relaxed">
            This tile calculator helps you determine the exact number of tiles, boxes, and total cost for any tiling project.
            Whether you are tiling a bathroom floor, kitchen backsplash, or an entire room, follow these steps to get an accurate estimate.
          </p>
          <h3 className="text-xl font-semibold text-zinc-200">Step 1: Enter Your Area Dimensions</h3>
          <p className="text-zinc-400 leading-relaxed">
            Measure the length and width of the area you want to tile. You can enter measurements in feet and inches or switch to
            meters for metric projects. For irregularly shaped rooms, break the space into rectangles, calculate each one separately,
            and add the totals together.
          </p>
          <h3 className="text-xl font-semibold text-zinc-200">Step 2: Choose Your Tile Size</h3>
          <p className="text-zinc-400 leading-relaxed">
            Select from common tile sizes like 12x12, 12x24, or 24x24 inches, or enter a custom tile dimension. The calculator
            accounts for grout gap width when computing how many tiles fit in your space.
          </p>
          <h3 className="text-xl font-semibold text-zinc-200">Step 3: Select a Layout Pattern</h3>
          <p className="text-zinc-400 leading-relaxed">
            Different layout patterns require different amounts of waste due to cutting. A straight grid is the most efficient,
            while herringbone requires the most extra material. The calculator automatically adjusts the waste percentage based on
            your selected pattern, or you can set a custom waste percentage.
          </p>
          <h3 className="text-xl font-semibold text-zinc-200">Step 4: Review Results and Cost</h3>
          <p className="text-zinc-400 leading-relaxed">
            The results section shows the total number of tiles needed (with and without waste), how many boxes to purchase, and the
            estimated total cost based on your price input. Use the visual pattern preview to see how your chosen layout will look.
          </p>
        </div>
      }
    >
      <div className="space-y-6">
        {/* ── Row 1: Area + Tile Size ─────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Area dimensions */}
          <div className={sectionCls}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-100">Area Dimensions</h3>
              <div className="flex gap-1">
                <button
                  onClick={() => setUnit("imperial")}
                  className={`${btnCls} ${unit === "imperial" ? btnActive : btnInactive}`}
                >
                  ft / in
                </button>
                <button
                  onClick={() => setUnit("metric")}
                  className={`${btnCls} ${unit === "metric" ? btnActive : btnInactive}`}
                >
                  meters
                </button>
              </div>
            </div>

            {unit === "imperial" ? (
              <>
                <div>
                  <label className={labelCls}>Length</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={lengthFt}
                          onChange={(e) => setLengthFt(e.target.value)}
                          className={inputCls}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">ft</span>
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={lengthIn}
                          onChange={(e) => setLengthIn(e.target.value)}
                          className={inputCls}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">in</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Width</label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={widthFt}
                          onChange={(e) => setWidthFt(e.target.value)}
                          className={inputCls}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">ft</span>
                      </div>
                    </div>
                    <div className="w-24">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="11"
                          value={widthIn}
                          onChange={(e) => setWidthIn(e.target.value)}
                          className={inputCls}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">in</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className={labelCls}>Length (meters)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={lengthM}
                    onChange={(e) => setLengthM(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Width (meters)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={widthM}
                    onChange={(e) => setWidthM(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </>
            )}

            {/* Area readout */}
            <div className="bg-zinc-900 rounded-lg px-4 py-3">
              <p className="text-xs text-zinc-500 mb-1">Total Area</p>
              <p className="text-xl font-bold text-blue-400">
                {fmt(calc.areaSqFt)} ft<sup>2</sup>
              </p>
              <p className="text-sm text-zinc-500">
                {fmt(calc.areaSqM)} m<sup>2</sup>
              </p>
            </div>
          </div>

          {/* Tile size */}
          <div className={sectionCls}>
            <h3 className="text-lg font-semibold text-zinc-100">Tile Size</h3>

            <div className="grid grid-cols-3 gap-2">
              {TILE_PRESETS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => setPresetIdx(i)}
                  className={`${btnCls} border ${
                    presetIdx === i ? "border-blue-500 bg-blue-600/20 text-blue-400" : "border-zinc-700 " + btnInactive
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => setPresetIdx(-1)}
                className={`${btnCls} border ${
                  isCustom ? "border-blue-500 bg-blue-600/20 text-blue-400" : "border-zinc-700 " + btnInactive
                }`}
              >
                Custom
              </button>
            </div>

            {isCustom && (
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelCls}>Width (in)</label>
                  <input
                    type="number"
                    min="1"
                    value={customTileW}
                    onChange={(e) => setCustomTileW(e.target.value)}
                    className={inputCls}
                  />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>Height (in)</label>
                  <input
                    type="number"
                    min="1"
                    value={customTileH}
                    onChange={(e) => setCustomTileH(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            <div>
              <label className={labelCls}>Grout Gap Width (inches)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.0625"
                  value={groutGap}
                  onChange={(e) => setGroutGap(e.target.value)}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-zinc-300 text-sm w-16 text-right font-mono">{groutGap}&quot;</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>No gap</span>
                <span>1/8&quot;</span>
                <span>1/4&quot;</span>
                <span>3/8&quot;</span>
                <span>1/2&quot;</span>
              </div>
            </div>

            <div className="bg-zinc-900 rounded-lg px-4 py-3">
              <p className="text-xs text-zinc-500 mb-1">Tile Area</p>
              <p className="text-xl font-bold text-blue-400">
                {fmt(calc.tileSqFt, 3)} ft<sup>2</sup> per tile
              </p>
              <p className="text-sm text-zinc-500">
                {fmt(calc.tileWIn)}&#34; x {fmt(calc.tileHIn)}&#34;
              </p>
            </div>
          </div>
        </div>

        {/* ── Row 2: Layout Pattern + Waste ───────────────────── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pattern selection */}
          <div className={sectionCls}>
            <h3 className="text-lg font-semibold text-zinc-100">Layout Pattern</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(PATTERN_LABELS) as Pattern[]).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPattern(p);
                    setWasteOverride("");
                  }}
                  className={`${btnCls} border text-left px-3 py-2 ${
                    pattern === p ? "border-blue-500 bg-blue-600/20 text-blue-400" : "border-zinc-700 " + btnInactive
                  }`}
                >
                  <span className="block text-sm font-medium">{PATTERN_LABELS[p]}</span>
                  <span className="block text-xs opacity-60">{PATTERN_WASTE[p]}% waste</span>
                </button>
              ))}
            </div>

            {/* Visual preview */}
            <div>
              <p className="text-xs text-zinc-500 mb-2">Pattern Preview</p>
              <TilePreview pattern={pattern} tileW={calc.tileWIn} tileH={calc.tileHIn} />
            </div>
          </div>

          {/* Waste + boxes */}
          <div className={sectionCls}>
            <h3 className="text-lg font-semibold text-zinc-100">Waste &amp; Packaging</h3>

            <div>
              <label className={labelCls}>
                Waste / Overage Percentage
                <span className="text-zinc-600 ml-1">(auto-set by pattern)</span>
              </label>
              <div className="flex gap-2 items-center">
                <input
                  type="range"
                  min="5"
                  max="20"
                  step="1"
                  value={effectiveWaste}
                  onChange={(e) => setWasteOverride(e.target.value)}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-zinc-300 text-sm w-12 text-right font-mono">{effectiveWaste}%</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>5%</span>
                <span>10%</span>
                <span>15%</span>
                <span>20%</span>
              </div>
            </div>

            <div>
              <label className={labelCls}>Tiles Per Box</label>
              <input
                type="number"
                min="1"
                value={tilesPerBox}
                onChange={(e) => setTilesPerBox(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Cost section */}
            <div className="border-t border-zinc-700 pt-4">
              <h4 className="text-md font-semibold text-zinc-200 mb-3">Cost Estimate</h4>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setPriceMode("per_sqft")}
                  className={`${btnCls} ${priceMode === "per_sqft" ? btnActive : btnInactive}`}
                >
                  $/sq ft
                </button>
                <button
                  onClick={() => setPriceMode("per_tile")}
                  className={`${btnCls} ${priceMode === "per_tile" ? btnActive : btnInactive}`}
                >
                  $/tile
                </button>
              </div>
              <div>
                <label className={labelCls}>
                  {priceMode === "per_sqft" ? "Price per sq ft ($)" : "Price per tile ($)"}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={inputCls + " pl-7"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Results ─────────────────────────────────────────── */}
        <div className={sectionCls}>
          <h3 className="text-lg font-semibold text-zinc-100">Results</h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tiles without waste */}
            <div className="bg-zinc-900 rounded-lg px-4 py-4 text-center">
              <p className="text-xs text-zinc-500 mb-1">Tiles (no waste)</p>
              <p className="text-3xl font-bold text-zinc-300">{fmt(calc.tilesNoWaste, 0)}</p>
              <p className="text-xs text-zinc-600 mt-1">exact: {fmt(calc.tilesExact, 1)}</p>
            </div>

            {/* Tiles with waste */}
            <div className="bg-zinc-900 rounded-lg px-4 py-4 text-center border border-blue-500/30">
              <p className="text-xs text-zinc-500 mb-1">Tiles (with {effectiveWaste}% waste)</p>
              <p className="text-3xl font-bold text-blue-400">{fmt(calc.tilesWithWaste, 0)}</p>
              <p className="text-xs text-zinc-600 mt-1">recommended purchase qty</p>
            </div>

            {/* Boxes needed */}
            <div className="bg-zinc-900 rounded-lg px-4 py-4 text-center">
              <p className="text-xs text-zinc-500 mb-1">Boxes Needed</p>
              <p className="text-3xl font-bold text-zinc-300">{fmt(calc.boxesNeeded, 0)}</p>
              <p className="text-xs text-zinc-600 mt-1">at {calc.tpb} tiles/box</p>
            </div>

            {/* Total cost */}
            <div className="bg-zinc-900 rounded-lg px-4 py-4 text-center border border-green-500/30">
              <p className="text-xs text-zinc-500 mb-1">Estimated Total Cost</p>
              <p className="text-3xl font-bold text-green-400">{fmtCurrency(calc.totalCost)}</p>
              <p className="text-xs text-zinc-600 mt-1">
                {fmtCurrency(calc.costPerSqFt)}/ft<sup>2</sup> &middot; {fmtCurrency(calc.costPerTile)}/tile
              </p>
            </div>
          </div>

          {/* Summary breakdown */}
          <div className="bg-zinc-900 rounded-lg px-4 py-4">
            <h4 className="text-sm font-semibold text-zinc-300 mb-3">Calculation Breakdown</h4>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-1 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Area to cover</span>
                <span className="text-zinc-200">
                  {fmt(calc.areaSqFt)} ft<sup>2</sup>
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tile size</span>
                <span className="text-zinc-200">
                  {fmt(calc.tileWIn)}&quot; x {fmt(calc.tileHIn)}&quot; ({fmt(calc.tileSqFt, 3)} ft<sup>2</sup>)
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Grout gap</span>
                <span className="text-zinc-200">{groutGap}&quot;</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Layout pattern</span>
                <span className="text-zinc-200">{PATTERN_LABELS[pattern]}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Waste factor</span>
                <span className="text-zinc-200">{effectiveWaste}%</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Extra tiles for waste</span>
                <span className="text-zinc-200">{fmt(calc.tilesWithWaste - calc.tilesNoWaste, 0)} tiles</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Tiles per box</span>
                <span className="text-zinc-200">{calc.tpb}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Total tiles in {calc.boxesNeeded} {calc.boxesNeeded === 1 ? "box" : "boxes"}</span>
                <span className="text-zinc-200">{fmt(calc.boxesNeeded * calc.tpb, 0)} tiles</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
}

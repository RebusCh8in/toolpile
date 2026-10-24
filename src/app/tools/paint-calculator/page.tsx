"use client";
import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";

interface Opening {
  id: number;
  type: "door" | "window";
  sqft: number;
}

interface Room {
  id: number;
  name: string;
  mode: "room" | "manual";
  length: string;
  width: string;
  height: string;
  manualArea: string;
  openings: Opening[];
}

let nextRoomId = 1;
let nextOpeningId = 1;

function createRoom(name?: string): Room {
  return {
    id: nextRoomId++,
    name: name || `Room ${nextRoomId - 1}`,
    mode: "room",
    length: "12",
    width: "10",
    height: "8",
    manualArea: "",
    openings: [],
  };
}

function fmt(n: number, decimals = 2): string {
  if (isNaN(n) || !isFinite(n)) return "0";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}

function getRoomWallArea(room: Room): number {
  if (room.mode === "manual") {
    return parseFloat(room.manualArea) || 0;
  }
  const l = parseFloat(room.length) || 0;
  const w = parseFloat(room.width) || 0;
  const h = parseFloat(room.height) || 0;
  return 2 * (l + w) * h;
}

function getRoomOpeningsArea(room: Room): number {
  return room.openings.reduce((sum, o) => sum + o.sqft, 0);
}

function getRoomPaintableArea(room: Room): number {
  return Math.max(0, getRoomWallArea(room) - getRoomOpeningsArea(room));
}

export default function Page() {
  const [rooms, setRooms] = useState<Room[]>([createRoom("Living Room")]);
  const [coats, setCoats] = useState("2");
  const [coverageRate, setCoverageRate] = useState("350");
  const [pricePerGallon, setPricePerGallon] = useState("35");

  const inputCls =
    "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 transition-colors";
  const labelCls = "text-sm text-zinc-400 font-medium";
  const btnCls =
    "px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none";

  const updateRoom = (id: number, updates: Partial<Room>) => {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const removeRoom = (id: number) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  };

  const addOpening = (roomId: number, type: "door" | "window") => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              openings: [
                ...r.openings,
                {
                  id: nextOpeningId++,
                  type,
                  sqft: type === "door" ? 21 : 15,
                },
              ],
            }
          : r
      )
    );
  };

  const updateOpening = (roomId: number, openingId: number, sqft: number) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? {
              ...r,
              openings: r.openings.map((o) =>
                o.id === openingId ? { ...o, sqft } : o
              ),
            }
          : r
      )
    );
  };

  const removeOpening = (roomId: number, openingId: number) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === roomId
          ? { ...r, openings: r.openings.filter((o) => o.id !== openingId) }
          : r
      )
    );
  };

  // Calculations
  const numCoats = Math.max(1, parseInt(coats) || 1);
  const coverage = parseFloat(coverageRate) || 350;
  const price = parseFloat(pricePerGallon) || 0;

  const totalPaintableArea = rooms.reduce(
    (sum, r) => sum + getRoomPaintableArea(r),
    0
  );
  const totalAreaWithCoats = totalPaintableArea * numCoats;
  const gallonsNeeded = totalAreaWithCoats / coverage;
  const gallonsRoundedUp = Math.ceil(gallonsNeeded);
  const quartsNeeded = Math.ceil(gallonsNeeded * 4);

  // Can optimization: figure out best combination of gallons + quarts
  const fullGallons = Math.floor(gallonsNeeded);
  const remainderQuarts = Math.ceil((gallonsNeeded - fullGallons) * 4);
  const optimizedGallons = remainderQuarts === 4 ? fullGallons + 1 : fullGallons;
  const optimizedQuarts = remainderQuarts === 4 ? 0 : remainderQuarts;

  const totalCost = gallonsRoundedUp * price;
  const optimizedCost =
    optimizedGallons * price + optimizedQuarts * (price / 4) * 1.2; // quarts cost ~20% more per unit

  return (
    <ToolLayout
      title="Paint Calculator"
      description="Calculate exactly how much paint you need for your project. Enter room dimensions or wall area, subtract doors and windows, and get accurate gallon estimates with cost breakdowns."
      slug="paint-calculator"
      category="Utility"
      keywords={[
        "paint calculator",
        "how much paint do I need",
        "wall paint calculator",
        "room paint estimator",
        "paint coverage calculator",
        "gallon of paint coverage",
        "interior paint calculator",
        "painting cost estimator",
      ]}
      faqs={[
        {
          question: "How much paint do I need for a 12x12 room?",
          answer:
            "A 12x12 room with 8-foot ceilings has about 384 sq ft of wall area. After subtracting a door (~21 sq ft) and a window (~15 sq ft), you have roughly 348 sq ft of paintable surface. With 2 coats and standard coverage of 350 sq ft/gallon, you need about 2 gallons of paint.",
        },
        {
          question: "How many square feet does a gallon of paint cover?",
          answer:
            "A gallon of interior latex paint typically covers 350-400 sq ft per coat on smooth surfaces. Textured walls, unpainted drywall, or porous surfaces may reduce coverage to 200-300 sq ft per gallon. Premium paints sometimes offer higher coverage, around 400+ sq ft per gallon.",
        },
        {
          question:
            "Should I buy gallons or quarts of paint?",
          answer:
            "Gallons are more cost-effective per unit volume. A quart typically costs about 30% of a gallon price but only contains 25% of the paint. Buy gallons for large areas and quarts only for small touch-ups or accent walls under 100 sq ft. This calculator shows you the optimal combination.",
        },
        {
          question: "How do I calculate paint for a room with vaulted ceilings?",
          answer:
            "For vaulted or cathedral ceilings, use the Manual mode in this calculator. Measure each wall individually, calculate the area of triangular or trapezoidal walls (base x average height), then enter the total wall area. Remember to subtract doors and windows as usual.",
        },
        {
          question: "Do I need to account for primer separately?",
          answer:
            "Yes. Primer coverage differs from paint, typically 200-300 sq ft per gallon. If painting over dark colors, new drywall, or stained surfaces, add a coat of primer before your paint coats. Some paint-and-primer combos may eliminate this step, but separate primer gives better results on problem surfaces.",
        },
        {
          question: "How much extra paint should I buy?",
          answer:
            "Buy 10-15% more paint than calculated to account for touch-ups, mistakes, and future repairs. This calculator rounds up to the nearest gallon, which typically provides that buffer. Keep leftover paint sealed and stored for future touch-ups, as exact color matching later can be difficult.",
        },
        {
          question: "How do I estimate paint for textured walls?",
          answer:
            "Textured walls absorb more paint. For light texture, reduce coverage to about 300 sq ft/gallon. For heavy texture like stucco or popcorn, use 200-250 sq ft/gallon. Adjust the coverage rate field in this calculator to match your wall texture for more accurate estimates.",
        },
      ]}
      relatedTools={[
        { name: "Square Footage Calculator", href: "/tools/square-footage-calculator" },
        { name: "Concrete Calculator", href: "/tools/concrete-calculator" },
        { name: "Unit Converter", href: "/tools/unit-converter" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
      ]}
      guide={
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
              How to Use the Paint Calculator
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Start by adding your rooms. For each room, enter the length, width, and
              ceiling height to automatically calculate wall area, or switch to Manual
              mode if you already know the total wall area. Add any doors and windows
              to subtract their area from the total. The calculator accounts for
              multiple coats and your paint&apos;s coverage rate to give you the exact
              number of gallons needed.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
              Paint Coverage by Type
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="py-2 pr-4 text-zinc-300 font-medium">Paint Type</th>
                    <th className="py-2 pr-4 text-zinc-300 font-medium">Coverage (sq ft/gal)</th>
                    <th className="py-2 text-zinc-300 font-medium">Best For</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-400">
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 pr-4">Flat / Matte Latex</td>
                    <td className="py-2 pr-4">350 - 400</td>
                    <td className="py-2">Ceilings, low-traffic rooms</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 pr-4">Eggshell Latex</td>
                    <td className="py-2 pr-4">350 - 400</td>
                    <td className="py-2">Living rooms, bedrooms</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 pr-4">Satin Latex</td>
                    <td className="py-2 pr-4">350 - 400</td>
                    <td className="py-2">Kitchens, bathrooms, hallways</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 pr-4">Semi-Gloss Latex</td>
                    <td className="py-2 pr-4">350 - 400</td>
                    <td className="py-2">Trim, doors, cabinets</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 pr-4">High-Gloss</td>
                    <td className="py-2 pr-4">300 - 350</td>
                    <td className="py-2">Trim, furniture, accents</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 pr-4">Oil-Based / Alkyd</td>
                    <td className="py-2 pr-4">350 - 450</td>
                    <td className="py-2">Trim, cabinets, high-wear areas</td>
                  </tr>
                  <tr className="border-b border-zinc-800">
                    <td className="py-2 pr-4">Primer (Latex)</td>
                    <td className="py-2 pr-4">200 - 300</td>
                    <td className="py-2">New drywall, color changes</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">Primer (Shellac/Oil)</td>
                    <td className="py-2 pr-4">200 - 300</td>
                    <td className="py-2">Stain blocking, odor sealing</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-zinc-100 mb-3">
              Surface Preparation Tips
            </h2>
            <ul className="text-zinc-400 space-y-2 list-disc list-inside leading-relaxed">
              <li>
                Clean walls with a damp cloth or TSP solution to remove dust, grease,
                and grime before painting.
              </li>
              <li>
                Fill nail holes and cracks with lightweight spackle. Sand smooth once
                dry.
              </li>
              <li>
                Sand glossy surfaces lightly (120-150 grit) to help new paint adhere.
              </li>
              <li>
                Apply painter&apos;s tape to trim, ceiling edges, and any areas you want to
                protect.
              </li>
              <li>
                Use a stain-blocking primer on water stains, smoke damage, or when
                switching from dark to light colors.
              </li>
              <li>
                Prime bare drywall, wood, or patched areas. These porous surfaces
                absorb more paint without primer.
              </li>
              <li>
                Allow primer and each coat of paint to dry fully (typically 2-4 hours
                for latex) before applying the next coat.
              </li>
            </ul>
          </section>
        </div>
      }
    >
      {/* Room Cards */}
      <div className="space-y-6">
        {rooms.map((room, idx) => (
          <div
            key={room.id}
            className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-4"
          >
            {/* Room Header */}
            <div className="flex items-center justify-between gap-3">
              <input
                type="text"
                value={room.name}
                onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                className="bg-transparent text-lg font-semibold text-zinc-100 focus:outline-none border-b border-transparent focus:border-blue-500 transition-colors"
                placeholder="Room name"
              />
              {rooms.length > 1 && (
                <button
                  onClick={() => removeRoom(room.id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors text-sm"
                  title="Remove room"
                >
                  Remove
                </button>
              )}
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => updateRoom(room.id, { mode: "room" })}
                className={`${btnCls} ${
                  room.mode === "room"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Room Dimensions
              </button>
              <button
                onClick={() => updateRoom(room.id, { mode: "manual" })}
                className={`${btnCls} ${
                  room.mode === "manual"
                    ? "bg-blue-600 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                Manual Area
              </button>
            </div>

            {/* Dimension Inputs */}
            {room.mode === "room" ? (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Length (ft)</label>
                  <input
                    type="number"
                    value={room.length}
                    onChange={(e) =>
                      updateRoom(room.id, { length: e.target.value })
                    }
                    className={inputCls}
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className={labelCls}>Width (ft)</label>
                  <input
                    type="number"
                    value={room.width}
                    onChange={(e) =>
                      updateRoom(room.id, { width: e.target.value })
                    }
                    className={inputCls}
                    min="0"
                    step="0.5"
                  />
                </div>
                <div>
                  <label className={labelCls}>Height (ft)</label>
                  <input
                    type="number"
                    value={room.height}
                    onChange={(e) =>
                      updateRoom(room.id, { height: e.target.value })
                    }
                    className={inputCls}
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
            ) : (
              <div className="max-w-xs">
                <label className={labelCls}>Total Wall Area (sq ft)</label>
                <input
                  type="number"
                  value={room.manualArea}
                  onChange={(e) =>
                    updateRoom(room.id, { manualArea: e.target.value })
                  }
                  className={inputCls}
                  placeholder="e.g. 400"
                  min="0"
                />
              </div>
            )}

            {/* Wall Area Display */}
            <div className="bg-zinc-900 rounded-lg px-4 py-2 text-sm text-zinc-400">
              Gross wall area:{" "}
              <span className="text-zinc-200 font-medium">
                {fmt(getRoomWallArea(room))} sq ft
              </span>
            </div>

            {/* Openings */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={labelCls}>Subtract Openings</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => addOpening(room.id, "door")}
                    className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700`}
                  >
                    + Door
                  </button>
                  <button
                    onClick={() => addOpening(room.id, "window")}
                    className={`${btnCls} bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border border-zinc-700`}
                  >
                    + Window
                  </button>
                </div>
              </div>
              {room.openings.length > 0 && (
                <div className="space-y-2">
                  {room.openings.map((opening) => (
                    <div
                      key={opening.id}
                      className="flex items-center gap-3 bg-zinc-900 rounded-lg px-3 py-2"
                    >
                      <span className="text-sm text-zinc-400 w-16 capitalize">
                        {opening.type}
                      </span>
                      <input
                        type="number"
                        value={opening.sqft}
                        onChange={(e) =>
                          updateOpening(
                            room.id,
                            opening.id,
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-zinc-100 focus:outline-none focus:border-blue-500 w-24 text-sm"
                        min="0"
                        step="1"
                      />
                      <span className="text-xs text-zinc-500">sq ft</span>
                      <button
                        onClick={() => removeOpening(room.id, opening.id)}
                        className="ml-auto text-zinc-600 hover:text-red-400 transition-colors text-xs"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <div className="text-sm text-zinc-500 px-1">
                    Total openings:{" "}
                    <span className="text-zinc-300">
                      {fmt(getRoomOpeningsArea(room))} sq ft
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Room Paintable Area */}
            <div className="bg-zinc-900 border border-zinc-700/50 rounded-lg px-4 py-3">
              <p className="text-sm text-zinc-400">Paintable area for this room</p>
              <p className="text-xl font-bold text-blue-400">
                {fmt(getRoomPaintableArea(room))} sq ft
              </p>
            </div>
          </div>
        ))}

        {/* Add Room Button */}
        <button
          onClick={() => setRooms((prev) => [...prev, createRoom()])}
          className="w-full py-3 rounded-xl border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-blue-500/50 hover:text-blue-400 transition-colors font-medium"
        >
          + Add Another Room
        </button>
      </div>

      {/* Settings */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">
          Paint Settings
        </h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className={labelCls}>Number of Coats</label>
            <input
              type="number"
              value={coats}
              onChange={(e) => setCoats(e.target.value)}
              className={inputCls}
              min="1"
              max="5"
            />
          </div>
          <div>
            <label className={labelCls}>Coverage Rate (sq ft/gal)</label>
            <input
              type="number"
              value={coverageRate}
              onChange={(e) => setCoverageRate(e.target.value)}
              className={inputCls}
              min="50"
              step="25"
            />
          </div>
          <div>
            <label className={labelCls}>Price per Gallon ($)</label>
            <input
              type="number"
              value={pricePerGallon}
              onChange={(e) => setPricePerGallon(e.target.value)}
              className={inputCls}
              min="0"
              step="1"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 space-y-5">
        <h3 className="text-lg font-semibold text-zinc-100">Results</h3>

        {/* Summary Stats */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-sm text-zinc-500 mb-1">Total Paintable Area</p>
            <p className="text-2xl font-bold text-zinc-100">
              {fmt(totalPaintableArea)} <span className="text-sm font-normal text-zinc-500">sq ft</span>
            </p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-sm text-zinc-500 mb-1">
              Area with {numCoats} Coat{numCoats !== 1 ? "s" : ""}
            </p>
            <p className="text-2xl font-bold text-zinc-100">
              {fmt(totalAreaWithCoats)} <span className="text-sm font-normal text-zinc-500">sq ft</span>
            </p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-sm text-zinc-500 mb-1">Paint Needed</p>
            <p className="text-2xl font-bold text-blue-400">
              {fmt(gallonsNeeded, 1)} <span className="text-sm font-normal text-zinc-400">gallons</span>
            </p>
          </div>
          <div className="bg-zinc-900 rounded-xl p-4">
            <p className="text-sm text-zinc-500 mb-1">Estimated Cost</p>
            <p className="text-2xl font-bold text-green-400">
              ${fmt(totalCost)}
            </p>
          </div>
        </div>

        {/* Purchase Options */}
        <div>
          <h4 className="text-sm font-medium text-zinc-300 mb-3">
            Purchase Options
          </h4>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Gallons Only</span>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                  Simple
                </span>
              </div>
              <p className="text-xl font-bold text-zinc-100">
                {gallonsRoundedUp} gallon{gallonsRoundedUp !== 1 ? "s" : ""}
              </p>
              {price > 0 && (
                <p className="text-sm text-zinc-500 mt-1">
                  ${fmt(gallonsRoundedUp * price)} total
                </p>
              )}
            </div>
            <div className="bg-zinc-900 border border-zinc-700/50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Gallons + Quarts</span>
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">
                  Less Waste
                </span>
              </div>
              <p className="text-xl font-bold text-zinc-100">
                {optimizedGallons > 0 && (
                  <>
                    {optimizedGallons} gal{optimizedGallons !== 1 ? "s" : ""}
                  </>
                )}
                {optimizedGallons > 0 && optimizedQuarts > 0 && " + "}
                {optimizedQuarts > 0 && (
                  <>
                    {optimizedQuarts} qt{optimizedQuarts !== 1 ? "s" : ""}
                  </>
                )}
                {optimizedGallons === 0 && optimizedQuarts === 0 && "0"}
              </p>
              {price > 0 && (
                <p className="text-sm text-zinc-500 mt-1">
                  ~${fmt(optimizedCost)} total
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Per-Room Breakdown (if multi-room) */}
        {rooms.length > 1 && (
          <div>
            <h4 className="text-sm font-medium text-zinc-300 mb-3">
              Per-Room Breakdown
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="py-2 pr-4 text-zinc-400 font-medium">Room</th>
                    <th className="py-2 pr-4 text-zinc-400 font-medium text-right">
                      Wall Area
                    </th>
                    <th className="py-2 pr-4 text-zinc-400 font-medium text-right">
                      Openings
                    </th>
                    <th className="py-2 pr-4 text-zinc-400 font-medium text-right">
                      Paintable
                    </th>
                    <th className="py-2 text-zinc-400 font-medium text-right">
                      Gallons ({numCoats} coat{numCoats !== 1 ? "s" : ""})
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((room) => {
                    const paintable = getRoomPaintableArea(room);
                    const roomGallons = (paintable * numCoats) / coverage;
                    return (
                      <tr key={room.id} className="border-b border-zinc-800">
                        <td className="py-2 pr-4 text-zinc-200">{room.name}</td>
                        <td className="py-2 pr-4 text-zinc-400 text-right">
                          {fmt(getRoomWallArea(room))} sq ft
                        </td>
                        <td className="py-2 pr-4 text-zinc-400 text-right">
                          {fmt(getRoomOpeningsArea(room))} sq ft
                        </td>
                        <td className="py-2 pr-4 text-zinc-200 text-right">
                          {fmt(paintable)} sq ft
                        </td>
                        <td className="py-2 text-blue-400 text-right font-medium">
                          {fmt(roomGallons, 1)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="font-medium">
                    <td className="py-2 pr-4 text-zinc-100">Total</td>
                    <td className="py-2 pr-4 text-zinc-300 text-right">
                      {fmt(
                        rooms.reduce((s, r) => s + getRoomWallArea(r), 0)
                      )}{" "}
                      sq ft
                    </td>
                    <td className="py-2 pr-4 text-zinc-300 text-right">
                      {fmt(
                        rooms.reduce((s, r) => s + getRoomOpeningsArea(r), 0)
                      )}{" "}
                      sq ft
                    </td>
                    <td className="py-2 pr-4 text-zinc-100 text-right">
                      {fmt(totalPaintableArea)} sq ft
                    </td>
                    <td className="py-2 text-blue-400 text-right">
                      {fmt(gallonsNeeded, 1)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Quick Reference: Coverage Rates */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-zinc-100 mb-3">
          Quick Reference: Coverage by Surface
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 text-sm">
          {[
            { surface: "Smooth Drywall", rate: "350-400" },
            { surface: "Textured Drywall", rate: "250-300" },
            { surface: "Bare Wood", rate: "300-350" },
            { surface: "Stucco", rate: "150-250" },
            { surface: "Brick", rate: "150-200" },
            { surface: "Concrete Block", rate: "150-200" },
            { surface: "Metal", rate: "350-500" },
            { surface: "Previously Painted", rate: "350-400" },
          ].map((item) => (
            <div
              key={item.surface}
              className="bg-zinc-900 rounded-lg px-3 py-2.5"
            >
              <p className="text-zinc-400 text-xs">{item.surface}</p>
              <p className="text-zinc-100 font-medium">
                {item.rate}{" "}
                <span className="text-zinc-500 font-normal text-xs">
                  sq ft/gal
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Common Room Sizes */}
      <div className="mt-6 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-zinc-100 mb-3">
          Common Room Sizes
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm">
          {[
            { name: "Small Bedroom", dim: "10 x 10", height: 8, area: 320 },
            { name: "Average Bedroom", dim: "12 x 12", height: 8, area: 384 },
            { name: "Large Bedroom", dim: "14 x 16", height: 8, area: 480 },
            { name: "Living Room", dim: "15 x 20", height: 8, area: 560 },
            { name: "Bathroom", dim: "8 x 10", height: 8, area: 288 },
            { name: "Kitchen", dim: "12 x 14", height: 8, area: 416 },
          ].map((item) => (
            <div
              key={item.name}
              className="bg-zinc-900 rounded-lg px-3 py-2.5 flex justify-between items-center"
            >
              <div>
                <p className="text-zinc-200 font-medium">{item.name}</p>
                <p className="text-zinc-500 text-xs">
                  {item.dim} ft, {item.height} ft ceiling
                </p>
              </div>
              <div className="text-right">
                <p className="text-zinc-300">{item.area} sq ft</p>
                <p className="text-zinc-500 text-xs">wall area</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}

"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ── helpers ── */
function fmt(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ── State electricity rates (EIA 2025 YTD, cents/kWh) ── */
const stateRates: Record<string, { name: string; rate: number }> = {
  AL: { name: "Alabama", rate: 16.10 }, AK: { name: "Alaska", rate: 26.09 },
  AZ: { name: "Arizona", rate: 15.32 }, AR: { name: "Arkansas", rate: 12.84 },
  CA: { name: "California", rate: 32.54 }, CO: { name: "Colorado", rate: 15.85 },
  CT: { name: "Connecticut", rate: 29.38 }, DE: { name: "Delaware", rate: 17.13 },
  DC: { name: "District of Columbia", rate: 21.94 }, FL: { name: "Florida", rate: 15.24 },
  GA: { name: "Georgia", rate: 14.73 }, HI: { name: "Hawaii", rate: 40.59 },
  ID: { name: "Idaho", rate: 11.82 }, IL: { name: "Illinois", rate: 17.69 },
  IN: { name: "Indiana", rate: 16.23 }, IA: { name: "Iowa", rate: 13.72 },
  KS: { name: "Kansas", rate: 14.56 }, KY: { name: "Kentucky", rate: 13.24 },
  LA: { name: "Louisiana", rate: 12.57 }, ME: { name: "Maine", rate: 27.78 },
  MD: { name: "Maryland", rate: 19.48 }, MA: { name: "Massachusetts", rate: 30.48 },
  MI: { name: "Michigan", rate: 20.01 }, MN: { name: "Minnesota", rate: 15.82 },
  MS: { name: "Mississippi", rate: 14.03 }, MO: { name: "Missouri", rate: 13.49 },
  MT: { name: "Montana", rate: 12.98 }, NE: { name: "Nebraska", rate: 12.34 },
  NV: { name: "Nevada", rate: 13.15 }, NH: { name: "New Hampshire", rate: 24.56 },
  NJ: { name: "New Jersey", rate: 22.63 }, NM: { name: "New Mexico", rate: 15.08 },
  NY: { name: "New York", rate: 26.39 }, NC: { name: "North Carolina", rate: 14.02 },
  ND: { name: "North Dakota", rate: 11.81 }, OH: { name: "Ohio", rate: 16.96 },
  OK: { name: "Oklahoma", rate: 13.12 }, OR: { name: "Oregon", rate: 15.37 },
  PA: { name: "Pennsylvania", rate: 19.30 }, RI: { name: "Rhode Island", rate: 29.46 },
  SC: { name: "South Carolina", rate: 14.96 }, SD: { name: "South Dakota", rate: 13.38 },
  TN: { name: "Tennessee", rate: 13.18 }, TX: { name: "Texas", rate: 15.47 },
  UT: { name: "Utah", rate: 13.07 }, VT: { name: "Vermont", rate: 22.92 },
  VA: { name: "Virginia", rate: 15.28 }, WA: { name: "Washington", rate: 13.11 },
  WV: { name: "West Virginia", rate: 15.41 }, WI: { name: "Wisconsin", rate: 18.16 },
  WY: { name: "Wyoming", rate: 13.38 },
};
const NATIONAL_AVG = 17.30;

/* ── Appliance database ── */
type Category = "Kitchen" | "Laundry" | "Climate" | "Entertainment" | "Lighting" | "Office" | "Bathroom" | "Outdoor";
interface ApplianceTemplate { name: string; watts: number; hoursPerDay: number; category: Category }

const applianceDB: ApplianceTemplate[] = [
  // Kitchen
  { name: "Refrigerator", watts: 150, hoursPerDay: 24, category: "Kitchen" },
  { name: "Freezer (Standalone)", watts: 40, hoursPerDay: 24, category: "Kitchen" },
  { name: "Microwave", watts: 1100, hoursPerDay: 0.25, category: "Kitchen" },
  { name: "Oven / Range", watts: 2500, hoursPerDay: 0.5, category: "Kitchen" },
  { name: "Dishwasher", watts: 1400, hoursPerDay: 1, category: "Kitchen" },
  { name: "Coffee Maker", watts: 1000, hoursPerDay: 0.25, category: "Kitchen" },
  { name: "Toaster", watts: 1200, hoursPerDay: 0.1, category: "Kitchen" },
  { name: "Electric Kettle", watts: 1500, hoursPerDay: 0.15, category: "Kitchen" },
  { name: "Air Fryer", watts: 1500, hoursPerDay: 0.25, category: "Kitchen" },
  // Laundry
  { name: "Washing Machine", watts: 500, hoursPerDay: 0.43, category: "Laundry" },
  { name: "Clothes Dryer (Electric)", watts: 3000, hoursPerDay: 0.43, category: "Laundry" },
  { name: "Iron", watts: 1000, hoursPerDay: 0.15, category: "Laundry" },
  // Climate
  { name: "Central Air Conditioner", watts: 3500, hoursPerDay: 3, category: "Climate" },
  { name: "Window AC Unit", watts: 1200, hoursPerDay: 4, category: "Climate" },
  { name: "Space Heater", watts: 1500, hoursPerDay: 3, category: "Climate" },
  { name: "Ceiling Fan", watts: 65, hoursPerDay: 6, category: "Climate" },
  { name: "Box / Standing Fan", watts: 75, hoursPerDay: 4, category: "Climate" },
  { name: "Dehumidifier", watts: 350, hoursPerDay: 8, category: "Climate" },
  { name: "Humidifier", watts: 175, hoursPerDay: 8, category: "Climate" },
  // Entertainment
  { name: "LED TV (55\")", watts: 90, hoursPerDay: 4, category: "Entertainment" },
  { name: "LED TV (32\")", watts: 40, hoursPerDay: 4, category: "Entertainment" },
  { name: "Gaming Console", watts: 180, hoursPerDay: 1, category: "Entertainment" },
  { name: "Sound Bar / Speakers", watts: 30, hoursPerDay: 3, category: "Entertainment" },
  // Lighting
  { name: "LED Bulb (60W equiv.)", watts: 9, hoursPerDay: 5, category: "Lighting" },
  { name: "CFL Bulb", watts: 14, hoursPerDay: 5, category: "Lighting" },
  { name: "Incandescent Bulb (60W)", watts: 60, hoursPerDay: 5, category: "Lighting" },
  // Office
  { name: "Desktop Computer", watts: 200, hoursPerDay: 4, category: "Office" },
  { name: "Laptop", watts: 65, hoursPerDay: 5, category: "Office" },
  { name: "Monitor", watts: 30, hoursPerDay: 4, category: "Office" },
  { name: "Wi-Fi Router", watts: 10, hoursPerDay: 24, category: "Office" },
  { name: "Phone Charger", watts: 5, hoursPerDay: 3, category: "Office" },
  // Bathroom
  { name: "Hair Dryer", watts: 1800, hoursPerDay: 0.15, category: "Bathroom" },
  { name: "Curling / Flat Iron", watts: 100, hoursPerDay: 0.15, category: "Bathroom" },
  { name: "Exhaust Fan", watts: 30, hoursPerDay: 0.5, category: "Bathroom" },
  // Outdoor
  { name: "Pool Pump", watts: 1500, hoursPerDay: 6, category: "Outdoor" },
  { name: "Outdoor String Lights (LED)", watts: 25, hoursPerDay: 4, category: "Outdoor" },
  { name: "Garage Door Opener", watts: 350, hoursPerDay: 0.03, category: "Outdoor" },
  { name: "Electric Lawn Mower", watts: 1500, hoursPerDay: 0.14, category: "Outdoor" },
];

const categoryColors: Record<Category, string> = {
  Kitchen: "#3b82f6",
  Laundry: "#8b5cf6",
  Climate: "#ef4444",
  Entertainment: "#f59e0b",
  Lighting: "#eab308",
  Office: "#06b6d4",
  Bathroom: "#ec4899",
  Outdoor: "#22c55e",
};

const categoryIcons: Record<Category, string> = {
  Kitchen: "🍳", Laundry: "👕", Climate: "❄️", Entertainment: "📺",
  Lighting: "💡", Office: "💻", Bathroom: "🚿", Outdoor: "🌿",
};

interface ActiveAppliance {
  id: number;
  name: string;
  watts: number;
  hoursPerDay: number;
  quantity: number;
  category: Category;
}

let nextId = 1;

export default function Page() {
  const [stateCode, setStateCode] = useState("US");
  const [customRate, setCustomRate] = useState<number | null>(null);
  const [appliances, setAppliances] = useState<ActiveAppliance[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [filterCat, setFilterCat] = useState<Category | "All">("All");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const rate = customRate ?? (stateCode === "US" ? NATIONAL_AVG : stateRates[stateCode]?.rate ?? NATIONAL_AVG);

  /* quick-add an appliance */
  const addAppliance = useCallback((tpl: ApplianceTemplate) => {
    setAppliances(prev => [...prev, { ...tpl, id: nextId++, quantity: 1 }]);
    setSelectedTemplate("");
  }, []);

  const removeAppliance = useCallback((id: number) => {
    setAppliances(prev => prev.filter(a => a.id !== id));
  }, []);

  const updateAppliance = useCallback((id: number, field: keyof ActiveAppliance, value: number | string) => {
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, [field]: value } : a));
  }, []);

  /* add common household preset */
  const addPreset = useCallback(() => {
    const preset = ["Refrigerator", "Microwave", "LED TV (55\")", "Laptop", "Wi-Fi Router", "Washing Machine", "Clothes Dryer (Electric)", "Ceiling Fan", "LED Bulb (60W equiv.)"];
    const newAppliances: ActiveAppliance[] = [];
    for (const name of preset) {
      const tpl = applianceDB.find(a => a.name === name);
      if (tpl) {
        const qty = name === "LED Bulb (60W equiv.)" ? 10 : 1;
        newAppliances.push({ ...tpl, id: nextId++, quantity: qty });
      }
    }
    setAppliances(newAppliances);
  }, []);

  /* ── calculations ── */
  const results = useMemo(() => {
    const ratePerWh = rate / 100 / 1000; // $ per Wh

    const items = appliances.map(a => {
      const dailyKwh = (a.watts * a.hoursPerDay * a.quantity) / 1000;
      const dailyCost = dailyKwh * (rate / 100);
      return {
        ...a,
        dailyKwh,
        dailyCost,
        monthlyCost: dailyCost * 30,
        yearlyCost: dailyCost * 365,
      };
    });

    const totalDailyKwh = items.reduce((s, i) => s + i.dailyKwh, 0);
    const totalDaily = items.reduce((s, i) => s + i.dailyCost, 0);
    const totalMonthly = totalDaily * 30;
    const totalYearly = totalDaily * 365;

    /* category breakdown */
    const catMap = new Map<Category, number>();
    for (const item of items) {
      catMap.set(item.category, (catMap.get(item.category) || 0) + item.monthlyCost);
    }
    const categories = Array.from(catMap.entries())
      .map(([cat, cost]) => ({ category: cat, cost, pct: totalMonthly > 0 ? (cost / totalMonthly) * 100 : 0 }))
      .sort((a, b) => b.cost - a.cost);

    /* top consumers */
    const topConsumers = [...items].sort((a, b) => b.monthlyCost - a.monthlyCost).slice(0, 5);

    return { items, totalDailyKwh, totalDaily, totalMonthly, totalYearly, categories, topConsumers, ratePerWh };
  }, [appliances, rate]);

  /* ── donut chart ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || results.categories.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 280;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const outerR = 120;
    const innerR = 70;

    ctx.clearRect(0, 0, size, size);

    let startAngle = -Math.PI / 2;
    for (const cat of results.categories) {
      const sweep = (cat.pct / 100) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, outerR, startAngle, startAngle + sweep);
      ctx.arc(cx, cy, innerR, startAngle + sweep, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = categoryColors[cat.category];
      ctx.fill();
      startAngle += sweep;
    }

    // center text
    ctx.fillStyle = "#faf7f2";
    ctx.font = "bold 20px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fmt(results.totalMonthly), cx, cy - 10);
    ctx.font = "13px system-ui";
    ctx.fillStyle = "#a1a19b";
    ctx.fillText("per month", cx, cy + 12);
  }, [results]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 text-sm";
  const labelCls = "block text-sm text-zinc-300 mb-1";

  const filteredDB = filterCat === "All" ? applianceDB : applianceDB.filter(a => a.category === filterCat);

  return (
    <ToolLayout
      title="Electricity Cost Calculator"
      description="Calculate how much your appliances cost to run. See your monthly electric bill breakdown by appliance and category with real state-by-state electricity rates."
      slug="electricity-cost-calculator"
      category="Home & Energy"
      keywords={[
        "electricity cost calculator",
        "electric bill calculator",
        "electricity usage calculator",
        "kWh calculator",
        "appliance energy cost",
        "how much does it cost to run",
        "energy cost calculator",
        "power consumption calculator",
        "electric bill estimator",
        "appliance electricity cost calculator",
        "electricity price by state",
        "home energy calculator",
      ]}
      faqs={[
        { question: "How is electricity cost calculated?", answer: "Electricity cost is calculated with the formula: Cost = (Watts × Hours used × Days) ÷ 1,000 × Rate per kWh. For example, a 1,500W space heater running 3 hours per day at $0.16/kWh costs: (1,500 × 3 × 30) ÷ 1,000 × $0.16 = $21.60 per month." },
        { question: "What is a kWh (kilowatt-hour)?", answer: "A kilowatt-hour (kWh) is the standard unit for measuring electricity consumption. It represents using 1,000 watts of power for one hour. For example, a 100-watt light bulb running for 10 hours uses 1 kWh. Your electric bill charges you per kWh consumed." },
        { question: "How much electricity does the average US home use?", answer: "The average US household uses about 899 kWh per month (10,791 kWh per year), according to the EIA. This varies widely by state — Louisiana averages 1,140 kWh/month while Hawaii averages 515 kWh/month. Climate (heating/cooling needs) is the biggest factor." },
        { question: "Why is my electricity rate different from the state average?", answer: "State averages include all utilities and rate plans. Your actual rate depends on your specific utility company, rate plan (tiered, time-of-use, flat), and usage level. Check your electric bill for your exact rate per kWh — it is usually listed as 'Energy Charge' or 'Price per kWh.'" },
        { question: "What uses the most electricity in my home?", answer: "The biggest electricity consumers in most homes are: central air conditioning (30-50% of summer bills), water heaters (14-18%), clothes dryers (6%), refrigerators (5%), and lighting (5-10%). Space heaters and pool pumps are also major consumers when in use." },
        { question: "How can I lower my electricity bill?", answer: "The most impactful steps are: switch to LED bulbs (saves $100+/year), use a programmable thermostat (saves 10-15%), run appliances during off-peak hours if on time-of-use rates, unplug phantom loads (chargers, standby devices), air-seal your home, and upgrade old appliances to Energy Star models." },
        { question: "Does this calculator account for standby power?", answer: "The wattage values in our appliance database represent active-use wattage. Most electronics draw small amounts of standby (phantom) power when plugged in but turned off — typically 1-5 watts per device. For a typical home, phantom loads add $100-200 per year to your electric bill." },
        { question: "How accurate are the appliance wattages?", answer: "Our wattage database uses typical values from the US Department of Energy and EIA. Actual wattage varies by model, age, and usage pattern. Refrigerator wattage (150W) represents the average draw over 24 hours, accounting for compressor cycling. Check the label on your appliance or use a kill-a-watt meter for exact measurements." },
      ]}
      relatedTools={[
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
        { name: "Unit Converter", href: "/tools/unit-converter" },
        { name: "Ohm's Law Calculator", href: "/tools/ohms-law-calculator" },
        { name: "Savings Calculator", href: "/tools/savings-calculator" },
      ]}
      guide={<>
        <h2>How to Calculate Your Electricity Cost</h2>
        <h3>Understanding Your Electric Bill</h3>
        <p>Your electric bill is determined by how many kilowatt-hours (kWh) you consume multiplied by your rate per kWh. The formula is simple:</p>
        <p><strong>Monthly Cost = (Watts × Hours/Day × 30) ÷ 1,000 × Rate per kWh</strong></p>
        <p>For example, running a central air conditioner (3,500W) for 3 hours per day at the national average rate of $0.173/kWh costs about $54.50 per month — making it the single biggest electricity expense in most homes.</p>

        <h3>Electricity Rates Across the US</h3>
        <p>Electricity rates vary dramatically by state. As of 2025, the cheapest states are North Dakota ($0.118/kWh), Idaho ($0.118/kWh), and Nebraska ($0.123/kWh). The most expensive are Hawaii ($0.406/kWh), California ($0.325/kWh), and Massachusetts ($0.305/kWh).</p>
        <p>The national residential average is about $0.173/kWh, but rates have been rising. Energy costs increased 5.4% nationally in 2025, with some states seeing double-digit increases.</p>

        <h3>What Uses the Most Electricity?</h3>
        <p>In most American homes, the top electricity consumers are:</p>
        <ol>
          <li><strong>Heating and cooling (40-50%)</strong> — Central AC, space heaters, and furnace blowers dominate most bills. A central AC unit running 3 hours/day costs $50-60/month at average rates.</li>
          <li><strong>Water heating (14-18%)</strong> — Electric water heaters run continuously and account for a large share of usage.</li>
          <li><strong>Appliances (15-20%)</strong> — Refrigerators, clothes dryers, ovens, and dishwashers add up.</li>
          <li><strong>Lighting (5-10%)</strong> — Switching from incandescent to LED bulbs can cut lighting costs by 75-85%.</li>
          <li><strong>Electronics (5-10%)</strong> — TVs, computers, gaming consoles, and standby power draw.</li>
        </ol>

        <h3>How to Lower Your Electricity Bill</h3>
        <p>The highest-impact changes you can make:</p>
        <ul>
          <li><strong>Switch all bulbs to LED</strong>: A home with 30 incandescent bulbs switched to LED saves $150-250 per year.</li>
          <li><strong>Use a smart thermostat</strong>: Proper temperature scheduling saves 10-15% on heating/cooling.</li>
          <li><strong>Eliminate phantom loads</strong>: Unplugging chargers and standby devices saves $100-200/year.</li>
          <li><strong>Run appliances off-peak</strong>: If your utility offers time-of-use rates, shifting laundry and dishwasher to evenings can save 20-30%.</li>
          <li><strong>Upgrade old appliances</strong>: A new Energy Star refrigerator uses 40% less electricity than models from 15 years ago.</li>
          <li><strong>Air seal and insulate</strong>: Proper insulation reduces heating/cooling costs by 15-20%.</li>
        </ul>

        <h3>Seasonal Considerations</h3>
        <p>Your electric bill likely fluctuates significantly by season. Summer bills can be 2-3x higher than spring/fall due to air conditioning. In cold climates with electric heating, winter bills spike similarly. Use this calculator with seasonal usage hours to estimate your bill throughout the year.</p>
      </>}
    >
      {/* ── Rate Setup ── */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Your State</label>
          <select
            value={stateCode}
            onChange={e => { setStateCode(e.target.value); setCustomRate(null); }}
            className={inputCls}
          >
            <option value="US">US Average ({NATIONAL_AVG}¢/kWh)</option>
            {Object.entries(stateRates)
              .sort((a, b) => a[1].name.localeCompare(b[1].name))
              .map(([code, s]) => (
                <option key={code} value={code}>{s.name} ({s.rate}¢/kWh)</option>
              ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Rate (¢/kWh) <span className="text-zinc-500 text-xs">— override if you know yours</span></label>
          <input
            type="number"
            value={customRate ?? rate}
            onChange={e => setCustomRate(e.target.value ? +e.target.value : null)}
            className={inputCls}
            min={0}
            max={100}
            step={0.01}
          />
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={addPreset}
          className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
        >
          Load Typical Household
        </button>
        {appliances.length > 0 && (
          <button
            onClick={() => setAppliances([])}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg px-4 py-2 border border-zinc-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Add Appliance ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Add Appliances</h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {(["All", "Kitchen", "Laundry", "Climate", "Entertainment", "Lighting", "Office", "Bathroom", "Outdoor"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCat(cat)}
              className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
                filterCat === cat
                  ? "bg-blue-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
              }`}
            >
              {cat !== "All" && <span className="mr-1">{categoryIcons[cat]}</span>}{cat}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto">
          {filteredDB.map(tpl => (
            <button
              key={tpl.name}
              onClick={() => addAppliance(tpl)}
              className="text-left bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg px-3 py-2 text-sm transition-colors group"
            >
              <div className="text-zinc-200 group-hover:text-blue-400 transition-colors truncate">{tpl.name}</div>
              <div className="text-xs text-zinc-500">{tpl.watts.toLocaleString()}W · {tpl.hoursPerDay}h/day</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Active Appliances List ── */}
      {appliances.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Your Appliances ({appliances.length})</h3>
          <div className="space-y-2">
            {appliances.map(a => {
              const item = results.items.find(i => i.id === a.id);
              return (
                <div key={a.id} className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 flex flex-wrap items-center gap-3">
                  <span className="text-lg">{categoryIcons[a.category]}</span>
                  <div className="flex-1 min-w-[140px]">
                    <div className="text-sm font-medium text-zinc-200">{a.name}</div>
                    <div className="text-xs text-zinc-500">{a.category}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-500">Qty</label>
                    <input
                      type="number"
                      value={a.quantity}
                      onChange={e => updateAppliance(a.id, "quantity", Math.max(1, +e.target.value))}
                      className="w-14 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 text-center"
                      min={1}
                      max={50}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-500">Watts</label>
                    <input
                      type="number"
                      value={a.watts}
                      onChange={e => updateAppliance(a.id, "watts", Math.max(0, +e.target.value))}
                      className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 text-center"
                      min={0}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-zinc-500">Hrs/day</label>
                    <input
                      type="number"
                      value={a.hoursPerDay}
                      onChange={e => updateAppliance(a.id, "hoursPerDay", Math.max(0, Math.min(24, +e.target.value)))}
                      className="w-20 bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-100 text-center"
                      min={0}
                      max={24}
                      step={0.25}
                    />
                  </div>
                  <div className="text-right min-w-[80px]">
                    <div className="text-sm font-semibold text-zinc-100">{fmt(item?.monthlyCost ?? 0)}<span className="text-xs text-zinc-500 font-normal">/mo</span></div>
                  </div>
                  <button
                    onClick={() => removeAppliance(a.id)}
                    className="text-zinc-600 hover:text-red-400 transition-colors text-lg leading-none"
                    aria-label={`Remove ${a.name}`}
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Results ── */}
      {appliances.length > 0 && (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Daily", value: results.totalDaily, sub: `${results.totalDailyKwh.toFixed(1)} kWh` },
              { label: "Monthly", value: results.totalMonthly, sub: `${(results.totalDailyKwh * 30).toFixed(0)} kWh` },
              { label: "Yearly", value: results.totalYearly, sub: `${(results.totalDailyKwh * 365).toFixed(0)} kWh` },
              { label: "Rate", value: null, sub: `${rate.toFixed(2)}¢/kWh`, display: stateCode === "US" ? "US Avg" : stateRates[stateCode]?.name ?? "Custom" },
            ].map(c => (
              <div key={c.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-center">
                <div className="text-xs text-zinc-500 mb-1">{c.label}</div>
                <div className="text-xl font-bold text-zinc-100">{c.value !== null ? fmt(c.value) : c.display}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{c.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Donut chart */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4">Cost by Category</h3>
              <div className="flex flex-col items-center">
                <canvas ref={canvasRef} />
                <div className="mt-4 w-full space-y-2">
                  {results.categories.map(cat => (
                    <div key={cat.category} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: categoryColors[cat.category] }} />
                      <span className="flex-1 text-zinc-300">{categoryIcons[cat.category]} {cat.category}</span>
                      <span className="text-zinc-400">{cat.pct.toFixed(1)}%</span>
                      <span className="text-zinc-200 font-medium w-20 text-right">{fmt(cat.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top consumers */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4">Top Energy Consumers</h3>
              <div className="space-y-3">
                {results.topConsumers.map((item, i) => {
                  const maxCost = results.topConsumers[0]?.monthlyCost || 1;
                  const barPct = (item.monthlyCost / maxCost) * 100;
                  return (
                    <div key={item.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-zinc-300">{categoryIcons[item.category]} {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ""}</span>
                        <span className="text-zinc-200 font-medium">{fmt(item.monthlyCost)}/mo</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${barPct}%`, backgroundColor: categoryColors[item.category] }}
                        />
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">{item.dailyKwh.toFixed(2)} kWh/day · {(item.watts * item.quantity).toLocaleString()}W</div>
                    </div>
                  );
                })}
              </div>

              {/* Comparison to national avg */}
              <div className="mt-6 pt-4 border-t border-zinc-800">
                <h4 className="text-sm font-semibold text-zinc-200 mb-2">How You Compare</h4>
                <div className="text-sm text-zinc-400">
                  US average household: <span className="text-zinc-200 font-medium">~899 kWh/mo ({fmt(899 * NATIONAL_AVG / 100)}/mo)</span>
                </div>
                <div className="text-sm text-zinc-400 mt-1">
                  Your estimate: <span className={`font-medium ${results.totalDailyKwh * 30 > 899 ? "text-red-400" : "text-green-400"}`}>
                    {(results.totalDailyKwh * 30).toFixed(0)} kWh/mo ({fmt(results.totalMonthly)}/mo)
                  </span>
                </div>
                <div className="text-xs text-zinc-500 mt-2">
                  Note: This estimate only includes the appliances you added above. Your actual bill includes all devices, standby power, and base charges.
                </div>
              </div>
            </div>
          </div>

          {/* Full table */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <h3 className="text-sm font-semibold text-zinc-200 p-4 pb-2">Full Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs">
                    <th className="text-left px-4 py-2 font-medium">Appliance</th>
                    <th className="text-right px-4 py-2 font-medium">Watts</th>
                    <th className="text-right px-4 py-2 font-medium">Hrs/Day</th>
                    <th className="text-right px-4 py-2 font-medium">kWh/Day</th>
                    <th className="text-right px-4 py-2 font-medium">Monthly</th>
                    <th className="text-right px-4 py-2 font-medium">Yearly</th>
                  </tr>
                </thead>
                <tbody>
                  {results.items
                    .sort((a, b) => b.monthlyCost - a.monthlyCost)
                    .map(item => (
                    <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
                      <td className="px-4 py-2 text-zinc-200">
                        <span className="mr-1.5">{categoryIcons[item.category]}</span>
                        {item.name}{item.quantity > 1 ? ` ×${item.quantity}` : ""}
                      </td>
                      <td className="px-4 py-2 text-right text-zinc-400">{(item.watts * item.quantity).toLocaleString()}</td>
                      <td className="px-4 py-2 text-right text-zinc-400">{item.hoursPerDay}</td>
                      <td className="px-4 py-2 text-right text-zinc-400">{item.dailyKwh.toFixed(2)}</td>
                      <td className="px-4 py-2 text-right text-zinc-200 font-medium">{fmt(item.monthlyCost)}</td>
                      <td className="px-4 py-2 text-right text-zinc-200">{fmt(item.yearlyCost)}</td>
                    </tr>
                  ))}
                  <tr className="bg-zinc-800/30 font-semibold">
                    <td className="px-4 py-2 text-zinc-100">Total</td>
                    <td className="px-4 py-2 text-right text-zinc-400">{appliances.reduce((s, a) => s + a.watts * a.quantity, 0).toLocaleString()}</td>
                    <td className="px-4 py-2" />
                    <td className="px-4 py-2 text-right text-zinc-200">{results.totalDailyKwh.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right text-zinc-100">{fmt(results.totalMonthly)}</td>
                    <td className="px-4 py-2 text-right text-zinc-100">{fmt(results.totalYearly)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* empty state */}
      {appliances.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">⚡</div>
          <h3 className="text-lg font-semibold text-zinc-200 mb-2">Add Appliances to Get Started</h3>
          <p className="text-sm text-zinc-400 mb-4 max-w-md mx-auto">
            Select your state, then add appliances from the list above — or click &quot;Load Typical Household&quot; for a quick estimate.
          </p>
        </div>
      )}
    </ToolLayout>
  );
}

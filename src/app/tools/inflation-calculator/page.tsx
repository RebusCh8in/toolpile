"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ── CPI-U Annual Averages (Bureau of Labor Statistics) ──
   Base period: 1982-84 = 100. Source: https://www.bls.gov/cpi/
   Updated through 2025. */
const CPI: Record<number, number> = {
  1913: 9.9, 1914: 10.0, 1915: 10.1, 1916: 10.9, 1917: 12.8, 1918: 15.1, 1919: 17.3, 1920: 20.0,
  1921: 17.9, 1922: 16.8, 1923: 17.1, 1924: 17.1, 1925: 17.5, 1926: 17.7, 1927: 17.4, 1928: 17.2,
  1929: 17.2, 1930: 16.7, 1931: 15.2, 1932: 13.6, 1933: 12.9, 1934: 13.4, 1935: 13.7, 1936: 13.9,
  1937: 14.4, 1938: 14.1, 1939: 13.9, 1940: 14.0, 1941: 14.7, 1942: 16.3, 1943: 17.3, 1944: 17.6,
  1945: 18.0, 1946: 19.5, 1947: 22.3, 1948: 24.1, 1949: 23.8, 1950: 24.1, 1951: 26.0, 1952: 26.6,
  1953: 26.8, 1954: 26.9, 1955: 26.8, 1956: 27.2, 1957: 28.1, 1958: 28.9, 1959: 29.2, 1960: 29.6,
  1961: 29.9, 1962: 30.3, 1963: 30.6, 1964: 31.0, 1965: 31.5, 1966: 32.5, 1967: 33.4, 1968: 34.8,
  1969: 36.7, 1970: 38.8, 1971: 40.5, 1972: 41.8, 1973: 44.4, 1974: 49.3, 1975: 53.8, 1976: 56.9,
  1977: 60.6, 1978: 65.2, 1979: 72.6, 1980: 82.4, 1981: 90.9, 1982: 96.5, 1983: 99.6, 1984: 103.9,
  1985: 107.6, 1986: 109.6, 1987: 113.6, 1988: 118.3, 1989: 124.0, 1990: 130.7, 1991: 136.2,
  1992: 140.3, 1993: 144.5, 1994: 148.2, 1995: 152.4, 1996: 156.9, 1997: 160.5, 1998: 163.0,
  1999: 166.6, 2000: 172.2, 2001: 177.1, 2002: 179.9, 2003: 184.0, 2004: 188.9, 2005: 195.3,
  2006: 201.6, 2007: 207.3, 2008: 215.3, 2009: 214.5, 2010: 218.1, 2011: 224.9, 2012: 229.6,
  2013: 233.0, 2014: 236.7, 2015: 237.0, 2016: 240.0, 2017: 245.1, 2018: 251.1, 2019: 255.7,
  2020: 258.8, 2021: 271.0, 2022: 292.7, 2023: 304.7, 2024: 313.5, 2025: 321.4,
};

const YEARS = Object.keys(CPI).map(Number).sort((a, b) => a - b);
const MIN_YEAR = YEARS[0];
const MAX_YEAR = YEARS[YEARS.length - 1];

function fmt(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 100_000) return "$" + (n / 1_000).toFixed(1) + "K";
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function pct(n: number) {
  return (n >= 0 ? "+" : "") + n.toFixed(1) + "%";
}

/* ── Mini canvas chart ── */
function PurchasingPowerChart({ amount, fromYear, toYear }: { amount: number; fromYear: number; toYear: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const w = container.clientWidth;
    const h = 200;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const startY = Math.min(fromYear, toYear);
    const endY = Math.max(fromYear, toYear);
    const baseCpi = CPI[fromYear];

    // Build data points
    const points: { year: number; value: number }[] = [];
    for (let y = startY; y <= endY; y++) {
      if (CPI[y] !== undefined) {
        points.push({ year: y, value: (baseCpi / CPI[y]) * amount });
      }
    }
    if (points.length < 2) return;

    const values = points.map(p => p.value);
    const maxVal = Math.max(...values) * 1.08;
    const minVal = Math.min(...values) * 0.92;

    const pad = { top: 20, right: 16, bottom: 30, left: 60 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    const x = (year: number) => pad.left + ((year - startY) / (endY - startY)) * cw;
    const y = (val: number) => pad.top + (1 - (val - minVal) / (maxVal - minVal)) * ch;

    // Clear
    ctx.clearRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = "rgba(113,113,122,0.2)";
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 0; i <= gridLines; i++) {
      const gy = pad.top + (ch / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, gy);
      ctx.lineTo(w - pad.right, gy);
      ctx.stroke();

      const gv = maxVal - ((maxVal - minVal) / gridLines) * i;
      ctx.fillStyle = "rgb(161,161,170)";
      ctx.font = "11px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(fmt(gv), pad.left - 8, gy + 4);
    }

    // Year labels
    ctx.fillStyle = "rgb(161,161,170)";
    ctx.textAlign = "center";
    ctx.font = "11px system-ui";
    const span = endY - startY;
    const step = span <= 10 ? 1 : span <= 30 ? 5 : span <= 60 ? 10 : 20;
    for (let yr = Math.ceil(startY / step) * step; yr <= endY; yr += step) {
      ctx.fillText(String(yr), x(yr), h - 8);
    }
    // Always show start/end
    ctx.fillText(String(startY), x(startY), h - 8);
    if (endY - Math.floor(endY / step) * step > step * 0.3) {
      ctx.fillText(String(endY), x(endY), h - 8);
    }

    // Gradient fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ch);
    grad.addColorStop(0, "rgba(59,130,246,0.25)");
    grad.addColorStop(1, "rgba(59,130,246,0.02)");
    ctx.beginPath();
    ctx.moveTo(x(points[0].year), y(points[0].value));
    for (let i = 1; i < points.length; i++) ctx.lineTo(x(points[i].year), y(points[i].value));
    ctx.lineTo(x(points[points.length - 1].year), pad.top + ch);
    ctx.lineTo(x(points[0].year), pad.top + ch);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.moveTo(x(points[0].year), y(points[0].value));
    for (let i = 1; i < points.length; i++) ctx.lineTo(x(points[i].year), y(points[i].value));
    ctx.strokeStyle = "rgb(59,130,246)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Start & end dots
    ctx.fillStyle = "rgb(59,130,246)";
    [points[0], points[points.length - 1]].forEach(p => {
      ctx.beginPath();
      ctx.arc(x(p.year), y(p.value), 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [amount, fromYear, toYear]);

  return (
    <div ref={containerRef} className="w-full">
      <canvas ref={canvasRef} />
    </div>
  );
}

/* ── Decade highlights ── */
function getDecadeData(fromYear: number, toYear: number) {
  const rows: { decade: string; rate: string; event: string }[] = [];
  const decadeInfo: Record<string, string> = {
    "1910s": "World War I",
    "1920s": "Post-war deflation, then Roaring Twenties",
    "1930s": "Great Depression deflation",
    "1940s": "World War II price controls",
    "1950s": "Post-war boom, Korean War",
    "1960s": "Stable growth, Vietnam spending",
    "1970s": "Oil crisis, stagflation",
    "1980s": "Volcker shock, rates peak then fall",
    "1990s": "Great Moderation, tech boom",
    "2000s": "Housing bubble, Great Recession",
    "2010s": "Low inflation, slow recovery",
    "2020s": "COVID stimulus, supply shocks",
  };

  const startDec = Math.floor(fromYear / 10) * 10;
  const endDec = Math.floor(toYear / 10) * 10;

  for (let d = startDec; d <= endDec; d += 10) {
    const dStart = Math.max(d, fromYear);
    const dEnd = Math.min(d + 9, toYear);
    if (CPI[dStart] && CPI[dEnd] && dEnd > dStart) {
      const years = dEnd - dStart;
      const totalPct = ((CPI[dEnd] / CPI[dStart]) - 1) * 100;
      const annualized = (Math.pow(CPI[dEnd] / CPI[dStart], 1 / years) - 1) * 100;
      const label = d + "s";
      rows.push({
        decade: `${dStart}-${dEnd}`,
        rate: annualized.toFixed(1) + "% avg/yr",
        event: decadeInfo[label] || "",
      });
    }
  }
  return rows;
}

export default function Page() {
  const [amount, setAmount] = useState(100);
  const [fromYear, setFromYear] = useState(2000);
  const [toYear, setToYear] = useState(MAX_YEAR);

  const result = useMemo(() => {
    const cpiFrom = CPI[fromYear];
    const cpiTo = CPI[toYear];
    if (!cpiFrom || !cpiTo) return null;

    const adjustedAmount = (cpiTo / cpiFrom) * amount;
    const totalInflation = ((cpiTo / cpiFrom) - 1) * 100;
    const yearSpan = Math.abs(toYear - fromYear);
    const avgAnnual = yearSpan > 0 ? (Math.pow(cpiTo / cpiFrom, 1 / yearSpan) - 1) * 100 : 0;
    const purchasingPower = (cpiFrom / cpiTo) * amount;

    return { adjustedAmount, totalInflation, avgAnnual, purchasingPower, yearSpan };
  }, [amount, fromYear, toYear]);

  const decades = useMemo(() => getDecadeData(Math.min(fromYear, toYear), Math.max(fromYear, toYear)), [fromYear, toYear]);

  // Popular comparisons
  const popularComparisons = [
    { label: "$1 in 1950", from: 1950, to: MAX_YEAR, amt: 1 },
    { label: "$1 in 1970", from: 1970, to: MAX_YEAR, amt: 1 },
    { label: "$1 in 1990", from: 1990, to: MAX_YEAR, amt: 1 },
    { label: "$1 in 2000", from: 2000, to: MAX_YEAR, amt: 1 },
    { label: "$100 in 1980", from: 1980, to: MAX_YEAR, amt: 100 },
    { label: "$50K in 2010", from: 2010, to: MAX_YEAR, amt: 50000 },
  ];

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const selectCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none";

  return (
    <ToolLayout
      title="Inflation Calculator"
      description="Calculate how inflation has changed the value of money using real U.S. CPI data from 1913 to 2025. See what past dollars are worth today and how purchasing power has changed over time."
      slug="inflation-calculator"
      category="Finance"
      keywords={["inflation calculator", "cpi calculator", "purchasing power calculator", "dollar value over time", "what was a dollar worth in", "inflation rate by year", "cost of living calculator", "historical inflation calculator"]}
      faqs={[
        { question: "Where does the CPI data come from?", answer: "This calculator uses the Consumer Price Index for All Urban Consumers (CPI-U) annual averages published by the U.S. Bureau of Labor Statistics. CPI data goes back to 1913 and is updated annually. The base period is 1982-84 = 100." },
        { question: "What is the average U.S. inflation rate?", answer: "From 1913 to 2025, the average annual U.S. inflation rate has been approximately 3.2%. However, this varies dramatically by decade: the 1970s averaged over 7% while the 2010s averaged under 2%. Recent years saw a spike with 2022 hitting 8% before cooling to around 2.5% in 2025." },
        { question: "How does inflation affect purchasing power?", answer: "Inflation reduces what each dollar can buy. If inflation is 3% per year, $100 today will only buy what $97 buys next year. Over 25 years at 3%, $100 loses over half its purchasing power — you'd need about $209 to buy what $100 bought 25 years earlier." },
        { question: "Why did inflation spike in 2021-2022?", answer: "The 2021-2022 inflation spike was driven by pandemic-era stimulus spending, supply chain disruptions, labor shortages, and energy price increases following geopolitical events. CPI rose 4.7% in 2021 and 8.0% in 2022 — the highest since 1981." },
        { question: "Is CPI the only way to measure inflation?", answer: "No. Other measures include the Personal Consumption Expenditures (PCE) price index (preferred by the Federal Reserve), the Producer Price Index (PPI), and Core CPI which excludes volatile food and energy prices. Each captures different aspects of price changes." },
        { question: "How is the inflation adjustment calculated?", answer: "The formula is: Adjusted Amount = Original Amount x (CPI in target year / CPI in original year). For example, $100 in 1990 when CPI was 130.7, adjusted to 2025 when CPI is 321.4: $100 x (321.4 / 130.7) = $245.83." },
      ]}
      relatedTools={[
        { name: "Investment Calculator", href: "/tools/investment-calculator" },
        { name: "Savings Calculator", href: "/tools/savings-calculator" },
        { name: "Retirement Calculator", href: "/tools/retirement-calculator" },
        { name: "Salary Calculator", href: "/tools/salary-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
      ]}
    >
      {/* Quick comparisons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {popularComparisons.map((c, i) => (
          <button
            key={i}
            onClick={() => { setAmount(c.amt); setFromYear(c.from); setToYear(c.to); }}
            className="px-3 py-1.5 rounded-lg text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200 transition-colors border border-zinc-700"
          >
            {c.label} &rarr; today
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Dollar Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(Math.max(0, +e.target.value))}
                className={inputCls + " pl-7"}
                min={0}
                step={1}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>From Year</label>
              <select value={fromYear} onChange={e => setFromYear(+e.target.value)} className={selectCls}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>To Year</label>
              <select value={toYear} onChange={e => setToYear(+e.target.value)} className={selectCls}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <button
            onClick={() => { const tmp = fromYear; setFromYear(toYear); setToYear(tmp); }}
            className="w-full py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 transition-colors"
          >
            Swap Years
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
              <p className="text-sm text-zinc-400 mb-1">
                {fmt(amount)} in {fromYear} equals
              </p>
              <p className="text-4xl font-bold text-blue-400">{fmt(result.adjustedAmount)}</p>
              <p className="text-sm text-zinc-500 mt-1">in {toYear} dollars</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
                <p className="text-xs text-zinc-500">Total Inflation</p>
                <p className={`text-lg font-semibold ${result.totalInflation >= 0 ? "text-red-400" : "text-green-400"}`}>
                  {pct(result.totalInflation)}
                </p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
                <p className="text-xs text-zinc-500">Avg Annual</p>
                <p className={`text-lg font-semibold ${result.avgAnnual >= 0 ? "text-orange-400" : "text-green-400"}`}>
                  {pct(result.avgAnnual)}
                </p>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-center">
                <p className="text-xs text-zinc-500">Year Span</p>
                <p className="text-lg font-semibold text-zinc-100">{result.yearSpan} yr{result.yearSpan !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Purchasing Power Chart */}
      {result && result.yearSpan >= 2 && (
        <div className="mt-6 bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <h3 className="text-sm font-medium text-zinc-300 mb-3">
            Purchasing Power of {fmt(amount)} ({fromYear}) Over Time
          </h3>
          <PurchasingPowerChart amount={amount} fromYear={fromYear} toYear={toYear} />
        </div>
      )}

      {/* Key insight callout */}
      {result && (
        <div className="mt-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-5">
          <p className="text-blue-300 text-sm leading-relaxed">
            {fromYear < toYear ? (
              <>
                {fmt(amount)} in {fromYear} had the same buying power as {fmt(result.adjustedAmount)} in {toYear}.
                That means prices increased {result.totalInflation.toFixed(1)}% over {result.yearSpan} years,
                averaging {result.avgAnnual.toFixed(1)}% per year. To maintain the same purchasing power,
                you would have needed {fmt(result.adjustedAmount - amount)} more in {toYear}.
              </>
            ) : (
              <>
                {fmt(amount)} in {fromYear} had the same buying power as {fmt(result.adjustedAmount)} in {toYear}.
                Prices were {Math.abs(result.totalInflation).toFixed(1)}% lower in {toYear},
                so {fmt(amount)} went further back then.
              </>
            )}
          </p>
        </div>
      )}

      {/* Decade breakdown */}
      {decades.length > 1 && (
        <details className="mt-6" open>
          <summary className="cursor-pointer text-sm font-medium text-zinc-300 hover:text-zinc-100">
            Inflation by Decade
          </summary>
          <div className="mt-3 bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700 text-zinc-500">
                  <th className="text-left p-2.5">Period</th>
                  <th className="text-left p-2.5">Avg Rate</th>
                  <th className="text-left p-2.5 hidden sm:table-cell">Context</th>
                </tr>
              </thead>
              <tbody>
                {decades.map((d, i) => (
                  <tr key={i} className="border-b border-zinc-800">
                    <td className="p-2.5 text-zinc-300">{d.decade}</td>
                    <td className="p-2.5 text-zinc-100 font-medium">{d.rate}</td>
                    <td className="p-2.5 text-zinc-500 hidden sm:table-cell">{d.event}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      )}

      {/* Year-by-year table */}
      {result && result.yearSpan > 0 && result.yearSpan <= 50 && (
        <details className="mt-4">
          <summary className="cursor-pointer text-sm font-medium text-zinc-300 hover:text-zinc-100">
            Year-by-Year CPI Data
          </summary>
          <div className="mt-3 bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-zinc-800">
                <tr className="border-b border-zinc-700 text-zinc-500">
                  <th className="text-left p-2.5">Year</th>
                  <th className="text-right p-2.5">CPI</th>
                  <th className="text-right p-2.5">Annual Rate</th>
                  <th className="text-right p-2.5">{fmt(amount)} Equivalent</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const start = Math.min(fromYear, toYear);
                  const end = Math.max(fromYear, toYear);
                  const baseCpi = CPI[fromYear];
                  const rows = [];
                  for (let y = start; y <= end; y++) {
                    if (!CPI[y]) continue;
                    const annualRate = y > start && CPI[y - 1] ? ((CPI[y] / CPI[y - 1]) - 1) * 100 : 0;
                    const equiv = (CPI[y] / baseCpi) * amount;
                    rows.push(
                      <tr key={y} className="border-b border-zinc-800">
                        <td className="p-2.5 text-zinc-300">{y}</td>
                        <td className="text-right p-2.5 text-zinc-400">{CPI[y].toFixed(1)}</td>
                        <td className={`text-right p-2.5 ${annualRate > 0 ? "text-red-400" : annualRate < 0 ? "text-green-400" : "text-zinc-500"}`}>
                          {y > start ? pct(annualRate) : "-"}
                        </td>
                        <td className="text-right p-2.5 text-zinc-100">{fmt(equiv)}</td>
                      </tr>
                    );
                  }
                  return rows;
                })()}
              </tbody>
            </table>
          </div>
        </details>
      )}
    </ToolLayout>
  );
}

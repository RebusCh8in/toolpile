"use client";
import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmtC(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtK(n: number) {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + n.toFixed(0);
}

type Frequency = "monthly" | "quarterly" | "semi-annual" | "annual";
const freqLabel: Record<Frequency, string> = { monthly: "Monthly", quarterly: "Quarterly", "semi-annual": "Semi-Annual", annual: "Annual" };
const freqPerYear: Record<Frequency, number> = { monthly: 12, quarterly: 4, "semi-annual": 2, annual: 1 };

type YearRow = { year: number; balance: number; dividend: number; totalDividends: number; totalContributed: number; appreciation: number };

export default function Page() {
  const [investment, setInvestment] = useState(10000);
  const [dividendYield, setDividendYield] = useState(4);
  const [growthRate, setGrowthRate] = useState(5);
  const [years, setYears] = useState(10);
  const [reinvest, setReinvest] = useState(true);
  const [monthlyAdd, setMonthlyAdd] = useState(200);
  const [frequency, setFrequency] = useState<Frequency>("quarterly");

  // Ticker lookup
  const [ticker, setTicker] = useState("");
  const [tickerLoading, setTickerLoading] = useState(false);
  const [tickerError, setTickerError] = useState("");
  const [tickerInfo, setTickerInfo] = useState<{ name: string; price: number; yield: number | null } | null>(null);

  // Mode
  const [mode, setMode] = useState<"growth" | "goal">("growth");
  const [goalMonthlyIncome, setGoalMonthlyIncome] = useState(2000);

  // Tax
  const [showTax, setShowTax] = useState(false);
  const [taxRate, setTaxRate] = useState(15);
  const taxRates = [0, 15, 20, 22, 24, 32, 35, 37];

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- Ticker lookup ---
  const lookupTicker = useCallback(async () => {
    const t = ticker.trim().toUpperCase();
    if (!t) return;
    setTickerLoading(true);
    setTickerError("");
    setTickerInfo(null);

    try {
      const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(t)}?interval=1mo&range=1y&events=div`;
      const proxies = [
        `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
        `https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`,
      ];
      let data: any = null;
      for (const url of proxies) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 8000);
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeout);
          if (!res.ok) continue;
          data = await res.json();
          if (data?.chart?.result?.[0]) break;
        } catch { continue; }
      }
      if (!data) throw new Error("Ticker not found");
      const result = data?.chart?.result?.[0];
      if (!result) throw new Error("Ticker not found");

      const meta = result.meta;
      const price = meta.regularMarketPrice ?? 0;
      const name = meta.longName || meta.shortName || meta.symbol || t;

      // Calculate forward yield from most recent dividend × payment frequency
      let finalYield: number | null = null;
      const divEvents = result.events?.dividends;
      if (divEvents && price > 0) {
        const payments = Object.values(divEvents as Record<string, { amount: number; date: number }>).sort((a, b) => b.date - a.date);
        if (payments.length > 0) {
          const latestDiv = payments[0].amount;
          // Estimate frequency: if 4+ payments in a year = quarterly, 2 = semi-annual, 1 = annual, 12 = monthly
          const count = payments.length;
          const paymentsPerYear = count >= 10 ? 12 : count >= 3 ? 4 : count >= 2 ? 2 : 1;
          const forwardAnnual = latestDiv * paymentsPerYear;
          finalYield = (forwardAnnual / price) * 100;
        }
      }

      setTickerInfo({ name, price, yield: finalYield });
      if (finalYield != null && finalYield > 0) {
        setDividendYield(Math.round(finalYield * 100) / 100);
      } else {
        setTickerError("This stock doesn't pay dividends (or data unavailable).");
      }
    } catch {
      setTickerError("Ticker not found. Check the symbol and try again.");
    } finally {
      setTickerLoading(false);
    }
  }, [ticker]);

  // --- Growth calculations ---
  const result = useMemo(() => {
    const annualDividend = investment * (dividendYield / 100);
    const monthlyDividend = annualDividend / 12;
    const periods = freqPerYear[frequency];

    let balance = investment;
    let totalDividends = 0;
    let totalContributed = investment;
    let totalAppreciation = 0;
    const yearly: YearRow[] = [];

    for (let y = 1; y <= years; y++) {
      let yearDiv = 0;
      for (let p = 0; p < periods; p++) {
        // Add monthly contributions for this period
        const monthsInPeriod = 12 / periods;
        const periodAdd = monthlyAdd * monthsInPeriod;
        balance += periodAdd;
        totalContributed += periodAdd;

        // Dividend for this period
        const div = balance * (dividendYield / 100) / periods;
        yearDiv += div;
        totalDividends += div;
        if (reinvest) balance += div;

        // Price appreciation for this period
        const apprecRate = Math.pow(1 + growthRate / 100, 1 / periods) - 1;
        const appreciationAmt = balance * apprecRate;
        totalAppreciation += appreciationAmt;
        balance += appreciationAmt;
      }
      yearly.push({ year: y, balance, dividend: yearDiv, totalDividends, totalContributed, appreciation: totalAppreciation });
    }

    const finalDividend = balance * (dividendYield / 100);
    const finalMonthly = finalDividend / 12;

    return { annualDividend, monthlyDividend, balance, totalDividends, totalContributed, finalDividend, finalMonthly, yearly, totalAppreciation };
  }, [investment, dividendYield, growthRate, years, reinvest, monthlyAdd, frequency]);

  // --- Goal mode calculations ---
  const goalResult = useMemo(() => {
    const annualGoal = goalMonthlyIncome * 12;
    const yieldDec = dividendYield / 100;
    if (yieldDec <= 0) return { neededInvestment: 0, yearsToGoal: Infinity };
    const neededInvestment = annualGoal / yieldDec;

    // Simulate year by year until dividend income >= annualGoal
    const periods = freqPerYear[frequency];
    let balance = investment;
    let yearsToGoal = Infinity;
    for (let y = 1; y <= 100; y++) {
      for (let p = 0; p < periods; p++) {
        const monthsInPeriod = 12 / periods;
        balance += monthlyAdd * monthsInPeriod;
        const div = balance * (dividendYield / 100) / periods;
        if (reinvest) balance += div;
        const apprecRate = Math.pow(1 + growthRate / 100, 1 / periods) - 1;
        balance += balance * apprecRate;
      }
      const annualDiv = balance * yieldDec;
      if (annualDiv >= annualGoal) {
        yearsToGoal = y;
        break;
      }
    }
    return { neededInvestment, yearsToGoal };
  }, [goalMonthlyIncome, dividendYield, growthRate, investment, monthlyAdd, reinvest, frequency]);

  // --- Canvas chart ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || result.yearly.length === 0) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    const pad = { top: 20, right: 20, bottom: 40, left: 65 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    // Data
    const data = result.yearly.map(r => ({
      contributions: r.totalContributed,
      dividends: r.totalDividends,
      appreciation: r.appreciation,
    }));

    const maxVal = Math.max(...data.map(d => d.contributions + d.dividends + d.appreciation), 1);

    // Round up max to nice number
    const mag = Math.pow(10, Math.floor(Math.log10(maxVal)));
    const niceMax = Math.ceil(maxVal / mag) * mag;
    const gridLines = 5;

    // Clear
    ctx.fillStyle = "#18181b"; // zinc-900
    ctx.fillRect(0, 0, W, H);

    // Gridlines
    ctx.strokeStyle = "#3f3f46"; // zinc-700
    ctx.lineWidth = 0.5;
    ctx.fillStyle = "#a1a1aa"; // zinc-400
    ctx.font = "11px system-ui, sans-serif";
    ctx.textAlign = "right";
    for (let i = 0; i <= gridLines; i++) {
      const val = (niceMax / gridLines) * i;
      const y = pad.top + ch - (val / niceMax) * ch;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + cw, y);
      ctx.stroke();
      ctx.fillText(fmtK(val), pad.left - 8, y + 4);
    }

    const n = data.length;
    const barW = cw / n;

    // Helper to draw stacked area
    const xForI = (i: number) => pad.left + barW * i + barW / 2;
    const yForVal = (v: number) => pad.top + ch - (v / niceMax) * ch;

    // Stacked areas: contributions (bottom), dividends (middle), appreciation (top)
    const layers = [
      { key: "contributions" as const, color: "rgba(113,113,122,0.6)", border: "rgba(161,161,170,0.8)" },
      { key: "dividends" as const, color: "rgba(34,197,94,0.5)", border: "rgba(34,197,94,0.8)" },
      { key: "appreciation" as const, color: "rgba(59,130,246,0.5)", border: "rgba(59,130,246,0.8)" },
    ];

    // Build cumulative
    for (let li = layers.length - 1; li >= 0; li--) {
      const cumul = data.map(d => {
        let sum = 0;
        for (let j = 0; j <= li; j++) sum += d[layers[j].key];
        return sum;
      });

      const prevCumul = li > 0 ? data.map(d => {
        let sum = 0;
        for (let j = 0; j < li; j++) sum += d[layers[j].key];
        return sum;
      }) : data.map(() => 0);

      ctx.beginPath();
      ctx.moveTo(xForI(0), yForVal(prevCumul[0]));
      for (let i = 0; i < n; i++) ctx.lineTo(xForI(i), yForVal(cumul[i]));
      for (let i = n - 1; i >= 0; i--) ctx.lineTo(xForI(i), yForVal(prevCumul[i]));
      ctx.closePath();
      ctx.fillStyle = layers[li].color;
      ctx.fill();
      ctx.strokeStyle = layers[li].border;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // X-axis labels
    ctx.fillStyle = "#a1a1aa";
    ctx.textAlign = "center";
    ctx.font = "11px system-ui, sans-serif";
    const step = n <= 15 ? 1 : n <= 30 ? 2 : 5;
    for (let i = 0; i < n; i++) {
      if ((i + 1) % step === 0 || i === 0) {
        ctx.fillText(`Y${result.yearly[i].year}`, xForI(i), pad.top + ch + 20);
      }
    }

    // Legend
    const legendItems = [
      { label: "Contributions", color: "rgba(113,113,122,0.8)" },
      { label: "Dividends", color: "rgba(34,197,94,0.8)" },
      { label: "Appreciation", color: "rgba(59,130,246,0.8)" },
    ];
    ctx.font = "11px system-ui, sans-serif";
    let lx = pad.left;
    const ly = pad.top + ch + 32;
    for (const item of legendItems) {
      ctx.fillStyle = item.color;
      ctx.fillRect(lx, ly - 8, 10, 10);
      ctx.fillStyle = "#a1a1aa";
      ctx.textAlign = "left";
      ctx.fillText(item.label, lx + 14, ly);
      lx += ctx.measureText(item.label).width + 28;
    }
  }, [result]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";
  const selectCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500 appearance-none";

  const taxMultiplier = showTax ? (1 - taxRate / 100) : 1;

  return (
    <ToolLayout
      title="Dividend Calculator"
      description="Calculate dividend income, look up stock yields by ticker, project growth with DRIP reinvestment, visualize your dividend snowball, and plan toward income goals with tax-adjusted estimates."
      slug="dividend-calculator"
      category="Finance"
      keywords={["dividend calculator", "dividend income calculator", "dividend yield calculator", "dividend reinvestment calculator", "DRIP calculator", "dividend snowball", "dividend income goal", "stock dividend lookup"]}
      faqs={[
        { question: "What is dividend yield?", answer: "Dividend yield = Annual Dividend Per Share ÷ Stock Price × 100. A stock at $50 paying $2/year in dividends has a 4% yield. The S&P 500 average yield is about 1.3%." },
        { question: "Should I reinvest dividends?", answer: "For long-term growth, yes. Reinvesting dividends (DRIP) compounds your returns. $10,000 invested at 4% yield with 5% growth: after 20 years, reinvesting = $66K vs not reinvesting = $42K portfolio value." },
        { question: "How much do I need for $1,000/month in dividends?", answer: "At 4% yield: $300,000. At 3%: $400,000. At 5%: $240,000. Build toward this through regular investing and dividend reinvestment." },
        { question: "How does dividend frequency affect returns?", answer: "Stocks pay dividends monthly, quarterly, semi-annually, or annually. More frequent payments compound slightly faster when reinvested via DRIP. Most US stocks pay quarterly." },
        { question: "How are dividends taxed?", answer: "Qualified dividends are taxed at 0%, 15%, or 20% depending on income. Non-qualified (ordinary) dividends are taxed at your regular income tax rate. Use the tax toggle to estimate after-tax income." },
      ]}
      relatedTools={[
        { name: "Investment Calculator", href: "/tools/investment-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Stock Profit Calculator", href: "/tools/stock-profit-calculator" },
      ]}
    >
      {/* Mode toggle */}
      <div className="flex mb-6 bg-zinc-800 rounded-lg p-1 max-w-md">
        <button
          onClick={() => setMode("growth")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "growth" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          Calculate Growth
        </button>
        <button
          onClick={() => setMode("goal")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === "goal" ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
        >
          Reach Income Goal
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left column: Inputs */}
        <div className="space-y-4">
          {/* Ticker Lookup */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <label className={labelCls}>Stock Ticker Lookup <span className="text-zinc-600">(optional)</span></label>
            <div className="flex gap-2">
              <input
                type="text"
                value={ticker}
                onChange={e => setTicker(e.target.value.toUpperCase())}
                onKeyDown={e => { if (e.key === "Enter") lookupTicker(); }}
                placeholder="e.g. AAPL, KO, SCHD"
                className={inputCls}
              />
              <button
                onClick={lookupTicker}
                disabled={tickerLoading || !ticker.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              >
                {tickerLoading ? "Loading..." : "Look Up"}
              </button>
            </div>
            {tickerError && <p className="text-red-400 text-sm mt-2">{tickerError}</p>}
            {tickerInfo && (
              <div className="mt-3 text-sm space-y-1">
                <p className="text-zinc-200 font-medium">{tickerInfo.name}</p>
                <p className="text-zinc-400">Price: <span className="text-zinc-100">{fmtC(tickerInfo.price)}</span></p>
                {tickerInfo.yield != null ? (
                  <p className="text-zinc-400">Dividend Yield: <span className="text-green-400">{tickerInfo.yield.toFixed(2)}%</span> <span className="text-zinc-600">(auto-filled below)</span></p>
                ) : null}
              </div>
            )}
          </div>

          <div><label className={labelCls}>Initial Investment ($)</label><input type="number" value={investment} onChange={e => setInvestment(+e.target.value)} className={inputCls} min={0} step={1000} /></div>
          <div><label className={labelCls}>Dividend Yield (%)</label><input type="number" value={dividendYield} onChange={e => setDividendYield(+e.target.value)} className={inputCls} min={0} max={30} step={0.1} /></div>
          <div><label className={labelCls}>Annual Price Growth (%)</label><input type="number" value={growthRate} onChange={e => setGrowthRate(+e.target.value)} className={inputCls} min={-20} max={30} step={0.5} /></div>
          <div><label className={labelCls}>Monthly Contribution ($)</label><input type="number" value={monthlyAdd} onChange={e => setMonthlyAdd(+e.target.value)} className={inputCls} min={0} step={50} /></div>
          <div><label className={labelCls}>Years</label><input type="number" value={years} onChange={e => setYears(+e.target.value)} className={inputCls} min={1} max={50} /></div>

          {/* Dividend Frequency */}
          <div>
            <label className={labelCls}>Dividend Frequency</label>
            <select value={frequency} onChange={e => setFrequency(e.target.value as Frequency)} className={selectCls}>
              {(Object.keys(freqLabel) as Frequency[]).map(f => (
                <option key={f} value={f}>{freqLabel[f]}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={reinvest} onChange={e => setReinvest(e.target.checked)} className="accent-blue-500" />
            <span className="text-sm text-zinc-300">Reinvest dividends (DRIP)</span>
          </label>

          {/* Tax toggle */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4 space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={showTax} onChange={e => setShowTax(e.target.checked)} className="accent-blue-500" />
              <span className="text-sm text-zinc-300">Show after-tax income</span>
            </label>
            {showTax && (
              <div>
                <label className={labelCls}>Tax Rate</label>
                <select value={taxRate} onChange={e => setTaxRate(+e.target.value)} className={selectCls}>
                  {taxRates.map(r => (
                    <option key={r} value={r}>{r}%{r === 15 ? " (qualified default)" : ""}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Goal mode input */}
          {mode === "goal" && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
              <label className={labelCls}>Target Monthly Dividend Income ($)</label>
              <input type="number" value={goalMonthlyIncome} onChange={e => setGoalMonthlyIncome(+e.target.value)} className={inputCls} min={100} step={100} />
            </div>
          )}
        </div>

        {/* Right column: Results */}
        <div className="space-y-4">
          {mode === "growth" ? (
            <>
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
                <p className="text-sm text-zinc-400 mb-1">Portfolio Value in {years} Years</p>
                <p className="text-4xl font-bold text-blue-400">{fmtC(result.balance)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-xs text-green-300">Current Annual Dividends</p>
                  <p className="text-lg font-semibold text-green-400">{fmtC(result.annualDividend)}</p>
                  <p className="text-xs text-green-400/60">{fmtC(result.monthlyDividend)}/mo</p>
                  {showTax && (
                    <p className="text-xs text-yellow-400/80 mt-1">After tax: {fmtC(result.annualDividend * taxMultiplier)}/yr &middot; {fmtC(result.monthlyDividend * taxMultiplier)}/mo</p>
                  )}
                </div>
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-xs text-green-300">Future Annual Dividends</p>
                  <p className="text-lg font-semibold text-green-400">{fmtC(result.finalDividend)}</p>
                  <p className="text-xs text-green-400/60">{fmtC(result.finalMonthly)}/mo</p>
                  {showTax && (
                    <p className="text-xs text-yellow-400/80 mt-1">After tax: {fmtC(result.finalDividend * taxMultiplier)}/yr &middot; {fmtC(result.finalMonthly * taxMultiplier)}/mo</p>
                  )}
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Dividends Earned</p>
                  <p className="text-lg font-semibold text-yellow-400">{fmtC(result.totalDividends)}</p>
                  {showTax && <p className="text-xs text-yellow-400/60">After tax: {fmtC(result.totalDividends * taxMultiplier)}</p>}
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Total Contributed</p>
                  <p className="text-lg font-semibold text-zinc-100">{fmtC(result.totalContributed)}</p>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Goal mode results */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 text-center">
                <p className="text-sm text-blue-300 mb-1">Target: {fmtC(goalMonthlyIncome)}/month in Dividends</p>
                {showTax && <p className="text-xs text-yellow-400/80 mb-2">({fmtC(goalMonthlyIncome * taxMultiplier)}/mo after {taxRate}% tax)</p>}
                <p className="text-4xl font-bold text-blue-400">{fmtC(goalResult.neededInvestment)}</p>
                <p className="text-sm text-zinc-400 mt-1">Total investment needed at {dividendYield}% yield</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <p className="text-xs text-green-300">Years to Reach Goal</p>
                  <p className="text-2xl font-bold text-green-400">
                    {goalResult.yearsToGoal === Infinity ? "100+" : goalResult.yearsToGoal}
                  </p>
                  <p className="text-xs text-green-400/60">with current contributions + {reinvest ? "DRIP" : "no DRIP"}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Annual Income Goal</p>
                  <p className="text-lg font-semibold text-yellow-400">{fmtC(goalMonthlyIncome * 12)}</p>
                  {showTax && <p className="text-xs text-yellow-400/60">After tax: {fmtC(goalMonthlyIncome * 12 * taxMultiplier)}</p>}
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Current Portfolio</p>
                  <p className="text-lg font-semibold text-zinc-100">{fmtC(investment)}</p>
                </div>
                <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3">
                  <p className="text-xs text-zinc-500">Gap to Fill</p>
                  <p className="text-lg font-semibold text-red-400">{fmtC(Math.max(0, goalResult.neededInvestment - investment))}</p>
                </div>
              </div>

              {/* Still show projected growth summary */}
              <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
                <p className="text-sm text-zinc-400 mb-1">Portfolio Value in {years} Years (current plan)</p>
                <p className="text-2xl font-bold text-blue-400">{fmtC(result.balance)}</p>
                <p className="text-xs text-zinc-500 mt-1">Projected annual dividends at that point: <span className="text-green-400">{fmtC(result.finalDividend)}</span>/yr ({fmtC(result.finalMonthly)}/mo)</p>
              </div>
            </>
          )}

          {/* Canvas chart */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <p className="text-sm text-zinc-400 mb-3">Dividend Snowball Chart</p>
            <canvas
              ref={canvasRef}
              className="w-full rounded-lg"
              style={{ height: 240, background: "#18181b" }}
            />
          </div>

          {/* Year-by-year table */}
          {result.yearly.length <= 50 && (
            <details>
              <summary className="cursor-pointer text-sm text-zinc-400 hover:text-zinc-200">Year-by-Year Projection</summary>
              <div className="mt-3 bg-zinc-800/50 border border-zinc-700 rounded-lg overflow-auto max-h-72">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-zinc-800">
                    <tr className="border-b border-zinc-700 text-zinc-500">
                      <th className="text-left p-2">Year</th>
                      <th className="text-right p-2">Dividends</th>
                      {showTax && <th className="text-right p-2">After Tax</th>}
                      <th className="text-right p-2">Contributed</th>
                      <th className="text-right p-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearly.map(r => (
                      <tr key={r.year} className="border-b border-zinc-800">
                        <td className="p-2 text-zinc-300">{r.year}</td>
                        <td className="text-right p-2 text-green-400">{fmtC(r.dividend)}</td>
                        {showTax && <td className="text-right p-2 text-yellow-400">{fmtC(r.dividend * taxMultiplier)}</td>}
                        <td className="text-right p-2 text-zinc-400">{fmtC(r.totalContributed)}</td>
                        <td className="text-right p-2 text-zinc-100">{fmtC(r.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

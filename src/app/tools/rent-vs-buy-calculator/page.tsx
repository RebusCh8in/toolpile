"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

function fmt(n: number) { return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function fmtC(n: number) { return "$" + fmt(n); }
function fmtK(n: number) { return n >= 1000 ? "$" + (n / 1000).toFixed(0) + "k" : fmtC(n); }

export default function Page() {
  // Rent inputs
  const [monthlyRent, setMonthlyRent] = useState(1800);
  const [rentersInsurance, setRentersInsurance] = useState(15);
  const [annualRentIncrease, setAnnualRentIncrease] = useState(3);

  // Buy inputs
  const [homePrice, setHomePrice] = useState(350000);
  const [downPaymentPct, setDownPaymentPct] = useState(20);
  const [mortgageRate, setMortgageRate] = useState(6.5);
  const [loanTerm, setLoanTerm] = useState(30);
  const [propertyTaxRate, setPropertyTaxRate] = useState(1.2);
  const [homeInsurance, setHomeInsurance] = useState(1400);
  const [hoa, setHoa] = useState(0);
  const [maintenancePct, setMaintenancePct] = useState(1);
  const [closingCostsPct, setClosingCostsPct] = useState(3);

  // Shared
  const [investmentReturn, setInvestmentReturn] = useState(7);
  const [years, setYears] = useState(10);
  const [homeAppreciation, setHomeAppreciation] = useState(3);

  const result = useMemo(() => {
    if (homePrice <= 0 || years <= 0) return null;

    const downPayment = homePrice * (downPaymentPct / 100);
    const loanAmount = homePrice - downPayment;
    const closingCosts = homePrice * (closingCostsPct / 100);
    const monthlyMortgageRate = mortgageRate / 100 / 12;
    const totalPayments = loanTerm * 12;

    // Monthly mortgage P&I
    const monthlyPI = monthlyMortgageRate === 0
      ? loanAmount / totalPayments
      : (loanAmount * monthlyMortgageRate * Math.pow(1 + monthlyMortgageRate, totalPayments)) /
        (Math.pow(1 + monthlyMortgageRate, totalPayments) - 1);

    const monthlyInvestRate = investmentReturn / 100 / 12;

    // Year-by-year data
    const yearlyData: {
      year: number;
      rentCumulative: number;
      buyCumulative: number;
      equity: number;
      renterNetWorth: number;
      buyerNetWorth: number;
      monthlyRentCost: number;
      monthlyBuyCost: number;
    }[] = [];

    let rentCumulative = 0;
    let buyCumulative = closingCosts + downPayment;
    let mortgageBalance = loanAmount;
    let renterInvestments = 0; // renter invests the difference
    let currentRent = monthlyRent;
    let currentHomeValue = homePrice;
    let breakEvenYear: number | null = null;

    // Initial investment: renter invests the down payment + closing costs
    renterInvestments = downPayment + closingCosts;

    for (let y = 1; y <= years; y++) {
      const yearRent = currentRent;
      const yearPropertyTax = currentHomeValue * (propertyTaxRate / 100) / 12;
      const yearMaintenance = currentHomeValue * (maintenancePct / 100) / 12;
      const yearHomeInsurance = homeInsurance / 12;

      let yearRentTotal = 0;
      let yearBuyTotal = 0;

      for (let m = 0; m < 12; m++) {
        // Rent side
        const rentPayment = yearRent + rentersInsurance;
        yearRentTotal += rentPayment;
        rentCumulative += rentPayment;

        // Buy side
        const interestPayment = mortgageBalance * monthlyMortgageRate;
        const principalPayment = Math.min(monthlyPI - interestPayment, mortgageBalance);
        mortgageBalance = Math.max(0, mortgageBalance - principalPayment);

        const buyPayment = monthlyPI + yearPropertyTax + yearHomeInsurance + hoa + yearMaintenance;
        yearBuyTotal += buyPayment;
        buyCumulative += buyPayment;

        // Renter invests the monthly savings (if buying is more expensive)
        const monthlySavings = buyPayment - rentPayment;
        if (monthlySavings > 0) {
          renterInvestments = renterInvestments * (1 + monthlyInvestRate) + monthlySavings;
        } else {
          // If renting is more expensive, renter still gets investment returns but invests less
          renterInvestments = renterInvestments * (1 + monthlyInvestRate) + monthlySavings;
          // monthlySavings is negative here, so renter portfolio shrinks by the extra rent cost
        }
      }

      // Home appreciation
      currentHomeValue *= (1 + homeAppreciation / 100);
      // Rent increase for next year
      currentRent *= (1 + annualRentIncrease / 100);

      const equity = currentHomeValue - mortgageBalance;
      const renterNetWorth = Math.max(0, renterInvestments);
      const buyerNetWorth = equity;

      yearlyData.push({
        year: y,
        rentCumulative,
        buyCumulative,
        equity,
        renterNetWorth,
        buyerNetWorth,
        monthlyRentCost: yearRent + rentersInsurance,
        monthlyBuyCost: monthlyPI + yearPropertyTax + yearHomeInsurance + hoa + yearMaintenance,
      });

      // Break-even: when buyer net worth exceeds renter net worth
      if (breakEvenYear === null && buyerNetWorth >= renterNetWorth) {
        breakEvenYear = y;
      }
    }

    const finalYear = yearlyData[yearlyData.length - 1];

    return {
      yearlyData,
      breakEvenYear,
      downPayment,
      loanAmount,
      closingCosts,
      monthlyPI,
      initialMonthlyBuy: monthlyPI + (homePrice * propertyTaxRate / 100 / 12) + (homeInsurance / 12) + hoa + (homePrice * maintenancePct / 100 / 12),
      initialMonthlyRent: monthlyRent + rentersInsurance,
      finalRenterNetWorth: finalYear.renterNetWorth,
      finalBuyerNetWorth: finalYear.buyerNetWorth,
      finalEquity: finalYear.equity,
      totalRentPaid: finalYear.rentCumulative,
      totalBuyPaid: finalYear.buyCumulative,
    };
  }, [monthlyRent, rentersInsurance, annualRentIncrease, homePrice, downPaymentPct, mortgageRate, loanTerm, propertyTaxRate, homeInsurance, hoa, maintenancePct, closingCostsPct, investmentReturn, years, homeAppreciation]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
  const labelCls = "block text-sm text-zinc-400 mb-1";

  // SVG Chart
  const renderChart = () => {
    if (!result) return null;
    const { yearlyData } = result;
    const W = 700, H = 320, pad = { t: 30, r: 30, b: 40, l: 65 };
    const cw = W - pad.l - pad.r;
    const ch = H - pad.t - pad.b;

    const maxVal = Math.max(
      ...yearlyData.map(d => Math.max(d.renterNetWorth, d.buyerNetWorth))
    );
    const yMax = maxVal * 1.1 || 100000;

    const xScale = (y: number) => pad.l + ((y - 1) / Math.max(yearlyData.length - 1, 1)) * cw;
    const yScale = (v: number) => pad.t + ch - (v / yMax) * ch;

    const renterPoints = yearlyData.map(d => `${xScale(d.year)},${yScale(d.renterNetWorth)}`).join(" ");
    const buyerPoints = yearlyData.map(d => `${xScale(d.year)},${yScale(d.buyerNetWorth)}`).join(" ");

    // Y-axis ticks
    const yTicks = 5;
    const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => (yMax / yTicks) * i);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* Grid lines */}
        {yTickVals.map((v, i) => (
          <g key={i}>
            <line x1={pad.l} y1={yScale(v)} x2={W - pad.r} y2={yScale(v)} stroke="#3f3f46" strokeWidth="1" strokeDasharray="4,4" />
            <text x={pad.l - 8} y={yScale(v) + 4} textAnchor="end" fill="#71717a" fontSize="11">{fmtK(v)}</text>
          </g>
        ))}

        {/* X-axis labels */}
        {yearlyData.filter((_, i) => yearlyData.length <= 15 || i % Math.ceil(yearlyData.length / 10) === 0 || i === yearlyData.length - 1).map(d => (
          <text key={d.year} x={xScale(d.year)} y={H - pad.b + 20} textAnchor="middle" fill="#71717a" fontSize="11">Yr {d.year}</text>
        ))}

        {/* Break-even line */}
        {result.breakEvenYear && (
          <g>
            <line x1={xScale(result.breakEvenYear)} y1={pad.t} x2={xScale(result.breakEvenYear)} y2={H - pad.b} stroke="#facc15" strokeWidth="1.5" strokeDasharray="6,4" />
            <text x={xScale(result.breakEvenYear)} y={pad.t - 8} textAnchor="middle" fill="#facc15" fontSize="10" fontWeight="bold">Break-even</text>
          </g>
        )}

        {/* Lines */}
        <polyline fill="none" stroke="#f97316" strokeWidth="2.5" points={renterPoints} strokeLinejoin="round" />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points={buyerPoints} strokeLinejoin="round" />

        {/* Dots on endpoints */}
        {yearlyData.length > 0 && (
          <>
            <circle cx={xScale(yearlyData[yearlyData.length - 1].year)} cy={yScale(yearlyData[yearlyData.length - 1].renterNetWorth)} r="4" fill="#f97316" />
            <circle cx={xScale(yearlyData[yearlyData.length - 1].year)} cy={yScale(yearlyData[yearlyData.length - 1].buyerNetWorth)} r="4" fill="#3b82f6" />
          </>
        )}

        {/* Legend */}
        <g transform={`translate(${pad.l + 10}, ${pad.t + 10})`}>
          <rect x="0" y="0" width="12" height="3" rx="1" fill="#f97316" />
          <text x="18" y="6" fill="#a1a1aa" fontSize="11">Renter Net Worth</text>
          <rect x="0" y="16" width="12" height="3" rx="1" fill="#3b82f6" />
          <text x="18" y="22" fill="#a1a1aa" fontSize="11">Buyer Net Worth</text>
        </g>
      </svg>
    );
  };

  // Cumulative cost chart
  const renderCostChart = () => {
    if (!result) return null;
    const { yearlyData } = result;
    const W = 700, H = 280, pad = { t: 30, r: 30, b: 40, l: 65 };
    const cw = W - pad.l - pad.r;
    const ch = H - pad.t - pad.b;

    const maxVal = Math.max(...yearlyData.map(d => Math.max(d.rentCumulative, d.buyCumulative)));
    const yMax = maxVal * 1.1 || 100000;

    const xScale = (y: number) => pad.l + ((y - 1) / Math.max(yearlyData.length - 1, 1)) * cw;
    const yScale = (v: number) => pad.t + ch - (v / yMax) * ch;

    const rentPoints = yearlyData.map(d => `${xScale(d.year)},${yScale(d.rentCumulative)}`).join(" ");
    const buyPoints = yearlyData.map(d => `${xScale(d.year)},${yScale(d.buyCumulative)}`).join(" ");

    const yTicks = 5;
    const yTickVals = Array.from({ length: yTicks + 1 }, (_, i) => (yMax / yTicks) * i);

    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {yTickVals.map((v, i) => (
          <g key={i}>
            <line x1={pad.l} y1={yScale(v)} x2={W - pad.r} y2={yScale(v)} stroke="#3f3f46" strokeWidth="1" strokeDasharray="4,4" />
            <text x={pad.l - 8} y={yScale(v) + 4} textAnchor="end" fill="#71717a" fontSize="11">{fmtK(v)}</text>
          </g>
        ))}
        {yearlyData.filter((_, i) => yearlyData.length <= 15 || i % Math.ceil(yearlyData.length / 10) === 0 || i === yearlyData.length - 1).map(d => (
          <text key={d.year} x={xScale(d.year)} y={H - pad.b + 20} textAnchor="middle" fill="#71717a" fontSize="11">Yr {d.year}</text>
        ))}
        <polyline fill="none" stroke="#f97316" strokeWidth="2.5" points={rentPoints} strokeLinejoin="round" />
        <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" points={buyPoints} strokeLinejoin="round" />
        {yearlyData.length > 0 && (
          <>
            <circle cx={xScale(yearlyData[yearlyData.length - 1].year)} cy={yScale(yearlyData[yearlyData.length - 1].rentCumulative)} r="4" fill="#f97316" />
            <circle cx={xScale(yearlyData[yearlyData.length - 1].year)} cy={yScale(yearlyData[yearlyData.length - 1].buyCumulative)} r="4" fill="#3b82f6" />
          </>
        )}
        <g transform={`translate(${pad.l + 10}, ${pad.t + 10})`}>
          <rect x="0" y="0" width="12" height="3" rx="1" fill="#f97316" />
          <text x="18" y="6" fill="#a1a1aa" fontSize="11">Total Rent Paid</text>
          <rect x="0" y="16" width="12" height="3" rx="1" fill="#3b82f6" />
          <text x="18" y="22" fill="#a1a1aa" fontSize="11">Total Buy Cost</text>
        </g>
      </svg>
    );
  };

  return (
    <ToolLayout
      title="Rent vs Buy Calculator"
      description="Compare the true cost of renting versus buying a home. See break-even points, equity buildup, net worth projections, and cumulative costs over time with interactive charts."
      slug="rent-vs-buy-calculator"
      category="Finance"
      keywords={["rent vs buy calculator", "rent or buy calculator", "should I rent or buy", "home buying calculator", "renting vs buying comparison", "break even calculator housing"]}
      faqs={[
        { question: "How does the rent vs buy calculator work?", answer: "The calculator compares the total financial outcome of renting versus buying over a specified number of years. For renting, it accounts for monthly rent, renter's insurance, annual rent increases, and the returns you'd earn by investing the money you'd otherwise spend on a down payment and the monthly savings difference. For buying, it factors in mortgage payments, property taxes, insurance, HOA fees, maintenance, closing costs, home appreciation, and equity buildup." },
        { question: "What is the break-even year?", answer: "The break-even year is the point at which the buyer's net worth (home equity) surpasses the renter's net worth (investment portfolio). Before this year, renting and investing the difference would leave you financially better off. After this year, the homeowner comes out ahead. Many analyses find the break-even point is typically between 5 and 10 years, depending on local market conditions." },
        { question: "Why does the calculator include investment returns for renters?", answer: "This captures opportunity cost. When you buy a home, your down payment, closing costs, and any extra monthly housing expenses are tied up in the property. A renter can invest that same money in the stock market or other assets. The calculator models this so you can see a fair apples-to-apples net worth comparison between the two scenarios." },
        { question: "What assumptions should I adjust for my local market?", answer: "The most impactful assumptions are home appreciation rate, property tax rate, and annual rent increase. These vary dramatically by location. For example, property tax rates range from under 0.5% in Hawaii to over 2% in New Jersey and Illinois. Home appreciation has historically averaged about 3-4% nationally but can be much higher or lower in specific markets. Check your local data for the most accurate comparison." },
        { question: "Does this calculator account for tax benefits of homeownership?", answer: "This calculator focuses on direct costs and wealth accumulation without modeling tax deductions (such as mortgage interest deduction or property tax deduction) because most homeowners now take the standard deduction after the 2017 tax reform. For a more precise analysis, consult a tax advisor about whether you'd itemize deductions as a homeowner." },
        { question: "How accurate is this rent vs buy comparison?", answer: "The calculator provides a strong directional estimate using standard financial formulas. Real-world results depend on many factors not modeled here, including home maintenance surprises, local market shifts, changes in interest rates if you refinance, job relocations, and lifestyle preferences. Use it as a starting framework for your decision, not a guarantee of outcomes." },
      ]}
      relatedTools={[
        { name: "Mortgage Calculator", href: "/tools/mortgage-calculator" },
        { name: "Compound Interest Calculator", href: "/tools/compound-interest-calculator" },
        { name: "Loan Calculator", href: "/tools/loan-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
      ]}
      guide={
        <div className="space-y-4 text-zinc-300 text-sm leading-relaxed">
          <h2 className="text-xl font-semibold text-zinc-100">How to Use the Rent vs Buy Calculator</h2>
          <p>
            Deciding whether to rent or buy is one of the most significant financial choices you can make. This calculator helps you compare both paths side-by-side by modeling real costs, investment growth, and home equity over time.
          </p>
          <h3 className="text-lg font-semibold text-zinc-200">Step 1: Enter Your Rental Costs</h3>
          <p>
            Start with your current monthly rent, renter&apos;s insurance premium, and the annual percentage you expect rent to increase (typically 2-5% per year in most U.S. markets).
          </p>
          <h3 className="text-lg font-semibold text-zinc-200">Step 2: Enter Home Purchase Details</h3>
          <p>
            Input the home price, your down payment percentage, expected mortgage interest rate, and loan term. Add property tax rate, annual homeowner&apos;s insurance, HOA dues, estimated maintenance costs (typically 1% of home value per year), and closing costs.
          </p>
          <h3 className="text-lg font-semibold text-zinc-200">Step 3: Set Assumptions</h3>
          <p>
            Choose your analysis period (how many years to compare), the expected annual return on investments (for the renter&apos;s opportunity cost calculation), and expected home appreciation rate. The S&amp;P 500 has historically returned about 7% after inflation.
          </p>
          <h3 className="text-lg font-semibold text-zinc-200">Step 4: Review Results</h3>
          <p>
            The calculator shows monthly cost comparisons, net worth projections for both scenarios, cumulative costs, equity buildup, and the break-even year when buying becomes financially advantageous.
          </p>
        </div>
      }
    >
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Rent Inputs */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider">Rent Inputs</h3>
          <div>
            <label className={labelCls}>Monthly Rent ($)</label>
            <input type="number" value={monthlyRent} onChange={e => setMonthlyRent(+e.target.value)} className={inputCls} min={0} step={50} />
          </div>
          <div>
            <label className={labelCls}>Renter&apos;s Insurance ($/mo)</label>
            <input type="number" value={rentersInsurance} onChange={e => setRentersInsurance(+e.target.value)} className={inputCls} min={0} step={5} />
          </div>
          <div>
            <label className={labelCls}>Annual Rent Increase (%)</label>
            <input type="number" value={annualRentIncrease} onChange={e => setAnnualRentIncrease(+e.target.value)} className={inputCls} min={0} max={20} step={0.5} />
          </div>
        </div>

        {/* Buy Inputs */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Buy Inputs</h3>
          <div>
            <label className={labelCls}>Home Price ($)</label>
            <input type="number" value={homePrice} onChange={e => setHomePrice(+e.target.value)} className={inputCls} min={0} step={5000} />
          </div>
          <div>
            <label className={labelCls}>Down Payment (%)</label>
            <input type="number" value={downPaymentPct} onChange={e => setDownPaymentPct(+e.target.value)} className={inputCls} min={0} max={100} step={1} />
            <p className="text-xs text-zinc-500 mt-1">{fmtC(homePrice * downPaymentPct / 100)}</p>
          </div>
          <div>
            <label className={labelCls}>Mortgage Rate (%)</label>
            <input type="number" value={mortgageRate} onChange={e => setMortgageRate(+e.target.value)} className={inputCls} min={0} max={30} step={0.125} />
          </div>
          <div>
            <label className={labelCls}>Loan Term (years)</label>
            <div className="flex gap-2">
              {[15, 20, 30].map(y => (
                <button key={y} onClick={() => setLoanTerm(y)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${loanTerm === y ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"}`}>{y} yr</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Property Tax Rate (%/yr)</label>
            <input type="number" value={propertyTaxRate} onChange={e => setPropertyTaxRate(+e.target.value)} className={inputCls} min={0} max={10} step={0.1} />
          </div>
          <div>
            <label className={labelCls}>Homeowner&apos;s Insurance ($/yr)</label>
            <input type="number" value={homeInsurance} onChange={e => setHomeInsurance(+e.target.value)} className={inputCls} min={0} step={100} />
          </div>
          <div>
            <label className={labelCls}>HOA ($/mo)</label>
            <input type="number" value={hoa} onChange={e => setHoa(+e.target.value)} className={inputCls} min={0} step={25} />
          </div>
          <div>
            <label className={labelCls}>Maintenance (%/yr of home value)</label>
            <input type="number" value={maintenancePct} onChange={e => setMaintenancePct(+e.target.value)} className={inputCls} min={0} max={10} step={0.25} />
          </div>
          <div>
            <label className={labelCls}>Closing Costs (% of price)</label>
            <input type="number" value={closingCostsPct} onChange={e => setClosingCostsPct(+e.target.value)} className={inputCls} min={0} max={10} step={0.5} />
            <p className="text-xs text-zinc-500 mt-1">{fmtC(homePrice * closingCostsPct / 100)}</p>
          </div>
        </div>

        {/* Assumptions */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-green-400 uppercase tracking-wider">Assumptions</h3>
          <div>
            <label className={labelCls}>Analysis Period (years)</label>
            <input type="number" value={years} onChange={e => setYears(Math.max(1, Math.min(40, +e.target.value)))} className={inputCls} min={1} max={40} step={1} />
          </div>
          <div>
            <label className={labelCls}>Investment Return (%/yr)</label>
            <input type="number" value={investmentReturn} onChange={e => setInvestmentReturn(+e.target.value)} className={inputCls} min={0} max={30} step={0.5} />
            <p className="text-xs text-zinc-500 mt-1">Return on renter&apos;s invested savings</p>
          </div>
          <div>
            <label className={labelCls}>Home Appreciation (%/yr)</label>
            <input type="number" value={homeAppreciation} onChange={e => setHomeAppreciation(+e.target.value)} className={inputCls} min={-10} max={20} step={0.5} />
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-8 space-y-6">
          {/* Summary Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Monthly Rent (Now)</p>
              <p className="text-2xl font-bold text-orange-400 mt-1">{fmtC(result.initialMonthlyRent)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Monthly Buy Cost (Now)</p>
              <p className="text-2xl font-bold text-blue-400 mt-1">{fmtC(result.initialMonthlyBuy)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Break-Even Year</p>
              <p className="text-2xl font-bold text-yellow-400 mt-1">{result.breakEvenYear ? `Year ${result.breakEvenYear}` : `After ${years}+ yrs`}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide">Verdict at Year {years}</p>
              <p className={`text-2xl font-bold mt-1 ${result.finalBuyerNetWorth >= result.finalRenterNetWorth ? "text-blue-400" : "text-orange-400"}`}>
                {result.finalBuyerNetWorth >= result.finalRenterNetWorth ? "Buy Wins" : "Rent Wins"}
              </p>
            </div>
          </div>

          {/* Net Worth Comparison */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Renter Net Worth at Year {years}</p>
              <p className="text-3xl font-bold text-orange-400">{fmtC(result.finalRenterNetWorth)}</p>
              <p className="text-xs text-zinc-500 mt-1">Investment portfolio from saved down payment + monthly savings</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
              <p className="text-xs text-zinc-500 uppercase tracking-wide mb-1">Buyer Net Worth at Year {years}</p>
              <p className="text-3xl font-bold text-blue-400">{fmtC(result.finalBuyerNetWorth)}</p>
              <p className="text-xs text-zinc-500 mt-1">Home equity (appreciated value minus remaining mortgage)</p>
            </div>
          </div>

          {/* Advantage amount */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <p className="text-sm text-zinc-400">
              {result.finalBuyerNetWorth >= result.finalRenterNetWorth
                ? `Buying puts you ahead by ${fmtC(result.finalBuyerNetWorth - result.finalRenterNetWorth)} after ${years} years.`
                : `Renting and investing puts you ahead by ${fmtC(result.finalRenterNetWorth - result.finalBuyerNetWorth)} after ${years} years.`}
            </p>
          </div>

          {/* Equity & Costs */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <p className="text-xs text-zinc-500">Home Equity at Year {years}</p>
              <p className="text-lg font-semibold text-zinc-100">{fmtC(result.finalEquity)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <p className="text-xs text-zinc-500">Total Rent Paid</p>
              <p className="text-lg font-semibold text-orange-300">{fmtC(result.totalRentPaid)}</p>
            </div>
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <p className="text-xs text-zinc-500">Total Buy Cost (incl. down + closing)</p>
              <p className="text-lg font-semibold text-blue-300">{fmtC(result.totalBuyPaid)}</p>
            </div>
          </div>

          {/* Net Worth Chart */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Net Worth Comparison Over Time</h3>
            {renderChart()}
          </div>

          {/* Cumulative Cost Chart */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-300 mb-4">Cumulative Housing Costs</h3>
            {renderCostChart()}
          </div>

          {/* Year-by-Year Table */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-700">
              <h3 className="text-sm font-semibold text-zinc-300">Year-by-Year Breakdown</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-zinc-800">
                  <tr className="text-zinc-400 text-left text-xs">
                    <th className="px-4 py-2">Year</th>
                    <th className="px-4 py-2">Monthly Rent</th>
                    <th className="px-4 py-2">Monthly Buy</th>
                    <th className="px-4 py-2">Renter Net Worth</th>
                    <th className="px-4 py-2">Buyer Equity</th>
                    <th className="px-4 py-2">Advantage</th>
                  </tr>
                </thead>
                <tbody>
                  {result.yearlyData.map(row => {
                    const diff = row.buyerNetWorth - row.renterNetWorth;
                    return (
                      <tr key={row.year} className="border-t border-zinc-800 text-zinc-300">
                        <td className="px-4 py-2">{row.year}</td>
                        <td className="px-4 py-2">{fmtC(row.monthlyRentCost)}</td>
                        <td className="px-4 py-2">{fmtC(row.monthlyBuyCost)}</td>
                        <td className="px-4 py-2 text-orange-300">{fmtC(row.renterNetWorth)}</td>
                        <td className="px-4 py-2 text-blue-300">{fmtC(row.buyerNetWorth)}</td>
                        <td className={`px-4 py-2 font-medium ${diff >= 0 ? "text-blue-400" : "text-orange-400"}`}>
                          {diff >= 0 ? "Buy +" : "Rent +"}{fmtC(Math.abs(diff))}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </ToolLayout>
  );
}
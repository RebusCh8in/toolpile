"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ── Platform data ── */
interface Platform {
  name: string;
  color: string;
  avgCpm: number;
  defaultCtr: number;
  defaultConvRate: number;
  minSpend: number | null;
  selfServe: boolean;
  formats: string;
  targeting: string;
  measurement: string;
}

const platforms: Record<string, Platform> = {
  chatgpt: { name: "ChatGPT", color: "#10a37f", avgCpm: 60, defaultCtr: 3.5, defaultConvRate: 5.0, minSpend: 200000, selfServe: false, formats: "Text links, product/shopping cards (with logo + image)", targeting: "Contextual (conversation-based)", measurement: "Aggregated only (views, clicks)" },
  google_search: { name: "Google Search", color: "#4285f4", avgCpm: 38, defaultCtr: 3.2, defaultConvRate: 4.2, minSpend: null, selfServe: true, formats: "Text, Shopping, Performance Max", targeting: "Keyword intent + audience", measurement: "Full attribution + GA4" },
  google_display: { name: "Google Display", color: "#34a853", avgCpm: 5, defaultCtr: 0.5, defaultConvRate: 0.8, minSpend: null, selfServe: true, formats: "Image, video, text, responsive", targeting: "Behavioral, contextual, demographic", measurement: "Full attribution + GA4" },
  meta: { name: "Meta (FB/IG)", color: "#1877f2", avgCpm: 15, defaultCtr: 1.3, defaultConvRate: 2.5, minSpend: null, selfServe: true, formats: "Image, video, carousel, stories, reels", targeting: "Interest, behavioral, lookalike, demographic", measurement: "Full attribution + CAPI" },
  tiktok: { name: "TikTok", color: "#000000", avgCpm: 8, defaultCtr: 0.9, defaultConvRate: 1.5, minSpend: 500, selfServe: true, formats: "Video, image, spark ads", targeting: "Interest, behavioral, demographic", measurement: "Full attribution + pixel" },
};

function fmt(n: number) { return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
function fmtK(n: number) { return n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toString(); }

export default function Page() {
  const [budget, setBudget] = useState(200000);
  const [avgOrderValue, setAvgOrderValue] = useState(75);
  const [compareTo, setCompareTo] = useState<string[]>(["google_search", "meta"]);
  const [overrides, setOverrides] = useState<Record<string, { ctr: number; convRate: number }>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const toggleCompare = (key: string) => {
    setCompareTo(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const getCtr = (key: string) => overrides[key]?.ctr ?? platforms[key].defaultCtr;
  const getConvRate = (key: string) => overrides[key]?.convRate ?? platforms[key].defaultConvRate;
  const setOverride = (key: string, field: "ctr" | "convRate", value: number) => {
    setOverrides(prev => {
      const existing = prev[key] ?? { ctr: platforms[key].defaultCtr, convRate: platforms[key].defaultConvRate };
      return { ...prev, [key]: { ...existing, [field]: value } };
    });
  };

  const results = useMemo(() => {
    const allPlatforms = ["chatgpt", ...compareTo];
    return allPlatforms.map(key => {
      const p = platforms[key];
      const ctr = getCtr(key);
      const convRate = getConvRate(key);
      const impressions = (budget / p.avgCpm) * 1000;
      const clicks = impressions * (ctr / 100);
      const conversions = clicks * (convRate / 100);
      const revenue = conversions * avgOrderValue;
      const roas = budget > 0 ? revenue / budget : 0;
      const costPerClick = clicks > 0 ? budget / clicks : 0;
      const costPerConversion = conversions > 0 ? budget / conversions : 0;
      return { key, platform: p, impressions, clicks, conversions, revenue, roas, costPerClick, costPerConversion, ctr, convRate };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget, avgOrderValue, compareTo, overrides]);

  /* ── Bar chart ── */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || results.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w = 600;
    const h = 300;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    const metrics = [
      { label: "Impressions", key: "impressions" as const },
      { label: "Clicks", key: "clicks" as const },
      { label: "Conversions", key: "conversions" as const },
    ];

    const groupWidth = w / metrics.length;
    const barWidth = Math.min(40, (groupWidth - 40) / results.length);
    const padding = 50;

    metrics.forEach((metric, gi) => {
      const maxVal = Math.max(...results.map(r => r[metric.key]));
      const groupX = gi * groupWidth;

      // label
      ctx.fillStyle = "#a1a19b";
      ctx.font = "12px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(metric.label, groupX + groupWidth / 2, h - 5);

      results.forEach((r, bi) => {
        const barH = maxVal > 0 ? ((r[metric.key] / maxVal) * (h - padding - 30)) : 0;
        const x = groupX + (groupWidth - results.length * barWidth) / 2 + bi * barWidth;
        const y = h - 25 - barH;

        ctx.fillStyle = r.platform.color;
        ctx.beginPath();
        ctx.roundRect(x + 1, y, barWidth - 2, barH, [3, 3, 0, 0]);
        ctx.fill();

        // value on top
        ctx.fillStyle = "#faf7f2";
        ctx.font = "bold 10px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(fmtK(r[metric.key]), x + barWidth / 2, y - 5);
      });
    });
  }, [results]);

  const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-100 focus:outline-none focus:border-blue-500 text-base";
  const labelCls = "block text-base text-zinc-200 mb-1.5 font-medium";

  return (
    <ToolLayout
      title="ChatGPT Ads Calculator"
      description="Estimate your ChatGPT ad performance and compare ROI against Google, Meta, and TikTok. See impressions, clicks, conversions, and ROAS side-by-side."
      slug="chatgpt-ads-calculator"
      category="Marketing"
      keywords={[
        "ChatGPT ads calculator",
        "ChatGPT ads ROI calculator",
        "ChatGPT ads cost calculator",
        "ChatGPT ads CPM",
        "ChatGPT vs Google ads",
        "ChatGPT vs Meta ads",
        "ChatGPT ad specs",
        "ChatGPT advertising cost",
        "OpenAI ads pricing",
        "ChatGPT ads comparison",
        "ChatGPT ads budget calculator",
      ]}
      faqs={[
        { question: "How much do ChatGPT ads cost?", answer: "ChatGPT ads currently cost approximately $60 CPM (cost per 1,000 impressions) with a minimum commitment of $200,000-$250,000 for the beta program. This makes ChatGPT roughly 3x more expensive than Meta ads ($15 CPM average) and 12x more expensive than Google Display ($5 CPM average). Pricing is expected to evolve as OpenAI introduces self-serve options, likely in Q4 2026." },
        { question: "What do ChatGPT ads look like?", answer: "ChatGPT ads come in two main formats: (1) Sponsored text links with a headline, description, and destination URL that appear below AI responses with a 'Sponsored' label and brand favicon, and (2) Product/shopping cards that display brand logos, product images, pricing, stock status, and action buttons in a scrollable horizontal layout. Video ads are not yet supported but are expected later in 2026." },
        { question: "Who can advertise on ChatGPT?", answer: "Currently, ChatGPT advertising is enterprise-only with direct onboarding by OpenAI. There is no self-serve platform yet. A self-serve option is expected by Q4 2026. Interested advertisers can register at openai.com/advertisers. The minimum spend is approximately $200,000-$250,000." },
        { question: "Who sees ChatGPT ads?", answer: "Ads are shown only to U.S. logged-in adults on the Free tier and Go tier ($8/month). Users on Plus ($20/month), Pro ($200/month), Team, Business, Enterprise, and Education plans do not see ads. This limits the ad audience to free and low-tier users." },
        { question: "How does ChatGPT ad targeting work?", answer: "ChatGPT uses contextual targeting only, based on the real-time conversation. There is no keyword bidding (like Google), no interest targeting (like Meta), and no demographic targeting. Advertisers never receive access to individual conversations, chat history, or personal data. Only aggregated performance metrics (total views and clicks) are provided." },
        { question: "What brands are advertising on ChatGPT?", answer: "Early advertisers include Target, Ford, Mazda, Adobe, Qualcomm, Expedia, HelloFresh, Williams-Sonoma, Audible, Mrs. Meyer's, and Audemars Piguet. Retail and grocery brands account for about 44% of early ChatGPT advertisers." },
        { question: "How do ChatGPT ads compare to Google and Meta?", answer: "ChatGPT ads are significantly more expensive per impression ($60 CPM vs $5-38 for Google, $15 for Meta) but offer a unique contextual targeting model. The key tradeoff: ChatGPT ads reach users during high-intent conversational moments, but with limited measurement, fewer format options (text links and product cards vs full image/video/carousel), and no self-serve access. Google and Meta offer full attribution, multiple formats, and no minimum spend." },
        { question: "Are ChatGPT ads worth the cost?", answer: "It depends on your goals. ChatGPT ads reach users during high-intent moments (actively asking questions about products/services), which could mean higher conversion rates. However, the $60 CPM and $200K minimum make it viable only for brands with significant budgets. Use this calculator to compare estimated ROAS across platforms with your specific conversion metrics." },
      ]}
      relatedTools={[
        { name: "ROI Calculator", href: "/tools/roi-calculator" },
        { name: "Profit Margin Calculator", href: "/tools/profit-margin-calculator" },
        { name: "Budget Calculator", href: "/tools/budget-calculator" },
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
      ]}
      guide={<>
        <h2>ChatGPT Ads: What Marketers Need to Know</h2>

        <h3>The New Ad Platform</h3>
        <p>OpenAI launched advertising in ChatGPT in February 2026, creating an entirely new channel for brands. Unlike search ads (keyword-intent) or social ads (interest-based), ChatGPT ads are contextually targeted based on the real-time conversation a user is having with the AI.</p>

        <h3>Current Formats (2026)</h3>
        <p>ChatGPT ads come in two formats:</p>
        <ul>
          <li><strong>Sponsored text links:</strong> Headline (~60 chars) + description (~180 chars) + destination URL, labeled &ldquo;Sponsored&rdquo; with brand favicon. Appear below AI responses.</li>
          <li><strong>Product/shopping cards:</strong> Scrollable horizontal cards with brand logo, product image, name, price, stock status, and action buttons (e.g., install, buy). Used for e-commerce and app promotion.</li>
        </ul>
        <p>Video ads are not yet supported but are expected later in 2026. OpenAI recommends natural language copy that flows with the conversation rather than traditional ad copy.</p>

        <h3>Pricing</h3>
        <p>ChatGPT ads run at approximately $60 CPM with a minimum commitment of $200,000-$250,000. This is premium pricing: roughly 3x Meta, 1.5x Google Search, and 12x Google Display. The high price reflects the novelty of the platform and the high-intent nature of conversational queries.</p>

        <h3>Who Sees Ads</h3>
        <p>Ads are shown only to U.S. adults logged into the Free or Go ($8/month) tiers. Paid users on Plus, Pro, Team, Business, Enterprise, and Education plans see no ads. This means the ad audience is limited to free-tier users, which skews toward a broader, less business-oriented demographic.</p>

        <h3>Key Differences from Other Platforms</h3>
        <ul>
          <li><strong>Targeting:</strong> Contextual only, based on the conversation. No keyword bidding, no demographic targeting, no behavioral data.</li>
          <li><strong>Measurement:</strong> Aggregated metrics only (total views, clicks). No individual-level attribution, no conversion tracking pixel, no retargeting.</li>
          <li><strong>Privacy:</strong> Advertisers never receive conversation data, chat history, or personal information.</li>
          <li><strong>Format:</strong> Text links and product cards only. No video or interactive elements yet.</li>
        </ul>

        <h3>Is It Worth It?</h3>
        <p>For brands with budgets above $200K that want early-mover advantage on a new platform, ChatGPT ads offer access to users during high-intent moments. The limited measurement and high CPM mean you need strong conversion funnels to justify the spend. Use the calculator above to model your expected ROAS and compare against established platforms.</p>
      </>}
    >
      {/* ── Global Inputs ── */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className={labelCls}>Monthly Budget (same across all)</label>
          <input type="number" value={budget} onChange={e => setBudget(Math.max(0, +e.target.value))} className={inputCls} min={0} step={1000} />
        </div>
        <div>
          <label className={labelCls}>Avg Order Value ($)</label>
          <input type="number" value={avgOrderValue} onChange={e => setAvgOrderValue(Math.max(0, +e.target.value))} className={inputCls} min={0} step={5} />
        </div>
      </div>

      {/* ── Compare To ── */}
      <div className="mb-4">
        <p className="text-sm text-zinc-300 mb-2 font-medium">Compare ChatGPT ads against:</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(platforms).filter(([k]) => k !== "chatgpt").map(([key, p]) => (
            <button
              key={key}
              onClick={() => toggleCompare(key)}
              className={`text-sm px-4 py-2 rounded-lg border transition-colors ${
                compareTo.includes(key)
                  ? "border-blue-500 bg-blue-500/10 text-blue-400"
                  : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: p.color }} />
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── Per-platform CTR & Conv Rate ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-6">
        <p className="text-xs text-zinc-400 mb-3">Each platform uses realistic industry-average CTR and conversion rates. Adjust per-platform below.</p>
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${results.length}, minmax(0, 1fr))` }}>
          {results.map(r => (
            <div key={r.key} className="space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.platform.color }} />
                <span className="text-xs font-semibold text-zinc-300">{r.platform.name}</span>
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 block mb-0.5">CTR %</label>
                <input
                  type="number"
                  value={getCtr(r.key)}
                  onChange={e => setOverride(r.key, "ctr", Math.max(0, Math.min(100, +e.target.value)))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
                  min={0} max={100} step={0.1}
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-500 block mb-0.5">Conv %</label>
                <input
                  type="number"
                  value={getConvRate(r.key)}
                  onChange={e => setOverride(r.key, "convRate", Math.max(0, Math.min(100, +e.target.value)))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
                  min={0} max={100} step={0.1}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Results Cards ── */}
      <div className="grid gap-4 mb-6" style={{ gridTemplateColumns: `repeat(${results.length}, minmax(0, 1fr))` }}>
        {results.map(r => (
          <div key={r.key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: r.platform.color }} />
            <h3 className="text-sm font-semibold text-zinc-200 mb-3 mt-1">{r.platform.name}</h3>
            <div className="space-y-2.5">
              <div>
                <div className="text-xs text-zinc-500">Impressions</div>
                <div className="text-lg font-bold text-zinc-100">{fmtK(r.impressions)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Clicks</div>
                <div className="text-lg font-bold text-zinc-100">{fmtK(r.clicks)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Conversions</div>
                <div className="text-lg font-bold text-zinc-100">{fmtK(r.conversions)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Revenue</div>
                <div className="text-lg font-bold text-green-400">{fmt(r.revenue)}</div>
              </div>
              <div className="pt-2 border-t border-zinc-800">
                <div className="text-xs text-zinc-500">ROAS</div>
                <div className={`text-xl font-bold ${r.roas >= 1 ? "text-green-400" : "text-red-400"}`}>{r.roas.toFixed(2)}x</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Cost/Click</div>
                <div className="text-sm text-zinc-300">{fmt(r.costPerClick)}</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Cost/Conversion</div>
                <div className="text-sm text-zinc-300">{fmt(r.costPerConversion)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Visual comparison ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-2">Visual Comparison</h3>
        <div className="flex gap-4 mb-3 flex-wrap">
          {results.map(r => (
            <div key={r.key} className="flex items-center gap-1.5 text-xs text-zinc-400">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.platform.color }} />
              {r.platform.name}
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <canvas ref={canvasRef} className="max-w-full" />
        </div>
      </div>

      {/* ── ChatGPT Ad Preview ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">What ChatGPT Ads Look Like</h3>

        {/* Text link ad */}
        <p className="text-xs text-zinc-400 mb-2 font-medium uppercase tracking-wide">Sponsored Text Link</p>
        <div className="bg-[#212121] rounded-xl p-5 max-w-lg mb-4">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#10a37f] flex items-center justify-center text-white text-xs font-bold">G</div>
              <span className="text-sm text-gray-300">ChatGPT</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">Based on your needs, I&apos;d recommend looking at project management tools that integrate with your existing workflow. Here are some options to consider...</p>
          </div>
          <div className="border-t border-gray-700 pt-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-4 h-4 rounded bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">A</div>
              <span className="text-[11px] text-gray-500 font-medium">Sponsored</span>
            </div>
            <p className="text-sm text-blue-400 font-medium hover:underline cursor-pointer">Try Acme Project Management Free</p>
            <p className="text-xs text-gray-400 mt-0.5">The #1 rated PM tool for teams. Start your free trial today with unlimited projects and team members.</p>
          </div>
        </div>

        {/* Product card ad */}
        <p className="text-xs text-zinc-400 mb-2 font-medium uppercase tracking-wide">Product / Shopping Card</p>
        <div className="bg-[#212121] rounded-xl p-5 max-w-lg">
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full bg-[#10a37f] flex items-center justify-center text-white text-xs font-bold">G</div>
              <span className="text-sm text-gray-300">ChatGPT</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">Here are some running shoes that match what you&apos;re looking for:</p>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {[
              { brand: "N", color: "#e31937", name: "New Balance Fresh Foam X", price: "$129.99", status: "In Stock" },
              { brand: "A", color: "#ff6900", name: "ASICS Gel-Kayano 31", price: "$159.95", status: "In Stock" },
              { brand: "B", color: "#0051ba", name: "Brooks Ghost 16", price: "$139.99", status: "Low Stock" },
            ].map((p) => (
              <div key={p.name} className="min-w-[140px] bg-[#2f2f2f] rounded-lg p-3 border border-gray-700 cursor-pointer hover:border-gray-500 transition-colors flex-shrink-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="w-4 h-4 rounded flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: p.color }}>{p.brand}</div>
                  <span className="text-[10px] text-gray-500">Sponsored</span>
                </div>
                <div className="w-full h-16 bg-[#3a3a3a] rounded mb-2 flex items-center justify-center">
                  <span className="text-gray-600 text-lg">👟</span>
                </div>
                <p className="text-xs text-gray-200 font-medium leading-tight mb-1">{p.name}</p>
                <p className="text-xs text-green-400 font-bold">{p.price}</p>
                <p className="text-[10px] text-gray-500">{p.status}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-3">Approximate recreations based on observed ChatGPT ad placements. Actual appearance may vary.</p>
      </div>

      {/* ── Platform Comparison ── */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-zinc-200 mb-3">Platform Comparison</h3>
        <div className="space-y-3">
          {results.map(r => (
            <div key={r.key} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: r.platform.color }} />
              <div className="flex items-center gap-2 mb-3 pl-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: r.platform.color }} />
                <span className="text-sm font-semibold text-zinc-100">{r.platform.name}</span>
                {r.key === "chatgpt" && <span className="text-[10px] bg-[#10a37f]/15 text-[#10a37f] px-2 py-0.5 rounded-full font-medium">NEW</span>}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 pl-2">
                <div><span className="text-xs text-zinc-500 block">CPM</span><span className="text-sm text-zinc-200 font-medium">${r.platform.avgCpm}</span></div>
                <div><span className="text-xs text-zinc-500 block">Min Spend</span><span className="text-sm text-zinc-200 font-medium">{r.platform.minSpend ? fmt(r.platform.minSpend) : "None"}</span></div>
                <div><span className="text-xs text-zinc-500 block">Self-Serve</span><span className="text-sm text-zinc-200 font-medium">{r.platform.selfServe ? "Yes" : "No (Q4 2026)"}</span></div>
                <div><span className="text-xs text-zinc-500 block">Formats</span><span className="text-sm text-zinc-300">{r.platform.formats}</span></div>
                <div><span className="text-xs text-zinc-500 block">Targeting</span><span className="text-sm text-zinc-300">{r.platform.targeting}</span></div>
                <div><span className="text-xs text-zinc-500 block">Measurement</span><span className="text-sm text-zinc-300">{r.platform.measurement}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ChatGPT Creative Specs ── */}
      <div className="mb-6">
        <h3 className="text-base font-semibold text-zinc-200 mb-3">ChatGPT Ad Creative Specs</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Text Link Ad */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 text-sm">Aa</div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Sponsored Text Link</h4>
                <p className="text-xs text-zinc-500">Primary ad format</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { spec: "Headline", value: "~60 characters max" },
                { spec: "Description", value: "~180 characters max" },
                { spec: "Destination URL", value: "Required (HTTPS)" },
                { spec: "Favicon", value: "16x16px or 32x32px, PNG/ICO" },
                { spec: "Label", value: "\"Sponsored\" auto-applied" },
                { spec: "Placement", value: "Below AI response" },
              ].map(s => (
                <div key={s.spec} className="flex justify-between items-start gap-4">
                  <span className="text-xs text-zinc-500 shrink-0">{s.spec}</span>
                  <span className="text-xs text-zinc-200 text-right">{s.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Product Card Ad */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 text-sm">&#9635;</div>
              <div>
                <h4 className="text-sm font-semibold text-zinc-100">Product / Shopping Card</h4>
                <p className="text-xs text-zinc-500">E-commerce &amp; app installs</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { spec: "Brand Logo", value: "128x128px min, 1:1 ratio, PNG/SVG" },
                { spec: "Product Image", value: "600x600px min, 1:1 ratio, JPG/PNG" },
                { spec: "Product Name", value: "~70 characters max" },
                { spec: "Price", value: "Auto-pulled or manually set" },
                { spec: "CTA Button", value: "\"Buy\", \"Install\", \"Learn More\"" },
                { spec: "Cards Per Row", value: "Up to 3-4 scrollable" },
              ].map(s => (
                <div key={s.spec} className="flex justify-between items-start gap-4">
                  <span className="text-xs text-zinc-500 shrink-0">{s.spec}</span>
                  <span className="text-xs text-zinc-200 text-right">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick Reference ── */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h3 className="text-base font-semibold text-zinc-200 mb-4">Quick Reference</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pricing &amp; Access</h4>
            {[
              { label: "CPM", value: "~$60" },
              { label: "Min Commitment", value: "$200K-$250K" },
              { label: "Self-Serve", value: "Expected Q4 2026" },
              { label: "Ad Tech Partners", value: "Criteo, Trade Desk" },
            ].map(s => (
              <div key={s.label}>
                <span className="text-xs text-zinc-500 block">{s.label}</span>
                <span className="text-sm text-zinc-200 font-medium">{s.value}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Targeting &amp; Audience</h4>
            {[
              { label: "Targeting", value: "Contextual (conversation)" },
              { label: "Audience", value: "US adults only" },
              { label: "Tiers", value: "Free + Go ($8/mo)" },
              { label: "Excluded", value: "Plus, Pro, Team, Edu" },
            ].map(s => (
              <div key={s.label}>
                <span className="text-xs text-zinc-500 block">{s.label}</span>
                <span className="text-sm text-zinc-200 font-medium">{s.value}</span>
              </div>
            ))}
          </div>
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Privacy &amp; Measurement</h4>
            {[
              { label: "User Data", value: "Never shared" },
              { label: "Metrics", value: "Aggregated views + clicks" },
              { label: "Attribution", value: "No pixel / no retargeting" },
              { label: "Under 18", value: "No ads served" },
            ].map(s => (
              <div key={s.label}>
                <span className="text-xs text-zinc-500 block">{s.label}</span>
                <span className="text-sm text-zinc-200 font-medium">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-zinc-500 mt-4 pt-3 border-t border-zinc-800">Sources: OpenAI official blog, Search Engine Land, TechCrunch, Criteo press release, ALM Corp analysis. Specs current as of March 2026.</p>
      </div>
    </ToolLayout>
  );
}

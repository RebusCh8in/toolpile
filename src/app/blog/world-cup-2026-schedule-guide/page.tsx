import type { Metadata } from "next";
import BlogLayout, { ToolCTA } from "@/components/BlogLayout";
import Link from "next/link";

const post = {
  title: "FIFA World Cup 2026: Complete Schedule, Groups, Venues & Time Zones Guide",
  slug: "world-cup-2026-schedule-guide",
  description: "Everything you need to know about the 2026 FIFA World Cup: all 48 teams, 12 groups, 16 venues across the US, Mexico & Canada, key dates, knockout bracket, and how to convert match times to your local time zone.",
  datePublished: "2026-03-17",
  dateModified: "2026-03-17",
  tags: ["World Cup 2026", "FIFA", "Soccer Schedule", "Time Zone Converter", "World Cup Groups", "World Cup Venues"],
  faqs: [
    { question: "When does the 2026 FIFA World Cup start?", answer: "The 2026 FIFA World Cup kicks off on June 11, 2026 with the opening match between Mexico and South Africa at Estadio Azteca in Mexico City. The opening ceremony takes place immediately before kickoff." },
    { question: "Where is the 2026 World Cup final?", answer: "The final is at MetLife Stadium in East Rutherford, New Jersey on July 19, 2026. MetLife Stadium seats 82,500 fans and is in the Eastern time zone (EDT / UTC-4 during summer)." },
    { question: "How many teams are in the 2026 World Cup?", answer: "48 teams — expanded from 32 in 2022. Teams are divided into 12 groups of 4. The top 2 from each group plus the 8 best third-placed teams advance to a 32-team knockout round." },
    { question: "What time zone is the World Cup in?", answer: "The 2026 World Cup spans four time zones: Eastern (EDT/UTC-4) for venues in New York, Miami, Atlanta, Philadelphia, Boston, and Toronto; Central (CDT/UTC-5) for Houston, Dallas, and Kansas City; Mexico's CST (UTC-6) for Mexico City, Guadalajara, and Monterrey; and Pacific (PDT/UTC-7) for Los Angeles, San Francisco, Seattle, and Vancouver." },
    { question: "Why is Mexico on a different time zone than US Central cities?", answer: "Mexico abolished daylight saving time in 2022 (except border cities). During the World Cup in June-July, Mexican venues are on standard CST (UTC-6), while US Central cities like Houston and Dallas observe CDT (UTC-5). This means Mexican venues are 1 hour behind US Central cities, even though both are loosely called 'Central Time.'" },
    { question: "How does the knockout stage work with 48 teams?", answer: "The top 2 from each group (24 teams) plus the 8 best third-placed teams make a 32-team bracket. This adds a Round of 32 before the Round of 16 — one extra knockout round compared to previous World Cups. The Round of 32 runs June 28 to July 3." },
    { question: "Which US cities are hosting World Cup 2026 matches?", answer: "Eleven US cities: New York/New Jersey (MetLife Stadium), Miami (Hard Rock Stadium), Atlanta (Mercedes-Benz Stadium), Philadelphia (Lincoln Financial Field), Boston (Gillette Stadium), Houston (NRG Stadium), Dallas (AT&T Stadium), Kansas City (Arrowhead Stadium), Los Angeles (SoFi Stadium), San Francisco (Levi's Stadium), and Seattle (Lumen Field)." },
    { question: "Are all teams confirmed for the 2026 World Cup?", answer: "42 of 48 teams are confirmed after the December 2025 draw. The remaining 6 spots are decided by UEFA playoffs (4 spots) and intercontinental playoffs (2 spots) on March 26 and 31, 2026." },
  ],
  relatedTools: [
    { name: "World Cup 2026 Schedule & Time Zone Converter", href: "/tools/world-cup-2026-schedule" },
    { name: "Countdown Timer", href: "/tools/countdown-timer" },
    { name: "Timestamp Converter", href: "/tools/timestamp-converter" },
  ],
  relatedArticles: [] as { title: string; href: string }[],
};

export const metadata: Metadata = {
  title: `${post.title} — ToolPile`,
  description: post.description,
  alternates: { canonical: `https://toolpile.app/blog/${post.slug}` },
  openGraph: { title: post.title, description: post.description, url: `https://toolpile.app/blog/${post.slug}`, siteName: "ToolPile", type: "article", publishedTime: post.datePublished, modifiedTime: post.dateModified, tags: post.tags },
  twitter: { card: "summary_large_image", title: post.title, description: post.description },
};

export default function Page() {
  return (
    <BlogLayout post={post}>
      <nav aria-label="Table of contents" className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
        <h2 className="text-lg font-semibold text-zinc-200 mb-3">What We Cover</h2>
        <ol className="space-y-1.5 text-sm">
          <li><Link href="#overview" className="text-blue-400 hover:text-blue-300">1. Tournament Overview</Link></li>
          <li><Link href="#groups" className="text-blue-400 hover:text-blue-300">2. All 12 Groups & 48 Teams</Link></li>
          <li><Link href="#venues" className="text-blue-400 hover:text-blue-300">3. All 16 Venues & Host Cities</Link></li>
          <li><Link href="#time-zones" className="text-blue-400 hover:text-blue-300">4. Time Zone Guide</Link></li>
          <li><Link href="#schedule" className="text-blue-400 hover:text-blue-300">5. Complete Schedule & Key Dates</Link></li>
          <li><Link href="#knockout" className="text-blue-400 hover:text-blue-300">6. Knockout Stage & Bracket</Link></li>
          <li><Link href="#playoffs" className="text-blue-400 hover:text-blue-300">7. Remaining Playoff Spots</Link></li>
          <li><Link href="#watch" className="text-blue-400 hover:text-blue-300">8. How to Watch</Link></li>
          <li><Link href="#tips" className="text-blue-400 hover:text-blue-300">9. Watch Party Planning Tips</Link></li>
        </ol>
      </nav>

      {/* ─── 1. Overview ─── */}
      <section id="overview" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">1. Tournament Overview</h2>
        <p className="text-zinc-300 mb-4">
          The 2026 FIFA World Cup is the largest in history. For the first time, <strong>48 teams</strong> compete across <strong>104 matches</strong> over <strong>39 days</strong> in <strong>three countries</strong> — the United States, Mexico, and Canada.
        </p>
        <p className="text-zinc-300 mb-4">
          It&apos;s also the first World Cup held in the US since 1994, and the first ever co-hosted across three nations. The expanded format means 12 groups of 4 (up from 8 groups), plus a new Round of 32 in the knockout stage.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: "Teams", value: "48" },
            { label: "Matches", value: "104" },
            { label: "Venues", value: "16" },
            { label: "Days", value: "39" },
          ].map(s => (
            <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-blue-400">{s.value}</p>
              <p className="text-zinc-500 text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <p className="text-zinc-300 text-sm"><strong>Key dates:</strong> June 11 (opening match) through July 19 (final). The opening ceremony and first match take place at Estadio Azteca in Mexico City. The final is at MetLife Stadium in East Rutherford, New Jersey.</p>
        </div>
      </section>

      <ToolCTA name="World Cup 2026 Schedule" href="/tools/world-cup-2026-schedule" description="See all groups, venues, and match times in your local time zone." />

      {/* ─── 2. Groups ─── */}
      <section id="groups" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">2. All 12 Groups & 48 Teams</h2>
        <p className="text-zinc-300 mb-4">
          The draw was held on December 5, 2025 in Washington, D.C. Here are all 12 groups. Four UEFA playoff spots and two intercontinental playoff spots will be filled by March 31, 2026.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            { name: "A", teams: ["Mexico", "South Africa", "South Korea", "TBD (UEFA D)"] },
            { name: "B", teams: ["Canada", "TBD (UEFA A)", "Qatar", "Switzerland"] },
            { name: "C", teams: ["Brazil", "Morocco", "Haiti", "Scotland"] },
            { name: "D", teams: ["USA", "Paraguay", "Australia", "TBD (UEFA C)"] },
            { name: "E", teams: ["Germany", "Curacao", "Ivory Coast", "Ecuador"] },
            { name: "F", teams: ["Netherlands", "Japan", "TBD (UEFA B)", "Tunisia"] },
            { name: "G", teams: ["Belgium", "Iran", "Egypt", "New Zealand"] },
            { name: "H", teams: ["Spain", "Cape Verde", "Saudi Arabia", "Uruguay"] },
            { name: "I", teams: ["France", "Senegal", "TBD (ICP 2)", "Norway"] },
            { name: "J", teams: ["Argentina", "Algeria", "Austria", "Jordan"] },
            { name: "K", teams: ["Portugal", "TBD (ICP 1)", "Uzbekistan", "Colombia"] },
            { name: "L", teams: ["England", "Croatia", "Ghana", "Panama"] },
          ].map(g => (
            <div key={g.name} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <h3 className="text-blue-400 font-bold text-sm mb-2">Group {g.name}</h3>
              <ul className="space-y-1 text-sm text-zinc-300">
                {g.teams.map((t, i) => (
                  <li key={i} className={t.startsWith("TBD") ? "text-zinc-500 italic" : ""}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">Groups of Death</h3>
        <p className="text-zinc-300 mb-4">
          With 48 teams and 12 groups, there&apos;s more variety than ever. Several groups stand out:
        </p>
        <ul className="list-disc list-inside text-zinc-300 space-y-2 mb-4">
          <li><strong>Group C</strong> — Brazil and Morocco are both recent semifinalists. Scotland adds a strong European presence, while Haiti represent a historic first.</li>
          <li><strong>Group H</strong> — Spain (defending champions) face Uruguay and Saudi Arabia, two teams that relish underdog upsets.</li>
          <li><strong>Group L</strong> — England and Croatia renew their 2018 semifinal rivalry. Ghana and Panama round out a competitive group.</li>
          <li><strong>Group K</strong> — Portugal and Colombia in the same group, with Uzbekistan as a dangerous dark horse.</li>
        </ul>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">How Advancement Works</h3>
        <p className="text-zinc-300 mb-4">
          The top 2 teams from each group automatically advance (24 teams). Then the <strong>8 best third-placed teams</strong> also qualify, bringing the knockout round to 32 teams. This means finishing third doesn&apos;t necessarily eliminate you — unlike the 2022 format where only the top 2 advanced.
        </p>
        <p className="text-zinc-300">
          Third-place ranking is determined by: points, goal difference, goals scored, fair play points, and FIFA ranking (in that order).
        </p>
      </section>

      {/* ─── 3. Venues ─── */}
      <section id="venues" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">3. All 16 Venues & Host Cities</h2>
        <p className="text-zinc-300 mb-4">
          Matches are spread across 16 stadiums in 3 countries. The United States hosts 78 of 104 matches (including every knockout match from the quarterfinals onward). Mexico and Canada each host 13 matches.
        </p>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">United States (11 venues, 78 matches)</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">City</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Stadium</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Capacity</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Time Zone</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-2">New York / New Jersey</td><td>MetLife Stadium</td><td>82,500</td><td>Eastern (EDT)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Miami</td><td>Hard Rock Stadium</td><td>65,000</td><td>Eastern (EDT)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Atlanta</td><td>Mercedes-Benz Stadium</td><td>67,382</td><td>Eastern (EDT)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Philadelphia</td><td>Lincoln Financial Field</td><td>69,176</td><td>Eastern (EDT)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Boston</td><td>Gillette Stadium</td><td>63,815</td><td>Eastern (EDT)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Houston</td><td>NRG Stadium</td><td>68,311</td><td>Central (CDT)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Dallas</td><td>AT&amp;T Stadium</td><td>70,122</td><td>Central (CDT)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Kansas City</td><td>GEHA Field at Arrowhead</td><td>67,513</td><td>Central (CDT)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Los Angeles</td><td>SoFi Stadium</td><td>70,240</td><td>Pacific (PDT)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">San Francisco</td><td>Levi&apos;s Stadium</td><td>68,500</td><td>Pacific (PDT)</td></tr>
              <tr><td className="py-2">Seattle</td><td>Lumen Field</td><td>69,000</td><td>Pacific (PDT)</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">Mexico (3 venues, 13 matches)</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">City</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Stadium</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Capacity</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Time Zone</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-2">Mexico City</td><td>Estadio Azteca</td><td>72,766</td><td>CST (UTC-6)</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="py-2">Guadalajara</td><td>Estadio Akron</td><td>44,330</td><td>CST (UTC-6)</td></tr>
              <tr><td className="py-2">Monterrey</td><td>Estadio BBVA</td><td>50,113</td><td>CST (UTC-6)</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">Canada (2 venues, 13 matches)</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-2 text-zinc-400 font-medium">City</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Stadium</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Capacity</th>
                <th className="text-left py-2 text-zinc-400 font-medium">Time Zone</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="py-2">Toronto</td><td>BMO Field</td><td>45,736</td><td>Eastern (EDT)</td></tr>
              <tr><td className="py-2">Vancouver</td><td>BC Place</td><td>54,500</td><td>Pacific (PDT)</td></tr>
            </tbody>
          </table>
        </div>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">Knockout Round Venues</h3>
        <p className="text-zinc-300 mb-3">All matches from the quarterfinals onward are in the United States:</p>
        <ul className="list-disc list-inside text-zinc-300 space-y-1">
          <li><strong>Quarterfinals:</strong> Boston (Gillette), Miami (Hard Rock), Los Angeles (SoFi), Kansas City (Arrowhead)</li>
          <li><strong>Semifinals:</strong> Dallas (AT&amp;T Stadium), Atlanta (Mercedes-Benz)</li>
          <li><strong>Third-place match:</strong> Miami (Hard Rock Stadium) — July 18</li>
          <li><strong>Final:</strong> New York/New Jersey (MetLife Stadium) — July 19</li>
        </ul>
      </section>

      <ToolCTA name="World Cup 2026 Schedule" href="/tools/world-cup-2026-schedule" description="View all 16 venues organized by time zone with capacity and country details." />

      {/* ─── 4. Time Zones ─── */}
      <section id="time-zones" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">4. Time Zone Guide</h2>
        <p className="text-zinc-300 mb-4">
          With 16 venues across <strong>four time zones</strong>, keeping track of kickoff times is one of the biggest challenges for fans. Here&apos;s how the venues break down:
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left px-4 py-2 text-zinc-400 font-medium">Zone</th>
                <th className="text-left px-4 py-2 text-zinc-400 font-medium">UTC Offset (Summer)</th>
                <th className="text-left px-4 py-2 text-zinc-400 font-medium">Venues</th>
              </tr>
            </thead>
            <tbody className="text-zinc-300">
              <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-medium">Eastern (EDT)</td><td className="px-4 py-2">UTC-4</td><td className="px-4 py-2">NY/NJ, Miami, Atlanta, Philly, Boston, Toronto</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-medium">Central (CDT)</td><td className="px-4 py-2">UTC-5</td><td className="px-4 py-2">Houston, Dallas, Kansas City</td></tr>
              <tr className="border-b border-zinc-800/50"><td className="px-4 py-2 font-medium">Mexico (CST)</td><td className="px-4 py-2">UTC-6</td><td className="px-4 py-2">Mexico City, Guadalajara, Monterrey</td></tr>
              <tr><td className="px-4 py-2 font-medium">Pacific (PDT)</td><td className="px-4 py-2">UTC-7</td><td className="px-4 py-2">LA, San Francisco, Seattle, Vancouver</td></tr>
            </tbody>
          </table>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mb-6">
          <h4 className="text-amber-400 font-semibold text-sm mb-2">The Mexico Time Zone Trap</h4>
          <p className="text-zinc-300 text-sm">
            Mexico abolished daylight saving time in 2022 for most of the country. During the World Cup (June-July), Mexican venues stay on <strong>standard CST (UTC-6)</strong>, while US Central cities like Houston and Dallas spring forward to <strong>CDT (UTC-5)</strong>.
          </p>
          <p className="text-zinc-300 text-sm mt-2">
            This means a 1:00 PM kickoff in Mexico City is <strong>2:00 PM in Houston</strong> and <strong>3:00 PM in New York</strong>. Don&apos;t assume &ldquo;Central Time&rdquo; means the same thing for Dallas and Monterrey — there&apos;s a 1-hour gap.
          </p>
        </div>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">Quick Reference: 3:00 PM ET Kickoff</h3>
        <p className="text-zinc-300 mb-3">A common US primetime slot. Here&apos;s what it looks like worldwide:</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[
            { zone: "Hawaii", time: "9:00 AM" },
            { zone: "Alaska", time: "11:00 AM" },
            { zone: "Pacific", time: "12:00 PM" },
            { zone: "Mountain", time: "1:00 PM" },
            { zone: "Central (US)", time: "2:00 PM" },
            { zone: "Mexico CST", time: "1:00 PM" },
            { zone: "Eastern", time: "3:00 PM" },
            { zone: "UK (BST)", time: "8:00 PM" },
            { zone: "Central Europe", time: "9:00 PM" },
            { zone: "Gulf", time: "11:00 PM" },
            { zone: "India (IST)", time: "12:30 AM +1" },
            { zone: "Japan/Korea", time: "4:00 AM +1" },
            { zone: "Australia East", time: "5:00 AM +1" },
            { zone: "New Zealand", time: "7:00 AM +1" },
          ].map(t => (
            <div key={t.zone} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
              <p className="text-zinc-500 text-[11px] uppercase tracking-wider">{t.zone}</p>
              <p className="text-zinc-100 font-bold text-sm mt-1">{t.time}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 5. Schedule ─── */}
      <section id="schedule" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">5. Complete Schedule & Key Dates</h2>
        <p className="text-zinc-300 mb-4">
          Here&apos;s the full tournament structure with dates for every phase:
        </p>

        <div className="space-y-3 mb-6">
          {[
            { phase: "Opening Ceremony", dates: "June 11", details: "Estadio Azteca, Mexico City", highlight: "green" },
            { phase: "Opening Match", dates: "June 11", details: "Mexico vs South Africa — Estadio Azteca, Mexico City (1:00 PM CST / 3:00 PM ET)", highlight: "green" },
            { phase: "Host Openers", dates: "June 12", details: "USA opens at SoFi Stadium, LA · Canada opens at BMO Field, Toronto", highlight: "blue" },
            { phase: "Group Stage", dates: "June 11 – 27", details: "72 matches across all 16 venues · 12 groups, 3 matchdays each", highlight: "" },
            { phase: "Round of 32", dates: "June 28 – July 3", details: "16 matches — top 2 from each group + 8 best third-place teams", highlight: "" },
            { phase: "Round of 16", dates: "July 4 – 7", details: "8 matches", highlight: "" },
            { phase: "Quarterfinals", dates: "July 9 – 11", details: "Boston, Miami, Los Angeles, Kansas City", highlight: "" },
            { phase: "Semifinals", dates: "July 14 – 15", details: "Dallas (AT&T Stadium), Atlanta (Mercedes-Benz)", highlight: "" },
            { phase: "Third-Place Match", dates: "July 18", details: "Hard Rock Stadium, Miami", highlight: "" },
            { phase: "Final", dates: "July 19", details: "MetLife Stadium, East Rutherford, NJ", highlight: "yellow" },
          ].map((r, i) => (
            <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${
              r.highlight === "green" ? "bg-green-500/10 border-green-500/30" :
              r.highlight === "blue" ? "bg-blue-500/10 border-blue-500/30" :
              r.highlight === "yellow" ? "bg-yellow-500/10 border-yellow-500/30" :
              "bg-zinc-900 border-zinc-800"
            }`}>
              <div className="min-w-[100px]">
                <p className={`text-sm font-bold ${
                  r.highlight === "green" ? "text-green-400" :
                  r.highlight === "blue" ? "text-blue-400" :
                  r.highlight === "yellow" ? "text-yellow-400" :
                  "text-zinc-300"
                }`}>{r.dates}</p>
              </div>
              <div>
                <p className="text-zinc-100 font-semibold text-sm">{r.phase}</p>
                <p className="text-zinc-400 text-xs mt-0.5">{r.details}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">Group Stage Structure</h3>
        <p className="text-zinc-300 mb-3">
          Each group plays three matchdays, with all teams playing once per matchday. With 12 groups and 2 matches per group per matchday, that&apos;s 24 matches per matchday round, spread across 5-6 days:
        </p>
        <ul className="list-disc list-inside text-zinc-300 space-y-1 mb-4">
          <li><strong>Matchday 1</strong> (June 11–16): All groups play their first match</li>
          <li><strong>Matchday 2</strong> (June 17–22): All groups play their second match</li>
          <li><strong>Matchday 3</strong> (June 23–27): Final group matches (simultaneous kickoffs per group)</li>
        </ul>
        <p className="text-zinc-300">
          Expect 4-5 matches per day during the group stage, with staggered kickoff times throughout the day — typically morning (Pacific), afternoon, and evening (Eastern) slots.
        </p>
      </section>

      {/* ─── 6. Knockout ─── */}
      <section id="knockout" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">6. Knockout Stage & Bracket</h2>
        <p className="text-zinc-300 mb-4">
          The expanded 48-team format adds a <strong>Round of 32</strong> that didn&apos;t exist in previous World Cups. Here&apos;s the full knockout path:
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-6">
          <div className="space-y-4">
            <div>
              <h4 className="text-blue-400 font-semibold text-sm">Round of 32 (June 28 – July 3)</h4>
              <p className="text-zinc-400 text-xs mt-1">32 teams: 24 group qualifiers (top 2 per group) + 8 best third-place teams. 16 matches over 6 days, 2-3 matches per day.</p>
            </div>
            <div className="h-px bg-zinc-800" />
            <div>
              <h4 className="text-blue-400 font-semibold text-sm">Round of 16 (July 4 – 7)</h4>
              <p className="text-zinc-400 text-xs mt-1">16 teams, 8 matches over 4 days. Winners advance to quarterfinals.</p>
            </div>
            <div className="h-px bg-zinc-800" />
            <div>
              <h4 className="text-blue-400 font-semibold text-sm">Quarterfinals (July 9 – 11)</h4>
              <p className="text-zinc-400 text-xs mt-1">8 teams, 4 matches. Venues: Gillette Stadium (Boston), Hard Rock (Miami), SoFi (LA), Arrowhead (Kansas City).</p>
            </div>
            <div className="h-px bg-zinc-800" />
            <div>
              <h4 className="text-blue-400 font-semibold text-sm">Semifinals (July 14 – 15)</h4>
              <p className="text-zinc-400 text-xs mt-1">4 teams, 2 matches. AT&amp;T Stadium (Dallas) and Mercedes-Benz Stadium (Atlanta).</p>
            </div>
            <div className="h-px bg-zinc-800" />
            <div>
              <h4 className="text-yellow-400 font-semibold text-sm">Third-Place Match (July 18)</h4>
              <p className="text-zinc-400 text-xs mt-1">Hard Rock Stadium, Miami.</p>
            </div>
            <div className="h-px bg-zinc-800" />
            <div>
              <h4 className="text-yellow-400 font-semibold text-sm">Final (July 19)</h4>
              <p className="text-zinc-400 text-xs mt-1">MetLife Stadium, East Rutherford, NJ. 82,500 capacity. The biggest single-day sporting event in the world.</p>
            </div>
          </div>
        </div>

        <p className="text-zinc-300">
          All knockout matches that go to extra time will also feature a penalty shootout if needed. There is no away goals rule — UEFA abolished it in 2021, and FIFA does not use it for the World Cup.
        </p>
      </section>

      <ToolCTA name="World Cup 2026 Schedule" href="/tools/world-cup-2026-schedule" description="Convert any match time to your local time zone with our free converter tool." />

      {/* ─── 7. Playoffs ─── */}
      <section id="playoffs" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">7. Remaining Playoff Spots</h2>
        <p className="text-zinc-300 mb-4">
          Six spots remain unfilled heading into the playoffs on March 26 and 31, 2026. Here&apos;s who&apos;s competing:
        </p>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">UEFA Playoffs (4 spots)</h3>
        <p className="text-zinc-300 mb-3">Four two-legged playoff paths, each with four teams competing for one World Cup spot:</p>
        <div className="space-y-3 mb-6">
          {[
            { path: "Path A → Group B", teams: "Italy, Northern Ireland, Wales, Bosnia & Herzegovina" },
            { path: "Path B → Group F", teams: "Ukraine, Sweden, Poland, Albania" },
            { path: "Path C → Group D", teams: "Turkey, Romania, Slovakia, Kosovo" },
            { path: "Path D → Group A", teams: "Denmark, North Macedonia, Czechia, Republic of Ireland" },
          ].map((p, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <p className="text-blue-400 text-sm font-medium">{p.path}</p>
              <p className="text-zinc-400 text-xs mt-1">{p.teams}</p>
            </div>
          ))}
        </div>

        <h3 className="text-xl font-semibold text-zinc-200 mb-3">Intercontinental Playoffs (2 spots)</h3>
        <p className="text-zinc-300 mb-3">Two mini-tournaments held in Mexico:</p>
        <div className="space-y-3">
          {[
            { path: "Tournament 1 → Group K", teams: "Jamaica, New Caledonia, DR Congo" },
            { path: "Tournament 2 → Group I", teams: "Bolivia, Suriname, Iraq" },
          ].map((p, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <p className="text-blue-400 text-sm font-medium">{p.path}</p>
              <p className="text-zinc-400 text-xs mt-1">{p.teams}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── 8. How to Watch ─── */}
      <section id="watch" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">8. How to Watch</h2>
        <p className="text-zinc-300 mb-4">
          Broadcasting rights vary by country. In the United States, the 2026 World Cup will be available on:
        </p>
        <ul className="list-disc list-inside text-zinc-300 space-y-2 mb-4">
          <li><strong>Fox Sports</strong> — English-language broadcast rights (Fox, FS1, FS2)</li>
          <li><strong>Telemundo / Peacock</strong> — Spanish-language broadcast rights</li>
          <li><strong>Streaming</strong> — Fox Sports app and Peacock for full coverage</li>
        </ul>
        <p className="text-zinc-300 mb-4">
          For international viewers, check your local FIFA broadcast partner. Major carriers include BBC/ITV (UK), ARD/ZDF (Germany), TF1/M6 (France), and beIN Sports (Middle East/Asia).
        </p>
        <p className="text-zinc-300">
          With matches spanning morning-to-evening across US time zones, expect full-day coverage on broadcast and streaming platforms.
        </p>
      </section>

      {/* ─── 9. Watch Party Tips ─── */}
      <section id="tips" className="mb-10">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4">9. Watch Party Planning Tips</h2>
        <p className="text-zinc-300 mb-4">
          Planning watch parties across different time zones? Here are some tips:
        </p>

        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Use the Time Zone Converter</h4>
            <p className="text-zinc-400 text-sm">
              Our <Link href="/tools/world-cup-2026-schedule" className="text-blue-400 hover:text-blue-300">World Cup Schedule tool</Link> lets you select your time zone and see all match time slots converted automatically. Share the converted times with your group chat.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Watch for the Mexico Time Zone Gap</h4>
            <p className="text-zinc-400 text-sm">
              Don&apos;t assume Mexico City and Houston are in the same time zone during summer. Mexico doesn&apos;t observe DST, so there&apos;s a 1-hour difference. A 1 PM kickoff in Mexico City is 2 PM in Houston and 3 PM in New York.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">Plan for Multiple Daily Matches</h4>
            <p className="text-zinc-400 text-sm">
              During the group stage, expect 4-5 matches per day. If you&apos;re on the West Coast, early matches may kick off at 8-9 AM Pacific. East Coast fans get evening games. Plan your schedule accordingly.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">July 4th Falls During the Round of 32</h4>
            <p className="text-zinc-400 text-sm">
              The Round of 32 runs June 28 – July 3, meaning knockout matches lead right into Independence Day weekend. If the US advances (likely as group hosts), expect a massive watch party atmosphere for their Round of 32 match.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-zinc-200 font-semibold text-sm mb-2">International Fans: Time Zone Math</h4>
            <p className="text-zinc-400 text-sm">
              For European fans, most matches will be in the evening/late night (8 PM – 2 AM CEST). Asian fans will need to watch in the early morning hours (3 AM – 9 AM JST). Our converter tool handles all the math for you.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Bottom line ─── */}
      <section className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
        <h2 className="text-xl font-bold text-blue-400 mb-3">The Bottom Line</h2>
        <p className="text-zinc-300 mb-3">
          The 2026 World Cup is shaping up to be the biggest sporting event in history — 48 teams, 104 matches, 16 venues, 39 days, across 3 countries and 4 time zones. Whether you&apos;re attending matches in person or watching from home, keeping track of kickoff times across time zones is essential.
        </p>
        <p className="text-zinc-300">
          Use our <Link href="/tools/world-cup-2026-schedule" className="text-blue-400 hover:text-blue-300 font-medium">World Cup 2026 Schedule & Time Zone Converter</Link> to see all groups, venues, and match times in your local time zone — and bookmark this page as your go-to World Cup reference guide.
        </p>
      </section>
    </BlogLayout>
  );
}
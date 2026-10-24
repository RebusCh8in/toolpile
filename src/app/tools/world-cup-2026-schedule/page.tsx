"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ─── flag emoji helper ────────────────────────────────────────── */
const F: Record<string, string> = {
  Mexico:"🇲🇽",SouthAfrica:"🇿🇦",SouthKorea:"🇰🇷",Canada:"🇨🇦",Qatar:"🇶🇦",
  Switzerland:"🇨🇭",Brazil:"🇧🇷",Morocco:"🇲🇦",Haiti:"🇭🇹",Scotland:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  USA:"🇺🇸",Paraguay:"🇵🇾",Australia:"🇦🇺",Germany:"🇩🇪",Curacao:"🇨🇼",
  IvoryCoast:"🇨🇮",Ecuador:"🇪🇨",Netherlands:"🇳🇱",Japan:"🇯🇵",Tunisia:"🇹🇳",
  Belgium:"🇧🇪",Egypt:"🇪🇬",Iran:"🇮🇷",NewZealand:"🇳🇿",Spain:"🇪🇸",
  CapeVerde:"🇨🇻",SaudiArabia:"🇸🇦",Uruguay:"🇺🇾",France:"🇫🇷",Senegal:"🇸🇳",
  Norway:"🇳🇴",Argentina:"🇦🇷",Algeria:"🇩🇿",Austria:"🇦🇹",Jordan:"🇯🇴",
  Portugal:"🇵🇹",Uzbekistan:"🇺🇿",Colombia:"🇨🇴",England:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Croatia:"🇭🇷",Ghana:"🇬🇭",Panama:"🇵🇦",TBD:"🏳️",
};

const flag = (t: string) => F[t.replace(/\s/g, "")] ?? "🏳️";

/* ─── groups ───────────────────────────────────────────────────── */
interface Group { name: string; teams: string[] }

const groups: Group[] = [
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
];

/* ─── venues ───────────────────────────────────────────────────── */
interface Venue {
  city: string; stadium: string; capacity: string;
  country: string; tzLabel: string; utcOffset: number; // summer offset in hours
}

const venues: Venue[] = [
  { city:"New York / New Jersey", stadium:"MetLife Stadium", capacity:"82,500", country:"USA", tzLabel:"Eastern (EDT)", utcOffset:-4 },
  { city:"Miami", stadium:"Hard Rock Stadium", capacity:"65,000", country:"USA", tzLabel:"Eastern (EDT)", utcOffset:-4 },
  { city:"Atlanta", stadium:"Mercedes-Benz Stadium", capacity:"67,382", country:"USA", tzLabel:"Eastern (EDT)", utcOffset:-4 },
  { city:"Philadelphia", stadium:"Lincoln Financial Field", capacity:"69,176", country:"USA", tzLabel:"Eastern (EDT)", utcOffset:-4 },
  { city:"Boston", stadium:"Gillette Stadium", capacity:"63,815", country:"USA", tzLabel:"Eastern (EDT)", utcOffset:-4 },
  { city:"Toronto", stadium:"BMO Field", capacity:"45,736", country:"Canada", tzLabel:"Eastern (EDT)", utcOffset:-4 },
  { city:"Houston", stadium:"NRG Stadium", capacity:"68,311", country:"USA", tzLabel:"Central (CDT)", utcOffset:-5 },
  { city:"Dallas", stadium:"AT&T Stadium", capacity:"70,122", country:"USA", tzLabel:"Central (CDT)", utcOffset:-5 },
  { city:"Kansas City", stadium:"GEHA Field at Arrowhead", capacity:"67,513", country:"USA", tzLabel:"Central (CDT)", utcOffset:-5 },
  { city:"Monterrey", stadium:"Estadio BBVA", capacity:"50,113", country:"Mexico", tzLabel:"CST (UTC-6)", utcOffset:-6 },
  { city:"Guadalajara", stadium:"Estadio Akron", capacity:"44,330", country:"Mexico", tzLabel:"CST (UTC-6)", utcOffset:-6 },
  { city:"Mexico City", stadium:"Estadio Azteca", capacity:"72,766", country:"Mexico", tzLabel:"CST (UTC-6)", utcOffset:-6 },
  { city:"Los Angeles", stadium:"SoFi Stadium", capacity:"70,240", country:"USA", tzLabel:"Pacific (PDT)", utcOffset:-7 },
  { city:"San Francisco", stadium:"Levi's Stadium", capacity:"68,500", country:"USA", tzLabel:"Pacific (PDT)", utcOffset:-7 },
  { city:"Seattle", stadium:"Lumen Field", capacity:"69,000", country:"USA", tzLabel:"Pacific (PDT)", utcOffset:-7 },
  { city:"Vancouver", stadium:"BC Place", capacity:"54,500", country:"Canada", tzLabel:"Pacific (PDT)", utcOffset:-7 },
];

/* ─── key dates / rounds ───────────────────────────────────────── */
interface Round {
  name: string; dates: string; matches: number; venues?: string;
}

const rounds: Round[] = [
  { name: "Opening Match", dates: "June 11", matches: 1, venues: "Estadio Azteca, Mexico City" },
  { name: "Group Stage", dates: "June 11 – 27", matches: 72 },
  { name: "Round of 32", dates: "June 28 – July 3", matches: 16 },
  { name: "Round of 16", dates: "July 4 – 7", matches: 8 },
  { name: "Quarterfinals", dates: "July 9 – 11", matches: 4, venues: "Boston, Miami, Los Angeles, Kansas City" },
  { name: "Semifinals", dates: "July 14 – 15", matches: 2, venues: "Dallas, Atlanta" },
  { name: "Third-Place Match", dates: "July 18", matches: 1, venues: "Hard Rock Stadium, Miami" },
  { name: "Final", dates: "July 19", matches: 1, venues: "MetLife Stadium, New York / New Jersey" },
];

/* ─── known key matches ───────────────────────────────────────── */
interface Match {
  round: string; date: string; team1: string; team2: string;
  venue: string; utcHour: number; utcMinute: number; group?: string;
}

const keyMatches: Match[] = [
  // Opening match
  { round:"Group A", date:"June 11", team1:"Mexico", team2:"South Africa", venue:"Estadio Azteca", utcHour:19, utcMinute:0, group:"A" },
  // Host openers - June 12
  { round:"Group D", date:"June 12", team1:"USA", team2:"TBD (UEFA C)", venue:"SoFi Stadium", utcHour:0, utcMinute:0, group:"D" },
  { round:"Group B", date:"June 12", team1:"Canada", team2:"TBD (UEFA A)", venue:"BMO Field", utcHour:0, utcMinute:0, group:"B" },
];

/* ─── user time zones for converter ─────────────────────────── */
interface UserTZ { label: string; offset: number }

const userTimeZones: UserTZ[] = [
  { label: "Hawaii (HST)", offset: -10 },
  { label: "Alaska (AKDT)", offset: -8 },
  { label: "Pacific (PDT)", offset: -7 },
  { label: "Mountain (MDT)", offset: -6 },
  { label: "Central (CDT)", offset: -5 },
  { label: "Eastern (EDT)", offset: -4 },
  { label: "Atlantic (ADT)", offset: -3 },
  { label: "Brazil (BRT)", offset: -3 },
  { label: "UK (BST)", offset: 1 },
  { label: "Central Europe (CEST)", offset: 2 },
  { label: "East Africa (EAT)", offset: 3 },
  { label: "Gulf (GST)", offset: 4 },
  { label: "India (IST)", offset: 5.5 },
  { label: "China / Singapore (CST/SGT)", offset: 8 },
  { label: "Japan / Korea (JST/KST)", offset: 9 },
  { label: "Australia East (AEST)", offset: 10 },
  { label: "New Zealand (NZST)", offset: 12 },
];

/* ─── time helpers ─────────────────────────────────────────────── */
function convertTime(utcHour: number, utcMinute: number, targetOffset: number): string {
  let h = utcHour + targetOffset;
  if (h < 0) h += 24;
  if (h >= 24) h -= 24;
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:${String(utcMinute).padStart(2, "0")} ${suffix}`;
}

/* ─── typical match time slots (UTC) ─────────────────────────── */
const matchSlots = [
  { utcHour: 15, utcMinute: 0, label: "Early slot" },
  { utcHour: 18, utcMinute: 0, label: "Afternoon slot" },
  { utcHour: 21, utcMinute: 0, label: "Evening slot" },
  { utcHour: 0, utcMinute: 0, label: "Late slot" },
];

/* ─── UEFA & Intercontinental playoff paths ─────────────────── */
const playoffs = [
  { path: "UEFA A → Group B", teams: "Italy, N. Ireland, Wales, Bosnia & Herzegovina", date: "March 26 & 31, 2026" },
  { path: "UEFA B → Group F", teams: "Ukraine, Sweden, Poland, Albania", date: "March 26 & 31, 2026" },
  { path: "UEFA C → Group D", teams: "Turkey, Romania, Slovakia, Kosovo", date: "March 26 & 31, 2026" },
  { path: "UEFA D → Group A", teams: "Denmark, N. Macedonia, Czechia, Ireland", date: "March 26 & 31, 2026" },
  { path: "ICP 1 → Group K", teams: "Jamaica, New Caledonia, DR Congo", date: "March 26 & 31, 2026" },
  { path: "ICP 2 → Group I", teams: "Bolivia, Suriname, Iraq", date: "March 26 & 31, 2026" },
];

/* ─── all teams flat list ──────────────────────────────────────── */
const allTeams = groups.flatMap(g => g.teams).filter(t => !t.startsWith("TBD")).sort();

/* ═══════════════════════════════════════════════════════════════ */
/*                          COMPONENT                             */
/* ═══════════════════════════════════════════════════════════════ */

type Tab = "groups" | "schedule" | "venues" | "converter";

export default function WorldCup2026Schedule() {
  const [tab, setTab] = useState<Tab>("groups");
  const [selectedTZ, setSelectedTZ] = useState(-4); // default EDT
  const [teamFilter, setTeamFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("All");

  /* filtered groups */
  const filteredGroups = useMemo(() => {
    if (groupFilter !== "All") return groups.filter(g => g.name === groupFilter);
    if (!teamFilter) return groups;
    const q = teamFilter.toLowerCase();
    return groups.filter(g => g.teams.some(t => t.toLowerCase().includes(q)));
  }, [groupFilter, teamFilter]);

  /* group match pairings */
  function getGroupMatches(teams: string[]) {
    return [
      { day: "Matchday 1", m1: [teams[0], teams[2]], m2: [teams[1], teams[3]] },
      { day: "Matchday 2", m1: [teams[0], teams[3]], m2: [teams[1], teams[2]] },
      { day: "Matchday 3", m1: [teams[0], teams[1]], m2: [teams[2], teams[3]] },
    ];
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: "groups", label: "Groups & Teams" },
    { id: "schedule", label: "Schedule" },
    { id: "venues", label: "Venues" },
    { id: "converter", label: "Time Zone Converter" },
  ];

  return (
    <ToolLayout
      title="FIFA World Cup 2026 Schedule & Time Zone Converter"
      description="Complete World Cup 2026 schedule with all 48 teams, 12 groups, 16 venues, and instant time zone conversion. Find match times in your local time zone."
      slug="world-cup-2026-schedule"
      category="Utility"
      keywords={[
        "world cup 2026 schedule", "fifa world cup 2026", "world cup 2026 groups",
        "world cup 2026 time zone", "world cup 2026 bracket", "world cup 2026 venues",
        "world cup 2026 usa schedule", "world cup schedule converter", "world cup match times",
        "fifa 2026 groups", "world cup 2026 teams", "world cup 2026 dates",
      ]}
      faqs={[
        { question: "When does the 2026 FIFA World Cup start and end?", answer: "The 2026 FIFA World Cup runs from June 11 to July 19, 2026. The opening match is Mexico vs South Africa at Estadio Azteca in Mexico City on June 11. The final is at MetLife Stadium in East Rutherford, New Jersey on July 19." },
        { question: "How many teams are in the 2026 World Cup?", answer: "The 2026 World Cup features 48 teams — expanded from 32 in previous tournaments. Teams are divided into 12 groups of 4. The top 2 from each group plus the 8 best third-placed teams advance to a 32-team knockout round." },
        { question: "Where is the 2026 World Cup being held?", answer: "The tournament is hosted across three countries: the United States (11 venues), Mexico (3 venues), and Canada (2 venues). There are 16 host cities in total spanning four time zones." },
        { question: "What time zone is the World Cup final in?", answer: "The final is at MetLife Stadium in East Rutherford, NJ, which is in the Eastern time zone (EDT / UTC-4 during summer). Use our time zone converter to see the final's kickoff time in your local time." },
        { question: "How does the knockout stage work with 48 teams?", answer: "The top 2 from each group (24 teams) plus the 8 best third-placed teams make a 32-team knockout bracket. This means there's a Round of 32 before the Round of 16, adding an extra knockout round compared to previous World Cups." },
        { question: "Are there still teams to be determined?", answer: "Yes. Four UEFA playoff spots and two intercontinental playoff spots are decided in March 2026. These determine the final 6 teams that complete the 48-team field." },
        { question: "Why are Mexico's time zones different from US Central?", answer: "Mexico abolished daylight saving time in 2022 (except border cities). During the tournament (June-July), Mexican venues are on CST (UTC-6) while US Central cities observe CDT (UTC-5). This means Mexican venues are 1 hour behind US Central cities like Houston and Dallas." },
        { question: "How many matches are in the 2026 World Cup?", answer: "There are 104 total matches: 72 group stage matches, 16 Round of 32, 8 Round of 16, 4 quarterfinals, 2 semifinals, a third-place match, and the final." },
      ]}
      relatedTools={[
        { name: "Countdown Timer", href: "/tools/countdown-timer" },
        { name: "Age Calculator", href: "/tools/age-calculator" },
        { name: "Timestamp Converter", href: "/tools/timestamp-converter" },
      ]}
      guide={
        <>
          <h2>How to Use the World Cup 2026 Schedule Tool</h2>
          <p>This tool helps you track every match, team, and venue for the 2026 FIFA World Cup — the first-ever 48-team tournament, hosted across the United States, Mexico, and Canada.</p>
          <h3>Groups & Teams</h3>
          <p>View all 12 groups with their 4 teams each. Filter by team name to quickly find your country, or select a specific group. Each group shows all 3 matchday pairings so you know exactly who plays whom.</p>
          <h3>Schedule</h3>
          <p>See key dates for every tournament phase from the opening match through the final. The schedule shows confirmed venues for knockout rounds and match counts per phase.</p>
          <h3>Venues</h3>
          <p>Explore all 16 stadiums across 3 countries and 4 time zones. Each venue card shows the city, stadium name, capacity, and local time zone — critical for planning travel or watch parties.</p>
          <h3>Time Zone Converter</h3>
          <p>Select your local time zone and instantly see what typical World Cup match time slots translate to in your area. With venues spanning from Pacific to Eastern time (plus Mexico&apos;s unique CST), keeping track of kickoff times can be confusing — this converter makes it simple.</p>
          <h3>Key Facts</h3>
          <ul>
            <li><strong>48 teams</strong> in 12 groups of 4</li>
            <li><strong>104 matches</strong> over 39 days</li>
            <li><strong>16 venues</strong> in 3 countries</li>
            <li><strong>32-team knockout</strong> (top 2 + 8 best 3rd-place advance)</li>
            <li>Final at <strong>MetLife Stadium</strong>, July 19, 2026</li>
          </ul>
        </>
      }
    >
      {/* ── Tab bar ─────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-zinc-800/50 rounded-lg p-1 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 min-w-[100px] px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              tab === t.id ? "bg-blue-600 text-white" : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ══════════════ GROUPS TAB ══════════════ */}
      {tab === "groups" && (
        <div>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              placeholder="Search team…"
              value={teamFilter}
              onChange={e => { setTeamFilter(e.target.value); setGroupFilter("All"); }}
              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            <select
              value={groupFilter}
              onChange={e => { setGroupFilter(e.target.value); setTeamFilter(""); }}
              className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
            >
              <option value="All">All Groups</option>
              {groups.map(g => <option key={g.name} value={g.name}>Group {g.name}</option>)}
            </select>
          </div>

          {/* Group cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredGroups.map(g => (
              <div key={g.name} className="bg-zinc-800/60 border border-zinc-700 rounded-xl overflow-hidden">
                <div className="bg-blue-600/20 border-b border-zinc-700 px-4 py-2">
                  <h3 className="text-blue-400 font-bold text-sm">Group {g.name}</h3>
                </div>
                <div className="p-4">
                  {/* Teams */}
                  <div className="space-y-2 mb-4">
                    {g.teams.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="text-lg">{flag(t)}</span>
                        <span className={`text-zinc-${t.startsWith("TBD") ? "500 italic" : "200"}`}>{t}</span>
                      </div>
                    ))}
                  </div>
                  {/* Match pairings */}
                  <div className="border-t border-zinc-700 pt-3 space-y-2">
                    <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-medium">Match Pairings</p>
                    {getGroupMatches(g.teams).map((md, i) => (
                      <div key={i} className="text-xs text-zinc-400">
                        <span className="text-zinc-500 font-medium">{md.day}:</span>{" "}
                        <span>{md.m1[0]} vs {md.m1[1]}</span>
                        <span className="mx-1 text-zinc-600">·</span>
                        <span>{md.m2[0]} vs {md.m2[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Playoff spots */}
          <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
            <h3 className="text-amber-400 font-semibold text-sm mb-3">🏆 Remaining Playoff Spots (March 26 & 31, 2026)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {playoffs.map((p, i) => (
                <div key={i} className="text-xs">
                  <span className="text-amber-400 font-medium">{p.path}</span>
                  <p className="text-zinc-400 mt-0.5">{p.teams}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ SCHEDULE TAB ══════════════ */}
      {tab === "schedule" && (
        <div>
          {/* Timeline */}
          <div className="space-y-3 mb-8">
            {rounds.map((r, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-xl border ${
                r.name === "Final" ? "bg-yellow-500/10 border-yellow-500/30" :
                r.name === "Opening Match" ? "bg-green-500/10 border-green-500/30" :
                "bg-zinc-800/60 border-zinc-700"
              }`}>
                <div className="min-w-[90px]">
                  <p className={`text-sm font-bold ${
                    r.name === "Final" ? "text-yellow-400" :
                    r.name === "Opening Match" ? "text-green-400" :
                    "text-blue-400"
                  }`}>{r.dates}</p>
                </div>
                <div className="flex-1">
                  <p className="text-zinc-100 font-semibold text-sm">{r.name}</p>
                  <p className="text-zinc-400 text-xs mt-0.5">
                    {r.matches} match{r.matches > 1 ? "es" : ""}
                    {r.venues && <span className="ml-1">· {r.venues}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Key confirmed matches */}
          <h3 className="text-zinc-200 font-semibold text-sm mb-3">Confirmed Matches</h3>
          <div className="space-y-2 mb-6">
            {keyMatches.map((m, i) => (
              <div key={i} className="bg-zinc-800/60 border border-zinc-700 rounded-lg p-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{flag(m.team1)}</span>
                    <span className="text-zinc-200 text-sm font-medium">{m.team1}</span>
                    <span className="text-zinc-500 text-xs">vs</span>
                    <span className="text-zinc-200 text-sm font-medium">{m.team2}</span>
                    <span className="text-lg">{flag(m.team2)}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-zinc-400 text-xs">{m.date} · {m.venue}</p>
                    {m.utcHour > 0 && (
                      <p className="text-blue-400 text-xs font-medium">
                        {convertTime(m.utcHour, m.utcMinute, selectedTZ)} (your time)
                      </p>
                    )}
                  </div>
                </div>
                <p className="text-zinc-500 text-[11px] mt-1">{m.round}</p>
              </div>
            ))}
          </div>

          {/* TZ selector for this tab */}
          <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4">
            <label className="text-zinc-400 text-xs block mb-2">Your time zone (for match times above)</label>
            <select
              value={selectedTZ}
              onChange={e => setSelectedTZ(Number(e.target.value))}
              className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
            >
              {userTimeZones.map(tz => (
                <option key={tz.label} value={tz.offset}>{tz.label} (UTC{tz.offset >= 0 ? "+" : ""}{tz.offset})</option>
              ))}
            </select>
          </div>

          {/* Match distribution */}
          <div className="mt-6 bg-zinc-800/60 border border-zinc-700 rounded-xl p-4">
            <h3 className="text-zinc-200 font-semibold text-sm mb-3">Match Distribution by Country</h3>
            <div className="space-y-2">
              {[
                { country: "United States", matches: 78, pct: 75, flag: "🇺🇸" },
                { country: "Mexico", matches: 13, pct: 12.5, flag: "🇲🇽" },
                { country: "Canada", matches: 13, pct: 12.5, flag: "🇨🇦" },
              ].map(c => (
                <div key={c.country}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-300">{c.flag} {c.country}</span>
                    <span className="text-zinc-400">{c.matches} matches</span>
                  </div>
                  <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════ VENUES TAB ══════════════ */}
      {tab === "venues" && (
        <div>
          {/* Group by time zone */}
          {[
            { zone: "Eastern Time (EDT / UTC-4)", offset: -4 },
            { zone: "Central Time (CDT / UTC-5)", offset: -5 },
            { zone: "Mexico Central (CST / UTC-6)", offset: -6 },
            { zone: "Pacific Time (PDT / UTC-7)", offset: -7 },
          ].map(tz => {
            const zoneVenues = venues.filter(v => v.utcOffset === tz.offset);
            if (!zoneVenues.length) return null;
            return (
              <div key={tz.zone} className="mb-6">
                <h3 className="text-zinc-300 font-semibold text-sm mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  {tz.zone}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {zoneVenues.map(v => (
                    <div key={v.stadium} className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4">
                      <p className="text-zinc-200 font-semibold text-sm">{v.city}</p>
                      <p className="text-zinc-400 text-xs mt-0.5">{v.stadium}</p>
                      <div className="flex justify-between mt-2 text-xs">
                        <span className="text-zinc-500">Capacity: {v.capacity}</span>
                        <span className="text-zinc-500">{v.country === "USA" ? "🇺🇸" : v.country === "Canada" ? "🇨🇦" : "🇲🇽"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Important TZ note */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mt-4">
            <p className="text-amber-400 text-sm font-semibold mb-1">Time Zone Note</p>
            <p className="text-zinc-300 text-xs">
              Mexico abolished daylight saving time in 2022. During the tournament (June–July), Mexican venues
              (Mexico City, Guadalajara, Monterrey) are on <strong>CST (UTC-6)</strong>, while US Central cities
              (Houston, Dallas, Kansas City) observe <strong>CDT (UTC-5)</strong>. Mexican venues are
              <strong> 1 hour behind</strong> US Central cities despite both being loosely called &quot;Central Time.&quot;
            </p>
          </div>
        </div>
      )}

      {/* ══════════════ CONVERTER TAB ══════════════ */}
      {tab === "converter" && (
        <div>
          <div className="mb-6">
            <label className="text-zinc-300 text-sm font-medium block mb-2">Select your time zone</label>
            <select
              value={selectedTZ}
              onChange={e => setSelectedTZ(Number(e.target.value))}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm focus:outline-none focus:border-blue-500"
            >
              {userTimeZones.map(tz => (
                <option key={tz.label} value={tz.offset}>{tz.label} (UTC{tz.offset >= 0 ? "+" : ""}{tz.offset})</option>
              ))}
            </select>
          </div>

          {/* Typical match times */}
          <h3 className="text-zinc-200 font-semibold text-sm mb-3">Typical Match Time Slots in Your Time Zone</h3>
          <p className="text-zinc-400 text-xs mb-4">
            FIFA typically schedules matches at staggered times throughout the day. Here&apos;s what common kickoff slots look like in your selected time zone:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {matchSlots.map((slot, i) => (
              <div key={i} className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4">
                <p className="text-zinc-500 text-[11px] uppercase tracking-wider mb-1">{slot.label}</p>
                <p className="text-2xl font-bold text-zinc-100">
                  {convertTime(slot.utcHour, slot.utcMinute, selectedTZ)}
                </p>
                <p className="text-zinc-500 text-xs mt-1">
                  {convertTime(slot.utcHour, slot.utcMinute, 0)} UTC
                </p>
              </div>
            ))}
          </div>

          {/* Venue local times comparison */}
          <h3 className="text-zinc-200 font-semibold text-sm mb-3">When a 3:00 PM ET Match Kicks Off</h3>
          <p className="text-zinc-400 text-xs mb-4">
            See what 3:00 PM Eastern (a common US primetime slot) looks like across all venue time zones and in your selected zone:
          </p>
          <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left px-4 py-2 text-zinc-400 text-xs font-medium">Time Zone</th>
                  <th className="text-left px-4 py-2 text-zinc-400 text-xs font-medium">Cities</th>
                  <th className="text-right px-4 py-2 text-zinc-400 text-xs font-medium">Local Time</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { zone: "Eastern (EDT)", cities: "NY, Miami, Atlanta, Philly, Boston, Toronto", offset: -4 },
                  { zone: "Central (CDT)", cities: "Houston, Dallas, Kansas City", offset: -5 },
                  { zone: "Mexico (CST)", cities: "Mexico City, Guadalajara, Monterrey", offset: -6 },
                  { zone: "Pacific (PDT)", cities: "LA, San Francisco, Seattle, Vancouver", offset: -7 },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-zinc-700/50">
                    <td className="px-4 py-2 text-zinc-300 text-xs font-medium">{r.zone}</td>
                    <td className="px-4 py-2 text-zinc-400 text-xs">{r.cities}</td>
                    <td className="px-4 py-2 text-right text-zinc-100 text-xs font-mono">
                      {convertTime(19, 0, r.offset)}{/* 3PM ET = 19:00 UTC */}
                    </td>
                  </tr>
                ))}
                <tr className="bg-blue-600/10">
                  <td className="px-4 py-2 text-blue-400 text-xs font-medium">Your Time Zone</td>
                  <td className="px-4 py-2 text-blue-300 text-xs">
                    {userTimeZones.find(tz => tz.offset === selectedTZ)?.label ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-right text-blue-300 text-xs font-mono font-bold">
                    {convertTime(19, 0, selectedTZ)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Quick converter */}
          <div className="mt-8">
            <h3 className="text-zinc-200 font-semibold text-sm mb-3">All Venue Time Zones at a Glance</h3>
            <p className="text-zinc-400 text-xs mb-4">
              The difference between your selected time zone and each venue zone:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Eastern (EDT)", offset: -4, cities: "6 venues" },
                { label: "Central (CDT)", offset: -5, cities: "3 venues" },
                { label: "Mexico (CST)", offset: -6, cities: "3 venues" },
                { label: "Pacific (PDT)", offset: -7, cities: "4 venues" },
              ].map((z, i) => {
                const diff = selectedTZ - z.offset;
                return (
                  <div key={i} className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-3 text-center">
                    <p className="text-zinc-400 text-[11px] mb-1">{z.label}</p>
                    <p className={`text-lg font-bold ${diff === 0 ? "text-green-400" : diff > 0 ? "text-blue-400" : "text-amber-400"}`}>
                      {diff === 0 ? "Same" : `${diff > 0 ? "+" : ""}${diff}h`}
                    </p>
                    <p className="text-zinc-500 text-[10px] mt-1">{z.cities}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Tournament stats footer ─────────────────── */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Teams", value: "48" },
          { label: "Matches", value: "104" },
          { label: "Venues", value: "16" },
          { label: "Days", value: "39" },
        ].map(s => (
          <div key={s.label} className="bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-400">{s.value}</p>
            <p className="text-zinc-500 text-xs">{s.label}</p>
          </div>
        ))}
      </div>
    </ToolLayout>
  );
}
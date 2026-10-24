"use client";
import { useState, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

type SizeCategory = "small" | "medium" | "large" | "giant";

const SIZE_LABELS: Record<SizeCategory, string> = {
  small: "Small (under 20 lbs)",
  medium: "Medium (20\u201350 lbs)",
  large: "Large (50\u201390 lbs)",
  giant: "Giant (90+ lbs)",
};

const YEARLY_RATE: Record<SizeCategory, number> = {
  small: 4,
  medium: 5,
  large: 6,
  giant: 7,
};

const AVG_LIFESPAN: Record<SizeCategory, [number, number]> = {
  small: [12, 16],
  medium: [10, 14],
  large: [8, 12],
  giant: [6, 10],
};

const LIFE_STAGES: { label: string; color: string; bg: string }[] = [
  { label: "Puppy", color: "text-sky-400", bg: "bg-sky-500" },
  { label: "Junior", color: "text-teal-400", bg: "bg-teal-500" },
  { label: "Adult", color: "text-green-400", bg: "bg-green-500" },
  { label: "Mature", color: "text-yellow-400", bg: "bg-yellow-500" },
  { label: "Senior", color: "text-orange-400", bg: "bg-orange-500" },
  { label: "Geriatric", color: "text-red-400", bg: "bg-red-500" },
];

const BREEDS: { name: string; size: SizeCategory }[] = [
  { name: "Chihuahua", size: "small" },
  { name: "Dachshund", size: "small" },
  { name: "French Bulldog", size: "small" },
  { name: "Jack Russell Terrier", size: "small" },
  { name: "Maltese", size: "small" },
  { name: "Miniature Poodle", size: "small" },
  { name: "Pomeranian", size: "small" },
  { name: "Shih Tzu", size: "small" },
  { name: "Yorkshire Terrier", size: "small" },
  { name: "Cavalier King Charles Spaniel", size: "small" },
  { name: "Australian Shepherd", size: "medium" },
  { name: "Beagle", size: "medium" },
  { name: "Border Collie", size: "medium" },
  { name: "Brittany", size: "medium" },
  { name: "Bulldog", size: "medium" },
  { name: "Cocker Spaniel", size: "medium" },
  { name: "Corgi", size: "medium" },
  { name: "Miniature Schnauzer", size: "medium" },
  { name: "Siberian Husky", size: "medium" },
  { name: "Standard Poodle", size: "medium" },
  { name: "Boxer", size: "large" },
  { name: "Doberman Pinscher", size: "large" },
  { name: "German Shepherd", size: "large" },
  { name: "Golden Retriever", size: "large" },
  { name: "Labrador Retriever", size: "large" },
  { name: "Pitbull", size: "large" },
  { name: "Rottweiler", size: "large" },
  { name: "Weimaraner", size: "large" },
  { name: "Belgian Malinois", size: "large" },
  { name: "Rhodesian Ridgeback", size: "large" },
  { name: "Bernese Mountain Dog", size: "giant" },
  { name: "Cane Corso", size: "giant" },
  { name: "English Mastiff", size: "giant" },
  { name: "Great Dane", size: "giant" },
  { name: "Great Pyrenees", size: "giant" },
  { name: "Irish Wolfhound", size: "giant" },
  { name: "Leonberger", size: "giant" },
  { name: "Newfoundland", size: "giant" },
  { name: "Saint Bernard", size: "giant" },
  { name: "Tibetan Mastiff", size: "giant" },
];

function calcHumanAge(dogYears: number, dogMonths: number, size: SizeCategory): number {
  const totalDogYears = dogYears + dogMonths / 12;
  if (totalDogYears <= 0) return 0;
  const rate = YEARLY_RATE[size];
  if (totalDogYears <= 1) return totalDogYears * 15;
  if (totalDogYears <= 2) return 15 + (totalDogYears - 1) * 9;
  return 15 + 9 + (totalDogYears - 2) * rate;
}

function getLifeStage(dogYears: number, dogMonths: number, size: SizeCategory): number {
  const total = dogYears + dogMonths / 12;
  const [lo, hi] = AVG_LIFESPAN[size];
  const avg = (lo + hi) / 2;
  if (total < 0.5) return 0;          // Puppy
  if (total < 1) return 1;            // Junior
  if (total < avg * 0.5) return 2;    // Adult
  if (total < avg * 0.7) return 3;    // Mature
  if (total < avg * 0.85) return 4;   // Senior
  return 5;                            // Geriatric
}

function buildComparisonRows(): { dogAge: number; small: number; medium: number; large: number; giant: number }[] {
  const ages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  return ages.map((a) => ({
    dogAge: a,
    small: Math.round(calcHumanAge(a, 0, "small")),
    medium: Math.round(calcHumanAge(a, 0, "medium")),
    large: Math.round(calcHumanAge(a, 0, "large")),
    giant: Math.round(calcHumanAge(a, 0, "giant")),
  }));
}

const FUN_FACTS = [
  "A dog's first year of life is roughly equivalent to 15 human years \u2014 they grow up fast!",
  "Small dogs tend to live significantly longer than large breeds. A Chihuahua may live 15\u201317 years while a Great Dane averages 7\u201310.",
  "The oldest verified dog ever was an Australian Cattle Dog named Bluey, who lived to 29 years and 5 months.",
  "Dogs reach sexual maturity at about 6\u201312 months, equivalent to a human teenager.",
  "Giant breeds like Great Danes age the fastest after year 2, gaining about 7 human-equivalent years annually.",
  "Dogs\u2019 DNA methylation patterns (epigenetic clock) have been used by researchers to more accurately map dog-to-human age.",
  "By age 2, most dogs have reached full physical maturity \u2014 equivalent to a person in their mid-20s.",
];

const inputCls = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-100 focus:outline-none focus:border-blue-500";
const labelCls = "block text-sm text-zinc-400 mb-1";

export default function Page() {
  const [dogYears, setDogYears] = useState(3);
  const [dogMonths, setDogMonths] = useState(0);
  const [size, setSize] = useState<SizeCategory>("medium");
  const [breed, setBreed] = useState("");

  const humanAge = useMemo(() => calcHumanAge(dogYears, dogMonths, size), [dogYears, dogMonths, size]);
  const stageIdx = useMemo(() => getLifeStage(dogYears, dogMonths, size), [dogYears, dogMonths, size]);
  const stage = LIFE_STAGES[stageIdx];
  const comparison = useMemo(() => buildComparisonRows(), []);
  const [lifeLo, lifeHi] = AVG_LIFESPAN[size];

  function handleBreedChange(breedName: string) {
    setBreed(breedName);
    if (breedName) {
      const found = BREEDS.find((b) => b.name === breedName);
      if (found) setSize(found.size);
    }
  }

  const totalDogAge = dogYears + dogMonths / 12;
  const lifespanAvg = (lifeLo + lifeHi) / 2;
  const lifePct = Math.min(100, (totalDogAge / lifespanAvg) * 100);

  return (
    <ToolLayout
      title="Dog Age Calculator"
      description="Convert your dog's age to human years using the modern science-based method. Accounts for breed size, life stage, and real aging rates \u2014 not the outdated multiply-by-7 myth."
      slug="dog-age-calculator"
      category="Health"
      keywords={[
        "dog age calculator",
        "dog years to human years",
        "dog age in human years",
        "dog age chart",
        "puppy age calculator",
        "dog life expectancy",
        "how old is my dog in human years",
      ]}
      faqs={[
        {
          question: "Why is the multiply-by-7 rule wrong?",
          answer:
            "The 7:1 ratio oversimplifies dog aging. Dogs mature much faster in their first two years \u2014 a 1-year-old dog is closer to a 15-year-old human, not a 7-year-old. After that, aging slows but varies significantly by size. Small dogs age more slowly than large breeds in later years, which the old rule ignores entirely.",
        },
        {
          question: "How does dog size affect aging?",
          answer:
            "Larger dogs age faster than smaller dogs after the first two years. A small dog gains about 4 human-equivalent years per dog year, while a giant breed gains about 7. This is why small breeds like Chihuahuas often live 15+ years, while giant breeds like Great Danes typically live 7\u201310 years.",
        },
        {
          question: "What are the dog life stages?",
          answer:
            "Dogs progress through six life stages: Puppy (birth to ~6 months), Junior (~6\u201312 months), Adult (~1 year to mid-life), Mature (mid-life), Senior (approaching final quarter of expected lifespan), and Geriatric (beyond expected average lifespan). The exact timing depends on breed size.",
        },
        {
          question: "How accurate is this dog age calculator?",
          answer:
            "This calculator uses the widely accepted veterinary guidelines from the American Veterinary Medical Association and breed-size aging rates. While individual dogs vary based on genetics, diet, exercise, and healthcare, this method is far more accurate than the old multiply-by-7 formula. Recent epigenetic research continues to refine these models.",
        },
        {
          question: "Why do small dogs live longer than large dogs?",
          answer:
            "Scientists believe larger dogs age faster because their bodies work harder to grow and maintain more mass. Larger breeds grow from puppy to adult size extremely quickly, which may accelerate cellular aging. There may also be a link between growth hormones (IGF-1) and faster biological aging in bigger dogs.",
        },
        {
          question: "At what age is a dog considered senior?",
          answer:
            "It depends on size. Small dogs are generally considered senior around 10\u201312 years. Medium dogs around 8\u201310 years. Large dogs around 7\u20138 years. Giant breeds can be considered senior as early as 5\u20136 years old. Your vet can help determine your specific dog\u2019s life stage.",
        },
      ]}
      relatedTools={[
        { name: "Age Calculator", href: "/tools/age-calculator" },
        { name: "BMI Calculator", href: "/tools/bmi-calculator" },
        { name: "Calorie Calculator", href: "/tools/calorie-calculator" },
        { name: "Unit Converter", href: "/tools/unit-converter" },
      ]}
      guide={
        <div className="space-y-6 text-zinc-300">
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">How to Use the Dog Age Calculator</h2>
            <p className="text-zinc-400 leading-relaxed">
              Enter your dog&apos;s age in years and months, then select their size category or choose a breed from the dropdown. The calculator instantly converts their age to human-equivalent years using modern veterinary science, determines their life stage, and shows how their aging compares across different size categories.
            </p>
          </section>
          <section>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">The Science Behind Dog Aging</h2>
            <p className="text-zinc-400 leading-relaxed">
              The old &quot;multiply by 7&quot; rule has been debunked by veterinary researchers. Dogs age rapidly in their first two years, reaching the equivalent of a 24-year-old human by age 2. After that, the rate of aging depends heavily on body size. This calculator uses the size-adjusted model endorsed by the American Veterinary Medical Association, which accounts for the fact that larger dogs age significantly faster in their later years.
            </p>
          </section>
        </div>
      }
    >
      {/* Main calculator */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          {/* Breed selector */}
          <div>
            <label className={labelCls}>Breed (optional)</label>
            <select
              value={breed}
              onChange={(e) => handleBreedChange(e.target.value)}
              className={inputCls}
            >
              <option value="">Select a breed...</option>
              {BREEDS.map((b) => (
                <option key={b.name} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Size category */}
          <div>
            <label className={labelCls}>Size Category</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(SIZE_LABELS) as SizeCategory[]).map((s) => (
                <button
                  key={s}
                  onClick={() => { setSize(s); setBreed(""); }}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    size === s
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  }`}
                >
                  {SIZE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Age inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Years</label>
              <input
                type="number"
                value={dogYears}
                onChange={(e) => setDogYears(Math.max(0, Math.min(25, +e.target.value)))}
                className={inputCls}
                min={0}
                max={25}
              />
            </div>
            <div>
              <label className={labelCls}>Months</label>
              <input
                type="number"
                value={dogMonths}
                onChange={(e) => setDogMonths(Math.max(0, Math.min(11, +e.target.value)))}
                className={inputCls}
                min={0}
                max={11}
              />
            </div>
          </div>

          {/* Average lifespan info */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Average Lifespan ({SIZE_LABELS[size].split(" (")[0]})</p>
            <p className="text-lg font-semibold text-zinc-200">{lifeLo}&ndash;{lifeHi} years</p>
            <div className="mt-2 h-2 bg-zinc-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  lifePct < 50 ? "bg-green-500" : lifePct < 75 ? "bg-yellow-500" : lifePct < 100 ? "bg-orange-500" : "bg-red-500"
                }`}
                style={{ width: `${Math.min(100, lifePct)}%` }}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {lifePct < 100
                ? `~${Math.round(100 - lifePct)}% of average lifespan remaining`
                : "Beyond average lifespan"}
            </p>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Human age result */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Human Age Equivalent</p>
            <p className="text-5xl font-bold text-blue-400">{humanAge.toFixed(1)}</p>
            <p className="text-sm text-zinc-500 mt-1">human years</p>
          </div>

          {/* Life stage */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-5 text-center">
            <p className="text-sm text-zinc-400 mb-1">Life Stage</p>
            <p className={`text-2xl font-bold ${stage.color}`}>{stage.label}</p>
            {breed && (
              <p className="text-sm text-zinc-500 mt-1">
                {breed} &middot; {SIZE_LABELS[size].split(" (")[0]}
              </p>
            )}
          </div>

          {/* Life stage timeline */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Life Stage Timeline</p>
            <div className="flex rounded-full overflow-hidden h-5 mb-3">
              {LIFE_STAGES.map((s, i) => (
                <div
                  key={s.label}
                  className={`${s.bg} flex-1 relative transition-opacity ${
                    i === stageIdx ? "opacity-100" : "opacity-30"
                  }`}
                >
                  {i === stageIdx && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white drop-shadow">{s.label}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-zinc-500">
              {LIFE_STAGES.map((s, i) => (
                <span key={s.label} className={i === stageIdx ? stage.color + " font-semibold" : ""}>
                  {s.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Age comparison chart */}
      <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Dog-to-Human Age Comparison by Size</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400 text-left">
                <th className="px-3 py-2">Dog Age</th>
                <th className="px-3 py-2">Small</th>
                <th className="px-3 py-2">Medium</th>
                <th className="px-3 py-2">Large</th>
                <th className="px-3 py-2">Giant</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => {
                const isActive = row.dogAge === dogYears && dogMonths === 0;
                return (
                  <tr
                    key={row.dogAge}
                    className={`border-t border-zinc-800 ${
                      isActive ? "bg-blue-600/10 text-blue-300" : "text-zinc-300"
                    }`}
                  >
                    <td className="px-3 py-1.5 font-medium">{row.dogAge} yr</td>
                    <td className={`px-3 py-1.5 ${isActive && size === "small" ? "font-bold text-blue-400" : ""}`}>{row.small}</td>
                    <td className={`px-3 py-1.5 ${isActive && size === "medium" ? "font-bold text-blue-400" : ""}`}>{row.medium}</td>
                    <td className={`px-3 py-1.5 ${isActive && size === "large" ? "font-bold text-blue-400" : ""}`}>{row.large}</td>
                    <td className={`px-3 py-1.5 ${isActive && size === "giant" ? "font-bold text-blue-400" : ""}`}>{row.giant}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Average lifespan by size */}
      <div className="mt-6 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Average Lifespan by Size Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(AVG_LIFESPAN) as SizeCategory[]).map((s) => {
            const [lo, hi] = AVG_LIFESPAN[s];
            const isActive = s === size;
            return (
              <div
                key={s}
                className={`rounded-lg p-3 text-center border transition-colors ${
                  isActive
                    ? "bg-blue-600/10 border-blue-500/40"
                    : "bg-zinc-900 border-zinc-800"
                }`}
              >
                <p className={`text-xs uppercase tracking-wider mb-1 ${isActive ? "text-blue-400" : "text-zinc-500"}`}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </p>
                <p className={`text-lg font-bold ${isActive ? "text-blue-300" : "text-zinc-300"}`}>
                  {lo}&ndash;{hi} yrs
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fun facts */}
      <div className="mt-6 bg-zinc-800/50 border border-zinc-700 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-zinc-200 mb-3">Fun Facts About Dog Aging</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {FUN_FACTS.map((fact, i) => (
            <div key={i} className="flex gap-3 bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <span className="text-blue-500 font-bold text-lg leading-none mt-0.5">{i + 1}</span>
              <p className="text-sm text-zinc-400 leading-relaxed">{fact}</p>
            </div>
          ))}
        </div>
      </div>
    </ToolLayout>
  );
}

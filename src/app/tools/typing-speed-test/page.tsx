"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import ToolLayout from "@/components/ToolLayout";

/* ─── word lists ─── */
const COMMON_WORDS = [
  "the","be","to","of","and","a","in","that","have","i","it","for","not","on","with",
  "he","as","you","do","at","this","but","his","by","from","they","we","her","she","or",
  "an","will","my","one","all","would","there","their","what","so","up","out","if","about",
  "who","get","which","go","me","when","make","can","like","time","no","just","him","know",
  "take","people","into","year","your","good","some","could","them","see","other","than",
  "then","now","look","only","come","its","over","think","also","back","after","use","two",
  "how","our","work","first","well","way","even","new","want","because","any","these","give",
  "day","most","us","great","between","need","large","often","those","turn","long","ask",
  "small","home","hand","high","keep","place","where","after","thing","much","here","right",
  "still","find","own","again","old","run","set","help","every","world","line","say","each",
  "tell","does","three","same","another","around","follow","act","why","move","live","point",
  "read","next","sound","below","play","country","last","school","never","put","thought",
  "might","close","seem","open","begin","life","few","stand","such","change","while","head",
  "end","off","land","should","show","try","answer","grow","under","study","learn","house",
  "let","city","eye","light","name","hard","start","must","late","real","far","air","kind",
  "both","side","call","form","word","state","part","may","down","before","more","write",
  "number","water","been","many","very","made","did","went","said"
];

const EXTENDED_WORDS = [
  ...COMMON_WORDS,
  "accomplish","acknowledge","adventure","algorithm","ambassador","ambitious","anticipate",
  "appreciate","architecture","argument","atmosphere","authority","available","beautiful",
  "boundary","brilliant","calculate","capability","celebrate","challenge","character",
  "circumstance","collaborate","comfortable","communicate","community","competition",
  "comprehensive","concentrate","confidence","consequence","considerable","contribute",
  "conversation","corporate","creativity","curriculum","dangerous","declaration","definitely",
  "demonstrate","department","description","determination","development","dictionary",
  "difference","difficulty","dimension","disappoint","discipline","discovery","discussion",
  "distinguish","distribute","documentary","economical","efficiency","eliminate","emergency",
  "employment","encourage","engineering","enterprise","enthusiasm","environment","equipment",
  "equivalent","establish","evaluation","eventually","everything","examination","excellence",
  "exceptional","excitement","experience","experiment","explanation","expression","extraordinary",
  "facilitate","fascinating","fundamental","generation","government","guarantee","hypothesis",
  "illustrate","imagination","immediately","immigration","implement","importance","impression",
  "incredible","independent","individual","information","ingredient","innovation","institution",
  "instrument","intelligent","interaction","interesting","interpret","introduction","investigate",
  "journalism","justification","kindergarten","knowledge","laboratory","leadership","legislation",
  "literature","magnificent","manufacture","mathematics","measurement","mechanical","membership",
  "metropolitan","microscope","millennium","misunderstand","motivation","mysterious","narrative",
  "necessarily","negotiation","neighborhood","nevertheless","observation","occasionally",
  "opportunity","organization","orientation","outstanding","overwhelming","participant",
  "particularly","partnership","performance","permanently","personality","perspective",
  "phenomenon","philosophy","photograph","possibility","practically","presentation","presumably",
  "probability","professional","programming","progression","psychology","publication",
  "qualification","questionnaire","reasonable","recognition","recommendation","relationship",
  "remarkable","representative","requirement","responsible","revolutionary","satisfaction",
  "scholarship","significant","sophisticated","specifically","spectacular","strengthen",
  "subsequently","substantial","successfully","surrounding","sustainability","temperature",
  "theoretical","traditional","transformation","transportation","tremendous","ultimately",
  "understanding","unfortunately","university","unnecessary","vulnerability","widespread"
];

const QUOTES = [
  "the quick brown fox jumps over the lazy dog",
  "to be or not to be that is the question",
  "all that glitters is not gold",
  "a journey of a thousand miles begins with a single step",
  "in the middle of difficulty lies opportunity",
  "the only way to do great work is to love what you do",
  "life is what happens when you are busy making other plans",
  "be the change that you wish to see in the world",
  "the greatest glory in living lies not in never falling but in rising every time we fall",
  "it does not matter how slowly you go as long as you do not stop",
  "success is not final failure is not fatal it is the courage to continue that counts",
  "believe you can and you are halfway there",
  "the future belongs to those who believe in the beauty of their dreams",
  "it is during our darkest moments that we must focus to see the light",
  "do not go where the path may lead go instead where there is no path and leave a trail",
  "spread love everywhere you go let no one ever come to you without leaving happier",
  "the best time to plant a tree was twenty years ago the second best time is now",
  "your time is limited so do not waste it living someone else life",
  "if life were predictable it would cease to be life and be without flavor",
  "many of life failures are people who did not realize how close they were to success when they gave up",
  "you miss one hundred percent of the shots you do not take",
  "whether you think you can or you think you cannot you are right",
  "i have learned over the years that when one mind is made up this diminishes fear",
  "the mind is everything what you think you become",
  "an unexamined life is not worth living",
  "everything you have ever wanted is on the other side of fear",
  "happiness is not something readymade it comes from your own actions",
  "do what you can with all you have wherever you are",
  "you are never too old to set another goal or to dream a new dream",
  "only a life lived for others is a life worthwhile",
];

const NUMBERS_SYMBOLS_WORDS = [
  "test123","hello@world","price$50","100%","user_name","file.txt","https://","v2.0",
  "node.js","c++","x=42","a&b","3.14","#1","key:value","[array]","{object}","true/false",
  "yes|no","2024","item#7","$19.99","50%off","email@test","path/to/file","root@admin",
  "port:8080","v1.2.3","max=100","min=0","id_123","data-set","config.json","api/v2",
  "rgb(255,0,0)","width:100px","font-size:16","margin:0","padding:10px","border:1px",
  "index.html","style.css","app.tsx","readme.md","package.json","tsconfig","webpack",
  "localhost:3000","127.0.0.1","192.168.1.1","git@hub","npm:install","yarn:add",
  "chmod:755","sudo:rm","grep:find","awk:print","sed:replace","curl:get","ssh:connect",
  "docker:run","kubectl:apply","terraform:plan","ansible:play","jenkins:build",
];

/* ─── types ─── */
type WordMode = "common" | "extended" | "quotes" | "numbers";
type TimeMode = 15 | 30 | 60 | 120;
type TestState = "idle" | "running" | "finished";

interface WpmSample {
  time: number;
  wpm: number;
}

interface TestResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correct: number;
  errors: number;
  total: number;
  samples: WpmSample[];
  timeMode: TimeMode;
  wordMode: WordMode;
}

/* ─── helpers ─── */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateWords(mode: WordMode, count: number): string {
  let pool: string[];
  switch (mode) {
    case "common": pool = COMMON_WORDS; break;
    case "extended": pool = EXTENDED_WORDS; break;
    case "quotes": {
      const shuffled = shuffle(QUOTES);
      let result = "";
      let i = 0;
      while (result.split(" ").length < count) {
        result += (result ? " " : "") + shuffled[i % shuffled.length];
        i++;
      }
      return result;
    }
    case "numbers": pool = NUMBERS_SYMBOLS_WORDS; break;
  }
  const words: string[] = [];
  const shuffled = shuffle(pool);
  for (let i = 0; i < count; i++) {
    words.push(shuffled[i % shuffled.length]);
  }
  return words.join(" ");
}

function getPercentile(wpm: number): number {
  if (wpm >= 120) return 99;
  if (wpm >= 100) return 98;
  if (wpm >= 80) return 95;
  if (wpm >= 70) return 90;
  if (wpm >= 60) return 82;
  if (wpm >= 50) return 70;
  if (wpm >= 40) return 55;
  if (wpm >= 30) return 35;
  if (wpm >= 20) return 15;
  return 5;
}

function getBestKey(timeMode: TimeMode, wordMode: WordMode) {
  return `typing-test-best-${timeMode}-${wordMode}`;
}

/* ─── WPM Chart (Canvas) ─── */
function WpmChart({ samples, height = 160 }: { samples: WpmSample[]; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || samples.length < 2) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    const maxWpm = Math.max(...samples.map((s) => s.wpm), 20);
    const pad = { top: 20, right: 20, bottom: 30, left: 45 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    ctx.clearRect(0, 0, w, h);

    // grid lines
    ctx.strokeStyle = "#3f3f46";
    ctx.lineWidth = 0.5;
    const yTicks = 5;
    for (let i = 0; i <= yTicks; i++) {
      const y = pad.top + (plotH / yTicks) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillStyle = "#71717a";
      ctx.font = "11px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(Math.round(maxWpm * (1 - i / yTicks)).toString(), pad.left - 6, y + 4);
    }

    // x-axis labels
    ctx.fillStyle = "#71717a";
    ctx.textAlign = "center";
    const maxTime = samples[samples.length - 1].time;
    const xTicks = Math.min(samples.length, 6);
    for (let i = 0; i <= xTicks; i++) {
      const t = Math.round((maxTime / xTicks) * i);
      const x = pad.left + (plotW / xTicks) * i;
      ctx.fillText(`${t}s`, x, h - 8);
    }

    // line
    ctx.strokeStyle = "#3b82f6";
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    samples.forEach((s, i) => {
      const x = pad.left + (s.time / maxTime) * plotW;
      const y = pad.top + plotH - (s.wpm / maxWpm) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // gradient fill
    const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + plotH);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.25)");
    gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
    ctx.lineTo(pad.left + plotW, pad.top + plotH);
    ctx.lineTo(pad.left, pad.top + plotH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // dots
    ctx.fillStyle = "#3b82f6";
    samples.forEach((s) => {
      const x = pad.left + (s.time / maxTime) * plotW;
      const y = pad.top + plotH - (s.wpm / maxWpm) * plotH;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [samples, height]);

  if (samples.length < 2) return null;
  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: `${height}px` }}
      className="rounded-lg"
    />
  );
}

/* ─── Main Component ─── */
export default function TypingSpeedTestPage() {
  const [wordMode, setWordMode] = useState<WordMode>("common");
  const [timeMode, setTimeMode] = useState<TimeMode>(30);
  const [testState, setTestState] = useState<TestState>("idle");
  const [text, setText] = useState(() => generateWords("common", 200));
  const [cursorPos, setCursorPos] = useState(0);
  const [errors, setErrors] = useState<Set<number>>(new Set());
  const [correctChars, setCorrectChars] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(30);
  const [result, setResult] = useState<TestResult | null>(null);
  const [personalBests, setPersonalBests] = useState<Record<string, number>>({});
  const [liveWpm, setLiveWpm] = useState(0);

  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const wpmTimerRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const samplesRef = useRef<WpmSample[]>([]);
  const correctCountRef = useRef(0);
  const totalKeystrokesRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const textDisplayRef = useRef<HTMLDivElement>(null);
  const tabPressedRef = useRef(false);

  // load personal bests
  useEffect(() => {
    const bests: Record<string, number> = {};
    const modes: WordMode[] = ["common", "extended", "quotes", "numbers"];
    const times: TimeMode[] = [15, 30, 60, 120];
    modes.forEach((wm) => {
      times.forEach((tm) => {
        const key = getBestKey(tm, wm);
        const val = localStorage.getItem(key);
        if (val) bests[key] = parseInt(val, 10);
      });
    });
    setPersonalBests(bests);
  }, []);

  const currentBestKey = getBestKey(timeMode, wordMode);
  const currentBest = personalBests[currentBestKey] ?? 0;

  const resetTest = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(wpmTimerRef.current);
    setTestState("idle");
    setCursorPos(0);
    setErrors(new Set());
    setCorrectChars(new Set());
    setTimeLeft(timeMode);
    setResult(null);
    setLiveWpm(0);
    samplesRef.current = [];
    correctCountRef.current = 0;
    totalKeystrokesRef.current = 0;
    startTimeRef.current = 0;
    setText(generateWords(wordMode, 200));
    setTimeout(() => hiddenInputRef.current?.focus(), 50);
  }, [timeMode, wordMode]);

  // reset on mode change
  useEffect(() => {
    resetTest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeMode, wordMode]);

  const finishTest = useCallback(() => {
    clearInterval(timerRef.current);
    clearInterval(wpmTimerRef.current);
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const minutes = elapsed / 60;
    const correctWords = correctCountRef.current / 5;
    const rawWords = totalKeystrokesRef.current / 5;
    const wpm = Math.round(correctWords / minutes);
    const rawWpm = Math.round(rawWords / minutes);
    const total = correctCountRef.current + errors.size;
    const accuracy = total > 0 ? Math.round((correctCountRef.current / total) * 100) : 100;

    const res: TestResult = {
      wpm,
      rawWpm,
      accuracy,
      correct: correctCountRef.current,
      errors: errors.size,
      total,
      samples: samplesRef.current,
      timeMode,
      wordMode,
    };
    setResult(res);
    setTestState("finished");

    // save personal best
    const bestKey = getBestKey(timeMode, wordMode);
    const prevBest = parseInt(localStorage.getItem(bestKey) || "0", 10);
    if (wpm > prevBest) {
      localStorage.setItem(bestKey, wpm.toString());
      setPersonalBests((prev) => ({ ...prev, [bestKey]: wpm }));
    }
  }, [errors.size, timeMode, wordMode]);

  const startTest = useCallback(() => {
    startTimeRef.current = Date.now();
    setTestState("running");
    setTimeLeft(timeMode);

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const remaining = timeMode - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        finishTest();
      } else {
        setTimeLeft(remaining);
      }
    }, 100);

    wpmTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      if (elapsed > 0) {
        const wpm = Math.round((correctCountRef.current / 5) / (elapsed / 60));
        setLiveWpm(wpm);
        samplesRef.current.push({ time: Math.round(elapsed), wpm });
      }
    }, 1000);
  }, [timeMode, finishTest]);

  // scroll text display to keep cursor visible
  useEffect(() => {
    if (!textDisplayRef.current) return;
    const cursorEl = textDisplayRef.current.querySelector("[data-cursor]");
    if (cursorEl) {
      const container = textDisplayRef.current;
      const cursorRect = cursorEl.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      if (cursorRect.top < containerRect.top || cursorRect.bottom > containerRect.bottom) {
        cursorEl.scrollIntoView({ block: "center", behavior: "auto" });
      }
    }
  }, [cursorPos]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        tabPressedRef.current = true;
        setTimeout(() => { tabPressedRef.current = false; }, 1000);
        return;
      }

      if (e.key === "Enter" && tabPressedRef.current) {
        e.preventDefault();
        tabPressedRef.current = false;
        resetTest();
        return;
      }

      if (testState === "finished") {
        return;
      }

      // Ignore modifier keys
      if (["Shift", "Control", "Alt", "Meta", "CapsLock", "Escape", "Tab"].includes(e.key)) return;

      e.preventDefault();

      if (testState === "idle" && e.key.length === 1) {
        startTest();
      }

      if (e.key === "Backspace") {
        if (cursorPos > 0) {
          const newPos = cursorPos - 1;
          setCursorPos(newPos);
          setErrors((prev) => {
            const next = new Set(prev);
            next.delete(newPos);
            return next;
          });
          setCorrectChars((prev) => {
            const next = new Set(prev);
            if (next.has(newPos)) {
              correctCountRef.current--;
            }
            next.delete(newPos);
            return next;
          });
        }
        return;
      }

      if (e.key.length !== 1) return;

      totalKeystrokesRef.current++;

      if (e.key === text[cursorPos]) {
        correctCountRef.current++;
        setCorrectChars((prev) => new Set(prev).add(cursorPos));
      } else {
        setErrors((prev) => new Set(prev).add(cursorPos));
      }
      setCursorPos((p) => Math.min(p + 1, text.length - 1));
    },
    [testState, cursorPos, text, startTest, resetTest]
  );

  const liveAccuracy = useMemo(() => {
    const total = correctChars.size + errors.size;
    if (total === 0) return 100;
    return Math.round((correctChars.size / total) * 100);
  }, [correctChars.size, errors.size]);

  const focusInput = useCallback(() => {
    hiddenInputRef.current?.focus();
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(wpmTimerRef.current);
    };
  }, []);

  const timeModes: TimeMode[] = [15, 30, 60, 120];
  const wordModes: { key: WordMode; label: string }[] = [
    { key: "common", label: "Common" },
    { key: "extended", label: "Extended" },
    { key: "quotes", label: "Quotes" },
    { key: "numbers", label: "Numbers" },
  ];

  return (
    <ToolLayout
      title="Typing Speed Test"
      description="Test your typing speed and accuracy. See your WPM, track progress over time, and compare against average speeds."
      slug="typing-speed-test"
      category="Utility"
      keywords={[
        "typing speed test",
        "typing test",
        "wpm test",
        "typing speed",
        "words per minute test",
        "typing practice",
        "typing speed test online",
        "free typing test",
        "keyboard speed test",
        "typing test online",
      ]}
      relatedTools={[
        { name: "Character Counter", href: "/tools/character-counter" },
        { name: "Word Counter", href: "/tools/word-counter" },
        { name: "Text Case Converter", href: "/tools/text-case-converter" },
        { name: "Stopwatch", href: "/tools/stopwatch" },
      ]}
      faqs={[
        {
          question: "What is a good typing speed?",
          answer:
            "A good typing speed for casual typists is around 40-50 WPM. Professional typists typically reach 65-75 WPM, while expert typists can exceed 100 WPM. For most office jobs, 50-60 WPM is considered proficient.",
        },
        {
          question: "How is WPM calculated?",
          answer:
            "WPM (Words Per Minute) is calculated by dividing the total number of characters typed by 5 (the standard word length) and then dividing by the time elapsed in minutes. Net WPM subtracts errors, while gross/raw WPM counts all keystrokes.",
        },
        {
          question: "What is the average typing speed?",
          answer:
            "The average typing speed is approximately 40 WPM for casual computer users. Students and professionals who type regularly average around 50-60 WPM. Touch typists who have practiced typically reach 60-80 WPM.",
        },
        {
          question: "How can I type faster?",
          answer:
            "To improve your typing speed: learn touch typing (using all fingers without looking), practice daily for at least 15 minutes, focus on accuracy first then speed, use proper posture, and take typing tests regularly to track progress.",
        },
        {
          question: "What is the difference between gross WPM and net WPM?",
          answer:
            "Gross (raw) WPM counts all keystrokes you make divided by 5, regardless of accuracy. Net WPM only counts correctly typed characters divided by 5. Net WPM gives a more accurate representation of your effective typing speed.",
        },
        {
          question: "Is 40 WPM good?",
          answer:
            "40 WPM is around average for casual typists and is adequate for most general computer use. However, for professional roles that involve heavy typing, you would benefit from improving to 50-60+ WPM. With practice, most people can reach this level.",
        },
        {
          question: "What is the fastest typing speed ever recorded?",
          answer:
            "The fastest typing speed ever recorded is 216 WPM, achieved by Stella Pajunas in 1946 on an IBM electric typewriter. In modern times, competitive typists on platforms like TypeRacer and Monkeytype regularly exceed 150-200 WPM in short bursts.",
        },
        {
          question: "How accurate should I be when typing?",
          answer:
            "You should aim for at least 95% accuracy, with 97-99% being ideal. High accuracy is more important than raw speed because errors slow you down with corrections. Focus on accuracy first; speed will naturally follow with practice.",
        },
      ]}
      guide={
        <>
          <section>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Typing Speed Benchmarks</h3>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li><strong className="text-zinc-300">Beginner:</strong> Under 30 WPM - hunt-and-peck typists</li>
              <li><strong className="text-zinc-300">Average:</strong> 35-45 WPM - most casual computer users</li>
              <li><strong className="text-zinc-300">Intermediate:</strong> 45-60 WPM - comfortable with touch typing</li>
              <li><strong className="text-zinc-300">Proficient:</strong> 60-80 WPM - fast and accurate typist</li>
              <li><strong className="text-zinc-300">Advanced:</strong> 80-100 WPM - professional-level speed</li>
              <li><strong className="text-zinc-300">Expert:</strong> 100+ WPM - competitive typist territory</li>
            </ul>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">How WPM Is Measured</h3>
            <p className="text-zinc-400 mb-2">
              Words per minute uses a standardized &quot;word&quot; length of 5 characters (including spaces).
              This normalizes for different word lengths across languages and texts.
            </p>
            <p className="text-zinc-400">
              <strong className="text-zinc-300">Net WPM</strong> = ((All Correct Characters / 5) / Time in Minutes).
              <strong className="text-zinc-300"> Raw WPM</strong> = ((All Typed Characters / 5) / Time in Minutes).
              Net WPM is the standard measure used for comparison.
            </p>
          </section>
          <section>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">Tips to Improve Your Speed</h3>
            <ol className="list-decimal list-inside space-y-1 text-zinc-400">
              <li>Learn proper finger placement on the home row (ASDF JKL;)</li>
              <li>Never look at the keyboard while typing</li>
              <li>Practice consistently for 15-20 minutes daily</li>
              <li>Focus on accuracy over speed - speed follows naturally</li>
              <li>Use all ten fingers and minimize hand movement</li>
              <li>Maintain good posture with relaxed wrists</li>
              <li>Practice with different text types to build versatility</li>
            </ol>
          </section>
        </>
      }
    >
      <div className="space-y-6">
        {/* Mode selectors */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Time mode */}
          <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1">
            {timeModes.map((t) => (
              <button
                key={t}
                onClick={() => setTimeMode(t)}
                disabled={testState === "running"}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeMode === t
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                } disabled:opacity-50`}
              >
                {t}s
              </button>
            ))}
          </div>

          {/* Word mode */}
          <div className="flex items-center gap-1 bg-zinc-800/50 rounded-lg p-1">
            {wordModes.map((m) => (
              <button
                key={m.key}
                onClick={() => setWordMode(m.key)}
                disabled={testState === "running"}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  wordMode === m.key
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50"
                } disabled:opacity-50`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Personal best */}
          {currentBest > 0 && (
            <div className="ml-auto text-sm text-zinc-500">
              Personal best: <span className="text-yellow-500 font-semibold">{currentBest} WPM</span>
            </div>
          )}
        </div>

        {/* Live stats bar */}
        {testState === "running" && (
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Time</span>
              <span className={`font-mono text-xl font-bold ${timeLeft <= 5 ? "text-red-400" : "text-zinc-100"}`}>
                {timeLeft}s
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">WPM</span>
              <span className="font-mono text-xl font-bold text-blue-400">{liveWpm}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Accuracy</span>
              <span className={`font-mono text-xl font-bold ${liveAccuracy >= 95 ? "text-green-400" : liveAccuracy >= 85 ? "text-yellow-400" : "text-red-400"}`}>
                {liveAccuracy}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500">Chars</span>
              <span className="font-mono text-zinc-300">{correctChars.size}<span className="text-zinc-600">/</span><span className="text-red-400">{errors.size}</span></span>
            </div>
          </div>
        )}

        {/* Test area */}
        {testState !== "finished" ? (
          <div
            ref={containerRef}
            onClick={focusInput}
            className="relative bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-6 cursor-text min-h-[180px] focus-within:border-blue-500/50 transition-colors"
          >
            {/* Hidden input for mobile keyboard + focus */}
            <input
              ref={hiddenInputRef}
              type="text"
              className="absolute opacity-0 w-0 h-0"
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Typing test input"
              autoFocus
            />

            {/* Idle prompt */}
            {testState === "idle" && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="text-zinc-500 text-lg animate-pulse">
                  Click here or start typing...
                </div>
              </div>
            )}

            {/* Text display */}
            <div
              ref={textDisplayRef}
              className={`text-xl md:text-2xl leading-relaxed font-mono select-none overflow-hidden max-h-[8.5rem] ${
                testState === "idle" ? "blur-[2px]" : ""
              }`}
              style={{ wordBreak: "break-word", transition: "filter 0.2s" }}
            >
              {text.split("").map((char, i) => {
                const isCurrent = i === cursorPos;
                const isCorrect = correctChars.has(i);
                const isError = errors.has(i);
                const isTyped = i < cursorPos;

                let className = "transition-colors duration-75 ";
                if (isError) {
                  className += "text-red-400 bg-red-500/20 rounded-sm";
                } else if (isCorrect) {
                  className += "text-green-400";
                } else if (isTyped) {
                  className += "text-zinc-400";
                } else {
                  className += "text-zinc-500";
                }

                return (
                  <span
                    key={i}
                    className={className}
                    data-cursor={isCurrent ? "true" : undefined}
                    style={
                      isCurrent
                        ? {
                            borderLeft: "2px solid #3b82f6",
                            animation: "cursor-blink 1s step-end infinite",
                            marginLeft: "-1px",
                            paddingLeft: "1px",
                          }
                        : undefined
                    }
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          </div>
        ) : null}

        {/* Results screen */}
        {testState === "finished" && result && (
          <div className="space-y-6">
            {/* Main stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-5 text-center">
                <div className="text-zinc-500 text-sm mb-1">Net WPM</div>
                <div className="text-4xl font-bold text-blue-400 font-mono">{result.wpm}</div>
              </div>
              <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-5 text-center">
                <div className="text-zinc-500 text-sm mb-1">Raw WPM</div>
                <div className="text-4xl font-bold text-zinc-300 font-mono">{result.rawWpm}</div>
              </div>
              <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-5 text-center">
                <div className="text-zinc-500 text-sm mb-1">Accuracy</div>
                <div className={`text-4xl font-bold font-mono ${result.accuracy >= 95 ? "text-green-400" : result.accuracy >= 85 ? "text-yellow-400" : "text-red-400"}`}>
                  {result.accuracy}%
                </div>
              </div>
              <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-5 text-center">
                <div className="text-zinc-500 text-sm mb-1">Characters</div>
                <div className="text-2xl font-bold font-mono">
                  <span className="text-green-400">{result.correct}</span>
                  <span className="text-zinc-600">/</span>
                  <span className="text-red-400">{result.errors}</span>
                </div>
                <div className="text-zinc-500 text-xs mt-1">{result.total} total</div>
              </div>
            </div>

            {/* Percentile + personal best */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 flex-1 text-center">
                <span className="text-zinc-400">Faster than ~</span>
                <span className="text-2xl font-bold text-blue-400 mx-1">{getPercentile(result.wpm)}%</span>
                <span className="text-zinc-400">of people</span>
              </div>
              {currentBest > 0 && (
                <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-4 flex-1 text-center">
                  <span className="text-zinc-400">Personal best: </span>
                  <span className="text-2xl font-bold text-yellow-500 mx-1">{currentBest} WPM</span>
                  {result.wpm >= currentBest && result.wpm > 0 && (
                    <span className="text-green-400 text-sm ml-2">New record!</span>
                  )}
                </div>
              )}
            </div>

            {/* WPM over time chart */}
            {result.samples.length >= 2 && (
              <div className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl p-5">
                <div className="text-zinc-400 text-sm mb-3 font-medium">WPM Over Time</div>
                <WpmChart samples={result.samples} height={180} />
              </div>
            )}

            {/* Restart */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={resetTest}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors text-lg"
              >
                Try Again
              </button>
              <span className="text-zinc-600 text-sm">or press Tab + Enter</span>
            </div>
          </div>
        )}

        {/* Restart button when running */}
        {testState === "running" && (
          <div className="flex items-center gap-3">
            <button
              onClick={resetTest}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg transition-colors"
            >
              Restart
            </button>
            <span className="text-zinc-600 text-xs">or press Tab + Enter</span>
          </div>
        )}

        {/* Timer display when idle */}
        {testState === "idle" && (
          <div className="text-center text-zinc-500 text-sm">
            {timeMode} second test &middot; {wordModes.find((m) => m.key === wordMode)?.label} words
          </div>
        )}
      </div>

      {/* Cursor blink animation */}
      <style jsx global>{`
        @keyframes cursor-blink {
          0%, 100% { border-left-color: #3b82f6; }
          50% { border-left-color: transparent; }
        }
      `}</style>
    </ToolLayout>
  );
}
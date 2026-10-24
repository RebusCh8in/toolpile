"use client";
import { useState, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function Page() {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [memory, setMemory] = useState(0);
  const [useDeg, setUseDeg] = useState(true);

  const toRad = (n: number) => useDeg ? (n * Math.PI) / 180 : n;
  const fromRad = (n: number) => useDeg ? (n * 180) / Math.PI : n;

  const handleInput = useCallback((val: string) => {
    if (display === "Error") {
      setDisplay(val);
      setExpression(val);
      return;
    }
    if ("0123456789.".includes(val)) {
      if (display === "0" && val !== ".") {
        setDisplay(val);
        setExpression(prev => (prev === "0" ? val : prev + val));
      } else {
        setDisplay(prev => prev + val);
        setExpression(prev => prev + val);
      }
    } else if ("+-*/".includes(val)) {
      setDisplay("0");
      setExpression(prev => prev + val);
    }
  }, [display]);

  const handleFunction = useCallback((fn: string) => {
    const num = parseFloat(display) || 0;
    let result: number;
    try {
      switch (fn) {
        case "sin": result = Math.sin(toRad(num)); break;
        case "cos": result = Math.cos(toRad(num)); break;
        case "tan": result = Math.tan(toRad(num)); break;
        case "asin": result = fromRad(Math.asin(num)); break;
        case "acos": result = fromRad(Math.acos(num)); break;
        case "atan": result = fromRad(Math.atan(num)); break;
        case "log": result = Math.log10(num); break;
        case "ln": result = Math.log(num); break;
        case "sqrt": result = Math.sqrt(num); break;
        case "cbrt": result = Math.cbrt(num); break;
        case "x2": result = num * num; break;
        case "x3": result = num * num * num; break;
        case "1/x": result = 1 / num; break;
        case "abs": result = Math.abs(num); break;
        case "!": {
          let f = 1; for (let i = 2; i <= Math.round(num); i++) f *= i;
          result = f; break;
        }
        case "pi": result = Math.PI; break;
        case "e": result = Math.E; break;
        case "+/-": result = -num; break;
        case "%": result = num / 100; break;
        case "exp": result = Math.exp(num); break;
        case "10x": result = Math.pow(10, num); break;
        default: result = num;
      }
      if (!isFinite(result)) throw new Error();
      const s = result.toPrecision(10).replace(/\.?0+$/, "");
      setDisplay(s);
      setExpression(s);
    } catch {
      setDisplay("Error");
      setExpression("");
    }
  }, [display, useDeg]);

  const calculate = useCallback(() => {
    try {
      const sanitized = expression.replace(/[^0-9+\-*/.()]/g, "");
      const result = Function(`"use strict"; return (${sanitized})`)();
      if (!isFinite(result)) throw new Error();
      const s = parseFloat(result.toPrecision(10)).toString();
      setDisplay(s);
      setExpression(s);
    } catch {
      setDisplay("Error");
      setExpression("");
    }
  }, [expression]);

  const clear = () => { setDisplay("0"); setExpression(""); };
  const backspace = () => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : "0");
    setExpression(prev => prev.slice(0, -1) || "0");
  };

  const btnCls = "py-3 rounded-lg text-sm font-medium transition-colors";
  const numCls = `${btnCls} bg-zinc-800 text-zinc-100 hover:bg-zinc-700`;
  const opCls = `${btnCls} bg-blue-600/20 text-blue-300 hover:bg-blue-600/30`;
  const fnCls = `${btnCls} bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 text-xs`;

  return (
    <ToolLayout
      title="Scientific Calculator"
      description="Free online scientific calculator with trig, logarithms, powers, memory, and degree/radian modes."
      slug="scientific-calculator"
      category="Utility"
      keywords={["scientific calculator", "calculator online", "math calculator", "trig calculator", "advanced calculator"]}
      faqs={[
        { question: "Does this support order of operations?", answer: "Yes. Multiplication and division are evaluated before addition and subtraction, following standard mathematical order of operations (PEMDAS)." },
        { question: "What is the difference between DEG and RAD?", answer: "DEG (degrees) uses 0-360° for angles. RAD (radians) uses 0-2π. Most everyday calculations use degrees. Switch to radians for calculus or physics." },
      ]}
      relatedTools={[
        { name: "Percentage Calculator", href: "/tools/percentage-calculator" },
        { name: "Unit Converter", href: "/tools/unit-converter" },
      ]}
    >
      <div className="max-w-md mx-auto space-y-3">
        {/* Display */}
        <div className="bg-zinc-800/50 border border-zinc-700 rounded-xl p-4">
          <p className="text-xs text-zinc-500 h-5 text-right font-mono">{expression || " "}</p>
          <p className="text-4xl font-mono font-bold text-blue-400 text-right truncate">{display}</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2">
          <button onClick={() => setUseDeg(true)} className={`flex-1 py-1.5 rounded text-xs font-medium ${useDeg ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>DEG</button>
          <button onClick={() => setUseDeg(false)} className={`flex-1 py-1.5 rounded text-xs font-medium ${!useDeg ? "bg-blue-600 text-white" : "bg-zinc-800 text-zinc-400"}`}>RAD</button>
          <button onClick={() => setMemory(parseFloat(display) || 0)} className={`${fnCls} flex-1`}>MS</button>
          <button onClick={() => { setDisplay(memory.toString()); setExpression(memory.toString()); }} className={`${fnCls} flex-1`}>MR</button>
          <button onClick={() => setMemory(0)} className={`${fnCls} flex-1`}>MC</button>
        </div>

        {/* Scientific functions */}
        <div className="grid grid-cols-5 gap-1.5">
          {[
            ["sin", "cos", "tan", "log", "ln"],
            ["asin", "acos", "atan", "exp", "10x"],
            ["x2", "x3", "sqrt", "cbrt", "!"],
            ["pi", "e", "1/x", "abs", "%"],
          ].map(row => row.map(fn => (
            <button key={fn} onClick={() => handleFunction(fn)} className={fnCls}>
              {fn === "x2" ? "x²" : fn === "x3" ? "x³" : fn === "sqrt" ? "√" : fn === "cbrt" ? "∛" : fn === "pi" ? "π" : fn === "1/x" ? "1/x" : fn === "10x" ? "10ˣ" : fn === "exp" ? "eˣ" : fn}
            </button>
          )))}
        </div>

        {/* Number pad */}
        <div className="grid grid-cols-4 gap-1.5">
          <button onClick={clear} className={`${btnCls} bg-red-600/20 text-red-300 hover:bg-red-600/30`}>C</button>
          <button onClick={() => handleInput("(")} className={opCls}>(</button>
          <button onClick={() => handleInput(")")} className={opCls}>)</button>
          <button onClick={() => handleInput("/")} className={opCls}>÷</button>

          {["7", "8", "9"].map(n => <button key={n} onClick={() => handleInput(n)} className={numCls}>{n}</button>)}
          <button onClick={() => handleInput("*")} className={opCls}>×</button>

          {["4", "5", "6"].map(n => <button key={n} onClick={() => handleInput(n)} className={numCls}>{n}</button>)}
          <button onClick={() => handleInput("-")} className={opCls}>−</button>

          {["1", "2", "3"].map(n => <button key={n} onClick={() => handleInput(n)} className={numCls}>{n}</button>)}
          <button onClick={() => handleInput("+")} className={opCls}>+</button>

          <button onClick={() => handleFunction("+/-")} className={numCls}>±</button>
          <button onClick={() => handleInput("0")} className={numCls}>0</button>
          <button onClick={() => handleInput(".")} className={numCls}>.</button>
          <button onClick={calculate} className={`${btnCls} bg-blue-600 text-white hover:bg-blue-500`}>=</button>

          <button onClick={backspace} className={`${fnCls} col-span-4`}>← Backspace</button>
        </div>
      </div>
    </ToolLayout>
  );
}

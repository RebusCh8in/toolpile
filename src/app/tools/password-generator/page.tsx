"use client";

import { useState, useCallback, useEffect } from "react";
import ToolLayout, { FAQ, RelatedTool } from "@/components/ToolLayout";
import CopyButton from "@/components/CopyButton";

const faqs: FAQ[] = [
  {
    question: "How do I generate a strong password?",
    answer: "Use this tool to create a password with at least 16 characters that includes uppercase letters, lowercase letters, numbers, and symbols. The strength meter will confirm when your settings produce a strong or very strong password."
  },
  {
    question: "Is this password generator safe to use?",
    answer: "Yes. Passwords are generated using the Web Crypto API (crypto.getRandomValues), which provides cryptographically secure random numbers. No passwords are stored or transmitted — everything runs locally in your browser."
  },
  {
    question: "What makes a password strong?",
    answer: "A strong password is long (12+ characters), uses a mix of character types (upper, lower, numbers, symbols), and avoids dictionary words or personal information. This generator handles all of that automatically."
  },
  {
    question: "Can I generate multiple passwords at once?",
    answer: "Yes. Use the Bulk Generate section to create 5, 10, or 20 passwords at once with your current settings. You can copy them all at once or copy individual passwords."
  },
  {
    question: "What does Exclude Ambiguous Characters mean?",
    answer: "Ambiguous characters are ones that look similar in many fonts, like 0 and O, 1 and l and I. Excluding them makes passwords easier to read and type manually, which is useful when you need to enter a password on a different device."
  },
  {
    question: "How long should my password be?",
    answer: "For most accounts, 16 characters is a strong minimum. For high-security accounts like banking or email, consider 20 or more characters. This tool supports passwords up to 128 characters long."
  }
]

const relatedTools: RelatedTool[] = [
  { name: "UUID Generator", href: "/tools/uuid-generator" },
  { name: "Base64 Encoder", href: "/tools/base64-encoder" },
  { name: "QR Code Generator", href: "/tools/qr-code-generator" }
]

const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const LOWER = "abcdefghijklmnopqrstuvwxyz";
const NUMBERS = "0123456789";
const SYMBOLS = "!@#$%^&*()_+-=[]{}|;:,.<>?";
const AMBIGUOUS = "0O1lI";

function generatePassword(
  length: number,
  opts: { upper: boolean; lower: boolean; numbers: boolean; symbols: boolean; excludeAmbiguous: boolean }
): string {
  let chars = "";
  if (opts.upper) chars += UPPER;
  if (opts.lower) chars += LOWER;
  if (opts.numbers) chars += NUMBERS;
  if (opts.symbols) chars += SYMBOLS;
  if (opts.excludeAmbiguous) {
    chars = chars.split("").filter((c) => !AMBIGUOUS.includes(c)).join("");
  }
  if (!chars) return "";
  const arr = new Uint32Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (v) => chars[v % chars.length]).join("");
}

function getStrength(pw: string): { label: string; score: number; color: string } {
  if (!pw) return { label: "None", score: 0, color: "bg-zinc-700" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 20) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 2) return { label: "Weak", score: 1, color: "bg-red-500" };
  if (score <= 3) return { label: "Fair", score: 2, color: "bg-yellow-500" };
  if (score <= 4) return { label: "Strong", score: 3, color: "bg-blue-500" };
  return { label: "Very Strong", score: 4, color: "bg-green-500" };
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true);
  const [lower, setLower] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false);
  const [password, setPassword] = useState("");
  const [bulkPasswords, setBulkPasswords] = useState<string[]>([]);
  const [bulkCount, setBulkCount] = useState(5);

  const gen = useCallback(() => {
    const pw = generatePassword(length, { upper, lower, numbers, symbols, excludeAmbiguous });
    setPassword(pw);
    setBulkPasswords([]);
  }, [length, upper, lower, numbers, symbols, excludeAmbiguous]);

  useEffect(() => { gen(); }, [gen]);

  const genBulk = () => {
    const pws = Array.from({ length: bulkCount }, () =>
      generatePassword(length, { upper, lower, numbers, symbols, excludeAmbiguous })
    );
    setBulkPasswords(pws);
  };

  const strength = getStrength(password);

  return (
    <ToolLayout
      title="Password Generator"
      description="Generate strong, secure passwords with customizable options including length, character types, and bulk generation."
      category="Utility"
      slug="password-generator"
      faqs={faqs}
      relatedTools={relatedTools}
      keywords={[
        "password generator",
        "strong password generator",
        "random password generator",
        "secure password generator",
        "bulk password generator",
        "password generator online free",
        "generate random password"
      ]}
      guide={
        <>
          <h2>What Is the Password Generator?</h2>
          <p>
            The Password Generator creates cryptographically secure random passwords using the Web Crypto API built into your browser. You can customize the length, choose which character types to include, exclude ambiguous characters, and generate passwords in bulk.
          </p>
          <p>
            No passwords are stored or transmitted anywhere. Everything runs locally in your browser, and each password is generated using a cryptographically secure random number generator — the same standard used by password managers and security applications.
          </p>

          <h3>How to Generate a Secure Password</h3>
          <p>Follow these steps to create a strong password:</p>
          <ul>
            <li>Set your desired password length using the slider (4 to 128 characters). A minimum of 16 characters is recommended for most accounts.</li>
            <li>Select which character types to include: uppercase letters, lowercase letters, numbers, and symbols.</li>
            <li>Optionally check Exclude Ambiguous Characters to avoid characters like 0/O and 1/l/I that are easily confused.</li>
            <li>Click Regenerate or refresh the page to get a new password with the same settings.</li>
            <li>Click Copy to copy the password to your clipboard.</li>
          </ul>

          <h3>Understanding the Strength Meter</h3>
          <p>
            The strength meter evaluates your password based on length and character diversity. It rates passwords as Weak, Fair, Strong, or Very Strong. To reach Very Strong, use at least 20 characters with a mix of all four character types (uppercase, lowercase, numbers, and symbols).
          </p>

          <h3>Bulk Password Generation</h3>
          <p>
            Need multiple passwords at once? Use the Bulk Generate section to create 5, 10, or 20 passwords in a single click. All generated passwords use your current settings. You can copy individual passwords or copy all of them at once as a newline-separated list.
          </p>

          <h3>Tips for Password Security</h3>
          <ul>
            <li>Use a unique password for every account. Never reuse passwords across different services.</li>
            <li>Store your passwords in a password manager rather than writing them down or saving them in a text file.</li>
            <li>For accounts that support it, enable two-factor authentication in addition to using a strong password.</li>
            <li>If you need to type a password manually (for example, on a TV or game console), use Exclude Ambiguous Characters to avoid confusion.</li>
          </ul>

          <h3>Common Use Cases</h3>
          <ul>
            <li>Creating strong passwords for new online accounts.</li>
            <li>Generating API keys and tokens for development environments.</li>
            <li>Bulk generating temporary passwords for team onboarding.</li>
            <li>Creating database passwords and server credentials.</li>
          </ul>
        </>
      }
    >
      <div className="space-y-6">
        {/* Generated password */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-3">
            <code className="flex-1 break-all rounded-lg bg-zinc-800 px-4 py-3 font-mono text-lg text-zinc-100">
              {password || "Select at least one option"}
            </code>
            <CopyButton text={password} />
            <button onClick={gen} className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-600 transition-colors">
              Regenerate
            </button>
          </div>

          {/* Strength meter */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-zinc-400">Strength</span>
              <span className="text-xs text-zinc-400">{strength.label}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800">
              <div
                className={`h-2 rounded-full transition-all ${strength.color}`}
                style={{ width: `${(strength.score / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Length: {length}
            </label>
            <input
              type="range"
              min={4}
              max={128}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>4</span>
              <span>128</span>
            </div>
          </div>

          <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900 p-4">
            {[
              { label: "Uppercase (A-Z)", checked: upper, set: setUpper },
              { label: "Lowercase (a-z)", checked: lower, set: setLower },
              { label: "Numbers (0-9)", checked: numbers, set: setNumbers },
              { label: "Symbols (!@#$...)", checked: symbols, set: setSymbols },
              { label: "Exclude Ambiguous (0O1lI)", checked: excludeAmbiguous, set: setExcludeAmbiguous },
            ].map((opt) => (
              <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={opt.checked}
                  onChange={(e) => opt.set(e.target.checked)}
                  className="accent-blue-500"
                />
                <span className="text-sm text-zinc-300">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Bulk generate */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-sm font-medium text-zinc-300">Bulk Generate</h3>
            <select
              value={bulkCount}
              onChange={(e) => setBulkCount(Number(e.target.value))}
              className="rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-100 outline-none focus:border-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <button
              onClick={genBulk}
              className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-500 transition-colors"
            >
              Generate
            </button>
            {bulkPasswords.length > 0 && (
              <CopyButton text={bulkPasswords.join("\n")} label="Copy All" />
            )}
          </div>
          {bulkPasswords.length > 0 && (
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {bulkPasswords.map((pw, i) => (
                <div key={i} className="flex items-center gap-2 rounded bg-zinc-800 px-3 py-1.5">
                  <code className="flex-1 break-all text-xs font-mono text-zinc-300">{pw}</code>
                  <CopyButton text={pw} label="Copy" className="text-xs px-2 py-1" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ToolLayout>
  );
}

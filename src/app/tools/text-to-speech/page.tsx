"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

interface Voice {
  voice: SpeechSynthesisVoice;
  label: string;
}

export default function TextToSpeechPage() {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      const available = speechSynthesis.getVoices();
      const mapped = available.map((v) => ({
        voice: v,
        label: `${v.name} (${v.lang})`,
      }));
      setVoices(mapped);
      if (mapped.length > 0 && !selectedVoice) {
        const english = mapped.find((v) => v.voice.lang.startsWith("en") && v.voice.default);
        setSelectedVoice((english || mapped[0]).voice.name);
      }
    };
    loadVoices();
    speechSynthesis.onvoiceschanged = loadVoices;
    return () => { speechSynthesis.onvoiceschanged = null; };
  }, [selectedVoice]);

  const speak = useCallback(() => {
    if (!text.trim()) return;
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = voices.find((v) => v.voice.name === selectedVoice);
    if (voice) utterance.voice = voice.voice;
    utterance.rate = rate;
    utterance.pitch = pitch;

    utterance.onstart = () => { setSpeaking(true); setPaused(false); };
    utterance.onend = () => { setSpeaking(false); setPaused(false); };
    utterance.onerror = () => { setSpeaking(false); setPaused(false); };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [text, selectedVoice, voices, rate, pitch]);

  const pause = useCallback(() => {
    speechSynthesis.pause();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    speechSynthesis.resume();
    setPaused(false);
  }, []);

  const stop = useCallback(() => {
    speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
  }, []);

  return (
    <ToolLayout
      title="Text to Speech"
      slug="text-to-speech"
      category="Utility"
      description="Convert text to natural speech using your browser's built-in voices. Multiple languages, adjustable speed and pitch. Free and private."
      faqs={[
        { question:"Is this text to speech tool free?", answer:"Yes. It uses the Web Speech API built into your browser. No server processing, no signup, no limits." },
        { question:"What languages are supported?", answer:"It depends on your browser and operating system. Most support English, Spanish, French, German, Japanese, Chinese, Korean, and many more. The voice dropdown shows all available voices." },
        { question:"Can I download the audio?", answer:"The Web Speech API doesn't support direct audio export. For downloadable audio, you'd need a server-side TTS service. This tool is designed for listening and proofreading." },
        { question:"Why do some voices sound more natural than others?", answer:"Browsers include both basic and premium voices. On macOS and iOS, voices like Samantha and Alex are high quality. On Chrome, Google's voices tend to sound more natural. Premium voices are downloaded on-demand." },
        { question:"Is my text sent to a server?", answer:"No. The Web Speech API processes text locally in your browser. Your text never leaves your device." },
      ]}
      relatedTools={[
        { name: "Image to Text (OCR)", href: "/tools/image-to-text" },
        { name: "Word Counter", href: "/tools/word-counter" },
      ]}
      keywords={["text to speech", "TTS", "read aloud", "speech synthesis", "text reader", "free text to speech"]}
    >
      <div className="space-y-5">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste text here..."
          rows={8}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none resize-y"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Voice</label>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
            >
              {voices.map((v) => (
                <option key={v.voice.name} value={v.voice.name}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Speed: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">
              Pitch: {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="w-full accent-blue-500"
            />
          </div>
        </div>

        <div className="flex gap-3">
          {!speaking ? (
            <button
              onClick={speak}
              disabled={!text.trim()}
              className="flex-1 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold transition-colors"
            >
              Speak
            </button>
          ) : (
            <>
              <button
                onClick={paused ? resume : pause}
                className="flex-1 py-3 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 font-semibold transition-colors"
              >
                {paused ? "Resume" : "Pause"}
              </button>
              <button
                onClick={stop}
                className="flex-1 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors"
              >
                Stop
              </button>
            </>
          )}
        </div>

        <p className="text-xs text-zinc-500 text-center">
          {text.length} characters | ~{Math.ceil(text.split(/\s+/).filter(Boolean).length / 150)} min reading time
        </p>
      </div>
    </ToolLayout>
  );
}

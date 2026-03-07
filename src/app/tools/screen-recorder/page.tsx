"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

type RecordingSource = "screen" | "camera";

export default function ScreenRecorderPage() {
  const [source, setSource] = useState<RecordingSource>("screen");
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [duration, setDuration] = useState(0);
  const [includeAudio, setIncludeAudio] = useState(true);
  const [includeMic, setIncludeMic] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const startRecording = useCallback(async () => {
    setError(null);
    setRecordedUrl(null);
    setRecordedBlob(null);
    chunksRef.current = [];

    try {
      let stream: MediaStream;

      if (source === "screen") {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 30 },
          audio: includeAudio,
        });
      } else {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1920, height: 1080, frameRate: 30 },
          audio: includeAudio,
        });
      }

      // Add microphone if requested
      if (includeMic && source === "screen") {
        try {
          const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          micStream.getAudioTracks().forEach((track) => stream.addTrack(track));
        } catch {
          // Mic not available, continue without
        }
      }

      streamRef.current = stream;

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")
        ? "video/webm;codecs=vp9,opus"
        : MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")
        ? "video/webm;codecs=vp8,opus"
        : "video/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        setRecordedBlob(blob);
        setRecording(false);
        setPaused(false);
        if (timerRef.current) clearInterval(timerRef.current);

        stream.getTracks().forEach((t) => t.stop());
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = null;
        }
      };

      // Stop recording if user stops screen share
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current?.state !== "inactive") {
          mediaRecorderRef.current?.stop();
        }
      };

      recorder.start(1000);
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "NotAllowedError") {
        setError("Permission denied. Please allow screen/camera access.");
      } else {
        setError("Failed to start recording. Make sure your browser supports screen capture.");
      }
    }
  }, [source, includeAudio, includeMic]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current?.stop();
    }
  }, []);

  const togglePause = useCallback(() => {
    if (!mediaRecorderRef.current) return;
    if (mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } else if (mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setPaused(false);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    }
  }, []);

  const download = useCallback(() => {
    if (!recordedBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(recordedBlob);
    a.download = `recording-${Date.now()}.webm`;
    a.click();
  }, [recordedBlob]);

  return (
    <ToolLayout
      title="Screen Recorder"
      slug="screen-recorder"
      category="Utility"
      description="Record your screen, webcam, or both with audio. No upload, no watermark, runs entirely in your browser."
      faqs={[
        { question:"Is this screen recorder free?", answer:"Yes. It runs entirely in your browser using the MediaRecorder API. No upload, no account, no watermark, no time limit." },
        { question:"What format is the recording?", answer:"Recordings are saved in WebM format, which is supported by all modern browsers and video players like VLC. You can convert to MP4 using a video converter if needed." },
        { question:"Can I record audio?", answer:"Yes. You can record system audio (when sharing a tab or screen) and/or your microphone. Enable the options before starting." },
        { question:"Is there a time limit?", answer:"No. Record as long as you want. The recording is stored in memory, so very long recordings (hours) may use significant RAM." },
        { question:"Can I record a specific window or tab?", answer:"Yes. When you click Start Recording, your browser will ask you to choose between your entire screen, a specific window, or a browser tab." },
      ]}
      relatedTools={[
        { name: "Video Compressor", href: "/tools/video-compressor" },
        { name: "Video to GIF", href: "/tools/video-to-gif" },
      ]}
      keywords={["screen recorder", "screen capture", "webcam recorder", "record screen online", "free screen recorder", "browser screen recorder"]}
    >
      <div className="space-y-6">
        {/* Source selection */}
        {!recording && !recordedUrl && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <button
                onClick={() => setSource("screen")}
                className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  source === "screen"
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                Screen / Window / Tab
              </button>
              <button
                onClick={() => setSource("camera")}
                className={`flex-1 py-3 px-4 rounded-lg border text-sm font-medium transition-colors ${
                  source === "camera"
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:border-zinc-500"
                }`}
              >
                Webcam
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeAudio}
                  onChange={(e) => setIncludeAudio(e.target.checked)}
                  className="accent-blue-500"
                />
                Include system audio
              </label>
              {source === "screen" && (
                <label className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeMic}
                    onChange={(e) => setIncludeMic(e.target.checked)}
                    className="accent-blue-500"
                  />
                  Include microphone
                </label>
              )}
            </div>
          </div>
        )}

        {/* Preview / Recording */}
        {recording && (
          <div className="space-y-4">
            <video
              ref={videoPreviewRef}
              muted
              playsInline
              className="w-full rounded-lg bg-black aspect-video"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${paused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`} />
                  <span className="text-sm font-mono text-zinc-300">
                    {paused ? "Paused" : "Recording"} {formatTime(duration)}
                  </span>
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={togglePause}
                  className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm font-medium text-zinc-200 transition-colors"
                >
                  {paused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={stopRecording}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-sm font-medium text-white transition-colors"
                >
                  Stop Recording
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Recorded result */}
        {recordedUrl && (
          <div className="space-y-4">
            <video
              src={recordedUrl}
              controls
              playsInline
              className="w-full rounded-lg bg-black aspect-video"
            />
            <div className="flex items-center justify-between">
              <div className="text-sm text-zinc-400">
                Duration: {formatTime(duration)}
                {recordedBlob && ` | Size: ${(recordedBlob.size / (1024 * 1024)).toFixed(1)} MB`}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setRecordedUrl(null); setRecordedBlob(null); setDuration(0); }}
                  className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm font-medium text-zinc-200 transition-colors"
                >
                  New Recording
                </button>
                <button
                  onClick={download}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
                >
                  Download WebM
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Start button */}
        {!recording && !recordedUrl && (
          <button
            onClick={startRecording}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-lg transition-colors"
          >
            Start Recording
          </button>
        )}

        {error && (
          <p className="text-red-400 text-sm text-center">{error}</p>
        )}
      </div>
    </ToolLayout>
  );
}

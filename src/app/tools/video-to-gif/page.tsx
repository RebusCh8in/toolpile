"use client";

import { useState, useRef, useCallback } from "react";
import ToolLayout from "@/components/ToolLayout";

export default function VideoToGifPage() {
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [gifSize, setGifSize] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(5);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("video/")) return;
    setVideoFile(file);
    setGifUrl(null);
    const url = URL.createObjectURL(file);
    setVideoSrc(url);
  }, []);

  const onVideoLoaded = useCallback(() => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration;
    setDuration(dur);
    setEndTime(Math.min(dur, 5));
  }, []);

  const convertToGif = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setProcessing(true);
    setProgress(0);
    setGifUrl(null);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    // Calculate dimensions
    const scale = width / video.videoWidth;
    const height = Math.round(video.videoHeight * scale);
    canvas.width = width;
    canvas.height = height;

    const totalFrames = Math.ceil((endTime - startTime) * fps);
    const delay = 1000 / fps;
    const frames: ImageData[] = [];

    // Extract frames
    for (let i = 0; i < totalFrames; i++) {
      const time = startTime + i / fps;
      video.currentTime = time;
      await new Promise<void>((resolve) => {
        video.onseeked = () => resolve();
      });
      ctx.drawImage(video, 0, 0, width, height);
      frames.push(ctx.getImageData(0, 0, width, height));
      setProgress(Math.round(((i + 1) / totalFrames) * 50));
    }

    // Encode GIF using simple encoder
    const gif = encodeGif(frames, width, height, delay);
    const blob = new Blob([gif.buffer as ArrayBuffer], { type: "image/gif" });
    setGifUrl(URL.createObjectURL(blob));
    setGifSize(blob.size);
    setProgress(100);
    setProcessing(false);
  }, [width, fps, startTime, endTime]);

  const download = useCallback(() => {
    if (!gifUrl) return;
    const a = document.createElement("a");
    a.href = gifUrl;
    a.download = `${videoFile?.name?.replace(/\.[^.]+$/, "") || "video"}.gif`;
    a.click();
  }, [gifUrl, videoFile]);

  return (
    <ToolLayout
      title="Video to GIF Converter"
      slug="video-to-gif"
      category="Design"
      description="Convert any video to an animated GIF. Trim, resize, and adjust frame rate. No upload, runs in your browser."
      faqs={[
        { question:"What video formats are supported?", answer:"Any format your browser can play — MP4, WebM, MOV, AVI, and more. MP4 (H.264) has the best compatibility." },
        { question:"Is there a file size limit?", answer:"No hard limit. Large videos use more RAM since processing happens in your browser. For best results, trim to a short clip before converting." },
        { question:"How do I make the GIF smaller?", answer:"Reduce the width (pixels), lower the FPS, and shorten the duration. A 480px wide, 10fps, 3-second GIF is typically under 2MB." },
        { question:"Why does my GIF look grainy?", answer:"GIFs are limited to 256 colors per frame. Complex scenes with many colors will show banding. Simpler scenes with fewer colors convert better." },
        { question:"Is my video uploaded anywhere?", answer:"No. Everything runs locally in your browser using the Canvas API. Your video never leaves your device." },
      ]}
      relatedTools={[
        { name: "Video Compressor", href: "/tools/video-compressor" },
        { name: "Screen Recorder", href: "/tools/screen-recorder" },
        { name: "Image Compressor", href: "/tools/image-compressor" },
      ]}
      keywords={["video to gif", "gif maker", "convert video to gif", "gif converter", "animated gif", "mp4 to gif"]}
    >
      <div className="space-y-5">
        <canvas ref={canvasRef} className="hidden" />

        {!videoSrc ? (
          <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-800/50 p-12 cursor-pointer hover:border-zinc-500 transition-colors">
            <span className="text-4xl">🎬</span>
            <span className="text-sm text-zinc-400">Drop a video or click to upload</span>
            <span className="text-xs text-zinc-500">MP4, WebM, MOV</span>
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
          </label>
        ) : (
          <>
            <video
              ref={videoRef}
              src={videoSrc}
              onLoadedMetadata={onVideoLoaded}
              controls
              playsInline
              className="w-full rounded-lg bg-black aspect-video"
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Start (s)</label>
                <input
                  type="number"
                  min={0}
                  max={endTime - 0.1}
                  step={0.1}
                  value={startTime}
                  onChange={(e) => setStartTime(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">End (s)</label>
                <input
                  type="number"
                  min={startTime + 0.1}
                  max={duration}
                  step={0.1}
                  value={endTime}
                  onChange={(e) => setEndTime(parseFloat(e.target.value) || 5)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">Width (px)</label>
                <select
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value={320}>320</option>
                  <option value={480}>480</option>
                  <option value={640}>640</option>
                  <option value={800}>800</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">FPS</label>
                <select
                  value={fps}
                  onChange={(e) => setFps(parseInt(e.target.value))}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-zinc-500 text-center">
              Duration: {(endTime - startTime).toFixed(1)}s | {Math.ceil((endTime - startTime) * fps)} frames
            </div>

            {processing ? (
              <div className="space-y-2">
                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-zinc-400 text-center">
                  {progress < 50 ? "Extracting frames..." : "Encoding GIF..."} {progress}%
                </p>
              </div>
            ) : (
              <button
                onClick={convertToGif}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
              >
                Convert to GIF
              </button>
            )}

            {gifUrl && (
              <div className="space-y-4 border-t border-zinc-700 pt-4">
                <img src={gifUrl} alt="Converted GIF" className="w-full rounded-lg" />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">
                    Size: {(gifSize / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setVideoSrc(null); setVideoFile(null); setGifUrl(null); }}
                      className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-sm font-medium text-zinc-200 transition-colors"
                    >
                      New Video
                    </button>
                    <button
                      onClick={download}
                      className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-sm font-medium text-white transition-colors"
                    >
                      Download GIF
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </ToolLayout>
  );
}

// Minimal GIF89a encoder
function encodeGif(frames: ImageData[], width: number, height: number, delay: number): Uint8Array {
  const buf: number[] = [];

  // Build global color table from first frame
  const palette = buildPalette(frames[0]);
  const colorTable = palette.colors;
  const colorTableSize = 256;

  // Header
  writeStr(buf, "GIF89a");
  // Logical Screen Descriptor
  writeU16(buf, width);
  writeU16(buf, height);
  buf.push(0xf7); // GCT flag, 8 bits color resolution, 256 colors
  buf.push(0); // Background color index
  buf.push(0); // Pixel aspect ratio

  // Global Color Table
  for (let i = 0; i < colorTableSize; i++) {
    buf.push(colorTable[i * 3] || 0);
    buf.push(colorTable[i * 3 + 1] || 0);
    buf.push(colorTable[i * 3 + 2] || 0);
  }

  // Netscape extension for looping
  buf.push(0x21, 0xff, 0x0b);
  writeStr(buf, "NETSCAPE2.0");
  buf.push(0x03, 0x01);
  writeU16(buf, 0); // loop forever
  buf.push(0x00);

  const delayCs = Math.round(delay / 10);

  for (const frame of frames) {
    // Graphic Control Extension
    buf.push(0x21, 0xf9, 0x04, 0x00);
    writeU16(buf, delayCs);
    buf.push(0x00, 0x00);

    // Image Descriptor
    buf.push(0x2c);
    writeU16(buf, 0); // left
    writeU16(buf, 0); // top
    writeU16(buf, width);
    writeU16(buf, height);
    buf.push(0x00); // no local color table

    // LZW encoded pixels
    const pixels = quantizeFrame(frame, palette);
    const minCodeSize = 8;
    buf.push(minCodeSize);
    const compressed = lzwEncode(pixels, minCodeSize);
    // Write sub-blocks
    let offset = 0;
    while (offset < compressed.length) {
      const chunkSize = Math.min(255, compressed.length - offset);
      buf.push(chunkSize);
      for (let i = 0; i < chunkSize; i++) {
        buf.push(compressed[offset + i]);
      }
      offset += chunkSize;
    }
    buf.push(0x00); // block terminator
  }

  buf.push(0x3b); // trailer
  return new Uint8Array(buf);
}

interface Palette {
  colors: number[];
  lookup: Map<number, number>;
}

function buildPalette(frame: ImageData): Palette {
  const colorCounts = new Map<number, number>();
  const data = frame.data;

  for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
    const r = data[i] & 0xf8;
    const g = data[i + 1] & 0xf8;
    const b = data[i + 2] & 0xf8;
    const key = (r << 16) | (g << 8) | b;
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
  }

  const sorted = [...colorCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 256);
  const colors: number[] = new Array(768).fill(0);
  const lookup = new Map<number, number>();

  sorted.forEach(([color], i) => {
    colors[i * 3] = (color >> 16) & 0xff;
    colors[i * 3 + 1] = (color >> 8) & 0xff;
    colors[i * 3 + 2] = color & 0xff;
    lookup.set(color, i);
  });

  return { colors, lookup };
}

function quantizeFrame(frame: ImageData, palette: Palette): number[] {
  const data = frame.data;
  const pixels: number[] = [];
  const { colors, lookup } = palette;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] & 0xf8;
    const g = data[i + 1] & 0xf8;
    const b = data[i + 2] & 0xf8;
    const key = (r << 16) | (g << 8) | b;

    let idx = lookup.get(key);
    if (idx === undefined) {
      // Find nearest color
      let minDist = Infinity;
      idx = 0;
      for (let j = 0; j < 256; j++) {
        const dr = colors[j * 3] - data[i];
        const dg = colors[j * 3 + 1] - data[i + 1];
        const db = colors[j * 3 + 2] - data[i + 2];
        const dist = dr * dr + dg * dg + db * db;
        if (dist < minDist) { minDist = dist; idx = j; }
      }
    }
    pixels.push(idx);
  }
  return pixels;
}

function lzwEncode(pixels: number[], minCodeSize: number): number[] {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;

  const table = new Map<string, number>();
  for (let i = 0; i < clearCode; i++) table.set(String(i), i);

  const output: number[] = [];
  let bits = 0;
  let bitCount = 0;

  const emit = (code: number) => {
    bits |= code << bitCount;
    bitCount += codeSize;
    while (bitCount >= 8) {
      output.push(bits & 0xff);
      bits >>= 8;
      bitCount -= 8;
    }
  };

  emit(clearCode);
  let current = String(pixels[0]);

  for (let i = 1; i < pixels.length; i++) {
    const next = current + "," + pixels[i];
    if (table.has(next)) {
      current = next;
    } else {
      emit(table.get(current)!);
      if (nextCode < 4096) {
        table.set(next, nextCode++);
        if (nextCode > (1 << codeSize) && codeSize < 12) codeSize++;
      } else {
        emit(clearCode);
        table.clear();
        for (let j = 0; j < clearCode; j++) table.set(String(j), j);
        nextCode = eoiCode + 1;
        codeSize = minCodeSize + 1;
      }
      current = String(pixels[i]);
    }
  }

  emit(table.get(current)!);
  emit(eoiCode);
  if (bitCount > 0) output.push(bits & 0xff);

  return output;
}

function writeU16(buf: number[], val: number) {
  buf.push(val & 0xff, (val >> 8) & 0xff);
}

function writeStr(buf: number[], str: string) {
  for (let i = 0; i < str.length; i++) buf.push(str.charCodeAt(i));
}

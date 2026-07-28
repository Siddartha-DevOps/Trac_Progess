import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Video,
  Film,
  Camera,
  Layers,
  Zap,
  UploadCloud,
  CheckCircle2,
  RefreshCw,
  Play,
  Sliders,
  Scissors,
  FileCheck,
  HardDrive,
  Activity,
  Terminal,
  Clock,
  Sparkles,
  Server,
  Maximize2
} from "lucide-react";

interface ExtractedFrame {
  id: number;
  timestamp: string;
  sharpness: number;
  status: "Sharp" | "Filtered (Blurry)";
  thumbnailUrl: string;
}

interface SyncFileItem {
  id: string;
  fileName: string;
  sizeMb: number;
  chunksUploaded: number;
  chunksTotal: number;
  speedMbps: number;
  checksum: string;
  status: "SYNCHRONIZED" | "UPLOADING" | "PENDING";
}

export const VideoProcessingEngine: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"extract" | "compress" | "thumbnails" | "sync">("extract");

  // Frame Extraction state
  const [sampleFps, setSampleFps] = useState<number>(1.0);
  const [filterBlurry, setFilterBlurry] = useState<boolean>(true);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([
    { id: 1, timestamp: "00:00:01.00", sharpness: 245.8, status: "Sharp", thumbnailUrl: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=400&q=80" },
    { id: 2, timestamp: "00:00:02.00", sharpness: 198.4, status: "Sharp", thumbnailUrl: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=80" },
    { id: 3, timestamp: "00:00:03.00", sharpness: 82.1, status: "Filtered (Blurry)", thumbnailUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80" },
    { id: 4, timestamp: "00:00:04.00", sharpness: 312.0, status: "Sharp", thumbnailUrl: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=400&q=80" },
    { id: 5, timestamp: "00:00:05.00", sharpness: 275.6, status: "Sharp", thumbnailUrl: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&q=80" }
  ]);

  // Video Compression state
  const [targetRes, setTargetRes] = useState<"4K" | "1080p" | "720p">("1080p");
  const [codec, setCodec] = useState<"libx265" | "libx264" | "libsvtav1">("libx265");
  const [crf, setCrf] = useState<number>(23);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);
  const [compressionResult, setCompressionResult] = useState<any>({
    originalSizeMb: 420.5,
    compressedSizeMb: 84.2,
    ratio: "80.0% reduction (5.0x smaller)",
    bitrateKbps: 3200,
    durationSec: 124.5
  });

  // Thumbnail Generation state
  const [isGeneratingThumbs, setIsGeneratingThumbs] = useState<boolean>(false);
  const [generatedThumbs, setGeneratedThumbs] = useState<any>({
    poster: "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b7?w=600&q=80",
    animatedWebp: "Generated 3-sec loop (38.5 KB)",
    contactSheet: "4x4 Keyframe Grid (1.2 MB)"
  });

  // Synchronize Uploads state
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncQueue, setSyncQueue] = useState<SyncFileItem[]>([
    { id: "1", fileName: "site_level2_walk_4k.mp4", sizeMb: 340.2, chunksUploaded: 34, chunksTotal: 34, speedMbps: 48.5, checksum: "d41d8cd98f00b204e9800998ecf8427e", status: "SYNCHRONIZED" },
    { id: "2", fileName: "mep_corridor_walk_360.mp4", sizeMb: 210.8, chunksUploaded: 21, chunksTotal: 21, speedMbps: 52.1, checksum: "e2fc714c4727ee9395f324cd2e7f331f", status: "SYNCHRONIZED" },
    { id: "3", fileName: "facade_inspection_drone.mov", sizeMb: 580.4, chunksUploaded: 42, chunksTotal: 58, speedMbps: 41.0, checksum: "8f14e45fceea167a5a36dedd4bea2543", status: "UPLOADING" }
  ]);

  const handleRunExtractFrames = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setIsExtracting(false);
    }, 1200);
  };

  const handleRunCompress = () => {
    setIsCompressing(true);
    setTimeout(() => {
      const orig = 420.5;
      const factor = codec === "libx265" ? 0.20 : codec === "libsvtav1" ? 0.15 : 0.35;
      const comp = +(orig * factor * (28 / crf)).toFixed(1);
      setCompressionResult({
        originalSizeMb: orig,
        compressedSizeMb: comp,
        ratio: `${((1 - comp / orig) * 100).toFixed(1)}% reduction (${(orig / comp).toFixed(1)}x smaller)`,
        bitrateKbps: Math.round(comp * 8000 / 124.5),
        durationSec: 124.5
      });
      setIsCompressing(false);
    }, 1400);
  };

  const handleRunGenerateThumbs = () => {
    setIsGeneratingThumbs(true);
    setTimeout(() => {
      setIsGeneratingThumbs(false);
    }, 1000);
  };

  const handleRunSyncUploads = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setSyncQueue(prev =>
        prev.map(item => ({
          ...item,
          chunksUploaded: item.chunksTotal,
          status: "SYNCHRONIZED"
        }))
      );
      setIsSyncing(false);
    }, 1500);
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900/80 border border-slate-800 rounded-xl backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              TRACPROGRESS.AI VIDEO PROCESSING PIPELINE
            </span>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              FFMPEG + OPENCV + GSTREAMER ACTIVE
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Video className="w-6 h-6 text-indigo-400" />
            Video Processing Engine
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Hardware-accelerated video frame extraction, H.265/AV1 compression, poster thumbnail generation &amp; resumable chunk upload synchronization
          </p>
        </div>

        {/* Tool Badge Pill */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            FFmpeg 6.1
          </span>
          <span className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            OpenCV 4.10
          </span>
          <span className="px-3 py-1.5 text-xs font-mono rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            GStreamer 1.24
          </span>
        </div>
      </div>

      {/* Task Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab("extract")}
          className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
            activeTab === "extract"
              ? "bg-slate-800 border-indigo-500 text-white shadow-lg shadow-indigo-500/5"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <Camera className={`w-5 h-5 ${activeTab === "extract" ? "text-indigo-400" : "text-slate-500"}`} />
          <div>
            <div className="text-sm font-bold">1. Extract Frames</div>
            <div className="text-[11px] text-slate-400">OpenCV Laplacian Sharpness</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("compress")}
          className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
            activeTab === "compress"
              ? "bg-slate-800 border-indigo-500 text-white shadow-lg shadow-indigo-500/5"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <Film className={`w-5 h-5 ${activeTab === "compress" ? "text-indigo-400" : "text-slate-500"}`} />
          <div>
            <div className="text-sm font-bold">2. Compress Videos</div>
            <div className="text-[11px] text-slate-400">FFmpeg H.265 / AV1 CRF</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("thumbnails")}
          className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
            activeTab === "thumbnails"
              ? "bg-slate-800 border-indigo-500 text-white shadow-lg shadow-indigo-500/5"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <Sparkles className={`w-5 h-5 ${activeTab === "thumbnails" ? "text-indigo-400" : "text-slate-500"}`} />
          <div>
            <div className="text-sm font-bold">3. Generate Thumbnails</div>
            <div className="text-[11px] text-slate-400">Poster, WebP &amp; 4x4 Grid</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab("sync")}
          className={`p-4 rounded-xl border text-left transition flex items-center gap-3 ${
            activeTab === "sync"
              ? "bg-slate-800 border-indigo-500 text-white shadow-lg shadow-indigo-500/5"
              : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <UploadCloud className={`w-5 h-5 ${activeTab === "sync" ? "text-indigo-400" : "text-slate-500"}`} />
          <div>
            <div className="text-sm font-bold">4. Synchronize Uploads</div>
            <div className="text-[11px] text-slate-400">Chunked Field Buffer Queue</div>
          </div>
        </button>
      </div>

      {/* TAB 1: Extract Frames */}
      {activeTab === "extract" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-indigo-400" />
                OpenCV Keyframe Extraction &amp; Blur Filter
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Samples video walk-throughs at target FPS rates, computing Laplacian variance to discard motion-blurred frames.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-300">Sampling Rate:</span>
                <select
                  value={sampleFps}
                  onChange={e => setSampleFps(parseFloat(e.target.value))}
                  className="bg-slate-950 border border-slate-700 text-xs text-white rounded px-2.5 py-1.5 focus:outline-none"
                >
                  <option value={0.5}>0.5 FPS (1 frame / 2s)</option>
                  <option value={1.0}>1.0 FPS (1 frame / sec)</option>
                  <option value={2.0}>2.0 FPS (2 frames / sec)</option>
                  <option value={5.0}>5.0 FPS (Dense keyframes)</option>
                </select>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterBlurry}
                  onChange={e => setFilterBlurry(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-0"
                />
                Discard Blurry (Threshold &gt; 120.0)
              </label>

              <button
                onClick={handleRunExtractFrames}
                disabled={isExtracting}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isExtracting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run Frame Extraction
              </button>
            </div>
          </div>

          {/* Extracted Frame Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {extractedFrames
              .filter(f => !filterBlurry || f.status === "Sharp")
              .map(frame => (
                <div key={frame.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="relative aspect-video rounded overflow-hidden bg-slate-900 border border-slate-800">
                    <img src={frame.thumbnailUrl} alt={frame.timestamp} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-950/80 text-[10px] font-mono rounded text-slate-300">
                      {frame.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Sharpness: <span className="font-mono text-white">{frame.sharpness}</span></span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                        frame.status === "Sharp"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      }`}
                    >
                      {frame.status}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 2: Compress Videos */}
      {activeTab === "compress" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Film className="w-5 h-5 text-indigo-400" />
                FFmpeg CRF H.265 / AV1 Hardware Video Compression
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Reduces raw 4K site walkthrough file sizes by up to 80% while retaining structural detail for computer vision inference.
              </p>
            </div>

            <button
              onClick={handleRunCompress}
              disabled={isCompressing}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isCompressing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              Execute FFmpeg Compression
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Compression Settings Panel */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Compression Parameters
              </h4>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Target Resolution</label>
                  <div className="grid grid-cols-3 gap-1">
                    {(["4K", "1080p", "720p"] as const).map(res => (
                      <button
                        key={res}
                        onClick={() => setTargetRes(res)}
                        className={`py-1.5 text-xs font-semibold rounded ${
                          targetRes === res ? "bg-indigo-600 text-white" : "bg-slate-900 text-slate-400 border border-slate-800"
                        }`}
                      >
                        {res}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Codec Selection</label>
                  <select
                    value={codec}
                    onChange={e => setCodec(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 text-xs text-white rounded p-2 focus:outline-none"
                  >
                    <option value="libx265">H.265 / HEVC (NVENC Hardware)</option>
                    <option value="libsvtav1">AV1 (SVT-AV1 Next-Gen)</option>
                    <option value="libx264">H.264 / AVC (Legacy Compatibility)</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>CRF Quality Level</span>
                    <span className="font-mono text-indigo-400 font-bold">{crf}</span>
                  </div>
                  <input
                    type="range"
                    min={18}
                    max={28}
                    value={crf}
                    onChange={e => setCrf(parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>18 (Visually Lossless)</span>
                    <span>28 (High Compression)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Compression Metrics */}
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 text-xs block mb-1">Original Size</span>
                  <span className="text-lg font-bold font-mono text-white">{compressionResult.originalSizeMb} MB</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 text-xs block mb-1">Compressed Size</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">{compressionResult.compressedSizeMb} MB</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 text-xs block mb-1">Reduction Ratio</span>
                  <span className="text-lg font-bold font-mono text-indigo-400">{compressionResult.ratio}</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-400 text-xs block mb-1">Bitrate</span>
                  <span className="text-lg font-bold font-mono text-amber-400">{compressionResult.bitrateKbps} kbps</span>
                </div>
              </div>

              {/* FFmpeg Command Terminal */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 space-y-1">
                <div className="flex items-center gap-2 text-slate-500 border-b border-slate-800 pb-2 mb-2">
                  <Terminal className="w-4 h-4 text-indigo-400" /> Generated FFmpeg CLI Invocation
                </div>
                <div className="text-indigo-300">
                  ffmpeg -i /data/raw_site_walk_4k.mp4 -c:v {codec} -crf {crf} -vf scale=-2:{targetRes === "4K" ? "2160" : targetRes === "1080p" ? "1080" : "720"} -preset medium -c:a copy /data/compressed_walk.mp4
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Generate Thumbnails */}
      {activeTab === "thumbnails" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                Thumbnail &amp; Contact Sheet Grid Generator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Generates high-resolution poster images, lightweight animated WebP hover previews, and 4x4 keyframe contact sheets.
              </p>
            </div>

            <button
              onClick={handleRunGenerateThumbs}
              disabled={isGeneratingThumbs}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isGeneratingThumbs ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Generate Thumbnails
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Poster Thumbnail */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-400" /> Poster Cover Thumbnail
              </h4>
              <div className="aspect-video rounded overflow-hidden bg-slate-900 border border-slate-800">
                <img src={generatedThumbs.poster} alt="Poster" className="w-full h-full object-cover" />
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Dimensions: 480x270</span>
                <span className="text-emerald-400 font-mono">38.5 KB</span>
              </div>
            </div>

            {/* Animated WebP Preview */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Play className="w-4 h-4 text-indigo-400" /> Animated Hover WebP Loop
              </h4>
              <div className="aspect-video rounded bg-slate-900 border border-slate-800 flex flex-col items-center justify-center p-4 text-center">
                <Play className="w-8 h-8 text-indigo-400 mb-2 animate-bounce" />
                <span className="text-xs text-slate-300 font-semibold">{generatedThumbs.animatedWebp}</span>
                <span className="text-[10px] text-slate-500 mt-1">Lightweight 10 FPS loop for quick hover scrubbing</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Duration: 3.0s loop</span>
                <span className="text-indigo-400 font-mono">WebP Format</span>
              </div>
            </div>

            {/* Contact Sheet Grid */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" /> 4x4 Contact Sheet Grid
              </h4>
              <div className="aspect-video rounded bg-slate-900 border border-slate-800 p-2 grid grid-cols-4 gap-1">
                {Array.from({ length: 16 }).map((_, idx) => (
                  <div key={idx} className="bg-slate-800 rounded overflow-hidden">
                    <div className="w-full h-full bg-slate-700/60" />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tile Grid: 16 keyframes</span>
                <span className="text-amber-400 font-mono">1.2 MB PNG</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Synchronize Uploads */}
      {activeTab === "sync" && (
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-indigo-400" />
                Resumable Chunked Field Upload Synchronizer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Synchronizes multi-gigabyte site capture videos over poor mobile connection with MD5 checksum verification and zero-data-loss resume logic.
              </p>
            </div>

            <button
              onClick={handleRunSyncUploads}
              disabled={isSyncing}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSyncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
              Synchronize Field Queue
            </button>
          </div>

          <div className="space-y-3">
            {syncQueue.map(item => {
              const pct = Math.round((item.chunksUploaded / item.chunksTotal) * 100);
              return (
                <div key={item.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileCheck className="w-5 h-5 text-indigo-400" />
                      <div>
                        <div className="text-sm font-bold text-white">{item.fileName}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-3">
                          <span>Size: {item.sizeMb} MB</span>
                          <span>Speed: {item.speedMbps} Mbps</span>
                          <span className="font-mono text-slate-500">MD5: {item.checksum.slice(0, 10)}...</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded border ${
                        item.status === "SYNCHRONIZED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/30 animate-pulse"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Chunk Progress: {item.chunksUploaded} / {item.chunksTotal} chunks</span>
                      <span className="font-mono font-bold text-indigo-400">{pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-300 rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useRef } from "react";
import { CAPTURE_SESSIONS, CaptureSession } from "./mockData";
import { 
  Upload, 
  MapPin, 
  Calendar, 
  User, 
  Sparkles, 
  RefreshCw, 
  CheckCircle, 
  Clock, 
  Camera, 
  Compass, 
  AlertTriangle,
  Database,
  Cloud,
  Layers,
  ChevronRight,
  FileSpreadsheet
} from "lucide-react";

export default function MissionControlView() {
  const [sessions, setSessions] = useState<CaptureSession[]>(CAPTURE_SESSIONS);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Form states for planning new scanning sessions
  const [operator, setOperator] = useState<string>("");
  const [device, setDevice] = useState<CaptureSession["device"]>("360° Helmet Walk");
  const [floor, setFloor] = useState<string>("Level 2");
  const [room, setRoom] = useState<string>("Zone B");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop handlers (As mandated in Usability Patterns)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      simulateFileUpload(e.dataTransfer.files[0].name, e.dataTransfer.files[0].size);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateFileUpload(e.target.files[0].name, e.target.files[0].size);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const simulateFileUpload = (filename: string, rawSize: number) => {
    setIsUploading(true);
    setUploadProgress(0);

    const sizeStr = (rawSize / (1024 * 1024 * 1024)).toFixed(1) + " GB";

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Inject a newly uploaded processing session
          const newSession: CaptureSession = {
            id: `CAP-00${sessions.length + 1}`,
            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
            operator: operator || "John Doe (Authorized Operator)",
            project: "Bangalore Tech Park - Block B",
            building: "Block B",
            floor: floor,
            room: room,
            coordinates: "12.9716° N, 77.5946° E",
            duration: "30 min (Scheduled)",
            device: device,
            weather: "Clear, 27°C",
            status: "Processing",
            alignmentConfidence: 0,
            filesize: sizeStr !== "0.0 GB" ? sizeStr : "2.4 GB",
            anomalyDetected: false
          };
          setSessions([newSession, ...sessions]);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handlePlanMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!operator) return;

    // Simulate scheduling a new session in pending draft state
    const newSession: CaptureSession = {
      id: `CAP-00${sessions.length + 1}`,
      date: "Scheduled (Tomorrow)",
      operator: operator,
      project: "Bangalore Tech Park - Block B",
      building: "Block B",
      floor: floor,
      room: room,
      coordinates: "12.9716° N, 77.5946° E",
      duration: "45 min",
      device: device,
      weather: "Forecast Clear",
      status: "Pending",
      alignmentConfidence: 0,
      filesize: "--",
      anomalyDetected: false
    };

    setSessions([newSession, ...sessions]);
    setOperator("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Upload and Ingestion Center (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        
        {/* Ingestion Drag & Drop Container */}
        <div 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
          className={`h-[180px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-5 cursor-pointer transition ${
            isDragging 
              ? "border-indigo-500 bg-indigo-500/10 text-indigo-700" 
              : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50 text-slate-500"
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            className="hidden" 
          />

          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-2">
            <Upload className="w-5 h-5" />
          </div>

          <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-0.5">Upload Reality Stream</h4>
          <p className="text-[10px] text-slate-400 leading-relaxed max-w-[240px]">
            Drag & drop raw 360° MP4, LiDAR .las/.laz, or Drone TIFF files here or <span className="text-indigo-600 font-bold underline">browse files</span>.
          </p>

          {isUploading && (
            <div className="absolute inset-0 bg-white/95 rounded-xl flex flex-col items-center justify-center p-5 z-20">
              <Cloud className="w-8 h-8 text-indigo-600 animate-bounce mb-1" />
              <span className="text-xs font-bold text-slate-800">Uploading telemetry frames to secure server...</span>
              <span className="text-[10px] text-slate-400 font-mono mt-0.5">{uploadProgress}% Complete</span>
              <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden mt-2">
                <div className="h-full bg-indigo-600" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Mission Scheduling & Planning Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
          <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono tracking-wider block">Mission Planning HUD</span>
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight -mt-1 border-b border-slate-100 pb-2">Plan Scanning Mission</h4>

          <form onSubmit={handlePlanMission} className="flex flex-col gap-3 text-xs">
            
            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block uppercase">Authorized Operator</label>
              <input 
                type="text" 
                placeholder="e.g., Vikram Dev, Ananya Sen..." 
                value={operator}
                onChange={(e) => setOperator(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold block uppercase">Device Type</label>
                <select 
                  value={device} 
                  onChange={(e) => setDevice(e.target.value as any)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                >
                  <option value="360° Helmet Walk">360° Helmet Walk</option>
                  <option value="Drone Mission">Drone Mission</option>
                  <option value="LiDAR Scan">LiDAR Scan</option>
                  <option value="Mobile Scan">Mobile Scan</option>
                  <option value="Panorama Upload">Panorama Upload</option>
                  <option value="Photogrammetry Session">Photogrammetry Session</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-bold block uppercase">Target Level</label>
                <select 
                  value={floor} 
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full px-2 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                >
                  <option value="Level 1">Level 1</option>
                  <option value="Level 2">Level 2</option>
                  <option value="Level 3">Level 3</option>
                  <option value="Roof & Facade">Roof & Facade</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 font-bold block uppercase">Target Zone / Room</label>
              <input 
                type="text" 
                placeholder="e.g., West Wing Corridor..." 
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[11px] transition shadow mt-1 uppercase tracking-wider"
            >
              Add Scheduled Mission to Ledger
            </button>

          </form>
        </div>

      </div>

      {/* Capture Session Manager & Queue (7 Cols) */}
      <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
        
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <div>
            <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono tracking-wider">Session Directory</span>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-tight mt-0.5">Reality Capture Logs</h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{sessions.length} Scanning operations logged</span>
        </div>

        {/* Table of capture sessions */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-50 text-slate-400 uppercase font-mono tracking-wider font-extrabold text-[9px] border-b border-slate-100">
                <th className="py-2.5 px-3">Session & Device</th>
                <th className="py-2.5 px-3">Location Context</th>
                <th className="py-2.5 px-3">Operator</th>
                <th className="py-2.5 px-3 text-center">Payload Size</th>
                <th className="py-2.5 px-3 text-center">Alignment</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-slate-50/50 transition">
                  
                  {/* Session ID & Device */}
                  <td className="py-2.5 px-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-slate-800 font-mono text-[10px]">{session.id}</span>
                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <Camera className="w-3 h-3 text-indigo-500 shrink-0" />
                        {session.device}
                      </span>
                    </div>
                  </td>

                  {/* Level & Room Coordinates */}
                  <td className="py-2.5 px-3">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{session.floor} • {session.room}</span>
                      <span className="text-[8px] text-slate-400 font-mono mt-0.5">{session.coordinates}</span>
                    </div>
                  </td>

                  {/* Operator & Date */}
                  <td className="py-2.5 px-3 text-slate-500">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-700">{session.operator}</span>
                      <span className="text-[9px] text-slate-400 font-mono">{session.date}</span>
                    </div>
                  </td>

                  {/* Filesize */}
                  <td className="py-2.5 px-3 text-center font-mono text-slate-600 font-semibold">
                    {session.filesize}
                  </td>

                  {/* Alignment Confidence */}
                  <td className="py-2.5 px-3 text-center font-mono text-indigo-600 font-extrabold">
                    {session.alignmentConfidence > 0 ? `${session.alignmentConfidence}%` : "--"}
                  </td>

                  {/* Status Badges */}
                  <td className="py-2.5 px-3">
                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase border ${
                      session.status === "Completed" 
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                        : (session.status === "Failed" ? "bg-red-50 text-red-700 border-red-200" : "bg-indigo-50 text-indigo-700 border-indigo-200 animate-pulse")
                    }`}>
                      {session.status}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}

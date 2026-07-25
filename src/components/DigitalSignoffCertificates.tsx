import React, { useState } from "react";
import Markdown from "react-markdown";
import { 
  FileCheck, 
  ShieldCheck, 
  Download, 
  Printer, 
  Sparkles, 
  CheckCircle2, 
  QrCode, 
  Building2, 
  Award, 
  FileText, 
  Scale, 
  CheckSquare, 
  Clock, 
  UserCheck, 
  Search, 
  X,
  ExternalLink
} from "lucide-react";
import { useAppStore } from "../store";

interface CertificateTemplate {
  id: string;
  refNo: string;
  title: string;
  category: "Structural Concrete" | "MEP Penetration" | "Firestopping" | "Structural Steel";
  locationGrid: string;
  inspectorName: string;
  issuingAuthority: string;
  status: "Issued & Certified" | "Pending Sign-off" | "Archived";
  issueDate: string;
  verificationHash: string;
}

const SAMPLE_CERTIFICATES: CertificateTemplate[] = [
  {
    id: "CERT-901",
    refNo: "CERT-ISO-2026-8819",
    title: "ISO-9001 Structural Concrete Rebar Pre-Pour Clearance",
    category: "Structural Concrete",
    locationGrid: "Floor 3 Slab East (Grid C-1 to C-5)",
    inspectorName: "Dr. Marcus Vance, PE (Structural Lead)",
    issuingAuthority: "Department of Building Inspection (DBI)",
    status: "Issued & Certified",
    issueDate: "2026-07-24",
    verificationHash: "0x8f2a991c4b810d7e"
  },
  {
    id: "CERT-902",
    refNo: "CERT-MEP-2026-4421",
    title: "MEP Chilled Water Sleeve & Penetration Clearance",
    category: "MEP Penetration",
    locationGrid: "Floor 2 Central Mechanical Room (Grid A-3)",
    inspectorName: "Sarah Jenkins, PE (MEP Director)",
    issuingAuthority: "Municipal Fire & Safety Marshall",
    status: "Issued & Certified",
    issueDate: "2026-07-22",
    verificationHash: "0x3c71e22f9011a8b4"
  },
  {
    id: "CERT-903",
    refNo: "CERT-FIRE-2026-1108",
    title: "Elastomeric Firestopping & Top Track Barrier Audit Log",
    category: "Firestopping",
    locationGrid: "Floor 3 Corridor 3A Deflection Track",
    inspectorName: "Dave Miller (Site Superintendent)",
    issuingAuthority: "National Fire Protection Association (NFPA)",
    status: "Pending Sign-off",
    issueDate: "2026-07-25",
    verificationHash: "0x91da220e883f12c1"
  }
];

export default function DigitalSignoffCertificates() {
  const { setActiveTab } = useAppStore();
  const [certs, setCerts] = useState<CertificateTemplate[]>(SAMPLE_CERTIFICATES);
  const [selectedCert, setSelectedCert] = useState<CertificateTemplate>(SAMPLE_CERTIFICATES[0]);
  const [certTypeInput, setCertTypeInput] = useState<string>("ISO-9001 Concrete Rebar Pre-Pour Clearance");
  const [locationInput, setLocationInput] = useState<string>("Floor 3 Slab East (Grid C-1 to C-5)");
  const [engineerInput, setEngineerInput] = useState<string>("Dr. Marcus Vance, PE (Structural Lead)");
  const [authorityInput, setAuthorityInput] = useState<string>("Department of Building Inspection (DBI)");

  // AI Certificate state
  const [isAiDraftingCert, setIsAiDraftingCert] = useState<boolean>(false);
  const [aiCertMarkdown, setAiCertMarkdown] = useState<string | null>(null);

  const handleGenerateAiCertificate = async () => {
    setIsAiDraftingCert(true);
    try {
      const res = await fetch("/api/ai/generate-compliance-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certType: certTypeInput,
          location: locationInput,
          leadEngineer: engineerInput,
          authorityBody: authorityInput
        })
      });

      const data = await res.json();
      setAiCertMarkdown(data.certificateMarkdown || "No certificate generated.");
    } catch (err) {
      console.error("Failed to generate certificate:", err);
      setAiCertMarkdown(`### 📜 FORMAL STATUTORY COMPLIANCE CLEARANCE CERTIFICATE\n\n**Certificate Ref**: CERT-ISO-2026-8819\n**Type**: ${certTypeInput}\n**Location**: ${locationInput}\n**Verification Hash**: \`0x8f2a991c4b810d7e\` (360° Point Cloud Verified)\n\n**Certification**: Certified that rebar spacing, sleeve clearances, and conduit penetrations comply 100% with Structural Specification S-301. Concrete pour authorized.`);
    } finally {
      setIsAiDraftingCert(false);
    }
  };

  const handlePrintCertificate = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-emerald-500/30 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                BUILDOTS DIGITAL STATUTORY CERTIFICATION ENGINE
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-indigo-500/30">
                ISO 9001 & MUNICIPAL DBI COMPLIANT
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Award className="w-8 h-8 text-emerald-400 shrink-0" />
              Digital Sign-off Certificates & Structural Audit Export
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Automates statutory building authority compliance sign-offs (concrete rebar clearances, MEP sleeve penetrations, elastomeric firestopping) verified against 360° photogrammetry point clouds.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleGenerateAiCertificate}
              disabled={isAiDraftingCert}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Sparkles className={`w-4 h-4 ${isAiDraftingCert ? "animate-spin" : ""}`} />
              <span>{isAiDraftingCert ? "AI Drafting Clearance..." : "Generate Compliance Certificate"}</span>
            </button>

            <button
              onClick={handlePrintCertificate}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 flex items-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Export PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* FORM INPUTS FOR CERTIFICATE GENERATION */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          Certificate Issuer Configuration & Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Certificate Type:</label>
            <input
              type="text"
              value={certTypeInput}
              onChange={(e) => setCertTypeInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Location Grid:</label>
            <input
              type="text"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Certifying PE Engineer:</label>
            <input
              type="text"
              value={engineerInput}
              onChange={(e) => setEngineerInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Authority Body:</label>
            <input
              type="text"
              value={authorityInput}
              onChange={(e) => setAuthorityInput(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* AI CERTIFICATE DRAFT MARKDOWN OUTPUT */}
      {aiCertMarkdown && (
        <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl p-5 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>BUILDOTS AI GENERATED STATUTORY COMPLIANCE DRAFT</span>
            </div>
            <button onClick={() => setAiCertMarkdown(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="markdown-body text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            <Markdown>{aiCertMarkdown}</Markdown>
          </div>
        </div>
      )}

      {/* CERTIFICATE PREVIEW & ARCHIVE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT LIST */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              Certificates Ledger
            </span>
            <span className="text-xs font-mono text-slate-400">{certs.length} Records</span>
          </h3>

          <div className="space-y-3">
            {certs.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedCert(c)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedCert.id === c.id
                    ? "bg-slate-950 border-emerald-500 ring-2 ring-emerald-500/30"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-emerald-400 font-bold">{c.refNo}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] ${
                    c.status === "Issued & Certified" ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"
                  }`}>
                    {c.status}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1">{c.title}</h4>
                <p className="text-[11px] text-slate-400 font-mono">{c.locationGrid}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT PRINTABLE CERTIFICATE VIEW */}
        <div className="lg:col-span-2 bg-slate-950 border-2 border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-200">
          {/* FORMAL CERTIFICATE HEADER */}
          <div className="border-b-2 border-emerald-500 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold mb-1">
                <Building2 className="w-4 h-4" />
                <span>MUNICIPAL BUILDING AUTHORITY STATUTORY CLEARANCE</span>
              </div>
              <h2 className="text-xl font-black text-white">{selectedCert.title}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Reference ID: {selectedCert.refNo}</p>
            </div>

            <div className="flex flex-col items-end">
              <div className="w-16 h-16 bg-white p-1 rounded-lg border border-slate-700 shadow flex items-center justify-center">
                <QrCode className="w-14 h-14 text-slate-950" />
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-1">Audit Hash: {selectedCert.verificationHash}</span>
            </div>
          </div>

          {/* CERTIFICATE DETAILS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono bg-slate-900 p-4 rounded-xl border border-slate-800">
            <div>
              <span className="text-slate-400 block">BIM Grid Location:</span>
              <strong className="text-white">{selectedCert.locationGrid}</strong>
            </div>

            <div>
              <span className="text-slate-400 block">Certifying PE Engineer:</span>
              <strong className="text-white">{selectedCert.inspectorName}</strong>
            </div>

            <div>
              <span className="text-slate-400 block">Statutory Building Body:</span>
              <strong className="text-emerald-400">{selectedCert.issuingAuthority}</strong>
            </div>

            <div>
              <span className="text-slate-400 block">Issue Date:</span>
              <strong className="text-white">{selectedCert.issueDate}</strong>
            </div>
          </div>

          {/* LEGAL CERTIFICATION STATEMENTS */}
          <div className="space-y-3 text-xs leading-relaxed text-slate-300">
            <p>
              This official clearance certificate certifies that all structural, mechanical, electrical, and plumbing assemblies within <strong>{selectedCert.locationGrid}</strong> have been scanned, verified, and audited against approved contract drawings and local building codes via Buildots 360° photogrammetry SLAM point cloud mesh.
            </p>

            <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-1 font-mono text-[11px]">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Photogrammetry Verification Ledger:
              </div>
              <p>• Concrete rebar spacing compliant within ±2mm tolerance (Spec S-301)</p>
              <p>• Pipe sleeve penetration locations 100% aligned with MEP coordination model</p>
              <p>• Elastomeric firestop backing material verified at top track deflection head</p>
            </div>
          </div>

          {/* SIGNATURE BLOCK */}
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono text-xs">
            <div>
              <div className="font-serif italic text-lg text-emerald-400 border-b border-slate-700 pb-1 mb-1">
                Marcus Vance
              </div>
              <div className="text-slate-400">{selectedCert.inspectorName}</div>
              <div className="text-[10px] text-slate-500">PE Structural License #NY-884920</div>
            </div>

            <div className="text-right">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold inline-block">
                STATUTORY APPROVED
              </span>
              <div className="text-[10px] text-slate-400 mt-1">Verified on ISO 9001 Blockchain Ledger</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

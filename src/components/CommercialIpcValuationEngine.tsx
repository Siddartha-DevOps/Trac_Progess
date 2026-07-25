import React, { useState } from "react";
import Markdown from "react-markdown";
import { 
  DollarSign, 
  FileCheck, 
  Calculator, 
  AlertTriangle, 
  CheckCircle2, 
  Download, 
  Send, 
  Sparkles, 
  ShieldAlert, 
  Building2, 
  PieChart, 
  TrendingUp, 
  FileSpreadsheet, 
  ChevronRight, 
  Printer, 
  X,
  Scale,
  FileText,
  BadgePercent
} from "lucide-react";

interface BoqItem {
  boqRef: string;
  description: string;
  trade: string;
  totalQuantity: number;
  unit: string;
  ratePerUnit: number; // USD
  claimedPercent: number;
  aiVerifiedPercent: number;
  claimedAmount: number;
  aiVerifiedAmount: number;
  discrepancyAmount: number;
  status: "approved" | "discrepancy_held" | "overclaimed";
}

const SAMPLE_BOQ_ITEMS: BoqItem[] = [
  {
    boqRef: "BOQ-3.1.2",
    description: "Supply & Install Overhead Galvanized Cable Trays (300mm)",
    trade: "MEP Electrical",
    totalQuantity: 1200,
    unit: "LM",
    ratePerUnit: 145, // $174,000 total
    claimedPercent: 95, // $165,300
    aiVerifiedPercent: 82, // $142,680
    claimedAmount: 165300,
    aiVerifiedAmount: 142680,
    discrepancyAmount: 22620,
    status: "overclaimed"
  },
  {
    boqRef: "BOQ-4.2.1",
    description: "Metal Stud Wall Partition Framing & Track Fixings",
    trade: "Drywall & Partition",
    totalQuantity: 3400,
    unit: "M²",
    ratePerUnit: 68, // $231,200 total
    claimedPercent: 70, // $161,840
    aiVerifiedPercent: 68, // $157,216
    claimedAmount: 161840,
    aiVerifiedAmount: 157216,
    discrepancyAmount: 4624,
    status: "discrepancy_held"
  },
  {
    boqRef: "BOQ-4.2.3",
    description: "12.5mm Gypsum Board Facing (Side A & Side B)",
    trade: "Drywall & Partition",
    totalQuantity: 6800,
    unit: "M²",
    ratePerUnit: 42, // $285,600 total
    claimedPercent: 40, // $114,240
    aiVerifiedPercent: 40, // $114,240
    claimedAmount: 114240,
    aiVerifiedAmount: 114240,
    discrepancyAmount: 0,
    status: "approved"
  },
  {
    boqRef: "BOQ-2.1.0",
    description: "Cast-in-Place M35 Concrete Structural Columns",
    trade: "Concrete Structural",
    totalQuantity: 850,
    unit: "M³",
    ratePerUnit: 310, // $263,500 total
    claimedPercent: 100, // $263,500
    aiVerifiedPercent: 100, // $263,500
    claimedAmount: 263500,
    aiVerifiedAmount: 263500,
    discrepancyAmount: 0,
    status: "approved"
  }
];

export default function CommercialIpcValuationEngine() {
  const [boqItems, setBoqItems] = useState<BoqItem[]>(SAMPLE_BOQ_ITEMS);
  const [retentionRatePercent, setRetentionRatePercent] = useState<number>(5); // 5% standard retention
  const [isIpcModalOpen, setIsIpcModalOpen] = useState<boolean>(false);
  const [ipcDispatchedMessage, setIpcDispatchedMessage] = useState<string | null>(null);

  // AI Audit State
  const [isAiAuditing, setIsAiAuditing] = useState<boolean>(false);
  const [aiAuditReport, setAiAuditReport] = useState<string | null>(null);

  // Financial Summary Totals
  const totalClaimedGross = boqItems.reduce((acc, item) => acc + item.claimedAmount, 0);
  const totalAiVerifiedGross = boqItems.reduce((acc, item) => acc + item.aiVerifiedAmount, 0);
  const totalDiscrepancyHeld = totalClaimedGross - totalAiVerifiedGross;
  
  const retentionDeduction = totalAiVerifiedGross * (retentionRatePercent / 100);
  const netPayableCertified = totalAiVerifiedGross - retentionDeduction;

  const handleRunAiQsAudit = async () => {
    setIsAiAuditing(true);
    try {
      const res = await fetch("/api/ai/commercial-ipc-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contractorName: "Apex Drywall Corp & MEP Electrical",
          totalClaimed: totalClaimedGross,
          totalVerified: totalAiVerifiedGross,
          period: "Month 7 (IPC #07)"
        })
      });
      const data = await res.json();
      setAiAuditReport(data.auditReport || "No audit report generated.");
    } catch (err) {
      console.error("Failed to run AI QS Audit:", err);
      setAiAuditReport(`### 🏛️ Commercial IPC #07 Quantity Surveyor Audit Report\n\n- **Gross Claimed**: $${totalClaimedGross.toLocaleString()}\n- **Visual Photogrammetry Verified**: $${totalAiVerifiedGross.toLocaleString()}\n- **Overclaim Protection Held**: $${totalDiscrepancyHeld.toLocaleString()}\n- **Net Certified Payout**: $${Math.round(netPayableCertified).toLocaleString()}`);
    } finally {
      setIsAiAuditing(false);
    }
  };

  const handleApproveIpc = () => {
    setIpcDispatchedMessage(`Interim Payment Certificate IPC #07 successfully certified! Net payable of $${netPayableCertified.toLocaleString()} approved for release with $${totalDiscrepancyHeld.toLocaleString()} held in overclaim protection.`);
    setIsIpcModalOpen(false);
    setTimeout(() => setIpcDispatchedMessage(null), 8000);
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
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                COMMERCIAL AI VALUATION & PROGRESS BILLING
              </span>
              <span className="bg-purple-500/20 text-purple-300 text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-purple-500/30">
                INTERIM PAYMENT CERTIFICATE (IPC) ENGINE
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <Calculator className="w-8 h-8 text-emerald-400 shrink-0" />
              BOQ Progress Valuation & IPC Billing Engine
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Eliminates contractor overbilling by matching visual 360° LiDAR detections directly against Bill of Quantities (BOQ) line items before issuing legally binding Interim Payment Certificates (IPC).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRunAiQsAudit}
              disabled={isAiAuditing}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Sparkles className={`w-4 h-4 ${isAiAuditing ? "animate-spin" : ""}`} />
              <span>{isAiAuditing ? "AI Auditing BOQ Claims..." : "Run AI Quantity Surveyor Audit"}</span>
            </button>

            <button 
              onClick={() => setIsIpcModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <FileCheck className="w-4 h-4" />
              Generate & Certify IPC #07
            </button>
          </div>
        </div>
      </div>

      {/* AI QS AUDIT REPORT DISPLAY */}
      {aiAuditReport && (
        <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-indigo-400 font-mono font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>AI QUANTITY SURVEYOR CERTIFICATION & OVERCLAIM AUDIT</span>
            </div>
            <button onClick={() => setAiAuditReport(null)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="markdown-body text-xs text-slate-200 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            <Markdown>{aiAuditReport}</Markdown>
          </div>
        </div>
      )}

      {/* SUCCESS BANNER ALERT */}
      {ipcDispatchedMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 p-4 rounded-xl text-emerald-200 text-xs font-bold flex items-center justify-between animate-fade-in shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{ipcDispatchedMessage}</span>
          </div>
          <button onClick={() => setIpcDispatchedMessage(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FINANCIAL SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Subcontractor Claimed (Gross)</div>
          <div className="text-xl font-black text-white mt-1">${totalClaimedGross.toLocaleString()}</div>
          <div className="text-xs text-slate-400 font-mono mt-1">Submitted in Month 7 Application</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-400 font-mono uppercase">AI-Verified Earned Value</div>
          <div className="text-xl font-black text-emerald-400 mt-1">${totalAiVerifiedGross.toLocaleString()}</div>
          <div className="text-xs text-emerald-300/80 font-mono mt-1">Based on LiDAR site photogrammetry</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Overclaim Protection Held</div>
          <div className="text-xl font-black text-rose-400 mt-1">${totalDiscrepancyHeld.toLocaleString()}</div>
          <div className="text-xs text-rose-300/80 font-mono mt-1">Unearned funds retained from payout</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="text-[10px] text-slate-400 font-mono uppercase">Net Payable Certified (Post-5% Ret.)</div>
          <div className="text-xl font-black text-indigo-400 mt-1">${netPayableCertified.toLocaleString()}</div>
          <div className="text-xs text-indigo-300/80 font-mono mt-1">Approved for IPC #07 Disbursement</div>
        </div>
      </div>

      {/* BOQ VALUATION COMPARISON MATRIX */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-400" />
              Bill of Quantities (BOQ) Claimed vs AI Verified Audit Ledger
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Automated visual proof audit for IPC Month 07</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400">Contract Retention Rate:</span>
            <select
              value={retentionRatePercent}
              onChange={(e) => setRetentionRatePercent(Number(e.target.value))}
              className="bg-slate-950 border border-slate-800 text-xs text-white px-3 py-1.5 rounded-lg focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value={3}>3% Retention</option>
              <option value={5}>5% Retention (Standard)</option>
              <option value={10}>10% Retention</option>
            </select>
          </div>
        </div>

        {/* BOQ TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                <th className="p-3">BOQ Ref</th>
                <th className="p-3">Description & Trade</th>
                <th className="p-3">Unit Rate</th>
                <th className="p-3">Claimed %</th>
                <th className="p-3">AI Verified %</th>
                <th className="p-3">Claimed ($)</th>
                <th className="p-3">AI Approved ($)</th>
                <th className="p-3">Deduction ($)</th>
                <th className="p-3 text-right">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {boqItems.map((item) => (
                <tr key={item.boqRef} className="hover:bg-slate-950/40 transition-colors">
                  <td className="p-3 font-bold text-emerald-400">{item.boqRef}</td>
                  <td className="p-3 font-sans font-semibold text-white max-w-xs">
                    <div>{item.description}</div>
                    <span className="text-[10px] font-mono text-slate-400">{item.trade}</span>
                  </td>
                  <td className="p-3 text-slate-300">${item.ratePerUnit}/{item.unit}</td>
                  <td className="p-3 text-slate-200">{item.claimedPercent}%</td>
                  <td className="p-3 font-bold text-emerald-400">{item.aiVerifiedPercent}%</td>
                  <td className="p-3 text-slate-300">${item.claimedAmount.toLocaleString()}</td>
                  <td className="p-3 font-bold text-white">${item.aiVerifiedAmount.toLocaleString()}</td>
                  <td className="p-3 font-bold text-rose-400">
                    {item.discrepancyAmount > 0 ? `-$${item.discrepancyAmount.toLocaleString()}` : "$0"}
                  </td>
                  <td className="p-3 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      item.status === "approved" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                      item.status === "discrepancy_held" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                      "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                    }`}>
                      {item.status.replace("_", " ")}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* IPC PREVIEW & DRAFT MODAL */}
      {isIpcModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl space-y-5 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base font-mono uppercase">
                  INTERIM PAYMENT CERTIFICATE (IPC #07)
                </h3>
              </div>
              <button 
                onClick={() => setIsIpcModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FORMAL IPC CERTIFICATE SHEET */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs text-slate-300 leading-relaxed">
              <div className="flex justify-between border-b border-slate-800 pb-2 text-[10px] text-slate-400">
                <span>PROJECT: CITY CENTER COMMERCIAL TOWER</span>
                <span>CERTIFICATE NO: IPC-2026-007</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Claimed Amount (Gross):</div>
                  <div className="text-sm font-bold text-slate-200">${totalClaimedGross.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">AI Verified Earned Value:</div>
                  <div className="text-sm font-bold text-emerald-400">${totalAiVerifiedGross.toLocaleString()}</div>
                </div>
              </div>

              <div className="p-3 bg-slate-900 rounded border border-slate-800 space-y-1.5">
                <div className="flex justify-between">
                  <span>Gross Earned Value:</span>
                  <span className="font-bold text-white">${totalAiVerifiedGross.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-300">
                  <span>Less Retention ({retentionRatePercent}%):</span>
                  <span>-${retentionDeduction.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-300">
                  <span>Overclaim Discrepancies Retained:</span>
                  <span>-${totalDiscrepancyHeld.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-800 pt-1.5 flex justify-between font-bold text-sm text-emerald-400">
                  <span>NET CERTIFIED PAYABLE:</span>
                  <span>${netPayableCertified.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal">
                This certificate is verified by automated 360° LiDAR photogrammetry. Payment release is subject to standard contractual terms.
              </p>
            </div>

            {/* MODAL ACTIONS */}
            <div className="flex items-center justify-end gap-3">
              <button 
                onClick={() => setIsIpcModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
              >
                Cancel
              </button>

              <button 
                onClick={handleApproveIpc}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <Send className="w-3.5 h-3.5" />
                Sign & Authorize IPC #07 Release
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

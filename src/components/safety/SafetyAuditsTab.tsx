import React, { useState } from "react";
import { 
  ClipboardCheck, 
  Search, 
  Plus, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  User, 
  FileText, 
  Activity, 
  Bookmark,
  Signature
} from "lucide-react";
import { useAudits } from "./useSafetyHooks";
import { SafetyAudit } from "./types";
import { motion, AnimatePresence } from "motion/react";

export default function SafetyAuditsTab() {
  const { audits, createAudit } = useAudits();
  const [selectedAudit, setSelectedAudit] = useState<SafetyAudit | null>(audits[0] || null);
  const [isAdding, setIsAdding] = useState(false);

  // Form states
  const [auditType, setAuditType] = useState("General Site Safety Inspection");
  const [auditor, setAuditor] = useState("");
  const [comments, setComments] = useState("");
  const [recommendations, setRecommendations] = useState("");
  const [signature, setSignature] = useState("");

  // Simple checklist questions based on selection
  const getQuestionsForType = (type: string) => {
    switch (type) {
      case "Electrical Safety":
        return [
          "Temporary distribution DB boards are weatherproof and locked.",
          "Residual Current Devices (RCD / RCCB) 30mA are installed and tested.",
          "Cables are elevated on hangers or safely sleeved.",
          "IP67 standard industrial plugs are utilized for tools."
        ];
      case "Scaffold Safety":
        return [
          "Scaffold foundations rest on solid sills.",
          "Couplers tightly torqued (35-50 Nm).",
          "Double handrails and toe-boards fully installed.",
          "Independent safety lifelines rigged above 1.8m."
        ];
      default:
        return [
          "Worker PPE compliant (Helmet, Vest, Safety Shoes).",
          "Barriers erected near slab edge openings.",
          "Fire extinguishers pressurized and inspected.",
          "Housekeeping cleared of masonry debris."
        ];
    }
  };

  const [checklistAnswers, setChecklistAnswers] = useState<Array<"Pass" | "Fail" | "N/A">>([
    "Pass", "Pass", "Pass", "Pass"
  ]);

  const handleAnswerChange = (index: number, val: "Pass" | "Fail" | "N/A") => {
    setChecklistAnswers(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditor || !signature) return;

    const questions = getQuestionsForType(auditType);
    const compiledChecklist = questions.map((q, idx) => ({
      id: `Q${idx + 1}`,
      question: q,
      status: checklistAnswers[idx] || "Pass"
    }));

    const passes = compiledChecklist.filter(c => c.status === "Pass").length;
    const totals = compiledChecklist.filter(c => c.status !== "N/A").length;
    const score = totals > 0 ? Math.round((passes / totals) * 100) : 100;

    const fresh = createAudit({
      auditType,
      auditor,
      date: new Date().toISOString().slice(0, 10),
      score,
      status: score >= 75 ? "Passed" : "Failed",
      checklist: compiledChecklist,
      photos: ["https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400"],
      comments,
      signatures: [`Auditor: ${auditor}`, `Signature Verify: ${signature}`],
      recommendations
    });

    setSelectedAudit(fresh);
    setIsAdding(false);

    // reset
    setAuditor("");
    setComments("");
    setRecommendations("");
    setSignature("");
    setChecklistAnswers(["Pass", "Pass", "Pass", "Pass"]);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (score >= 70) return "text-amber-650 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 font-sans">
      
      {/* Left panel list */}
      <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between h-[600px]">
        <div className="space-y-4 flex-1 flex flex-col min-h-0">
          
          <div className="flex justify-between items-center border-b border-slate-100 pb-2 shrink-0">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase font-mono">ISO Audit Trail</span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-0.5">Safety Audits</h4>
            </div>
            
            <button
              onClick={() => setIsAdding(true)}
              className="p-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs flex items-center justify-center shrink-0"
              title="Conduct New Audit"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
            {audits.map((audit) => (
              <button
                key={audit.id}
                onClick={() => { setSelectedAudit(audit); setIsAdding(false); }}
                className={`w-full text-left p-3 rounded-lg border transition flex justify-between items-center ${
                  selectedAudit?.id === audit.id && !isAdding
                    ? "bg-indigo-50 border-indigo-200 text-slate-900"
                    : "bg-white hover:bg-slate-50 border-slate-200 text-slate-600"
                }`}
              >
                <div className="space-y-1 pr-2 min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono font-bold text-slate-400">{audit.id}</span>
                    <span className="text-[10px] text-slate-450 font-mono font-bold">{audit.date}</span>
                  </div>
                  <span className="text-xs font-bold block truncate text-slate-800 leading-tight uppercase">{audit.auditType}</span>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">By: {audit.auditor.split(" ")[0]}</span>
                </div>

                <span className={`px-2 py-1 rounded text-xs font-bold font-mono border text-center ${getScoreColor(audit.score)}`}>
                  {audit.score}%
                </span>
              </button>
            ))}
          </div>

        </div>

        <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-mono flex justify-between shrink-0">
          <span>Safety Code compliance: verified</span>
          <span className="font-bold">TOTAL: {audits.length}</span>
        </div>
      </div>

      {/* Right details view / Form */}
      <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-xs h-[600px] overflow-y-auto">
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.form
              key="audit-add-form"
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                <div>
                  <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono">Conduct Audit</span>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-0.5">ISO 45001 Site Inspection Checklist</h3>
                </div>
                <button 
                  type="button" onClick={() => setIsAdding(false)}
                  className="text-xs px-2.5 py-1.5 border rounded-lg hover:bg-slate-50 text-slate-650 font-bold uppercase tracking-wider"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Audit Template Type</label>
                  <select 
                    value={auditType}
                    onChange={(e)=>setAuditType(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg focus:outline-hidden"
                  >
                    <option value="General Site Safety Inspection">General Site Safety Inspection</option>
                    <option value="Electrical Safety">Electrical Safety</option>
                    <option value="Scaffold Safety">Scaffold Safety</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Assigned Inspector Name</label>
                  <input 
                    type="text" required placeholder="e.g. Sunita Roy"
                    value={auditor} onChange={(e)=>setAuditor(e.target.value)}
                    className="w-full text-xs p-2 border rounded-lg focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Dynamic Checklist Render */}
              <div className="space-y-2.5">
                <span className="text-[10px] text-indigo-600 font-bold uppercase font-mono tracking-wider block">Questionnaire Checklist Verification</span>
                
                <div className="space-y-2">
                  {getQuestionsForType(auditType).map((q, idx) => (
                    <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <p className="text-xs font-sans text-slate-700 leading-snug font-medium flex-1 pr-4">{idx+1}. {q}</p>
                      
                      <div className="flex gap-1.5">
                        {["Pass", "Fail", "N/A"].map((opt: any) => (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => handleAnswerChange(idx, opt)}
                            className={`text-[10px] font-mono px-2 py-1 rounded border transition font-bold ${
                              checklistAnswers[idx] === opt
                                ? opt === "Pass" 
                                  ? "bg-emerald-600 border-emerald-600 text-white" 
                                  : opt === "Fail"
                                    ? "bg-rose-600 border-rose-600 text-white"
                                    : "bg-slate-500 border-slate-500 text-white"
                                : "bg-white hover:bg-slate-100 text-slate-605 border-slate-200"
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Auditor General Comments</label>
                  <textarea rows={2} placeholder="Observations, masonry debris status..." value={comments} onChange={(e)=>setComments(e.target.value)} className="w-full text-xs p-2 border rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Prescriptive Recommendations</label>
                  <textarea rows={2} placeholder="Toolbox talk instructions, scaffold re-tag orders..." value={recommendations} onChange={(e)=>setRecommendations(e.target.value)} className="w-full text-xs p-2 border rounded-lg" />
                </div>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 space-y-2">
                <span className="text-[9px] text-indigo-400 font-bold uppercase font-mono flex items-center gap-1">
                  <Signature className="w-3.5 h-3.5" /> SECURE AUDITOR SIGNATURE
                </span>
                <input 
                  type="text" required placeholder="Type your full name to sign this digital ISO audit"
                  value={signature} onChange={(e)=>setSignature(e.target.value)}
                  className="w-full text-xs p-2 border border-slate-700 bg-slate-950 rounded text-white focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition uppercase tracking-wider"
              >
                Submit Signed ISO Safety Audit
              </button>
            </motion.form>
          ) : selectedAudit ? (
            <motion.div
              key="audit-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-5 text-slate-700"
            >
              
              {/* Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-3 flex-wrap gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono text-indigo-600 font-bold">{selectedAudit.id}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className="text-[10px] text-slate-400 font-mono">{selectedAudit.date}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight mt-0.5">{selectedAudit.auditType}</h3>
                </div>

                <div className="flex gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono border ${
                    selectedAudit.status === "Passed" 
                      ? "bg-emerald-50 text-emerald-705 border-emerald-150" 
                      : "bg-rose-50 text-rose-705 border-rose-150"
                  }`}>
                    {selectedAudit.status}
                  </span>
                  
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${getScoreColor(selectedAudit.score)}`}>
                    Score: {selectedAudit.score}%
                  </span>
                </div>
              </div>

              {/* Auditor Info */}
              <div className="bg-slate-50 border p-3 rounded-lg text-[11px] flex justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Assigned Lead Auditor</span>
                  <strong className="text-slate-800">{selectedAudit.auditor}</strong>
                </div>
                <div>
                  <span className="text-[9px] text-slate-400 uppercase font-mono block">Audit Verification signatures</span>
                  <span className="font-mono text-indigo-700 font-bold">{selectedAudit.signatures.join(" | ")}</span>
                </div>
              </div>

              {/* Checklist results */}
              <div className="space-y-2">
                <span className="text-[10px] text-slate-450 font-mono font-bold uppercase block">Checklist Verification responses</span>
                
                <div className="space-y-1.5 text-[11px] font-sans">
                  {selectedAudit.checklist.map((c, i) => (
                    <div key={c.id} className="p-2 border rounded-md flex justify-between items-center bg-white border-slate-150">
                      <div className="flex gap-2 min-w-0 flex-1 pr-3">
                        <span className="font-mono text-slate-400">Q{i+1}.</span>
                        <p className="text-slate-700 leading-snug font-medium truncate">{c.question}</p>
                      </div>

                      <div className="flex gap-2 items-center shrink-0">
                        {c.notes && (
                          <span className="text-[9px] font-mono text-rose-500 font-bold tracking-tight shrink-0">Note: {c.notes}</span>
                        )}
                        <span className={`px-1.5 py-0.2 rounded font-mono font-bold uppercase text-[9px] border ${
                          c.status === "Pass" 
                            ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                            : (c.status === "Fail" ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-slate-50 text-slate-500 border-slate-100")
                        }`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1">
                  <span className="text-[10px] text-slate-450 font-mono font-bold uppercase block">Auditor comments</span>
                  <p className="text-[11px] leading-relaxed text-slate-605 bg-slate-50/50 p-2.5 border rounded-lg">{selectedAudit.comments}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-450 font-mono font-bold uppercase block">remediation recommendation</span>
                  <p className="text-[11px] leading-relaxed text-slate-605 bg-slate-50/50 p-2.5 border rounded-lg">{selectedAudit.recommendations}</p>
                </div>
              </div>

            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-xs">
              Select an audit from the ISO ledger list to review checklist compliance details.
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

import React, { useState } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Code2,
  Compass,
  Cpu,
  Database,
  Eye,
  FileCode2,
  GitBranch,
  HelpCircle,
  Layers,
  Milestone,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  TestTube2,
  Workflow,
  Check,
  ChevronRight,
  ListTodo
} from "lucide-react";

interface TaskList {
  backend: string[];
  frontend: string[];
  ai: string[];
  database: string[];
  testing: string[];
  deployment: string[];
}

interface MilestoneData {
  id: string;
  version: string;
  title: string;
  duration: string;
  status: "completed" | "current" | "upcoming";
  objectives: string[];
  deliverables: string[];
  tasks: TaskList;
  acceptanceCriteria: string[];
  progress: number;
}

export default function RoadmapViewer() {
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>("m1");
  const [activeTaskView, setActiveTaskView] = useState<keyof TaskList>("backend");

  const milestones: MilestoneData[] = [
    {
      id: "m1",
      version: "v0.1",
      title: "Foundation, Multitenancy & Spatial Schema",
      duration: "3 Weeks",
      status: "completed",
      progress: 100,
      objectives: [
        "Establish secure multitenant organization schema partition.",
        "Configure TypeORM model mapping for physical hierarchies (Projects -> Buildings -> Floors -> Rooms).",
        "Implement JWT Passport access strategies with rigid Role-Based Access Control (RBAC)."
      ],
      deliverables: [
        "Fully provisioned PostgreSQL database mapped with primary indices.",
        "AuthModule with /auth/login, /auth/register, and /auth/me endpoints.",
        "Global NestJS RolesGuard to intercept and block unauthorized client requests."
      ],
      tasks: {
        backend: [
          "Scaffold NestJS repository with rigid absolute imports.",
          "Write AuthModule using @nestjs/jwt and passport-jwt strategies.",
          "Develop UsersModule and OrganizationsModule with standard CRUD endpoints.",
          "Construct logical hierarchy controllers for Buildings, Floors, and Rooms."
        ],
        frontend: [
          "Design enterprise login panel with state-based cookie saving.",
          "Build multi-pane layout to switch between Project dashboards.",
          "Develop hierarchical directory navigation for architectural assets."
        ],
        ai: [
          "Define Python-based FastAPI mock server wrapper to test early endpoint ping latencies."
        ],
        database: [
          "Design SQL schema mapping relational fields and indexing primary keys.",
          "Configure Drizzle/TypeORM migrations scripts.",
          "Seed dummy databases with 1 baseline project containing 1 Building block, 4 Floors, and 8 Rooms."
        ],
        testing: [
          "Write Jest unit tests for validateUser and login methods (AuthService).",
          "Conduct complete boundary E2E tests for registration validation errors."
        ],
        deployment: [
          "Deploy early stage test server to Cloud Run behind custom development URLs.",
          "Set up automatic GitHub Actions pipeline triggering linters."
        ]
      },
      acceptanceCriteria: [
        "Unauthorized client requests return standard HTTP 401 Unauthorized status.",
        "Users can log in and retrieve session information corresponding to their designated role scope.",
        "All database tables successfully migrate and relationships are maintained."
      ]
    },
    {
      id: "m2",
      version: "v0.3",
      title: "Drone Photogrammetry Ingestion & Storage Pipeline",
      duration: "4 Weeks",
      status: "current",
      progress: 75,
      objectives: [
        "Implement high-throughput file upload endpoint supporting chunks up to 450MB.",
        "Configure private cloud object storage adapter to host survey video stream records.",
        "Register background queue nodes to handle heavy files without freezing HTTP threads."
      ],
      deliverables: [
        "StorageModule integrating private cloud object storage streams.",
        "Redis-backed BullMQ task queue to handle asynchronous video processing.",
        "Visual feedback component showing live upload progress on frontend."
      ],
      tasks: {
        backend: [
          "Build VideosModule with chunked file stream upload endpoint.",
          "Implement StorageService supporting file upload, signature keys generation, and file deletion.",
          "Configure QueuesService using @nestjs/bull and Redis stream engines."
        ],
        frontend: [
          "Design interactive drag-and-drop file upload stage.",
          "Implement polling logic to query server for processing queue state.",
          "Design progress status widgets with dynamic percentage animations."
        ],
        ai: [
          "Build Dockerized PyTorch environment loaded with base YOLOv8 model.",
          "Write simple frame parsing service extracting keyframes at 1-second intervals."
        ],
        database: [
          "Create 'videos' and 'frames' database models referencing rooms.",
          "Index video records with status flags (QUEUED, PROCESSING, COMPLETED, FAILED)."
        ],
        testing: [
          "Run performance benchmark testing multi-user concurrent 200MB file uploads.",
          "Test Redis worker recovery under simulated container crash scenarios."
        ],
        deployment: [
          "Deploy Redis Cache server alongside Cloud Run.",
          "Configure memory allocation limits for the upload container instances."
        ]
      },
      acceptanceCriteria: [
        "Upload chunk engine does not consume server memory over 512MB during heavy file transfers.",
        "Videos are correctly stored in private cloud object storage and retrieved via temporary signed URLs.",
        "BullMQ asynchronously picks up uploaded videos and spawns keyframe extraction tasks."
      ]
    },
    {
      id: "m3",
      version: "v0.6",
      title: "AI Neural Engine Integration (YOLO & Alignment)",
      duration: "5 Weeks",
      status: "upcoming",
      progress: 0,
      objectives: [
        "Deploy fine-tuned YOLO model for rebar detection and stirrup spacing measurements.",
        "Configure OpenCV photogrammetric alignment algorithms mapping drone keyframes with IFC drawings.",
        "Implement confidence scoring parameters to reject noisy or blur frames."
      ],
      deliverables: [
        "Isolated Python FastAPI AI worker cluster running on GPU-enabled instances.",
        "AI module inside NestJS proxying requests to the neural model cluster.",
        "Visual annotation UI overlaying detected rebars directly on drone video frame snapshots."
      ],
      tasks: {
        backend: [
          "Write internal HTTP client service in NestJS to relay jobs to the AI cluster.",
          "Build WebSockets gateway to push live bounding boxes to the client UI.",
          "Implement automatic retry policy with exponential backoff for worker nodes."
        ],
        frontend: [
          "Build canvas component to draw and label YOLO bounding boxes.",
          "Develop split-pane view contrasting drone photogrammetry side-by-side with 3D BIM models.",
          "Design warning indicators for elements failing physical threshold limits."
        ],
        ai: [
          "Train Custom YOLOv8 model on a labeled dataset of rebar stirrups and steel rebar structures.",
          "Implement perspective correction script using known concrete dimensions.",
          "Write spatial alignment algorithms matching drone viewpoint with architectural coordinate grids."
        ],
        database: [
          "Create 'anomalies' and 'annotations' schemas with 3D coordinate boundaries.",
          "Add spatial indexing triggers for room mapping zones."
        ],
        testing: [
          "Run validation tests on YOLO model evaluating precision, recall, and F1 scores.",
          "Audit spatial drift deviation under variable ambient lighting scenarios."
        ],
        deployment: [
          "Deploy AI cluster on GPU-enabled cloud nodes with automatic scale-to-zero configurations.",
          "Build continuous pipeline to retrain and update models."
        ]
      },
      acceptanceCriteria: [
        "YOLO stirrup detection achieves a mean Average Precision (mAP) exceeding 88%.",
        "Spatial alignment drift stays below 15mm under normal ambient lighting conditions.",
        "The system correctly triggers warnings when rebar spacing exceeds structural specification tolerances."
      ]
    },
    {
      id: "m4",
      version: "v0.8",
      title: "S-Curve Analytics, Schedule Sync, & RERA Guardrails",
      duration: "4 Weeks",
      status: "upcoming",
      progress: 0,
      objectives: [
        "Build mathematics calculator to derive cumulative project S-Curves.",
        "Integrate scheduling systems (Primavera P6 or MS Project XML sheets).",
        "Implement compliance checkers translating regional RERA physical safety laws into code rules."
      ],
      deliverables: [
        "ProgressModule with cumulative analytics compilation services.",
        "Interactive S-Curve visualizer charting baseline planned vs physical progress.",
        "RERA Audit check board identifying scheduled delays and structural issues."
      ],
      tasks: {
        backend: [
          "Write XML parsing algorithms extracting schedule timelines.",
          "Implement mathematics calculator deriving weekly scheduled progress percentages.",
          "Build compliance validator class mapping physical issues into active RERA warning levels."
        ],
        frontend: [
          "Integrate Recharts line charts with customized tooltips.",
          "Develop milestone tracker showing active critical path tasks.",
          "Create safety check list view with sorting filters."
        ],
        ai: [
          "Develop predictive regression models forecasting future milestone delays based on current S-Curve trends."
        ],
        database: [
          "Add 'schedule_milestones' and 's_curve_points' models.",
          "Design views to fetch consolidated monthly project progress metrics."
        ],
        testing: [
          "Verify math calculation outputs matching Primavera P6 baseline totals.",
          "Conduct regression tests on scheduling parser using complex, corrupted, or deep XML structures."
        ],
        deployment: [
          "Configure cloud databases read-replicas to speed up heavy dashboard reporting requests.",
          "Set up weekly database snapshot backups."
        ]
      },
      acceptanceCriteria: [
        "S-Curve generator parses MS Project XML files and maps milestone sequences within 1.5 seconds.",
        "Dashboard metrics load within 200ms by utilizing cached material database views.",
        "RERA compliance checker detects physical deviations and marks critical anomalies."
      ]
    },
    {
      id: "m5",
      version: "v0.9",
      title: "Immutable Auditing, Enterprise Reporting & Alerts",
      duration: "3 Weeks",
      status: "upcoming",
      progress: 0,
      objectives: [
        "Develop PDF template engine to compile immutable daily construction progress records.",
        "Build cron scheduler supporting automated report distribution schedules.",
        "Implement critical telemetry alerts via SMTP emails and push endpoints."
      ],
      deliverables: [
        "ReportsModule compiling secure static PDF files including drone keyframe photos.",
        "Cron scheduler worker managing automated report compilation intervals.",
        "SMTP email template notifier with responsive attachments layout."
      ],
      tasks: {
        backend: [
          "Write PDF layout structure using pdfkit and embedded font sheets.",
          "Implement SchedulerModule using @nestjs/schedule cron decorators.",
          "Configure MailerModule supporting templates rendering and attachments stream piping."
        ],
        frontend: [
          "Design report compiler workspace with customized filtering options.",
          "Develop reports history catalog with instant download buttons.",
          "Create interactive scheduling calendar to configure automated email reports."
        ],
        ai: [
          "Implement summarization engine compiling long physical error lists into plain language bullets."
        ],
        database: [
          "Create 'report_schedules' and 'compiled_reports' schemas.",
          "Add indexes on generated records to optimize historical searches."
        ],
        testing: [
          "Test report compiler memory foot-print while rendering documents containing > 50 keyframe images.",
          "Verify email rendering across popular platforms (Gmail, Outlook, mobile interfaces)."
        ],
        deployment: [
          "Configure secure SMTP credentials in cloud secrets managers.",
          "Set up cloud tasks queues to handle delayed email distribution retries."
        ]
      },
      acceptanceCriteria: [
        "PDF progress reports compile cleanly and contain high-res visual references.",
        "Cron jobs correctly execute at specified times and dispatch reports with valid files.",
        "Email notifications successfully send to stakeholders upon detection of critical physical anomalies."
      ]
    },
    {
      id: "m6",
      version: "v1.0",
      title: "Enterprise Stabilization, Security & Production Launch",
      duration: "4 Weeks",
      status: "upcoming",
      progress: 0,
      objectives: [
        "Conduct thorough penetration testing and audit security headers.",
        "Optimize SQL queries and configure caching layer via Redis.",
        "Launch production clusters with complete failover clustering."
      ],
      deliverables: [
        "Production-ready backend cluster deployed across multi-zone Cloud Run setups.",
        "Comprehensive security audit and penetration reports.",
        "Full Version 1.0 release ready for enterprise-wide deployment."
      ],
      tasks: {
        backend: [
          "Enable security headers using helmet and configure strict CORS policies.",
          "Implement query pagination and cache results for heavy dashboard endpoints.",
          "Set up rate-limiting middleware to protect public endpoints from DDoS."
        ],
        frontend: [
          "Optimize build bundle sizes and lazy-load visual-heavy dashboards.",
          "Implement offline service workers to cache basic layout configurations.",
          "Conduct complete usability testing session with construction site supervisors."
        ],
        ai: [
          "Optimize PyTorch inference runtimes using TensorRT conversion.",
          "Verify GPU worker auto-scaling thresholds."
        ],
        database: [
          "Execute database index optimizations based on query analyzer logs.",
          "Verify point-in-time recovery setups and failover databases."
        ],
        testing: [
          "Run OWASP ZAP security scan detecting vulnerabilities.",
          "Perform load tests with k6 simulating 500 concurrent users."
        ],
        deployment: [
          "Deploy Production cluster across multi-zone container registries.",
          "Set up Datadog telemetry dashboards monitoring system health."
        ]
      },
      acceptanceCriteria: [
        "All critical and high severity security vulnerability findings resolved.",
        "95th percentile API response latency stays under 180ms during load tests.",
        "Failover clusters successfully take over within 5 seconds during simulated primary node crashes."
      ]
    }
  ];

  const activeMilestone = milestones.find(m => m.id === selectedMilestoneId) || milestones[0];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col font-sans">
      
      {/* 1. SUITE HEADER */}
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-[9px] rounded uppercase tracking-wider">
              production roadmap
            </span>
            <h2 className="text-lg font-black tracking-tight">Enterprise Delivery Roadmap to Version 1.0</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            An interactive multi-tier release roadmap detailing technical milestones, objectives, database tasks, and quality parameters.
          </p>
        </div>

        {/* Dynamic timeline badge */}
        <div className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-lg text-xs font-mono shrink-0">
          <span className="text-[9px] text-slate-500 block uppercase font-bold">total estimation</span>
          <span className="text-white font-bold">23 Weeks to v1.0 Launch</span>
        </div>
      </div>

      {/* 2. OVERALL TIMELINE PROGRESS BOARD */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <span className="text-[10px] text-slate-400 uppercase font-black block">Overall Completion</span>
          <div className="flex items-center gap-3 mt-1">
            <div className="h-2 bg-slate-200 rounded-full flex-1 overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: "29%" }}></div>
            </div>
            <span className="font-mono text-xs font-black text-slate-700">29% Complete</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-black block">Active Phase</span>
          <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5 mt-1">
            <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-ping"></span>
            Milestone 2 (v0.3) &bull; Drone Ingestion
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase font-black block">Quality Gate Checks</span>
          <span className="font-mono text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
            <ShieldCheck className="w-4 h-4" />
            OWASP & RERA standards active
          </span>
        </div>
      </div>

      {/* 3. ROADMAP LAYOUT STAGE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        
        {/* MILESTONE TIMELINE TRACK (4 Columns) */}
        <div className="lg:col-span-4 bg-slate-50/50 border-r border-slate-200 p-4 flex flex-col gap-3">
          <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block mb-1">
            Milestones Timeline
          </span>

          <div className="flex flex-col gap-2.5">
            {milestones.map((m) => {
              const isSelected = m.id === selectedMilestoneId;
              
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMilestoneId(m.id)}
                  className={`p-3 text-left rounded-lg border transition flex items-start gap-3 relative overflow-hidden ${
                    isSelected
                      ? "bg-white border-indigo-500 shadow-sm ring-1 ring-indigo-500/20"
                      : "bg-white/40 hover:bg-white border-slate-200"
                  }`}
                >
                  {/* Left accent bar */}
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600"></div>
                  )}

                  {/* Icon depending on status */}
                  <div className="mt-0.5 shrink-0">
                    {m.status === "completed" && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                    {m.status === "current" && (
                      <Clock className="w-4 h-4 text-indigo-500 animate-pulse" />
                    )}
                    {m.status === "upcoming" && (
                      <Compass className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        {m.version}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400 flex items-center gap-0.5">
                        <Calendar className="w-3 h-3" />
                        {m.duration}
                      </span>
                    </div>

                    <h4 className={`text-xs font-black mt-1.5 truncate ${isSelected ? "text-indigo-950" : "text-slate-700"}`}>
                      {m.title}
                    </h4>

                    {/* Progress micro-bar */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1 bg-slate-100 rounded-full flex-1 overflow-hidden">
                        <div 
                          className={`h-full ${m.status === "completed" ? "bg-emerald-500" : "bg-indigo-600"}`}
                          style={{ width: `${m.progress}%` }}
                        ></div>
                      </div>
                      <span className="font-mono text-[9px] text-slate-400 font-bold">{m.progress}%</span>
                    </div>

                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-4 bg-slate-900 text-slate-300 p-4 rounded-lg border border-slate-800 text-[11px] leading-relaxed">
            <span className="text-[9px] text-slate-500 uppercase font-black block mb-1">Methodology Guideline</span>
            <p>
              Each milestone uses an <strong>Agile Scrum workflow</strong> with bi-weekly sprint reviews. Transition to upcoming milestones requires 100% test coverage sign-off on previous deliverable sets.
            </p>
          </div>

        </div>

        {/* SELECTED MILESTONE DETAILS WORKSPACE (8 Columns) */}
        <div className="lg:col-span-8 p-6 flex flex-col gap-6 overflow-y-auto max-h-[640px] bg-slate-50/20">
          
          {/* Milestone Banner */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3 relative">
            <div className="flex items-center justify-between">
              <span className="font-mono font-black text-sm bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded">
                Milestone: {activeMilestone.version}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                activeMilestone.status === "completed" ? "bg-emerald-100 text-emerald-800" :
                activeMilestone.status === "current" ? "bg-indigo-100 text-indigo-800 animate-pulse" :
                "bg-slate-100 text-slate-500"
              }`}>
                {activeMilestone.status}
              </span>
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900">{activeMilestone.title}</h3>
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
                <Clock className="w-3.5 h-3.5" /> Scheduled duration: {activeMilestone.duration} &bull; Quality checks active
              </p>
            </div>
          </div>

          {/* OBJECTIVES & DELIVERABLES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            
            {/* Objectives */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
              <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-indigo-500" />
                Strategic Objectives
              </h4>
              <ul className="flex flex-col gap-2 text-slate-600 leading-relaxed">
                {activeMilestone.objectives.map((obj, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0"></span>
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverables */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col gap-3">
              <h4 className="font-black text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Core Deliverables
              </h4>
              <ul className="flex flex-col gap-2 text-slate-600 leading-relaxed">
                {activeMilestone.deliverables.map((del, idx) => (
                  <li key={idx} className="flex gap-2 items-start">
                    <div className="p-0.5 bg-emerald-50 text-emerald-600 rounded shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                    <span>{del}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* CORE TASK BOARD BY SEGMENT */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            
            {/* Task filter selector */}
            <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap gap-1">
              {[
                { id: "backend", label: "Backend Core", icon: <Terminal className="w-3.5 h-3.5" /> },
                { id: "frontend", label: "Frontend UI", icon: <Code2 className="w-3.5 h-3.5" /> },
                { id: "ai", label: "AI Neural Tasks", icon: <Cpu className="w-3.5 h-3.5" /> },
                { id: "database", label: "Database SQL", icon: <Database className="w-3.5 h-3.5" /> },
                { id: "testing", label: "Testing & QA", icon: <TestTube2 className="w-3.5 h-3.5" /> },
                { id: "deployment", label: "Deployment/DevOps", icon: <Rocket className="w-3.5 h-3.5" /> }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTaskView(tab.id as any)}
                  className={`px-3 py-1.5 rounded text-[11px] font-bold flex items-center gap-1.5 transition ${
                    activeTaskView === tab.id
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-transparent text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Task list view */}
            <div className="p-5 flex flex-col gap-3 text-xs leading-relaxed">
              <span className="text-[9px] text-slate-400 uppercase font-bold block mb-1">
                {activeTaskView.toUpperCase()} Work items
              </span>

              <div className="flex flex-col gap-2">
                {activeMilestone.tasks[activeTaskView].map((task, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200/60 rounded-lg flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-[10px] font-mono font-bold flex items-center justify-center text-slate-500">
                        {idx + 1}
                      </span>
                      <span className="text-slate-700 font-medium">{task}</span>
                    </div>

                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-mono rounded font-bold uppercase tracking-wider shrink-0">
                      pending
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* ACCEPTANCE CRITERIA BOX */}
          <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 flex flex-col gap-3 text-xs leading-relaxed">
            <h4 className="font-bold text-indigo-400 uppercase text-[10px] tracking-wider border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              Acceptance Criteria Gate
            </h4>
            <div className="flex flex-col gap-2.5 text-slate-300">
              {activeMilestone.acceptanceCriteria.map((crit, idx) => (
                <div key={idx} className="flex gap-2.5 items-start">
                  <div className="p-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span>{crit}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

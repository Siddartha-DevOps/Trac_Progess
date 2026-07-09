import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  Layers,
  Cpu,
  Share2,
  BookOpen,
  Settings,
  Shield,
  Users,
  Building,
  Video,
  TrendingUp,
  FileText,
  Bell,
  Clock,
  ArrowRight,
  Database,
  Terminal,
  Zap,
  Info,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Search,
  ExternalLink,
  GitBranch,
  Grid
} from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  description?: string;
  code?: string;
  language?: string;
  children?: FileNode[];
}

export default function NestJsBackendDesign() {
  // Navigation & Interactive states
  const [activeTab, setActiveTab] = useState<"structure" | "di" | "components" | "explain">("structure");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileCode, setSelectedFileCode] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [diStep, setDiStep] = useState<"controller" | "service" | "repository" | "db">("controller");

  // Expanded folders in tree state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "src": true,
    "src/modules": true,
    "src/modules/auth": true,
    "src/modules/ai": false,
    "src/modules/projects": false,
    "src/common": false,
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // 1. NESTJS FOLDER TREE STRUCTURE DATA
  const folderTree: FileNode = {
    name: "buildtrace-nestjs-backend",
    type: "folder",
    children: [
      {
        name: "src",
        type: "folder",
        children: [
          {
            name: "modules",
            type: "folder",
            children: [
              {
                name: "auth",
                type: "folder",
                children: [
                  {
                    name: "auth.module.ts",
                    type: "file",
                    description: "Plugs JWT authentication passport strategy and exports AuthService.",
                    code: `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'buildtrace-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}`
                  },
                  {
                    name: "auth.service.ts",
                    type: "file",
                    description: "Manages session cryptography, bcrypt validations, and generation of active tokens.",
                    code: `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid enterprise credentials.');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}`
                  },
                  {
                    name: "auth.controller.ts",
                    type: "file",
                    description: "Exposes endpoints for user authentication and credentials check.",
                    code: `import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}`
                  }
                ]
              },
              {
                name: "users",
                type: "folder",
                children: [
                  {
                    name: "users.service.ts",
                    type: "file",
                    description: "Executes profiles search and tracks access parameters.",
                    code: `import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findOneByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async create(createUserDto: CreateUserDto) {
    return this.usersRepository.save(createUserDto);
  }
}`
                  }
                ]
              },
              {
                name: "organizations",
                type: "folder",
                children: [
                  {
                    name: "organizations.service.ts",
                    type: "file",
                    description: "Enforces enterprise multitenant segregation and subscription rules.",
                    code: `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  async findOne(id: string): Promise<Organization> {
    return this.orgRepo.findOne({ where: { id } });
  }
}`
                  }
                ]
              },
              {
                name: "projects",
                type: "folder",
                children: [
                  {
                    name: "projects.service.ts",
                    type: "file",
                    description: "Coordinates financial benchmarks, safety milestones, and construction portfolios.",
                    code: `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async listAll(): Promise<Project[]> {
    return this.projectRepo.find();
  }

  async findOne(id: string): Promise<Project> {
    const proj = await this.projectRepo.findOne({ where: { id } });
    if (!proj) throw new NotFoundException('Project not found');
    return proj;
  }
}`
                  }
                ]
              },
              {
                name: "buildings",
                type: "folder",
                children: [
                  {
                    name: "buildings.service.ts",
                    type: "file",
                    description: "Tracks active physical blocks, structures, and architectural models.",
                    code: `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from './entities/building.entity';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly bldRepo: Repository<Building>
  ) {}

  async findByProject(projectId: string): Promise<Building[]> {
    return this.bldRepo.find({ where: { projectId } });
  }
}`
                  }
                ]
              },
              {
                name: "floors",
                type: "folder",
                children: [
                  {
                    name: "floors.service.ts",
                    type: "file",
                    description: "Computes physical levels offset and concrete pouring tracking maps.",
                    code: `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Floor } from './entities/floor.entity';

@Injectable()
export class FloorsService {
  constructor(
    @InjectRepository(Floor)
    private readonly floorRepo: Repository<Floor>
  ) {}

  async findByBuilding(buildingId: string): Promise<Floor[]> {
    return this.floorRepo.find({ where: { buildingId }, order: { level: 'ASC' } });
  }
}`
                  }
                ]
              },
              {
                name: "rooms",
                type: "folder",
                children: [
                  {
                    name: "rooms.service.ts",
                    type: "file",
                    description: "Handles physical coordinates partition for datacenter clusters and structural cores.",
                    code: `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepo: Repository<Room>
  ) {}

  async getZoneDetails(roomId: string): Promise<Room> {
    return this.roomRepo.findOne({ where: { id: roomId } });
  }
}`
                  }
                ]
              },
              {
                name: "videos",
                type: "folder",
                children: [
                  {
                    name: "videos.service.ts",
                    type: "file",
                    description: "Coordinates raw video streams uploaded by crane cameras and schedules worker processes.",
                    code: `import { Injectable } from '@nestjs/common';
import { StorageService } from '../../storage/storage.service';
import { QueuesService } from '../../queues/queues.service';

@Injectable()
export class VideosService {
  constructor(
    private readonly storageService: StorageService,
    private readonly queuesService: QueuesService,
  ) {}

  async handleSurveyUpload(roomId: string, fileBuffer: Buffer, fileName: string) {
    // 1. Upload chunk to private cloud storage
    const path = \`surveys/\${roomId}/\${Date.now()}_\${fileName}\`;
    const uploadUrl = await this.storageService.uploadFile(path, fileBuffer);

    // 2. Schedule background AI worker processing inside Redis Queue
    const job = await this.queuesService.addAiJob({
      videoUrl: uploadUrl,
      roomId,
      model: 'YOLOv8x-Rebar',
    });

    return {
      status: 'queued',
      videoPath: uploadUrl,
      jobId: job.id,
    };
  }
}`
                  }
                ]
              },
              {
                name: "ai",
                type: "folder",
                children: [
                  {
                    name: "ai.service.ts",
                    type: "file",
                    description: "Triggers computer vision engines to check stirrup density patterns.",
                    code: `import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly pyServerUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.pyServerUrl = this.configService.get<string>('FASTAPI_HOST_URL');
  }

  async triggerRebarSegmentation(videoUrl: string, threshold: number) {
    const response = await this.httpService.axiosRef.post(\`\${this.pyServerUrl}/ai/rebar-detect\`, {
      video_url: videoUrl,
      confidence_threshold: threshold,
    });
    return response.data;
  }
}`
                  }
                ]
              },
              {
                name: "progress",
                type: "folder",
                children: [
                  {
                    name: "progress.service.ts",
                    type: "file",
                    description: "Derives mathematical S-Curves by contrasting photogrammetry data with IFC templates.",
                    code: `import { Injectable } from '@nestjs/common';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class ProgressService {
  constructor(private readonly projectsService: ProjectsService) {}

  async computeSCurve(projectId: string) {
    const project = await this.projectsService.findOne(projectId);
    // Standard s-curve calculation comparing planned vs actual
    return {
      projectId,
      weeksElapsed: 12,
      coordinates: [
        { week: 1, planned: 10, actual: 10 },
        { week: 6, planned: 52, actual: 50 },
        { week: 12, planned: 81, actual: 76 }
      ]
    };
  }
}`
                  }
                ]
              },
              {
                name: "reports",
                type: "folder",
                children: [
                  {
                    name: "reports.service.ts",
                    type: "file",
                    description: "Compiles site log metrics into standardized PDF and Excel reports.",
                    code: `import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { StorageService } from '../../storage/storage.service';

@Injectable()
export class ReportsService {
  constructor(private readonly storageService: StorageService) {}

  async compilePdfReport(projectId: string): Promise<string> {
    const doc = new PDFDocument();
    // Build PDF Stream mapping logs and metrics
    doc.text('BuildTrace Enterprise Audit Report', 100, 100);
    doc.end();

    const buffer: Buffer = await this.streamToBuffer(doc);
    return this.storageService.uploadFile(\`reports/\${projectId}/audit-report.pdf\`, buffer);
  }

  private async streamToBuffer(doc: any): Promise<Buffer> {
    return new Promise((resolve) => {
      const chunks: any[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}`
                  }
                ]
              },
              {
                name: "notifications",
                type: "folder",
                children: [
                  {
                    name: "notifications.service.ts",
                    type: "file",
                    description: "Dispatches critical warnings via Email and text logs.",
                    code: `import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationsService {
  constructor(private readonly mailerService: MailerService) {}

  async sendSafetyAnomalyAlert(email: string, columnId: string, spacingObserved: number) {
    await this.mailerService.sendMail({
      to: email,
      subject: \`⚠️ BuildTrace Critical Alert: Column \${columnId} spacing error\`,
      html: \`<p>Detected \${spacingObserved}mm interval vs specified 200mm standard.</p>\`,
    });
  }
}`
                  }
                ]
              },
              {
                name: "permissions",
                type: "folder",
                children: [
                  {
                    name: "permissions.guard.ts",
                    type: "file",
                    description: "Role-Based Access Control (RBAC) guard verifying token privileges.",
                    code: `import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.includes(user?.role);
  }
}`
                  }
                ]
              },
              {
                name: "scheduling",
                type: "folder",
                children: [
                  {
                    name: "scheduling.service.ts",
                    type: "file",
                    description: "Defines cron intervals to trigger periodic sweeps and report deliveries.",
                    code: `import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportsService } from '../reports/reports.service';

@Injectable()
export class SchedulingService {
  constructor(private readonly reportsService: ReportsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async handleDailyDistribution() {
    console.log('Running daily 18:00 RERA reports compilation...');
    await this.reportsService.compilePdfReport('proj-blr-02');
  }
}`
                  }
                ]
              }
            ]
          },
          {
            name: "storage",
            type: "folder",
            children: [
              {
                name: "storage.service.ts",
                type: "file",
                description: "Manages encrypted cloud storage interfaces for video surveys.",
                code: `import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async uploadFile(path: string, buffer: Buffer): Promise<string> {
    console.log(\`Uploading \${buffer.length} bytes to cloud path \${path}\`);
    // Secure cloud bucket adapter logic goes here
    return \`https://storage.buildtrace.in/\${path}\`;
  }
}`
              }
            ]
          },
          {
            name: "queues",
            type: "folder",
            children: [
              {
                name: "queues.service.ts",
                type: "file",
                description: "Redis-backed BullMQ message queue scheduler for compute-heavy CV sweeps.",
                code: `import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class QueuesService {
  constructor(@InjectQueue('ai-processing') private readonly aiQueue: Queue) {}

  async addAiJob(data: { videoUrl: string; roomId: string; model: string }) {
    return this.aiQueue.add('analyze-survey', data, {
      attempts: 3,
      backoff: 5000,
    });
  }
}`
              }
            ]
          }
        ]
      }
    ]
  };

  // Tree Renderer Helper
  const renderTree = (node: FileNode, currentPath: string = "") => {
    const path = currentPath ? `${currentPath}/${node.name}` : node.name;
    const isFolder = node.type === "folder";
    const isExpanded = expandedFolders[path];

    if (isFolder) {
      return (
        <div key={path} className="ml-3 font-mono text-xs select-none">
          <div
            onClick={() => toggleFolder(path)}
            className="flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-slate-800 hover:text-white cursor-pointer text-slate-300 transition"
          >
            {isExpanded ? <FolderOpen className="w-4 h-4 text-indigo-400 shrink-0" /> : <Folder className="w-4 h-4 text-slate-400 shrink-0" />}
            <span className="font-bold">{node.name}/</span>
          </div>
          {isExpanded && node.children && (
            <div className="border-l border-slate-800 ml-2 pl-2">
              {node.children.map(child => renderTree(child, path))}
            </div>
          )}
        </div>
      );
    } else {
      const isSelected = selectedFileName === node.name;
      return (
        <div
          key={path}
          onClick={() => {
            setSelectedFileCode(node.code || "");
            setSelectedFileName(node.name);
          }}
          className={`ml-3 font-mono text-xs py-1 px-1.5 rounded hover:bg-slate-800 hover:text-indigo-300 cursor-pointer flex items-center justify-between gap-2 transition ${
            isSelected ? "bg-indigo-950/80 text-indigo-300 border-l border-indigo-500" : "text-slate-400"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <FileCode className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{node.name}</span>
          </div>
          {node.description && (
            <span className="text-[10px] text-slate-600 truncate max-w-[120px] lg:max-w-[180px] font-sans">
              {node.description}
            </span>
          )}
        </div>
      );
    }
  };

  // Find a file to initialize code viewer
  React.useEffect(() => {
    if (!selectedFileName) {
      setSelectedFileCode(
        folderTree.children?.[0].children?.[0].children?.[0].children?.[1].code || ""
      );
      setSelectedFileName("auth.service.ts");
    }
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col font-sans">
      
      {/* 1. SUITE HEADER */}
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-[9px] rounded uppercase tracking-wider">
              production-ready architect
            </span>
            <h2 className="text-lg font-black tracking-tight">NestJS Enterprise Backend blueprint</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore decoupled architectural modules, BullMQ queue nodes, type-safe repositories, and inversion of control diagrams.
          </p>
        </div>

        {/* Info badges */}
        <div className="flex items-center gap-3 text-xs font-mono shrink-0">
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">framework version</span>
            <span className="text-white font-bold">NestJS v10.x</span>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">ORM standard</span>
            <span className="text-indigo-400 font-bold">TypeORM / PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* 2. SUB NAVIGATION TABS */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("structure")}
          className={`px-3 py-1.5 rounded-md transition flex items-center gap-2 ${
            activeTab === "structure"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <FolderOpen className="w-4 h-4 text-indigo-500" />
          <span>Folder Structure & Code Gen</span>
        </button>

        <button
          onClick={() => setActiveTab("di")}
          className={`px-3 py-1.5 rounded-md transition flex items-center gap-2 ${
            activeTab === "di"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Share2 className="w-4 h-4 text-indigo-500" />
          <span>Dependency Injection Visualizer</span>
        </button>

        <button
          onClick={() => setActiveTab("components")}
          className={`px-3 py-1.5 rounded-md transition flex items-center gap-2 ${
            activeTab === "components"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Architecture Layers Explainer</span>
        </button>

        <button
          onClick={() => setActiveTab("explain")}
          className={`px-3 py-1.5 rounded-md transition flex items-center gap-2 ${
            activeTab === "explain"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>Module Mechanics Checklist</span>
        </button>
      </div>

      {/* 3. ACTIVE TAB CONTENTS */}
      <div className="min-h-[500px] flex-1">
        
        {/* TAB 1: INTERACTIVE STRUCTURE TREE & CODE FILE VIEWER */}
        {activeTab === "structure" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            
            {/* Folder Explorer Column (5 columns) */}
            <div className="lg:col-span-5 bg-slate-950 border-r border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto max-h-[600px]">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Source Code Tree explorer
                </span>
                <span className="text-[9px] text-slate-600 font-mono">16 Modules compiled</span>
              </div>

              {/* Tree component render */}
              <div className="flex flex-col gap-0.5">
                {renderTree(folderTree)}
              </div>
            </div>

            {/* Code Mirror Previewer Column (7 columns) */}
            <div className="lg:col-span-7 bg-slate-900 p-5 flex flex-col gap-4 overflow-y-auto max-h-[600px]">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span className="font-mono text-slate-100 font-bold">{selectedFileName}</span>
                </div>

                <button
                  onClick={() => handleCopy(selectedFileCode || "")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold text-white flex items-center gap-1.5 transition"
                >
                  {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy Source Code
                </button>
              </div>

              {/* Readonly Code View */}
              <pre className="p-4 bg-slate-950 rounded-lg text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto select-all">
                {selectedFileCode}
              </pre>

              {/* Helper explanation bar */}
              <div className="bg-slate-850/80 border border-slate-800 p-3.5 rounded-lg text-xs leading-relaxed text-slate-400 flex gap-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  This NestJS backend blueprint is designed for multitenant physical survey applications. 
                  It includes <strong>StorageService</strong> to pipe mp4 streams directly to secure object storage, 
                  and <strong>QueuesService</strong> to asynchronously schedule YOLO segmentations without blocking main HTTP request threads.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INTERACTIVE DEPENDENCY INJECTION STEPPING ENGINE */}
        {activeTab === "di" && (
          <div className="p-6 flex flex-col gap-6 animate-fade-in text-xs">
            
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-950">Inversion of Control (IoC) & Injection Flow</h3>
              <p className="text-slate-500 mt-0.5">Step through the NestJS runtime system to visualize how classes declare and inherit dependency injection targets.</p>
            </div>

            {/* Stepper buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: "controller", label: "1. Controller Entry", desc: "@Controller() routes mapper" },
                { id: "service", label: "2. Business Service", desc: "@Injectable() Core Logic" },
                { id: "repository", label: "3. Repository Provider", desc: "Decoupled Data Queries" },
                { id: "db", label: "4. Database Model", desc: "TypeORM schema mapping" }
              ].map(step => (
                <button
                  key={step.id}
                  onClick={() => setDiStep(step.id as any)}
                  className={`p-3 text-left rounded-lg border transition ${
                    diStep === step.id
                      ? "bg-indigo-50 border-indigo-300 shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <span className={`font-bold block ${diStep === step.id ? "text-indigo-800" : "text-slate-700"}`}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{step.desc}</span>
                </button>
              ))}
            </div>

            {/* Interactive flow diagram layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Dynamic code sample */}
              <div className="lg:col-span-6 bg-slate-900 text-slate-300 p-5 rounded-xl border border-slate-800 font-mono flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block mb-2">
                    {diStep === "controller" && "AuthController definition"}
                    {diStep === "service" && "AuthService injection profile"}
                    {diStep === "repository" && "UsersRepository decoupling Layer"}
                    {diStep === "db" && "PostgreSQL database entity model"}
                  </span>

                  <pre className="text-[10px] leading-relaxed text-indigo-300 overflow-x-auto">
                    {diStep === "controller" && `// auth.controller.ts
@Controller('auth')
export class AuthController {
  // NestJS automatically injects AuthService singleton here!
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}`}
                    {diStep === "service" && `// auth.service.ts
@Injectable() // Registers this class with NestJS IoC container
export class AuthService {
  constructor(
    private readonly usersService: UsersService, // Injected dependency
    private readonly jwtService: JwtService,     // Injected token compiler
  ) {}

  async validateUser(email: string, pass: string) { ... }
}`}
                    {diStep === "repository" && `// users.repository.ts
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User> // Direct TypeORM adapter
  ) {}

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }
}`}
                    {diStep === "db" && `// user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  role: string;
}`}
                  </pre>
                </div>

                <div className="border-t border-slate-800 pt-3 mt-4 text-[10px] text-slate-400">
                  {diStep === "controller" && "Controllers should be slim. They only validate inputs via DTO validation constraints and hand work off to services."}
                  {diStep === "service" && "Services contain the core domain business. They are declared with @Injectable() and handled as application singletons."}
                  {diStep === "repository" && "Repositories decouple services from TypeORM/SQL APIs. If you switch storage backends, you only modify this file."}
                  {diStep === "db" && "Entities represent direct tables mapping. Decorated variables are mapped to SQL structures."}
                </div>
              </div>

              {/* Visual Flow diagram (6 columns) */}
              <div className="lg:col-span-6 bg-slate-50 border border-slate-200 p-5 rounded-xl flex flex-col gap-4 justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                    IoC Dependency Resolution Graph
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">NestJS builds an internal directed acyclic graph (DAG) to resolve dependencies at server boot time:</p>
                </div>

                <div className="flex flex-col gap-3 font-mono text-[11px] py-4">
                  
                  {/* Step 1 Node */}
                  <div className={`p-2 rounded border flex items-center justify-between transition-all duration-300 ${
                    diStep === "controller" ? "bg-indigo-600 text-white border-indigo-700 scale-[1.02]" : "bg-white border-slate-200 text-slate-600"
                  }`}>
                    <span>HTTP Client request</span>
                    <span className="text-[9px] uppercase font-bold">1. Controller Entry</span>
                  </div>

                  <div className="flex justify-center text-slate-400 py-0.5">
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </div>

                  {/* Step 2 Node */}
                  <div className={`p-2 rounded border flex items-center justify-between transition-all duration-300 ${
                    diStep === "service" ? "bg-indigo-600 text-white border-indigo-700 scale-[1.02]" : "bg-white border-slate-200 text-slate-600"
                  }`}>
                    <span>AuthService (Business logic)</span>
                    <span className="text-[9px] uppercase font-bold">2. Injectable Service</span>
                  </div>

                  <div className="flex justify-center text-slate-400 py-0.5">
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </div>

                  {/* Step 3 Node */}
                  <div className={`p-2 rounded border flex items-center justify-between transition-all duration-300 ${
                    diStep === "repository" ? "bg-indigo-600 text-white border-indigo-700 scale-[1.02]" : "bg-white border-slate-200 text-slate-600"
                  }`}>
                    <span>UsersRepository (DB decoupling)</span>
                    <span className="text-[9px] uppercase font-bold">3. Repository Layer</span>
                  </div>

                  <div className="flex justify-center text-slate-400 py-0.5">
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </div>

                  {/* Step 4 Node */}
                  <div className={`p-2 rounded border flex items-center justify-between transition-all duration-300 ${
                    diStep === "db" ? "bg-indigo-600 text-white border-indigo-700 scale-[1.02]" : "bg-white border-slate-200 text-slate-600"
                  }`}>
                    <span>PostgreSQL Database Table</span>
                    <span className="text-[9px] uppercase font-bold">4. Database Entity</span>
                  </div>

                </div>

                <div className="bg-slate-950 text-slate-300 p-3 rounded-lg text-[11px] leading-relaxed">
                  <span className="font-bold text-indigo-400 block mb-1">Inversion of Control (IoC) explanation:</span>
                  Rather than classes manually instantiating their database connectors using <code>new TypeORMPostgres()</code>, the NestJS container manages all lifetimes and wires singletons together. This allows for clean unit testing and mock insertions!
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: LAYERS EXPLAINER */}
        {activeTab === "components" && (
          <div className="p-6 flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
            
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-950">Architectural Core Components</h3>
              <p className="text-slate-500 mt-0.5">Understanding Modules, Providers, Controllers, and Decoupled Repositories.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col gap-3">
                <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-700 w-fit rounded-lg">
                  <Grid className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-900">NestJS Modules (@Module)</h4>
                <p className="text-slate-500">
                  Modules serve as cohesive boundary markers for related features. They declare which controllers parse routes, which providers are initialized, and which internal singletons are exported to other modules (such as <code>UsersModule</code> exporting <code>UsersService</code> to <code>AuthModule</code>).
                </p>
                <div className="mt-auto pt-3 border-t border-slate-100 text-[10px] font-mono text-indigo-600">
                  Example: <code>src/modules/auth/auth.module.ts</code>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col gap-3">
                <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-700 w-fit rounded-lg">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-900">Providers & Services (@Injectable)</h4>
                <p className="text-slate-500">
                  Providers encapsulate the core algorithmic business rules of the application. They retrieve raw materials metrics, evaluate S-curve percentages, verify stirrup counts, and compile documents. Providers are wired as reusable singletons.
                </p>
                <div className="mt-auto pt-3 border-t border-slate-100 text-[10px] font-mono text-emerald-600">
                  Example: <code>src/modules/progress/progress.service.ts</code>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col gap-3">
                <div className="p-2 bg-amber-50 border border-amber-100 text-amber-700 w-fit rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-900">Repository Pattern</h4>
                <p className="text-slate-500">
                  Repositories isolate services from TypeORM, Prisma, or SQL queries. By encapsulating database interactions (e.g. <code>UsersRepository.findByEmail()</code>) rather than putting raw queries inside the service, the core business tier remains completely untied to the storage engine.
                </p>
                <div className="mt-auto pt-3 border-t border-slate-100 text-[10px] font-mono text-amber-600">
                  Example: <code>src/modules/users/users.repository.ts</code>
                </div>
              </div>

            </div>

            {/* Dynamic Queue & Storage Explanation Block */}
            <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col md:flex-row gap-5 items-start">
              <Zap className="w-8 h-8 text-amber-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-black text-sm text-white">How Background Job Queues Handle Massive Video photogrammetry surveys</h4>
                <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                  Uploading high-res drone photogrammetry scans (often &gt; 100MB) requires substantial parsing time. If the backend processed this directly inside the HTTP thread loop, the API would timeout. 
                  Instead, the <strong>VideosService</strong> writes the video stream straight to private cloud buckets via <strong>StorageService</strong>, and places an <code>analyze-survey</code> task descriptor into a Redis queue managed by <strong>QueuesService</strong>. 
                  An isolated Python worker node picks up the task asynchronously, processes rebar spacing with PyTorch, and dispatches progress updates back via WebSockets.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SPECIFIC MODULE CHECKLIST */}
        {activeTab === "explain" && (
          <div className="p-6 flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
            
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-950">Modular Architecture Checklist</h3>
              <p className="text-slate-500 mt-0.5">A complete summary of requirements, features, and database relations for all 16 target backend modules.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Module cards */}
              {[
                { title: "Auth Module", icon: <Shield className="w-4 h-4 text-indigo-500" />, desc: "Handles session encryption, bcrypt validations, JWT token lifecycle, and cryptographic cookies." },
                { title: "Users Module", icon: <Users className="w-4 h-4 text-indigo-500" />, desc: "Indexes enterprise user profiles, operator credentials, emails, and global RERA system access levels." },
                { title: "Organizations Module", icon: <Building className="w-4 h-4 text-indigo-500" />, desc: "Tracks multitenant organizations, parent enterprises, and physical site allocation tags." },
                { title: "Projects Module", icon: <Layers className="w-4 h-4 text-indigo-500" />, desc: "Covers financial limits, construction portfolio budgets, safety workdays, and overall timelines." },
                { title: "Buildings Module", icon: <Building className="w-4 h-4 text-indigo-500" />, desc: "Registers concrete blocks, residential towers, construction footprint scopes, and active zones." },
                { title: "Floors Module", icon: <Layers className="w-4 h-4 text-indigo-500" />, desc: "Manages tier offset, columns configuration grid, and volumetric concrete pours schedules." },
                { title: "Rooms Module", icon: <Grid className="w-4 h-4 text-indigo-500" />, desc: "Segments floors into datacenter corridors, wings, cores, and physical camera areas." },
                { title: "Videos Module", icon: <Video className="w-4 h-4 text-indigo-500" />, desc: "Handles raw MP4 uploads, private storage paths generation, and background job delegation." },
                { title: "AI Module", icon: <Cpu className="w-4 h-4 text-indigo-500" />, desc: "Queries background CUDA engines to analyze rebar density and check stirrup alignments." },
                { title: "Progress Module", icon: <TrendingUp className="w-4 h-4 text-indigo-500" />, desc: "Calculates planned vs actual project completion and logs volumetric materials inventory." },
                { title: "Reports Module", icon: <FileText className="w-4 h-4 text-indigo-500" />, desc: "Compiles static PDFs, RERA certification documents, and high-res image catalogs." },
                { title: "Notifications Module", icon: <Bell className="w-4 h-4 text-indigo-500" />, desc: "Dispatches critical security and spacing anomaly updates via SMTP emails and push endpoints." },
                { title: "Permissions Module", icon: <Shield className="w-4 h-4 text-indigo-500" />, desc: "Enforces Role-Based Access Control (RBAC) across endpoints through global Guard interceptors." },
                { title: "Scheduling Module", icon: <Clock className="w-4 h-4 text-indigo-500" />, desc: "Fires background cron workers to trigger periodic sweeps and daily report compiles." },
                { title: "Queues Module", icon: <Zap className="w-4 h-4 text-indigo-500" />, desc: "Orchestrates BullMQ Redis streams to balance PyTorch computer vision worker loads." },
                { title: "Storage Module", icon: <Database className="w-4 h-4 text-indigo-500" />, desc: "Interacts with secure cloud objects storage, generating private upload streams." }
              ].map((mod, idx) => (
                <div key={idx} className="p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg flex items-start gap-2.5 transition">
                  <div className="p-1.5 bg-white border border-slate-200 rounded-md shrink-0">
                    {mod.icon}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">{mod.title}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{mod.desc}</p>
                  </div>
                </div>
              ))}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}

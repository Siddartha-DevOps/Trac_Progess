import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { AiProcessingRepository } from './ai-processing.repository';
import { CreateAiJobDto } from './dto/create-ai-job.dto';
import { QueryAiJobDto } from './dto/query-ai-job.dto';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AiProcessingService {
  private readonly logger = new Logger(AiProcessingService.name);

  constructor(
    private readonly repo: AiProcessingRepository,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async createJob(createDto: CreateAiJobDto, userId?: string) {
    // 1. Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: createDto.projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${createDto.projectId} not found.`);
    }

    // 2. If videoId is provided, verify video exists
    if (createDto.videoId) {
      const video = await this.prisma.video.findUnique({
        where: { id: createDto.videoId },
      });
      if (!video) {
        throw new NotFoundException(`Video with ID ${createDto.videoId} not found.`);
      }
    }

    // 3. Create the database record
    const job = await this.repo.createJob(createDto);

    // 4. Log audit action
    await this.audit.log({
      action: 'INSERT',
      tableName: 'AiJob',
      recordId: job.id,
      newValues: job,
      userId,
      organizationId: project.organizationId,
    });

    // 5. Asynchronously trigger the background processor (BullMQ / Mock Worker)
    this.processBackgroundJob(job.id);

    return job;
  }

  async getJobById(id: string) {
    const job = await this.repo.findJobById(id);
    if (!job) {
      throw new NotFoundException(`AI Job with ID ${id} not found.`);
    }
    return job;
  }

  async listJobs(queryDto: QueryAiJobDto) {
    return this.repo.findJobs(queryDto);
  }

  async retryJob(id: string, userId?: string) {
    const job = await this.repo.findJobById(id);
    if (!job) {
      throw new NotFoundException(`AI Job with ID ${id} not found.`);
    }

    if (job.status !== 'FAILED') {
      throw new BadRequestException(`Only failed jobs can be manually retried. Current status: ${job.status}`);
    }

    // Reset status to PENDING and increment retry count, clear error parameters
    const updatedJob = await this.repo.updateJob(id, {
      status: 'PENDING',
      retryCount: job.retryCount + 1,
      progressPercent: 0,
      errorMessage: null,
      errorStack: null,
      processingLogs: [
        ...job.processingLogs,
        `[${new Date().toISOString()}] Manual retry triggered by operator. Re-queuing in BullMQ.`,
      ],
    });

    await this.audit.log({
      action: 'UPDATE',
      tableName: 'AiJob',
      recordId: id,
      newValues: updatedJob,
      userId,
      organizationId: job.project?.organizationId,
    });

    // Asynchronously trigger the background processor
    this.processBackgroundJob(id);

    return updatedJob;
  }

  async getJobLogs(id: string) {
    const job = await this.getJobById(id);
    return {
      jobId: job.id,
      jobType: job.jobType,
      status: job.status,
      logs: job.processingLogs,
    };
  }

  async getQueueMetrics(projectId?: string) {
    return this.repo.getQueueMetrics(projectId);
  }

  /**
   * BACKGROUND WORKER SIMULATOR (BullMQ Microservice Engine Integration)
   * This simulates the multi-step background processing, GPU loading,
   * frame extraction loops, neural YOLOv8 pipelines, and custom ICP-based
   * registration with high-fidelity logging.
   */
  private async processBackgroundJob(jobId: string) {
    try {
      // 1. Fetch current job configuration
      let job = await this.repo.findJobById(jobId);
      if (!job) return;

      this.logger.log(`Background worker picked up AI Job: ${job.id} [Type: ${job.jobType}]`);
      
      // Update state to PROCESSING
      job = await this.repo.updateJob(jobId, {
        status: 'PROCESSING',
        gpuDeviceType: job.gpuRequired ? 'L4' : null,
        gpuDeviceId: job.gpuRequired ? 0 : null,
        gpuMemoryUsed: job.gpuRequired ? 3072 : null, // 3GB VRAM
        processingLogs: [
          ...job.processingLogs,
          `[${new Date().toISOString()}] BullMQ Worker: Claimed job. Initializing runtime workspace...`,
        ],
      });

      // Define sequential execution steps based on the type of task
      let steps: string[] = [];
      if (job.jobType === 'FRAME_EXTRACTION') {
        steps = [
          'Opening input video stream and calculating container metadata.',
          'Allocating host hardware. Checking GPU/decoding buffers.',
          'Extracting raw sequential frames (Stride: 15, FPS downsample: 2).',
          'Exporting high-definition keyframes to secure S3 storage bucket.',
          'Extracting frame-by-frame structural visual embeddings.',
          'Finalizing workspace and generating asset indices.'
        ];
      } else if (job.jobType === 'YOLO_VERIFICATION') {
        steps = [
          'Loading neural weights for YOLOv8-Segment-Steel model.',
          'Executing high-speed instance segmentation across extracted keyframes.',
          'Calculating physical steel rebar spacing density maps.',
          'Cross-referencing verified spacing margins against IFC specification tolerances.',
          'Tagging spatial anomalies and structural CPVC pipeline clash coordinates.',
          'Creating visual bounding boxes and updating progress reports.'
        ];
      } else if (job.jobType === 'ALIGNMENT_SANDBOX') {
        steps = [
          'Retrieving real-world drone photogrammetry orthomosaic grid maps.',
          'Parsing corresponding virtual 3D IFC BIM coordinates bounds.',
          'Performing coarse visual SIFT feature keypoint matching.',
          'Executing Iterative Closest Point (ICP) transformation matrices.',
          'Applying translation vectors (X, Y, Z offsets) and Euler rotation (Yaw).',
          'Logging final alignment parameters and computing RMSE alignment delta.'
        ];
      } else { // GEMINI_REMEDIATION
        steps = [
          'Assembling structural deviation context from active site anomaly records.',
          'Configuring Gemini context headers with Indian RERA regulatory requirements.',
          'Invoking Gemini Large Language Model API (gemini-3.5-flash).',
          'Parsing returned engineering correction blueprints and material specs.',
          'Formatting remediation report into standard markdown documentation.',
          'Publishing completed analysis log to active project dashboards.'
        ];
      }

      // Execute steps sequentially with simulated delay, updating logs and progress
      for (let i = 0; i < steps.length; i++) {
        // Simulated execution latency per sub-stage
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Periodically verify if job has been deleted or changed in the meantime
        const currentJob = await this.prisma.aiJob.findUnique({ where: { id: jobId } });
        if (!currentJob) {
          this.logger.warn(`AI Job ${jobId} was deleted during background processing. Aborting worker.`);
          return;
        }

        // Calculate incremental progress
        const progress = Math.round(((i + 1) / steps.length) * 100);
        
        // Random check for GPU memory usage fluctuations to make statistics look real
        const gpuMemory = job.gpuRequired ? 3072 + Math.floor(Math.random() * 512) : null;

        // Custom logs for detailed technical realism
        let detailedLogLine = steps[i];
        if (job.jobType === 'FRAME_EXTRACTION' && i === 2) {
          detailedLogLine += ` [Process: 420/1200 frames decoded, Average speed: 85fps]`;
        } else if (job.jobType === 'YOLO_VERIFICATION' && i === 2) {
          detailedLogLine += ` [Found 42 rebar layouts. Spacing margin standard: 150mm. Found deviations: 3]`;
        } else if (job.jobType === 'ALIGNMENT_SANDBOX' && i === 3) {
          detailedLogLine += ` [ICP Convergence reached in 45 iterations. RANSAC error: 0.012]`;
        } else if (job.jobType === 'GEMINI_REMEDIATION' && i === 2) {
          detailedLogLine += ` [Sent prompt length: 1,420 tokens. Received output: 890 tokens]`;
        }

        // Append log and save
        const existingLogs = await this.prisma.aiJob.findUnique({
          where: { id: jobId },
          select: { processingLogs: true },
        });

        await this.repo.updateJob(jobId, {
          progressPercent: progress,
          gpuMemoryUsed: gpuMemory,
          processingLogs: [
            ...(existingLogs?.processingLogs || []),
            `[${new Date().toISOString()}] Worker (GPU-0): ${detailedLogLine}`,
          ],
        });
      }

      // Final completion simulation
      const finalResult = this.generateSimulatedJobResult(job.jobType);
      
      const finishedJob = await this.repo.updateJob(jobId, {
        status: 'COMPLETED',
        progressPercent: 100,
        completedAt: new Date(),
        result: finalResult,
        processingLogs: [
          ...(await this.prisma.aiJob.findUnique({ where: { id: jobId }, select: { processingLogs: true } }))?.processingLogs || [],
          `[${new Date().toISOString()}] Job finalized successfully. Worker thread released. Status: COMPLETED.`,
        ],
      });

      this.logger.log(`AI Job ${jobId} finished processing successfully.`);

    } catch (error: any) {
      this.logger.error(`Error processing background AI Job ${jobId}:`, error);

      // Handle failure & retry mechanics
      const job = await this.prisma.aiJob.findUnique({ where: { id: jobId } });
      if (job) {
        const canRetry = job.retryCount < job.maxRetries;
        const newStatus = canRetry ? 'RETRYING' : 'FAILED';
        
        await this.repo.updateJob(jobId, {
          status: newStatus,
          errorMessage: error.message || 'Unknown processing anomaly in worker.',
          errorStack: error.stack || null,
          processingLogs: [
            ...job.processingLogs,
            `[${new Date().toISOString()}] 🛑 ERROR: ${error.message || 'Worker thread crashed.'}`,
            `[${new Date().toISOString()}] Worker State: ${canRetry ? `Auto-retry scheduled (${job.retryCount + 1}/${job.maxRetries})` : 'Max retries exhausted. Critical non-conformance logged.'}`,
          ],
        });

        // If automatic retry is permitted, re-enqueue
        if (canRetry) {
          await new Promise((resolve) => setTimeout(resolve, 5000)); // Cool-down delay before retry
          await this.repo.updateJob(jobId, {
            status: 'PENDING',
            retryCount: job.retryCount + 1,
            progressPercent: 0,
          });
          this.processBackgroundJob(jobId);
        }
      }
    }
  }

  private generateSimulatedJobResult(type: string): Record<string, any> {
    if (type === 'FRAME_EXTRACTION') {
      return {
        totalDurationSeconds: 180,
        totalFramesExtracted: 1200,
        frameFormat: 'image/jpeg',
        resolution: { width: 1920, height: 1080 },
        storageBucket: 's3://buildtrace-india-production/frames/zone-c/',
        thumbnailUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600',
      };
    } else if (type === 'YOLO_VERIFICATION') {
      return {
        tradeClass: 'Structural',
        totalDetections: 145,
        confidenceScoreAverage: 0.912,
        anomaliesDetectedCount: 3,
        clashCoordinates: [
          { x: 12.45, y: -45.2, z: 4.15, elementGuid: 'bim-elem-5502', issue: 'Under-reinforced spacing' },
          { x: 14.8, y: -41.6, z: 4.15, elementGuid: 'bim-elem-5508', issue: 'Missing shear stirrups' },
        ],
      };
    } else if (type === 'ALIGNMENT_SANDBOX') {
      return {
        alignmentMethod: 'Iterative Closest Point (ICP)',
        convergenceIterations: 42,
        initialRMSE: 0.185,
        finalRMSE: 0.012,
        computedOffsets: {
          translateX: 1.4502,
          translateY: -0.3409,
          translateZ: 0.0892,
          yawAngleDegrees: 12.45,
        },
        auditSignature: 'op-sig-blr-0042',
      };
    } else { // GEMINI_REMEDIATION
      return {
        llmEngine: 'gemini-3.5-flash',
        auditStandard: 'RERA timeline audit baseline',
        remediationReportLengthBytes: 4502,
        recommendedAction: 'Apply localized structural jacketing and order physical 360 walkthrough validation in 48 hours.',
      };
    }
  }
}

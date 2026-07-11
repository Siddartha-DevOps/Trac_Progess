import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AiJobResponseDto {
  @ApiProperty({
    description: 'The unique GUID of the AI Job.',
    example: 'j1b2c3d4-e5f6-7a8b-9c0d-0123456789de',
  })
  id: string;

  @ApiProperty({
    description: 'The operational category of the AI processing task.',
    example: 'FRAME_EXTRACTION',
  })
  jobType: string;

  @ApiProperty({
    description: 'The current progress status of the job.',
    example: 'PROCESSING',
  })
  status: string;

  @ApiProperty({
    description: 'Processing priority weight.',
    example: 0,
  })
  priority: number;

  @ApiPropertyOptional({
    description: 'The target associated Video GUID, if applicable.',
    example: 'v1b2c3d4-e5f6-7a8b-9c0d-0987654321ba',
  })
  videoId?: string;

  @ApiProperty({
    description: 'The parent project ID containing this task.',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1234567890ab',
  })
  projectId: string;

  @ApiPropertyOptional({
    description: 'Input arguments and task parameters.',
    example: { frameStride: 15, confidenceThreshold: 0.85 },
  })
  payload?: any;

  @ApiPropertyOptional({
    description: 'Final task output results (bounding boxes, classifications, remediation text).',
    example: { totalFramesProcessed: 120, detectedAnomaliesCount: 3 },
  })
  result?: any;

  @ApiProperty({
    description: 'The number of times this job has been run/retried after failures.',
    example: 1,
  })
  retryCount: number;

  @ApiProperty({
    description: 'Maximum allowable automatic retries.',
    example: 3,
  })
  maxRetries: number;

  @ApiProperty({
    description: 'Indicates if the task requires or is scheduled on high-power GPU hardware.',
    example: true,
  })
  gpuRequired: boolean;

  @ApiPropertyOptional({
    description: 'NVIDIA GPU model name allocated for processing (e.g. T4, L4, A100).',
    example: 'L4',
  })
  gpuDeviceType?: string;

  @ApiPropertyOptional({
    description: 'CUDA device ID assigned to the background worker.',
    example: 0,
  })
  gpuDeviceId?: number;

  @ApiPropertyOptional({
    description: 'Peak GPU active frame-buffer memory usage in Megabytes (MB).',
    example: 4096,
  })
  gpuMemoryUsed?: number;

  @ApiProperty({
    description: 'Task progress percentage completed (0 to 100).',
    example: 45,
  })
  progressPercent: number;

  @ApiPropertyOptional({
    description: 'Brief error message if the job fails.',
    example: 'CUDA out of memory exception in YOLO layer 3.',
  })
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Stack trace information for detailed debugging.',
    example: 'Error: CUDA OOM at /app/yolov8/engine.py:342...',
  })
  errorStack?: string;

  @ApiProperty({
    description: 'Interactive execution log logs collected from Python processing worker thread.',
    example: [
      '[INFO] Initializing video frames decoder...',
      '[INFO] GPU device 0 allocated: NVIDIA L4 (24GB)',
      '[CV] Frame 0/1500 decoded. Stride: 15.',
    ],
  })
  processingLogs: string[];

  @ApiProperty({
    description: 'Job creation timestamp.',
    example: '2026-07-10T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2026-07-10T10:32:00Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Execution completion timestamp.',
    example: '2026-07-10T10:32:15Z',
  })
  completedAt?: Date;
}

export class PaginatedAiJobResponseDto {
  @ApiProperty({ type: [AiJobResponseDto] })
  data: AiJobResponseDto[];

  @ApiProperty({ example: 45 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class QueueMetricsResponseDto {
  @ApiProperty({ description: 'Total jobs pending in BullMQ queue waiting for worker availability.', example: 5 })
  pendingCount: number;

  @ApiProperty({ description: 'Total jobs currently being processed on worker nodes.', example: 2 })
  processingCount: number;

  @ApiProperty({ description: 'Total successfully completed jobs.', example: 120 })
  completedCount: number;

  @ApiProperty({ description: 'Total failed jobs requiring manual/automated retry.', example: 12 })
  failedCount: number;

  @ApiProperty({ description: 'Active global GPU core utilization percentage.', example: 42.5 })
  activeGpuUtilization: number;

  @ApiProperty({ description: 'Aggregated active GPU memory consumption in MB.', example: 8192 })
  activeGpuMemoryMb: number;

  @ApiProperty({ description: 'Average process throughput runtime in seconds.', example: 342 })
  averageProcessingTimeSeconds: number;
}

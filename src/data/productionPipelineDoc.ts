export interface ProductionPipelineSection {
  id: string;
  title: string;
  icon: string;
  summary: string;
  subcomponents: {
    name: string;
    description: string;
    details: string[];
    modelsOrLibraries?: string[];
    performanceMetric?: string;
  }[];
  diagram: string;
}

export const PRODUCTION_PIPELINE_DATA: ProductionPipelineSection[] = [
  {
    id: "upload-compression",
    title: "1. Upload, Ingestion & Compression",
    icon: "CloudLightning",
    summary: "Ingests raw 4K 360-degree site footage securely from mobile helmet cams. Compresses and standardizes the stream to optimize network bandwidth and reduce downstream GPU compute times.",
    subcomponents: [
      {
        name: "Multipart Pre-signed Uploads",
        description: "Bypasses web application servers to upload video chunks directly to secure Cloud Storage buckets.",
        details: [
          "Generates AWS S3 / Cloud Storage pre-signed URLs with short TTLs (15 minutes).",
          "Splits video file into dynamic 15MB binary blocks on the client side using the HTML5 File API.",
          "Verifies integrity of each chunk in real-time with MD5 checksums passed in the HTTP header."
        ],
        modelsOrLibraries: ["AWS SDK S3", "spark-md5", "Axios Chunked-Uploader"],
        performanceMetric: "Upload throughput optimized by 3.2x on unstable 5G construction site networks."
      },
      {
        name: "Adaptive FFmpeg Video Compression",
        description: "Transcodes incoming raw container video codecs to a unified high-efficiency streaming container.",
        details: [
          "Converts arbitrary container formats (MOV, AVI, WebM) to highly-efficient H.265 (HEVC) or AV1 codec profiles.",
          "Utilizes Constant Rate Factor (CRF 22) to preserve fine structural lines while decreasing file size by up to 78%.",
          "Generates lower-resolution proxy video streams (1080p, 720p) for rapid real-time interactive playback on mobile web tools."
        ],
        modelsOrLibraries: ["FFmpeg", "NVIDIA NVENC hardware codec", "libx265"],
        performanceMetric: "Average file size reduced from 4.2GB raw to 920MB compressed without loss of visual MEP texturing."
      }
    ],
    diagram: `[ Helmet 360 Camera ] ---> [ Client Web App ]
                                   |
                     (1) Request Pre-signed URLs
                                   v
[ S3 Cloud Storage Bucket ] <--- [ S3 multipart API ]
           |
     (2) Upload Success (Object Created Event)
           v
[ API Gateway / NestJS Server ] ---> [ Redis bullmq-ingest Queue ]`
  },
  {
    id: "frame-metadata",
    title: "2. Frame Extraction & Spatial Metadata",
    icon: "Camera",
    summary: "Translates temporal video data into geographically indexed static keyframes. Maps visual sequences to helmet telemetry logs (IMU/GPS) for spatial coordination.",
    subcomponents: [
      {
        name: "GPU-Accelerated Keyframe Extractor",
        description: "Decodes and samples high-resolution video streams inside VRAM, avoiding costly PCI-e memory copy bottlenecks.",
        details: [
          "Uses NVDEC hardware decoders to sample keyframes dynamically based on a variable step stride.",
          "Applies a dual-pass motion filter: skips frames with zero optical movement (stationary operator) and discards high-blur frames using Laplacian variance checks.",
          "Maintains keyframe tensors in GPU memory to feed directly into segmentation and object detection models."
        ],
        modelsOrLibraries: ["NVIDIA-Decord", "OpenCV CUDA Filters", "PyTorch Tensors"],
        performanceMetric: "Frame extraction latency dropped from 45ms (CPU-bound) to 1.8ms (Direct VRAM-to-VRAM GPU transfer)."
      },
      {
        name: "IMU Telemetry Synchronizer",
        description: "Fuses frame timestamp data with physical helmet-mount inertial measurement unit logs.",
        details: [
          "Interpolates sparse GPS coordinate tracks and 100Hz gyroscope/accelerometer sensor files.",
          "Computes approximate 3D camera translation and absolute pose orientations for each extracted frame timestamp.",
          "Stores geographical vectors and tilt correction offsets as structured metadata alongside the frame record."
        ],
        modelsOrLibraries: ["pandas", "gtsam (Factor Graph Interpolation)", "scipy.spatial"],
        performanceMetric: "Achieves temporal synchronization precision of less than 2 milliseconds between camera shutter and sensor."
      }
    ],
    diagram: `[ Compressed Video /S3/ ] ---> [ NVDEC Hardware Decoder (VRAM) ]
                                              |
                                      [ Frame Buffer ]
                                              |
                     +------------------------+------------------------+
                     |                                                 |
                     v (Sharpness Filter)                              v (Optical Flow)
           [ Laplacian Variance >= 100 ]                     [ Farnebäck Displacement >= 0.3m ]
                     |                                                 |
                     +------------------------+------------------------+
                                              | (Passes both)
                                              v
                                   [ Extracted Keyframe ] <--- [ Fused IMU/GPS Telemetry ]`
  },
  {
    id: "queues-background",
    title: "3. Queue Management & Background Processing",
    icon: "Cpu",
    summary: "Manages heavy computational task scheduling across scale-to-zero GPU worker pools, ensuring reliable execution through robust message brokers and isolation patterns.",
    subcomponents: [
      {
        name: "BullMQ Distributed Task Queue",
        description: "Manages high-throughput pipeline task enqueuing and execution states on top of Redis.",
        details: [
          "Segregates operations into distinct priority lanes: high-priority for quick walkthrough previews, standard-priority for daily bulk 3D reconstructions.",
          "Implements at-least-once delivery guarantees using Redis streams and atomic Lua scripting scripts.",
          "Uses Redis lock-leases (auto-renewing every 10 seconds) to prevent multiple GPU workers from picking up the same video slice."
        ],
        modelsOrLibraries: ["BullMQ", "ioredis", "NestJS Queue Modules"],
        performanceMetric: "Handles up to 10,000 concurrent enqueued items with sub-millisecond Redis lock latencies."
      },
      {
        name: "FastAPI Worker Cluster",
        description: "Consumes task payloads and drives high-performance PyTorch neural network pipelines.",
        details: [
          "Launches containerized Python workers inside Kubernetes GPU daemon-sets.",
          "Maintains hot-loaded model checkpoints in VRAM to prevent the 30-second cold-start latency of reloading weights.",
          "Executes async-pooling to process multiple frames concurrently on separate TensorRT engines."
        ],
        modelsOrLibraries: ["FastAPI", "Uvicorn", "PyTorch (torch.cuda)"],
        performanceMetric: "Model weight enqueuing overhead eliminated entirely; worker startup completes in 12ms."
      }
    ],
    diagram: `[ NestJS / Express API ] ---> [ BullMQ Enqueuer ]
                                          |
                               [ Redis Stream Broker ]
                                          |
                         +----------------+----------------+
                         | (Lock Lease)   | (Lock Lease)   | (Lock Lease)
                         v                v                v
                  [ GPU Worker 01 ] [ GPU Worker 02 ] [ GPU Worker 03 ]
                     (FastAPI)         (FastAPI)         (FastAPI)`
  },
  {
    id: "retries-errors",
    title: "4. Fault Tolerance, Retries & Error Handling",
    icon: "ShieldAlert",
    summary: "Secures continuous runtime pipelines against transient infrastructure faults, model out-of-memory errors, or corrupted frames with automated healing and recovery paths.",
    subcomponents: [
      {
        name: "Exponential Backoff & Jitter Scheduler",
        description: "Schedules failed jobs for automatic retry with calculated delay gaps to prevent thundering herd problems on microservices.",
        details: [
          "Calculates delay = min(max_delay, initial_delay * 2^retry_count) + random_jitter.",
          "Retries up to 3 times on transient network errors (e.g., S3 bucket timeout or database pool connection drops).",
          "Routes jobs to a Dead Letter Queue (DLQ) upon complete failure, triggering system alarms."
        ],
        modelsOrLibraries: ["BullMQ Retry Config", "backoff (Python Library)"],
        performanceMetric: "Prevents system-wide API gridlocks, resolving 94% of transient cloud network failures automatically."
      },
      {
        name: "VRAM Out-of-Memory (OOM) Protection",
        description: "Gracefully intercept and handle CUDA Out-of-Memory failures on physical GPU hardware.",
        details: [
          "Implements frame batch-size throttling: drops batch size from 16 to 4 instantly if a CUDA OOM is raised, then retries the model pass.",
          "Executes torch.cuda.empty_cache() dynamically between sequence frames to purge orphan GPU tensors.",
          "Isolates model processing in child subprocesses; if a subprocess crashes due to VRAM limitations, the master worker remains active."
        ],
        modelsOrLibraries: ["PyTorch Custom Exception Handlers", "nvidia-smi monitoring"],
        performanceMetric: "Eliminates worker container crashes, maintaining 100% processing uptime on extreme video durations."
      },
      {
        name: "Structured Logging & Central Telemetry",
        description: "Aggregates machine-readable logs and metrics to trace specific video transactions end-to-end.",
        details: [
          "Outputs all log entries in structured JSON formats with unified tracking parameters (correlation IDs).",
          "Tracks GPU metrics: thermal throttle states, VRAM utilization, and model inference latency in real-time.",
          "Triggers PagerDuty alerts if worker error rates exceed 2% of total enqueued tasks in a rolling 10-minute window."
        ],
        modelsOrLibraries: ["Winston (NestJS)", "structlog (Python)", "Prometheus", "Grafana"],
        performanceMetric: "Reduces mean time to resolution (MTTR) for site issues from 4 hours down to less than 8 minutes."
      }
    ],
    diagram: `[ Failed Worker Task ] ---> [ Retry Policy Checked ]
                                       |
                   +-------------------+-------------------+
                   | (Attempt < 3)                         | (Attempt >= 3)
                   v                                       v
[ Exponential Backoff + Jitter ]                 [ Dead Letter Queue (DLQ) ]
                   |                                       |
                   v (Re-enqueue)                          v
         [ Redis Queue Stream ]                  [ Slack / PagerDuty Alert ]`
  },
  {
    id: "storage-caching",
    title: "5. Cloud Storage, CDN & Caching Tiers",
    icon: "Database",
    summary: "Optimizes visual asset delivery and raw data access through a multi-tier storage topography, ensuring fast dashboard visual load times.",
    subcomponents: [
      {
        name: "Hot / Cold Storage Lifecycle Rules",
        description: "Slashes storage cost footprints by moving older raw videos to low-cost archival tiers.",
        details: [
          "Hosts active construction videos (< 30 days old) in Standard S3 buckets for instant high-throughput API access.",
          "Auto-transitions processed raw footage to Amazon Glacier Flexible Retrieval / Cold Storage after 30 days.",
          "Preserves lightweight processed metadata, 2D segmentation overlays, and 3D point cloud assets permanently in Standard S3."
        ],
        modelsOrLibraries: ["AWS S3 Lifecycle Policies", "Boto3 Life Managers"],
        performanceMetric: "Storage operations expenditure reduced by 64% while maintaining sub-second availability on recent scans."
      },
      {
        name: "CDN Visual Distribution Edge",
        description: "Caches and distributes video segments and proxy assets geographically close to end users.",
        details: [
          "Uses Amazon CloudFront or Cloudflare CDN to cache HLS video streams, 2D extracted thumbnails, and 3D model tiles.",
          "Applies HTTP range-requests, allowing players to seek directly to specific video timestamps without downloading the entire file.",
          "Signs CDN access cookies dynamically at the API layer, blocking unauthorized traffic."
        ],
        modelsOrLibraries: ["Amazon CloudFront", "Cloudflare CDN Edge Rules"],
        performanceMetric: "Global visual dashboard loading speeds optimized by 4.5x, particularly on low-bandwidth site tablets."
      },
      {
        name: "Multi-Tier Database Cache",
        description: "Buffers repetitive database queries for BIM structure parameters, preventing heavy database loads.",
        details: [
          "Caches computed building progress metrics and IFC structural trees inside Redis key-value stores with a 12-hour TTL.",
          "Uses local memory caches in NestJS for static catalog elements (e.g. trade tags, structural GUID indexes).",
          "Invalidates cache records automatically upon successful ingestion of new video scans on a specific floor."
        ],
        modelsOrLibraries: ["Redis Cache-Manager", "NestJS Cache Module"],
        performanceMetric: "Prisma PostgreSQL query load decreased by 85%, maintaining api response latency below 40ms."
      }
    ],
    diagram: `[ Scanned Assets Ingestion ] ---> [ Hot S3 Bucket (Standard) ] ---> [ 30 Days Rule ] ---> [ Glacier Cold Storage ]
                                             |
                                 (Push Keyframes & Thumbnails)
                                             v
                                  [ CloudFront CDN Edge ] <============== (Geographic Cache)
                                             |
                                             v
                                  [ Engineering Dashboard ]`
  },
  {
    id: "scaling-security",
    title: "6. Horizontal Scaling & Enterprise Security",
    icon: "Server",
    summary: "Guarantees system reliability and data security during peak scanning periods through Kubernetes horizontal autoscaling and zero-trust IAM frameworks.",
    subcomponents: [
      {
        name: "KEDA Kubernetes Autoscaling",
        description: "Scales GPU and CPU worker node counts dynamically based on active BullMQ queue depth.",
        details: [
          "Configures Kubernetes Event-driven Autoscaling (KEDA) to monitor the number of 'pending' tasks in Redis.",
          "Scales GPU deployment replicas from 0 up to 15 nodes during busy end-of-day walkthrough upload spikes.",
          "Enforces scale-to-zero capabilities when the queue is dry, eliminating idle GPU server costs."
        ],
        modelsOrLibraries: ["KEDA (Kubernetes Event-driven Autoscaling)", "GCP Node Pools Autoscale"],
        performanceMetric: "Compute resource efficiency optimized by 72% via scaling-to-zero during non-working night hours."
      },
      {
        name: "Zero-Trust Enterprise Security",
        description: "Protects sensitive structural CAD layouts and proprietary site assets from external threats.",
        details: [
          "Secures all API communication with JSON Web Tokens (JWT) issued via Firebase Authentication.",
          "Enforces fine-grained Role-Based Access Control (RBAC): restricts video deletion or manual override privileges to 'Project Administrator' clearance.",
          "Encrypts all digital data in transit via TLS 1.3 and at rest using AES-256 keys managed by Cloud KMS."
        ],
        modelsOrLibraries: ["Firebase Admin SDK", "Cloud KMS", "Helmet.js Security Middlewares"],
        performanceMetric: "100% compliance achieved with ISO/IEC 27001 data storage security standard regulations."
      }
    ],
    diagram: `[ Redis bullmq-ingest Queue ]
               |
        (Monitor Queue Depth)
               v
        [ KEDA Operator ] ---> (Triggers Replica Scale) ---> [ Kubernetes Pod Autoscaler ]
                                                                       |
                         +----------------+----------------------------+----------------------------+
                         v                v                                                         v
                  [ Worker Pod 1 ] [ Worker Pod 2 ] ... (Up to 15 concurrent nodes)          [ Scale to Zero ]`
  }
];

# ==============================================================================
# Stage 1: Build & Dependency compilation environment
# ==============================================================================
FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04 AS builder

# Prevent interactive prompts during APT installation
ENV DEBIAN_FRONTEND=noninteractive

# Install core system compilers and dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.12 \
    python3.12-dev \
    python3-pip \
    python3-setuptools \
    build-essential \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip
RUN python3.12 -m pip install --upgrade pip

# Create workspace
WORKDIR /build

# Copy requirements file first to exploit Docker layer caching
COPY requirements.txt .

# Compile wheels into wheelhouse to minimize production image footprint
RUN python3.12 -m pip wheel --no-cache-dir --wheel-dir=/build/wheels -r requirements.txt


# ==============================================================================
# Stage 2: Final minimal production runtime environment
# ==============================================================================
FROM nvidia/cuda:12.2.0-runtime-ubuntu22.04 AS runner

LABEL maintainer="BuildTrace AI <ai-ops@buildtrace.in>"
LABEL platform="CV-Inference-Engine"

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH="/app" \
    DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.12 \
    python3-pip \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libgomp1 \
    libgfortran5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy compiled wheels from Builder stage and install
COPY --from=builder /build/wheels /wheels
COPY requirements.txt .
RUN python3.12 -m pip install --no-index --find-links=/wheels -r requirements.txt && \
    rm -rf /wheels requirements.txt

# Create non-root system user for security compliance (Least Privilege Principle)
RUN groupadd -g 10001 buildtrace_group && \
    useradd -r -u 10001 -g buildtrace_group -m -d /home/buildtrace_user buildtrace_user

# Create directories for Weights local cache, logs and temporary files
RUN mkdir -p /app/weights /app/logs /app/temp_frames && \
    chown -R buildtrace_user:buildtrace_group /app

# Copy application code with correct permissions
COPY --chown=buildtrace_user:buildtrace_group ./app /app/app

# Switch to standard non-privileged user context
USER buildtrace_user

# Expose internal FastAPI gateway ingress port
EXPOSE 3000

# Set environment variables for GPU and ports
ENV PORT=3000

# Docker Healthcheck to verify the server is active and serving requests
HEALTHCHECK --interval=30s --timeout=5s --start-period=45s --retries=3 \
  CMD curl -f http://localhost:3000/api/v1/health || exit 1

# Start FastAPI server under high-performance Uvicorn loop
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "3000", "--workers", "1"]

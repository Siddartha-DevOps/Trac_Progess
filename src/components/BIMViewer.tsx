import React, { useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { BIMElement, Anomaly } from "../types";

// Setup mock 3D BIM elements matching the coordinate grids
const MOCK_BIM_ELEMENTS: BIMElement[] = [
  { id: "slab_foundation", name: "Foundation Slab (Zone A)", category: "Structure", type: "Slab", progress: 100, status: "completed", position: [0, -0.2, 0], size: [22, 0.4, 16], material: "M35 Reinforce Concrete", installationDate: "Week 1", costEstimate: 450000 },
  
  { id: "col_c1", name: "Structural Column C1", category: "Structure", type: "Column", progress: 100, status: "completed", position: [-8, 2.5, -5], size: [0.8, 5, 0.8], material: "Fe550 TMT + Concrete", installationDate: "Week 1", costEstimate: 85000 },
  { id: "col_c2", name: "Structural Column C2", category: "Structure", type: "Column", progress: 100, status: "completed", position: [8, 2.5, -5], size: [0.8, 5, 0.8], material: "Fe550 TMT + Concrete", installationDate: "Week 1", costEstimate: 85000 },
  { id: "col_c3", name: "Structural Column C3", category: "Structure", type: "Column", progress: 100, status: "completed", position: [-8, 2.5, 5], size: [0.8, 5, 0.8], material: "Fe550 TMT + Concrete", installationDate: "Week 2", costEstimate: 85000 },
  { id: "col_c4", name: "Structural Column C4", category: "Structure", type: "Column", progress: 75, status: "delayed", position: [8, 2.5, 5], size: [0.8, 5, 0.8], material: "Fe550 TMT + Concrete", installationDate: "Week 2", anomalyId: "anom_rebar_density", costEstimate: 85000 },

  { id: "slab_first_floor", name: "Ceiling Slab (L1 Zone B)", category: "Structure", type: "Slab", progress: 100, status: "completed", position: [0, 5, 0], size: [22, 0.3, 16], material: "M30 RCC Slab", installationDate: "Week 2", costEstimate: 380000 },
  
  { id: "col_c5", name: "Structural Column C5", category: "Structure", type: "Column", progress: 90, status: "in_progress", position: [-8, 7.5, -5], size: [0.8, 5, 0.8], material: "Fe550 TMT + Concrete", installationDate: "Week 3", costEstimate: 90000 },
  { id: "col_c6", name: "Structural Column C6", category: "Structure", type: "Column", progress: 40, status: "in_progress", position: [8, 7.5, -5], size: [0.8, 5, 0.8], material: "Fe550 TMT + Concrete", installationDate: "Week 3", costEstimate: 90000 },
  { id: "col_c7", name: "Structural Column C7", category: "Structure", type: "Column", progress: 0, status: "not_started", position: [-8, 7.5, 5], size: [0.8, 5, 0.8], material: "Fe550 TMT + Concrete", installationDate: "Week 4", costEstimate: 90000 },
  { id: "col_c8", name: "Structural Column C8", category: "Structure", type: "Column", progress: 0, status: "not_started", position: [8, 7.5, 5], size: [0.8, 5, 0.8], material: "Fe550 TMT + Concrete", installationDate: "Week 4", costEstimate: 90000 },

  { id: "slab_roof", name: "Roof Slab (L2)", category: "Structure", type: "Slab", progress: 0, status: "not_started", position: [0, 10, 0], size: [22, 0.3, 16], material: "M30 RCC Slab", installationDate: "Week 5", costEstimate: 410000 },

  // MEP Elements (appear from Week 3/4)
  { id: "mep_duct_main", name: "HVAC Main Air Duct (L1)", category: "MEP", type: "Duct", progress: 100, status: "completed", position: [0, 4.2, 0], size: [18, 0.6, 0.6], material: "Galvanized Sheet Steel", installationDate: "Week 3", costEstimate: 120000 },
  { id: "mep_duct_branch", name: "HVAC Branch Duct C4", category: "MEP", type: "Duct", progress: 15, status: "delayed", position: [4, 4.2, 4], size: [0.5, 0.4, 6], material: "Aluminium Flexible Duct", installationDate: "Week 4", anomalyId: "anom_duct_clash", costEstimate: 45000 },
  { id: "mep_pipe_water", name: "Sprinkler Pipe Main Line", category: "MEP", type: "Pipe", progress: 80, status: "in_progress", position: [-2, 4.4, -3], size: [16, 0.15, 0.15], material: "CPVC Fire-Shield Pipe", installationDate: "Week 3", costEstimate: 60000 },

  // Architectural partition drywalls
  { id: "arch_wall_w1", name: "Zone B North Drywall", category: "Arch", type: "Wall", progress: 100, status: "completed", position: [-5, 2.5, -2], size: [0.2, 5, 8], material: "Gypsum Partition Wall", installationDate: "Week 3", costEstimate: 55000 },
  { id: "arch_wall_w2", name: "Zone B South Drywall", category: "Arch", type: "Wall", progress: 30, status: "in_progress", position: [5, 2.5, 1], size: [0.2, 5, 6], material: "Gypsum Partition Wall", installationDate: "Week 4", costEstimate: 48000 },
  { id: "arch_wall_w3", name: "Main Office Division Wall", category: "Arch", type: "Wall", progress: 0, status: "not_started", position: [0, 7.5, 2], size: [12, 5, 0.2], material: "Lightweight AAC Blocks", installationDate: "Week 5", costEstimate: 75000 }
];

interface BIMViewerProps {
  onSelectElement: (element: BIMElement | null) => void;
  selectedElement: BIMElement | null;
  anomalies: Anomaly[];
  currentWeek: number;
}

export default function BIMViewer({ onSelectElement, selectedElement, anomalies, currentWeek }: BIMViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const elementMeshesRef = useRef<Map<string, THREE.Object3D>>(new Map());
  const pointCloudsRef = useRef<Map<string, THREE.Points>>(new Map());

  // Viewer State Controls
  const [visualMode, setVisualMode] = useState<"shaded" | "pointcloud" | "overlay">("shaded");
  const [filterCategory, setFilterCategory] = useState<"All" | "Structure" | "MEP" | "Arch">("All");
  const [hoveredElement, setHoveredElement] = useState<BIMElement | null>(null);

  // Status colors matching site tracking progress
  const statusColors = {
    completed: 0x22c55e, // Green
    in_progress: 0x3b82f6, // Blue
    delayed: 0xef4444, // Red
    not_started: 0xd1d5db // Grey
  };

  // Helper to determine if an element should render based on current timeline week selection
  const shouldRenderInWeek = (element: BIMElement, week: number) => {
    const installWeek = parseInt(element.installationDate?.replace("Week ", "") || "1");
    return installWeek <= week;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Warm clean light slate background
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(
      45,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(22, 14, 22);
    camera.lookAt(0, 4, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(15, 30, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const softLight = new THREE.DirectionalLight(0xa5b4fc, 0.3); // subtle blue soft light for detailing shadows
    softLight.position.set(-15, 10, -10);
    scene.add(softLight);

    // Grid Helper
    const gridHelper = new THREE.GridHelper(30, 30, 0x94a3b8, 0xe2e8f0);
    gridHelper.position.y = -0.4;
    scene.add(gridHelper);

    // Axes Helper (subtle)
    const axesHelper = new THREE.AxesHelper(3);
    axesHelper.position.set(-14, 0, -11);
    scene.add(axesHelper);

    // 5. Build elements
    rebuildScene();

    // 6. Interaction Setup (Raycasting & Dragging)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleMouseMove = (event: MouseEvent) => {
      if (!containerRef.current || !rendererRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = (Array.from(elementMeshesRef.current.values()) as THREE.Object3D[]).filter(obj => obj.visible);
      const intersects = raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        let rootObj = intersects[0].object;
        while (rootObj.parent && rootObj.parent !== scene) {
          rootObj = rootObj.parent;
        }
        const elemId = rootObj.name;
        const matched = MOCK_BIM_ELEMENTS.find(e => e.id === elemId);
        if (matched) {
          setHoveredElement(matched);
          document.body.style.cursor = "pointer";
          return;
        }
      }
      setHoveredElement(null);
      document.body.style.cursor = "default";
    };

    const handleMouseClick = (event: MouseEvent) => {
      if (!containerRef.current || !rendererRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const meshes = (Array.from(elementMeshesRef.current.values()) as THREE.Object3D[]).filter(obj => obj.visible);
      const intersects = raycaster.intersectObjects(meshes, true);

      if (intersects.length > 0) {
        let rootObj = intersects[0].object;
        while (rootObj.parent && rootObj.parent !== scene) {
          rootObj = rootObj.parent;
        }
        const elemId = rootObj.name;
        const matched = MOCK_BIM_ELEMENTS.find(e => e.id === elemId);
        if (matched) {
          onSelectElement(matched);
          return;
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", handleMouseMove);
    renderer.domElement.addEventListener("click", handleMouseClick);

    // 7. Auto-resize observer as per guidelines
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (rendererRef.current && cameraRef.current) {
          rendererRef.current.setSize(width, height);
          cameraRef.current.aspect = width / height;
          cameraRef.current.updateProjectionMatrix();
        }
      }
    });
    resizeObserver.observe(containerRef.current);

    // Simple auto-rotate loop
    let angle = 0;
    const animate = () => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      requestAnimationFrame(animate);

      // Rotate camera slightly around center for a cinematic feel
      angle += 0.0012;
      const radius = 31;
      cameraRef.current.position.x = radius * Math.cos(angle);
      cameraRef.current.position.z = radius * Math.sin(angle);
      cameraRef.current.lookAt(0, 3.5, 0);

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    animate();

    // Cleanups
    return () => {
      resizeObserver.disconnect();
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.removeEventListener("mousemove", handleMouseMove);
        rendererRef.current.domElement.removeEventListener("click", handleMouseClick);
        rendererRef.current.domElement.remove();
      }
      // dispose of Geometries/Materials
      elementMeshesRef.current.forEach(mesh => {
        mesh.traverse((node: any) => {
          if (node.isMesh) {
            node.geometry.dispose();
            if (Array.isArray(node.material)) {
              node.material.forEach((m) => m.dispose());
            } else {
              node.material.dispose();
            }
          }
        });
      });
    };
  }, []);

  // Sync state changes back into Three.js Scene
  const rebuildScene = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old elements from scene
    elementMeshesRef.current.forEach(mesh => scene.remove(mesh));
    elementMeshesRef.current.clear();

    pointCloudsRef.current.forEach(cloud => scene.remove(cloud));
    pointCloudsRef.current.clear();

    MOCK_BIM_ELEMENTS.forEach((elem) => {
      // 1. Structural Filter Category
      if (filterCategory !== "All" && elem.category !== filterCategory) return;

      // 2. Schedule timeline filter
      const visible = shouldRenderInWeek(elem, currentWeek);
      if (!visible) return;

      // Draw the Shaded CAD Mesh representation
      const isSelected = selectedElement && selectedElement.id === elem.id;
      const baseColor = statusColors[elem.status];

      const geo = new THREE.BoxGeometry(elem.size[0], elem.size[1], elem.size[2]);
      
      // Wireframe or Solid Material
      let material;
      if (visualMode === "shaded") {
        material = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xf59e0b : baseColor, // amber highlight if selected
          roughness: 0.35,
          metalness: elem.category === "MEP" ? 0.8 : 0.1,
          transparent: true,
          opacity: 0.9
        });
      } else if (visualMode === "overlay") {
        // Transparent BIM overlayed with points
        material = new THREE.MeshStandardMaterial({
          color: isSelected ? 0xf59e0b : baseColor,
          transparent: true,
          opacity: 0.3,
          wireframe: false
        });
      } else {
        // Point Cloud mode: Shaded mesh hidden, only point cloud is shown
        material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.0 });
      }

      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(elem.position[0], elem.position[1], elem.position[2]);
      mesh.name = elem.id;
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      // Subtle edge outlines for BIM-look
      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({ 
        color: isSelected ? 0xf59e0b : 0x475569, 
        linewidth: isSelected ? 2 : 1,
        transparent: true,
        opacity: visualMode === "pointcloud" ? 0.05 : 0.4
      });
      const line = new THREE.LineSegments(edges, lineMat);
      mesh.add(line);

      scene.add(mesh);
      elementMeshesRef.current.set(elem.id, mesh);

      // Render simulated photogrammetry Drone Point Cloud
      if (visualMode === "pointcloud" || visualMode === "overlay") {
        const pointDensity = 150; // Points per element box
        const positions = [];
        const colors = [];
        const elemColor = new THREE.Color(baseColor);
        
        // Random distribution of points mimicking spatial photogrammetry surface capture
        for (let i = 0; i < pointDensity; i++) {
          // distribute randomly inside bounding volume
          const px = elem.position[0] + (Math.random() - 0.5) * elem.size[0] * 1.05;
          const py = elem.position[1] + (Math.random() - 0.5) * elem.size[1] * 1.05;
          const pz = elem.position[2] + (Math.random() - 0.5) * elem.size[2] * 1.05;

          positions.push(px, py, pz);

          // Add minor positional deviations to represent actual site measurement noise!
          const noise = 0.04;
          const r = Math.min(1, Math.max(0, elemColor.r + (Math.random() - 0.5) * noise));
          const g = Math.min(1, Math.max(0, elemColor.g + (Math.random() - 0.5) * noise));
          const b = Math.min(1, Math.max(0, elemColor.b + (Math.random() - 0.5) * noise));
          colors.push(r, g, b);
        }

        const pointGeo = new THREE.BufferGeometry();
        pointGeo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
        pointGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

        const pointMat = new THREE.PointsMaterial({
          size: 0.15,
          vertexColors: true,
          transparent: true,
          opacity: 0.85
        });

        const pointCloud = new THREE.Points(pointGeo, pointMat);
        scene.add(pointCloud);
        pointCloudsRef.current.set(elem.id, pointCloud);
      }
    });
  };

  // Trigger re-render of scene objects when filter state or timeline updates
  useEffect(() => {
    rebuildScene();
  }, [visualMode, filterCategory, currentWeek, selectedElement]);

  return (
    <div className="relative w-full h-full bg-slate-50 flex flex-col rounded-xl overflow-hidden shadow-inner border border-slate-200">
      
      {/* 3D Viewport Controls Bar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2 items-center bg-white/95 backdrop-blur-md p-2 rounded-lg shadow-md border border-slate-200 text-xs text-slate-700">
        <span className="font-semibold text-slate-800 pr-1 border-r border-slate-200">Visuals:</span>
        <button
          onClick={() => setVisualMode("shaded")}
          className={`px-2 py-1 rounded transition ${visualMode === "shaded" ? "bg-indigo-600 text-white font-medium" : "hover:bg-slate-100"}`}
        >
          BIM Model
        </button>
        <button
          onClick={() => setVisualMode("pointcloud")}
          className={`px-2 py-1 rounded transition ${visualMode === "pointcloud" ? "bg-indigo-600 text-white font-medium" : "hover:bg-slate-100"}`}
        >
          Drone Point Cloud
        </button>
        <button
          onClick={() => setVisualMode("overlay")}
          className={`px-2 py-1 rounded transition ${visualMode === "overlay" ? "bg-indigo-600 text-white font-medium" : "hover:bg-slate-100"}`}
        >
          Combined Sync Overlay
        </button>
      </div>

      {/* Category Filter Controls */}
      <div className="absolute top-3 right-3 z-10 flex gap-1 bg-white/95 backdrop-blur-md p-1.5 rounded-lg shadow-md border border-slate-200 text-xs">
        {(["All", "Structure", "MEP", "Arch"] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-2.5 py-1 rounded-md transition ${filterCategory === cat ? "bg-slate-800 text-white font-medium" : "text-slate-600 hover:bg-slate-100"}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3D Render Canvas Container */}
      <div ref={containerRef} className="w-full flex-1" id="bim-canvas-container" />

      {/* Hover Information / Hover HUD */}
      {hoveredElement && (
        <div className="absolute bottom-16 left-4 z-10 bg-slate-900/95 backdrop-blur text-white px-3 py-2 rounded-lg shadow-lg text-xs flex flex-col gap-1 border border-slate-700 pointer-events-none transition-all">
          <div className="font-semibold flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full`} style={{ backgroundColor: hoveredElement.status === 'completed' ? '#22c55e' : (hoveredElement.status === 'in_progress' ? '#3b82f6' : (hoveredElement.status === 'delayed' ? '#ef4444' : '#94a3b8')) }} />
            {hoveredElement.name}
          </div>
          <div className="flex justify-between gap-4 text-slate-300">
            <span>Type: {hoveredElement.type} ({hoveredElement.category})</span>
            <span>Progress: {hoveredElement.progress}%</span>
          </div>
          {hoveredElement.anomalyId && (
            <span className="text-red-400 font-medium text-[10px] animate-pulse">⚠️ CV progress anomaly detected! Click to inspect.</span>
          )}
        </div>
      )}

      {/* Status Legends */}
      <div className="absolute bottom-3 right-3 z-10 flex gap-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md border border-slate-200 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Delayed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span>Not Scheduled</span>
        </div>
      </div>
      
    </div>
  );
}

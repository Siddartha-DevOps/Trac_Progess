import * as THREE from "three";
import { BIMElement } from "../../types";

export interface BIMElementMetadata {
  id: string;
  guid: string;
  name: string;
  type: string;
  category: "Structure" | "MEP" | "Arch";
  properties: Record<string, string | number | boolean>;
  status: "completed" | "in_progress" | "delayed" | "not_started";
  floor: "Ground Floor" | "First Floor" | "Second Floor" | "Roof";
  position: [number, number, number];
  size: [number, number, number];
}

// Abstraction layer interface for any BIM Viewer Engine (IFC.js, APS/Forge, xeokit)
export interface IBIMViewerEngine {
  initialize(container: HTMLDivElement, options?: { onSelect: (elemId: string | null) => void }): void;
  resize(): void;
  destroy(): void;
  loadModel(fileOrUrl: File | string): Promise<BIMElementMetadata[]>;
  setHighlight(elementId: string, status: "completed" | "in_progress" | "delayed" | "not_started" | "not_detected" | null): void;
  clearHighlights(): void;
  setFloorFilter(floor: string | null): void;
  setTradeFilter(trade: "Structure" | "MEP" | "Arch" | null): void;
  setSectionCut(axis: "x" | "y" | "z" | null, percentage: number): void;
  getElements(): BIMElementMetadata[];
  getEngineName(): string;
  zoomToElement(elementId: string): void;
  
  // New interactive UI controls
  zoom(direction: "in" | "out"): void;
  resetCamera(): void;
  toggleElementVisibility(elementId: string, visible: boolean): void;
  showAllElements(): void;
  setMeasurementMode(active: boolean, onMeasure?: (distance: number | null, p1?: [number, number, number], p2?: [number, number, number]) => void): void;
  clearMeasurements(): void;
}

// Standard parsed IFC file metadata simulator/parser helper
export function parseIFCFileText(text: string): Partial<BIMElementMetadata>[] {
  const elements: Partial<BIMElementMetadata>[] = [];
  const lines = text.split("\n");
  
  // Basic heuristic parser for IFC text lines
  // e.g., #115= IFCWALL('3b8s92jaK29s1A8dzLpwQ1',$,'Drywall Partition',$,$,#110,#114,$);
  const guidRegex = /'([A-Za-z0-9_$]{22})'/;
  
  for (const line of lines) {
    if (line.includes("IFCWALL") || line.includes("IFCCOLUMN") || line.includes("IFCBEAM") || line.includes("IFCSLAB") || line.includes("IFCDUCT") || line.includes("IFCPIPE")) {
      const guidMatch = line.match(guidRegex);
      const guid = guidMatch ? guidMatch[1] : `guid_${Math.random().toString(36).substr(2, 9)}`;
      
      let type = "Wall";
      let category: "Structure" | "MEP" | "Arch" = "Arch";
      
      if (line.includes("IFCCOLUMN")) {
        type = "Column";
        category = "Structure";
      } else if (line.includes("IFCBEAM")) {
        type = "Beam";
        category = "Structure";
      } else if (line.includes("IFCSLAB")) {
        type = "Slab";
        category = "Structure";
      } else if (line.includes("IFCDUCT")) {
        type = "Duct";
        category = "MEP";
      } else if (line.includes("IFCPIPE")) {
        type = "Pipe";
        category = "MEP";
      }

      // Try to find a name in the IFC line string
      let name = `IFC ${type}`;
      const nameParts = line.split("'");
      if (nameParts.length >= 6) {
        name = nameParts[5] || name;
      }

      elements.push({
        guid,
        name,
        type,
        category,
        properties: {
          "IFC Class": `Ifc${type}`,
          "GlobalId": guid,
          "LoadBearing": type === "Column" || type === "Slab" || type === "Beam" ? "TRUE" : "FALSE",
          "Material": category === "Structure" ? "Concrete M35" : (category === "MEP" ? "Galvanized Steel" : "Gypsum Board")
        }
      });
    }
  }

  return elements;
}

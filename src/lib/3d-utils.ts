import * as THREE from 'three';
import type { Position } from './game-logic';
import { PLAYER_COLORS, AI_COLORS } from './game-logic';

// Helper to convert our game coordinates to Three.js coordinates
export function gameToWorldPosition(position: Position, cellSize: number = 1, spacing: number = 0.2, boardSize: number = 3): THREE.Vector3 {
  // Center the grid around origin
  const offset = ((boardSize - 1) * (cellSize + spacing)) / 2;
  
  // Convert from game coordinates to world space
  const x = position.x * (cellSize + spacing) - offset;
  const y = position.y * (cellSize + spacing) - offset;
  const z = position.z * (cellSize + spacing) - offset;
  
  return new THREE.Vector3(x, y, z);
}

// Create a material for player marbles with nice glossy effect
export function createMarbleMaterial(player: 1 | 2, level: number = 1): THREE.Material {
  // Get colors directly from color arrays based on level (1-indexed)
  const colorIndex = Math.max(0, Math.min(19, level - 1));
  const colorString = player === 1 ? PLAYER_COLORS[colorIndex] : AI_COLORS[colorIndex];
  
  // Convert OKLCH to hex - Three.js doesn't support OKLCH directly
  // We'll use approximate hex equivalents for the most common colors
  const color = convertOklchToHex(colorString);
  
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.3,
    roughness: 0.2,
    envMapIntensity: 0.8
  });
  
  return material;
}

// Convert OKLCH color strings to hex values that Three.js can understand
function convertOklchToHex(oklchString: string): number {
  // Map of OKLCH strings to approximate hex values
  // This includes ALL colors from both PLAYER_COLORS and AI_COLORS arrays
  const colorMap: Record<string, number> = {
    // Player colors (matching PLAYER_COLORS array exactly)
    'oklch(0.62 0.22 25)': 0xe11d48,    // Ruby red (default)
    'oklch(0.7 0.2 50)': 0xf97316,      // Orange
    'oklch(0.8 0.18 85)': 0xf59e0b,     // Amber
    'oklch(0.85 0.2 120)': 0x84cc16,    // Yellow-green
    'oklch(0.7 0.2 140)': 0x22c55e,     // Green
    'oklch(0.65 0.2 170)': 0x14b8a6,    // Teal
    'oklch(0.65 0.15 200)': 0x0891b2,   // Cyan blue
    'oklch(0.55 0.15 250)': 0x3b82f6,   // Royal blue
    'oklch(0.5 0.2 280)': 0x6366f1,     // Indigo
    'oklch(0.6 0.25 300)': 0x8b5cf6,    // Purple
    'oklch(0.7 0.25 320)': 0xd946ef,    // Magenta
    'oklch(0.65 0.28 350)': 0xec4899,   // Pink
    'oklch(0.8 0.1 0)': 0xf87171,       // Soft red
    'oklch(0.5 0.1 100)': 0x84cc16,     // Olive (reusing yellow-green for olive)
    'oklch(0.45 0.15 180)': 0x0e7490,   // Deep sea
    'oklch(0.35 0.15 240)': 0x1e40af,   // Midnight blue
    'oklch(0.4 0.15 270)': 0x5b21b6,    // Deep purple
    'oklch(0.3 0.1 290)': 0x581c87,     // Dark plum
    'oklch(0.7 0.05 30)': 0xa16207,     // Muted brown
    'oklch(0.9 0.05 60)': 0xeab308,     // Gold
    
    // AI colors (matching AI_COLORS array exactly)
    // Note: Some AI colors are duplicates of player colors (they reuse values)
    'oklch(0.5 0.1 300)': 0xc084fc,     // Lavender (contrasts with Soft red)
    'oklch(0.7 0.2 200)': 0x22d3ee,     // Bright aqua (contrasts with Olive)
    'oklch(0.8 0.15 100)': 0xa3e635,    // Lime (contrasts with Deep sea)
    'oklch(0.75 0.25 50)': 0xfb923c,    // Bright orange (contrasts with Midnight blue)
    'oklch(0.8 0.2 80)': 0xfde047,      // Yellow (contrasts with Deep purple)
    'oklch(0.85 0.15 140)': 0x86efac,   // Mint (contrasts with Dark plum)
    'oklch(0.5 0.15 230)': 0x0ea5e9,    // Azure (contrasts with Muted brown)
    'oklch(0.4 0.2 270)': 0x7c3aed,     // Violet (contrasts with Gold)
  };
  
  // Return mapped color or fallback
  const hexColor = colorMap[oklchString];
  if (hexColor !== undefined) {
    return hexColor;
  }
  
  // Fallback colors - this should rarely be reached now that all colors are mapped
  console.warn(`Unknown OKLCH color: ${oklchString}, using fallback`);
  return 0xe11d48; // Ruby red fallback
}



// Create a cell material
export function createCellMaterial(hovered: boolean = false, inWinningLine: boolean = false, hasMarble: boolean = false): THREE.Material {
  return new THREE.MeshStandardMaterial({
    color: inWinningLine ? 0x8b5cf6 : (hovered ? 0x94a3b8 : 0x64748b),
    transparent: true,
    opacity: hasMarble ? 0 : 0.15, // Make completely transparent when a marble is placed
    side: THREE.DoubleSide,
    metalness: 0.1,
    roughness: 0.8
  });
}

// Setup basic lighting for the scene
export function setupLighting(scene: THREE.Scene): void {
  // Ambient light for general illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Directional light for shadows and highlights
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 10, 7);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 1024;
  directionalLight.shadow.mapSize.height = 1024;
  scene.add(directionalLight);
  
  // Point lights for dramatic effects
  const pointLightBlue = new THREE.PointLight(0x0891b2, 0.5, 10);
  pointLightBlue.position.set(-5, -2, 3);
  scene.add(pointLightBlue);
  
  const pointLightRed = new THREE.PointLight(0xe11d48, 0.5, 10);
  pointLightRed.position.set(5, -2, -3);
  scene.add(pointLightRed);
}

// Create a highlighted line for winning combination
export function createWinningLine(start: THREE.Vector3, end: THREE.Vector3): THREE.Line {
  const material = new THREE.LineBasicMaterial({ 
    color: 0x8b5cf6, 
    linewidth: 3,
  });
  
  const points = [start, end];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  
  return new THREE.Line(geometry, material);
}
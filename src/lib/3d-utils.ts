import * as THREE from 'three';
import type { Position } from './game-logic';

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
  // Get colors from color arrays based on level (1-indexed)
  const colorIndex = Math.max(0, Math.min(19, level - 1));
  const cssColorVar = player === 1 ? `var(--player-color-${colorIndex})` : `var(--ai-color-${colorIndex})`;
  
  // Get the computed color from CSS
  const color = getComputedColor(cssColorVar);
  
  const material = new THREE.MeshStandardMaterial({
    color,
    metalness: 0.3,
    roughness: 0.2,
    envMapIntensity: 0.8
  });
  
  return material;
}

// Helper function to get computed color from CSS variable
function getComputedColor(cssVar: string): number {
  // Default fallback colors if CSS variable not available
  const fallbackColors = {
    player: 0xe11d48, // Ruby red (player)
    ai: 0x0891b2  // Cyan blue (AI)
  };
  
  try {
    // For client-side rendering where document is available
    if (typeof document !== 'undefined') {
      const style = getComputedStyle(document.documentElement);
      const cssVarName = cssVar.replace('var(', '').replace(')', '').trim();
      const color = style.getPropertyValue(cssVarName);
      if (color && color.trim() !== '') {
        return new THREE.Color(color).getHex();
      }
    }
  } catch (e) {
    console.error('Error getting computed color:', e);
  }
  
  // Fallback based on player
  return cssVar.includes('player-color') ? fallbackColors.player : fallbackColors.ai;
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
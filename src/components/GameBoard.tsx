import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { 
  Board, 
  Position, 
  Player, 
  WinningLine, 
  isValidMove
} from '../lib/game-logic';
import { 
  gameToWorldPosition, 
  createMarbleMaterial, 
  createCellMaterial, 
  setupLighting, 
  createWinningLine 
} from '../lib/3d-utils';

interface GameBoardProps {
  board: Board;
  currentPlayer: Player;
  gameState: 'playing' | 'won' | 'draw';
  winningLine: WinningLine | null;
  onCellClick: (position: Position) => void;
  boardSize: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ 
  board, 
  currentPlayer, 
  gameState, 
  winningLine, 
  onCellClick,
  boardSize = 3 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cellRefs = useRef<THREE.Mesh[][][]>([]);
  const marbleRefs = useRef<THREE.Mesh[][][]>([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const winningLineRef = useRef<THREE.Line | null>(null);
  
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);
  
  // Cell and spacing dimensions - adjust based on board size
  const CELL_SIZE = Math.max(0.4, 1.5 - (boardSize * 0.1)); // Smaller cells for larger boards
  const SPACING = Math.max(0.1, 0.3 - (boardSize * 0.02));
  const MARBLE_RADIUS = CELL_SIZE * 0.4;
  
  // Initialize the 3D scene
  useEffect(() => {
    if (!mountRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);
    sceneRef.current = scene;
    
    // Create camera - adjust distance for larger board sizes
    const camera = new THREE.PerspectiveCamera(
      50, 
      mountRef.current.clientWidth / mountRef.current.clientHeight, 
      0.1, 
      1000
    );
    // Position camera based on board size
    const cameraDistance = boardSize * 2;
    camera.position.set(cameraDistance, cameraDistance, cameraDistance);
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add orbit controls for camera
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = boardSize * 8;
    controls.minDistance = boardSize * 1.5;
    controlsRef.current = controls;
    
    // Add lighting
    setupLighting(scene);
    
    // Create grid
    createGrid();
    
    // Animation loop
    const animate = () => {
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      requestAnimationFrame(animate);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (mountRef.current && cameraRef.current && rendererRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => {
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [boardSize]);
  
  // Create the 3D grid
  const createGrid = () => {
    if (!sceneRef.current) return;
    
    const scene = sceneRef.current;
    
    // Remove previous grid if it exists
    scene.children.forEach(child => {
      if (child.name === 'grid') {
        scene.remove(child);
      }
    });
    
    const cellsContainer = new THREE.Group();
    cellsContainer.name = 'grid';
    scene.add(cellsContainer);
    
    // Initialize the cell and marble refs arrays
    cellRefs.current = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize)
        .fill(null)
        .map(() => Array(boardSize).fill(null)));
    
    marbleRefs.current = Array(boardSize)
      .fill(null)
      .map(() => Array(boardSize)
        .fill(null)
        .map(() => Array(boardSize).fill(null)));
    
    // Create cells
    for (let z = 0; z < boardSize; z++) {
      for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
          const position = { x, y, z };
          const worldPos = gameToWorldPosition(position, CELL_SIZE, SPACING, boardSize);
          
          // Create cell cube
          const geometry = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
          const material = createCellMaterial();
          const cell = new THREE.Mesh(geometry, material);
          cell.position.copy(worldPos);
          cell.userData = { type: 'cell', position: { x, y, z } };
          
          cellsContainer.add(cell);
          cellRefs.current[z][y][x] = cell;
        }
      }
    }
    
    // Optional: Add frame/outline for visual clarity
    const frameSize = boardSize * (CELL_SIZE + SPACING) - SPACING;
    const frameGeometry = new THREE.BoxGeometry(frameSize, frameSize, frameSize);
    const frameMaterial = new THREE.MeshBasicMaterial({ 
      color: 0x475569, 
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    cellsContainer.add(frame);
  };
  
  // Update the board display
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Update cells and marbles
    for (let z = 0; z < boardSize; z++) {
      for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
          const cell = cellRefs.current?.[z]?.[y]?.[x];
          if (!cell) continue;
          
          const cellValue = board?.[z]?.[y]?.[x];
          const isHovered = hoveredCell?.x === x && hoveredCell?.y === y && hoveredCell?.z === z;
          const isInWinningLine = winningLine?.positions.some(
            pos => pos.x === x && pos.y === y && pos.z === z
          );
          
          // Update cell material
          cell.material = createCellMaterial(isHovered, !!isInWinningLine);
          
          // Add, update, or remove marbles
          if (cellValue !== null) {
            // Marble should exist - add if it doesn't
            if (!marbleRefs.current[z][y][x]) {
              const position = gameToWorldPosition({ x, y, z }, CELL_SIZE, SPACING, boardSize);
              const geometry = new THREE.SphereGeometry(MARBLE_RADIUS, 32, 32);
              const material = createMarbleMaterial(cellValue);
              const marble = new THREE.Mesh(geometry, material);
              marble.position.copy(position);
              marble.castShadow = true;
              marble.receiveShadow = true;
              
              sceneRef.current.add(marble);
              marbleRefs.current[z][y][x] = marble;
            }
          } else {
            // No value, remove marble if exists
            if (marbleRefs.current[z][y][x]) {
              sceneRef.current.remove(marbleRefs.current[z][y][x]);
              marbleRefs.current[z][y][x] = null;
            }
          }
        }
      }
    }
    
    // Add winning line visual if applicable
    if (winningLine && sceneRef.current) {
      // Remove previous winning line if exists
      if (winningLineRef.current) {
        sceneRef.current.remove(winningLineRef.current);
        winningLineRef.current = null;
      }
      
      // Get start and end positions
      const startPos = gameToWorldPosition(winningLine.positions[0], CELL_SIZE, SPACING, boardSize);
      const endPos = gameToWorldPosition(winningLine.positions[winningLine.positions.length - 1], CELL_SIZE, SPACING, boardSize);
      
      // Create winning line
      const line = createWinningLine(startPos, endPos);
      sceneRef.current.add(line);
      winningLineRef.current = line;
    } else if (winningLineRef.current && sceneRef.current) {
      // Remove line if no winning line
      sceneRef.current.remove(winningLineRef.current);
      winningLineRef.current = null;
    }
  }, [board, hoveredCell, winningLine, boardSize]);
  
  // Handle mouse movement for hover effects and wheel for zoom
  useEffect(() => {
    if (!mountRef.current) return;
    
    const handleMouseMove = (event: MouseEvent) => {
      if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
      
      // Calculate mouse position in normalized device coordinates
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Raycast to find intersected objects
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      
      // Find all cell objects
      const cells: THREE.Object3D[] = [];
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh && object.userData.type === 'cell') {
          cells.push(object);
        }
      });
      
      // Get intersections with cells
      const intersects = raycasterRef.current.intersectObjects(cells);
      
      if (intersects.length > 0 && gameState === 'playing') {
        const firstIntersect = intersects[0];
        const cell = firstIntersect.object as THREE.Mesh;
        const position = cell.userData.position as Position;
        
        // Only hover if the cell is empty
        if (isValidMove(board, position)) {
          setHoveredCell(position);
        } else {
          setHoveredCell(null);
        }
      } else {
        setHoveredCell(null);
      }
    };
    
    // Instead of click, handle space bar press for placing the marble
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Space' && hoveredCell && gameState === 'playing') {
        event.preventDefault();
        onCellClick(hoveredCell);
      }
    };
    
    // Add event listeners
    mountRef.current.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      mountRef.current?.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [board, gameState, hoveredCell, onCellClick]);

  return (
    <div ref={mountRef} className="w-full h-full min-h-[500px]" />
  );
};

export default GameBoard;
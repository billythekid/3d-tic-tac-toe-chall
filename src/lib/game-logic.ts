export type Player = 1 | 2;
export type Cell = Player | null;
export type GameState = 'playing' | 'won' | 'draw';
export type OpponentType = 'ai';  // Only AI opponent now

// 3D board represented as a size×size×size array
export type Board = Cell[][][];

// Position in 3D space
export interface Position {
  x: number;
  y: number;
  z: number;
}

// Winning line with positions
export interface WinningLine {
  positions: Position[];
  player: Player;
}

// Game settings
export interface GameSettings {
  opponentType: OpponentType;
  aiDifficulty: number;     // 1-20 (now reduced range)
  currentLevel: number;     // Game level (1-20)
  playerName: string;       // Player name from GitHub API
  playerScore: number;      // Player's current score
}

// Available player marble colors based on level
export const PLAYER_COLORS = [
  'oklch(0.62 0.22 25)',    // Ruby red (default)
  'oklch(0.7 0.2 50)',      // Orange
  'oklch(0.8 0.18 85)',     // Amber
  'oklch(0.85 0.2 120)',    // Yellow-green
  'oklch(0.7 0.2 140)',     // Green
  'oklch(0.65 0.2 170)',    // Teal
  'oklch(0.65 0.15 200)',   // Cyan blue
  'oklch(0.55 0.15 250)',   // Royal blue
  'oklch(0.5 0.2 280)',     // Indigo
  'oklch(0.6 0.25 300)',    // Purple
  'oklch(0.7 0.25 320)',    // Magenta
  'oklch(0.65 0.28 350)',   // Pink
  'oklch(0.8 0.1 0)',       // Soft red
  'oklch(0.5 0.1 100)',     // Olive
  'oklch(0.45 0.15 180)',   // Deep sea
  'oklch(0.35 0.15 240)',   // Midnight blue
  'oklch(0.4 0.15 270)',    // Deep purple
  'oklch(0.3 0.1 290)',     // Dark plum
  'oklch(0.7 0.05 30)',     // Muted brown
  'oklch(0.9 0.05 60)',     // Gold
];

// AI marble colors (contrasting pairs with player colors)
export const AI_COLORS = [
  'oklch(0.65 0.15 200)',   // Cyan blue (contrasts with Ruby red)
  'oklch(0.55 0.15 250)',   // Royal blue (contrasts with Orange)
  'oklch(0.5 0.2 280)',     // Indigo (contrasts with Amber)
  'oklch(0.6 0.25 300)',    // Purple (contrasts with Yellow-green)
  'oklch(0.7 0.25 320)',    // Magenta (contrasts with Green)
  'oklch(0.65 0.28 350)',   // Pink (contrasts with Teal)
  'oklch(0.62 0.22 25)',    // Ruby red (contrasts with Cyan blue)
  'oklch(0.7 0.2 50)',      // Orange (contrasts with Royal blue)
  'oklch(0.8 0.18 85)',     // Amber (contrasts with Indigo)
  'oklch(0.85 0.2 120)',    // Yellow-green (contrasts with Purple)
  'oklch(0.7 0.2 140)',     // Green (contrasts with Magenta)
  'oklch(0.65 0.2 170)',    // Teal (contrasts with Pink)
  'oklch(0.5 0.1 300)',     // Lavender (contrasts with Soft red)
  'oklch(0.7 0.2 200)',     // Bright aqua (contrasts with Olive)
  'oklch(0.8 0.15 100)',    // Lime (contrasts with Deep sea)
  'oklch(0.75 0.25 50)',    // Bright orange (contrasts with Midnight blue)
  'oklch(0.8 0.2 80)',      // Yellow (contrasts with Deep purple)
  'oklch(0.85 0.15 140)',   // Mint (contrasts with Dark plum)
  'oklch(0.5 0.15 230)',    // Azure (contrasts with Muted brown)
  'oklch(0.4 0.2 270)',     // Violet (contrasts with Gold)
];

// Default game settings
export const DEFAULT_SETTINGS: GameSettings = {
  opponentType: 'ai',
  aiDifficulty: 1,  // Start at easiest difficulty (level 1)
  currentLevel: 1,  // Start at level 1
  playerName: 'Player',
  playerScore: 0,
};

// Creates an empty board
export function createEmptyBoard(): Board {
  return Array(3).fill(null).map(() =>
    Array(3).fill(null).map(() =>
      Array(3).fill(null)
    )
  );
}

// Makes a deep copy of the board
export function copyBoard(board: Board): Board {
  return JSON.parse(JSON.stringify(board));
}

// Places a marker at the specified position
export function placeMarker(board: Board, position: Position, player: Player): Board {
  const newBoard = copyBoard(board);
  newBoard[position.z][position.y][position.x] = player;
  return newBoard;
}

// Check if the position is valid and empty
export function isValidMove(board: Board, position: Position): boolean {
  const { x, y, z } = position;
  
  // Check if position is within bounds
  if (x < 0 || x >= 3 || y < 0 || y >= 3 || z < 0 || z >= 3) {
    return false;
  }
  
  // Check if the cell is empty
  return board[z][y][x] === null;
}

// All possible win lines in a 3×3×3 tic-tac-toe
export function getAllWinLines(): Position[][] {
  const lines: Position[][] = [];
  const size = 3;
  
  // 1. Straight lines along each axis (size² * 3 lines)
  // X-axis lines
  for (let y = 0; y < size; y++) {
    for (let z = 0; z < size; z++) {
      const line: Position[] = [];
      for (let x = 0; x < size; x++) {
        line.push({ x, y, z });
      }
      lines.push(line);
    }
  }
  
  // Y-axis lines
  for (let x = 0; x < size; x++) {
    for (let z = 0; z < size; z++) {
      const line: Position[] = [];
      for (let y = 0; y < size; y++) {
        line.push({ x, y, z });
      }
      lines.push(line);
    }
  }
  
  // Z-axis lines
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      const line: Position[] = [];
      for (let z = 0; z < size; z++) {
        line.push({ x, y, z });
      }
      lines.push(line);
    }
  }
  
  // 2. Diagonals in each plane (size * 3 * 2 lines)
  // XY plane diagonals
  for (let z = 0; z < size; z++) {
    // Main diagonal (top-left to bottom-right)
    const diag1: Position[] = [];
    // Secondary diagonal (bottom-left to top-right)
    const diag2: Position[] = [];
    
    for (let i = 0; i < size; i++) {
      diag1.push({ x: i, y: i, z });
      diag2.push({ x: i, y: size - 1 - i, z });
    }
    
    lines.push(diag1);
    lines.push(diag2);
  }
  
  // XZ plane diagonals
  for (let y = 0; y < size; y++) {
    // Main diagonal
    const diag1: Position[] = [];
    // Secondary diagonal
    const diag2: Position[] = [];
    
    for (let i = 0; i < size; i++) {
      diag1.push({ x: i, y, z: i });
      diag2.push({ x: i, y, z: size - 1 - i });
    }
    
    lines.push(diag1);
    lines.push(diag2);
  }
  
  // YZ plane diagonals
  for (let x = 0; x < size; x++) {
    // Main diagonal
    const diag1: Position[] = [];
    // Secondary diagonal
    const diag2: Position[] = [];
    
    for (let i = 0; i < size; i++) {
      diag1.push({ x, y: i, z: i });
      diag2.push({ x, y: i, z: size - 1 - i });
    }
    
    lines.push(diag1);
    lines.push(diag2);
  }
  
  // 3. Corner to corner diagonals (4 lines)
  // Main diagonal (0,0,0) to (size-1,size-1,size-1)
  const mainDiagonal: Position[] = [];
  for (let i = 0; i < size; i++) {
    mainDiagonal.push({ x: i, y: i, z: i });
  }
  lines.push(mainDiagonal);
  
  // Diagonal from (0,0,size-1) to (size-1,size-1,0)
  const diag2: Position[] = [];
  for (let i = 0; i < size; i++) {
    diag2.push({ x: i, y: i, z: size - 1 - i });
  }
  lines.push(diag2);
  
  // Diagonal from (0,size-1,0) to (size-1,0,size-1)
  const diag3: Position[] = [];
  for (let i = 0; i < size; i++) {
    diag3.push({ x: i, y: size - 1 - i, z: i });
  }
  lines.push(diag3);
  
  // Diagonal from (0,size-1,size-1) to (size-1,0,0)
  const diag4: Position[] = [];
  for (let i = 0; i < size; i++) {
    diag4.push({ x: i, y: size - 1 - i, z: size - 1 - i });
  }
  lines.push(diag4);
  
  return lines;
}

// Check if the game is won
export function checkForWin(board: Board): WinningLine | null {
  const winLines = getAllWinLines();
  
  for (const line of winLines) {
    const firstPos = line[0];
    const player = board[firstPos.z][firstPos.y][firstPos.x];
    
    if (player === null) continue;
    
    let isWinningLine = true;
    for (let i = 1; i < line.length; i++) {
      const pos = line[i];
      if (board[pos.z][pos.y][pos.x] !== player) {
        isWinningLine = false;
        break;
      }
    }
    
    if (isWinningLine) {
      return {
        positions: line,
        player: player
      };
    }
  }
  
  return null;
}

// Check if the board is full (draw)
export function isBoardFull(board: Board): boolean {
  for (let z = 0; z < 3; z++) {
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (board[z][y][x] === null) {
          return false;
        }
      }
    }
  }
  
  return true;
}

// Gets all available moves on the board
export function getAvailableMoves(board: Board): Position[] {
  const moves: Position[] = [];
  for (let z = 0; z < 3; z++) {
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        if (board[z][y][x] === null) {
          moves.push({ x, y, z });
        }
      }
    }
  }
  return moves;
}
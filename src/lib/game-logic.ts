export type Player = 1 | 2;
export type Cell = Player | null;
export type GameState = 'playing' | 'won' | 'draw';
export type OpponentType = 'human' | 'ai';

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
  aiDifficulty: number;     // 1-50
}

// Default game settings
export const DEFAULT_SETTINGS: GameSettings = {
  opponentType: 'human',
  aiDifficulty: 25
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
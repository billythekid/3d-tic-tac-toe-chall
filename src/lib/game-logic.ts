export type Player = 1 | 2;
export type Cell = Player | null;
export type GameState = 'playing' | 'won' | 'draw';

// 3D board represented as a 3×3×3 array
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

// Creates an empty 3×3×3 board
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

// Checks if the position is valid and empty
export function isValidMove(board: Board, position: Position): boolean {
  const { x, y, z } = position;
  
  // Check if position is within bounds
  if (x < 0 || x > 2 || y < 0 || y > 2 || z < 0 || z > 2) {
    return false;
  }
  
  // Check if the cell is empty
  return board[z][y][x] === null;
}

// All possible win lines in a 3D tic-tac-toe
export function getAllWinLines(): Position[][] {
  const lines: Position[][] = [];
  
  // 1. Straight lines along each axis (27 lines)
  // X-axis lines (9)
  for (let y = 0; y < 3; y++) {
    for (let z = 0; z < 3; z++) {
      lines.push([
        { x: 0, y, z },
        { x: 1, y, z },
        { x: 2, y, z }
      ]);
    }
  }
  
  // Y-axis lines (9)
  for (let x = 0; x < 3; x++) {
    for (let z = 0; z < 3; z++) {
      lines.push([
        { x, y: 0, z },
        { x, y: 1, z },
        { x, y: 2, z }
      ]);
    }
  }
  
  // Z-axis lines (9)
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      lines.push([
        { x, y, z: 0 },
        { x, y, z: 1 },
        { x, y, z: 2 }
      ]);
    }
  }
  
  // 2. Diagonals in each plane (18 lines)
  // XY plane diagonals (6)
  for (let z = 0; z < 3; z++) {
    lines.push([
      { x: 0, y: 0, z },
      { x: 1, y: 1, z },
      { x: 2, y: 2, z }
    ]);
    lines.push([
      { x: 0, y: 2, z },
      { x: 1, y: 1, z },
      { x: 2, y: 0, z }
    ]);
  }
  
  // XZ plane diagonals (6)
  for (let y = 0; y < 3; y++) {
    lines.push([
      { x: 0, y, z: 0 },
      { x: 1, y, z: 1 },
      { x: 2, y, z: 2 }
    ]);
    lines.push([
      { x: 0, y, z: 2 },
      { x: 1, y, z: 1 },
      { x: 2, y, z: 0 }
    ]);
  }
  
  // YZ plane diagonals (6)
  for (let x = 0; x < 3; x++) {
    lines.push([
      { x, y: 0, z: 0 },
      { x, y: 1, z: 1 },
      { x, y: 2, z: 2 }
    ]);
    lines.push([
      { x, y: 0, z: 2 },
      { x, y: 1, z: 1 },
      { x, y: 2, z: 0 }
    ]);
  }
  
  // 3. Corner to corner diagonals (4 lines)
  lines.push([
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 1, z: 1 },
    { x: 2, y: 2, z: 2 }
  ]);
  
  lines.push([
    { x: 0, y: 0, z: 2 },
    { x: 1, y: 1, z: 1 },
    { x: 2, y: 2, z: 0 }
  ]);
  
  lines.push([
    { x: 0, y: 2, z: 0 },
    { x: 1, y: 1, z: 1 },
    { x: 2, y: 0, z: 2 }
  ]);
  
  lines.push([
    { x: 0, y: 2, z: 2 },
    { x: 1, y: 1, z: 1 },
    { x: 2, y: 0, z: 0 }
  ]);
  
  return lines;
}

// Check if the game is won
export function checkForWin(board: Board): WinningLine | null {
  const winLines = getAllWinLines();
  
  for (const line of winLines) {
    const cell1 = board[line[0].z][line[0].y][line[0].x];
    const cell2 = board[line[1].z][line[1].y][line[1].x];
    const cell3 = board[line[2].z][line[2].y][line[2].x];
    
    if (cell1 !== null && cell1 === cell2 && cell2 === cell3) {
      return {
        positions: line,
        player: cell1
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
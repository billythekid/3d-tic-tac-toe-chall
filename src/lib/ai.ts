import { Board, Position, Player, copyBoard, isValidMove, checkForWin, getAllWinLines } from './game-logic';

/**
 * Evaluates the current state of the board from the perspective of the AI player
 * Returns positive score for AI advantage, negative for opponent advantage
 */
function evaluateBoard(board: Board, aiPlayer: Player): number {
  const opponentPlayer = aiPlayer === 1 ? 2 : 1;
  const win = checkForWin(board);
  
  // If there's a win, return a high score (positive for AI, negative for opponent)
  if (win) {
    return win.player === aiPlayer ? 1000 : -1000;
  }
  
  // Get all potential win lines
  const winLines = getAllWinLines();
  let score = 0;
  
  // Evaluate each win line
  for (const line of winLines) {
    const positions = line;
    let aiCount = 0;
    let opponentCount = 0;
    let emptyCount = 0;
    
    // Count pieces in this line
    for (const pos of positions) {
      const cell = board[pos.z][pos.y][pos.x];
      if (cell === aiPlayer) {
        aiCount++;
      } else if (cell === opponentPlayer) {
        opponentCount++;
      } else {
        emptyCount++;
      }
    }
    
    // Score the line based on piece counts
    // Two AI pieces and one empty is good (potential win)
    if (aiCount === 2 && emptyCount === 1) score += 10;
    // One AI piece and two empty is slightly good
    else if (aiCount === 1 && emptyCount === 2) score += 1;
    // Two opponent pieces and one empty is bad (potential loss)
    if (opponentCount === 2 && emptyCount === 1) score -= 10;
    // One opponent piece and two empty is slightly bad
    else if (opponentCount === 1 && emptyCount === 2) score -= 1;
  }
  
  return score;
}

/**
 * Minimax algorithm with alpha-beta pruning to find the best move
 */
function minimax(
  board: Board, 
  depth: number, 
  isMaximizing: boolean, 
  aiPlayer: Player,
  alpha: number = -Infinity,
  beta: number = Infinity
): number {
  const opponentPlayer = aiPlayer === 1 ? 2 : 1;
  
  // Check terminal states
  const win = checkForWin(board);
  if (win) {
    return win.player === aiPlayer ? 1000 - depth : depth - 1000;
  }
  
  // Check if we've reached the maximum depth
  if (depth === 0) {
    return evaluateBoard(board, aiPlayer);
  }
  
  // Check for available moves
  const moves: Position[] = [];
  for (let z = 0; z < board.length; z++) {
    for (let y = 0; y < board[z].length; y++) {
      for (let x = 0; x < board[z][y].length; x++) {
        const pos = { x, y, z };
        if (isValidMove(board, pos)) {
          moves.push(pos);
        }
      }
    }
  }
  
  // If no moves left, it's a draw
  if (moves.length === 0) {
    return 0;
  }
  
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = copyBoard(board);
      newBoard[move.z][move.y][move.x] = aiPlayer;
      const evalScore = minimax(newBoard, depth - 1, false, aiPlayer, alpha, beta);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = copyBoard(board);
      newBoard[move.z][move.y][move.x] = opponentPlayer;
      const evalScore = minimax(newBoard, depth - 1, true, aiPlayer, alpha, beta);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Finds all available moves on the board
 */
function getAvailableMoves(board: Board): Position[] {
  const moves: Position[] = [];
  for (let z = 0; z < board.length; z++) {
    for (let y = 0; y < board[z].length; y++) {
      for (let x = 0; x < board[z][y].length; x++) {
        const pos = { x, y, z };
        if (isValidMove(board, pos)) {
          moves.push(pos);
        }
      }
    }
  }
  return moves;
}

/**
 * Returns a random move from the available moves
 */
function getRandomMove(board: Board): Position | null {
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
}

/**
 * Find the best move for the AI
 * @param board The current game board
 * @param aiPlayer Which player the AI is (1 or 2)
 * @param difficultyLevel Number from 1-50, higher means smarter AI
 * @returns The best position to play, or null if no moves available
 */
export function findBestMove(board: Board, aiPlayer: Player, difficultyLevel: number): Position | null {
  // Scale the difficulty level to our algorithm parameters
  const maxDepth = Math.min(5, Math.floor(difficultyLevel / 10) + 1); // 1-50 -> 1-5 depth
  const randomChance = Math.max(0, 1 - (difficultyLevel / 50)); // 1-50 -> 0.98-0 random chance
  
  // For very low difficulties, just play randomly
  if (Math.random() < randomChance) {
    return getRandomMove(board);
  }
  
  const availableMoves = getAvailableMoves(board);
  if (availableMoves.length === 0) return null;
  
  // If only one move available, take it
  if (availableMoves.length === 1) {
    return availableMoves[0];
  }
  
  // Find best move using minimax
  let bestScore = -Infinity;
  let bestMove: Position | null = null;
  
  for (const move of availableMoves) {
    const newBoard = copyBoard(board);
    newBoard[move.z][move.y][move.x] = aiPlayer;
    
    // Apply minimax with appropriate depth
    const score = minimax(newBoard, maxDepth, false, aiPlayer, -Infinity, Infinity);
    
    // Update best score and move
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}

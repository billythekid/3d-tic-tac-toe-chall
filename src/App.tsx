import { useState, useEffect } from 'react';
import { 
  createEmptyBoard, 
  placeMarker, 
  checkForWin, 
  isBoardFull, 
  Position, 
  Player, 
  Board,
  WinningLine
} from './lib/game-logic';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameHistory from './components/GameHistory';
import GameHeader from './components/GameHeader';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useKV } from '@github/spark/hooks';

interface Move {
  player: Player;
  position: Position;
}

function App() {
  // Game state (persisted via KV store)
  const [board, setBoard] = useKV<Board>("tictactoe-board", createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useKV<Player>("tictactoe-current-player", 1);
  const [gameState, setGameState] = useKV<'playing' | 'won' | 'draw'>("tictactoe-game-state", 'playing');
  const [winningLine, setWinningLine] = useKV<WinningLine | null>("tictactoe-winning-line", null);
  const [moves, setMoves] = useKV<Move[]>("tictactoe-moves", []);
  
  useEffect(() => {
    // Check for game status updates each time the board changes
    if (gameState === 'playing') {
      // Check for a win
      const win = checkForWin(board);
      if (win) {
        setWinningLine(win);
        setGameState('won');
        toast.success(`Player ${win.player} wins!`);
        return;
      }
      
      // Check for a draw
      if (isBoardFull(board)) {
        setGameState('draw');
        toast.info("Game ended in a draw!");
        return;
      }
    }
  }, [board, gameState, setGameState, setWinningLine]);

  // Handle cell click
  const handleCellClick = (position: Position) => {
    if (gameState !== 'playing') return;
    
    // Create a new board with the player's marker
    const newBoard = placeMarker(board, position, currentPlayer);
    setBoard(newBoard);
    
    // Add to move history
    const newMove = { player: currentPlayer, position };
    setMoves([...moves, newMove]);
    
    // Switch players
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  // Restart the game
  const handleRestart = () => {
    setBoard(createEmptyBoard());
    setCurrentPlayer(1);
    setGameState('playing');
    setWinningLine(null);
    setMoves([]);
    toast.info("New game started!");
  };

  return (
    <div className="flex flex-col min-h-screen p-4 md:p-8 bg-background">
      <GameHeader />
      
      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Main game area */}
        <div className="flex-1 h-[500px] lg:h-auto">
          <GameBoard
            board={board}
            currentPlayer={currentPlayer}
            gameState={gameState}
            winningLine={winningLine}
            onCellClick={handleCellClick}
          />
        </div>
        
        {/* Game controls and info */}
        <div className="w-full lg:w-80 space-y-6">
          <GameControls
            currentPlayer={currentPlayer}
            gameState={gameState}
            winner={winningLine?.player || null}
            onRestart={handleRestart}
          />
          
          <GameHistory moves={moves} />
        </div>
      </div>
      
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App
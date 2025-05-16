import { useState, useEffect } from 'react';
import { 
  createEmptyBoard, 
  placeMarker, 
  checkForWin, 
  isBoardFull, 
  Position, 
  Player, 
  Board,
  WinningLine,
  GameSettings,
  DEFAULT_SETTINGS,
  OpponentType
} from './lib/game-logic';
import { findBestMove } from './lib/ai';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameHistory from './components/GameHistory';
import GameHeader from './components/GameHeader';
import GameSettingsMenu from './components/GameSettings';
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useKV } from '@github/spark/hooks';

interface Move {
  player: Player;
  position: Position;
}

function App() {
  // Game settings
  const [settings, setSettings] = useKV<GameSettings>("tictactoe-settings", DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Game state (persisted via KV store)
  const [board, setBoard] = useKV<Board>("tictactoe-board", createEmptyBoard(settings.boardSize));
  const [currentPlayer, setCurrentPlayer] = useKV<Player>("tictactoe-current-player", 1);
  const [gameState, setGameState] = useKV<'playing' | 'won' | 'draw'>("tictactoe-game-state", 'playing');
  const [winningLine, setWinningLine] = useKV<WinningLine | null>("tictactoe-winning-line", null);
  const [moves, setMoves] = useKV<Move[]>("tictactoe-moves", []);

  // AI processing state
  const [aiThinking, setAiThinking] = useState(false);
  
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
      
      // If it's AI's turn, make AI move
      if (settings.opponentType === 'ai' && currentPlayer === 2 && !aiThinking) {
        makeAiMove();
      }
    }
  }, [board, gameState, currentPlayer, settings.opponentType, aiThinking]);
  
  // Make AI move
  const makeAiMove = async () => {
    if (gameState !== 'playing' || currentPlayer !== 2) return;
    
    setAiThinking(true);
    
    // Add a small delay to make the AI "think" (better UX)
    setTimeout(() => {
      const aiMove = findBestMove(board, currentPlayer, settings.aiDifficulty);
      
      if (aiMove) {
        // Create a new board with the AI's marker
        const newBoard = placeMarker(board, aiMove, currentPlayer);
        setBoard(newBoard);
        
        // Add to move history
        const newMove = { player: currentPlayer, position: aiMove };
        setMoves([...moves, newMove]);
        
        // Switch players
        setCurrentPlayer(1); // Back to human player
      }
      
      setAiThinking(false);
    }, 500); // 500ms delay for "thinking"
  };

  // Handle cell click
  const handleCellClick = (position: Position) => {
    if (gameState !== 'playing' || aiThinking) return;
    
    // If it's AI's turn and the player tries to move, ignore
    if (settings.opponentType === 'ai' && currentPlayer === 2) return;
    
    // Create a new board with the player's marker
    const newBoard = placeMarker(board, position, currentPlayer);
    setBoard(newBoard);
    
    // Add to move history
    const newMove = { player: currentPlayer, position };
    setMoves([...moves, newMove]);
    
    // Switch players
    setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
  };

  // Apply new settings and restart the game
  const handleApplySettings = () => {
    // Create a new board with the updated size
    setBoard(createEmptyBoard(settings.boardSize));
    setCurrentPlayer(1);
    setGameState('playing');
    setWinningLine(null);
    setMoves([]);
    toast.info(`Game restarted with ${settings.boardSize}x${settings.boardSize}x${settings.boardSize} board`);
    
    if (settings.opponentType === 'ai') {
      toast.info(`Playing against AI (Difficulty: ${settings.aiDifficulty}/50)`);
    } else {
      toast.info("Playing against human opponent");
    }
  };

  // Restart the game
  const handleRestart = () => {
    setBoard(createEmptyBoard(settings.boardSize));
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
            boardSize={settings.boardSize}
          />
        </div>
        
        {/* Game controls and info */}
        <div className="w-full lg:w-80 space-y-6">
          {settingsOpen ? (
            <GameSettingsMenu
              settings={settings}
              onSettingsChange={setSettings}
              onApplySettings={handleApplySettings}
              isOpen={settingsOpen}
              onOpenChange={setSettingsOpen}
            />
          ) : (
            <GameControls
              currentPlayer={currentPlayer}
              gameState={gameState}
              winner={winningLine?.player || null}
              onRestart={handleRestart}
              aiThinking={aiThinking}
              onOpenSettings={() => setSettingsOpen(true)}
              opponentType={settings.opponentType}
            />
          )}
          
          <GameHistory moves={moves} opponentType={settings.opponentType} />
        </div>
      </div>
      
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App
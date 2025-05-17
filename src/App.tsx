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
  PLAYER_COLORS,
  AI_COLORS,
} from './lib/game-logic';
import { findBestMove } from './lib/ai';
import { getUserName, getUserAvatar } from './lib/github-api';
import GameBoard from './components/GameBoard';
import GameControls from './components/GameControls';
import GameHistory from './components/GameHistory';
import GameHeader from './components/GameHeader';
import GameScoreboard from './components/GameScoreboard';
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
  const [userName, setUserName] = useState<string>(settings.playerName || 'Player');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  
  // Game state (persisted via KV store)
  const [board, setBoard] = useKV<Board>("tictactoe-board", createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useKV<Player>("tictactoe-current-player", 1);
  const [gameState, setGameState] = useKV<'playing' | 'won' | 'draw'>("tictactoe-game-state", 'playing');
  const [winningLine, setWinningLine] = useKV<WinningLine | null>("tictactoe-winning-line", null);
  const [moves, setMoves] = useKV<Move[]>("tictactoe-moves", []);

  // AI processing state
  const [aiThinking, setAiThinking] = useState(false);

  // Fetch user data on load
  useEffect(() => {
    async function fetchUserData() {
      const name = await getUserName();
      const avatar = await getUserAvatar();
      
      setUserName(name);
      setUserAvatar(avatar);
      
      // Update settings with GitHub username
      if (name !== settings.playerName) {
        setSettings({
          ...settings,
          playerName: name
        });
      }
    }
    
    fetchUserData();
  }, []);
  
  useEffect(() => {
    // Check for game status updates each time the board changes
    if (gameState === 'playing') {
      // Check for a win
      const win = checkForWin(board);
      if (win) {
        setWinningLine(win);
        setGameState('won');
        
        // Update player score if player wins
        if (win.player === 1) {
          const newScore = settings.playerScore + settings.currentLevel;
          const nextLevelTarget = settings.currentLevel * 3;
          
          // Check if player should level up
          if (newScore >= nextLevelTarget) {
            const newLevel = Math.min(20, settings.currentLevel + 1);
            const newDifficulty = Math.min(20, newLevel); // 1:1 mapping of level to difficulty
            
            setSettings({
              ...settings,
              playerScore: newScore - nextLevelTarget, // Reset score, carrying over excess
              currentLevel: newLevel,
              aiDifficulty: newDifficulty
            });
            
            toast.success(`Level up! You are now level ${newLevel}`);
          } else {
            // Just update score
            setSettings({
              ...settings,
              playerScore: newScore
            });
          }
          
          toast.success(`Player wins! +${settings.currentLevel} points`);
        } else {
          toast.info(`AI wins this round!`);
        }
        
        return;
      }
      
      // Check for a draw
      if (isBoardFull(board)) {
        setGameState('draw');
        toast.info("Game ended in a draw!");
        return;
      }
      
      // If it's AI's turn, make AI move
      if (currentPlayer === 2 && !aiThinking) {
        makeAiMove();
      }
    }
  }, [board, gameState, currentPlayer, aiThinking]);
  
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
    if (currentPlayer === 2) return;
    
    // Create a new board with the player's marker
    const newBoard = placeMarker(board, position, currentPlayer);
    setBoard(newBoard);
    
    // Add to move history
    const newMove = { player: currentPlayer, position };
    setMoves([...moves, newMove]);
    
    // Switch players
    setCurrentPlayer(2); // AI's turn
  };

  // Start a new game
  const handleNewGame = () => {
    // Create a new board
    setBoard(createEmptyBoard());
    setCurrentPlayer(1);
    setGameState('playing');
    setWinningLine(null);
    setMoves([]);
    
    toast.info(`Level ${settings.currentLevel}: Playing against AI (Difficulty: ${settings.aiDifficulty}/20)`);
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
            level={settings.currentLevel}
          />
        </div>
        
        {/* Game controls and info */}
        <div className="w-full lg:w-80 space-y-6">
          <GameScoreboard 
            settings={settings}
            userName={userName}
            userAvatar={userAvatar}
          />
          
          <GameControls
            currentPlayer={currentPlayer}
            gameState={gameState}
            winner={winningLine?.player || null}
            onRestart={handleNewGame}
            aiThinking={aiThinking}
            onOpenSettings={handleNewGame} // Now starts a new game instead
            opponentType="ai"
            level={settings.currentLevel}
          />
          
          <GameHistory 
            moves={moves} 
            opponentType="ai"
          />
        </div>
      </div>
      
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App
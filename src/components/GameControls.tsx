import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Player, OpponentType } from '../lib/game-logic';
import { ArrowCounterClockwise, Gear, Robot, Brain } from '@phosphor-icons/react';

interface GameControlsProps {
  currentPlayer: Player;
  gameState: 'playing' | 'won' | 'draw';
  winner: Player | null;
  onRestart: () => void;
  aiThinking?: boolean;
  onOpenSettings: () => void;
  opponentType: OpponentType;
  level: number;
}

const GameControls: React.FC<GameControlsProps> = ({
  currentPlayer,
  gameState,
  winner,
  onRestart,
  aiThinking = false,
  onOpenSettings,
  opponentType,
  level
}) => {
  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex flex-col space-y-6">
          {/* Game Status */}
          <div className="flex flex-col space-y-3">
            <h2 className="text-xl font-bold">Game Status</h2>
            <div className="flex items-center space-x-3">
              <span className="text-muted-foreground">Status:</span>
              {gameState === 'playing' && (
                <Badge variant="outline" className="px-3 py-1 bg-accent/10 text-accent">
                  In Progress
                </Badge>
              )}
              {gameState === 'won' && (
                <Badge variant="outline" className="px-3 py-1 bg-primary/20 text-primary">
                  Game Won
                </Badge>
              )}
              {gameState === 'draw' && (
                <Badge variant="outline" className="px-3 py-1 bg-secondary/20 text-secondary">
                  Draw
                </Badge>
              )}
            </div>
          </div>
          
          <Separator />
          
          {/* Current Player */}
          <div className="flex flex-col space-y-4">
            {gameState === 'playing' ? (
              <>
                <h3 className="text-lg font-medium">Current Turn</h3>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{ 
                      background: currentPlayer === 1 
                        ? `var(--player-color-${level-1})` 
                        : `var(--ai-color-${level-1})`
                    }}
                  />
                  <span className="font-medium">
                    {currentPlayer === 1 ? (
                      `You`
                    ) : (
                      <span className="flex items-center">
                        <Robot className="mr-1" /> AI {aiThinking && "(thinking...)"}
                      </span>
                    )}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {aiThinking ? 
                    "AI is making a move..." : 
                    (currentPlayer === 1 ? 
                      "Press space bar to place your marble when hovering over a cell" :
                      "Waiting for AI to move..."
                    )
                  }
                </p>
              </>
            ) : gameState === 'won' ? (
              <>
                <h3 className="text-lg font-medium">Winner</h3>
                <div className="flex items-center space-x-3">
                  <div
                    className="w-5 h-5 rounded-full" 
                    style={{ 
                      background: winner === 1 
                        ? `var(--player-color-${level-1})` 
                        : `var(--ai-color-${level-1})`
                    }}
                  />
                  <span className="font-medium">
                    {winner === 1 ? 
                      `You win!` : 
                      "AI wins!"}
                  </span>
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <h3 className="text-lg font-medium mb-2">Draw</h3>
                <p className="text-sm text-muted-foreground">
                  The game ended in a draw
                </p>
              </div>
            )}
          </div>
          
          <Separator />
          
          {/* Level info */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Brain weight="duotone" size={20} className="text-primary" />
              <span className="font-medium">Level {level}</span>
            </div>
            <Badge variant="outline" className="px-3 py-1">
              Difficulty: {level}/20
            </Badge>
          </div>
          
          <Separator />
          
          {/* How to Play */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-medium">How to Play</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Form a line of marbles to win</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Lines can be horizontal, vertical, or diagonal across any plane</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Rotate the board by dragging with your mouse</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Use mouse wheel to zoom in and out</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Press space bar to place your marble</span>
              </li>
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={onRestart} 
              className="w-full"
            >
              <ArrowCounterClockwise className="mr-2" weight="bold" />
              New Game
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameControls;
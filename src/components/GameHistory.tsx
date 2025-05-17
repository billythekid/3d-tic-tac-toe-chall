import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Position, Player } from '../lib/game-logic';
import { Robot } from '@phosphor-icons/react';

interface Move {
  player: Player;
  position: Position;
  isAI?: boolean;
}

interface GameHistoryProps {
  moves: Move[];
  opponentType?: 'ai';
}

const GameHistory: React.FC<GameHistoryProps> = ({ moves, opponentType = 'ai' }) => {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl">Move History</CardTitle>
      </CardHeader>
      <CardContent>
        {moves.length === 0 ? (
          <p className="text-muted-foreground text-sm">No moves yet</p>
        ) : (
          <ScrollArea className="h-[200px] pr-4">
            <div className="space-y-3">
              {moves.map((move, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-2 rounded-md bg-muted/30"
                >
                  <div className="w-4 h-4 rounded-full mr-3" 
                    style={{
                      background: move.player === 1 
                        ? `var(--player-color-0)` // Default to first color
                        : `var(--ai-color-0)`
                    }}
                  />
                  <div>
                    <span className="font-medium text-sm flex items-center">
                      {move.player === 2 ? (
                        <>
                          <Robot className="mr-1" size={14} /> AI
                        </>
                      ) : (
                        `You`
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Position ({move.position.x}, {move.position.y}, {move.position.z})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default GameHistory;

export default GameHistory;
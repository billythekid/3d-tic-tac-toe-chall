import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, ArrowUp, Brain } from '@phosphor-icons/react';
import { GameSettings } from '../lib/game-logic';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface GameScoreboardProps {
  settings: GameSettings;
  userName: string;
  userAvatar: string | null;
}

const GameScoreboard: React.FC<GameScoreboardProps> = ({
  settings,
  userName,
  userAvatar
}) => {
  const { currentLevel, playerScore } = settings;
  const nextLevelTarget = currentLevel * 3; // Simple progression system
  const progress = Math.min(100, Math.round((playerScore / nextLevelTarget) * 100));

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="text-accent" />
          Scoreboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player Info */}
        <div className="flex items-center space-x-3">
          <Avatar>
            {userAvatar ? (
              <AvatarImage src={userAvatar} alt={userName} />
            ) : (
              <AvatarFallback className="bg-primary/20 text-primary">{userName.charAt(0).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <p className="font-medium">{userName}</p>
            <p className="text-sm text-muted-foreground">Score: {playerScore}</p>
          </div>
        </div>

        {/* Current Level */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <Brain className="text-primary mr-1" size={16} />
              <span className="text-sm font-medium">Level {currentLevel}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              AI Difficulty: {settings.aiDifficulty}/20
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-1 text-xs text-muted-foreground">
            <span>Current</span>
            <div className="flex items-center">
              <ArrowUp size={10} className="mr-1" />
              <span>Level {currentLevel + 1} at {nextLevelTarget} pts</span>
            </div>
          </div>
        </div>

        {/* Marble Color Display */}
        <div className="pt-2 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-2`}
                style={{ background: `var(--player-color-${currentLevel - 1})` }}
              />
              <span className="text-xs">Your Marble</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs">AI Marble</span>
              <div
                className={`w-3 h-3 rounded-full ml-2`}
                style={{ background: `var(--ai-color-${currentLevel - 1})` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameScoreboard;
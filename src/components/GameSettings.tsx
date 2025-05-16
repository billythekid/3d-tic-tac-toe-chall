import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { GameSettings, DEFAULT_SETTINGS } from '../lib/game-logic';
import { Gear, Robot, Swap } from '@phosphor-icons/react';

interface GameSettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onApplySettings: () => void;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const GameSettingsMenu: React.FC<GameSettingsProps> = ({
  settings,
  onSettingsChange,
  onApplySettings,
  isOpen,
  onOpenChange,
}) => {
  // Handle settings changes
  const handleOpponentTypeChange = (value: string) => {
    onSettingsChange({
      ...settings,
      opponentType: value as 'human' | 'ai'
    });
  };

  const handleBoardSizeChange = (value: string) => {
    onSettingsChange({
      ...settings,
      boardSize: parseInt(value)
    });
  };

  const handleDifficultyChange = (value: number[]) => {
    onSettingsChange({
      ...settings,
      aiDifficulty: value[0]
    });
  };

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        className="flex items-center gap-2" 
        onClick={() => onOpenChange(true)}
      >
        <Gear size={18} />
        <span>Settings</span>
      </Button>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Gear className="text-accent" />
          Game Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Board Size */}
          <div className="space-y-2">
            <Label htmlFor="board-size" className="text-md font-medium">Board Size</Label>
            <Select 
              value={settings.boardSize.toString()} 
              onValueChange={handleBoardSizeChange}
            >
              <SelectTrigger id="board-size" className="w-full">
                <SelectValue placeholder="Select board size" />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8].map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}x{size}x{size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose the size of the 3D grid
            </p>
          </div>
          
          <Separator />
          
          {/* Opponent Type */}
          <div className="space-y-2">
            <Label className="text-md font-medium">Opponent Type</Label>
            <div className="grid grid-cols-2 gap-4 py-2">
              <Button
                variant={settings.opponentType === 'human' ? 'default' : 'outline'}
                className="w-full flex gap-2"
                onClick={() => handleOpponentTypeChange('human')}
              >
                <Swap weight="bold" />
                Human
              </Button>
              <Button
                variant={settings.opponentType === 'ai' ? 'default' : 'outline'}
                className="w-full flex gap-2"
                onClick={() => handleOpponentTypeChange('ai')}
              >
                <Robot weight="bold" />
                AI
              </Button>
            </div>
          </div>
          
          {/* AI Difficulty (only shown if AI opponent is selected) */}
          {settings.opponentType === 'ai' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="ai-difficulty" className="text-md font-medium">AI Difficulty</Label>
                <span className="text-sm font-medium bg-muted px-2 py-1 rounded">
                  {settings.aiDifficulty}
                </span>
              </div>
              <Slider 
                id="ai-difficulty"
                min={1}
                max={50}
                step={1}
                value={[settings.aiDifficulty]}
                onValueChange={handleDifficultyChange}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Random</span>
                <span>Perfect</span>
              </div>
            </div>
          )}
          
          <div className="pt-4 flex space-x-3">
            <Button 
              className="flex-1" 
              variant="default"
              onClick={() => {
                onApplySettings();
                onOpenChange(false);
              }}
            >
              Apply Settings
            </Button>
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full text-xs" 
            onClick={() => onSettingsChange(DEFAULT_SETTINGS)}
          >
            Reset to Defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameSettingsMenu;
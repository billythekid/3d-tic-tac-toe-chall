import React from 'react';
import { Cube } from '@phosphor-icons/react';

const GameHeader: React.FC = () => {
  return (
    <header className="w-full flex flex-col items-center justify-center text-center mb-6">
      <div className="flex items-center mb-2">
        <Cube size={32} weight="duotone" className="text-accent mr-2" />
        <h1 className="text-3xl font-bold tracking-tighter">
          3D Tic-Tac-Toe
        </h1>
      </div>
      <p className="text-muted-foreground max-w-md">
        A three-dimensional twist on the classic game. Connect three marbles in a row to win!
      </p>
    </header>
  );
};

export default GameHeader;
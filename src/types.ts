// Core data structures for Snake Arena

export interface Position {
  x: number;
  y: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT'
}

export interface Grid {
  width: number;
  height: number;
  isValidPosition(pos: Position): boolean;
  isEmpty(pos: Position, occupiedCells: Position[]): boolean;
}

export type GameStatus = 'waiting' | 'playing' | 'paused' | 'gameOver';
export type Winner = 'player' | 'ai' | 'tie' | null;
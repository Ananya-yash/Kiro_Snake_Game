import { Position, Grid } from './types.js';

export class GameGrid implements Grid {
  public readonly width: number;
  public readonly height: number;

  constructor(width: number = 20, height: number = 20) {
    this.width = width;
    this.height = height;
  }

  /**
   * Check if a position is within the grid boundaries
   */
  isValidPosition(pos: Position): boolean {
    return pos.x >= 0 && pos.x < this.width && 
           pos.y >= 0 && pos.y < this.height;
  }

  /**
   * Check if a position is empty (not occupied by any game entity)
   */
  isEmpty(pos: Position, occupiedCells: Position[] = []): boolean {
    if (!this.isValidPosition(pos)) {
      return false;
    }
    
    return !occupiedCells.some(cell => 
      cell.x === pos.x && cell.y === pos.y
    );
  }

  /**
   * Get all empty positions on the grid
   */
  getEmptyPositions(occupiedCells: Position[]): Position[] {
    const empty: Position[] = [];
    
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const pos = { x, y };
        if (this.isEmpty(pos, occupiedCells)) {
          empty.push(pos);
        }
      }
    }
    
    return empty;
  }

  /**
   * Get a random empty position on the grid
   */
  getRandomEmptyPosition(occupiedCells: Position[]): Position | null {
    const emptyPositions = this.getEmptyPositions(occupiedCells);
    
    if (emptyPositions.length === 0) {
      return null; // Grid is full
    }
    
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    return emptyPositions[randomIndex];
  }
}
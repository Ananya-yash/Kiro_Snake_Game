import { Position, Direction } from './types.js';
import { CONFIG } from './config.js';

export class Snake {
  public body: Position[];
  public direction: Direction;
  public color: string;
  public isAlive: boolean;
  private pendingGrowth: number;

  constructor(
    startPosition: Position, 
    initialDirection: Direction, 
    color: string,
    initialLength: number = CONFIG.INITIAL_SNAKE_LENGTH
  ) {
    this.direction = initialDirection;
    this.color = color;
    this.isAlive = true;
    this.pendingGrowth = 0;
    
    // Initialize snake body based on direction
    this.body = this.createInitialBody(startPosition, initialDirection, initialLength);
  }

  /**
   * Create initial snake body segments
   */
  private createInitialBody(start: Position, dir: Direction, length: number): Position[] {
    const body: Position[] = [start];
    
    // Add segments behind the head based on direction
    for (let i = 1; i < length; i++) {
      const prevSegment = body[i - 1];
      let nextSegment: Position;
      
      switch (dir) {
        case Direction.UP:
          nextSegment = { x: prevSegment.x, y: prevSegment.y + 1 };
          break;
        case Direction.DOWN:
          nextSegment = { x: prevSegment.x, y: prevSegment.y - 1 };
          break;
        case Direction.LEFT:
          nextSegment = { x: prevSegment.x + 1, y: prevSegment.y };
          break;
        case Direction.RIGHT:
          nextSegment = { x: prevSegment.x - 1, y: prevSegment.y };
          break;
      }
      
      body.push(nextSegment);
    }
    
    return body;
  }

  /**
   * Get the head position of the snake
   */
  getHead(): Position {
    return this.body[0];
  }

  /**
   * Get the tail position of the snake
   */
  getTail(): Position {
    return this.body[this.body.length - 1];
  }

  /**
   * Check if the snake contains a specific position
   */
  contains(pos: Position): boolean {
    return this.body.some(segment => 
      segment.x === pos.x && segment.y === pos.y
    );
  }

  /**
   * Get the next head position based on current direction (with wrap-around)
   */
  getNextHeadPosition(): Position {
    const head = this.getHead();
    let nextPos: Position;
    
    switch (this.direction) {
      case Direction.UP:
        nextPos = { x: head.x, y: head.y - 1 };
        break;
      case Direction.DOWN:
        nextPos = { x: head.x, y: head.y + 1 };
        break;
      case Direction.LEFT:
        nextPos = { x: head.x - 1, y: head.y };
        break;
      case Direction.RIGHT:
        nextPos = { x: head.x + 1, y: head.y };
        break;
    }
    
    // Apply wrap-around logic
    return this.wrapPosition(nextPos);
  }

  /**
   * Wrap position around grid boundaries
   */
  private wrapPosition(pos: Position): Position {
    const gridSize = CONFIG.GRID_SIZE;
    
    return {
      x: ((pos.x % gridSize) + gridSize) % gridSize,
      y: ((pos.y % gridSize) + gridSize) % gridSize
    };
  }

  /**
   * Move the snake one step in its current direction
   */
  move(): void {
    if (!this.isAlive) return;

    const newHead = this.getNextHeadPosition();
    this.body.unshift(newHead);

    // Handle growth
    if (this.pendingGrowth > 0) {
      this.pendingGrowth--;
    } else {
      // Remove tail if not growing
      this.body.pop();
    }
  }

  /**
   * Mark the snake to grow by one segment on next move
   */
  grow(): void {
    this.pendingGrowth++;
  }

  /**
   * Change the snake's direction (with validation to prevent immediate reversal)
   */
  changeDirection(newDirection: Direction): boolean {
    // Prevent immediate reversal (180-degree turn)
    const opposites = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT
    };

    if (opposites[this.direction] === newDirection) {
      return false; // Invalid direction change
    }

    this.direction = newDirection;
    return true;
  }

  /**
   * Kill the snake (stop movement and mark as dead)
   */
  kill(): void {
    this.isAlive = false;
  }

  /**
   * Get the current length of the snake
   */
  getLength(): number {
    return this.body.length;
  }

  /**
   * Reset the snake to initial state
   */
  reset(startPosition: Position, initialDirection: Direction): void {
    this.body = this.createInitialBody(startPosition, initialDirection, CONFIG.INITIAL_SNAKE_LENGTH);
    this.direction = initialDirection;
    this.isAlive = true;
    this.pendingGrowth = 0;
  }
}
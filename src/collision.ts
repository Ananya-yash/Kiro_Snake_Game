import { Position, Grid } from './types.js';
import { Snake } from './snake.js';

export interface CollisionResult {
  hasCollision: boolean;
  type: 'wall' | 'self' | 'other' | 'clash' | 'none';
  winner?: 'player' | 'ai' | 'tie';
  position?: Position;
}

export class CollisionDetector {
  private grid: Grid;

  constructor(grid: Grid) {
    this.grid = grid;
  }

  /**
   * Check for all types of collisions for a snake (with Apex Predator logic)
   */
  checkCollision(snake: Snake, otherSnake?: Snake): CollisionResult {
    const nextHeadPos = snake.getNextHeadPosition();

    // Check self collision first
    const selfCollision = this.checkSelfCollision(snake, nextHeadPos);
    if (selfCollision.hasCollision) {
      return selfCollision;
    }

    // Check for Apex Predator clash with other snake
    if (otherSnake) {
      const clashResult = this.checkApexPredatorClash(snake, otherSnake);
      if (clashResult.hasCollision) {
        return clashResult;
      }
    }

    return { hasCollision: false, type: 'none' };
  }

  /**
   * Check for Apex Predator clash between two snakes
   */
  checkApexPredatorClash(snake1: Snake, snake2: Snake): CollisionResult {
    const snake1NextHead = snake1.getNextHeadPosition();
    const snake2NextHead = snake2.getNextHeadPosition();

    // Check if snake1's next head position collides with snake2's body or head
    const snake1HitsSnake2 = snake2.contains(snake1NextHead) || 
                            (snake1NextHead.x === snake2NextHead.x && snake1NextHead.y === snake2NextHead.y);
    
    // Check if snake2's next head position collides with snake1's body or head
    const snake2HitsSnake1 = snake1.contains(snake2NextHead) || 
                            (snake1NextHead.x === snake2NextHead.x && snake1NextHead.y === snake2NextHead.y);

    // If no collision, return no clash
    if (!snake1HitsSnake2 && !snake2HitsSnake1) {
      return { hasCollision: false, type: 'none' };
    }

    // Determine winner based on length (Apex Predator logic)
    const snake1Length = snake1.body.length;
    const snake2Length = snake2.body.length;

    let winner: 'player' | 'ai' | 'tie';
    
    if (snake1Length > snake2Length) {
      // Snake1 is longer, snake1 wins
      winner = snake1.color === '#00ff00' ? 'player' : 'ai';
    } else if (snake2Length > snake1Length) {
      // Snake2 is longer, snake2 wins
      winner = snake2.color === '#00ff00' ? 'player' : 'ai';
    } else {
      // Equal length, tie
      winner = 'tie';
    }

    return {
      hasCollision: true,
      type: 'clash',
      winner: winner,
      position: snake1HitsSnake2 ? snake1NextHead : snake2NextHead
    };
  }

  /**
   * Check if position is outside grid boundaries
   */
  checkWallCollision(position: Position): CollisionResult {
    const isOutOfBounds = !this.grid.isValidPosition(position);
    
    return {
      hasCollision: isOutOfBounds,
      type: isOutOfBounds ? 'wall' : 'none',
      position: isOutOfBounds ? position : undefined
    };
  }

  /**
   * Check if snake would collide with its own body
   */
  checkSelfCollision(snake: Snake, nextHeadPos: Position): CollisionResult {
    // Check if next head position intersects with current body
    // (excluding the tail, which will move away)
    const bodyToCheck = snake.body.slice(0, -1); // Exclude tail
    const wouldCollide = bodyToCheck.some(segment =>
      segment.x === nextHeadPos.x && segment.y === nextHeadPos.y
    );

    return {
      hasCollision: wouldCollide,
      type: wouldCollide ? 'self' : 'none',
      position: wouldCollide ? nextHeadPos : undefined
    };
  }

  /**
   * Check if position collides with another snake
   */
  checkOtherSnakeCollision(position: Position, otherSnake: Snake): CollisionResult {
    const wouldCollide = otherSnake.contains(position);

    return {
      hasCollision: wouldCollide,
      type: wouldCollide ? 'other' : 'none',
      position: wouldCollide ? position : undefined
    };
  }

  /**
   * Check if two snakes will collide head-to-head
   */
  checkHeadToHeadCollision(snake1: Snake, snake2: Snake): CollisionResult {
    const snake1NextHead = snake1.getNextHeadPosition();
    const snake2NextHead = snake2.getNextHeadPosition();

    const wouldCollide = snake1NextHead.x === snake2NextHead.x && 
                        snake1NextHead.y === snake2NextHead.y;

    return {
      hasCollision: wouldCollide,
      type: wouldCollide ? 'other' : 'none',
      position: wouldCollide ? snake1NextHead : undefined
    };
  }

  /**
   * Check if a position would be safe for movement (no collisions with wrap-around)
   */
  isSafePosition(position: Position, snake: Snake, otherSnake?: Snake): boolean {
    // With wrap-around, all positions are valid within grid bounds
    // We still need to wrap the position to check properly
    const wrappedPos = this.wrapPosition(position);
    
    // Check self collision (exclude tail which will move)
    const bodyToCheck = snake.body.slice(0, -1);
    if (bodyToCheck.some(segment => segment.x === wrappedPos.x && segment.y === wrappedPos.y)) {
      return false;
    }

    // Check other snake collision
    if (otherSnake && otherSnake.contains(wrappedPos)) {
      return false;
    }

    return true;
  }

  /**
   * Wrap position around grid boundaries
   */
  private wrapPosition(pos: Position): Position {
    return {
      x: ((pos.x % this.grid.width) + this.grid.width) % this.grid.width,
      y: ((pos.y % this.grid.height) + this.grid.height) % this.grid.height
    };
  }

  /**
   * Get all positions that would be obstacles for pathfinding (Length-Aware)
   */
  getObstacles(playerSnake: Snake, aiSnake: Snake, huntingMode: boolean = false): Position[] {
    const obstacles: Position[] = [];

    if (huntingMode) {
      // In hunting mode, only treat own body as obstacle, target the player
      obstacles.push(...aiSnake.body.slice(0, -1)); // Exclude tail
    } else {
      // In evasive mode, treat both snake bodies as obstacles
      obstacles.push(...playerSnake.body);
      obstacles.push(...aiSnake.body);
    }

    return obstacles;
  }

  /**
   * Determine if AI should be in hunting mode based on length advantage
   */
  shouldAIHunt(aiSnake: Snake, playerSnake: Snake): boolean {
    return aiSnake.body.length > playerSnake.body.length + 2;
  }

  /**
   * Get the dominant snake (longer one) for visual effects
   */
  getDominantSnake(playerSnake: Snake, aiSnake: Snake): 'player' | 'ai' | 'tie' {
    if (playerSnake.body.length > aiSnake.body.length) {
      return 'player';
    } else if (aiSnake.body.length > playerSnake.body.length) {
      return 'ai';
    } else {
      return 'tie';
    }
  }
}
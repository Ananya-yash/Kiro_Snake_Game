import { Position, Direction } from './types.js';
import { Snake } from './snake.js';
import { BFSPathfinder } from './pathfinder.js';
import { GameGrid } from './grid.js';

export class AIController {
  private pathfinder: BFSPathfinder;
  private snake: Snake;
  private grid: GameGrid;
  private lastDirection: Direction;
  private stuckCounter: number = 0;
  private maxStuckTicks: number = 5;

  constructor(snake: Snake, grid: GameGrid) {
    this.snake = snake;
    this.grid = grid;
    this.pathfinder = new BFSPathfinder(grid);
    this.lastDirection = snake.direction;
  }

  /**
   * Update AI logic with Apex Predator length-aware behavior
   */
  update(foodPositions: Position[], playerSnake: Snake, shouldMakeRandomMove: boolean = false): void {
    if (!this.snake.isAlive) {
      return;
    }

    // Determine AI behavior mode based on length comparison
    const aiLength = this.snake.body.length;
    const playerLength = playerSnake.body.length;
    const huntingMode = aiLength > playerLength + 2;
    
    // Get obstacles based on behavior mode
    const obstacles = this.getObstaclesLengthAware(playerSnake, huntingMode);
    
    // Check if we should make a random move (beginner mode)
    if (shouldMakeRandomMove) {
      this.makeRandomMove(obstacles);
      return;
    }
    
    if (huntingMode) {
      // Aggressive hunting mode - target the player
      this.huntPlayer(playerSnake, obstacles);
    } else {
      // Evasive mode - avoid player and seek food
      this.evasiveBehavior(foodPositions, obstacles);
    }
  }

  /**
   * Hunting mode: AI aggressively targets the player snake
   */
  private huntPlayer(playerSnake: Snake, obstacles: Position[]): void {
    const playerHead = playerSnake.getHead();
    const aiHead = this.snake.getHead();
    
    // Try to intercept player head
    const direction = this.pathfinder.findNextDirection(aiHead, playerHead, obstacles);
    
    if (direction) {
      this.moveInDirection(direction);
      this.stuckCounter = 0;
    } else {
      // Can't reach player directly, use survival behavior
      this.survivalBehavior(obstacles);
    }
  }

  /**
   * Evasive mode: AI avoids player and seeks food defensively
   */
  private evasiveBehavior(foodPositions: Position[], obstacles: Position[]): void {
    // Find the best target food while avoiding player
    const targetFood = this.selectTarget(foodPositions, obstacles);
    
    if (targetFood) {
      // Try to move towards the target
      const direction = this.pathfinder.findNextDirection(
        this.snake.getHead(),
        targetFood,
        obstacles
      );
      
      if (direction) {
        this.moveInDirection(direction);
        this.stuckCounter = 0;
      } else {
        // No path to target, use fallback behavior
        this.handleNoPath(obstacles);
      }
    } else {
      // No food available, use survival behavior
      this.survivalBehavior(obstacles);
    }
  }

  /**
   * Get obstacles based on AI behavior mode (Length-Aware)
   */
  private getObstaclesLengthAware(playerSnake: Snake, huntingMode: boolean): Position[] {
    const obstacles: Position[] = [];
    
    if (huntingMode) {
      // In hunting mode, only avoid own body, treat player as target
      obstacles.push(...this.snake.body.slice(0, -1));
    } else {
      // In evasive mode, avoid both snakes
      obstacles.push(...playerSnake.body.slice(0, -1));
      obstacles.push(...this.snake.body.slice(0, -1));
    }
    
    return obstacles;
  }

  /**
   * Select the best target food based on accessibility and distance
   */
  private selectTarget(foodPositions: Position[], obstacles: Position[]): Position | null {
    if (foodPositions.length === 0) {
      return null;
    }

    const head = this.snake.getHead();
    let bestTarget: Position | null = null;
    let bestScore = -1;

    for (const food of foodPositions) {
      // Check if food is accessible
      const path = this.pathfinder.findPath(head, food, obstacles);
      
      if (path) {
        // Score based on path length (shorter is better)
        // Also consider safety (prefer paths that don't lead to dead ends)
        const pathLength = path.length;
        const safetyScore = this.evaluateSafety(food, obstacles);
        
        // Combined score: prioritize shorter paths but also consider safety
        const score = (1000 / pathLength) + safetyScore;
        
        if (score > bestScore) {
          bestScore = score;
          bestTarget = food;
        }
      }
    }

    return bestTarget;
  }

  /**
   * Evaluate how safe a position is (how many escape routes it has)
   */
  private evaluateSafety(position: Position, obstacles: Position[]): number {
    const safeNeighbors = this.pathfinder.getSafeNeighbors(position, obstacles);
    return safeNeighbors.length * 10; // Bonus points for having escape routes
  }

  /**
   * Handle situation when no path to target exists
   */
  private handleNoPath(obstacles: Position[]): void {
    this.stuckCounter++;
    
    if (this.stuckCounter > this.maxStuckTicks) {
      // Try a different approach - find any safe move
      this.survivalBehavior(obstacles);
    } else {
      // Try to continue in current direction if safe
      const nextPos = this.getNextPosition(this.snake.direction);
      if (this.isSafeMove(nextPos, obstacles)) {
        this.moveInDirection(this.snake.direction);
      } else {
        this.survivalBehavior(obstacles);
      }
    }
  }

  /**
   * Survival behavior when no clear path to food exists
   */
  private survivalBehavior(obstacles: Position[]): void {
    const head = this.snake.getHead();
    const possibleDirections = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    
    // Filter out directions that would cause immediate collision
    const safeDirections = possibleDirections.filter(dir => {
      const nextPos = this.getNextPosition(dir);
      return this.isSafeMove(nextPos, obstacles) && this.isValidDirectionChange(dir);
    });

    if (safeDirections.length === 0) {
      // No safe moves - continue current direction (might be game over)
      return;
    }

    // Prioritize directions that lead to more open space
    let bestDirection = safeDirections[0];
    let bestSpaceScore = -1;

    for (const direction of safeDirections) {
      const nextPos = this.getNextPosition(direction);
      const spaceScore = this.evaluateOpenSpace(nextPos, obstacles);
      
      if (spaceScore > bestSpaceScore) {
        bestSpaceScore = spaceScore;
        bestDirection = direction;
      }
    }

    this.moveInDirection(bestDirection);
  }

  /**
   * Evaluate how much open space is available from a position (with wrap-around)
   */
  private evaluateOpenSpace(position: Position, obstacles: Position[]): number {
    let openSpaceCount = 0;
    const visited = new Set<string>();
    const queue: Position[] = [this.wrapPosition(position)];
    const maxDepth = 5; // Look ahead 5 steps
    
    visited.add(`${queue[0].x},${queue[0].y}`);

    for (let depth = 0; depth < maxDepth && queue.length > 0; depth++) {
      const currentLevelSize = queue.length;
      
      for (let i = 0; i < currentLevelSize; i++) {
        const current = queue.shift()!;
        openSpaceCount++;
        
        // Add neighbors to queue
        const neighbors = [
          { x: current.x, y: current.y - 1 },
          { x: current.x, y: current.y + 1 },
          { x: current.x - 1, y: current.y },
          { x: current.x + 1, y: current.y }
        ].map(neighbor => this.wrapPosition(neighbor));
        
        for (const neighbor of neighbors) {
          const key = `${neighbor.x},${neighbor.y}`;
          
          if (!visited.has(key) && !this.isObstacle(neighbor, obstacles)) {
            visited.add(key);
            queue.push(neighbor);
          }
        }
      }
    }

    return openSpaceCount;
  }

  /**
   * Check if a move to a position is safe (with wrap-around)
   */
  private isSafeMove(position: Position, obstacles: Position[]): boolean {
    // With wrap-around, all positions are within bounds after wrapping
    const wrappedPos = this.wrapPosition(position);
    return !this.isObstacle(wrappedPos, obstacles);
  }

  /**
   * Check if a position is an obstacle
   */
  private isObstacle(position: Position, obstacles: Position[]): boolean {
    return obstacles.some(obstacle => 
      obstacle.x === position.x && obstacle.y === position.y
    );
  }

  /**
   * Get the next position based on a direction (with wrap-around)
   */
  private getNextPosition(direction: Direction): Position {
    const head = this.snake.getHead();
    let nextPos: Position;
    
    switch (direction) {
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
    const gridSize = this.grid.width;
    
    return {
      x: ((pos.x % gridSize) + gridSize) % gridSize,
      y: ((pos.y % gridSize) + gridSize) % gridSize
    };
  }

  /**
   * Check if direction change is valid (no 180-degree turns)
   */
  private isValidDirectionChange(newDirection: Direction): boolean {
    const opposites = {
      [Direction.UP]: Direction.DOWN,
      [Direction.DOWN]: Direction.UP,
      [Direction.LEFT]: Direction.RIGHT,
      [Direction.RIGHT]: Direction.LEFT
    };

    return opposites[this.snake.direction] !== newDirection;
  }

  /**
   * Move the snake in a specific direction
   */
  private moveInDirection(direction: Direction): void {
    if (this.snake.changeDirection(direction)) {
      this.lastDirection = direction;
    }
  }

  /**
   * Get all obstacles (both snakes' bodies)
   */
  private getObstacles(playerSnake: Snake): Position[] {
    const obstacles: Position[] = [];
    
    // Add player snake body (excluding tail which will move)
    obstacles.push(...playerSnake.body.slice(0, -1));
    
    // Add AI snake body (excluding tail which will move)
    obstacles.push(...this.snake.body.slice(0, -1));
    
    return obstacles;
  }

  /**
   * Reset AI state
   */
  reset(): void {
    this.stuckCounter = 0;
    this.lastDirection = this.snake.direction;
  }

  /**
   * Make a random safe move (for beginner difficulty)
   */
  private makeRandomMove(obstacles: Position[]): void {
    const possibleDirections = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
    
    // Filter out directions that would cause immediate collision
    const safeDirections = possibleDirections.filter(dir => {
      const nextPos = this.getNextPosition(dir);
      return this.isSafeMove(nextPos, obstacles) && this.isValidDirectionChange(dir);
    });

    if (safeDirections.length === 0) {
      // No safe moves - fall back to survival behavior
      this.survivalBehavior(obstacles);
      return;
    }

    // Pick a random safe direction
    const randomIndex = Math.floor(Math.random() * safeDirections.length);
    const randomDirection = safeDirections[randomIndex];
    
    this.moveInDirection(randomDirection);
  }

  /**
   * Get current target for debugging
   */
  getCurrentTarget(foodPositions: Position[], playerSnake: Snake): Position | null {
    const obstacles = this.getObstacles(playerSnake);
    return this.selectTarget(foodPositions, obstacles);
  }
}
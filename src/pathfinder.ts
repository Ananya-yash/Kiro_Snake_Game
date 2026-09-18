import { Position, Direction } from './types.js';
import { GameGrid } from './grid.js';
import { Snake } from './snake.js'; // adjust the import path as necessary
export interface PathNode {
  position: Position;
  parent: PathNode | null;
  distance: number;
}

export class BFSPathfinder {
  private grid: GameGrid;

  constructor(grid: GameGrid) {
    this.grid = grid;
  }

  /**
   * Find the shortest path from start to goal using BFS (with wrap-around)
   * Returns array of positions representing the path, or null if no path exists
   */
  findPath(start: Position, goal: Position, obstacles: Position[]): Position[] | null {
    // Apply wrap-around to start and goal positions
    const wrappedStart = this.wrapPosition(start);
    const wrappedGoal = this.wrapPosition(goal);

    // If goal is an obstacle, no path possible
    if (this.isObstacle(wrappedGoal, obstacles)) {
      return null;
    }

    // If start and goal are the same
    if (wrappedStart.x === wrappedGoal.x && wrappedStart.y === wrappedGoal.y) {
      return [wrappedStart];
    }

    // BFS setup
    const queue: PathNode[] = [];
    const visited = new Set<string>();
    
    // Start node
    const startNode: PathNode = {
      position: wrappedStart,
      parent: null,
      distance: 0
    };
    
    queue.push(startNode);
    visited.add(this.positionToKey(wrappedStart));

    // BFS main loop
    while (queue.length > 0) {
      const currentNode = queue.shift()!;
      
      // Check if we reached the goal
      if (currentNode.position.x === wrappedGoal.x && currentNode.position.y === wrappedGoal.y) {
        return this.reconstructPath(currentNode);
      }

      // Explore neighbors
      const neighbors = this.getNeighbors(currentNode.position);
      
      for (const neighborPos of neighbors) {
        const key = this.positionToKey(neighborPos);
        
        // Skip if already visited
        if (visited.has(key)) {
          continue;
        }
        
        // Skip if it's an obstacle
        if (this.isObstacle(neighborPos, obstacles)) {
          continue;
        }
        
        // Add to queue (no need to check bounds with wrap-around)
        const neighborNode: PathNode = {
          position: neighborPos,
          parent: currentNode,
          distance: currentNode.distance + 1
        };
        
        queue.push(neighborNode);
        visited.add(key);
      }
    }

    // No path found
    return null;
  }

  /**
   * Find the next direction to move towards the goal
   */
  findNextDirection(start: Position, goal: Position, obstacles: Position[]): Direction | null {
    const path = this.findPath(start, goal, obstacles);
    
    if (!path || path.length < 2) {
      return null;
    }
    
    // Get the next position in the path
    const nextPos = path[1];
    
    // Convert position difference to direction
    const dx = nextPos.x - start.x;
    const dy = nextPos.y - start.y;
    
    if (dx === 1) return Direction.RIGHT;
    if (dx === -1) return Direction.LEFT;
    if (dy === 1) return Direction.DOWN;
    if (dy === -1) return Direction.UP;
    
    return null;
  }

  /**
   * Get all valid neighboring positions (with wrap-around)
   */
  private getNeighbors(pos: Position): Position[] {
    const neighbors = [
      { x: pos.x, y: pos.y - 1 }, // UP
      { x: pos.x, y: pos.y + 1 }, // DOWN
      { x: pos.x - 1, y: pos.y }, // LEFT
      { x: pos.x + 1, y: pos.y }  // RIGHT
    ];
    
    // Apply wrap-around to all neighbors
    return neighbors.map(neighbor => this.wrapPosition(neighbor));
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
   * Check if a position is an obstacle
   */
  private isObstacle(pos: Position, obstacles: Position[]): boolean {
    return obstacles.some(obstacle => 
      obstacle.x === pos.x && obstacle.y === pos.y
    );
  }

  /**
   * Convert position to string key for Set operations
   */
  private positionToKey(pos: Position): string {
    return `${pos.x},${pos.y}`;
  }

  /**
   * Reconstruct the path from goal back to start
   */
  private reconstructPath(goalNode: PathNode): Position[] {
    const path: Position[] = [];
    let currentNode: PathNode | null = goalNode;
    
    while (currentNode !== null) {
      path.unshift(currentNode.position);
      currentNode = currentNode.parent;
    }
    
    return path;
  }

  /**
   * Calculate Manhattan distance between two positions
   */
  calculateDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  /**
   * Find the closest target from a list of targets
   */
  findClosestTarget(start: Position, targets: Position[], obstacles: Position[]): Position | null {
    if (targets.length === 0) {
      return null;
    }

    let closestTarget: Position | null = null;
    let shortestDistance = Infinity;

    for (const target of targets) {
      const path = this.findPath(start, target, obstacles);
      
      if (path && path.length < shortestDistance) {
        shortestDistance = path.length;
        closestTarget = target;
      }
    }

    return closestTarget;
  }

  /**
   * Check if a path exists between two positions
   */
  hasPath(start: Position, goal: Position, obstacles: Position[]): boolean {
    return this.findPath(start, goal, obstacles) !== null;
  }

  /**
   * Get safe positions around a given position (not obstacles, with wrap-around)
   */
  getSafeNeighbors(pos: Position, obstacles: Position[]): Position[] {
    const neighbors = this.getNeighbors(pos);
    
    return neighbors.filter(neighbor => 
      !this.isObstacle(neighbor, obstacles)
    );
  }

  /**
   * Find the shortest path with length-aware AI behavior
   * In hunting mode: treats player as target, in evasive mode: treats player as obstacle
   */
  findPathLengthAware(
    start: Position, 
    goal: Position, 
    obstacles: Position[], 
    huntingMode: boolean = false,
    playerSnake?: Snake
  ): Position[] | null {
    if (huntingMode && playerSnake) {
      // In hunting mode, try to intercept player snake head
      const playerHead = playerSnake.getHead();
      return this.findPath(start, playerHead, obstacles);
    } else {
      // In evasive mode, use normal pathfinding to food while avoiding player
      return this.findPath(start, goal, obstacles);
    }
  }

  /**
   * Find next direction with hunting/evasive behavior
   */
  findNextDirectionLengthAware(
    start: Position, 
    goal: Position, 
    obstacles: Position[], 
    huntingMode: boolean = false,
    playerSnake?: Snake
  ): Direction | null {
    if (huntingMode && playerSnake) {
      // In hunting mode, target player head
      const playerHead = playerSnake.getHead();
      return this.findNextDirection(start, playerHead, obstacles);
    } else {
      // In evasive mode, normal pathfinding
      return this.findNextDirection(start, goal, obstacles);
    }
  }
}
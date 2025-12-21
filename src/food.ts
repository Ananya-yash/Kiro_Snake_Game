import { Position } from './types.js';
import { GameGrid } from './grid.js';

export class Food {
  public position: Position;
  public value: number;

  constructor(position: Position, value: number = 1) {
    this.position = position;
    this.value = value;
  }

  /**
   * Move food to a new position
   */
  moveTo(newPosition: Position): void {
    this.position = newPosition;
  }
}

export class FoodManager {
  private grid: GameGrid;
  private foods: Food[];

  constructor(grid: GameGrid) {
    this.grid = grid;
    this.foods = [];
  }

  /**
   * Spawn initial food items
   */
  initialize(occupiedCells: Position[]): void {
    this.foods = [];
    this.spawnFood(occupiedCells);
  }

  /**
   * Spawn a new food item in a random empty location
   */
  spawnFood(occupiedCells: Position[]): boolean {
    const allOccupied = [...occupiedCells, ...this.foods.map(f => f.position)];
    const emptyPosition = this.grid.getRandomEmptyPosition(allOccupied);
    
    if (!emptyPosition) {
      // Grid is full - handle gracefully
      return false;
    }

    const newFood = new Food(emptyPosition);
    this.foods.push(newFood);
    return true;
  }

  /**
   * Check if a position contains food and remove it if found
   */
  consumeFood(position: Position): Food | null {
    const foodIndex = this.foods.findIndex(food =>
      food.position.x === position.x && food.position.y === position.y
    );

    if (foodIndex !== -1) {
      const consumedFood = this.foods[foodIndex];
      this.foods.splice(foodIndex, 1);
      return consumedFood;
    }

    return null;
  }

  /**
   * Get all current food positions
   */
  getAllFoods(): Food[] {
    return [...this.foods];
  }

  /**
   * Get all food positions as Position array
   */
  getFoodPositions(): Position[] {
    return this.foods.map(food => food.position);
  }

  /**
   * Check if a position contains food
   */
  hasFood(position: Position): boolean {
    return this.foods.some(food =>
      food.position.x === position.x && food.position.y === position.y
    );
  }

  /**
   * Get the closest food to a given position
   */
  getClosestFood(position: Position): Food | null {
    if (this.foods.length === 0) {
      return null;
    }

    let closestFood = this.foods[0];
    let minDistance = this.calculateDistance(position, closestFood.position);

    for (let i = 1; i < this.foods.length; i++) {
      const distance = this.calculateDistance(position, this.foods[i].position);
      if (distance < minDistance) {
        minDistance = distance;
        closestFood = this.foods[i];
      }
    }

    return closestFood;
  }

  /**
   * Calculate Manhattan distance between two positions
   */
  private calculateDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }

  /**
   * Remove all food items
   */
  clear(): void {
    this.foods = [];
  }

  /**
   * Get the number of food items currently on the grid
   */
  getFoodCount(): number {
    return this.foods.length;
  }

  /**
   * Ensure there's always at least one food item on the grid
   */
  maintainMinimumFood(occupiedCells: Position[], minCount: number = 1): void {
    while (this.foods.length < minCount) {
      const success = this.spawnFood(occupiedCells);
      if (!success) {
        // Can't spawn more food - grid might be full
        break;
      }
    }
  }
}
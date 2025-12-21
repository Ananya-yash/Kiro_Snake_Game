import { GameStatus, Direction, Position } from './types.js';
import { Snake } from './snake.js';
import { Food, FoodManager } from './food.js';
import { GameGrid } from './grid.js';
import { CollisionDetector } from './collision.js';
import { CONFIG } from './config.js';

export interface Score {
  player: number;
  ai: number;
}

export class GameStateManager {
  public playerSnake: Snake;
  public aiSnake: Snake;
  public foodManager: FoodManager;
  public grid: GameGrid;
  public score: Score;
  public gameStatus: GameStatus;
  public winner: 'player' | 'ai' | 'tie' | null;
  private collisionDetector: CollisionDetector;

  constructor() {
    this.grid = new GameGrid(CONFIG.GRID_SIZE, CONFIG.GRID_SIZE);
    this.foodManager = new FoodManager(this.grid);
    this.collisionDetector = new CollisionDetector(this.grid);
    
    // Initialize snakes
    this.playerSnake = new Snake(
      { x: 5, y: 10 },
      Direction.RIGHT,
      CONFIG.COLORS.PLAYER
    );
    
    this.aiSnake = new Snake(
      { x: 15, y: 10 },
      Direction.LEFT,
      CONFIG.COLORS.AI
    );

    this.score = { player: 0, ai: 0 };
    this.gameStatus = 'waiting';
    this.winner = null;

    this.initializeFood();
  }

  /**
   * Initialize food on the grid
   */
  private initializeFood(): void {
    const occupiedCells = [
      ...this.playerSnake.body,
      ...this.aiSnake.body
    ];
    this.foodManager.initialize(occupiedCells);
  }

  /**
   * Start the game
   */
  startGame(): void {
    if (this.gameStatus === 'waiting' || this.gameStatus === 'gameOver') {
      this.resetGame();
    }
    this.gameStatus = 'playing';
  }

  /**
   * Pause the game
   */
  pauseGame(): void {
    if (this.gameStatus === 'playing') {
      this.gameStatus = 'paused';
    } else if (this.gameStatus === 'paused') {
      this.gameStatus = 'playing';
    }
  }

  /**
   * Reset the game to initial state
   */
  resetGame(): void {
    // Reset snakes
    this.playerSnake.reset({ x: 5, y: 10 }, Direction.RIGHT);
    this.aiSnake.reset({ x: 15, y: 10 }, Direction.LEFT);

    // Reset score
    this.score = { player: 0, ai: 0 };

    // Reset game state
    this.gameStatus = 'waiting';
    this.winner = null;

    // Reset food
    this.initializeFood();
  }

  /**
   * Update game state for one tick with Apex Predator logic
   */
  update(): void {
    if (this.gameStatus !== 'playing') {
      return;
    }

    // Check for Apex Predator clash between snakes
    const clashResult = this.collisionDetector.checkApexPredatorClash(this.playerSnake, this.aiSnake);
    
    if (clashResult.hasCollision && clashResult.type === 'clash') {
      this.handleApexPredatorClash(clashResult);
      return;
    }

    // Check individual snake collisions (self-collision)
    const playerCollision = this.collisionDetector.checkCollision(this.playerSnake);
    const aiCollision = this.collisionDetector.checkCollision(this.aiSnake);

    // Handle self-collisions
    if (playerCollision.hasCollision && playerCollision.type === 'self') {
      this.playerSnake.kill();
      this.winner = 'ai';
      this.gameStatus = 'gameOver';
      return;
    }

    if (aiCollision.hasCollision && aiCollision.type === 'self') {
      this.aiSnake.kill();
      this.winner = 'player';
      this.gameStatus = 'gameOver';
      return;
    }

    // Move snakes if no collisions
    this.playerSnake.move();
    this.aiSnake.move();

    // Check for food consumption
    this.checkFoodConsumption();

    // Maintain minimum food on grid
    const occupiedCells = [...this.playerSnake.body, ...this.aiSnake.body];
    this.foodManager.maintainMinimumFood(occupiedCells, 1);
  }

  /**
   * Handle Apex Predator clash resolution
   */
  private handleApexPredatorClash(clashResult: any): void {
    const winner = clashResult.winner;
    
    if (winner === 'tie') {
      // Equal length - both snakes die
      this.playerSnake.kill();
      this.aiSnake.kill();
      this.winner = 'tie';
    } else if (winner === 'player') {
      // Player snake is longer - AI dies, player continues
      this.aiSnake.kill();
      this.winner = 'player';
      // Player gets bonus score for defeating AI
      this.score.player += CONFIG.SCORE_INCREMENT * 2;
      // Player snake continues moving
      this.playerSnake.move();
    } else if (winner === 'ai') {
      // AI snake is longer - player dies, AI continues
      this.playerSnake.kill();
      this.winner = 'ai';
      // AI gets bonus score for defeating player
      this.score.ai += CONFIG.SCORE_INCREMENT * 2;
      // AI snake continues moving
      this.aiSnake.move();
    }

    this.gameStatus = 'gameOver';
  }

  /**
   * Handle collision events
   */
  private handleCollisions(playerCollided: boolean, aiCollided: boolean): void {
    if (playerCollided && aiCollided) {
      // Both snakes collided
      this.playerSnake.kill();
      this.aiSnake.kill();
      this.winner = 'tie';
    } else if (playerCollided) {
      // Only player collided
      this.playerSnake.kill();
      this.winner = 'ai';
    } else if (aiCollided) {
      // Only AI collided
      this.aiSnake.kill();
      this.winner = 'player';
    }

    this.gameStatus = 'gameOver';
  }

  /**
   * Check if snakes consumed food and handle growth/scoring
   */
  private checkFoodConsumption(): void {
    // Check player snake
    const playerHead = this.playerSnake.getHead();
    const playerFood = this.foodManager.consumeFood(playerHead);
    if (playerFood) {
      this.playerSnake.grow();
      this.score.player += CONFIG.SCORE_INCREMENT; // Use centralized score increment
      this.spawnNewFood();
    }

    // Check AI snake
    const aiHead = this.aiSnake.getHead();
    const aiFood = this.foodManager.consumeFood(aiHead);
    if (aiFood) {
      this.aiSnake.grow();
      this.score.ai += CONFIG.SCORE_INCREMENT; // Use centralized score increment
      this.spawnNewFood();
    }
  }

  /**
   * Spawn new food after consumption
   */
  private spawnNewFood(): void {
    const occupiedCells = [
      ...this.playerSnake.body,
      ...this.aiSnake.body,
      ...this.foodManager.getFoodPositions()
    ];
    
    this.foodManager.spawnFood(occupiedCells);
  }

  /**
   * Change player snake direction
   */
  changePlayerDirection(direction: Direction): boolean {
    if (this.gameStatus !== 'playing') {
      return false;
    }
    
    return this.playerSnake.changeDirection(direction);
  }

  /**
   * Change AI snake direction (for AI controller)
   */
  changeAIDirection(direction: Direction): boolean {
    if (this.gameStatus !== 'playing') {
      return false;
    }
    
    return this.aiSnake.changeDirection(direction);
  }

  /**
   * Get current game state for rendering
   */
  getGameState(): {
    playerSnake: Snake;
    aiSnake: Snake;
    foods: Food[];
    grid: GameGrid;
    score: Score;
    gameStatus: GameStatus;
    winner: 'player' | 'ai' | 'tie' | null;
  } {
    return {
      playerSnake: this.playerSnake,
      aiSnake: this.aiSnake,
      foods: this.foodManager.getAllFoods(),
      grid: this.grid,
      score: { ...this.score },
      gameStatus: this.gameStatus,
      winner: this.winner
    };
  }

  /**
   * Get all occupied positions (for AI pathfinding)
   */
  getOccupiedPositions(): Position[] {
    return [
      ...this.playerSnake.body,
      ...this.aiSnake.body
    ];
  }

  /**
   * Get all food positions (for AI targeting)
   */
  getFoodPositions(): Position[] {
    return this.foodManager.getFoodPositions();
  }

  /**
   * Check if the game is over
   */
  isGameOver(): boolean {
    return this.gameStatus === 'gameOver';
  }

  /**
   * Check if the game is running
   */
  isPlaying(): boolean {
    return this.gameStatus === 'playing';
  }

  /**
   * Get the winner of the game
   */
  getWinner(): 'player' | 'ai' | 'tie' | null {
    return this.winner;
  }

  /**
   * Get power balance status for UI feedback
   */
  getPowerBalance(): 'player' | 'ai' | 'balanced' {
    const playerLength = this.playerSnake.body.length;
    const aiLength = this.aiSnake.body.length;
    
    if (playerLength > aiLength + 1) {
      return 'player';
    } else if (aiLength > playerLength + 1) {
      return 'ai';
    } else {
      return 'balanced';
    }
  }

  /**
   * Get the dominant snake for visual effects
   */
  getDominantSnake(): 'player' | 'ai' | 'tie' {
    return this.collisionDetector.getDominantSnake(this.playerSnake, this.aiSnake);
  }
}
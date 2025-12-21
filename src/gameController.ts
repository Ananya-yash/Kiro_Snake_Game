import { Direction } from './types.js';
import { GameStateManager } from './gameState.js';
import { Renderer } from './renderer.js';
import { InputHandler } from './input.js';
import { AIController } from './aiController.js';
import { DifficultyManager } from './difficultyManager.js';
import { LevelSelector } from './levelSelector.js';
import { CONFIG, Level } from './config.js';

export class GameController {
  private gameState: GameStateManager;
  private renderer: Renderer;
  private inputHandler: InputHandler;
  private aiController: AIController;
  private difficultyManager: DifficultyManager;
  private levelSelector: LevelSelector;
  private gameLoopId: number | null = null;
  private lastUpdateTime: number = 0;
  private dangerModeCanvas: HTMLCanvasElement | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.gameState = new GameStateManager();
    this.renderer = new Renderer(canvas);
    this.inputHandler = new InputHandler();
    this.difficultyManager = new DifficultyManager();
    this.levelSelector = new LevelSelector(this.difficultyManager);
    this.dangerModeCanvas = canvas;
    
    // Initialize AI controller
    const initialState = this.gameState.getGameState();
    this.aiController = new AIController(initialState.aiSnake, initialState.grid);

    this.setupInputHandlers();
    this.setupLevelHandlers();
    this.render(); // Initial render
  }

  /**
   * Set up input event handlers
   */
  private setupInputHandlers(): void {
    this.inputHandler.onDirectionChange((direction: Direction) => {
      this.gameState.changePlayerDirection(direction);
    });

    this.inputHandler.onGameControl((action) => {
      switch (action) {
        case 'start':
        case 'pause':
          this.togglePause();
          break;
        case 'restart':
          this.restart();
          break;
      }
    });

    this.inputHandler.startListening();
  }

  /**
   * Set up level change handlers
   */
  private setupLevelHandlers(): void {
    this.levelSelector.onLevelChangeCallback((level: Level) => {
      // Reset AI move counter when level changes
      this.difficultyManager.reset();
      this.updateDangerMode();
    });
  }

  /**
   * Start the game
   */
  start(): void {
    this.gameState.startGame();
    this.startGameLoop();
  }

  /**
   * Pause or resume the game
   */
  togglePause(): void {
    if (this.gameState.gameStatus === 'waiting') {
      this.start();
    } else if (this.gameState.gameStatus === 'playing') {
      this.pause();
    } else if (this.gameState.gameStatus === 'paused') {
      this.resume();
    } else if (this.gameState.gameStatus === 'gameOver') {
      this.restart();
    }
  }

  /**
   * Pause the game
   */
  pause(): void {
    this.gameState.pauseGame();
    this.stopGameLoop();
  }

  /**
   * Resume the game
   */
  resume(): void {
    this.gameState.pauseGame(); // This toggles pause state
    this.startGameLoop();
  }

  /**
   * Restart the game
   */
  restart(): void {
    this.stopGameLoop();
    this.gameState.resetGame();
    
    // Reset AI controller
    const newState = this.gameState.getGameState();
    this.aiController = new AIController(newState.aiSnake, newState.grid);
    
    // Reset difficulty manager and score display
    this.difficultyManager.reset();
    this.renderer.resetScores();
    
    this.render();
  }

  /**
   * Start the main game loop
   */
  private startGameLoop(): void {
    if (this.gameLoopId !== null) {
      return; // Already running
    }

    this.lastUpdateTime = performance.now();
    this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Stop the main game loop
   */
  private stopGameLoop(): void {
    if (this.gameLoopId !== null) {
      cancelAnimationFrame(this.gameLoopId);
      this.gameLoopId = null;
    }
  }

  /**
   * Main game loop
   */
  private gameLoop(currentTime: number): void {
    const deltaTime = currentTime - this.lastUpdateTime;

    // Update game state at fixed intervals
    if (deltaTime >= CONFIG.TICK_RATE) {
      this.update();
      this.lastUpdateTime = currentTime;
    }

    // Render every frame for smooth animations
    this.render();

    // Continue the loop if game is still running
    if (this.gameState.isPlaying()) {
      this.gameLoopId = requestAnimationFrame(this.gameLoop.bind(this));
    } else {
      this.gameLoopId = null;
    }
  }

  /**
   * Update game logic
   */
  private update(): void {
    if (!this.gameState.isPlaying()) {
      return;
    }

    // Update AI logic
    this.updateAI();

    // Update game state
    this.gameState.update();

    // Check for level progression based on player score
    this.checkLevelProgression();
  }

  /**
   * Update AI controller with difficulty-based throttling
   */
  private updateAI(): void {
    // Check if AI should move this frame based on difficulty
    if (!this.difficultyManager.shouldAIMove()) {
      return;
    }

    const state = this.gameState.getGameState();
    const foodPositions = this.gameState.getFoodPositions();
    
    // Check if AI should make a random move (beginner mode)
    const shouldMakeRandomMove = this.difficultyManager.shouldMakeRandomMove();
    
    this.aiController.update(foodPositions, state.playerSnake, shouldMakeRandomMove);
  }

  /**
   * Render the current game state
   */
  private render(): void {
    const state = this.gameState.getGameState();
    this.renderer.render(state);
    this.renderer.updateUI(state);
  }

  /**
   * Get current difficulty level
   */
  getCurrentLevel(): Level {
    return this.difficultyManager.getCurrentLevel();
  }

  /**
   * Check for automatic level progression based on score
   */
  private checkLevelProgression(): void {
    const currentScore = this.gameState.score.player;
    const leveledUp = this.difficultyManager.updateScore(currentScore);
    
    if (leveledUp) {
      const newLevel = this.difficultyManager.getCurrentLevel();
      this.levelSelector.updateLevelDisplay(newLevel);
      this.updateDangerMode();
      
      // Show level up notification (could be enhanced with UI feedback)
      console.log(`Level Up! Now at Level ${newLevel} - AI Neural Link speed increased!`);
    }
  }

  /**
   * Update danger mode visual effects for Level 5
   */
  private updateDangerMode(): void {
    if (!this.dangerModeCanvas) return;
    
    const isDangerMode = this.difficultyManager.isDangerMode();
    
    if (isDangerMode) {
      // Add red pulsing border for Level 5
      this.dangerModeCanvas.style.animation = 'dangerBorder 1.5s ease-in-out infinite';
      this.dangerModeCanvas.style.borderColor = CONFIG.COLORS.LEVEL_5;
      this.addDangerModeStyles();
    } else {
      // Remove danger mode effects
      this.dangerModeCanvas.style.animation = '';
      this.dangerModeCanvas.style.borderColor = '';
    }
  }

  /**
   * Add CSS for danger mode border animation
   */
  private addDangerModeStyles(): void {
    const existingStyle = document.getElementById('danger-mode-styles');
    if (existingStyle) return;

    const style = document.createElement('style');
    style.id = 'danger-mode-styles';
    style.textContent = `
      @keyframes dangerBorder {
        0%, 100% {
          border-color: ${CONFIG.COLORS.LEVEL_5};
          box-shadow: 0 0 20px ${CONFIG.COLORS.LEVEL_5};
        }
        50% {
          border-color: #ff4477;
          box-shadow: 0 0 30px #ff4477;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopGameLoop();
    this.inputHandler.stopListening();
  }

  /**
   * Get current game status
   */
  getGameStatus(): string {
    return this.gameState.gameStatus;
  }

  /**
   * Get current score
   */
  getScore(): { player: number; ai: number } {
    return this.gameState.score;
  }

  /**
   * Check if game is running
   */
  isRunning(): boolean {
    return this.gameLoopId !== null;
  }
}
import { Position, GameStatus } from './types.js';
import { Snake } from './snake.js';
import { Food } from './food.js';
import { GameGrid } from './grid.js';
import { CONFIG } from './config.js';
import { ScoreDisplay, ScoreData } from './scoreDisplay.js';

export interface GameState {
  playerSnake: Snake;
  aiSnake: Snake;
  foods: Food[];
  grid: GameGrid;
  score: { player: number; ai: number };
  gameStatus: GameStatus;
  winner: 'player' | 'ai' | 'tie' | null;
  dominantSnake?: 'player' | 'ai' | 'tie';
  powerBalance?: 'player' | 'ai' | 'balanced';
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cellSize: number;
  private scoreDisplay: ScoreDisplay;
  private lastScores: { player: number; ai: number } = { player: 0, ai: 0 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not get 2D rendering context');
    }
    this.ctx = context;
    this.cellSize = CONFIG.CELL_SIZE;
    this.scoreDisplay = new ScoreDisplay();
    
    // Set canvas size
    this.canvas.width = CONFIG.CANVAS.WIDTH;
    this.canvas.height = CONFIG.CANVAS.HEIGHT;
    
    // Calculate cell size based on canvas and grid dimensions
    this.cellSize = Math.min(
      CONFIG.CANVAS.WIDTH / CONFIG.GRID_SIZE,
      CONFIG.CANVAS.HEIGHT / CONFIG.GRID_SIZE
    );
  }

  /**
   * Render the complete game state
   */
  render(gameState: GameState): void {
    this.clearCanvas();
    this.renderGrid(gameState.grid);
    this.renderFoods(gameState.foods);
    this.renderSnake(gameState.playerSnake);
    this.renderSnake(gameState.aiSnake);
  }

  /**
   * Clear the entire canvas
   */
  private clearCanvas(): void {
    this.ctx.fillStyle = CONFIG.COLORS.GRID;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Render the grid background with neon lines
   */
  renderGrid(grid: GameGrid): void {
    this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINES;
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.3;

    // Draw vertical lines
    for (let x = 0; x <= grid.width; x++) {
      const xPos = x * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(xPos, 0);
      this.ctx.lineTo(xPos, grid.height * this.cellSize);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y <= grid.height; y++) {
      const yPos = y * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(0, yPos);
      this.ctx.lineTo(grid.width * this.cellSize, yPos);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render a snake with neon glow effects and power pulse for dominant snake
   */
  renderSnake(snake: Snake, isDominant: boolean = false): void {
    if (!snake.isAlive) {
      this.ctx.globalAlpha = 0.5; // Dim dead snakes
    }

    snake.body.forEach((segment, index) => {
      const isHead = index === 0;
      this.renderSnakeSegment(segment, snake.color, isHead, isDominant);
    });

    this.ctx.globalAlpha = 1.0;
  }

  /**
   * Render a single snake segment with glow effect and power pulse
   */
  private renderSnakeSegment(position: Position, color: string, isHead: boolean, isDominant: boolean = false): void {
    const x = position.x * this.cellSize;
    const y = position.y * this.cellSize;
    const size = this.cellSize - 2; // Small gap between segments

    // Enhanced glow for dominant snake
    const baseGlow = isHead ? 15 : 10;
    const powerPulse = isDominant ? (0.5 + 0.5 * Math.sin(Date.now() * 0.008)) : 1;
    const glowIntensity = baseGlow * (isDominant ? 1.5 * powerPulse : 1);

    // Create glow effect
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = glowIntensity;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    // Fill the segment
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x + 1, y + 1, size, size);

    // Add inner highlight for head or dominant snake
    if (isHead || isDominant) {
      this.ctx.shadowBlur = 0;
      const highlightIntensity = isDominant ? 0.4 * powerPulse : 0.3;
      this.ctx.fillStyle = this.lightenColor(color, highlightIntensity);
      const highlightSize = isDominant ? size - 2 : size - 4;
      const highlightOffset = isDominant ? 2 : 3;
      this.ctx.fillRect(x + highlightOffset, y + highlightOffset, highlightSize, highlightSize);
    }

    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  /**
   * Render all food items with pulsing glow effect
   */
  renderFoods(foods: Food[]): void {
    foods.forEach(food => this.renderFood(food));
  }

  /**
   * Render a single food item with neon glow
   */
  renderFood(food: Food): void {
    const x = food.position.x * this.cellSize;
    const y = food.position.y * this.cellSize;
    const centerX = x + this.cellSize / 2;
    const centerY = y + this.cellSize / 2;
    const radius = this.cellSize / 3;

    // Create pulsing glow effect
    const pulseIntensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.005);
    
    this.ctx.shadowColor = CONFIG.COLORS.FOOD;
    this.ctx.shadowBlur = 15 * pulseIntensity;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    // Draw food as a circle
    this.ctx.fillStyle = CONFIG.COLORS.FOOD;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    this.ctx.fill();

    // Add inner highlight
    this.ctx.shadowBlur = 0;
    this.ctx.fillStyle = this.lightenColor(CONFIG.COLORS.FOOD, 0.4);
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    this.ctx.fill();

    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  /**
   * Update UI elements (score, length, status) with enhanced scoring
   */
  updateUI(gameState: GameState): void {
    // Prepare score data
    const scoreData: ScoreData = {
      player: gameState.score.player,
      ai: gameState.score.ai,
      playerLength: gameState.playerSnake.getLength(),
      aiLength: gameState.aiSnake.getLength()
    };

    // Check for score increases and highlight them
    if (gameState.score.player > this.lastScores.player) {
      this.scoreDisplay.highlightScoreIncrease(true);
    }
    if (gameState.score.ai > this.lastScores.ai) {
      this.scoreDisplay.highlightScoreIncrease(false);
    }

    // Update scores
    this.scoreDisplay.updateScores(scoreData);

    // Update last scores for comparison
    this.lastScores = { ...gameState.score };

    // Update game status
    this.updateGameStatus(gameState.gameStatus, gameState.winner);
  }

  /**
   * Update game status display
   */
  private updateGameStatus(status: GameStatus, winner: 'player' | 'ai' | 'tie' | null): void {
    const statusEl = document.getElementById('game-status');
    if (!statusEl) return;

    let message = '';
    let visible = false;

    switch (status) {
      case 'waiting':
        message = 'Press SPACE to start';
        visible = true;
        break;
      case 'paused':
        message = 'PAUSED - Press SPACE to resume';
        visible = true;
        break;
      case 'gameOver':
        if (winner) {
          this.scoreDisplay.showWinner(winner);
          return; // ScoreDisplay handles the winner message
        }
        visible = false;
        break;
      case 'playing':
        visible = false;
        break;
    }

    statusEl.textContent = message;
    statusEl.classList.toggle('visible', visible);
  }

  /**
   * Get current score data for external systems (AI commentary, etc.)
   */
  getScoreData(): ScoreData | null {
    return this.scoreDisplay.getScoreData();
  }

  /**
   * Reset score display
   */
  resetScores(): void {
    this.scoreDisplay.resetScores();
    this.lastScores = { player: 0, ai: 0 };
  }

  /**
   * Lighten a hex color by a given factor
   */
  private lightenColor(color: string, factor: number): string {
    // Remove # if present
    const hex = color.replace('#', '');
    
    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Lighten each component
    const newR = Math.min(255, Math.floor(r + (255 - r) * factor));
    const newG = Math.min(255, Math.floor(g + (255 - g) * factor));
    const newB = Math.min(255, Math.floor(b + (255 - b) * factor));
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  }

  /**
   * Get canvas dimensions
   */
  getCanvasSize(): { width: number; height: number } {
    return {
      width: this.canvas.width,
      height: this.canvas.height
    };
  }
}
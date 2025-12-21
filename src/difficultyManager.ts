import { CONFIG, LevelConfig, Level } from './config.js';

export class DifficultyManager {
  private currentLevel: Level = 1;
  private aiMoveCounter: number = 0;
  private playerScore: number = 0;

  constructor() {
    this.currentLevel = 1;
    this.aiMoveCounter = 0;
    this.playerScore = 0;
  }

  /**
   * Set the current level manually
   */
  setLevel(level: Level): void {
    this.currentLevel = level;
    this.aiMoveCounter = 0; // Reset counter when level changes
  }

  /**
   * Update player score and check for automatic level progression
   */
  updateScore(score: number): boolean {
    this.playerScore = score;
    const newLevel = this.calculateLevelFromScore(score);
    
    if (newLevel !== this.currentLevel) {
      this.currentLevel = newLevel;
      this.aiMoveCounter = 0;
      return true; // Level up occurred
    }
    
    return false; // No level change
  }

  /**
   * Calculate appropriate level based on score thresholds
   */
  private calculateLevelFromScore(score: number): Level {
    for (let i = CONFIG.LEVEL_CONFIG.length - 1; i >= 0; i--) {
      if (score >= CONFIG.LEVEL_CONFIG[i].scoreThreshold) {
        return CONFIG.LEVEL_CONFIG[i].level as Level;
      }
    }
    return 1; // Default to level 1
  }

  /**
   * Get the current level
   */
  getCurrentLevel(): Level {
    return this.currentLevel;
  }

  /**
   * Get current level configuration
   */
  getCurrentLevelConfig(): LevelConfig {
    return CONFIG.LEVEL_CONFIG[this.currentLevel - 1];
  }

  /**
   * Check if AI should move this frame
   */
  shouldAIMove(): boolean {
    this.aiMoveCounter++;
    const config = this.getCurrentLevelConfig();
    
    if (this.aiMoveCounter >= config.aiMoveDelay) {
      this.aiMoveCounter = 0;
      return true;
    }
    
    return false;
  }

  /**
   * Check if AI should make a random move (based on intelligence level)
   */
  shouldMakeRandomMove(): boolean {
    const config = this.getCurrentLevelConfig();
    return Math.random() > config.aiIntelligence;
  }

  /**
   * Reset the move counter and score
   */
  reset(): void {
    this.aiMoveCounter = 0;
    this.playerScore = 0;
    this.currentLevel = 1;
  }

  /**
   * Get level color for UI
   */
  getLevelColor(): string {
    switch (this.currentLevel) {
      case 1:
        return CONFIG.COLORS.LEVEL_1;
      case 2:
        return CONFIG.COLORS.LEVEL_2;
      case 3:
        return CONFIG.COLORS.LEVEL_3;
      case 4:
        return CONFIG.COLORS.LEVEL_4;
      case 5:
        return CONFIG.COLORS.LEVEL_5;
      default:
        return CONFIG.COLORS.LEVEL_1;
    }
  }

  /**
   * Get all available levels
   */
  static getAllLevels(): Level[] {
    return CONFIG.LEVEL_CONFIG.map(config => config.level as Level);
  }

  /**
   * Get level description for UI
   */
  getLevelDescription(): string {
    return this.getCurrentLevelConfig().description;
  }

  /**
   * Check if current level is danger mode (Level 5)
   */
  isDangerMode(): boolean {
    return this.currentLevel === 5;
  }

  /**
   * Get next level threshold for progression display
   */
  getNextLevelThreshold(): number | null {
    if (this.currentLevel >= 5) return null;
    
    const nextLevelConfig = CONFIG.LEVEL_CONFIG[this.currentLevel];
    return nextLevelConfig ? nextLevelConfig.scoreThreshold : null;
  }

  /**
   * Get progress towards next level (0-1)
   */
  getProgressToNextLevel(): number {
    const nextThreshold = this.getNextLevelThreshold();
    if (!nextThreshold) return 1; // Max level reached
    
    const currentThreshold = this.getCurrentLevelConfig().scoreThreshold;
    const progress = (this.playerScore - currentThreshold) / (nextThreshold - currentThreshold);
    return Math.max(0, Math.min(1, progress));
  }
}
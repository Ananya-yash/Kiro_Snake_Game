import { CONFIG } from './config.js';

export interface ScoreData {
  player: number;
  ai: number;
  playerLength: number;
  aiLength: number;
}

export class ScoreDisplay {
  private playerScoreEl: HTMLElement | null;
  private aiScoreEl: HTMLElement | null;
  private playerLengthEl: HTMLElement | null;
  private aiLengthEl: HTMLElement | null;
  private playerScoreBar: HTMLElement | null;
  private aiScoreBar: HTMLElement | null;
  private totalFoodEl: HTMLElement | null;
  private currentLeaderEl: HTMLElement | null;
  private maxScore: number = 0;

  constructor() {
    this.playerScoreEl = document.getElementById('player-score');
    this.aiScoreEl = document.getElementById('ai-score');
    this.playerLengthEl = document.getElementById('player-length');
    this.aiLengthEl = document.getElementById('ai-length');
    this.playerScoreBar = document.getElementById('player-score-bar');
    this.aiScoreBar = document.getElementById('ai-score-bar');
    this.totalFoodEl = document.getElementById('total-food');
    this.currentLeaderEl = document.getElementById('current-leader');
  }

  /**
   * Update all score displays with neon glow effects and animated bars
   */
  updateScores(scoreData: ScoreData): void {
    this.updatePlayerScore(scoreData.player, scoreData.playerLength);
    this.updateAIScore(scoreData.ai, scoreData.aiLength);
    this.updateScoreBars(scoreData);
    this.updateStats(scoreData);
  }

  /**
   * Update player score with enhanced neon effects
   */
  private updatePlayerScore(score: number, length: number): void {
    if (this.playerScoreEl) {
      this.playerScoreEl.textContent = score.toString();
      this.applyScoreGlow(this.playerScoreEl, CONFIG.COLORS.PLAYER);
    }

    if (this.playerLengthEl) {
      this.playerLengthEl.textContent = `Length: ${length}`;
    }
  }

  /**
   * Update AI score with enhanced neon effects
   */
  private updateAIScore(score: number, length: number): void {
    if (this.aiScoreEl) {
      this.aiScoreEl.textContent = score.toString();
      this.applyScoreGlow(this.aiScoreEl, CONFIG.COLORS.AI);
    }

    if (this.aiLengthEl) {
      this.aiLengthEl.textContent = `Length: ${length}`;
    }
  }

  /**
   * Apply dynamic neon glow effect to score elements
   */
  private applyScoreGlow(element: HTMLElement, color: string): void {
    // Remove existing glow animation
    element.classList.remove('score-pulse');
    
    // Force reflow to restart animation
    element.offsetHeight;
    
    // Add pulsing glow effect
    element.classList.add('score-pulse');
    element.style.color = color;
    element.style.textShadow = `
      0 0 5px ${color},
      0 0 10px ${color},
      0 0 20px ${color},
      0 0 40px ${color}
    `;
  }

  /**
   * Highlight score increase with special effect
   */
  highlightScoreIncrease(isPlayer: boolean): void {
    const element = isPlayer ? this.playerScoreEl : this.aiScoreEl;
    const scoreBar = isPlayer ? this.playerScoreBar : this.aiScoreBar;
    const color = isPlayer ? CONFIG.COLORS.PLAYER : CONFIG.COLORS.AI;
    
    if (element) {
      // Add intense glow for score increase
      element.style.transform = 'scale(1.2)';
      element.style.textShadow = `
        0 0 10px ${color},
        0 0 20px ${color},
        0 0 40px ${color},
        0 0 80px ${color}
      `;
      
      // Reset after animation
      setTimeout(() => {
        element.style.transform = 'scale(1)';
        this.applyScoreGlow(element, color);
      }, 300);
    }
    
    // Animate score bar
    if (scoreBar) {
      scoreBar.style.boxShadow = `0 0 20px ${color}`;
      setTimeout(() => {
        scoreBar.style.boxShadow = `0 0 10px ${color}`;
      }, 300);
    }
  }

  /**
   * Update score bars with animated progress
   */
  private updateScoreBars(scoreData: ScoreData): void {
    // Update max score for bar scaling
    this.maxScore = Math.max(this.maxScore, scoreData.player, scoreData.ai, 100);
    
    // Update player score bar
    if (this.playerScoreBar) {
      const playerPercentage = (scoreData.player / this.maxScore) * 100;
      this.playerScoreBar.style.width = `${playerPercentage}%`;
    }
    
    // Update AI score bar
    if (this.aiScoreBar) {
      const aiPercentage = (scoreData.ai / this.maxScore) * 100;
      this.aiScoreBar.style.width = `${aiPercentage}%`;
    }
  }

  /**
   * Update statistics display
   */
  private updateStats(scoreData: ScoreData): void {
    // Update total food collected
    if (this.totalFoodEl) {
      const totalFood = Math.floor((scoreData.player + scoreData.ai) / CONFIG.SCORE_INCREMENT);
      this.totalFoodEl.textContent = totalFood.toString();
    }
    
    // Update current leader
    if (this.currentLeaderEl) {
      if (scoreData.player > scoreData.ai) {
        this.currentLeaderEl.textContent = 'Player';
        this.currentLeaderEl.style.color = CONFIG.COLORS.PLAYER;
        this.currentLeaderEl.style.textShadow = `0 0 5px ${CONFIG.COLORS.PLAYER}`;
      } else if (scoreData.ai > scoreData.player) {
        this.currentLeaderEl.textContent = 'AI';
        this.currentLeaderEl.style.color = CONFIG.COLORS.AI;
        this.currentLeaderEl.style.textShadow = `0 0 5px ${CONFIG.COLORS.AI}`;
      } else {
        this.currentLeaderEl.textContent = 'Tie';
        this.currentLeaderEl.style.color = '#ffffff';
        this.currentLeaderEl.style.textShadow = '0 0 5px #ffffff';
      }
    }
  }

  /**
   * Get current score data for external systems (like AI commentary)
   */
  getScoreData(): ScoreData | null {
    const playerScore = this.playerScoreEl?.textContent;
    const aiScore = this.aiScoreEl?.textContent;
    const playerLength = this.playerLengthEl?.textContent;
    const aiLength = this.aiLengthEl?.textContent;

    if (playerScore && aiScore && playerLength && aiLength) {
      return {
        player: parseInt(playerScore),
        ai: parseInt(aiScore),
        playerLength: parseInt(playerLength.replace('Length: ', '')),
        aiLength: parseInt(aiLength.replace('Length: ', ''))
      };
    }

    return null;
  }

  /**
   * Reset all scores to zero
   */
  resetScores(): void {
    this.maxScore = 0;
    this.updateScores({
      player: 0,
      ai: 0,
      playerLength: CONFIG.INITIAL_SNAKE_LENGTH,
      aiLength: CONFIG.INITIAL_SNAKE_LENGTH
    });
  }

  /**
   * Show winner announcement with special effects
   */
  showWinner(winner: 'player' | 'ai' | 'tie'): void {
    const statusEl = document.getElementById('game-status');
    if (!statusEl) return;

    let message = '';
    let color = '';

    switch (winner) {
      case 'player':
        message = 'PLAYER WINS!';
        color = CONFIG.COLORS.PLAYER;
        break;
      case 'ai':
        message = 'AI WINS!';
        color = CONFIG.COLORS.AI;
        break;
      case 'tie':
        message = 'TIE GAME!';
        color = '#ffffff';
        break;
    }

    statusEl.textContent = message + ' - Press R to restart';
    statusEl.style.color = color;
    statusEl.style.textShadow = `
      0 0 10px ${color},
      0 0 20px ${color},
      0 0 40px ${color}
    `;
    statusEl.classList.add('visible');
  }
}
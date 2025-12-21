import { CONFIG, Level } from './config.js';
import { DifficultyManager } from './difficultyManager.js';

export type LevelChangeCallback = (level: Level) => void;

export class LevelSelector {
  private selectorEl: HTMLElement | null;
  private difficultyManager: DifficultyManager;
  private onLevelChange?: LevelChangeCallback;

  constructor(difficultyManager: DifficultyManager) {
    this.difficultyManager = difficultyManager;
    this.createSelector();
    this.selectorEl = document.getElementById('level-selector');
    this.setupEventListeners();
  }

  /**
   * Create the level selector HTML structure
   */
  private createSelector(): void {
    const existingSelector = document.getElementById('level-selector');
    if (existingSelector) return;

    const selector = document.createElement('div');
    selector.id = 'level-selector';
    selector.className = 'level-selector';
    
    let buttonsHtml = '<div class="selector-header"><h3>LEVEL PROGRESSION</h3></div><div class="level-buttons">';
    
    DifficultyManager.getAllLevels().forEach(level => {
      const config = CONFIG.LEVEL_CONFIG[level - 1];
      const isActive = level === this.difficultyManager.getCurrentLevel();
      
      buttonsHtml += `
        <button 
          class="level-btn ${isActive ? 'active' : ''}" 
          data-level="${level}"
          data-color="${this.getLevelColor(level)}"
        >
          <span class="btn-label">${config.label}</span>
          <span class="btn-description">${config.description}</span>
        </button>
      `;
    });
    
    buttonsHtml += '</div>';
    selector.innerHTML = buttonsHtml;

    // Insert before the game container
    const gameContainer = document.querySelector('.game-container');
    if (gameContainer && gameContainer.parentNode) {
      gameContainer.parentNode.insertBefore(selector, gameContainer);
    } else {
      document.body.appendChild(selector);
    }

    this.addSelectorStyles();
  }

  /**
   * Add CSS styles for the level selector
   */
  private addSelectorStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      .level-selector {
        text-align: center;
        margin: 20px 0;
        font-family: 'Orbitron', monospace;
      }

      .selector-header h3 {
        color: var(--neon-cyan);
        text-shadow: 0 0 10px var(--neon-cyan);
        font-size: 1.2rem;
        margin: 0 0 15px 0;
        letter-spacing: 0.2em;
      }

      .level-buttons {
        display: flex;
        justify-content: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .level-btn {
        background: rgba(10, 10, 10, 0.8);
        border: 2px solid #333;
        border-radius: 8px;
        padding: 10px 16px;
        color: #aaa;
        font-family: 'Orbitron', monospace;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 100px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .level-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 255, 255, 0.3);
      }

      .level-btn.active {
        border-color: var(--neon-cyan);
        color: var(--neon-cyan);
        text-shadow: 0 0 10px var(--neon-cyan);
        box-shadow: 
          0 0 15px var(--neon-cyan),
          inset 0 0 15px rgba(0, 255, 255, 0.1);
      }

      .btn-label {
        font-weight: 700;
        font-size: 0.9rem;
        letter-spacing: 0.1em;
      }

      .btn-description {
        font-size: 0.65rem;
        opacity: 0.8;
        line-height: 1.2;
      }

      .level-btn[data-level="1"]:hover,
      .level-btn[data-level="1"].active {
        border-color: var(--level-1, #00ff88);
        color: var(--level-1, #00ff88);
        text-shadow: 0 0 10px var(--level-1, #00ff88);
        box-shadow: 
          0 0 15px var(--level-1, #00ff88),
          inset 0 0 15px rgba(0, 255, 136, 0.1);
      }

      .level-btn[data-level="2"]:hover,
      .level-btn[data-level="2"].active {
        border-color: var(--level-2, #00ddff);
        color: var(--level-2, #00ddff);
        text-shadow: 0 0 10px var(--level-2, #00ddff);
        box-shadow: 
          0 0 15px var(--level-2, #00ddff),
          inset 0 0 15px rgba(0, 221, 255, 0.1);
      }

      .level-btn[data-level="3"]:hover,
      .level-btn[data-level="3"].active {
        border-color: var(--level-3, #ffaa00);
        color: var(--level-3, #ffaa00);
        text-shadow: 0 0 10px var(--level-3, #ffaa00);
        box-shadow: 
          0 0 15px var(--level-3, #ffaa00),
          inset 0 0 15px rgba(255, 170, 0, 0.1);
      }

      .level-btn[data-level="4"]:hover,
      .level-btn[data-level="4"].active {
        border-color: var(--level-4, #ff6600);
        color: var(--level-4, #ff6600);
        text-shadow: 0 0 10px var(--level-4, #ff6600);
        box-shadow: 
          0 0 15px var(--level-4, #ff6600),
          inset 0 0 15px rgba(255, 102, 0, 0.1);
      }

      .level-btn[data-level="5"]:hover,
      .level-btn[data-level="5"].active {
        border-color: var(--level-5, #ff0044);
        color: var(--level-5, #ff0044);
        text-shadow: 0 0 10px var(--level-5, #ff0044);
        box-shadow: 
          0 0 15px var(--level-5, #ff0044),
          inset 0 0 15px rgba(255, 0, 68, 0.1);
      }

      /* Level 5 Danger Mode - Red Pulsing Border */
      .level-btn[data-level="5"].active {
        animation: dangerPulse 1.5s ease-in-out infinite;
      }

      @keyframes dangerPulse {
        0%, 100% {
          border-color: var(--level-5, #ff0044);
          box-shadow: 
            0 0 15px var(--level-5, #ff0044),
            inset 0 0 15px rgba(255, 0, 68, 0.1);
        }
        50% {
          border-color: #ff4477;
          box-shadow: 
            0 0 25px #ff4477,
            inset 0 0 25px rgba(255, 68, 119, 0.2);
        }
      }

      @media (max-width: 600px) {
        .level-buttons {
          flex-direction: column;
          align-items: center;
        }
        
        .level-btn {
          min-width: 180px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Set up event listeners for level buttons
   */
  private setupEventListeners(): void {
    if (!this.selectorEl) return;

    const buttons = this.selectorEl.querySelectorAll('.level-btn');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const level = parseInt(target.dataset.level || '1') as Level;
        
        if (level) {
          this.selectLevel(level);
        }
      });
    });
  }

  /**
   * Select a level
   */
  private selectLevel(level: Level): void {
    // Update difficulty manager
    this.difficultyManager.setLevel(level);
    
    // Update UI
    this.updateActiveButton(level);
    
    // Notify callback
    if (this.onLevelChange) {
      this.onLevelChange(level);
    }
  }

  /**
   * Update the active button styling
   */
  private updateActiveButton(activeLevel: Level): void {
    if (!this.selectorEl) return;

    const buttons = this.selectorEl.querySelectorAll('.level-btn');
    buttons.forEach(button => {
      const buttonLevel = parseInt((button as HTMLElement).dataset.level || '1') as Level;
      if (buttonLevel === activeLevel) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  /**
   * Set callback for level changes
   */
  onLevelChangeCallback(callback: LevelChangeCallback): void {
    this.onLevelChange = callback;
  }

  /**
   * Get level color for a specific level
   */
  private getLevelColor(level: Level): string {
    switch (level) {
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
   * Reset to default level
   */
  reset(): void {
    this.selectLevel(1);
  }

  /**
   * Update level display based on score progression
   */
  updateLevelDisplay(currentLevel: Level): void {
    this.updateActiveButton(currentLevel);
  }
}
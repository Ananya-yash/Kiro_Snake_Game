import { Direction } from './types.js';

export type InputCallback = (direction: Direction) => void;
export type GameControlCallback = (action: 'pause' | 'restart' | 'start') => void;

export class InputHandler {
  private directionCallback?: InputCallback;
  private gameControlCallback?: GameControlCallback;
  private isListening: boolean = false;

  constructor() {
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  /**
   * Start listening for keyboard input
   */
  startListening(): void {
    if (this.isListening) return;
    
    document.addEventListener('keydown', this.handleKeyPress);
    this.isListening = true;
  }

  /**
   * Stop listening for keyboard input
   */
  stopListening(): void {
    if (!this.isListening) return;
    
    document.removeEventListener('keydown', this.handleKeyPress);
    this.isListening = false;
  }

  /**
   * Set callback for direction changes
   */
  onDirectionChange(callback: InputCallback): void {
    this.directionCallback = callback;
  }

  /**
   * Set callback for game control actions
   */
  onGameControl(callback: GameControlCallback): void {
    this.gameControlCallback = callback;
  }

  /**
   * Handle keyboard events
   */
  private handleKeyPress(event: KeyboardEvent): void {
    const key = event.key.toLowerCase();
    
    // Prevent default behavior for game keys
    if (this.isGameKey(key)) {
      event.preventDefault();
    }

    // Handle direction input
    const direction = this.keyToDirection(key);
    if (direction && this.directionCallback) {
      this.directionCallback(direction);
      return;
    }

    // Handle game control input
    const gameAction = this.keyToGameAction(key);
    if (gameAction && this.gameControlCallback) {
      this.gameControlCallback(gameAction);
    }
  }

  /**
   * Convert keyboard input to direction
   */
  private keyToDirection(key: string): Direction | null {
    const keyMap: Record<string, Direction> = {
      // Arrow keys
      'arrowup': Direction.UP,
      'arrowdown': Direction.DOWN,
      'arrowleft': Direction.LEFT,
      'arrowright': Direction.RIGHT,
      
      // WASD keys
      'w': Direction.UP,
      's': Direction.DOWN,
      'a': Direction.LEFT,
      'd': Direction.RIGHT
    };

    return keyMap[key] || null;
  }

  /**
   * Convert keyboard input to game control action
   */
  private keyToGameAction(key: string): 'pause' | 'restart' | 'start' | null {
    const actionMap: Record<string, 'pause' | 'restart' | 'start'> = {
      ' ': 'pause',      // Spacebar for pause/start
      'escape': 'pause', // Escape for pause
      'r': 'restart',    // R for restart
      'enter': 'start'   // Enter for start
    };

    return actionMap[key] || null;
  }

  /**
   * Check if a key is used by the game
   */
  private isGameKey(key: string): boolean {
    const gameKeys = [
      'arrowup', 'arrowdown', 'arrowleft', 'arrowright',
      'w', 'a', 's', 'd', ' ', 'escape', 'r', 'enter'
    ];
    
    return gameKeys.includes(key);
  }

  /**
   * Get human-readable key names for UI display
   */
  static getControlsText(): string {
    return 'Use ARROW KEYS or WASD to move • SPACE to pause/resume • R to restart';
  }
}
// Main entry point for Snake Arena
import { GameController } from './gameController.js';

console.log('Snake Arena - Neon Retro Edition');
console.log('Initializing game...');

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;
  
  if (!canvas) {
    console.error('Canvas element not found!');
    return;
  }

  // Create and start the game controller
  const game = new GameController(canvas);
  
  console.log('Game initialized! Press SPACE to start.');
  
  // Make game controller available globally for debugging
  (window as any).game = game;
});
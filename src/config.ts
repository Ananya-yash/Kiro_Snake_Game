// Game configuration constants

export const CONFIG = {
  GRID_SIZE: 20,
  CELL_SIZE: 30,
  TICK_RATE: 150, // milliseconds per game update
  INITIAL_SNAKE_LENGTH: 3,
  SCORE_INCREMENT: 50, // Points awarded per food collection
  
  LEVEL_CONFIG: [
    {
      level: 1,
      aiMoveDelay: 4, // AI moves every 4 frames
      aiIntelligence: 0.7, // 70% chance of using BFS
      label: 'Level 1',
      description: 'Learning Mode - Slow AI',
      scoreThreshold: 0
    },
    {
      level: 2,
      aiMoveDelay: 3, // AI moves every 3 frames
      aiIntelligence: 0.8, // 80% chance of using BFS
      label: 'Level 2',
      description: 'Warming Up - Moderate AI',
      scoreThreshold: 500
    },
    {
      level: 3,
      aiMoveDelay: 2, // AI moves every 2 frames
      aiIntelligence: 0.9, // 90% chance of using BFS
      label: 'Level 3',
      description: 'Getting Serious - Fast AI',
      scoreThreshold: 1000
    },
    {
      level: 4,
      aiMoveDelay: 1, // AI moves every frame
      aiIntelligence: 0.95, // 95% chance of using BFS
      label: 'Level 4',
      description: 'Expert Mode - Very Fast AI',
      scoreThreshold: 1500
    },
    {
      level: 5,
      aiMoveDelay: 1, // AI moves every frame
      aiIntelligence: 1.0, // 100% BFS logic
      label: 'Level 5',
      description: 'DANGER - Maximum AI',
      scoreThreshold: 2000
    }
  ],
  
  COLORS: {
    PLAYER: '#00ff00',     // Neon green
    AI: '#ffff00',         // Neon yellow  
    FOOD: '#ff00ff',       // Neon magenta
    GRID: '#0a0a0a',       // Dark background
    GRID_LINES: '#1a1a3e', // Subtle grid lines
    LEVEL_1: '#00ff88',    // Light green
    LEVEL_2: '#00ddff',    // Cyan
    LEVEL_3: '#ffaa00',    // Orange
    LEVEL_4: '#ff6600',    // Deep orange
    LEVEL_5: '#ff0044'     // Red (Danger)
  },
  
  CANVAS: {
    WIDTH: 600,
    HEIGHT: 600
  }
} as const;

export type LevelConfig = typeof CONFIG.LEVEL_CONFIG[number];
export type Level = 1 | 2 | 3 | 4 | 5;
# Snake Arena Design Document

## Overview

The Snake Arena is a browser-based game built with HTML5, CSS3, and JavaScript (or TypeScript). It features a 20x20 grid where two snakes compete: a player-controlled green snake and an AI-controlled yellow snake that uses BFS pathfinding. The game employs a 90s neon-retro aesthetic with glowing effects, vibrant colors, and retro typography.

The architecture separates concerns into distinct modules: game state management, rendering, input handling, AI pathfinding, and collision detection. This modular approach ensures maintainability and testability.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Game Controller                      │
│  (Main game loop, state management, coordination)       │
└─────────────────────────────────────────────────────────┘
           │              │              │
           ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  Input   │   │   Game   │   │ Renderer │
    │ Handler  │   │  State   │   │          │
    └──────────┘   └──────────┘   └──────────┘
                          │
           ┌──────────────┼──────────────┐
           ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐   ┌──────────┐
    │  Snake   │   │   Food   │   │Collision │
    │  Logic   │   │ Manager  │   │ Detector │
    └──────────┘   └──────────┘   └──────────┘
           │
           ▼
    ┌──────────┐
    │   BFS    │
    │Pathfinder│
    └──────────┘
```

### Technology Stack

- **Frontend**: HTML5 Canvas for rendering
- **Language**: TypeScript for type safety
- **Styling**: CSS3 with custom properties for neon effects
- **Build Tool**: Vite for fast development and bundling
- **Testing**: Vitest for unit tests, fast-check for property-based testing

## Components and Interfaces

### 1. Grid System

```typescript
interface Position {
  x: number;
  y: number;
}

interface Grid {
  width: number;
  height: number;
  isValidPosition(pos: Position): boolean;
  isEmpty(pos: Position): boolean;
}
```

The grid is a 20x20 coordinate system where (0,0) is the top-left corner.

### 2. Snake Component

```typescript
enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT
}

interface Snake {
  body: Position[];
  direction: Direction;
  color: string;
  isAlive: boolean;
  grow(): void;
  move(): void;
  getHead(): Position;
  contains(pos: Position): boolean;
}
```

Each snake maintains an ordered array of positions representing its body segments. The first element is the head, and the last is the tail.

### 3. BFS Pathfinder

```typescript
interface PathNode {
  position: Position;
  parent: PathNode | null;
}

interface Pathfinder {
  findPath(
    start: Position,
    goal: Position,
    obstacles: Position[]
  ): Position[] | null;
}
```

The BFS algorithm explores the grid level by level, ensuring the shortest path is found. It treats snake bodies and walls as obstacles.

### 4. Food Manager

```typescript
interface Food {
  position: Position;
  spawn(occupiedCells: Position[]): void;
}
```

Food spawns randomly in empty cells and respawns when collected.

### 5. Collision Detector

```typescript
interface CollisionResult {
  hasCollision: boolean;
  type: 'wall' | 'self' | 'other' | 'clash' | 'none';
  winner?: 'player' | 'ai' | 'tie';
}

interface CollisionDetector {
  checkCollision(snake: Snake, otherSnake: Snake, grid: Grid): CollisionResult;
  checkApexPredatorClash(snake1: Snake, snake2: Snake): CollisionResult;
}
```

## COLLISION_RULES

### Clash Resolution (Apex Predator Logic)

**Clash Event Definition:**
- A clash occurs when a snake's head touches any part of the rival snake's body or head
- This includes head-to-head collisions and head-to-body collisions
- Clash detection takes priority over other collision types

**Resolution Algorithm:**
1. **Length Comparison**: Compare `snakeA.body.length` and `snakeB.body.length`
2. **Winner Determination**:
   - **Longer Snake Wins**: The snake with more body segments survives and continues moving
   - **Shorter Snake Loses**: The snake with fewer segments is destroyed (triggers Game Over or Reset)
   - **Equal Length Draw**: If lengths are identical, both snakes are destroyed simultaneously

**Clash Outcomes:**
- **Winner**: Continues normal gameplay, gains score bonus for defeating rival
- **Loser**: Immediately stops moving, triggers game over state for that snake
- **Draw**: Both snakes stop, game ends in tie state

**Power Balance Mechanics:**
- The longer snake is considered the "Apex Predator" and gains aggressive advantages
- Length difference of +2 or more segments grants "Hunting Mode" to the longer snake
- Equal or disadvantaged length triggers "Evasive Mode" for defensive play

### 6. Game State

```typescript
interface GameState {
  playerSnake: Snake;
  aiSnake: Snake;
  food: Food;
  grid: Grid;
  score: { player: number; ai: number };
  gameStatus: 'playing' | 'paused' | 'gameOver';
  winner: 'player' | 'ai' | 'tie' | null;
}
```

### 7. Renderer

```typescript
interface Renderer {
  renderGrid(grid: Grid): void;
  renderSnake(snake: Snake): void;
  renderFood(food: Food): void;
  renderUI(state: GameState): void;
  applyNeonEffects(): void;
}
```

The renderer uses HTML5 Canvas with shadow effects and gradients to create the neon glow aesthetic.

## Data Models

### Position

Represents a coordinate on the grid:
- `x`: Column index (0-19)
- `y`: Row index (0-19)

### Snake

- `body`: Array of positions from head to tail
- `direction`: Current movement direction
- `color`: Visual color (green for player, yellow for AI)
- `isAlive`: Whether the snake is still in play
- `pendingGrowth`: Number of segments to add on next move

### Food

- `position`: Current location on the grid
- `value`: Points awarded when collected (default: 1)

### Game Configuration

```typescript
const CONFIG = {
  GRID_SIZE: 20,
  CELL_SIZE: 25,
  TICK_RATE: 150, // milliseconds per game update
  INITIAL_SNAKE_LENGTH: 3,
  SCORE_INCREMENT: 50, // Points awarded per food collection
  DIFFICULTY_SETTINGS: {
    BEGINNER: {
      aiMoveInterval: 3, // AI moves every 3 frames
      randomMoveChance: 0.2, // 20% chance of random move
      label: 'Beginner',
      description: 'Slow AI with occasional random moves'
    },
    MODERATE: {
      aiMoveInterval: 2, // AI moves every 2 frames
      randomMoveChance: 0, // 100% BFS logic
      label: 'Moderate', 
      description: 'Medium speed AI with perfect pathfinding'
    },
    EXTREME: {
      aiMoveInterval: 1, // AI moves every frame
      randomMoveChance: 0, // 100% BFS logic
      label: 'Extreme',
      description: 'Maximum speed AI with perfect pathfinding'
    }
  },
  COLORS: {
    PLAYER: '#00ff00', // Neon green
    AI: '#ffff00',     // Neon yellow
    FOOD: '#ff00ff',   // Neon magenta
    GRID: '#0a0a0a',   // Dark background
    GRID_LINES: '#1a1a3e' // Subtle grid lines
  }
};
```

## Difficulty Manager Logic

The DifficultyManager implements a sophisticated AI throttling system that adjusts the competitive balance based on player skill level preferences.

### Core Difficulty Mechanics

**AI Move Tick Dependency:**
- The AI opponent's movement frequency is now dependent on the selected difficulty level
- Each difficulty level defines an `aiMoveInterval` that controls how often the AI snake updates its position
- This creates a natural skill progression from beginner-friendly to expert-level gameplay

**Difficulty Level Specifications:**

**BEGINNER Level:**
- AI moves every 3 game frames (33% speed)
- 20% chance of random movement instead of optimal BFS pathfinding
- Designed for new players learning game mechanics
- Provides forgiving gameplay with predictable AI behavior

**MODERATE Level:**
- AI moves every 2 game frames (50% speed)
- 100% BFS pathfinding logic (no random moves)
- Balanced difficulty for intermediate players
- Maintains strategic challenge while remaining manageable

**EXTREME Level:**
- AI moves every game frame (100% speed)
- 100% BFS pathfinding with optimal decision-making
- Maximum difficulty for expert players
- Provides intense competitive gameplay requiring advanced strategies

### DifficultyManager Implementation

**Move Throttling Logic:**
- Frame counter tracks game ticks since last AI move
- AI movement only executes when `frameCounter % aiMoveInterval === 0`
- Ensures consistent timing regardless of game performance

**Random Move Integration:**
- When `randomMoveChance` is active, AI occasionally ignores BFS pathfinding
- Random moves are still validated for safety (no immediate collisions)
- Adds unpredictability to beginner mode while maintaining basic collision avoidance

**Dynamic Difficulty Switching:**
- Players can change difficulty levels during gameplay
- Difficulty changes take effect immediately without requiring game restart
- UI provides clear feedback about current difficulty and its effects

## Progression Logic

The game implements a dynamic 5-level progression system that automatically advances difficulty based on player performance, creating an escalating challenge that adapts to player skill development.

### Level Configuration System

**5-Level Progression Structure:**
- **Level 1**: Learning Mode (aiMoveDelay: 4, aiIntelligence: 0.7) - Threshold: 0 points
- **Level 2**: Warming Up (aiMoveDelay: 3, aiIntelligence: 0.8) - Threshold: 500 points  
- **Level 3**: Getting Serious (aiMoveDelay: 2, aiIntelligence: 0.9) - Threshold: 1000 points
- **Level 4**: Expert Mode (aiMoveDelay: 1, aiIntelligence: 0.95) - Threshold: 1500 points
- **Level 5**: DANGER Mode (aiMoveDelay: 1, aiIntelligence: 1.0) - Threshold: 2000 points

### Automatic Progression Mechanics

**Score-Based Advancement:**
- The system continuously monitors player score against level thresholds
- When a player reaches a score threshold, the level automatically advances
- Level progression is immediate and affects AI behavior in real-time
- Players cannot regress to lower levels during a game session

**Manual Level Selection:**
- Players can manually select any level through the Level Selector UI
- Manual selection overrides automatic progression temporarily
- Automatic progression resumes based on current score when manually selected level is reached

### AI Scaling Logic

**Move Delay Progression:**
- AI response time decreases from 4 frames (Level 1) to 1 frame (Levels 4-5)
- Creates smooth difficulty curve from beginner-friendly to expert-level gameplay
- Maintains consistent game feel while increasing challenge intensity

**Intelligence Scaling:**
- AI decision-making quality improves from 70% optimal (Level 1) to 100% optimal (Level 5)
- Lower levels include strategic randomness to provide learning opportunities
- Higher levels use pure BFS pathfinding for maximum competitive challenge

### Visual Feedback System

**Level 5 Danger Mode:**
- Red pulsing border effect around game canvas
- Enhanced visual warning system for maximum difficulty
- Distinct aesthetic feedback for reaching peak challenge level

**UI Integration:**
- Real-time level display with color-coded progression indicators
- Progress tracking toward next level threshold
- Immediate visual feedback for level advancement events

### Performance Balancing

**Threshold Calibration:**
- 500-point intervals provide achievable yet meaningful progression goals
- Balanced to encourage continued play while maintaining challenge escalation
- Designed to accommodate varying player skill levels and learning curves

**Adaptive Challenge:**
- Early levels focus on learning game mechanics with forgiving AI behavior
- Mid levels introduce strategic depth with balanced AI competition  
- Final levels provide intense competitive gameplay for experienced players

## Scoring Logic

The scoring system implements a dynamic point-based reward mechanism that enhances competitive gameplay between the player and AI opponent.

### Core Scoring Rules

**Food Collection Scoring:**
- When a snake's head occupies the same coordinate as a food item, the score increases by `SCORE_INCREMENT` (50 points)
- Both player and AI snakes follow identical scoring rules for fair competition
- Score updates occur immediately upon food collision detection

**Score State Management:**
- Each snake maintains an independent score counter
- Scores persist throughout the game session until reset
- Score display updates in real-time with neon glow effects

**Performance Tracking:**
- Score serves as the primary performance metric for both snakes
- Higher scores indicate more successful food collection
- Final scores determine winner in competitive scenarios

**UI Integration:**
- Scores are displayed with retro neon styling consistent with the 90s aesthetic
- Real-time score updates provide immediate feedback
- Score information is accessible to AI commentary systems for performance analysis

## 
## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After analyzing all acceptance criteria, several properties can be consolidated to eliminate redundancy:

- Properties 1.3 and 2.5 (snake growth on food collection) can be combined into a single comprehensive property
- Properties 4.1, 4.2, and 4.3 (collision detection) can be combined into one comprehensive collision detection property
- Properties 6.1 and 6.2 (UI display of snake data) can be combined into one UI data consistency property

### Core Properties

**Property 1: Input direction mapping**
*For any* valid keyboard input (arrow keys or WASD), the player snake's direction should change to correspond with the pressed key
**Validates: Requirements 1.1**

**Property 2: Snake movement updates position**
*For any* snake in any valid state, when the snake moves, its head position should update according to its current direction
**Validates: Requirements 1.2**

**Property 3: Food collection increases snake length**
*For any* snake that collects food, the snake's length should increase by exactly one segment
**Validates: Requirements 1.3, 2.5**

**Property 4: Comprehensive collision detection**
*For any* snake position and game state, collision detection should correctly identify wall collisions, self-collisions, and inter-snake collisions
**Validates: Requirements 1.4, 1.5, 4.1, 4.2, 4.3**

**Property 5: BFS finds shortest collision-free path**
*For any* grid configuration with obstacles, the BFS algorithm should return the shortest path to the target that avoids all obstacles, or null if no path exists
**Validates: Requirements 2.2, 2.4**

**Property 6: AI targets closest accessible food**
*For any* game state with multiple food items, the AI snake should target the food item with the shortest accessible path distance
**Validates: Requirements 2.3**

**Property 7: Food spawns in empty cells only**
*For any* food spawn event, the new food position should be in a cell that is not occupied by any snake segment
**Validates: Requirements 3.2, 3.5**

**Property 8: Food rendering has distinct styling**
*For any* food item position, the rendered food should have visual properties that distinguish it from snakes and background
**Validates: Requirements 3.4**

**Property 9: Snake color consistency**
*For any* rendering operation, the player snake should always render in green and the AI snake should always render in yellow
**Validates: Requirements 5.2**

**Property 10: Collision stops movement immediately**
*For any* collision event, the affected snake(s) should stop moving and the game state should reflect the collision
**Validates: Requirements 4.4, 4.5**

**Property 11: UI displays accurate game data**
*For any* game state, the displayed snake lengths and scores should match the actual values in the game state
**Validates: Requirements 6.1, 6.2**

**Property 12: Game end state display**
*For any* game ending scenario, the UI should correctly display the winner or tie status based on the final game state
**Validates: Requirements 6.3**

**Property 13: Pause state display**
*For any* paused game state, the UI should clearly indicate the paused status
**Validates: Requirements 6.4**

**Property 14: Consistent timing intervals**
*For any* sequence of game updates, the time intervals between updates should remain within acceptable variance
**Validates: Requirements 7.1**

**Property 15: Input response timing**
*For any* valid keyboard input, the snake's direction should change within one game tick
**Validates: Requirements 7.2**

**Property 16: BFS performance constraint**
*For any* pathfinding request, the BFS algorithm should complete within the game tick duration
**Validates: Requirements 7.3**

## Error Handling

### Input Validation
- Invalid key presses are ignored
- Direction changes that would cause immediate self-collision are prevented
- Out-of-bounds positions are treated as wall collisions

### Game State Errors
- Grid full condition prevents food spawning and triggers game end
- Invalid snake positions reset to last valid state
- Corrupted game state triggers restart

### AI Pathfinding Errors
- No path available: AI snake maintains current direction
- Pathfinding timeout: AI uses fallback simple movement
- Invalid target: AI targets alternative food or moves randomly

### Rendering Errors
- Canvas context loss: Attempt to restore and continue
- Invalid positions: Skip rendering problematic elements
- Performance degradation: Reduce visual effects if needed

## Testing Strategy

### Unit Testing Framework
- **Framework**: Vitest for fast, modern JavaScript/TypeScript testing
- **Coverage**: All core game logic functions and classes
- **Focus Areas**:
  - Snake movement and growth logic
  - Collision detection algorithms
  - Food spawning and management
  - Input handling and validation
  - Game state transitions

### Property-Based Testing Framework
- **Framework**: fast-check for TypeScript property-based testing
- **Configuration**: Minimum 100 iterations per property test
- **Generator Strategy**: Smart generators that create valid game states and constrain inputs to realistic scenarios

### Property-Based Test Requirements
- Each correctness property must be implemented as a single property-based test
- Tests must be tagged with comments referencing the design document property
- Tag format: `**Feature: snake-arena, Property {number}: {property_text}**`
- Tests should use realistic data generators that respect game constraints

### Test Data Generation
- **Grid Generator**: Creates valid 20x20 grid configurations
- **Snake Generator**: Creates snakes with valid body configurations
- **Position Generator**: Creates positions within grid boundaries
- **Game State Generator**: Creates consistent game states with valid snake and food positions

### Integration Testing
- End-to-end game flow testing
- AI vs Player interaction scenarios
- Performance testing under various load conditions
- Cross-browser compatibility testing

### Testing Priorities
1. **Critical Path**: Snake movement, collision detection, food collection
2. **AI Behavior**: BFS pathfinding accuracy and performance
3. **Game Rules**: Scoring, win conditions, game state management
4. **User Interface**: Input responsiveness, visual feedback
5. **Edge Cases**: Full grid, no valid moves, rapid input changes

The dual testing approach ensures both specific functionality (unit tests) and general correctness across all inputs (property tests) are validated, providing comprehensive coverage for this interactive game system.
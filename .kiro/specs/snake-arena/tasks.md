# Implementation Plan

- [x] 1. Set up project structure and development environment


  - Create HTML5 Canvas-based project structure with TypeScript
  - Configure Vite build system for fast development
  - Set up Vitest testing framework and fast-check for property-based testing
  - Create basic HTML structure with canvas element
  - _Requirements: 7.1, 7.4_

- [ ]* 1.1 Write property test for project setup validation
  - **Property 14: Consistent timing intervals**
  - **Validates: Requirements 7.1**



- [x] 2. Implement core data structures and grid system

  - Create Position interface and Grid class with 20x20 dimensions
  - Implement grid validation methods (isValidPosition, isEmpty)
  - Create Direction enum and basic coordinate system
  - _Requirements: 1.2, 4.1_

- [x]* 2.1 Write property test for grid system


  - **Property 2: Snake movement updates position**
  - **Validates: Requirements 1.2**


- [ ] 3. Implement Snake class and basic movement
  - Create Snake class with body array, direction, and color properties
  - Implement basic movement logic (move, grow, getHead methods)
  - Add snake validation methods (contains, isAlive)
  - _Requirements: 1.1, 1.2, 1.3_

- [ ]* 3.1 Write property test for snake movement
  - **Property 2: Snake movement updates position**
  - **Validates: Requirements 1.2**



- [ ]* 3.2 Write property test for food collection growth
  - **Property 3: Food collection increases snake length**
  - **Validates: Requirements 1.3, 2.5**


- [ ] 4. Implement collision detection system
  - Create CollisionDetector class with comprehensive collision checking
  - Implement wall collision detection for grid boundaries
  - Add self-collision detection for snake body intersections
  - Add inter-snake collision detection between player and AI snakes
  - _Requirements: 1.4, 1.5, 4.1, 4.2, 4.3, 4.4_

- [ ]* 4.1 Write property test for collision detection
  - **Property 4: Comprehensive collision detection**
  - **Validates: Requirements 1.4, 1.5, 4.1, 4.2, 4.3**

- [ ]* 4.2 Write property test for collision response
  - **Property 10: Collision stops movement immediately**
  - **Validates: Requirements 4.4, 4.5**

- [x] 5. Implement BFS pathfinding algorithm for AI


  - Create Pathfinder class with BFS implementation
  - Implement PathNode structure for path reconstruction
  - Add obstacle avoidance logic for snake bodies and walls
  - Optimize pathfinding performance for real-time gameplay
  - _Requirements: 2.2, 2.4, 7.3_

- [ ]* 5.1 Write property test for BFS pathfinding
  - **Property 5: BFS finds shortest collision-free path**
  - **Validates: Requirements 2.2, 2.4**

- [ ]* 5.2 Write property test for BFS performance
  - **Property 16: BFS performance constraint**
  - **Validates: Requirements 7.3**



- [ ] 6. Implement AI snake logic and target selection
  - Create AI controller that uses BFS pathfinding
  - Implement closest food targeting algorithm
  - Add fallback behavior for when no path is available


  - Integrate AI decision-making with game loop

  - _Requirements: 2.1, 2.3, 2.5_

- [ ]* 6.1 Write property test for AI target selection
  - **Property 6: AI targets closest accessible food**
  - **Validates: Requirements 2.3**

- [ ] 7. Implement food management system
  - Create Food class with position and spawning logic
  - Implement random food spawning in empty cells
  - Add food collection detection and respawning




  - Handle edge case of full grid condition
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ]* 7.1 Write property test for food spawning
  - **Property 7: Food spawns in empty cells only**
  - **Validates: Requirements 3.2, 3.5**

- [ ] 8. Implement input handling system
  - Create InputHandler class for keyboard event processing
  - Map arrow keys and WASD to direction changes
  - Prevent invalid direction changes (immediate reversals)
  - Ensure responsive input processing within game tick
  - _Requirements: 1.1, 7.2_



- [ ]* 8.1 Write property test for input direction mapping
  - **Property 1: Input direction mapping**
  - **Validates: Requirements 1.1**

- [ ]* 8.2 Write property test for input response timing
  - **Property 15: Input response timing**
  - **Validates: Requirements 7.2**

- [ ] 9. Checkpoint - Ensure all core logic tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Implement game state management
  - Create GameState class with all game entities and status
  - Implement game initialization and reset functionality
  - Add score tracking and win condition detection
  - Handle game over states and transitions
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x]* 10.1 Write property test for game data accuracy


  - **Property 11: UI displays accurate game data**
  - **Validates: Requirements 6.1, 6.2**

- [ ]* 10.2 Write property test for game end state
  - **Property 12: Game end state display**
  - **Validates: Requirements 6.3**

- [ ]* 10.3 Write property test for pause state
  - **Property 13: Pause state display**
  - **Validates: Requirements 6.4**

- [ ] 11. Implement HTML5 Canvas renderer
  - Create Renderer class for Canvas-based drawing
  - Implement grid rendering with coordinate system
  - Add snake rendering with distinct colors (green/yellow)
  - Implement food rendering with visual distinction
  - _Requirements: 3.4, 5.2_




- [ ]* 11.1 Write property test for food rendering
  - **Property 8: Food rendering has distinct styling**
  - **Validates: Requirements 3.4**

- [ ]* 11.2 Write property test for snake color consistency
  - **Property 9: Snake color consistency**
  - **Validates: Requirements 5.2**

- [ ] 12. Implement 90s neon-retro visual styling
  - Create CSS styles with neon color palette and glow effects
  - Add retro typography and visual effects
  - Implement glowing borders and shadow effects for game elements
  - Apply dark background with bright neon accents
  - _Requirements: 5.1, 5.3, 5.4, 5.5_

- [ ] 13. Implement game controller and main loop
  - Create GameController class to coordinate all systems
  - Implement consistent game loop with configurable tick rate
  - Integrate input handling, AI logic, collision detection, and rendering
  - Add game state transitions and event handling
  - _Requirements: 7.1, 7.4_

- [ ] 14. Implement UI status display
  - Add score display for both snakes
  - Show current snake lengths
  - Display game status (playing, paused, game over)
  - Show winner announcement on game end
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 14.1 Create dynamic scoring system
  - Update GameController to maintain score state using SCORE_INCREMENT (50 points)
  - Implement collision logic to update score when snake head occupies food coordinate
  - Create ScoreDisplay component with neon glow aesthetic
  - Integrate score data with ReasoningSidebar for AI performance commentary
  - _Requirements: 6.1, 6.2_

- [ ] 14.2 Implement 5-level progression system
  - Refactor LevelSelector UI component with neon buttons (Level 1-5)
  - Update GameController to dynamically adjust AI speed and BFS logic based on current level
  - Implement automatic level progression based on score thresholds (every 500 points)
  - Add red pulsing border effect for Level 5 "Danger" mode
  - Update collision logic to use SCORE_INCREMENT of 50 points
  - _Requirements: 2.1, 2.2, 6.1_

- [ ] 15. Add game controls and interaction
  - Implement pause/resume functionality
  - Add game restart capability
  - Create start screen and game over screen
  - Add keyboard shortcuts for game controls
  - _Requirements: 6.4_

- [ ] 16. Performance optimization and error handling
  - Optimize rendering performance for smooth 60fps gameplay
  - Add error handling for edge cases (full grid, invalid states)
  - Implement graceful degradation for performance issues
  - Add input validation and sanitization
  - _Requirements: 3.3, 7.1, 7.4_

- [ ] 17. Final integration and testing
  - Integrate all components into complete game
  - Test full gameplay scenarios with both snakes
  - Verify AI behavior and pathfinding performance
  - Validate visual styling and neon effects
  - _Requirements: All_

- [ ] 19. Implement 5-level progression system
  - Update CONFIG with LEVEL_CONFIG array (5 levels with aiMoveDelay 4→1, aiIntelligence scaling)
  - Refactor DifficultyManager for level-based system with automatic progression logic
  - Update LevelSelector for 5-level UI with Level 1-5 buttons and danger mode styling
  - Update GameController with score threshold progression and Level 5 red border pulsing
  - Add ProgressionLogic section to design.md
  - _Requirements: 2.1, 2.2, 6.1_

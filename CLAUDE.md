# Sheeps & Kittens

BaghChal (Nepali board game) re-themed: goats → sheeps (🐑), tigers → kittens (🐱).

## Tech Stack
- Expo SDK 55, React Native 0.83, React 19, TypeScript 5.9
- `react-native-safe-area-context` ~5.6.2 — always use `SafeAreaView` from this package (not from `react-native`)
- `expo-av` — audio playback
- `expo-haptics` — haptic feedback
- `expo-updates` — OTA updates
- `react-native-web` — web target support

## Project Structure
```
src/
├── engine/
│   ├── types.ts              - Type definitions (Piece, Turn, GameState, GameConfig, etc.)
│   ├── constants.ts          - Game constants (BOARD_SIZE, TOTAL_SHEEP, SHEEP_TO_WIN)
│   ├── boardOps.ts           - Board operations (adjacency, captures, valid moves)
│   ├── gameEngine.ts         - Game state transitions (handleTap, applyMove, forfeit)
│   │                           Also re-exports types/constants/boardOps for convenience
│   └── aiEngine.ts           - AI opponent (minimax + alpha-beta pruning)
├── components/
│   ├── Board.tsx             - Board container (layout, piece diffing)
│   ├── BoardCell.tsx         - Individual cell (piece rendering, animations)
│   ├── BoardLines.tsx        - Grid and diagonal line rendering
│   ├── GameScreen.tsx        - Game screen (scores, status, phase indicator)
│   ├── MiniBoard.tsx         - Animated mini board for tutorial
│   ├── Pieces.tsx            - SheepPiece and KittenPiece SVG-like components
│   ├── WinModal.tsx          - Victory modal overlay
│   ├── WelcomeScreen.tsx     - Welcome screen with rules and mode selection
│   ├── TutorialScreen.tsx    - Step-by-step tutorial navigation
│   ├── tutorialData.ts       - Tutorial step definitions and animation configs
│   └── AssetPreview.tsx      - Dev-only piece preview at multiple sizes
├── hooks/
│   ├── useGameEvents.ts      - Game event detection (sounds, haptics, animations)
│   └── useAIPlayer.ts        - AI move orchestration and thinking pulse
├── utils/
│   ├── boardLayout.ts        - Shared board dimensions (cell size, piece size)
│   ├── haptics.ts            - Haptic feedback (expo-haptics wrapper)
│   └── sounds.ts             - Sound playback (expo-av wrapper)
└── theme.ts                  - Centralized color palette
App.tsx                       - Root with SafeAreaProvider and screen navigation
```

## Game Rules (quick ref)
- 5x5 board, diagonals exist only where (row + col) is even
- 4 kittens start at corners, 20 sheeps placed one per turn
- Kittens capture by jumping over adjacent sheep to empty space
- Kittens win: capture 5 sheeps. Sheeps win: block all kittens.
- Two phases: Placement (place sheeps) → Movement (move pieces)

## Safe Area
`App.tsx` wraps the entire app in `<SafeAreaProvider>`. All screen components use `<SafeAreaView>` imported from `react-native-safe-area-context` — never from `react-native`.

## Agent Team
When building features or making significant changes, follow the blueprint in `AGENT_TEAM.md`:
- **Research agent** (general-purpose, opus) — spawn before implementing unfamiliar logic
- **Code auditor** (general-purpose, sonnet) — spawn after writing game logic, before building UI on top
- Main thread handles all file writing, builds, and integration

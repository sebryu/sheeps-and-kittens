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
src/engine/gameEngine.ts      - Game logic (adjacency, moves, captures, win conditions)
src/components/Board.tsx      - Board rendering (grid, diagonals, pieces, touch input)
src/components/GameScreen.tsx - Game screen (scores, status, win modal)
src/components/WelcomeScreen.tsx  - Welcome screen with rules and animations
src/components/TutorialScreen.tsx - Interactive step-by-step tutorial
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

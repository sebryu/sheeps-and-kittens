## Summary

<!-- What does this PR do? One or two sentences. -->

## Type of Change

<!-- Check all that apply. -->

- [ ] Game logic change (`src/engine/gameEngine.ts`)
- [ ] AI engine change (`src/engine/aiEngine.ts`)
- [ ] Board rendering change (`src/components/Board.tsx`)
- [ ] Screen / UI change (`src/components/GameScreen.tsx`, `WelcomeScreen.tsx`, `TutorialScreen.tsx`)
- [ ] Piece rendering change (`src/components/Pieces.tsx`)
- [ ] Utility change (`src/utils/haptics.ts`, `src/utils/sounds.ts`)
- [ ] Config / tooling change (`app.json`, `tsconfig.json`, `package.json`, CI)
- [ ] Documentation only

---

## BaghChal Rules Checklist

<!-- Complete this section if your PR touches gameEngine.ts, aiEngine.ts, or Board.tsx. -->
<!-- Skip and write "N/A — UI/docs only" if none of those files changed. -->

- [ ] Diagonal connections are only drawn/computed at positions where `(row + col) % 2 === 0`
- [ ] Kittens start at all 4 corners `[0,0] [0,4] [4,0] [4,4]`; all other cells start EMPTY
- [ ] Sheep placement phase ends exactly when `sheepPlaced === 20` (not 19, not 21)
- [ ] Capture: kitty jumps over an adjacent sheep to an empty cell; both the source and the intermediate cell must satisfy the diagonal rule for diagonal jumps
- [ ] Kittens win when `sheepCaptured >= 5`
- [ ] Sheeps win when all kittens have zero valid moves (blocked)
- [ ] Kittens also win on stalemate: all sheeps have zero moves in MOVEMENT phase
- [ ] Forfeit assigns `winner` to the opponent and sets `forfeitedBy` to the forfeiting player
- [ ] `handleTap()` and `applyMove()` both check win conditions (they are separate code paths)

---

## TypeScript / Code Quality

- [ ] `tsc --noEmit` passes locally with zero errors
- [ ] No `any` types introduced (unless justified by a comment)
- [ ] New state mutations: board is always shallow-copied with `state.board.map(r => [...r])`
- [ ] New `useEffect` hooks have complete dependency arrays
- [ ] New `useCallback` hooks have complete dependency arrays

---

## UI / Platform Compatibility

<!-- Complete if Board.tsx, GameScreen.tsx, WelcomeScreen.tsx, TutorialScreen.tsx, or Pieces.tsx changed. -->

- [ ] Tested on iOS simulator OR physical iOS device
- [ ] Tested on Android emulator OR physical Android device
- [ ] Tested on web (`expo start --web`) — especially if any `Platform.OS` check was added or removed
- [ ] New animations use `useNativeDriver: true` where applicable
- [ ] Animated loops have cleanup in the `useEffect` return function (no memory leaks)
- [ ] No web-only CSS properties added to React Native StyleSheet (e.g., no `transformOrigin`, no `cursor`)

---

## AI Engine (if aiEngine.ts changed)

- [ ] Evaluation function: positive score favors kittens, negative favors sheeps
- [ ] Terminal states return `+10000` (kitty win) or `-10000` (sheep win)
- [ ] Alpha-beta pruning: maximizing node updates `alpha`, minimizing node updates `beta`
- [ ] Depth values not increased beyond `{ easy: 2, medium: 4, hard: 6 }` without perf testing
- [ ] Move ordering: captures are ordered before non-capture moves

---

## Testing

- [ ] Played a full game as Sheeps in local mode and game reached a normal conclusion
- [ ] Played a full game as Kittens in local mode and game reached a normal conclusion
- [ ] Tested AI mode at the affected difficulty level(s)
- [ ] Verified the win condition(s) relevant to this PR trigger correctly

---

## Screenshots / Screen Recording

<!-- Attach screenshots or a screen recording if the PR has any visual change. -->
<!-- For logic-only PRs this section can be skipped. -->

---

## Notes for Reviewers

<!-- Anything the agent team or human reviewers should know:
     - Known limitations
     - Deliberately skipped rules or patterns
     - Performance trade-offs
     - Follow-up issues filed -->

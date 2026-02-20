# PR Review Agent Team — Sheeps & Kittens

Agent team blueprint for reviewing pull requests against the sheeps-and-kittens BaghChal game
(Expo SDK 54, React Native, TypeScript). Follow this when orchestrating a PR review.

---

## Team Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                      PR REVIEW ORCHESTRATOR                          │
│  (Claude Code main thread, triggered on PR open/sync)                │
│  Responsibilities:                                                   │
│  - Read the PR diff and determine which files changed                │
│  - Decide which specialist agents to spawn (based on diff)           │
│  - Collect and merge agent reports                                   │
│  - Post a single consolidated review comment to the PR               │
│  - Set review state: APPROVE / REQUEST_CHANGES / COMMENT             │
└─────┬──────────────────┬─────────────────┬───────────────┬───────────┘
      │                  │                 │               │
┌─────▼──────┐  ┌────────▼───────┐  ┌─────▼─────┐  ┌─────▼──────────┐
│  AGENT 1   │  │   AGENT 2      │  │  AGENT 3  │  │   AGENT 4      │
│ Game Logic │  │  UI / UX       │  │  Code     │  │  AI Engine     │
│  Auditor   │  │  Reviewer      │  │  Quality  │  │  Reviewer      │
└────────────┘  └────────────────┘  └───────────┘  └────────────────┘
```

---

## Agent 1: Game Logic Auditor

**When to spawn:** PR touches `src/engine/gameEngine.ts` OR `src/components/Board.tsx`
(Board's diagonal-drawing loop must mirror the engine's `hasDiagonals` rule exactly).

**Agent type:** `general-purpose`
**Model:** `opus` (game rule correctness requires deep reasoning; a subtle adjacency bug
corrupts the entire game)

### Prompt Template

```
You are reviewing a pull request for "Sheeps & Kittens" — a re-theme of the
traditional Nepali board game BaghChal (goats → sheeps 🐑, tigers → kittens 🐱).

Read the following changed files from the PR diff:
[PASTE RELEVANT DIFF SECTIONS FOR gameEngine.ts AND/OR Board.tsx]

The current baseline is at src/engine/gameEngine.ts (attach full file for context).

Verify the following against the canonical BaghChal rules:

1. ADJACENCY (hasDiagonals / getNeighbors):
   - Diagonal connections exist ONLY at positions where (row + col) is even.
   - The total edge count on the 5x5 board is 56 (40 orthogonal + 16 diagonal).
   - Key neighbor counts: corner (0,0) → 3 neighbors; center (2,2) → 8 neighbors;
     edge midpoint (0,2) → 5 neighbors.

2. CAPTURE MECHANICS (getCaptureTargets):
   - Kittens capture by jumping over an adjacent sheep to an EMPTY cell behind it.
   - Both the source cell AND the intermediate (sheep) cell must satisfy the diagonal
     rule if the jump is diagonal.
   - Sheeps CANNOT capture — getCaptureTargets must return [] for SHEEP pieces.

3. INITIAL SETUP (createInitialState):
   - 4 kittens at corners: [0,0], [0,4], [4,0], [4,4]. Board otherwise EMPTY.
   - sheepPlaced=0, sheepCaptured=0, turn='SHEEP', phase='PLACEMENT', winner=null.

4. WIN CONDITIONS:
   - Kittens win: sheepCaptured >= 5.
   - Sheeps win: ALL kittens have zero valid moves (checkKittensBlocked).
   - Verify win checks fire in BOTH applyMove() and handleTap() (separate code paths).
   - Forfeit: winner = opponent, forfeitedBy = forfeiting player.

5. PHASE TRANSITION:
   - PLACEMENT → MOVEMENT exactly when sheepPlaced reaches 20 (not 19, not 21).
   - Transition is checked AFTER placement, not before.
   - During PLACEMENT, kittens still move (they are never in "placement mode").

6. TURN ALTERNATION:
   - Every action toggles SHEEP ↔ KITTY.
   - applyMove() must set nextTurn correctly for all move types: place, move, capture.

7. BOARD RENDERING (if Board.tsx changed):
   - Diagonal lines drawn only where hasDiag(r, c) === true [(r + c) % 2 === 0].
   - CELL_SIZE = BOARD_WIDTH / (BOARD_SIZE - 1) = BOARD_WIDTH / 4. Verify unchanged.
   - Hit area: top = row * CELL_SIZE - PIECE_SIZE / 2; left = col * CELL_SIZE - PIECE_SIZE / 2.

Report each finding as:
  [BLOCKER] — Incorrect game rule implementation; must be fixed before merge.
  [WARNING] — Suspicious logic that may cause bugs in specific game states.
  [OK]      — Rule correctly implemented.

Do NOT suggest code edits. Only read and analyze.
```

### Why this agent exists

The diagonal connectivity rule — only where (row + col) is even — is non-obvious and the
most common source of bugs in BaghChal implementations. A missed diagonal breaks adjacency,
captures, and AI search simultaneously. The capture validity check also has two layers
(source *and* mid-point must satisfy the diagonal rule for diagonal jumps) that are easy
to implement only half of.

---

## Agent 2: UI/UX Reviewer

**When to spawn:** PR touches any file in `src/components/**` or `src/utils/**`.

**Agent type:** `general-purpose`
**Model:** `sonnet` (focused review, doesn't need opus creativity)

### Prompt Template

```
You are reviewing a pull request for "Sheeps & Kittens" — a BaghChal board game app
built with Expo SDK 54, React Native 0.83, TypeScript. The UI targets iOS, Android,
and web (react-native-web).

Read the following changed files:
[PASTE RELEVANT DIFF SECTIONS]

Check for the following:

1. BOARD RENDERING CORRECTNESS:
   - Diagonal lines drawn ONLY at (row + col) % 2 === 0.
   - CELL_SIZE = BOARD_WIDTH / (BOARD_SIZE - 1) = BOARD_WIDTH / 4. Must not change to / BOARD_SIZE.
   - Hit area: top = row * CELL_SIZE - PIECE_SIZE / 2, left = col * CELL_SIZE - PIECE_SIZE / 2.

2. ANIMATION CONSISTENCY:
   - All new Animated animations use useNativeDriver: true where possible.
   - Animated loops must be stopped and cleaned up in the useEffect return function.
   - Animated.Value refs must be created with useRef (not useState or inline).

3. PLATFORM COMPATIBILITY (iOS / Android / Web):
   - expo-haptics and expo-av must be guarded with Platform.OS checks (or lazy imports).
   - StyleSheet shadows: iOS uses shadowColor/shadowOffset/shadowOpacity/shadowRadius;
     Android uses elevation. Both should be present for shadow effects.
   - transformOrigin is web-only CSS — flag any new usage in StyleSheet objects.
   - No other web-only CSS properties (cursor, user-select, etc.) in StyleSheet.create().

4. STATE MANAGEMENT / PROP FLOW:
   - onTap / onBoardTap callback passed to Board must be memoized with useCallback.
   - isAIThinking guard in onBoardTap must remain so human taps are rejected during AI turn.
   - New props added to Board or sub-components must have explicit TypeScript types.

5. GAME STATUS TEXT:
   - Must use re-themed terminology: "Sheep's turn", "Kittens win" (not "Tigers win").
   - AI thinking status must reflect the correct side from gameState.turn.

6. WIN MODAL:
   - Modal visibility: visible={gameState.winner !== null} (not a separate boolean).
   - Both "Play Again" and "Menu" buttons must be present.
   - Win animation values must reset before animating (no stale start position).

7. ACCESSIBILITY:
   - New interactive elements should have accessibilityLabel prop.
   - New TouchableOpacity elements should have accessibilityRole="button".

Report findings as:
  [BLOCKER]    — Visual bug, broken interaction, or crash risk.
  [WARNING]    — Platform-specific issue or degraded UX on some platforms.
  [SUGGESTION] — Minor polish improvement (non-blocking).

Do NOT suggest code edits. Only read and analyze.
```

### Why this agent exists

The Board component's diagonal drawing must precisely mirror the engine's adjacency rule.
UI changes can accidentally alter the line-drawing condition while leaving the engine
untouched. React Native's Animated API also has platform-specific constraints (useNativeDriver
restrictions, memory leaks from loops, web-only CSS properties) that are easy to overlook.

---

## Agent 3: Code Quality Auditor

**When to spawn:** Every PR, regardless of which files changed.

**Agent type:** `general-purpose`
**Model:** `sonnet` (pattern matching and TypeScript analysis is a focused task)

### Prompt Template

```
You are reviewing a pull request for "Sheeps & Kittens" — a BaghChal board game app
(Expo SDK 54, React Native 0.83, TypeScript 5.9, strict mode enabled via tsconfig.json).

Read the full PR diff:
[PASTE FULL PR DIFF]

Check for the following:

1. TYPESCRIPT CORRECTNESS:
   - No implicit any types. All function parameters and return types explicit or correctly inferred.
   - Null/undefined safety: selectedPiece (Position | null), winner (Turn | null), forfeitedBy
     (Turn | null) must always be checked before use.
   - Position is [number, number] (tuple). GameMove.from is optional (from?: Position).
     Non-null assertion (move.from!) is only valid for 'move' and 'capture' branches.

2. IMMUTABILITY OF GAME STATE:
   - handleTap() and applyMove() must never mutate the input GameState.
   - Board arrays must be shallow-copied: state.board.map(r => [...r]).
   - useState setters should use functional updates (prev => ...) to avoid stale closures.

3. REACT PATTERNS:
   - useCallback dependency arrays: must include all captured state/props.
   - useEffect dependency arrays: must include all values read inside the effect.
   - New Animated.Value instances must be created inside useRef (not inline in render).
   - Animated.multiply() / Animated.add() derived nodes should be in useRef or useMemo
     to avoid creating new nodes on every render.

4. ENGINE/UI BOUNDARY:
   - Game logic (move validity, win checks, phase transitions) must stay in src/engine/.
   - Components should call engine functions and render results — not implement game rules.

5. CONSTANTS AND MAGIC NUMBERS:
   - BOARD_SIZE (5), TOTAL_SHEEP (20), SHEEP_TO_WIN (5) defined in gameEngine.ts.
     Must not be duplicated as raw literals in components.

6. ERROR-PRONE PATTERNS:
   - Array.find() results must be null-checked before property access.
   - Async functions called fire-and-forget inside setState updaters should be reviewed
     for side effects (setState updaters must be pure and side-effect-free).
   - Early return statements in useEffect callbacks may skip sibling event handlers
     that should also fire on the same state update — verify ordering logic.

7. FILE ORGANIZATION:
   - Pure helpers unrelated to game state → src/utils/
   - Functions operating on GameState → src/engine/
   - React components → src/components/

Report findings as:
  [BLOCKER]    — TypeScript error, state mutation, or logic bug.
  [WARNING]    — Missing dep array entry, potential stale closure, or dubious pattern.
  [SUGGESTION] — Code style or organization improvement (non-blocking).

Do NOT suggest code edits. Only read and analyze.
```

### Why this agent exists

Strict TypeScript mode catches type errors, but not logical patterns: wrong dep arrays,
state mutations, premature early returns that skip sibling event handlers, and derived
Animated nodes created anew on every render. This agent provides the "why" behind issues
that `tsc` cannot catch.

---

## Agent 4: AI Engine Reviewer

**When to spawn:** PR touches `src/engine/aiEngine.ts` or `src/engine/gameEngine.ts`
(since the AI imports several engine functions directly).

**Agent type:** `general-purpose`
**Model:** `opus` (minimax with alpha-beta pruning requires careful analysis of the search
tree, sign conventions, and depth/performance trade-offs)

### Prompt Template

```
You are reviewing a pull request for "Sheeps & Kittens" — a BaghChal game with an AI
opponent implemented using minimax with alpha-beta pruning.

Read the changed files:
[PASTE RELEVANT DIFF SECTIONS FOR aiEngine.ts AND/OR gameEngine.ts]

The AI maximizes from KITTY's perspective:
  positive score = good for kittens; negative score = good for sheeps.

Verify the following:

1. MINIMAX SIGN CONVENTION:
   - evaluate() returns +10000 for KITTY win, -10000 for SHEEP win.
   - Kitty-positive heuristics: kittyMobility, captureThreats, center control.
   - PLACEMENT phase penalty: score -= sheepPlaced * 2 (more sheep on board = worse for kittens).
   - Verify new heuristic terms use correct sign for the kitty-positive convention.

2. MINIMAX RECURSION:
   - Base case: depth === 0 OR state.winner !== null → return evaluate(state).
   - Maximizing node: bestVal starts at -Infinity; alpha = Math.max(alpha, val); prune when beta <= alpha.
   - Minimizing node: bestVal starts at +Infinity; beta = Math.min(beta, val); prune when beta <= alpha.
   - findBestMove() top loop: maximizing → val > bestVal updates bestMove; minimizing → val < bestVal.

3. MOVE GENERATION (getAllMoves):
   - PLACEMENT phase (SHEEP turn): one 'place' move per empty cell.
   - MOVEMENT phase: 'move' and 'capture' moves for current player.
   - Kittens during PLACEMENT: they are in movement sub-mode — getAllMoves must return
     kitty 'move' and 'capture' moves when phase === 'PLACEMENT' and turn === 'KITTY'.

4. MOVE ORDERING (orderMoves):
   - Captures before non-captures (critical for alpha-beta efficiency).
   - Among non-captures, center-closer moves first.

5. DEPTH AND DIFFICULTY:
   - Depth map must not change beyond {easy: 2, medium: 4, hard: 6} without perf justification.
   - Depth 6 at branching factor ~20 relies on pruning. Any increase risks freezing the UI thread
     (AI runs synchronously in a setTimeout — no Web Worker).

6. EVALUATION FUNCTION BALANCE:
   - Relative weight ordering must make sense:
     winning (10000) >> material (100/sheep captured) >> capture threats (30) >> mobility (10).
   - Flag any new heuristic that could produce flat evaluations (all positions scoring 0).

Report findings as:
  [BLOCKER]    — Incorrect minimax logic, wrong sign convention, or move generation bug.
  [WARNING]    — Evaluation imbalance, missing pruning opportunity, or performance risk.
  [SUGGESTION] — Heuristic improvement or clarity improvement (non-blocking).

Do NOT suggest code edits. Only read and analyze.
```

### Why this agent exists

The alpha-beta sign convention is a classic source of subtle bugs. Swapping alpha/beta
updates, or using the wrong comparator in the top-level loop, produces an AI that plays
legally but suboptimally in a way that is hard to catch through play-testing. The depth–
performance relationship is exponential: depth 7 roughly doubles search time vs depth 6
and can freeze the UI thread on real devices.

---

## Orchestration: What the Main Thread Does

### Step 1: Determine which agents to spawn (based on files changed)

| File changed | Agent 1 | Agent 2 | Agent 3 | Agent 4 |
|---|:---:|:---:|:---:|:---:|
| `src/engine/gameEngine.ts` | YES | — | YES | YES |
| `src/engine/aiEngine.ts` | — | — | YES | YES |
| `src/components/Board.tsx` | YES | YES | YES | — |
| `src/components/GameScreen.tsx` | — | YES | YES | — |
| `src/components/WelcomeScreen.tsx` | — | YES | YES | — |
| `src/components/TutorialScreen.tsx` | — | YES | YES | — |
| `src/components/Pieces.tsx` | — | YES | YES | — |
| `src/utils/haptics.ts` | — | YES | YES | — |
| `src/utils/sounds.ts` | — | YES | YES | — |
| `App.tsx` | — | — | YES | — |
| Any other file | — | — | YES | — |

Always spawn Agent 3 (Code Quality). Never spawn Agent 3 alone for docs/asset-only PRs.

### Step 2: Spawn all applicable agents in parallel

Each agent receives:
- The diff sections relevant to its specialty
- The current baseline content of files it needs for context (full file, not just diff)
- Its prompt template filled in with the actual diff

### Step 3: Collect and merge reports

```
## PR Review: [PR Title]
### Files changed: [list]
### Agents spawned: [list]

#### Game Logic (Agent 1)
[Agent 1 report, or "N/A — gameEngine.ts and Board.tsx not modified"]

#### UI/UX (Agent 2)
[Agent 2 report, or "N/A — no component or utility files modified"]

#### Code Quality (Agent 3)
[Agent 3 report — always present]

#### AI Engine (Agent 4)
[Agent 4 report, or "N/A — aiEngine.ts not modified"]

---
### Summary
BLOCKERS: [count] | WARNINGS: [count] | SUGGESTIONS: [count]
Recommendation: APPROVE / COMMENT / REQUEST_CHANGES
```

### Step 4: Set review state and post

Post consolidated report as a PR review comment:
- Any `[BLOCKER]` present → **REQUEST_CHANGES**
- Only `[WARNING]` or `[SUGGESTION]` → **COMMENT**
- All `[OK]`, no warnings → **APPROVE**

### What the orchestrator does NOT delegate

- Reading the PR diff and routing to agents
- Running `tsc --noEmit` as a build gate
- Posting the review comment (via `gh pr review`)
- Formatting-only or asset-only PRs (skip agents, approve directly after tsc check)

### Parallelization Strategy

```
TIME ──────────────────────────────────────────────────►

Orchestrator: [Read diff & route] ──────────────────────► [Merge & post review]
Agent 1:                          [=== Game Logic ======]
Agent 2:                          [=== UI / UX =========]
Agent 3:                          [=== Code Quality ====]
Agent 4:                          [=== AI Engine =======]
```

All agents run in parallel after routing. Merge only when all have returned.

---

## Quick Start

To run a PR review using this team, paste this into Claude Code:

```
Read PR #[NUMBER] for sebryu/sheeps-and-kittens. Use the PR review team described
in PR_REVIEW_TEAM.md to spawn the relevant specialist agents and post a consolidated
review comment to the PR.
```

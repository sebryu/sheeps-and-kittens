# Agent Team Blueprint - Game Development

Reusable agent team configuration for building board/strategy games with Expo/React Native.
Copy the prompts below into Claude Code or reference this file when starting a similar project.

---

## Team Overview

```
┌─────────────────────────────────────────────────┐
│                MAIN ORCHESTRATOR                │
│  (you / Claude Code main thread)                │
│  Responsibilities:                              │
│  - Task planning & tracking                     │
│  - All file creation & editing                  │
│  - Build verification (tsc, expo export)        │
│  - Wiring components together                   │
│  - Deciding when to delegate vs do directly     │
└────────┬───────────────────────┬────────────────┘
         │                       │
    ┌────▼────┐            ┌─────▼─────┐
    │ AGENT 1 │            │  AGENT 2  │
    │Research │            │  Auditor  │
    │Specialist│           │  (QA)     │
    └─────────┘            └───────────┘
```

---

## Agent 1: Research Specialist

**When to spawn:** Before writing any game logic. Spawn early, in parallel with project setup.

**Agent type:** `general-purpose`
**Model:** default (opus for thorough research)

### Prompt Template

```
Research the [GAME NAME] board game rules thoroughly. I need:
1. The exact board layout - dimensions, topology, which intersections connect
2. Starting positions of all pieces
3. How pieces enter the game (if applicable)
4. Movement rules for each piece type
5. Capture/elimination rules
6. Win/loss/draw conditions for both sides
7. The exact adjacency graph - which points connect to which, including any special connections
8. Any common variants or house rules

Cross-reference at least 2 independent sources (rule sites, open-source implementations, Wikipedia).
Return a detailed specification I can use to implement the game engine.
Include data structures suitable for implementation (coordinate system, neighbor lists, etc).
```

### Why this agent exists

- Game rules are subtle - one wrong diagonal connection or capture rule breaks everything
- Research requires many web searches and source reads that would pollute the main context
- The spec it produces becomes the "contract" for implementation
- It works independently with no back-and-forth needed

---

## Agent 2: Code Auditor

**When to spawn:** After the game engine is written, before building UI on top of it.

**Agent type:** `general-purpose`
**Model:** `sonnet` (focused review task, doesn't need opus creativity)

### Prompt Template

```
Read and verify the game engine at [FILE_PATH] for correctness.
This implements [GAME NAME] ([brief description of any re-theming]).

Check for:
1. Correct adjacency - [describe expected adjacency rules]
2. Capture logic - [describe expected capture mechanics]
3. Win conditions - [describe both sides' win conditions]
4. Phase transitions - [describe any game phases]
5. Turn alternation - [describe who goes first]
6. Any bugs or edge cases

Report any issues found. Do NOT modify the file - just read and analyze it.
```

### Why this agent exists

- Fresh eyes catch bugs that the author misses (no confirmation bias)
- Game engines have combinatorial edge cases that are easy to overlook
- Cheaper model (sonnet) is sufficient for code review
- Catches issues BEFORE the UI is built on top (cheaper to fix)

---

## Orchestration Rules

### What the main thread handles directly (do NOT delegate)

- **Project scaffolding** - `create-expo-app`, directory creation, `app.json` config
- **File writing** - All source files (engine, components, screens)
- **Build checks** - `tsc --noEmit`, `expo export`
- **Small fixes** - Unused imports, TypeScript errors
- **Integration** - Wiring App.tsx, imports, navigation

### What gets delegated to agents

- **Slow, context-heavy research** - Web searches, cross-referencing sources
- **Thorough code review** - Line-by-line logic verification
- **Exploration of unfamiliar codebases** - When working with existing projects

### Parallelization strategy

```
TIME ──────────────────────────────────────────►

Agent 1: [====== Research game rules ======]
Main:    [= Setup project =][== Wait ==][=== Implement engine ===][== Build UI ==]
Agent 2:                                 [== Verify engine ==]
Main:                                                             [== Polish ===]
```

- Spawn research agent FIRST, in parallel with project setup
- Implement engine as soon as research returns
- Spawn auditor as soon as engine is written
- Build UI while auditor reviews (UI doesn't depend on audit results)
- Fix any audit findings before final polish

---

## Task Tracking Template

Create these tasks at the start for any game project:

```
1. Initialize project (Expo/framework setup)
2. Research & design game rules and architecture
3. Implement game engine (state, moves, captures, win conditions)
4. Build game board UI
5. Build game screens and navigation
6. Polish, test, and verify
```

---

## Adapting This Team for Other Projects

### For a more complex game (Chess, Go, etc.)

Add a third agent:

```
Agent 3: AI/Algorithm Specialist
Type: general-purpose
Model: opus

Prompt: "Research and design an AI opponent for [GAME].
Recommend the best algorithm (minimax, MCTS, neural net, etc.)
given the game's branching factor and state space.
Provide pseudocode for the evaluation function.
Include difficulty level scaling strategy."
```

### For a multiplayer/networked game

Add:

```
Agent 3: Architecture Planner
Type: general-purpose

Prompt: "Design the networking architecture for a real-time
multiplayer [GAME]. Compare WebSocket vs Firebase vs Supabase
realtime. Define the message protocol, handle reconnection,
and prevent cheating. Return a technical design document."
```

### For a game with complex visuals

Add:

```
Agent 3: Graphics/Animation Researcher
Type: general-purpose

Prompt: "Research the best approach for rendering [DESCRIPTION]
in React Native / Expo. Compare react-native-svg, react-native-skia,
expo-gl, and react-native-canvas. Consider performance on low-end
devices. Recommend an approach with code examples."
```

---

## Quick Start

To recreate this team for a new game project, paste this into Claude Code:

```
Create a team of agents to build a [GAME NAME] mobile game using Expo SDK.
Here's my agent team blueprint: [paste this file or reference it]

The game should: [describe your game and any re-theming]

Don't stop until done.
```
